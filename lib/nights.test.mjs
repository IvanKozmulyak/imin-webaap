import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatWhen, nightPrice, pickNights, toNight } from './nights.ts';

const NOW = new Date('2026-10-16T12:00:00Z');

const event = (id, over = {}) => ({
  id,
  name: id,
  status: 'live',
  startsAt: '2026-10-31T14:00:00Z',
  endsAt: '2026-10-31T18:00:00Z',
  timezone: 'Europe/Paris',
  genre: null,
  type: null,
  venue: { name: '', city: 'Metz' },
  ...over,
});

test('pickNights keeps live nights that have not ended, soonest first', () => {
  // Every dropped row starts first, so a missing filter would surface it at the top.
  const events = [
    event('cancelled', { status: 'cancelled', startsAt: '2026-10-20T19:00:00Z', endsAt: '2026-10-20T23:00:00Z' }),
    event('past', { status: 'past', startsAt: '2026-10-21T19:00:00Z', endsAt: '2026-10-21T23:00:00Z' }),
    event('ended', { startsAt: '2026-10-15T20:00:00Z', endsAt: '2026-10-16T02:00:00Z' }),
    event('ends-now', { startsAt: '2026-10-16T08:00:00Z', endsAt: '2026-10-16T12:00:00Z' }),
    event('started-no-end', { startsAt: '2026-10-16T09:00:00Z', endsAt: null }),
    event('later', { startsAt: '2026-11-07T20:00:00Z', endsAt: '2026-11-08T03:00:00Z' }),
    event('soon', { startsAt: '2026-10-31T14:00:00Z', endsAt: '2026-10-31T18:00:00Z' }),
    event('no-end', { startsAt: '2026-11-01T18:00:00Z', endsAt: null }),
    event('on-now', { startsAt: '2026-10-16T10:00:00Z', endsAt: '2026-10-16T14:00:00Z' }),
  ];

  assert.deepEqual(
    pickNights(events, NOW).map((e) => e.id),
    ['on-now', 'soon', 'no-end', 'later'],
  );
});

test('formatWhen reads the real night in its own time zone', () => {
  assert.deepEqual(formatWhen(event('midnight-bean'), 'en'), {
    day: 'Sat 31.10',
    time: '15:00 – 19:00',
    dock: 'Sat 31.10 · 15:00',
  });
});

// UTC is still on Saturday at these instants; the event's zone is already on Sunday.
for (const [timezone, startsAt, endsAt, expected] of [
  ['Europe/Paris', '2026-10-31T23:30:00Z', '2026-11-01T04:00:00Z', { day: 'Sun 01.11', time: '00:30 – 05:00', dock: 'Sun 01.11 · 00:30' }],
  ['Europe/Kyiv', '2026-10-31T22:30:00Z', '2026-11-01T03:00:00Z', { day: 'Sun 01.11', time: '00:30 – 05:00', dock: 'Sun 01.11 · 00:30' }],
]) {
  test(`formatWhen dates a night by ${timezone}, not UTC`, () => {
    assert.deepEqual(formatWhen(event('late', { timezone, startsAt, endsAt }), 'en'), expected);
  });
}

test('formatWhen shows only the start when the night has no end', () => {
  assert.deepEqual(
    formatWhen(event('open-end', { startsAt: '2026-11-06T19:00:00Z', endsAt: null }), 'en'),
    { day: 'Fri 06.11', time: '20:00', dock: 'Fri 06.11 · 20:00' },
  );
});

// A tier as imin-api lists it with includeUnavailable=true; the defaults are the real night's Early Bird.
const tier = (over = {}) => ({
  priceMinor: 1500,
  priceAllInMinor: 1674,
  currency: 'EUR',
  onSale: true,
  soldOut: false,
  closed: false,
  ...over,
});

