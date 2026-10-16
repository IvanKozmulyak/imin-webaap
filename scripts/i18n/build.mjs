// Writes the translated pages (public/<lang>/index.html and public/<lang>/pro/index.html) from the English
// pages and the tables in scripts/i18n/<lang>/. Node stdlib only.
//
//   npm run i18n:build                 every language
//   npm run i18n:build -- --lang fr    one language (fr,es for several)
//   npm run i18n:build -- --check      write nothing, fail if a page is out of date
//
// When the English has text a table does not cover, or a row no longer matches, nothing is written and the
// report lists what to add or change in each language's table.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { buildPage, PAGES, decode } from './engine.mjs';
import { keep as NAMES } from './names.mjs';

export const ROOT = new URL('../../', import.meta.url);

// Languages = the folders next to this file.
export const languages = (root = ROOT) =>
  readdirSync(new URL('scripts/i18n/', root), { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort();

// One result per language and page: { lang, page, table, file, html, problems }.
export async function buildAll({ root = ROOT, langs = languages(root) } = {}) {
  const english = new Map(PAGES.map(p => [p.id, readFileSync(new URL(p.file, new URL('public/', root)), 'utf8')]));
  const results = [];
  for (const lang of langs) {
    for (const page of PAGES) {
      const table = `scripts/i18n/${lang}/${page.id}.mjs`;
      const file = `public/${lang}/${page.file}`;
      const url = new URL(table, root);
      if (!existsSync(url)) { results.push({ lang, page, table, file, html: null, problems: [{ type: 'missing' }] }); continue; }
      let mod;
      try { mod = await import(url.href); } catch (e) { results.push({ lang, page, table, file, html: null, problems: [{ type: 'load', why: e.message.split('\n')[0] }] }); continue; }
      const rows = { ...mod.default, keep: [...NAMES, ...(mod.default?.keep ?? [])] };
      const built = buildPage({ src: english.get(page.id), page, lang, table: rows });
      results.push({ lang, page, table, file, html: built.html, problems: built.problems });
    }
  }
  return results;
}

// ---------------------------------------------------------------------------------------------- the report

const quote = s => {
  const esc = q => q + s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').split(q).join('\\' + q) + q;
  return s.includes("'") && !s.includes('"') ? esc('"') : esc("'");
};
const flat = s => decode(s).replace(/\s+/g, ' ').trim();
const clip = (s, n = 110) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const rowText = r => `[${quote(clip(flat(r.en), 70))}, ${quote(clip(flat(r.tr), 50))}]`;

const who = e => (e.row ? rowText(e.row) : e.why);

function describe(p) {
  switch (p.type) {
    case 'count':
      return p.row.found === 0
        ? `${rowText(p.row)} is not in the English page any more: edit it to the new English, or delete it`
        : `${rowText(p.row)} occurs ${p.row.found} times, the row says ${p.row.count}: set the count to ${p.row.found}${p.row.found === 1 ? ' (or drop it)' : ''}`;
    case 'duplicate': return `${rowText(p.row)} is listed twice`;
    case 'badrow': return `${p.kind}[${p.index}] is not [english, translation, count?]: ${clip(JSON.stringify(p.row))}`;
    case 'overlap': return `two rules change the same text, ${who(p.a)} and ${who(p.b)}: ${quote(clip(flat(p.b.text || p.a.text), 70))}`;
    case 'partial': return `${who(p.claim)} cuts through the text ${quote(clip(flat(p.unit.raw), 80))}: make the row cover all of it`;
    case 'quote': return `the translation of ${quote(clip(flat(p.unit.raw), 70))} has a ${p.unit.quote} inside an attribute: remove it`;
    case 'structure': return p.why;
    case 'json': return `a JSON-LD block is not valid JSON after the translation (${p.why}): check the ld rows and the quotes`;
    case 'missing': return 'the table file is missing';
    case 'load': return `the table does not load (${p.why}): check commas, quotes and brackets`;
    default: return JSON.stringify(p);
  }
}

// What to do, per language and page, in words an editor can act on.
export function report(results) {
  const out = [];
  for (const r of results) {
    if (!r.problems.length) continue;
    out.push(`${r.lang}  ${r.table}  (${r.file})`);
    // the same English several times is one row with a count
    const todo = new Map();
    for (const { unit: u } of r.problems.filter(p => p.type === 'untranslated')) {
      const seen = todo.get(u.key) ?? { u, n: 0 };
      seen.n++;
      todo.set(u.key, seen);
    }
    if (todo.size) {
      out.push(`  Needs a translation (${todo.size}). Add a row to rows in the table, or the text to keep if it stays English:`);
      for (const { u, n } of todo.values()) out.push(`    [${quote(flat(u.raw))}, ''${n > 1 ? `, ${n}` : ''}],  // ${u.where}`);
    }
    const rest = r.problems.filter(p => p.type !== 'untranslated');
    if (rest.length) {
      out.push(`  Fix (${rest.length}):`);
      for (const p of rest) out.push(`    ${describe(p)}`);
    }
    out.push('');
  }
  return out.join('\n');
}

// ---------------------------------------------------------------------------------------------- writing

const read = (root, file) => (existsSync(new URL(file, root)) ? readFileSync(new URL(file, root), 'utf8') : null);

// Which pages differ from the committed files: [{ ...result, state: 'stale' | 'missing' }]. A page with problems
// cannot be built, so it is not compared.
export function drift(results, root = ROOT) {
  return results.filter(r => r.html !== null && !r.problems.length).flatMap(r => {
    const now = read(root, r.file);
    return now === r.html ? [] : [{ ...r, state: now === null ? 'missing' : 'stale' }];
  });
}

async function main() {
  const { values } = parseArgs({ options: { lang: { type: 'string' }, check: { type: 'boolean', default: false } } });
  const all = languages();
  const langs = values.lang ? values.lang.split(',').map(s => s.trim()).filter(Boolean) : all;
  const unknown = langs.filter(l => !all.includes(l));
  if (unknown.length || !langs.length) {
    console.error(`Unknown language ${unknown.join(', ') || '(none given)'}; there are tables for: ${all.join(', ')}`);
    process.exit(2);
  }
  const results = await buildAll({ langs });
  if (results.some(r => r.problems.length)) {
    console.error(report(results) + 'Nothing was written. Fix the above, then run npm run i18n:build again.');
    process.exit(1);
  }
  const changed = drift(results);
  if (values.check) {
    for (const r of changed) console.error(`${r.file} is ${r.state}: run npm run i18n:build`);
    console.log(changed.length ? `${changed.length} page(s) out of date` : `i18n pages up to date: ${langs.join(', ')}`);
    process.exit(changed.length ? 1 : 0);
  }
  for (const r of changed) {
    mkdirSync(fileURLToPath(new URL('.', new URL(r.file, ROOT))), { recursive: true });
    writeFileSync(new URL(r.file, ROOT), r.html);
  }
  for (const r of results) console.log(`${changed.some(c => c.file === r.file) ? 'wrote    ' : 'unchanged'} ${r.file}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) await main();
