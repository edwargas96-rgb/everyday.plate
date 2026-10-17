# The Everyday Plate: sales page

Static, mobile-first sales page (American English). No dependencies: `build.mjs` turns `site.config.mjs` into plain HTML in `dist/`.
Identity: navy `#172B4D`, action blue `#2563EB` (hover `#1D4ED8`), warm off-white `#FAF8F5`, Lora 500 + Source Sans 3 (self-hosted in `static/fonts`), 18px body, 8px radius, 56px buttons. Colors are CSS variables at the top of `src/styles.css`.

## Page order (mobile and desktop)
1 Pain ("Now what do I eat?") → 2 Product name → 3 Mockup → 4 Bonuses → 5 **first buy button** → detail → real previews → how to use → customer feedback → creator → professional review → fit → FAQ → final offer + **second buy button** → footer.
Also: `/terms/`, `/privacy/`, `/disclaimer/`, `/contact/`, `/thank-you/` (Purchase event, not indexed).

## Edit
Everything is in `site.config.mjs`.
```bash
npm run dev           # build + preview at http://localhost:3000 (shows dashed "edit slots")
npm run check         # build + scan for forbidden wording
npm run launch-check  # fails while any launch blocker is open
```
**Empty = hidden on the live page**: customer quotes, creator, professional review, delivery and refund FAQ answers, real preview pages, food photos. Fill the field and the section appears. `npm run dev` shows where each one will go.

## Images (put files in `static/`, paths start with `/`)
- `images.mockup`: PDF cover + real previews of a recipe, the 14-day calendar and a grocery list (a neutral frame shows until then).
- `previews.pages`: three readable real pages, one a complete sample recipe.
- `images.hero` (beside the opening) and `images.meals` (3-photo strip): appetizing everyday-meal photos you own or are licensed to use.
- Replace `static/og.png` (1200×630) when you have a real share image.

## Deploy on Vercel
Import this repo (framework preset: Other; `vercel.json` sets build and output). Environment variables, all optional:
`CHECKOUT_URL`, `META_PIXEL_ID`, `SITE_URL`, `SUPPORT_EMAIL`. Redeploy after changing them. Set the checkout's post-purchase redirect to `https://yourdomain.com/thank-you/`.

## Meta Pixel
`PageView` + `ViewContent` on load, `InitiateCheckout` on any buy button, `Purchase` on `/thank-you/`. Params are generic (`content_name: "14-Day Meal Plan"`): never put a health term in them or in the domain/URL.

## Guardrails
`npm run check` (also on every Vercel build) fails on: cure, reverse, treat/treatment, heal, A1C, "get off medication", "diabetes-proof", "guaranteed results", "you have prediabetes". The exact disclaimer sits by both buy buttons and in the footer. No invented testimonials, credentials or counts. Paid extras (desserts, 30-day plan) live in the checkout, not as free bonuses.

## Still needed
Checkout URL / merchant of record · refund policy and delivery answer · real mockup and preview pages · food photos · legal name, address, support email · lawyer review of Terms and Privacy and Meta's health-ads policy · (optional) verified quotes, creator intro, dietitian review once real.