test('toNight links the night page and builds its line and price from real fields only', () => {
  const night = toNight(
    event('ef3b1f87-2cc6-4697-94e6-1cd37881905d', {
      name: 'The Midnight Bean Society',
      genre: 'Pop',
      type: 'Rave',
      tiers: [tier(), tier({ priceMinor: 2250, priceAllInMinor: 2462 }), tier({ priceMinor: 3000, priceAllInMinor: 3249 })],
    }),
    'en',
  );
  assert.deepEqual(night, {
    id: 'ef3b1f87-2cc6-4697-94e6-1cd37881905d',
    name: 'The Midnight Bean Society',
    url: 'https://app.imin.wtf/e/ef3b1f87-2cc6-4697-94e6-1cd37881905d',
    day: 'Sat 31.10',
    time: '15:00 – 19:00',
    dock: 'Sat 31.10 · 15:00',
    city: 'Metz',
    meta: 'Rave · Pop · Metz',
    price: { kind: 'from', minor: 1674, currency: 'EUR' },
  });
});

// Sales paused by imin staff list no tiers at all; an older answer may carry none.
for (const [why, tiers] of [['an empty list', []], ['null', null], ['no field', undefined]]) {
  test(`nightPrice makes no claim without tiers: ${why}`, () => {
    assert.equal(nightPrice(tiers), undefined);
  });
}

test('nightPrice says sold out when every tier is', () => {
  const gone = { onSale: false, soldOut: true };
  assert.deepEqual(nightPrice([tier(gone), tier({ ...gone, priceAllInMinor: 2462 })]), { kind: 'soldout' });
});

test('nightPrice makes no claim while nothing is on sale and something is left', () => {
  assert.equal(
    nightPrice([
      tier({ onSale: false, soldOut: true }),
      tier({ onSale: false, closed: true, priceAllInMinor: 2462 }),
      tier({ onSale: false, priceAllInMinor: 3249 }),
    ]),
    undefined,
  );
});

// A tier on sale that can't be priced would make "From" a guess, so the line says nothing.
for (const [why, over] of [['no all-in amount', { priceAllInMinor: null }], ['no currency', { priceAllInMinor: 1000, currency: null }]]) {
  test(`nightPrice makes no claim when a tier on sale has ${why}`, () => {
    assert.equal(nightPrice([tier(over), tier({ priceAllInMinor: 2462 })]), undefined);
  });
}

test('nightPrice says free when the cheapest tier on sale costs nothing', () => {
  assert.deepEqual(
    nightPrice([tier({ priceMinor: 2250, priceAllInMinor: 2462 }), tier({ priceMinor: 0, priceAllInMinor: 0 })]),
    { kind: 'free' },
  );
});

test('nightPrice starts from the cheapest tier on sale, booking fee included', () => {
  // The cheaper tiers that can't be bought come first, so a missing filter would surface them.
  assert.deepEqual(
    nightPrice([
      tier({ priceMinor: 900, priceAllInMinor: 1044, onSale: false, soldOut: true }),
      tier({ priceMinor: 1000, priceAllInMinor: 1149, onSale: false }),
      tier({ priceMinor: 2250, priceAllInMinor: 2462 }),
      tier(),
      tier({ priceMinor: 3000, priceAllInMinor: 3249 }),
    ]),
    { kind: 'from', minor: 1674, currency: 'EUR' },
  );
});

for (const [why, over, meta] of [
  ['a named venue joins the line', { type: 'Rave', genre: 'Techno', venue: { name: 'Fox', city: 'Metz' } }, 'Rave · Techno · Fox · Metz'],
  ['missing fields are left out', { type: null, genre: '  ', venue: { name: null, city: 'Metz' } }, 'Metz'],
  ['a repeated word shows once', { type: 'Techno', genre: 'techno', venue: { name: 'Metz', city: 'Metz' } }, 'Techno · Metz'],
  ['no venue at all leaves an empty line', { type: null, genre: null, venue: null }, ''],
]) {
  test(`toNight meta: ${why}`, () => {
    assert.equal(toNight(event('x', over), 'en').meta, meta);
  });
}
