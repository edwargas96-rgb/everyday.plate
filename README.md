# The Every Day Plate: sales page (printable kit)

Static, mobile-first sales page (American English) for **The Every Day Plate, the 14-Day Printable Kit**: 6 printable PDF pieces (US Letter). No dependencies: `build.mjs` turns `site.config.mjs` into plain HTML in `dist/`.
Look: cream background, navy `#172B4D` + action blue `#2563EB`, hearts and short encouraging phrases (Caveat), Lora 500 + Source Sans 3 (self-hosted), logo in `static/images/logo.webp`. Colors are CSS variables at the top of `src/styles.css`.

## Page order
Pain ("Now what do I eat?") → encouragement → product name + promise + kit mockup → What's in the kit (6 pieces) → **button 1** → Print what you need → A look inside (2 previews) → How it works → **button 2** → dietitian review / customer reviews / creator (hidden until real) → Is this kit a good fit? → guarantee → FAQ → final offer + **button 3** → footer.
Pages: `/terms/`, `/privacy/`, `/disclaimer/`, `/contact/`, `/thank-you/` (Purchase event, not indexed).
Headline B: open `/?v=b` (shows "Know exactly what to eat, buy and do every day, so you stop guessing."). Edit both in `headline` in the config.

## Edit
Everything is in `site.config.mjs` (variables `{price} {brand} {days}` work inside any text).
```bash
npm run dev           # build + preview at http://localhost:3000 (shows dashed "edit slots")
npm run check         # build + scan for forbidden wording
npm run launch-check  # fails while any launch blocker is open
```
**Empty = hidden on the live page**: `[REAL REVIEW]` customer quotes, `[RD NAME, CREDENTIALS]` dietitian review, creator, delivery answer, food photos.

## Images (files in `static/`, paths start with `/`)
Placeholders to replace (they are clearly labeled and count as launch blockers):
- `images.kitMockup`: printed kit on the kitchen table + chart on the fridge (`/images/placeholder-kit-mockup.svg`)
- `look.pages`: Fridge Chart and one Recipe Card previews (`/images/placeholder-fridge-chart.svg`, `/images/placeholder-recipe-card.svg`)
- Optional: `images.hero`, `images.meals` (everyday-meal photos), `static/og.png` (1200×630 share image)

## Deploy on Vercel
Import this repo (framework preset: Other; `vercel.json` sets build and output). Optional environment variables: `CHECKOUT_URL`, `META_PIXEL_ID`, `SITE_URL`, `SUPPORT_EMAIL`. Redeploy after changing them. Checkout's post-purchase redirect: `https://yourdomain.com/thank-you/`.

## Meta Pixel
`PageView` + `ViewContent` (with a generic `headline_variant`) on load, `InitiateCheckout` on any buy button, `Purchase` on `/thank-you/`. Params are generic (`content_name: "14-Day Printable Kit"`): never put a health term in them or in the domain/URL.

## Guardrails
`npm run check` (also on every Vercel build) fails on: cure, reverse, treat, heal, A1C, guaranteed, reset, fix, solution, control, ebook, "get off medication", "diabetes-proof", "you have prediabetes", the old brand names, "The Everyday Plate" spelling, "prediabetes" outside the FAQ. The exact disclaimer sits by all three buy buttons and in the footer. No invented reviews, credentials or counts.
