// Zero-dependency static site generator. Reads site.config.mjs, writes ./dist.
// Usage: node build.mjs
//   SHOW_DRAFT=1          shows dashed "edit slots" for sections that are still empty (npm run dev)
//   STRICT_PLACEHOLDERS=1 fails the build while any launch blocker is open (npm run launch-check)
import { mkdir, rm, cp, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import raw from './site.config.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const draft = process.env.SHOW_DRAFT === '1';

// ---------- variables: {price} {brand} {days} {legalName} ... usable in any config string ----------
const days = raw.guarantee.days;
const guaranteeText = raw.guarantee.text.replaceAll('{days}', days);
const vars = {
  price: raw.price.display,
  brand: raw.site.brand,
  days,
  year: new Date().getFullYear(),
  legalName: raw.site.legalName,
  supportEmail: raw.site.supportEmail,
  delivery: raw.delivery,
  refundPolicy: raw.refundPolicy,
  refundAnswer: raw.refundPolicy || (raw.guarantee.show ? guaranteeText : ''),
  refundText:
    raw.refundPolicy ||
    `We offer a ${days}-day money-back guarantee. To request a refund, email ${raw.site.supportEmail} within ${days} days of your purchase and include the email you used at checkout. [[Align this with your merchant of record’s refund terms.]]`,
};
const interp = (v) =>
  typeof v === 'string'
    ? v.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m))
    : Array.isArray(v)
      ? v.map(interp)
      : v && typeof v === 'object'
        ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, interp(x)]))
        : v;
const cfg = interp(raw);

