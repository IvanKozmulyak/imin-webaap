// Builds a translated page from the English one: every piece of copy is swapped for its translation and the
// markup that depends on the language (lang, canonical, locale tags, language menu, links, strings file) is
// rewritten. Pure functions, no file access, so the same code writes the pages and checks them. Node stdlib only.
//
// A table is { rows, ld, keep }.
//   rows  [english, translation, count = 1], count being how many times it occurs on the page.
//         English without "<" is the whole text of one element or one copy attribute (alt, aria-label, placeholder,
//         title, meta content), compared as read: entities decoded, spaces collapsed, ’ and ' alike.
//         English with "<" is a piece of HTML replaced as written (a sentence with a link in it, words that move
//         around a tag, the same English said two ways). Those rows run first, in the order listed, and a piece
//         of the page that one of them translated is gone for the rows after it.
//   ld    the same for the strings in JSON-LD blocks that need wording of their own; the rest of the JSON-LD
//         takes the plain rows. Write the translation as JSON would.
//   keep  English text that stays English on this page (names, handles).
// In a translation, ⍽ is a no-break space and ⎵ a narrow no-break space.

export const SITE = 'https://imin.wtf';
// Each English page and where it lives; its translations are at /<lang><path> in public/<lang>/<file>.
export const PAGES = [
  { id: 'guest', file: 'index.html', path: '/' },
  { id: 'pro', file: 'pro/index.html', path: '/pro' },
];

const NAMED = { nbsp: '\u00a0', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
export const decode = s => s.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (all, dec, hex, name) =>
  dec ? String.fromCodePoint(+dec) : hex ? String.fromCodePoint(parseInt(hex, 16)) : NAMED[name.toLowerCase()] ?? all);
export const norm = s => decode(s).replace(/\u2019/g, "'").replace(/\s+/g, ' ').trim();
const marks = s => s.replace(/⍽/g, '\u00a0').replace(/⎵/g, '\u202f');
// copy that needs a row or a keep entry: words, and prices and percentages (written differently in each language)
const NEEDS = /\p{L}|[€$£%]/u;

// ---------------------------------------------------------------------------------------------- reading HTML

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr',
  'use', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'stop']);
const TAG = /<(\/?)([A-Za-z][\w:-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/y;
const ATTR = /([^\s=>/]+)(?:(\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

// Tags, text nodes and JSON-LD bodies of a page, all with their offsets in the source.
export function scan(html) {
  const tags = [], texts = [], lds = [], stack = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] !== '<') {
      const j = html.indexOf('<', i + 1);
      const end = j < 0 ? html.length : j;
      texts.push({ start: i, end, parent: stack.at(-1) ?? -1 });
      i = end;
      continue;
    }
    if (html.startsWith('<!--', i)) {
      const j = html.indexOf('-->', i + 4);
      i = j < 0 ? html.length : j + 3;
      continue;
    }
    if (html.startsWith('<!', i)) {
      const j = html.indexOf('>', i);
      i = j < 0 ? html.length : j + 1;
      continue;
    }
    TAG.lastIndex = i;
    const m = TAG.exec(html);
    if (!m) { texts.push({ start: i, end: i + 1, parent: stack.at(-1) ?? -1 }); i += 1; continue; }
    const [whole, slash, rawName, attrText, selfSlash] = m;
    const name = rawName.toLowerCase();
    const tag = { i: tags.length, name, close: !!slash, start: i, end: i + whole.length, attrs: [], parent: stack.at(-1) ?? -1 };
    if (!slash) {
      const open = i + 1 + rawName.length;
      for (const a of attrText.matchAll(ATTR)) {
        const start = open + a.index;
        const attr = { name: a[1].toLowerCase(), value: null, start, end: start + a[0].length, vStart: -1, vEnd: -1, quote: '' };
        if (a[2] !== undefined) {
          const base = start + a[1].length + a[2].length;
          const v = a[3] ?? a[4] ?? a[5];
          attr.quote = a[3] !== undefined ? '"' : a[4] !== undefined ? "'" : '';
          attr.value = v;
          attr.vStart = base + (attr.quote ? 1 : 0);
          attr.vEnd = attr.vStart + v.length;
        }
        tag.attrs.push(attr);
      }
    }
    tags.push(tag);
    i = tag.end;
    if (slash) {
      for (let k = stack.length - 1; k >= 0; k--) if (tags[stack[k]].name === name) { stack.length = k; break; }
      continue;
    }
    if (!VOID.has(name) && !selfSlash) stack.push(tag.i);
    if (name === 'script' || name === 'style') {
      const close = new RegExp(`</${name}`, 'gi');
      close.lastIndex = i;
      const found = close.exec(html);
      const end = found ? found.index : html.length;
      if (name === 'script' && attr(tag, 'type') === 'application/ld+json') lds.push({ start: i, end });
      i = end;
    }
  }
  return { tags, texts, lds };
}

export const attr = (tag, name) => tag.attrs.find(a => a.name === name)?.value;
const attrNode = (tag, name) => tag.attrs.find(a => a.name === name);

// The element a text sits in, as "p.label#id" (for reports).
function label(sc, idx) {
  const t = sc.tags[idx];
  if (!t) return '';
  const cls = (attr(t, 'class') || '').split(/\s+/)[0];
  const id = attr(t, 'id');
  return t.name + (cls ? '.' + cls : '') + (id ? '#' + id : '');
}

// ---------------------------------------------------------------------------------------------- units of copy

const COPY_ATTRS = new Set(['alt', 'title', 'placeholder', 'aria-label', 'aria-description', 'aria-roledescription', 'aria-valuetext', 'data-url']);
// meta content that is a link, a colour, a size or a keyword, not copy
const NOT_COPY = /^(?:https?:|#|\d|[a-z]{2}_[A-Z]{2}$|width=|website$|summary)/;
// "Question" names and "text" / "description" values of the JSON-LD blocks
const LD_STRING = /("@type"\s*:\s*"Question"\s*,\s*"name"\s*:\s*|"(?:text|description)"\s*:\s*)"((?:[^"\\]|\\.)*)"/g;

