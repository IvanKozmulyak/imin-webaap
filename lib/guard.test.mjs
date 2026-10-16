import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guardPost, windowLimiter } from './guard.ts';

// What Chrome sends with the page's own fetch to imin.wtf; null drops a header.
const req = (over = {}) => {
  const all = {
    host: 'imin.wtf',
    origin: 'https://imin.wtf',
    'sec-fetch-site': 'same-origin',
    'content-type': 'application/json',
    'x-forwarded-for': '203.0.113.7',
    ...over,
  };
  return { headers: new Headers(Object.entries(all).filter(([, v]) => v !== null)) };
};
const roomy = () => windowLimiter(100, 60_000);

for (const [why, over] of [
  ['the page on imin.wtf', {}],
  ['JSON with a charset', { 'content-type': 'application/json; charset=utf-8' }],
  ['next dev or next start on localhost', { host: 'localhost:3601', origin: 'http://localhost:3601' }],
  ['a preview deployment', { host: 'imin-git-x.vercel.app', origin: 'https://imin-git-x.vercel.app' }],
  ['a client that sends neither Origin nor Sec-Fetch-Site', { origin: null, 'sec-fetch-site': null }],
]) {
  test(`guardPost lets through ${why}`, () => {
    assert.equal(guardPost(req(over), roomy()), null);
  });
}

for (const site of ['cross-site', 'same-site', 'none']) {
  test(`guardPost answers 403 to Sec-Fetch-Site: ${site}`, () => {
    assert.equal(guardPost(req({ 'sec-fetch-site': site }), roomy())?.status, 403);
  });
}

for (const [why, over] of [
  ['another site', { origin: 'https://evil.example' }],
  ['a look-alike host', { origin: 'https://imin.wtf.evil.example' }],
  ['the ticket app, same site but not same origin', { origin: 'https://app.imin.wtf' }],
  ['localhost while the request went to imin.wtf', { origin: 'http://localhost:3601' }],
  ['an opaque origin', { origin: 'null' }],
]) {
  test(`guardPost answers 403 to an Origin from ${why}`, () => {
    // Sec-Fetch-Site is dropped so only the Origin check can refuse it.
    assert.equal(guardPost(req({ ...over, 'sec-fetch-site': null }), roomy())?.status, 403);
  });
}

for (const type of [null, 'text/plain;charset=UTF-8', 'application/x-www-form-urlencoded', 'multipart/form-data; boundary=x', 'application/jsonp']) {
  test(`guardPost answers 415 to Content-Type ${type}`, () => {
    assert.equal(guardPost(req({ 'content-type': type }), roomy())?.status, 415);
  });
}

test('guardPost answers 429 with Retry-After once one address passes the limit', () => {
  const limit = windowLimiter(2, 60_000);
  assert.equal(guardPost(req(), limit, 1_000), null);
  assert.equal(guardPost(req(), limit, 2_000), null);
  const res = guardPost(req(), limit, 21_500);
  assert.equal(res?.status, 429);
  assert.equal(res?.headers.get('retry-after'), '40'); // the window opened at 1 s and runs 60 s
});

test('guardPost counts by the first x-forwarded-for address, else x-real-ip', () => {
  const limit = windowLimiter(1, 60_000);
  assert.equal(guardPost(req({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }), limit, 0), null);
  // the same visitor through another proxy hop
  assert.equal(guardPost(req({ 'x-forwarded-for': '203.0.113.7, 10.0.0.2' }), limit, 1)?.status, 429);
  assert.equal(guardPost(req({ 'x-forwarded-for': '198.51.100.4, 10.0.0.1' }), limit, 2), null);
  assert.equal(guardPost(req({ 'x-forwarded-for': null, 'x-real-ip': '192.0.2.9' }), limit, 3), null);
  assert.equal(guardPost(req({ 'x-forwarded-for': null, 'x-real-ip': '192.0.2.9' }), limit, 4)?.status, 429);
  assert.equal(guardPost(req({ 'x-forwarded-for': null, 'x-real-ip': '192.0.2.10' }), limit, 5), null);
});

test('windowLimiter starts a new window once the last has passed: in again, then counted again', () => {
  const limit = windowLimiter(1, 60_000);
  assert.equal(limit('203.0.113.7', 0), 0);
  assert.equal(limit('203.0.113.7', 59_999), 1);
  assert.equal(limit('203.0.113.7', 60_000), 0);
  assert.equal(limit('203.0.113.7', 60_001), 59_999);
});

test('windowLimiter keeps at most maxKeys addresses: the oldest window makes room, expired or not', () => {
  const limit = windowLimiter(1, 1_000, 2);
  limit('a', 0);
  limit('b', 500);
  limit('c', 1_200); // full: a has expired and goes, b stays
  assert.ok(limit('b', 1_300) > 0, 'b is still counted');
  limit('d', 1_400); // full, nothing expired: the oldest (b) goes
  assert.equal(limit('b', 1_450), 0, 'b starts over');
  assert.ok(limit('d', 1_460) > 0, 'd is still counted');
});

test('windowLimiter counts a renewed window as the newest when making room', () => {
  const limit = windowLimiter(1, 1_000, 3);
  limit('a', 0);
  limit('b', 100);
  limit('a', 1_050); // a's first window has passed: its new one is the newest
  limit('c', 1_100);
  limit('d', 1_150); // full: the oldest window is b's, so b goes and a stays counted
  assert.ok(limit('a', 1_200) > 0, 'a is still counted');
});