// ---------- helpers ----------
const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Escape, then turn [[placeholder]] into a visible highlighted marker.
const t = (s = '') => esc(s).replace(/\[\[(.+?)\]\]/g, '<mark class="ph" title="Placeholder: replace before launch">[$1]</mark>');
const siteUrl = cfg.site.url.replace(/\/$/, '');
const checkoutSet = !/\[\[/.test(cfg.checkoutUrl);
const checkoutHref = checkoutSet ? cfg.checkoutUrl : '#buy';

// Edit slot: visible only in draft mode, never on the live page.
const slot = (label) => (draft ? `<div class="slot"><strong>Edit slot:</strong> ${esc(label)} <span>(hidden on the live page until filled)</span></div>` : '');

const HEART = '<svg class="heart" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path fill="currentColor" d="M12 21.2l-1.45-1.3C5.4 15.2 2 12.1 2 8.3 2 5.2 4.4 2.8 7.5 2.8c1.7 0 3.4.8 4.5 2.1 1.1-1.3 2.8-2.1 4.5-2.1 3.1 0 5.5 2.4 5.5 5.5 0 3.8-3.4 6.9-8.55 11.6z"/></svg>';
const deco = `<div class="deco" aria-hidden="true">${HEART}${HEART}${HEART}</div>`;
const phrase = (text) => `<div class="phrase"><div class="wrap">${HEART}<p>${esc(text)}</p>${HEART}</div></div>`;
const heading = (text, center = true) => `<h2${center ? ' class="center"' : ''}>${esc(text)}</h2>${center ? deco : ''}`;

// Discreet line icons, drawn in the brand blue via currentColor.
const ICONS = {
  fridge: '<rect x="6" y="2.5" width="12" height="19" rx="2"/><path d="M6 10h12M9 6v1.5M9 13v3"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  cart: '<path d="M3 4h2.2l2.3 11h9.3l2-8H6.3"/><circle cx="9" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/>',
  recipe: '<rect x="4.5" y="3" width="15" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  tracker: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M8.5 11l1.5 1.5 3-3M8.5 17l1.5 1.5 3-3"/>',
  questions: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9.6 9.4a2.4 2.4 0 1 1 3.4 2.2c-.6.3-1 .8-1 1.4"/><path d="M12 16.2v.1"/>',
  printer: '<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/>',
};
const icon = (name, size = 28) =>
  `<svg class="ico" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
const check = '<svg class="chk" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

// ---------- shared pieces ----------
const disclaimer = (cls = '') => `<p class="disclaimer ${cls}"><strong>Disclaimer:</strong> ${esc(cfg.disclaimer)} <a href="/disclaimer/">Read more</a></p>`;

const cta = (button, support, where) => `
  <div class="cta-wrap">
    <a class="btn" href="${esc(checkoutHref)}" data-checkout data-where="${where}">${esc(button)}</a>
    <p class="cta-note">${HEART} ${esc(support)}</p>
    ${disclaimer()}
  </div>`;

const logo = (cls) => `<img class="${cls}" src="${esc(cfg.logo.src)}" width="${cfg.logo.width}" height="${cfg.logo.height}" alt="${esc(cfg.site.brand)}">`;

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
<meta name="theme-color" content="#FCF7EC">
${noindex ? '<meta name="robots" content="noindex, nofollow">' : ''}
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
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
  <div class="wrap header-in"><a class="brand" href="/" aria-label="${esc(cfg.site.brand)}, home">${logo('logo')}</a></div>
</header>`;

const footer = () => `
<footer class="footer">
  <div class="wrap">
    <div class="footer-top">
      <a class="logo-chip" href="/" aria-label="${esc(cfg.site.brand)}, home">${logo('logo logo-sm')}</a>
      <p class="tagline">${HEART} ${esc(cfg.footer.tagline)}</p>
    </div>
    ${disclaimer('on-dark')}
    <nav class="footer-nav" aria-label="Footer">
      <a href="/terms/">Terms</a>
      <a href="/privacy/">Privacy</a>
      <a href="/disclaimer/">Disclaimer</a>
      <a href="/contact/">Contact</a>
    </nav>
    <p class="copy">${t(cfg.footer.copyright)}</p>
  </div>
</footer>`;

// ---------- home page ----------
function home() {
  const c = cfg;
  const heroPhoto = c.images.hero.src
    ? `<img class="photo" src="${esc(c.images.hero.src)}" alt="${esc(c.images.hero.alt)}" width="800" height="1000" fetchpriority="high">`
    : slot('appetizing everyday-meal photo (images.hero)');

  const mealsStrip = c.images.meals.length
    ? `<div class="strip">${c.images.meals.map((m) => `<img src="${esc(m.src)}" alt="${esc(m.alt)}" width="600" height="450" loading="lazy">`).join('')}</div>`
    : slot('everyday-meal photos (images.meals)');

  const testimonials = c.testimonials.items.length
    ? `<section class="section"><div class="wrap narrow">
        ${heading(c.testimonials.title)}
        ${c.testimonials.items
          .map((q) => `<figure class="quote"><blockquote><p>${esc(q.quote)}</p></blockquote><figcaption>${esc(q.name)}${q.disclosure ? `<span>${esc(q.disclosure)}</span>` : ''}</figcaption></figure>`)
          .join('')}</div></section>`
    : draft
      ? `<section class="section"><div class="wrap narrow">${slot('[REAL REVIEW]: verified customer quote(s) (testimonials.items)')}</div></section>`
      : '';

  const creator = c.creator.paragraphs.length
    ? `<section class="section"><div class="wrap narrow"><div class="person">
        ${c.creator.photo ? `<img class="avatar" src="${esc(c.creator.photo)}" alt="${esc(c.creator.photoAlt)}" width="120" height="120" loading="lazy">` : ''}
        <div><h2>${esc(c.creator.title)}</h2>${c.creator.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</div></div></div></section>`
    : draft
      ? `<section class="section"><div class="wrap narrow">${slot('who created the kit, factual (creator.paragraphs)')}</div></section>`
      : '';

  const r = c.review;
  const review = r.reviewerName && r.credential && r.text
    ? `<section class="section"><div class="wrap narrow"><div class="person trust">
        ${r.photo ? `<img class="avatar" src="${esc(r.photo)}" alt="${esc(r.reviewerName)}" width="120" height="120" loading="lazy">` : `<div class="seal" aria-hidden="true">RD</div>`}
        <div><h2>${esc(r.title)}</h2><p><strong>${esc(r.reviewerName)}</strong>, ${esc(r.credential)}</p><p>${esc(r.text)}</p></div></div></div></section>`
    : draft
      ? `<section class="section"><div class="wrap narrow">${slot('Reviewed by a Registered Dietitian: [RD NAME, CREDENTIALS] (review.*), only once the review is real and finished')}</div></section>`
      : '';

  const guarantee = c.guarantee.show
    ? `<section class="section"><div class="wrap narrow"><div class="guarantee">
        <div class="g-badge" aria-hidden="true"><span>${esc(c.guarantee.days)}</span>days</div>
        <div><h2>${esc(c.guarantee.title)}</h2><p>${esc(c.guarantee.text)}</p></div></div></div></section>`
    : '';

  const faqItems = c.faq.items
    .filter((f) => f.a.trim() || draft)
    .map((f) => (f.a.trim() ? `<details><summary>${esc(f.q)}</summary><p>${t(f.a)}</p></details>` : `<div class="faq-slot">${slot(`answer for “${f.q}”`)}</div>`));

  const body = `
${header()}
<main id="main">

<!-- Pain -->
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <h1 data-a="${esc(c.headline.a)}" data-b="${esc(c.headline.b)}">${esc(c.headline.a)}</h1>
      <p class="lead-pain">${esc(c.pain.lead)}</p>
      ${c.pain.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
      <p class="list-intro">${esc(c.pain.listIntro)}</p>
      <ul class="questions">${c.pain.list.map((q) => `<li>${HEART}<span>${esc(q)}</span></li>`).join('')}</ul>
      ${c.pain.closing.map((p, i) => `<p${i === c.pain.closing.length - 1 ? ' class="strong"' : ''}>${esc(p)}</p>`).join('')}
    </div>
    <div class="hero-photo">${heroPhoto}</div>
  </div>
</section>
${phrase(c.phrases.afterPain)}

<!-- Product name, promise, kit mockup -->
<section class="section meet">
  <div class="wrap center">
    <p class="eyebrow">${esc(c.meet.eyebrow)}</p>
    <h2 class="product">${esc(c.meet.name)}</h2>
    <p class="subtitle">${esc(c.meet.subtitle)}</p>
    <p class="promise">${esc(c.meet.promise)}</p>
    ${c.meet.paragraphs.map((p) => `<p class="meet-p">${esc(p)}</p>`).join('')}
    <ul class="chips">${c.meet.chips.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <img class="mockup" src="${esc(c.images.kitMockup)}" alt="${esc(c.images.kitMockupAlt)}" width="960" height="720" fetchpriority="high">
  </div>
</section>

<!-- What is in the kit -->
<section class="section">
  <div class="wrap">
    ${heading(c.kit.title)}
    <p class="lead center">${esc(c.kit.intro)}</p>
    <div class="kit">
      ${c.kit.items
        .map((b, i) => `<article class="piece"><span class="num">${i + 1}</span><div class="piece-ico">${icon(b.icon)}</div><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p></article>`)
        .join('')}
    </div>
  </div>
</section>

<!-- Checkout button 1 -->
<section class="section cta-section">
  <div class="wrap center">${cta(c.cta.first.button, c.cta.first.support, 'first')}</div>
</section>

<!-- Print what you need -->
<section class="section">
  <div class="wrap narrow center">
    <div class="print-card">
      <div class="print-ico">${icon('printer', 34)}</div>
      <h2>${esc(c.print.title)}</h2>
      <p class="lead">${esc(c.print.text)}</p>
      <ul class="chips">${c.print.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    </div>
  </div>
  <div class="wrap">${mealsStrip}</div>
</section>

<!-- A look inside -->
<section class="section" id="look">
  <div class="wrap">
    ${heading(c.look.title)}
    <p class="lead center">${esc(c.look.intro)}</p>
    <div class="pages">${c.look.pages
      .map((p) => `<figure><img src="${esc(p.src)}" alt="${esc(p.alt)}" width="800" height="1035" loading="lazy">${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ''}</figure>`)
      .join('')}</div>
  </div>
</section>
${phrase(c.phrases.afterLook)}

<!-- How it works -->
<section class="section">
  <div class="wrap narrow">
    ${heading(c.steps.title)}
    <ol class="steps">${c.steps.items.map((s) => `<li><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></li>`).join('')}</ol>
    <p class="note">${esc(c.steps.note)}</p>
  </div>
</section>

<!-- Checkout button 2 -->
<section class="section cta-section">
  <div class="wrap center">${cta(c.cta.mid.button, c.cta.mid.support, 'mid')}</div>
</section>

<!-- Trust: dietitian review, customer reviews, creator (hidden until real) -->
${review}
${testimonials}
${creator}

<!-- Fit -->
<section class="section">
  <div class="wrap narrow">
    <h2>${esc(c.fit.title)}</h2>
    <p>${esc(c.fit.intro)}</p>
    <p class="list-intro">${esc(c.fit.listIntro)}</p>
    <ul class="inside compact">${c.fit.items.map((i) => `<li>${check}<span>${esc(i)}</span></li>`).join('')}</ul>
    <p class="note">${esc(c.fit.note)}</p>
  </div>
</section>

<!-- Guarantee -->
${guarantee}

<!-- FAQ -->
<section class="section">
  <div class="wrap narrow">
    ${heading(c.faq.title)}
    <div class="faq">${faqItems.join('')}</div>
  </div>
</section>
${phrase(c.phrases.beforeFinal)}

<!-- Final offer + checkout button 3 -->
<section class="section final" id="buy">
  <div class="wrap narrow center">
    <h2>${esc(c.cta.final.title)}</h2>
    ${deco}
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
    ${p.sections.map((s) => `<h2>${esc(s.h)}</h2>${s.p.map((x) => `<p>${t(x)}</p>`).join('')}`).join('')}
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
    ${deco}
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
if (/placeholder/i.test(cfg.images.kitMockup)) blockers.add('Real kit mockup photo (images.kitMockup is still a placeholder)');
if (cfg.look.pages.some((p) => /placeholder/i.test(p.src))) blockers.add('Real previews of the Fridge Chart and a Recipe Card (look.pages are still placeholders)');
if (!cfg.delivery) blockers.add('FAQ answer: how files are delivered (delivery)');
if (cfg.guarantee.show && !cfg.guarantee.confirmedWithMerchant) blockers.add(`Confirm the ${cfg.guarantee.days}-day guarantee with the merchant of record (guarantee.confirmedWithMerchant)`);
const optional = [];
if (!cfg.testimonials.items.length) optional.push('[REAL REVIEW] customer quotes (testimonials.items): section hidden');
if (!(cfg.review.reviewerName && cfg.review.credential && cfg.review.text)) optional.push('[RD NAME, CREDENTIALS] dietitian review (review.*): section hidden');
if (!cfg.creator.paragraphs.length) optional.push('Creator introduction (creator.paragraphs): section hidden');
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