// Every piece of copy on the page: text nodes, copy attributes and JSON-LD strings. Language labels are not copy.
export function units(html, sc) {
  const out = [];
  const inLanguageLink = idx => {
    for (let k = idx; k >= 0; k = sc.tags[k].parent) if (sc.tags[k].name === 'a' && attr(sc.tags[k], 'hreflang') !== undefined) return true;
    return false;
  };
  for (const t of sc.texts) {
    const raw = html.slice(t.start, t.end);
    const trimmed = raw.trim();
    if (!trimmed || inLanguageLink(t.parent)) continue;
    const start = t.start + (raw.length - raw.trimStart().length);
    out.push({ kind: 'text', start, end: start + trimmed.length, raw: trimmed, key: norm(trimmed), where: label(sc, t.parent), parent: t.parent });
  }
  for (const tag of sc.tags) {
    if (tag.close) continue;
    for (const a of tag.attrs) {
      if (a.value === null || !a.value.trim()) continue;
      const copy = COPY_ATTRS.has(a.name) || (tag.name === 'meta' && a.name === 'content' && !NOT_COPY.test(a.value));
      if (!copy) continue;
      out.push({ kind: 'attr', start: a.vStart, end: a.vEnd, raw: a.value, key: norm(a.value), where: `${tag.name}[${a.name}]`, quote: a.quote, parent: tag.i });
    }
  }
  for (const block of sc.lds) {
    for (const m of html.slice(block.start, block.end).matchAll(LD_STRING)) {
      const start = block.start + m.index + m[1].length + 1;
      let key;
      try { key = norm(JSON.parse(`"${m[2]}"`)); } catch { continue; }
      out.push({ kind: 'ld', start, end: start + m[2].length, raw: m[2], key, where: 'json-ld', parent: -1 });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

// ---------------------------------------------------------------------------------------------- the site's languages

// Locale tags in the English head (own language first) and the label each language has in the menu.
export function siteInfo(html, sc) {
  const locales = sc.tags.filter(t => t.name === 'meta' && /^og:locale(:alternate)?$/.test(attr(t, 'property') || '')).map(t => attr(t, 'content'));
  const codes = {};
  for (const a of sc.tags) {
    const lang = !a.close && a.name === 'a' ? attr(a, 'hreflang') : undefined;
    const span = lang && sc.tags.find(t => t.name === 'span' && t.parent === a.i);
    const text = span && sc.texts.find(t => t.parent === span.i);
    if (text && !(lang in codes)) codes[lang] = html.slice(text.start, text.end).trim();
  }
  return { locales, codes };
}

export const pageUrl = (lang, page) => `${SITE}/${lang}${page.path === '/' ? '' : page.path}`;
export const pagePath = (lang, page) => `/${lang}${page.path === '/' ? '' : page.path}`;

// What changes in the markup for a language: lang, canonical and og:url, locale tags, menu, links, strings file.
function structure(html, sc, page, lang, info, add, problems) {
  const fail = why => problems.push({ type: 'structure', why });
  const one = (name, test, what) => {
    const found = sc.tags.filter(t => !t.close && t.name === name && test(t));
    if (found.length !== 1) { fail(`expected one ${what} in the English page, found ${found.length}`); return null; }
    return found[0];
  };
  const set = (tag, name, from, to, why) => {
    const a = attrNode(tag, name);
    if (!a || a.value !== from) { fail(`${why}: the English page has ${name}="${a?.value}", expected "${from}"`); return; }
    add(a.vStart, a.vEnd, to, why);
  };

  const root = one('html', () => true, '<html>');
  if (root) set(root, 'lang', 'en', lang, '<html lang>');

  const here = `${SITE}${page.path}`;
  const canonical = one('link', t => attr(t, 'rel') === 'canonical', 'canonical link');
  if (canonical) set(canonical, 'href', here, pageUrl(lang, page), 'canonical');
  const ogUrl = one('meta', t => attr(t, 'property') === 'og:url', 'og:url');
  if (ogUrl) set(ogUrl, 'content', here, pageUrl(lang, page), 'og:url');

  // own locale first, then en_US, then the others in the English order
  const metas = sc.tags.filter(t => !t.close && t.name === 'meta' && /^og:locale(:alternate)?$/.test(attr(t, 'property') || ''));
  const own = info.locales.find(l => l.startsWith(lang + '_'));
  if (!own) fail(`no og:locale for "${lang}" in the English page`);
  else {
    const order = [own, 'en_US', ...info.locales.slice(1).filter(l => l !== own)];
    if (order.length !== metas.length) fail('og:locale tags do not add up');
    else metas.forEach((t, k) => set(t, 'content', info.locales[k], order[k], 'og:locale'));
  }

  // the menu button shows this language's label; its menu marks this language as current
  const details = sc.tags.find(t => !t.close && t.name === 'details' && /\blang\b/.test(attr(t, 'class') || ''));
  const summary = details && sc.tags.find(t => !t.close && t.name === 'summary' && t.parent === details.i);
  const code = summary && sc.texts.find(t => t.parent === summary.i);
  if (!code) fail('no language menu (<details class="lang"><summary>) in the English page');
  else if (!info.codes[lang]) fail(`no menu entry with hreflang="${lang}" and a label in a <span>`);
  else {
    const raw = html.slice(code.start, code.end);
    const start = code.start + (raw.length - raw.trimStart().length);
    add(start, start + raw.trim().length, info.codes[lang], 'language menu label');
  }
  for (const t of sc.tags) {
    if (t.close || t.name !== 'a') continue;
    const target = attr(t, 'hreflang');
    const current = attrNode(t, 'aria-current');
    if (target !== undefined && !attrNode(t, 'href')) { fail(`a language link (hreflang="${target}") has no href in the English page`); continue; }
    if (target === lang && !current) add(attrNode(t, 'href').end, attrNode(t, 'href').end, ' aria-current="true"', 'language link');
    else if (target === 'en' && current) {
      if (!/\s/.test(html[current.start - 1])) fail('aria-current sits right behind another attribute in the English language menu');
      else add(current.start - 1, current.end, '', 'language link');
    }
    else if (target === undefined) {
      const href = attrNode(t, 'href');
      const to = PAGES.find(p => p.path === href?.value);
      if (to) add(href.vStart, href.vEnd, pagePath(lang, to), 'link to the other page');
    }
  }

  const strings = sc.tags.find(t => !t.close && t.name === 'script' && attr(t, 'src') === '/assets/js/i18n/en.js');
  if (!strings) fail('no <script src="/assets/js/i18n/en.js"> in the English page');
  else {
    const at = html.indexOf('</script>', strings.end) + '</script>'.length;
    add(at, at, `\n<script src="/assets/js/i18n/${lang}.js" defer></script>`, 'strings file');
  }
}

// ---------------------------------------------------------------------------------------------- building a page

function readRows(table, problems) {
  const rows = { html: [], text: new Map(), ld: new Map() };
  const read = (list, kind) => (list ?? []).forEach((row, index) => {
    const [en, tr, count = 1] = Array.isArray(row) ? row : [];
    if (typeof en !== 'string' || typeof tr !== 'string' || !en.trim() || !Number.isInteger(count) || count < 1 || row.length > 3) {
      problems.push({ type: 'badrow', kind, index, row });
      return;
    }
    const r = { kind, index, en, tr: marks(tr), count, found: 0 };
    if (kind === 'rows' && en.includes('<')) {
      if (rows.html.some(x => x.en === en)) problems.push({ type: 'duplicate', row: r });
      else rows.html.push(r);
      return;
    }
    const map = kind === 'ld' ? rows.ld : rows.text;
    const key = norm(en);
    if (map.has(key)) problems.push({ type: 'duplicate', row: r });
    else map.set(key, r);
  });
  read(table.rows, 'rows');
  read(table.ld, 'ld');
  return rows;
}

// Returns { html, problems, rows, units, edits }: html is null only when the edits cannot be applied together;
// the caller decides what the other problems mean (see report() in build.mjs).
export function buildPage({ src, page, lang, table }) {
  const problems = [];
  const sc = scan(src);
  const info = siteInfo(src, sc);
  const edits = [];
  const add = (start, end, text, why, row) => edits.push({ start, end, text, why, row, order: edits.length });
  const rows = readRows(table, problems);
  const keep = new Set((table.keep ?? []).map(norm));

  structure(src, sc, page, lang, info, add, problems);
  // a piece of the page that a row has translated is gone for the rows after it
  const taken = [];
  for (const r of rows.html) {
    for (let at = src.indexOf(r.en); at >= 0; at = src.indexOf(r.en, at + r.en.length)) {
      const end = at + r.en.length;
      if (taken.some(c => c.start < end && at < c.end)) continue;
      taken.push({ start: at, end });
      add(at, end, r.tr, `${r.kind} ${r.index}`, r);
      r.found++;
    }
  }

  const all = units(src, sc);
  const claims = edits.slice();
  const claimed = u => claims.filter(c => c.start < u.end && u.start < c.end);
  for (const u of all) {
    const hit = claimed(u);
    if (hit.length) {
      if (hit.some(c => c.start > u.start || c.end < u.end)) problems.push({ type: 'partial', unit: u, claim: hit[0] });
      continue;
    }
    const row = (u.kind === 'ld' && rows.ld.get(u.key)) || rows.text.get(u.key);
    if (row) {
      row.found++;
      let text = row.tr;
      if (u.kind === 'ld') text = row.kind === 'ld' ? row.tr : JSON.stringify(decode(row.tr)).slice(1, -1);
      if (u.kind === 'attr' && u.quote && text.includes(u.quote)) problems.push({ type: 'quote', unit: u, row });
      else add(u.start, u.end, text, `${row.kind} ${row.index}`, row);
    } else if (!keep.has(u.key) && NEEDS.test(decode(u.raw))) problems.push({ type: 'untranslated', unit: u });
  }
  for (const r of [...rows.html, ...rows.text.values(), ...rows.ld.values()]) {
    if (r.found !== r.count) problems.push({ type: 'count', row: r });
  }

  const sorted = edits.slice().sort((a, b) => a.start - b.start || a.end - b.end || a.order - b.order);
  let reach = null;
  for (const e of sorted) {
    if (reach && e.start < reach.end) problems.push({ type: 'overlap', a: reach, b: e });
    if (!reach || e.end > reach.end) reach = e;
  }

  // the page is written only when its edits fit together; the caller decides what the other problems mean
  let html = null;
  if (!problems.some(p => p.type === 'overlap' || p.type === 'quote')) {
    let out = '', pos = 0;
    for (const e of sorted) { out += src.slice(pos, e.start) + e.text; pos = e.end; }
    html = out + src.slice(pos);
    for (const block of scan(html).lds) {
      try { JSON.parse(html.slice(block.start, block.end)); } catch (e) { problems.push({ type: 'json', why: e.message }); }
    }
  }
  return { html, problems, rows: [...rows.html, ...rows.text.values(), ...rows.ld.values()], units: all, edits: sorted };
}
