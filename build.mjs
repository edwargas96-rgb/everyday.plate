// Zero-dependency static site generator. Reads site.config.mjs, writes ./dist.
// Usage: node build.mjs
//   SHOW_DRAFT=1          shows dashed "edit slots" for sections that are still empty (npm run dev)
//   STRICT_PLACEHOLDERS=1 fails the build while any launch blocker is open (npm run launch-check)
import { mkdir, rm, cp, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
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
const PRICE_TOKEN = '\u0001'; // {price} becomes <span data-price>: $90, or $19 once the coupon is unlocked
const vars = {
  price: PRICE_TOKEN,
  listPrice: raw.price.display,
  couponPrice: raw.price.coupon.display,
  couponCode: raw.price.coupon.code,
  pieceValue: raw.price.pieceValue,
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
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replaceAll(PRICE_TOKEN, `<span data-price>${raw.price.display}</span>`);
// Escape, then turn [[placeholder]] into a visible highlighted marker.
const t = (s = '') => esc(s).replace(/\[\[(.+?)\]\]/g, '<mark class="ph" title="Placeholder: replace before launch">[$1]</mark>');
// Asset versioning: the browser can't keep an old stylesheet/script after a new deploy.
const ver = (f) => createHash('md5').update(readFileSync(path.join(root, f))).digest('hex').slice(0, 8);
const CSS_V = ver('src/styles.css');
const JS_V = ver('src/site.js');
const siteUrl = cfg.site.url.replace(/\/$/, '');
const checkoutSet = !/\[\[/.test(cfg.checkoutUrl);
const checkoutHref = checkoutSet ? cfg.checkoutUrl : '#buy';
const freeOn = cfg.freeRecipe.enabled;
const freeHref = !freeOn ? '#tear' : /\[\[/.test(cfg.freeRecipe.url) ? '#free-recipe' : cfg.freeRecipe.url;

// Edit slot: visible only in draft mode, never on the live page.
const slot = (label) => (draft ? `<div class="slot"><strong>Edit slot:</strong> ${esc(label)} <span>(hidden on the live page until filled)</span></div>` : '');

const HEART = '<svg class="heart" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path fill="currentColor" d="M12 21.2l-1.45-1.3C5.4 15.2 2 12.1 2 8.3 2 5.2 4.4 2.8 7.5 2.8c1.7 0 3.4.8 4.5 2.1 1.1-1.3 2.8-2.1 4.5-2.1 3.1 0 5.5 2.4 5.5 5.5 0 3.8-3.4 6.9-8.55 11.6z"/></svg>';
const deco = `<div class="deco" aria-hidden="true">${HEART}${HEART}${HEART}</div>`;
const phrase = (text) => `<div class="phrase"><div class="wrap">${HEART}<p>${esc(text)}</p>${HEART}</div></div>`;
const heading = (text, center = true) => `<h2${center ? ' class="center"' : ''}>${esc(text)}</h2>${center ? deco : ''}`;

// Discreet line icons, drawn in the brand blue via currentColor.
const ICONS = {
  plate: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.8"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  fridge: '<rect x="6" y="2.5" width="12" height="19" rx="2"/><path d="M6 10h12M9 6v1.5M9 13v3"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  cart: '<path d="M3 4h2.2l2.3 11h9.3l2-8H6.3"/><circle cx="9" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/>',
  recipe: '<rect x="4.5" y="3" width="15" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  tracker: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M8.5 11l1.5 1.5 3-3M8.5 17l1.5 1.5 3-3"/>',
  questions: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9.6 9.4a2.4 2.4 0 1 1 3.4 2.2c-.6.3-1 .8-1 1.4"/><path d="M12 16.2v.1"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.6a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.2.9-1.2 1.7"/><path d="M12 17v.1"/>',
  heart: '<path d="M12 20.5s-7.5-4.8-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.4-7.5 10.2-7.5 10.2z"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  gift: '<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12"/><path d="M12 8c-2.5 0-4-1-4-2.5S9.5 3 12 8zM12 8c2.5 0 4-1 4-2.5S14.5 3 12 8z"/>',
  printer: '<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/>',
};
const icon = (name, size = 28) =>
  `<svg class="ico" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
const check = '<svg class="chk" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

// ---------- shared pieces ----------
const disclaimer = (cls = '') => `<p class="disclaimer ${cls}"><strong>Disclaimer:</strong> ${esc(cfg.disclaimer)} <a href="/disclaimer/">Read more</a></p>`;

const cta = (button, support, where) => `
  <div class="cta-wrap">
    <a class="btn" href="${esc(checkoutHref)}" data-checkout data-where="${where}"><span>${esc(button)}</span></a>
    <p class="cta-note">${HEART} ${esc(support)}</p>
    <p class="mini-disc">${esc(cfg.disclaimerShort)} <a href="/disclaimer/">Full disclaimer</a></p>
  </div>`;

// What the buyer sees under a buy button: the full price, or the coupon price once it is unlocked.
const priceBox = ({ stack = false } = {}) => {
  const p = cfg.pricing;
  return `<div class="pricebox">
    ${stack && p.stack ? `<p class="stack">${esc(p.stack)}</p>` : ''}
    <div class="only-locked">
      <p class="pb-row"><span class="pb-label">${esc(p.lockedLabel)}</span> <span class="pb-big is-locked">${esc(cfg.price.coupon.display)}</span> <span class="lock-badge">${icon('lock', 14)} ${esc(p.lockedBadge)}</span></p>
      <p class="nudge"><strong>${esc(p.lockedHeadline)}</strong> ${esc(p.lockedText)} <a href="${esc(freeHref)}" data-free>${esc(p.lockedLink)}</a></p>
    </div>
    <div class="only-unlocked">
      <p class="pb-row"><s>${esc(cfg.price.display)}</s> <span class="pb-big">${esc(cfg.price.coupon.display)}</span></p>
      <p class="applied">${HEART} ${esc(p.unlockedLabel)}</p>
    </div>
  </div>`;
};

const modal = () => {
  const m = cfg.pricing.modal;
  return `<dialog id="unlock-modal" class="modal" aria-labelledby="um-title">
    <form method="dialog" class="modal-in">
      <button class="modal-x" value="close" aria-label="${esc(m.close)}">×</button>
      <div class="modal-ico">${icon('gift', 30)}</div>
      <h2 id="um-title">${esc(m.title)}</h2>
      <p>${esc(m.text)}</p>
      <a class="btn" href="${esc(freeHref)}" data-free>${esc(m.primary.toUpperCase())}</a>
      <a class="modal-skip" href="${esc(checkoutHref)}" data-continue>${esc(m.secondary)}</a>
    </form>
  </dialog>`;
};

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
    listDisplay: cfg.price.display,
    coupon: cfg.price.coupon,
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
<link rel="stylesheet" href="/styles.css?v=${CSS_V}">
${pixel}
<noscript>${pixelId ? `<img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${esc(pixelId)}&ev=PageView&noscript=1">` : ''}</noscript>
<script>window.__SITE__=${siteData};try{if(localStorage.getItem('ep_unlock')==='1')document.documentElement.classList.add('unlocked')}catch(e){}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${body}
<script src="/site.js?v=${JS_V}" defer></script>
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
const BG = { navy: '#172B4D', cream: '#FCF7EC', cream2: '#F6EDDA', tint: '#EFF4FF' };
const wave = (fill) =>
  `<svg class="wave" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 22 Q50 2 100 18 T200 18 T300 18 T400 14 V40 H0Z" fill="${fill}"/></svg>`;

// Sections get a background ('auto' alternates cream/cream2 so neighbors never match);
// every section ends with a wave painted in the NEXT section's color.
function assemble(list, lastNext) {
  const secs = list.filter(Boolean);
  secs.forEach((s, i) => {
    if (s.bg === 'auto') {
      const prev = i ? secs[i - 1].bg : null;
      s.bg = prev === 'cream' ? 'cream2' : 'cream';
    }
  });
  return secs
    .map((s, i) => {
      const nextBg = i + 1 < secs.length ? secs[i + 1].bg : lastNext;
      return `<section class="band band-${s.bg}${s.cls ? ' ' + s.cls : ''}"${s.id ? ` id="${s.id}"` : ''}>${s.html}${nextBg ? wave(BG[nextBg]) : ''}</section>`;
    })
    .join('\n');
}
const hl = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<em>$1</em>');

const RAYS = `<svg class="rays" viewBox="0 0 400 400" aria-hidden="true"><g stroke="#93B4F8" stroke-width="3" stroke-linecap="round" opacity=".5">${Array.from({ length: 16 }, (_, i) => {
  const a = (i * Math.PI) / 8;
  return `<line x1="${(200 + Math.cos(a) * 90).toFixed(1)}" y1="${(200 + Math.sin(a) * 90).toFixed(1)}" x2="${(200 + Math.cos(a) * 190).toFixed(1)}" y2="${(200 + Math.sin(a) * 190).toFixed(1)}"/>`;
}).join('')}</g></svg>`;
const ALERT = '<svg class="alert" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.4v.1"/></svg>';
const SHIELD = '<svg class="shield" viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5L16 9.5"/></svg>';
const NEWS = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h13v14H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v9a2 2 0 0 1-2 2"/><path d="M7.5 9h6M7.5 12.5h6M7.5 16h3"/></svg>';

// "A look inside": endless auto-scrolling carousel. Two identical groups give a seamless loop;
// site.js moves it, and visitors can still swipe or drag it in both directions.
const slideHtml = (p, i, dup) =>
  `<article class="carousel-slide"><div class="cover"><img src="${esc(p.src)}" alt="${dup ? '' : esc(p.alt)}" width="800" height="1036" loading="${!dup && i < 2 ? 'eager' : 'lazy'}" decoding="async" draggable="false"><span class="num">${i + 1}</span></div><div class="piece-body"><h3>${esc(p.title)}</h3><p class="val">${esc(cfg.price.pieceValue)} value</p><p>${esc(p.text)}</p></div></article>`;
const carousel = (items) => `<div class="preview-carousel" role="region" aria-roledescription="carousel" aria-label="${esc(cfg.inside.title)}">
  <div class="carousel-track">
    <div class="carousel-group">${items.map((p, i) => slideHtml(p, i, false)).join('')}</div>
    <div class="carousel-group" aria-hidden="true">${items.map((p, i) => slideHtml(p, i, true)).join('')}</div>
  </div>
</div>
<div class="car-tools"><button type="button" class="car-pause" data-pause aria-label="Pause the moving carousel"><svg class="i-pause" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg><svg class="i-play" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg></button><span>Swipe to look around</span></div>`;

function home() {
  const c = cfg;
  const freeSet = !freeOn || !/\[\[/.test(c.freeRecipe.url);

  const hookVariant = (v, tag) => {
    const h = c.hook[v];
    const title = tag === 'h1' ? `<h1>${hl(h.line)}</h1>` : `<div class="h1" role="heading" aria-level="1">${hl(h.line)}</div>`;
    return `<div class="hook-copy" data-v="${v}"${v === 'b' ? ' hidden' : ''}>
      <p class="kicker">${ALERT}<span>${esc(h.kicker)}</span></p>
      ${title}
      <p class="hook-sub">${esc(h.sub)}</p>
    </div>`;
  };

  const mealsStrip = c.images.meals.length
    ? `<div class="strip">${c.images.meals.map((m) => `<img src="${esc(m.src)}" alt="${esc(m.alt)}" width="600" height="450" loading="lazy">`).join('')}</div>`
    : slot('everyday-meal photos (images.meals)');

  const ctaBand = (c2, where, title) => `<div class="wrap narrow center"><div class="cta-card"><h2>${esc(title)}</h2>${deco}${priceBox()}${cta(c2.button, c2.support, where)}</div></div>`;

  const testimonials = c.testimonials.items.length
    ? {
        bg: 'auto',
        html: `<div class="wrap narrow">${heading(c.testimonials.title)}${c.testimonials.items
          .map((q) => `<figure class="quote"><blockquote><p>${esc(q.quote)}</p></blockquote><figcaption>${esc(q.name)}${q.disclosure ? `<span>${esc(q.disclosure)}</span>` : ''}</figcaption></figure>`)
          .join('')}</div>`,
      }
    : draft
      ? { bg: 'auto', html: `<div class="wrap narrow">${slot('[REAL REVIEW]: verified customer quote(s) (testimonials.items)')}</div>` }
      : null;

  const creator = c.creator.paragraphs.length
    ? {
        bg: 'auto',
        html: `<div class="wrap narrow"><div class="person">${c.creator.photo ? `<img class="avatar" src="${esc(c.creator.photo)}" alt="${esc(c.creator.photoAlt)}" width="120" height="120" loading="lazy">` : ''}<div><h2>${esc(c.creator.title)}</h2>${c.creator.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</div></div></div>`,
      }
    : draft
      ? { bg: 'auto', html: `<div class="wrap narrow">${slot('who created the kit, factual (creator.paragraphs)')}</div>` }
      : null;

  const r = c.review;
  const review = r.reviewerName && r.credential && r.text
    ? {
        bg: 'auto',
        html: `<div class="wrap narrow"><div class="person trust">${r.photo ? `<img class="avatar" src="${esc(r.photo)}" alt="${esc(r.reviewerName)}" width="120" height="120" loading="lazy">` : '<div class="seal" aria-hidden="true">RD</div>'}<div><h2>${esc(r.title)}</h2><p><strong>${esc(r.reviewerName)}</strong>, ${esc(r.credential)}</p><p>${esc(r.text)}</p></div></div></div>`,
      }
    : draft
      ? { bg: 'auto', html: `<div class="wrap narrow">${slot('Reviewed by a Registered Dietitian: [RD NAME, CREDENTIALS] (review.*), only once the review is real and finished')}</div>` }
      : null;

  const faqItems = c.faq.items
    .filter((f) => f.a.trim() || draft)
    .map((f) => (f.a.trim() ? `<details><summary>${esc(f.q)}</summary><p>${t(f.a)}</p></details>` : `<div class="faq-slot">${slot(`answer for “${f.q}”`)}</div>`));

  const sections = [
    // 1. HOOK, before everything else
    {
      bg: 'navy',
      cls: 'hook',
      html: `${RAYS}<div class="wrap center hook-wrap">${hookVariant('a', 'h1')}${hookVariant('b', 'div')}<a class="down" href="#showcase" aria-label="Keep reading"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></a></div>`,
    },
    // 2. LOGO + 3. the deliverable
    {
      bg: 'cream',
      cls: 'showcase',
      id: 'showcase',
      html: `<div class="wrap center">
        <a class="logo-link" href="/" aria-label="${esc(c.site.brand)}">${logo('logo logo-xl')}</a>
        <div class="stage">
          <span class="badge b1">${HEART} Digital PDF</span>
          <img class="mockup" src="${esc(c.images.kitMockup)}" alt="${esc(c.images.kitMockupAlt)}" width="${c.images.kitMockupSize[0]}" height="${c.images.kitMockupSize[1]}" fetchpriority="high">
          <span class="badge b2">${HEART} Print at home</span>
        </div>
        <p class="eyebrow">${esc(c.meet.eyebrow)}</p>
        <h2 class="product">${esc(c.meet.name)}</h2>
        <p class="subtitle">${esc(c.meet.subtitle)}</p>
        <p class="for-line">${esc(c.meet.forLine)}</p>
        <p class="promise">${esc(c.meet.promise)}</p>
        <ul class="chips">${c.meet.chips.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>`,
    },
    // Tear-the-page intro: name the pain first, then reveal the kit
    {
      bg: 'navy',
      cls: 'tear-band',
      html: `${RAYS}<div class="wrap narrow center">
        <h2>${esc(c.tear.title)}</h2>
        <div class="tear" id="tear">
          <ol class="sheets">${c.tear.sheets.map((x) => `<li class="sheet"><div class="half l"><span>${esc(x)}</span></div><div class="half r" aria-hidden="true"><span>${esc(x)}</span></div></li>`).join('')}</ol>
          <p class="tear-hint" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v14M6 12l6 6 6-6"/></svg> ${esc(c.tear.hint)}</p>
          <div class="cta-card congrats tear-done" id="tear-reveal" hidden>
            <div class="party" aria-hidden="true">${HEART}${HEART}${HEART}</div>
            <h2>${esc(c.tear.reveal.title)}</h2>${deco}
            <p class="lead-c">${esc(c.tear.reveal.text)}</p>
            <div class="code-box"><span class="code-label">${esc(c.tear.reveal.codeLabel)}</span><strong class="code">${esc(cfg.price.coupon.code)}</strong><button type="button" class="copy-btn" data-copy="${esc(cfg.price.coupon.code)}" data-copied="${esc(c.tear.reveal.copied)}">${esc(c.tear.reveal.copy)}</button></div>
            <p>${esc(c.tear.reveal.active)}</p>
            <p class="pb-row"><s>${esc(cfg.price.display)}</s> <span class="pb-big">${esc(cfg.price.coupon.display)}</span></p>
            ${cta(c.tear.reveal.cta, c.tear.reveal.support, 'tear')}
            <p class="back"><a href="#look">${esc(c.tear.reveal.link)}</a></p>
          </div>
          <a class="tear-skip" href="#look">${esc(c.tear.skip)}</a>
        </div>
      </div>`,
    },
    // 4b. A look inside: the six covers with a short synopsis of each (replaces the old "What's in the kit")
    {
      bg: 'cream',
      id: 'look',
      html: `<div class="wrap">${heading(c.inside.title)}<p class="lead center">${esc(c.inside.intro)}</p>${carousel(c.inside.items)}<div class="deal">${priceBox({ stack: true })}${cta(c.cta.first.button, c.cta.first.support, 'look')}</div><p class="hand center">${HEART} ${esc(c.phrases.afterLook)} ${HEART}</p></div>`,
    },
    // free recipe button (paused)
    ...(!freeOn ? [] : [{
      bg: 'tint',
      cls: 'free-band',
      html: `<div class="wrap narrow center">
        <div class="free">
          <a class="btn btn-ghost" href="${esc(freeHref)}" data-free>${esc(c.freeRecipe.button)}</a>
          <p class="cta-note">${HEART} ${esc(c.freeRecipe.support)}</p>
        </div>
      </div>`,
    }]),
    // News
    {
      bg: 'tint',
      html: `<div class="wrap narrow center">
        <article class="news">
          <header class="news-top"><span class="news-label">${NEWS} ${esc(c.news.label)}</span><span class="news-src">${esc(c.news.source)}</span></header>
          <h2>${esc(c.news.headline)}</h2>
          <p class="big-num">${esc(c.news.bigNumber)}</p>
          <p class="big-text">${esc(c.news.bigText)}</p>
          <p class="second"><strong>${esc(c.news.secondNumber)}</strong> ${esc(c.news.secondText)}</p>
          <p class="news-note">${esc(c.news.note)}</p>
          <p class="cite"><a href="${esc(c.news.citeUrl)}" target="_blank" rel="noopener nofollow">${esc(c.news.cite)}</a></p>
        </article>
      </div>`,
    },
    // 8. Buy button 1
    { bg: 'tint', cls: 'cta-band', html: ctaBand(c.cta.first, 'first', c.cta.first.title) },
    // 9. Print what you need
    {
      bg: 'cream2',
      html: `<div class="wrap narrow center"><div class="print-card"><div class="print-ico">${icon('printer', 34)}</div><h2>${esc(c.print.title)}</h2><p class="lead">${esc(c.print.text)}</p><ul class="chips">${c.print.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div><div class="wrap">${mealsStrip}</div>`,
    },
    // 11. How it works
    {
      bg: 'navy',
      cls: 'steps-band',
      html: `${RAYS}<div class="wrap narrow"><h2 class="center">${esc(c.steps.title)}</h2>${deco}<ol class="steps">${c.steps.items
        .map((s) => `<li><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></li>`)
        .join('')}</ol><p class="note">${esc(c.steps.note)}</p></div>`,
    },
    // 11b. The approach behind the kit
    {
      bg: 'auto',
      id: 'approach',
      html: `<div class="wrap">${heading(c.approach.title)}<p class="lead center narrow-p">${esc(c.approach.intro)}</p>
        <div class="approach">${c.approach.items
          .map((p) => `<article class="ap-card"><div class="ap-ico">${icon(p.icon, 26)}</div><div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div></article>`)
          .join('')}</div>
        <div class="sources"><h3>${esc(c.approach.sourcesTitle)}</h3><ul>${c.approach.sources
          .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener nofollow">${esc(s.name)}</a></li>`)
          .join('')}</ul><p class="small">${esc(c.approach.note)}</p></div></div>`,
    },
    // 12. Buy button 2
    { bg: 'auto', cls: 'cta-band', html: ctaBand(c.cta.mid, 'mid', c.cta.mid.title) },
    // 13. Trust (hidden until real)
    review,
    testimonials,
    creator,
    // 14. Fit
    {
      bg: 'auto',
      html: `<div class="wrap"><h2 class="center">${esc(c.fit.title)}</h2>${deco}<p class="lead center narrow-p">${esc(c.fit.intro)}</p>
        <div class="two">
          <div class="panel yes"><span class="p-ico">${check}</span><h3>${esc(c.fit.listIntro)}</h3><ul>${c.fit.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>
          <div class="panel no"><span class="p-ico x" aria-hidden="true">×</span><h3>${esc(c.fit.notTitle)}</h3><ul>${c.fit.notItems.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>
        </div><p class="note narrow-p">${esc(c.fit.note)}</p></div>`,
    },
    // 15. Guarantee
    c.guarantee.show
      ? {
          bg: 'navy',
          cls: 'guarantee-band',
          html: `<div class="wrap narrow center">${SHIELD}<h2>${esc(c.guarantee.title)}</h2><p>${esc(c.guarantee.text)}</p></div>`,
        }
      : null,
    // 16. FAQ
    { bg: 'cream', html: `<div class="wrap narrow">${heading(c.faq.title)}<div class="faq">${faqItems.join('')}</div></div>` },
    // 17. Free-recipe placeholder (only while the sign-up is not set up) 
    !freeSet
      ? { bg: 'cream2', id: 'free-recipe', html: `<div class="wrap narrow center"><p class="ph-box"><mark class="ph">FREE_RECIPE_URL not set. The “${esc(c.freeRecipe.button)}” button has nowhere to go yet.</mark></p></div>` }
      : null,
    // 18. Final offer + buy button 3
    {
      bg: 'tint',
      id: 'buy',
      cls: 'final',
      html: `<div class="wrap narrow center"><div class="cta-card">
        <p class="hand">${HEART} ${esc(c.phrases.beforeFinal)} ${HEART}</p>
        <h2>${esc(c.cta.final.title)}</h2>${deco}
        <p class="final-lines">${c.cta.final.lines.map((l) => `<span>${esc(l)}</span>`).join('')}</p>
        ${priceBox()}
        ${cta(c.cta.final.button, c.cta.final.support, 'final')}
        ${checkoutSet ? '' : '<p class="ph-box"><mark class="ph">CHECKOUT_URL not set. Buttons do not go anywhere yet.</mark></p>'}
      </div></div>`,
    },
  ];

  const body = `
<main id="main">
${assemble(sections, 'navy')}
</main>
${footer()}
${modal()}`;
  return layout({ title: c.seo.title, description: c.seo.description, path: '/', body, page: 'home' });
}

// ---------- free recipe page: opening it unlocks the coupon ----------
function recipePage() {
  const r = cfg.recipePage;
  const rv = r.reveal;
  const cf = r.confirm;
  const list = (items) => `<ul>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const sections = [
    {
      bg: 'navy',
      cls: 'recipe-hero',
      html: `${RAYS}<div class="wrap center hook-wrap">
        <p class="kicker">${HEART}<span>${esc(r.kicker)}</span></p>
        <h1>${esc(r.title)}</h1>
        <p class="hook-sub">${esc(r.sub)}</p>
        <ul class="chips on-navy">${r.facts.map((f) => `<li><strong>${esc(f.k)}</strong> ${esc(f.v)}</li>`).join('')}</ul>
      </div>`,
    },
    {
      bg: 'cream',
      cls: 'recipe-body',
      html: `<div class="wrap narrow">
        <figure class="dish"><img src="${esc(r.image)}" alt="${esc(r.imageAlt)}" width="${r.imageSize[0]}" height="${r.imageSize[1]}" fetchpriority="high"></figure>
        <div class="recipe-grid">
          <div class="r-card"><h2>${esc(r.ingredientsTitle)}</h2>${list(r.ingredients)}<h3>${esc(r.serveTitle)}</h3>${list(r.serve)}</div>
          <div class="r-card"><h2>${esc(r.stepsTitle)}</h2><ol class="r-steps">${r.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
        </div>
        <div class="r-card tips"><h3>${esc(r.tipsTitle)}</h3>${list(r.tips)}${r.nutrition ? `<p class="small">${esc(r.nutrition)}</p>` : ''}</div>
      </div>`,
    },
    {
      bg: 'tint',
      cls: 'reveal',
      html: `<div class="wrap narrow center">
        <form class="cta-card confirm" id="confirm-form" novalidate>
          <div class="modal-ico">${icon('check', 30)}</div>
          <h2>${esc(cf.title)}</h2>${deco}
          <p>${esc(cf.text)}</p>
          <fieldset class="choices"><legend>${esc(cf.likelyTitle)}</legend>${cf.likely.map((x, i) => `<label class="choice"><input type="radio" name="likely" value="${i}" required><span>${esc(x)}</span></label>`).join('')}</fieldset>
          <fieldset class="choices"><legend>${esc(cf.thinkTitle)}</legend>${cf.think.map((x, i) => `<label class="choice"><input type="radio" name="think" value="${i}" required><span>${esc(x)}</span></label>`).join('')}</fieldset>
          <p class="form-error" id="confirm-error" hidden>Please pick an answer for each question.</p>
          <button class="btn" type="submit">${esc(cf.button)}</button>
          <p class="cta-note">${HEART} ${esc(cf.note)}</p>
        </form>
        <div class="cta-card congrats" id="congrats" hidden>
          <div class="party" aria-hidden="true">${HEART}${HEART}${HEART}</div>
          <h2>${esc(rv.title)}</h2>${deco}
          <p class="lead-c">${esc(rv.text)}</p>
          <div class="code-box"><span class="code-label">${esc(rv.codeLabel)}</span><strong class="code" id="coupon-code">${esc(cfg.price.coupon.code)}</strong><button type="button" class="copy-btn" data-copy="${esc(cfg.price.coupon.code)}" data-copied="${esc(rv.copied)}">${esc(rv.copy)}</button></div>
          <p>${esc(rv.active)}</p>
          <p class="pb-row"><s>${esc(cfg.price.display)}</s> <span class="pb-big">${esc(cfg.price.coupon.display)}</span></p>
          ${cta(rv.cta, rv.support, 'recipe')}
          <p class="bonus">${HEART} ${esc(rv.bonus)}</p>
          <p class="back"><a href="/">${esc(rv.back)}</a></p>
        </div>
      </div>`,
    },
  ];
  const body = `
${header()}
<main id="main">
${assemble(sections, 'navy')}
</main>
${footer()}`;
  return layout({ title: r.seoTitle, description: r.seoDescription, path: '/free-recipe/', body, page: 'free-recipe' });
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
  ...(freeOn ? [['free-recipe/index.html', recipePage()]] : []),
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
  const urls = ['/', ...(freeOn ? ['/free-recipe/'] : []), '/terms/', '/privacy/', '/disclaimer/', '/contact/'];
  await writeFile(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${siteUrl}${u}</loc></url>`).join('\n')}\n</urlset>\n`,
  );
}

// ---------- launch readiness ----------
const blockers = new Set();
for (const [, html] of pages) for (const m of html.matchAll(/<mark class="ph"[^>]*>\[(.+?)\]<\/mark>/g)) blockers.add(m[1]);
if (!checkoutSet) blockers.add('CHECKOUT_URL');
if (!cfg.price.coupon.confirmedWithMerchant) blockers.add(`Checkout: product at ${cfg.price.display}, coupon ${cfg.price.coupon.code} = ${cfg.price.coupon.display}, and its URL parameter (price.coupon.param); then set confirmedWithMerchant`);
if (freeOn && /\[\[/.test(cfg.freeRecipe.url)) blockers.add('FREE_RECIPE_URL (where the free recipe button goes)');
for (const [k, v] of Object.entries(cfg.pages)) if (v.draft) blockers.add(`Attorney review of the ${k} page`);
if (/placeholder/i.test(cfg.images.kitMockup)) blockers.add('Kit mockup image (images.kitMockup is still a placeholder)');
if (cfg.inside.items.some((p) => /placeholder/i.test(p.src))) blockers.add('Cover images (inside.items are still placeholders)');
if (!cfg.approach.confirmed) blockers.add('Approach section: confirm it matches the final kit and have the dietitian review it (approach.confirmed)');
if (!cfg.delivery) blockers.add('FAQ answer: how files are delivered (delivery)');
if (cfg.guarantee.show && !cfg.guarantee.confirmedWithMerchant) blockers.add(`Confirm the ${cfg.guarantee.days}-day guarantee with the merchant of record (guarantee.confirmedWithMerchant)`);
const optional = [];
if (!cfg.testimonials.items.length) optional.push('[REAL REVIEW] customer quotes (testimonials.items): section hidden');
if (!(cfg.review.reviewerName && cfg.review.credential && cfg.review.text)) optional.push('[RD NAME, CREDENTIALS] dietitian review (review.*): section hidden');
if (!cfg.creator.paragraphs.length) optional.push('Creator introduction (creator.paragraphs): section hidden');
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
