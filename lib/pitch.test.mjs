import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPitch } from './pitch.ts';

// What the form on imin.wtf/pro sends for a planned night.
const body = (over = {}) => ({
  type: 'planned',
  name: 'Marta K.',
  contact: 'Marta@Example.com',
  what: 'House night,\r\nsmall room',
  when: 'Sat 14.11, Metz',
  link: 'https://instagram.com/p/abc',
  consent: true,
  lang: 'fr',
  company_site: '',
  ...over,
});

test('checkPitch takes a pitch: Reply-To from an email contact, the line breaks of "what" kept', () => {
  assert.deepEqual(checkPitch(body()), {
    kind: 'ok',
    pitch: {
      label: 'Night planned',
      name: 'Marta K.',
      contact: 'Marta@Example.com',
      what: 'House night,\nsmall room',
      when: 'Sat 14.11, Metz',
      link: 'https://instagram.com/p/abc',
      linkHref: 'https://instagram.com/p/abc',
      replyTo: 'marta@example.com',
      lang: 'fr',
    },
  });
});

test('checkPitch answers a bot (the hidden field filled) as if it worked, whatever else it sent', () => {
  assert.deepEqual(checkPitch({ company_site: 'Acme' }), { kind: 'bot' });
});

for (const value of [null, [], 'a pitch', 42]) {
  test(`checkPitch refuses a body that is not an object: ${JSON.stringify(value)}`, () => {
    assert.deepEqual(checkPitch(value), { kind: 'bad', error: 'Invalid request' });
  });
}

for (const type of ['party', '', undefined, 'toString']) {
  test(`checkPitch refuses the type ${JSON.stringify(type)}`, () => {
    assert.deepEqual(checkPitch(body({ type })), { kind: 'bad', error: 'Unknown type' });
  });
}

for (const field of ['name', 'contact', 'what']) {
  test(`checkPitch refuses a pitch with a blank ${field}`, () => {
    assert.deepEqual(checkPitch(body({ [field]: ' \n ' })), { kind: 'bad', error: 'Missing required fields' });
  });
}

for (const consent of [undefined, 'true', 1, false]) {
  test(`checkPitch refuses consent ${JSON.stringify(consent)}`, () => {
    assert.deepEqual(checkPitch(body({ consent })), { kind: 'bad', error: 'Consent is required' });
  });
}

for (const [why, link] of [
  ['http', 'http://instagram.com/p/abc'],
  ['a script', 'javascript:alert(1)'],
  ['not a URL', 'my insta'],
  ['over 500 characters', 'https://example.com/' + 'a'.repeat(481)],
]) {
  test(`checkPitch refuses a link that is ${why}`, () => {
    assert.equal(checkPitch(body({ link })).kind, 'bad');
  });
}

test('checkPitch takes a pitch without a link', () => {
  const check = checkPitch(body({ link: '  ' }));
  assert.equal(check.kind, 'ok');
  assert.equal(check.pitch.link, '');
  assert.equal(check.pitch.linkHref, undefined);
});

test('checkPitch cuts over-long text to its cap and puts single-line fields on one line', () => {
  const { pitch } = checkPitch(body({ name: 'n'.repeat(150), contact: '@'.padEnd(250, 'c'), what: 'w'.repeat(2500), when: 'Sat\n14.11 ' + 'x'.repeat(300) }));
  assert.equal(pitch.name, 'n'.repeat(100));
  assert.equal(pitch.contact.length, 200);
  assert.equal(pitch.what.length, 2000);
  assert.equal(pitch.when, ('Sat 14.11 ' + 'x'.repeat(300)).slice(0, 200));
});

test('checkPitch never cuts an emoji in half', () => {
  // 99 letters then an emoji (two UTF-16 units): the cap at 100 would split it.
  assert.equal(checkPitch(body({ name: 'a'.repeat(99) + '😀' })).pitch.name, 'a'.repeat(99));
});

for (const contact of ['@marta.k', 'marta@localhost', 'Marta <marta@example.com>', 'a@b.c, d@e.f']) {
  test(`checkPitch sets no Reply-To for the contact "${contact}"`, () => {
    assert.equal(checkPitch(body({ contact })).pitch.replyTo, undefined);
  });
}

for (const lang of ['<b>en</b>', 'english', 42]) {
  test(`checkPitch keeps no language for ${JSON.stringify(lang)}`, () => {
    assert.equal(checkPitch(body({ lang })).pitch.lang, '');
  });
}
