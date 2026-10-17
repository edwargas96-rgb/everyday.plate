// Fails if forbidden health-claim wording appears in the BUILT pages (dist/).
// Run: npm run check
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const FORBIDDEN = [
  /\bcure[sd]?\b/i, /\breverse[sd]?\b/i, /\breversing\b/i, /\btreat(s|ed|ing|ment|ments)?\b/i, /\bheal(s|ed|ing)?\b/i,
  /lower(ing)? your a1c/i, /\ba1c\b/i, /get off (your )?(medication|meds)/i, /diabetes-proof/i, /guaranteed results/i,
  /\byou (have|got) (pre-?)?diabetes\b/i, /\bremission\b/i,
  /\bguaranteed\b/i, /\bresets?\b/i, /\bfix(es|ed|ing)?\b/i, /\bsolutions?\b/i, /\bcontrol(s|led|ling)?\b/i, /\be-?books?\b/i, /steady plate/i,
];
const RISKY = [/lose weight/i, /weight loss/i, /lower your (blood )?(sugar|glucose)/i, /stop taking/i, /\bprevent(s|ing)?\b/i];

async function* walk(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (p.endsWith('.html')) yield p;
  }
}
let bad = 0;
// Brand must always be written 'The Everyday Plate' (one word) in visible text.
const BRAND_WRONG = /\bEvery Day Plate\b/i;
// 'prediabetes' may only appear in the FAQ, never in headlines or section titles or the page title.
const PREDIABETES_OK_IN = /<details>[\s\S]*?<\/details>/g;
for await (const f of walk(dist)) {
  const html = await readFile(f, 'utf8');
  // visible text only (drop scripts, styles, tags)
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
  if (BRAND_WRONG.test(text)) { bad++; console.error(`Brand written as "Every Day Plate" in ${path.relative(dist, f)}`); }
  const outsideFaq = html.replace(PREDIABETES_OK_IN, ' ').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
  if (/pre-?diabetes/i.test(outsideFaq)) { bad++; console.error(`"prediabetes" outside the FAQ in ${path.relative(dist, f)}`); }
  for (const re of FORBIDDEN) { const m = text.match(re); if (m) { bad++; console.error(`FORBIDDEN "${m[0]}" in ${path.relative(dist, f)}`); } }
  for (const re of RISKY) { const m = text.match(re); if (m) console.warn(`review: "${m[0]}" in ${path.relative(dist, f)}`); }
  // tracking payload must not mention a health condition
  const data = (html.match(/window\.__SITE__=(\{.*?\});/) || [])[1] || '';
  if (/diabet|blood|sugar|a1c/i.test(data)) { bad++; console.error(`Tracking config mentions a health term in ${path.relative(dist, f)}`); }
}
if (bad) { console.error(`\nCopy check FAILED (${bad}).`); process.exit(1); }
console.log('Copy check passed: no forbidden wording, tracking payload is generic.');
