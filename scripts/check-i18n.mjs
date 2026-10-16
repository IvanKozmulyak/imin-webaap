// Keeps the translated pages in step with English: same structure, same script-string keys, and
// each language's typography. Languages = the files in public/assets/js/i18n/ other than en.js.
// Every page's hreflang links must reach a page that exists. Run by `npm test` and `npm run check:i18n`. Node stdlib only.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const PUB = new URL('../public/', import.meta.url);
const SITE = 'https://imin.wtf';
const read = p => readFileSync(new URL(p, PUB), 'utf8');
const LANGS = readdirSync(new URL('assets/js/i18n/', PUB)).filter(f => f.endsWith('.js') && f !== 'en.js').map(f => f.slice(0, -3)).sort();
const PAGES = [['index.html', ''], ['pro/index.html', '/pro']];
const problems = [];
const fail = msg => { if (!problems.includes(msg)) problems.push(msg); };
const missing = new Set();

// French: a no-break space (not a plain one, not none) before : ; ! ? » and after « (same rules as imin-webapp).
const FR_PLAIN_SPACE = /(?: [:;!?»]|« )/;
const FR_NO_SPACE = /[\p{L})’»][:;!?]+(?=$|[\s)’"»,.…—–])/u;
// Ukrainian: ʼ (U+02BC) between Cyrillic letters.
const UK_WRONG_APOSTROPHE = /\p{Script=Cyrillic}['’]\p{Script=Cyrillic}/u;
const typo = (lang, text, where) => {
  if (lang === 'fr' && (FR_PLAIN_SPACE.test(text) || FR_NO_SPACE.test(text))) fail(`${where}: French spacing around : ; ! ? « » in "${text.slice(0, 80)}"`);
  if (lang === 'uk' && UK_WRONG_APOSTROPHE.test(text)) fail(`${where}: use ʼ (U+02BC) between Cyrillic letters in "${text.slice(0, 80)}"`);
};

// The page as a list of tags (name, class, id, attribute names, and the values scripts and forms rely on), plus its copy.
const COPY_ATTRS = new Set(['alt', 'aria-label', 'placeholder', 'title', 'content']);
const IGNORED_ATTRS = new Set(['aria-current']);
const SAME_VALUE_ATTRS = ['src', 'name', 'type', 'for'];
function parse(html) {
  const tags = [], copy = [];
  const src = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<!doctype[^>]*>/i, '');
  const re = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>|([^<]+)/g;
  let m, raw = null, skipClose = false;
  while ((m = re.exec(src))) {
    if (m[4] !== undefined) {
      const text = m[4].trim();
      if (!text) continue;
      if (raw === 'script' || raw === 'style') { if (raw === 'script' && tags.at(-1)?.ld) copy.push(text); continue; }
      copy.push(text);
      continue;
    }
    const [, close, nameRaw, attrStr] = m;
    const name = nameRaw.toLowerCase();
    if (name === 'br' || name === 'wbr') continue;
    if (close) { if (name === raw) raw = null; if (skipClose && name === 'script') { skipClose = false; continue; } tags.push({ sig: '/' + name }); continue; }
    const attrs = {};
    for (const a of attrStr.matchAll(/([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4] ?? '';
    for (const [k, v] of Object.entries(attrs)) if (COPY_ATTRS.has(k) && v.trim() && !(k === 'content' && /^(https?:|#|\d|en_|fr_|es_|uk_|width=|website|summary)/.test(v))) copy.push(v);
    // a translated page's own strings file is the one tag English does not have
    if (name === 'script' && /^\/assets\/js\/i18n\/(?!en\.js$)[a-z]{2}\.js$/.test(attrs.src || '')) { skipClose = true; raw = 'script'; tags.push({ sig: null, attrs }); continue; }
    const names = Object.keys(attrs).filter(k => !IGNORED_ATTRS.has(k)).sort().join(',');
    const values = SAME_VALUE_ATTRS.filter(k => k in attrs).map(k => `${k}=${attrs[k]}`).join(' ');
    tags.push({ sig: `${name}.${attrs.class || ''}#${attrs.id || ''}[${names}]{${values}}`, ld: name === 'script' && attrs.type === 'application/ld+json', attrs });
    if (name === 'script' || name === 'style') raw = name;
  }
  return { tags, copy };
}

// Each hreflang link reaches a page that exists, in the language it names (x-default: English).
function checkAlternates(file, page) {
  for (const t of page.tags) {
    const lang = t.attrs?.hreflang;
    if (lang === undefined) continue;
    let url = null;
    try { url = new URL(t.attrs.href ?? '', SITE + '/'); } catch {}
    if (!url || url.origin !== SITE) { fail(`public/${file}: hreflang="${lang}" points off the site: ${t.attrs.href}`); continue; }
    const path = url.pathname.replace(/\/+$/, '');
    const first = path.split('/')[1] ?? '';
    const pathLang = /^[a-z]{2}$/.test(first) ? first : 'en';
    if (pathLang !== (lang === 'x-default' ? 'en' : lang)) fail(`public/${file}: hreflang="${lang}" points to ${url.href}, a ${pathLang} page`);
    const target = (path ? path.slice(1) + '/' : '') + 'index.html';
    if (!existsSync(new URL(target, PUB))) {
      missing.add(lang);
      fail(`public/${file}: hreflang="${lang}" points to ${url.href}, but public/${target} does not exist`);
    }
  }
}

// Search engines read the JSON-LD blocks as JSON: one stray quote and the page loses its FAQ.
function checkLd(file, html) {
  for (const m of html.matchAll(/<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(m[1]); } catch (e) { fail(`public/${file}: a ld+json block is not valid JSON (${e.message})`); }
  }
}

// Names stay as they are in every language (brands, people, the example night, its tiers and genres), so they never count as untranslated.
const NAMES = new Set(['IMIN', 'Instagram', 'Threads', 'Spotify', 'Stripe', 'stripe', 'Sacem', 'Google', 'Telegram', 'telegram', 'instagram',
  'Canva', 'Eventbrite', 'eventbrite', 'Linktree', 'Sheets', 'Bohdan', 'Ivan', 'Violeta', 'Viktor', 'Bohdan, IMIN', 'Metz', 'Saturday Night',
  'Lights Down', 'Early Bird', 'Marta K.', 'Andrii', 'Sofiia', 'Max', 'Léa', 'sofiia_dnb', 'Olena (DJ)', 'Max + friend', 'House &amp; Techno',
  'Brutalist Techno', 'Berlin Minimal', 'Acid Rave / Y2K', 'Psytrance / Goa', 'PNG', 'AI Studio', 'Cal.com']);
const isName = t => NAMES.has(t) || /^@?[\w.+-]+@?[\w-]*(\.[\w-]+)+(\/\S*)?$/.test(t) || /^[a-z &;·/-]+$/.test(t) && /techno|house|rave|trance|goa|forest|warehouse|minimal|dub/.test(t);
const keyTree = (obj, path = '', out = new Map()) => {
  for (const [k, v] of Object.entries(obj || {})) {
    const p = path ? `${path}.${k}` : k;
    const type = Array.isArray(v) ? `array(${v.length})` : typeof v;
    out.set(p, type);
    if (type === 'object') keyTree(v, p, out);
  }
  return out;
};
function strings(obj, out = []) {
  for (const v of Object.values(obj || {})) {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(x => (typeof x === 'string' ? out.push(x) : strings(x, out)));
    else if (v && typeof v === 'object') strings(v, out);
  }
  return out;
}
const snapshot = o => JSON.stringify(o, (k, v) => (typeof v === 'function' ? String(v) : v));

// English, in a context of its own per language, so one broken file cannot hide another.
const loadEn = lang => {
  const ctx = vm.createContext({ window: {}, document: { documentElement: { lang } } });
  vm.runInContext(read('assets/js/i18n/en.js'), ctx, { filename: 'en.js' });
  return ctx;
};
const EN = loadEn('en').window.IMIN_I18N.en;
const enTree = keyTree(EN);
const enPages = Object.fromEntries(PAGES.map(([page]) => [page, parse(read(page))]));
for (const [page] of PAGES) { checkAlternates(page, enPages[page]); checkLd(page, read(page)); }

for (const lang of LANGS) {
  // script strings: same keys and kinds as English, added next to English (pick and en survive), typography of the language
  const ctx = loadEn(lang);
  const I18N = ctx.window.IMIN_I18N, en = I18N.en, before = snapshot(en);
  try { vm.runInContext(read(`assets/js/i18n/${lang}.js`), ctx, { filename: `${lang}.js` }); }
  catch (e) { fail(`i18n/${lang}.js does not run: ${e.message}`); continue; }
  const after = ctx.window.IMIN_I18N;
  if (after !== I18N || typeof after.pick !== 'function' || after.en !== en) { fail(`i18n/${lang}.js must add IMIN_I18N.${lang} to the object en.js made, not replace it: pick and en must survive`); continue; }
  if (snapshot(en) !== before) fail(`i18n/${lang}.js changes the English strings`);
  const dict = after[lang];
  if (!dict) { fail(`i18n/${lang}.js must set window.IMIN_I18N.${lang}`); continue; }
  const tree = keyTree(dict);
  for (const [k, t] of enTree) if (tree.get(k) !== t) fail(`i18n/${lang}.js: ${k} is ${tree.get(k) ?? 'missing'}, English has ${t}`);
  for (const k of tree.keys()) if (!enTree.has(k)) fail(`i18n/${lang}.js: ${k} is not in English`);
  for (const part of ['guest', 'pro']) {
    const picked = keyTree(after.pick(part)), want = keyTree(EN[part]);
    if (picked.size !== want.size || [...want].some(([k, t]) => picked.get(k) !== t)) fail(`i18n/${lang}.js: IMIN_I18N.pick('${part}') on a ${lang} page does not give English's keys`);
  }
  for (const s of strings(dict)) typo(lang, s, `i18n/${lang}.js`);

  // pages: same tags in the same order as English, the language's own head and scripts
  for (const [page, path] of PAGES) {
    const file = `${lang}/${page}`;
    if (!existsSync(new URL(file, PUB))) { fail(`public/${file} is missing`); continue; }
    const en = enPages[page], tr = parse(read(file));
    checkAlternates(file, tr);
    checkLd(file, read(file));
    const sigs = p => p.tags.filter(t => t.sig !== null);
    const a = sigs(en), b = sigs(tr), n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) {
      if (a[i]?.sig === b[i]?.sig) continue;
      fail(`public/${file}: structure differs from public/${page} at tag ${i}: English <${a[i]?.sig ?? 'end'}>, ${lang} <${b[i]?.sig ?? 'end'}>`);
      break;
    }
    const html = tr.tags.find(t => t.sig?.startsWith('html.'));
    if (html?.attrs.lang !== lang) fail(`public/${file}: <html lang> must be "${lang}"`);
    const canon = tr.tags.find(t => t.attrs?.rel === 'canonical')?.attrs.href;
    if (canon !== `${SITE}/${lang}${path}`) fail(`public/${file}: canonical must be ${SITE}/${lang}${path}, is ${canon}`);
    const scripts = tr.tags.filter(t => t.attrs?.src).map(t => t.attrs.src);
    const iEn = scripts.indexOf('/assets/js/i18n/en.js'), iLang = scripts.indexOf(`/assets/js/i18n/${lang}.js`);
    if (iEn < 0 || iLang !== iEn + 1) fail(`public/${file}: load /assets/js/i18n/en.js, then /assets/js/i18n/${lang}.js`);
    // all copy in any script, names aside: more than half of it unchanged from English means untranslated
    const words = tr.copy.filter(t => /\p{L}{2}/u.test(t) && !isName(t));
    const same = words.filter(t => en.copy.includes(t));
    if (same.length > words.length / 2) fail(`public/${file}: ${same.length} of ${words.length} pieces of copy are identical to English, e.g. "${same[0].slice(0, 60)}"`);
    for (const t of tr.copy) typo(lang, t, `public/${file}`);
  }
}

if (problems.length) {
  console.error(`check:i18n failed (${problems.length}):\n- ` + problems.join('\n- '));
  if (missing.size) {
    console.error(`\nThe pages link ${[...missing].sort().join(', ')} pages that are not in public/ yet: merge the translations before shipping.`
      + '\n`npm run test:unit` runs the unit tests on their own.');
  }
  process.exit(1);
}
console.log(`check:i18n ok: ${LANGS.length ? LANGS.join(', ') : 'no translations yet'} in step with English`);
