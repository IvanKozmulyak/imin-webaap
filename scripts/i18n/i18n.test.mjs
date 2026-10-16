import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildPage, PAGES } from './engine.mjs';
import { buildAll, drift, report, languages } from './build.mjs';

const guest = PAGES[0];
// An English page with everything the build rewrites (lang, canonical, locales, menu, link, strings file), a FAQ in JSON-LD and `body`.
const english = (body = '', path = '/') => `<!doctype html>
<html lang="en" class="no-js">
<head>
<title>Hello</title>
<link rel="canonical" href="https://imin.wtf${path}">
<meta property="og:url" content="https://imin.wtf${path}">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="fr_FR">
<meta property="og:locale:alternate" content="es_ES">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"Can I come alone?","acceptedAnswer":{"@type":"Answer","text":"Yes. That's the point."}}
]}
</script>
</head>
<body>
<details class="lang"><summary>EN<span class="vh">, language: English</span></summary>
<div class="lang-menu"><a href="/" aria-current="true" lang="en" hreflang="en">English <span>EN</span></a><a href="/fr" lang="fr" hreflang="fr">Français <span>FR</span></a><a href="/es" lang="es" hreflang="es">Español <span>ES</span></a></div></details>
<a href="/pro">For organizers</a>
${body}
<script src="/assets/js/i18n/en.js" defer></script>
<script src="/assets/js/client.js" defer></script>
</body>
</html>
`;
// The rows the page above needs besides its body: its own words, and the FAQ that is in the JSON-LD only.
const BASE = [['Hello', 'Salut'], ['For organizers', 'Orgas'], [', language: English', ', langue']];
const FAQ = [['Can I come alone?', 'Je peux venir seul⍽?'], ["Yes. That's the point.", 'Oui. C’est le but.']];
const build = (body, rows = [], more = {}, path = '/') =>
  buildPage({ src: english(body, path), page: PAGES.find(p => p.path === path), lang: 'fr', table: { rows: [...BASE, ...(more.faq === false ? [] : FAQ), ...rows], ...more } });
const problems = r => r.problems.map(p => [p.type, p.unit?.raw ?? p.row?.en ?? p.why]);

