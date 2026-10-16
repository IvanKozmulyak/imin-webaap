// Keeps the translated pages in step with English: same structure, same script-string keys, and
// each language's typography. Languages = the files in public/assets/js/i18n/ other than en.js.
// Run by `npm test` and `npm run check:i18n`. Node stdlib only.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const PUB = new URL('../public/', import.meta.url);
const read = p => readFileSync(new URL(p, PUB), 'utf8');
const LANGS = readdirSync(new URL('assets/js/i18n/', PUB)).filter(f => f.endsWith('.js') && f !== 'en.js').map(f => f.slice(0, -3)).sort();
const PAGES = [['index.html', ''], ['pro/index.html', '/pro']];
const problems = [];
const fail = msg => problems.push(msg);

// French: a no-break space (not a plain one, not none) before : ; ! ? » and after « (same rules as imin-webapp).
const FR_PLAIN_SPACE = /(?: [:;!?»]|« )/;
const FR_NO_SPACE = /[\p{L})’»][:;!?]+(?=$|[\s)’"»,.…—–])/u;
// Ukrainian: ʼ (U+02BC) between Cyrillic letters.
const UK_WRONG_APOSTROPHE = /\p{Script=Cyrillic}['’]\p{Script=Cyrillic}/u;
const typo = (lang, text, where) => {
  if (lang === 'fr' && (FR_PLAIN_SPACE.test(text) || FR_NO_SPACE.test(text))) fail(`${where}: French spacing around : ; ! ? « » in "${text.slice(0, 80)}"`);
  if (lang === 'uk' && UK_WRONG_APOSTROPHE.test(text)) fail(`${where}: use ʼ (U+02BC) between Cyrillic letters in "${text.slice(0, 80)}"`);
};

// The page as a list of tags (name, class, id, attribute names), plus its copy: text nodes and copy attributes.
const COPY_ATTRS = new Set(['alt', 'aria-label', 'placeholder', 'title', 'content']);
const IGNORED_ATTRS = new Set(['aria-current']);
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
    tags.push({ sig: `${name}.${attrs.class || ''}#${attrs.id || ''}[${names}]`, ld: name === 'script' && attrs.type === 'application/ld+json', attrs });
    if (name === 'script' || name === 'style') raw = name;
  }
  return { tags, copy };
}

const vmCtx = () => vm.createContext({ window: {}, document: { documentElement: { lang: 'en' } } });
function keyTree(obj, path = '') {
  const out = new Map();
  for (const [k, v] of Object.entries(obj || {})) {
    const p = path ? `${path}.${k}` : k;
    const type = Array.isArray(v) ? `array(${v.length})` : typeof v;
    out.set(p, type);
    if (type === 'object') for (const [kk, vv] of keyTree(v, p)) out.set(kk, vv);
  }
  return out;
}
function strings(obj, out = []) {
  for (const v of Object.values(obj || {})) {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(x => (typeof x === 'string' ? out.push(x) : strings(x, out)));
    else if (v && typeof v === 'object') strings(v, out);
  }
  return out;
}

const ctx = vmCtx();
vm.runInContext(read('assets/js/i18n/en.js'), ctx, { filename: 'en.js' });
const enTree = keyTree(ctx.window.IMIN_I18N.en);

for (const lang of LANGS) {
  // script strings: same keys and kinds as English, typography of the language
  try { vm.runInContext(read(`assets/js/i18n/${lang}.js`), ctx, { filename: `${lang}.js` }); }
  catch (e) { fail(`i18n/${lang}.js does not run: ${e.message}`); continue; }
  const dict = ctx.window.IMIN_I18N[lang];
  if (!dict) { fail(`i18n/${lang}.js must set window.IMIN_I18N.${lang}`); continue; }
  const tree = keyTree(dict);
  for (const [k, t] of enTree) if (tree.get(k) !== t) fail(`i18n/${lang}.js: ${k} is ${tree.get(k) ?? 'missing'}, English has ${t}`);
  for (const k of tree.keys()) if (!enTree.has(k)) fail(`i18n/${lang}.js: ${k} is not in English`);
  for (const s of strings(dict)) typo(lang, s, `i18n/${lang}.js`);

  // pages: same tags in the same order as English, the language's own head and scripts
  for (const [page, path] of PAGES) {
    const file = `${lang}/${page}`;
    if (!existsSync(new URL(file, PUB))) { fail(`public/${file} is missing`); continue; }
    const en = parse(read(page)), tr = parse(read(file));
    const sigs = p => p.tags.filter(t => t.sig !== null);
    const a = sigs(en), b = sigs(tr), n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) {
      if (a[i]?.sig === b[i]?.sig) continue;
      fail(`public/${file}: structure differs from public/${page} at tag ${i}: English <${a[i]?.sig ?? 'end'}>, ${lang} <${b[i]?.sig ?? 'end'}>`);
      break;
    }
    const html = tr.tags.find(t => t.sig.startsWith('html.'));
    if (html?.attrs.lang !== lang) fail(`public/${file}: <html lang> must be "${lang}"`);
    const canon = tr.tags.find(t => t.attrs?.rel === 'canonical')?.attrs.href;
    if (canon !== `https://imin.wtf/${lang}${path}`) fail(`public/${file}: canonical must be https://imin.wtf/${lang}${path}, is ${canon}`);
    const scripts = tr.tags.filter(t => t.attrs?.src).map(t => t.attrs.src);
    const iEn = scripts.indexOf('/assets/js/i18n/en.js'), iLang = scripts.indexOf(`/assets/js/i18n/${lang}.js`);
    if (iEn < 0 || iLang !== iEn + 1) fail(`public/${file}: load /assets/js/i18n/en.js, then /assets/js/i18n/${lang}.js`);
    // names (brands, the example night, people) stay as they are; more than half the copy unchanged means untranslated
    const words = tr.copy.filter(t => /[a-z]{4,}/i.test(t));
    const same = words.filter(t => en.copy.includes(t));
    if (same.length > words.length / 2) fail(`public/${file}: ${same.length} of ${words.length} pieces of copy are identical to English, e.g. "${same[0].slice(0, 60)}"`);
    for (const t of tr.copy) typo(lang, t, `public/${file}`);
  }
}

if (problems.length) {
  console.error(`check:i18n failed (${problems.length}):\n- ` + problems.join('\n- '));
  process.exit(1);
}
console.log(`check:i18n ok: ${LANGS.length ? LANGS.join(', ') : 'no translations yet'} in step with English`);
