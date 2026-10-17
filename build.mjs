// Zero-dependency static site generator. Reads site.config.mjs, writes ./dist.
// Usage: node build.mjs
//   SHOW_DRAFT=1          shows dashed "edit slots" for sections that are still empty (npm run dev)
//   STRICT_PLACEHOLDERS=1 fails the build while any launch blocker is open (npm run launch-check)
import { mkdir, rm, cp, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import cfg from './site.config.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const draft = process.env.SHOW_DRAFT === '1';

// ---------- helpers ----------
const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Escape, then turn [[placeholder]] into a visible highlighted marker.
const t = (s = '') => esc(s).replace(/\[\[(.+?)\]\]/g, '<mark class="ph" title="Placeholder: replace before launch">[$1]</mark>');
const refundText = cfg.refundPolicy || '[[Add your refund policy here. It must match your merchant of record.]]';
const fmt = (s) =>
  s
    .replaceAll('{year}', new Date().getFullYear())
    .replaceAll('{legalName}', cfg.site.legalName)
    .replaceAll('{supportEmail}', cfg.site.supportEmail)
    .replaceAll('{refundText}', refundText)
    .replaceAll('{delivery}', cfg.delivery)
    .replaceAll('{refundPolicy}', cfg.refundPolicy);
const siteUrl = cfg.site.url.replace(/\/$/, '');
const checkoutSet = !/\[\[/.test(cfg.checkoutUrl);
const checkoutHref = checkoutSet ? cfg.checkoutUrl : '#buy';

// Edit slot: visible only in draft mode, never on the live page.
const slot = (label) => (draft ? `<div class="slot"><strong>Edit slot:</strong> ${esc(label)} <span>(hidden on the live page until filled)</span></div>` : '');

// Discreet line icons, drawn in the brand blue via currentColor.
const ICONS = {
  habits: '<path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>',
  dining: '<path d="M7 3v8a2 2 0 0 0 2 2v8"/><path d="M5 3v6a2 2 0 0 0 2 2"/><path d="M9 3v6a2 2 0 0 1-2 2"/><path d="M17 21V3c-2 1-3.5 3.5-3.5 7 0 2 1 3 3.5 3"/>',
  tracker: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 10h6M9 14h6M9 18h3"/>',
  questions: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9.6 9.4a2.4 2.4 0 1 1 3.4 2.2c-.6.3-1 .8-1 1.4"/><path d="M12 16.2v.1"/>',
};
const icon = (name) =>
  `<svg class="ico" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
const check = '<svg class="chk" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

// ---------- shared pieces ----------
const disclaimer = (cls = '') => `<p class="disclaimer ${cls}"><strong>Disclaimer:</strong> ${esc(cfg.disclaimer)} <a href="/disclaimer/">Read more</a></p>`;

const cta = (button, support, where) => `
  <div class="cta-wrap">
    <a class="btn" href="${esc(checkoutHref)}" data-checkout data-where="${where}">${esc(button)}</a>
    <p class="cta-note">${esc(support)}</p>
    ${disclaimer()}
  </div>`;

const mockup = () =>
  cfg.images.mockup
    ? `<img class="mockup" src="${esc(cfg.images.mockup)}" alt="${esc(cfg.images.mockupAlt)}" width="960" height="720" fetchpriority="high">`
    : `<div class="mockup frame" role="img" aria-label="Preview of the guide">
         <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"/></svg>
         <p><strong>${esc(cfg.site.productName)}</strong><br>Guide preview</p>
       </div>`;

function layout({ title, description, path: urlPath, body, noindex = false, page = '', ogImage = true }) {
  const canonical = siteUrl ? `${siteUrl}${urlPath}` : '';
  const og = siteUrl ? `${siteUrl}${cfg.seo.ogImage}` : cfg.seo.ogImage;
  const pixelId = cfg.tracking.metaPixelId;
  const pixel = pixelId
    ? `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${esc(pixelId)}');fbq('track','PageView');</script>`
    : '';
  const siteData = JSON.stringify({
    page,
    pixel: Boolean(pixelId),
    value: cfg.price.amount,
    currency: cfg.price.currency,
    contentName: cfg.tracking.contentName,
    passQuery: cfg.passQueryToCheckout,
  }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#172B4D">
${noindex ? '<meta name="robots" content="noindex, nofollow">' : ''}
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.site.brand)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${canonical ? `<meta property="og:url" content="${esc(canonical)}">` : ''}
${ogImage ? `<meta property="og:image" content="${esc(og)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:image" content="${esc(og)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="/fonts/Lora-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/SourceSans3.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css">
${pixel}
<noscript>${pixelId ? `<img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${esc(pixelId)}&ev=PageView&noscript=1">` : ''}</noscript>
<script>window.__SITE__=${siteData};</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${body}
<script src="/site.js" defer></script>
</body>
</html>`;
}

const header = () => `
<header class="header">
  <div class="wrap header-in"><a class="brand" href="/">${esc(cfg.site.brand)}</a></div>
</header>`;

const footer = () => `
<footer class="footer">
  <div class="wrap">
    ${disclaimer('on-dark')}
    <nav class="footer-nav" aria-label="Footer">
      <a href="/terms/">Terms</a>
      <a href="/privacy/">Privacy</a>
      <a href="/disclaimer/">Disclaimer</a>
      <a href="/contact/">Contact</a>
    </nav>
    <p class="copy">${t(fmt(cfg.footer.copyright))}</p>
  </div>
</footer>`;

// ---------- home page: sections in the mandatory order ----------
function home() {
  const c = cfg;
  const heroPhoto = c.images.hero.src
    ? `<img class="photo" src="${esc(c.images.hero.src)}" alt="${esc(c.images.hero.alt)}" width="800" height="1000" fetchpriority="high">`
    : slot('appetizing everyday-meal photo (images.hero)');

  const mealsStrip = c.images.meals.length
    ? `<div class="strip">${c.images.meals.map((m) => `<img src="${esc(m.src)}" alt="${esc(m.alt)}" width="600" height="450" loading="lazy">`).join('')}</div>`
    : slot('3 everyday-meal photos (images.meals)');

  const previews = c.previews.pages.length
    ? `<section class="section" id="previews"><div class="wrap">
        <h2 class="center">${esc(c.previews.title)}</h2>
        <div class="pages">${c.previews.pages
          .map((p) => `<figure><img src="${esc(p.src)}" alt="${esc(p.alt)}" width="800" height="1035" loading="lazy">${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ''}</figure>`)
          .join('')}</div></div></section>`
    : draft
      ? `<section class="section"><div class="wrap">${slot('3 readable pages of the real guide, one a complete sample recipe (previews.pages)')}</div></section>`
      : '';

  const testimonials = c.testimonials.items.length
    ? `<section class="section"><div class="wrap narrow">
        <h2>${esc(c.testimonials.title)}</h2>
        ${c.testimonials.items
          .map((q) => `<figure class="quote"><blockquote><p>${esc(q.quote)}</p></blockquote><figcaption>${esc(q.name)}${q.disclosure ? `<span>${esc(q.disclosure)}</span>` : ''}</figcaption></figure>`)
          .join('')}</div></section>`
    : draft
      ? `<section class="section"><div class="wrap narrow">${slot('verified customer quote(s) (testimonials.items)')}</div></section>`
      : '';

  const creator = c.creator.paragraphs.length
    ? `<section class="section"><div class="wrap narrow"><div class="person">
        ${c.creator.photo ? `<img class="avatar" src="${esc(c.creator.photo)}" alt="${esc(c.creator.photoAlt)}" width="120" height="120" loading="lazy">` : ''}
        <div><h2>${esc(c.creator.title)}</h2>${c.creator.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</div></div></div></section>`
    : draft
      ? `<section class="section"><div class="wrap narrow">${slot('who created the guide, factual (creator.paragraphs)')}</div></section>`
      : '';

  const r = c.review;
  const review = r.reviewerName && r.credential && r.text
    ? `<section class="section"><div class="wrap narrow"><div class="person">
        ${r.photo ? `<img class="avatar" src="${esc(r.photo)}" alt="${esc(r.reviewerName)}" width="120" height="120" loading="lazy">` : ''}
        <div><h2>${esc(r.title)}</h2><p><strong>${esc(r.reviewerName)}</strong>, ${esc(r.credential)}</p><p>${esc(r.text)}</p></div></div></div></section>`
    : draft
      ? `<section class="section"><div class="wrap narrow">${slot('professional review, only once completed (review.*)')}</div></section>`
      : '';

  const faqItems = c.faq.items
    .map((f) => ({ q: f.q, a: fmt(f.a).trim() }))
    .filter((f) => f.a || draft)
    .map((f) => (f.a ? `<details><summary>${esc(f.q)}</summary><p>${t(f.a)}</p></details>` : `<div class="faq-slot">${slot(`answer for “${f.q}”`)}</div>`));

  const body = `
${header()}
<main id="main">

<!-- 1. Pain -->
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <h1>${esc(c.pain.headline)}</h1>
      <p class="lead-pain">${esc(c.pain.lead)}</p>
      ${c.pain.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
      <p class="list-intro">${esc(c.pain.listIntro)}</p>
      <ul class="questions">${c.pain.list.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>
      ${c.pain.closing.map((p, i) => `<p${i === c.pain.closing.length - 1 ? ' class="strong"' : ''}>${esc(p)}</p>`).join('')}
    </div>
    <div class="hero-photo">${heroPhoto}</div>
  </div>
</section>

<!-- 2. Product name + 3. deliverable image -->
<section class="section meet">
  <div class="wrap center">
    <p class="eyebrow">${esc(c.meet.eyebrow)}</p>
    <h2 class="product">${esc(c.meet.name)}</h2>
    <p class="subtitle">${esc(c.meet.subtitle)}</p>
    ${c.meet.paragraphs.map((p) => `<p class="meet-p">${esc(p)}</p>`).join('')}
    ${mockup()}
  </div>
</section>

<!-- 4. Bonuses -->
<section class="section">
  <div class="wrap">
    <h2 class="center">${esc(c.bonuses.title)}</h2>
    <div class="bonuses">
      ${c.bonuses.items
        .map((b) => `<div class="bonus">${icon(b.icon)}<div><p class="tag">${esc(b.label)}</p><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p></div></div>`)
        .join('')}
    </div>
  </div>
</section>

<!-- 5. First checkout button (only after the bonuses) -->
<section class="section cta-section">
  <div class="wrap center">${cta(c.cta.first.button, c.cta.first.support, 'first')}</div>
</section>

<!-- 6a. Content detail -->
<section class="section">
  <div class="wrap narrow">
    <h2>${esc(c.inside.title)}</h2>
    <p class="lead">${esc(c.inside.intro)}</p>
    <ul class="inside">${c.inside.items.map((i) => `<li>${check}<div><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p></div></li>`).join('')}</ul>
  </div>
  <div class="wrap">${mealsStrip}</div>
</section>

<!-- 6b. Real previews -->
${previews}

<!-- 6c. How to use -->
<section class="section">
  <div class="wrap narrow">
    <h2>${esc(c.steps.title)}</h2>
    <ol class="steps">${c.steps.items.map((s) => `<li><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></li>`).join('')}</ol>
    <p class="note">${esc(c.steps.note)}</p>
  </div>
</section>

<!-- 6d. Social proof / 6e. creator / 6f. review (hidden until real) -->
${testimonials}
${creator}
${review}

<!-- 7. Fit -->
<section class="section">
  <div class="wrap narrow">
    <h2>${esc(c.fit.title)}</h2>
    <p>${esc(c.fit.intro)}</p>
    <p class="list-intro">${esc(c.fit.listIntro)}</p>
    <ul class="inside compact">${c.fit.items.map((i) => `<li>${check}<span>${esc(i)}</span></li>`).join('')}</ul>
    <p class="note">${esc(c.fit.note)}</p>
  </div>
</section>

<!-- 8. FAQ -->
<section class="section">
  <div class="wrap narrow">
    <h2>${esc(c.faq.title)}</h2>
    <div class="faq">${faqItems.join('')}</div>
  </div>
</section>

<!-- 9. Final offer + second checkout button -->
<section class="section final" id="buy">
  <div class="wrap narrow center">
    <h2>${esc(c.cta.final.title)}</h2>
    <p class="final-lines">${c.cta.final.lines.map((l) => `<span>${esc(l)}</span>`).join('')}</p>
    <p class="price-line">${esc(c.cta.final.priceLine)}</p>
    ${cta(c.cta.final.button, c.cta.final.support, 'final')}
    ${checkoutSet ? '' : '<p class="ph-box"><mark class="ph">CHECKOUT_URL not set. Buttons do not go anywhere yet.</mark></p>'}
  </div>
</section>

</main>
${footer()}`;
  return layout({ title: c.seo.title, description: c.seo.description, path: '/', body, page: 'home' });
}

// ---------- simple pages ----------
function textPage(key, urlPath) {
  const p = cfg.pages[key];
  const body = `
${header()}
<main id="main" class="section">
  <div class="wrap narrow legal">
    <h1>${esc(p.title)}</h1>
    <p class="small">Last updated: ${esc(cfg.site.effectiveDate)}</p>
    ${p.draft ? '<p class="ph-box"><mark class="ph">DRAFT: have an attorney review this page before launch.</mark></p>' : ''}
    ${p.sections.map((s) => `<h2>${esc(s.h)}</h2>${s.p.map((x) => `<p>${t(fmt(x))}</p>`).join('')}`).join('')}
    <p><a href="/">&larr; Back to home</a></p>
  </div>
</main>
${footer()}`;
  return layout({ title: `${p.title} | ${cfg.site.brand}`, description: p.title, path: urlPath, body, ogImage: false });
}

function contact() {
  const p = cfg.pages.contact;
  const body = `
${header()}
<main id="main" class="section">
  <div class="wrap narrow legal">
    <h1>${esc(p.title)}</h1>
    <p>${esc(p.intro)}</p>
    <p class="big-email"><strong>${esc(p.emailLabel)}:</strong> ${
      /\[\[/.test(cfg.site.supportEmail) ? t(cfg.site.supportEmail) : `<a href="mailto:${esc(cfg.site.supportEmail)}">${esc(cfg.site.supportEmail)}</a>`
    }</p>
    <p>${esc(p.hint)}</p>
    <p class="small">${t(cfg.site.legalName)}<br>${t(cfg.site.legalAddress)}</p>
    <p><a href="/">&larr; Back to home</a></p>
  </div>
</main>
${footer()}`;
  return layout({ title: `${p.title} | ${cfg.site.brand}`, description: p.title, path: '/contact/', body, ogImage: false });
}

function thankYou() {
  const ty = cfg.thankYou;
  const body = `
${header()}
<main id="main" class="section">
  <div class="wrap narrow center">
    <h1>${esc(ty.title)}</h1>
    <p class="lead">${esc(ty.text)}</p>
    <p>${esc(ty.note)}</p>
    ${disclaimer()}
    <p><a href="/contact/">Contact support</a></p>
  </div>
</main>
${footer()}`;
  return layout({ title: `${ty.title} | ${cfg.site.brand}`, description: ty.title, path: '/thank-you/', body, noindex: true, page: 'thank-you', ogImage: false });
}

// ---------- write ----------
const pages = [
  ['index.html', home()],
  ['terms/index.html', textPage('terms', '/terms/')],
  ['privacy/index.html', textPage('privacy', '/privacy/')],
  ['disclaimer/index.html', textPage('disclaimer', '/disclaimer/')],
  ['contact/index.html', contact()],
  ['thank-you/index.html', thankYou()],
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const [file, html] of pages) {
  const out = path.join(dist, file);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, html);
}
await cp(path.join(root, 'static'), dist, { recursive: true });
await cp(path.join(root, 'src', 'styles.css'), path.join(dist, 'styles.css'));
await cp(path.join(root, 'src', 'site.js'), path.join(dist, 'site.js'));
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nDisallow: /thank-you/\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ''}`);
if (siteUrl) {
  const urls = ['/', '/terms/', '/privacy/', '/disclaimer/', '/contact/'];
  await writeFile(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${siteUrl}${u}</loc></url>`).join('\n')}\n</urlset>\n`,
  );
}

// ---------- launch readiness ----------
const blockers = new Set();
for (const [, html] of pages) for (const m of html.matchAll(/<mark class="ph"[^>]*>\[(.+?)\]<\/mark>/g)) blockers.add(m[1]);
if (!checkoutSet) blockers.add('CHECKOUT_URL');
for (const [k, v] of Object.entries(cfg.pages)) if (v.draft) blockers.add(`Attorney review of the ${k} page`);
if (!cfg.images.mockup) blockers.add('Product mockup image (images.mockup)');
if (!cfg.previews.pages.length) blockers.add('Real preview pages incl. one complete sample recipe (previews.pages)');
if (!cfg.delivery) blockers.add('FAQ answer: how files are delivered (delivery)');
if (!cfg.refundPolicy) blockers.add('Refund policy (refundPolicy), must match the merchant of record');
const optional = [];
if (!cfg.testimonials.items.length) optional.push('Verified customer quotes (testimonials.items): section hidden');
if (!cfg.creator.paragraphs.length) optional.push('Creator introduction (creator.paragraphs): section hidden');
if (!(cfg.review.reviewerName && cfg.review.credential && cfg.review.text)) optional.push('Professional review (review.*): section hidden');
if (!cfg.images.hero.src) optional.push('Opening food photo (images.hero): hidden');
if (!cfg.images.meals.length) optional.push('Everyday-meal photo strip (images.meals): hidden');
const warnings = [];
if (!cfg.tracking.metaPixelId) warnings.push('META_PIXEL_ID is empty: Meta Pixel is not loaded.');
if (!siteUrl) warnings.push('SITE_URL is empty: canonical URL, og:image URL and sitemap are skipped.');
if (!existsSync(path.join(root, 'static', 'og.png'))) warnings.push('static/og.png is missing.');

console.log(`Built ${pages.length} pages into dist/${draft ? ' (draft slots visible)' : ''}`);
if (blockers.size) {
  console.log(`\nLaunch blockers (${blockers.size}):`);
  for (const p of blockers) console.log(`  - ${p}`);
}
if (optional.length) {
  console.log('\nOptional sections still empty (hidden on the live page):');
  for (const o of optional) console.log(`  - ${o}`);
}
if (warnings.length) {
  console.log('\nWarnings:');
  for (const w of warnings) console.log(`  - ${w}`);
}
if (process.env.STRICT_PLACEHOLDERS === '1' && (blockers.size || warnings.length)) {
  console.error('\nSTRICT_PLACEHOLDERS=1: build failed because the items above are unresolved.');
  process.exit(1);
}