test('the build rewrites lang, canonical, locales, menu, links and the strings file for the language', () => {
  const { html, problems: found } = build('<p>Welcome</p>', [['Welcome', 'Bienvenue']]);
  assert.deepEqual(found, []);
  assert.match(html, /<html lang="fr" class="no-js">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/imin.wtf\/fr">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/imin.wtf\/fr">/);
  // own locale first, then en_US, then the others
  assert.match(html, /og:locale" content="fr_FR">\n<meta property="og:locale:alternate" content="en_US">\n<meta property="og:locale:alternate" content="es_ES">/);
  assert.match(html, /<summary>FR<span class="vh">, langue<\/span>/);
  assert.match(html, /<a href="\/" lang="en" hreflang="en">English <span>EN<\/span><\/a><a href="\/fr" aria-current="true" lang="fr" hreflang="fr">/);
  assert.match(html, /<a href="\/fr\/pro">Orgas<\/a>/);
  assert.match(html, /en\.js" defer><\/script>\n<script src="\/assets\/js\/i18n\/fr\.js" defer><\/script>\n<script src="\/assets\/js\/client\.js"/);
});

test('one plain row translates a text, an attribute and the same words in the JSON-LD', () => {
  const r = build('<p>Can I come alone?</p><img alt="Can I come alone?">', [['Can I come alone?', 'Je peux venir seul⍽?', 3], ["Yes. That's the point.", 'Oui. C’est le but.']], { faq: false });
  assert.deepEqual(r.problems, []);
  assert.equal(r.html.match(/Je peux venir seul\u00a0\?/g).length, 3);
  assert.match(r.html, /"name":"Je peux venir seul\u00a0\?"/);
  assert.match(r.html, /"text":"Oui\. C’est le but\."/);
});

test('a plain row is the whole text of an element: it never changes part of a longer text', () => {
  const r = build('<p>Join</p><p>Join the night</p>', [['Join', 'Rejoindre']]);
  assert.match(r.html, /<p>Rejoindre<\/p><p>Join the night<\/p>/);
  assert.deepEqual(problems(r), [['untranslated', 'Join the night']]);
});

test('a row with markup is replaced as written, wins over plain rows, and what it translated is gone for the rest', () => {
  const r = build('<span class="a">Create</span><p>Create</p>', [['<span class="a">Create</span>', '<span class="a">Crea</span>'], ['Create', 'Créer']]);
  assert.deepEqual(r.problems, []);
  assert.match(r.html, /<span class="a">Crea<\/span><p>Créer<\/p>/);
});

test('markup rows take their pieces in the order listed: what an earlier row translated is gone for the next', () => {
  const r = build('<i><span>X</span></i><u><span>X</span></u>', [['<i><span>X</span></i>', '<i><span>A</span></i>'], ['<span>X</span>', '<span>B</span>']]);
  assert.deepEqual(r.problems, []);
  assert.match(r.html, /<i><span>A<\/span><\/i><u><span>B<\/span><\/u>/);
});

test('English with no row is listed with where it sits; keep silences it; prices and percentages need a look, plain numbers do not', () => {
  const body = '<p class="label">Brand new</p><b>84</b><b>€15</b><b>70%</b><i>Kept</i>';
  const r = build(body, [], { keep: ['Kept'] });
  assert.deepEqual(r.problems.map(p => [p.type, p.unit.raw, p.unit.where]), [
    ['untranslated', 'Brand new', 'p.label'], ['untranslated', '€15', 'b'], ['untranslated', '70%', 'b'],
  ]);
  assert.deepEqual(build(body, [['Brand new', 'Tout neuf'], ['€15', '15⍽€'], ['70%', '70⍽%']], { keep: ['Kept'] }).problems, []);
});

test('a row that is not in the English any more, or occurs more often than its count, is reported', () => {
  assert.deepEqual(build('<p>Hi</p><p>Hi</p>', [['Hi', 'Salut']]).problems.map(p => [p.type, p.row.en, p.row.found, p.row.count]), [['count', 'Hi', 2, 1]]);
  assert.deepEqual(build('<p>Hi</p><p>Hi</p>', [['Hi', 'Salut', 2]]).problems, []);
  assert.deepEqual(build('', [['Gone', 'Parti']]).problems.map(p => [p.type, p.row.en, p.row.found]), [['count', 'Gone', 0]]);
});

test('⍽ and ⎵ in a translation are a no-break space and a narrow no-break space', () => {
  const r = build('<p>Price</p>', [['Price', '1⎵196,16⍽€']]);
  assert.match(r.html, /<p>1\u202f196,16\u00a0€<\/p>/);
});

test('an ld row is written as given and wins for the JSON-LD only; the visible text keeps the plain row', () => {
  const body = '<p>Yes. That’s the point.</p>';
  const ask = ['Can I come alone?', 'Je peux venir seul⍽?'];
  const plain = build(body, [ask, ["Yes. That's the point.", 'Oui. C’est le but.', 2]], { faq: false });
  assert.deepEqual(plain.problems, []);
  assert.match(plain.html, /"text":"Oui\. C’est le but\."/);
  const own = build(body, [ask, ["Yes. That's the point.", 'Oui. C’est le but.']], { faq: false, ld: [["Yes. That's the point.", 'Oui\\u00a0: c’est le but.']] });
  assert.deepEqual(own.problems, []);
  assert.match(own.html, /"text":"Oui\\u00a0: c’est le but\."/);
  assert.match(own.html, /<p>Oui\. C’est le but\.<\/p>/);
});

test('two rules that change the same text are reported instead of garbling the page', () => {
  const r = build('', [['<a href="/pro">For organizers</a>', '<a href="/pro">Orgas</a>']]);
  assert.equal(r.html, null);
  assert.ok(r.problems.some(p => p.type === 'overlap' && /link to the other page/.test(p.a.why + p.b.why)));
});

test('the report lists English that is missing several times once, with the count the row needs', () => {
  const r = build('<p class="label">Brand new</p><p class="label">Brand new</p>');
  const text = report([{ lang: 'fr', table: 'scripts/i18n/fr/guest.mjs', file: 'public/fr/index.html', problems: r.problems }]);
  assert.equal(text.match(/\['Brand new', '', 2\],  \/\/ p\.label/g).length, 1);
});

// ---- the files: a language's tables, the pages written from them, and what the editor is told

function project(tables) {
  const root = pathToFileURL(mkdtempSync(join(tmpdir(), 'i18n-')) + '/');
  const put = (file, text) => { mkdirSync(new URL('.', new URL(file, root)), { recursive: true }); writeFileSync(new URL(file, root), text); };
  put('public/index.html', english('<p>Welcome</p>'));
  put('public/pro/index.html', english('<p>Welcome</p>', '/pro'));
  for (const [file, rows] of Object.entries(tables)) put(`scripts/i18n/${file}.mjs`, `export default ${JSON.stringify({ rows: [...BASE, ...FAQ, ['Welcome', 'Bienvenue'], ...rows] })};`);
  return { root, put };
}

test('drift tells a missing page from a stale one and says nothing about a page that is current', async () => {
  const { root, put } = project({ 'fr/guest': [], 'fr/pro': [] });
  try {
    const written = await buildAll({ root });
    assert.deepEqual(drift(written, root).map(r => [r.file, r.state]), [['public/fr/index.html', 'missing'], ['public/fr/pro/index.html', 'missing']]);
    for (const r of written) put(r.file, r.html);
    assert.deepEqual(drift(written, root), []);
    put('public/fr/index.html', written[0].html.replace('Bienvenue', 'Welcome'));
    assert.deepEqual(drift(written, root).map(r => [r.file, r.state]), [['public/fr/index.html', 'stale']]);
  } finally { rmSync(root, { recursive: true }); }
});

test('a table that does not load is reported with its file, and the other tables still build', async () => {
  const { root, put } = project({ 'fr/guest': [], 'fr/pro': [], 'es/guest': [], 'es/pro': [] });
  try {
    put('scripts/i18n/fr/guest.mjs', "export default { rows: [['a', 'b'], ['c' 'd']] };");
    const results = await buildAll({ root });
    assert.deepEqual(results.filter(r => r.problems.length).map(r => [r.table, r.problems[0].type]), [['scripts/i18n/fr/guest.mjs', 'load']]);
    assert.match(report(results), /fr {2}scripts\/i18n\/fr\/guest\.mjs[^]*does not load/);
    assert.ok(results.find(r => r.table === 'scripts/i18n/es/guest.mjs').html);
  } finally { rmSync(root, { recursive: true }); }
});

test('after the English changes, the report names each language and the English to translate; its pages are not compared', async () => {
  const { root, put } = project({ 'fr/guest': [], 'fr/pro': [], 'es/guest': [], 'es/pro': [] });
  try {
    assert.deepEqual(languages(root), ['es', 'fr']);
    put('public/index.html', english('<p>Welcome</p><p class="label">Brand new</p>'));
    const results = await buildAll({ root });
    const text = report(results);
    for (const lang of ['fr', 'es']) assert.match(text, new RegExp(`${lang} {2}scripts/i18n/${lang}/guest\\.mjs`));
    assert.equal(text.match(/\['Brand new', ''\],  \/\/ p\.label/g).length, 2);
    assert.doesNotMatch(text, /pro\.mjs/);
    assert.deepEqual(drift(results, root).map(r => r.file).sort(), ['public/es/pro/index.html', 'public/fr/pro/index.html']);
  } finally { rmSync(root, { recursive: true }); }
});
