# The Everyday Plate: sales page (printable kit)

Static, mobile-first sales page (American English) for **The Everyday Plate, the 14-Day Printable Kit**: 6 printable PDF pieces (US Letter). No dependencies: `build.mjs` turns `site.config.mjs` into plain HTML in `dist/`.
Look: cream background, navy `#172B4D` + action blue `#2563EB`, hearts and short encouraging phrases (Caveat), Lora 500 + Source Sans 3 (self-hosted), logo in `static/images/logo.webp`. Colors are CSS variables at the top of `src/styles.css`.

## Page order (top to bottom)
1. **Hook** (navy band, very first thing, above the logo): "Heard “prediabetes” and left with zero idea what to eat?" · B version: `/?v=b`
2. **Logo + the deliverable** (kit mockup, badges, name, promise)
3. **U.S. news card** (CDC data: 115.2 million adults; 31.3 million age 65+) + **GET A FREE RECIPE** button (`freeRecipe.url` / `FREE_RECIPE_URL`; flow to be structured later)
4. **A look inside**: endless auto-scrolling carousel of the 6 covers (same base as the Active Tu Ingles mind-map carousel): it moves by itself, swipe/drag works both ways, a touch holds it for a moment, a tap or the pause button stops it; off with reduced-motion
5. **Pain** (shorter, with a dinner photo; "Sound familiar?" cards, "Now what do I eat?") → **buy button 1** → Print what you need → How it works → **The approach behind the kit** (plate method, carbs and fiber, small habits, care team; sources: ADA, NIDDK/DPP, CDC National DPP) → **buy button 2**
6. Dietitian review / customer reviews / creator (hidden until real)
7. Is this kit a good fit? (for / not for) → guarantee → FAQ → final offer → **buy button 3** → footer
Pages: `/terms/`, `/privacy/`, `/disclaimer/`, `/contact/`, `/thank-you/` (Purchase event, not indexed).
Sections are colored bands joined by wave dividers; colors alternate automatically, so adding or hiding a section never breaks the rhythm.

## Price and the HEALTH coupon
- Full price **$90** (6 pieces × $15). Reading the free recipe (`/free-recipe/`) and confirming it unlocks coupon **HEALTH**: **$19.90**. At the end of the recipe the visitor ticks "I read the recipe", picks how likely they are to make it and what they think of it, then sees a congratulations message with the code. Answers stay on the device (nothing is sent). The unlock is saved in that browser (`localStorage`), so every price on the site switches to $19.90 with $90 crossed out.
- Buying before opening the recipe: the buy button opens a suggestion ("your free recipe is waiting": coupon + one more dish on the menu). "No thanks, continue at $90" goes to the normal checkout.
- Unlocked buyers are sent to the checkout with `?coupon=HEALTH` (`price.coupon.param`). **In your checkout (merchant of record)** create the product at $90 and the coupon HEALTH = $19.90, confirm the URL parameter that applies it, then set `price.coupon.confirmedWithMerchant: true`. Buyers can also type the code (a copy button is on the recipe page).
- All numbers and texts: `price` and `pricing` in `site.config.mjs`. The free recipe itself: `recipePage`.

## Edit
Everything is in `site.config.mjs` (variables `{price} {brand} {days}` work inside any text).
```bash
npm run dev           # build + preview at http://localhost:3000 (shows dashed "edit slots")
npm run check         # build + scan for forbidden wording
npm run launch-check  # fails while any launch blocker is open
```
**Empty = hidden on the live page**: `[REAL REVIEW]` customer quotes, `[RD NAME, CREDENTIALS]` dietitian review, creator, delivery answer, food photos.

## Images (files in `static/`, paths start with `/`)
In use now: `kit-mockup.webp` (the kit on the kitchen table) and three covers in `static/images/` (Fridge Chart, 14-Day Meal Plan, Weekly Grocery Lists). Swap them in `images.kitMockup` and `look.pages`. Keep the pictures faithful to the real product.
Optional: `images.meals` (everyday-meal photo strip) and `static/og.png` (1200×630 share image).

## Deploy on Vercel
Import this repo (framework preset: Other; `vercel.json` sets build and output). Optional environment variables: `CHECKOUT_URL`, `FREE_RECIPE_URL` (default `/free-recipe/`), `META_PIXEL_ID`, `SITE_URL`, `SUPPORT_EMAIL`. Redeploy after changing them. Checkout's post-purchase redirect: `https://yourdomain.com/thank-you/`.

## Meta Pixel
`PageView` + `ViewContent` (with a generic `headline_variant`) on load, `Lead` on the free recipe button, `InitiateCheckout` on any buy button, `Purchase` on `/thank-you/`. Params are generic (`content_name: "14-Day Printable Kit"`): never put a health term in them or in the domain/URL.

## Guardrails
`npm run check` (also on every Vercel build) fails on: cure, reverse, treat, heal, A1C, guaranteed, reset, fix, solution, control, ebook, "get off medication", "diabetes-proof", "you have prediabetes", the old brand names, "The Everyday Plate" spelling, the hook must stay above the logo. A short line ("Educational information only, not medical advice" + link) sits under every buy button; the full disclaimer is in the footer and on `/disclaimer/`. No invented reviews, credentials or counts.
