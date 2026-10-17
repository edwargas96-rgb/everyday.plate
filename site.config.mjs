// =====================================================================
//  ALL page copy, prices, images and links live in THIS file.
//  Edit here, run `npm run build`, deploy. No need to touch build.mjs or CSS.
//
//  Variables you can use inside any text: {price} (live: $90, or $19 once the coupon is unlocked)
//  {listPrice} {couponPrice} {couponCode} {brand} {days}
//  {legalName} {supportEmail} {year}
//
//  EMPTY = HIDDEN. Customer reviews, the dietitian review, the creator
//  intro, delivery answer and refund policy stay off the public page while
//  empty. `npm run dev` shows dashed "edit slots" for them ([REAL REVIEW],
//  [RD NAME, CREDENTIALS]...) so you can see where they will appear.
//
//  Images pointing to a file with "placeholder" in its name are clearly
//  marked placeholders and count as launch blockers.
//
//  "[[ ... ]]" = visible placeholder (business identity, legal drafts).
//  `npm run launch-check` lists everything open and fails until resolved.
//
//  COMPLIANCE: no clinical promises, no suggestion to change medication,
//  no unverified credentials, no invented social proof. `npm run check`
//  scans the built pages for forbidden wording.
// =====================================================================

const env = process.env;

export default {
  // ---------- Business / links ----------
  site: {
    brand: 'The Everyday Plate', // always written exactly like this: "The Everyday Plate" (one word)
    productName: 'The Everyday Plate',
    productSubtitle: 'The 14-Day Printable Kit: Easy Meals, Grocery Lists & Daily Habits',
    url: env.SITE_URL || (env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + env.VERCEL_PROJECT_PRODUCTION_URL : ''), // set SITE_URL to your own domain
    supportEmail: env.SUPPORT_EMAIL || '[[support@yourdomain.com]]',
    legalName: '[[Legal business name]]',
    legalAddress: '[[Business mailing address]]',
    effectiveDate: 'October 2026',
  },
  logo: { src: '/images/logo.webp', width: 900, height: 237 },

  // ---------- Price & checkout ----------
  // Full price is what a buyer pays WITHOUT the coupon (6 pieces x $15). Opening the free recipe
  // unlocks the coupon. Create both in your checkout: the product at the full price + the coupon code.
  price: {
    currency: 'USD',
    amount: 90,
    display: '$90',
    pieceValue: '$15',
    coupon: { code: 'HEALTH', amount: 19, display: '$19', param: 'coupon', confirmedWithMerchant: false },
  },
  // Merchant-of-record checkout link (or set the CHECKOUT_URL env var in Vercel).
  // The $7 low-sugar snacks bump is a checkbox at checkout, not on this page.
  checkoutUrl: env.CHECKOUT_URL || '[[CHECKOUT_URL]]',
  passQueryToCheckout: true, // forwards utm_* and fbclid to the checkout link

  // ---------- Meta Pixel (empty = not loaded) ----------
  tracking: {
    metaPixelId: env.META_PIXEL_ID || '',
    contentName: '14-Day Printable Kit', // generic on purpose: never a health term
  },

  // ---------- Required disclaimer (exact text) ----------
  disclaimer:
    'Educational information only. Not medical advice. Talk to your doctor or a registered dietitian before changing your diet, especially if you take medication or have a medical condition.',

  // Short line shown under every buy button. The full text lives in the footer and on /disclaimer/.
  disclaimerShort: 'Educational information only, not medical advice.',

  seo: {
    title: 'The Everyday Plate | The 14-Day Printable Kit: Easy Meals, Grocery Lists & Daily Habits',
    description:
      'A 14-day printable meal-planning kit for adults who’ve heard the word prediabetes: fridge chart, meal plan, grocery lists, 30 recipe cards and a tracker. Instant PDF download.',
    ogImage: '/og.png',
  },

  // ---------- Images (files go in static/, paths start with "/") ----------
  images: {
    // The kit on the kitchen table (illustrative image). Swap it for a real photo whenever you have one.
    kitMockup: '/images/kit-mockup.webp',
    kitMockupSize: [1536, 1024], // width, height of the file above
    kitMockupAlt: 'The printed kit on a kitchen table, with the fridge chart on the refrigerator',
    // Optional appetizing everyday-meal photos (3-photo strip). Empty = hidden.
    meals: [
      // { src: '/meal-1.jpg', alt: 'Describe the dish' },
    ],
  },

  // ---------- 1. HOOK (very first thing on the page, above the logo) ----------
  // **double asterisks** = highlighted words. Default is A. Open the page with ?v=b to see B.
  // A is aggressive on purpose. B is the softer version if an ad platform or a reviewer pushes back.
  hook: {
    a: {
      kicker: 'Prediabetes warning',
      line: 'Heard “prediabetes” and left with **zero idea** what to eat?',
      sub: 'Stop guessing. Know exactly what to eat, buy and do every day.',
    },
    b: {
      kicker: 'Prediabetes and your plate',
      line: 'Another grocery trip… and still no answer to **“Now what do I eat?”**',
      sub: 'Stop guessing. Know exactly what to eat, buy and do every day.',
    },
  },

  // ---------- 4. Prediabetes in the U.S. (news-style card, real CDC data only) ----------
  news: {
    label: 'U.S. health news',
    source: 'CDC data',
    headline: 'Prediabetes in America',
    bigNumber: '115.2 million',
    bigText: 'U.S. adults are estimated to have prediabetes.',
    secondNumber: '31.3 million',
    secondText: 'of them are age 65 or older.',
    note: 'Many people don’t know they are in this group, and many are left asking the same question: what do I eat?',
    cite: 'Source: CDC, National Diabetes Statistics Report',
    citeUrl: 'https://www.cdc.gov/diabetes/php/data-research/index.html',
  },

  // ---------- 5. Free recipe button + the recipe page (/free-recipe/) ----------
  // Opening /free-recipe/ unlocks the coupon on that device (saved in the browser).
  // The free-recipe flow is paused: set enabled:true to bring back the button, the /free-recipe/ page and its sitemap entry.
  freeRecipe: {
    enabled: false,
    button: 'GET A FREE RECIPE',
    support: 'Read it, tell us what you think and a special surprise discount is waiting for you.',
    url: env.FREE_RECIPE_URL || '/free-recipe/',
  },
  recipePage: {
    seoTitle: 'Free Recipe: Chicken Fajita Skillet | The Everyday Plate',
    seoDescription: 'A free, simple chicken fajita skillet from The Everyday Plate. Ready in 30 minutes with regular grocery-store ingredients.',
    kicker: 'Your free recipe',
    title: 'Chicken Fajita Skillet',
    sub: 'One pan, color on the plate and dinner on the table in about 30 minutes.',
    image: '/images/free-recipe-fajitas-square.webp',
    imageAlt: 'A black skillet of sliced chicken fajitas with red, yellow and green bell peppers and onions, with lime wedges, pico de gallo, tortillas and avocado nearby',
    imageSize: [900, 900],
    facts: [
      { k: 'Prep', v: '15 min' },
      { k: 'Cook', v: '15 min' },
      { k: 'Serves', v: '4' },
    ],
    ingredientsTitle: 'What you need',
    ingredients: [
      '1½ lb (680 g) boneless, skinless chicken breasts, sliced into thin strips',
      '3 bell peppers (a mix of red, yellow and green), sliced',
      '1 medium onion, cut into half-moons',
      '2 tbsp olive oil, divided',
      '2 tsp chili powder',
      '1 tsp ground cumin',
      '1 tsp smoked paprika',
      '1 tsp garlic powder',
      '½ tsp salt and ¼ tsp black pepper',
      '1 lime: juice of half, the rest in wedges for serving',
    ],
    serveTitle: 'To serve',
    serve: ['Warm corn or whole-wheat tortillas', 'Pico de gallo', 'Sliced avocado', 'Plain Greek yogurt or sour cream', 'Fresh cilantro'],
    stepsTitle: 'How to make it',
    steps: [
      'Stir the chili powder, cumin, paprika, garlic powder, salt and pepper together. Toss the chicken with 1 tbsp of the oil, the spice mix and the juice of half the lime. Let it sit while you slice the vegetables.',
      'Heat a large skillet (cast iron works well) over medium-high heat. Cook the chicken in a single layer, in two batches if needed, 3 to 4 minutes per side until browned and cooked through (165°F / 74°C). Move it to a plate.',
      'Add the remaining oil to the same pan. Cook the peppers and onion, stirring now and then, for 5 to 6 minutes, until tender with a few browned edges. A splash of water helps lift the browned bits from the pan.',
      'Return the chicken to the skillet, squeeze in a little lime juice and toss for a minute to bring it all together.',
      'Serve right from the skillet with warm tortillas and your favorite toppings.',
    ],
    tipsTitle: 'Good to know',
    tips: [
      'Slice the chicken against the grain so it stays tender.',
      'Don’t crowd the pan. Browning needs space.',
      'Chicken thighs work too, and so does a mix of whatever peppers you have.',
      'Leftovers keep in the fridge for 3 to 4 days. Reheat until steaming hot.',
    ],
    nutrition: '', // optional line (e.g. per-serving estimate). Leave empty until your dietitian has checked it.
    // After the recipe: a short confirmation. Answers stay on the device (nothing is sent or stored).
    confirm: {
      title: 'Tell us what you think',
      text: 'Answer two quick questions and a surprise is waiting for you.',
      likelyTitle: 'How likely are you to make it?',
      likely: ['Very likely', 'Likely', 'Maybe', 'Not likely'],
      thinkTitle: 'What do you think of it?',
      think: ['Love it', 'Looks good', 'It’s okay'],
      button: 'UNLOCK MY SURPRISE',
      note: 'Your answers stay on your device. We don’t collect them.',
    },
    // Shown after confirming: congratulations + the coupon
    reveal: {
      title: 'Congratulations!',
      text: 'Taking care of your health, or looking out for someone you care about, is something to celebrate. You earned a reward: coupon {couponCode}.',
      active: 'Your coupon is active on this device. The full kit is now {couponPrice} instead of {listPrice}.',
      bonus: 'And this recipe is one more dish on your menu, on top of the 30 recipe cards inside the kit.',
      codeLabel: 'Your code',
      copy: 'Copy code',
      copied: 'Copied!',
      cta: 'GET THE KIT FOR {couponPrice}',
      support: 'One-time purchase · Instant PDF download',
      back: 'Back to the full page',
    },
  },

  // ---------- Price explanation (shown under the pieces and in the buy boxes) ----------
  pricing: {
    stack: '',
    fullPriceLabel: 'Full price',
    lockedLabel: 'Your price',
    lockedBadge: 'Locked',
    lockedHeadline: 'Your price is locked.',
    lockedText: 'Tear through “Sound familiar?” above and your coupon is yours.',
    lockedLink: 'Unlock my price',
    unlockedLabel: 'Coupon {couponCode} unlocked',
    modal: {
      title: 'Before you go: a discount is waiting',
      text: 'Tear through the “Sound familiar?” page and a special coupon is yours. It takes a few seconds, and it’s applied at checkout.',
      primary: 'Unlock my discount',
      secondary: 'No thanks, continue to checkout',
      close: 'Close',
    },
  },

  // ---------- Tear-the-page intro (right after the product name; replaces the old long pain section) ----------
  tear: {
    title: 'Sound familiar?',
    hint: 'Swipe down to tear',
    skip: 'Skip',
    sheets: [
      'I don’t know what to eat tonight.',
      'Sugar labels at the store feel confusing.',
      'I don’t know how to organize my kitchen.',
      'I just want to know where to start.',
      'I’m done putting my health last.',
    ],
    // After the last sheet: congratulations + coupon (saved on the device and added to the checkout link)
    reveal: {
      title: 'Congratulations!',
      text: 'Taking care of your health, or looking out for someone you care about, is something to celebrate. You earned a reward.',
      codeLabel: 'Your coupon',
      copy: 'Copy code',
      copied: 'Copied!',
      active: 'It’s saved on this device and applied automatically at checkout. Now take a look at what you’re getting.',
      link: 'See what’s inside',
    },
  },

  // ---------- Encouraging phrases (hearts bands) ----------
  phrases: {
    afterLook: 'Small steps count. Progress, not perfection.',
    beforeFinal: 'Be kind to yourself. Dinner doesn’t have to be complicated.',
  },

  // ---------- 2. Product name + promise ----------
  meet: {
    eyebrow: 'Meet',
    name: 'The Everyday Plate',
    subtitle: 'The 14-Day Printable Kit: Easy Meals, Grocery Lists & Daily Habits',
    forLine: 'A printable meal-planning kit for adults who’ve heard the word “prediabetes” and want a clear plan for everyday meals.',
    promise: 'Know exactly what to eat, buy and do every day, so you stop guessing.',
    paragraphs: [
      'Six printable pieces that bring your meals, shopping and everyday routines together on paper, where you can see them.',
    ],
    chips: ['6 printable pieces', 'Black & white or color', 'No app · No login · No subscription'],
  },

  // ---------- 4b. A look inside: covers + a short synopsis of each of the 6 pieces ----------
  inside: {
    title: 'A look inside',
    intro: 'Six printable pieces. Here’s what each one is for.',
    items: [
      { src: '/images/cover-fridge-chart.webp', alt: 'Cover of the Fridge Chart, the Everyday Food Guide', title: 'Fridge Chart', text: 'One page: “Eat More / Enjoy Sometimes / Go Easy On.” Stick it on your fridge.' },
      { src: '/images/cover-meal-plan.webp', alt: 'Cover of the 14-Day Meal Plan', title: '14-Day Meal Plan', text: 'One block per day: breakfast, lunch, dinner and a snack, in large, easy-to-read type.' },
      { src: '/images/cover-grocery-lists.webp', alt: 'Cover of the Weekly Grocery Lists, Week 1 and Week 2', title: 'Weekly Grocery Lists', text: 'Two lists to check against your kitchen, including budget swaps.' },
      { src: '/images/cover-recipe-cards.webp', alt: 'Cover of the 30 Simple Recipes, recipe cards', title: '30 Recipe Cards', text: 'One recipe per page, with photos, servings, and carbs and fiber per serving. Regular grocery-store ingredients, ready in 30 minutes or less. No air fryer or Instant Pot.' },
      { src: '/images/cover-tracker.webp', alt: 'Cover of the 14-Day Tracker, meals and everyday habits', title: '14-Day Habit & Meal Tracker', text: 'Check off meals, a 10-minute walk after eating, and sleep.' },
      { src: '/images/cover-questions-for-my-doctor.webp', alt: 'Cover of Questions for My Doctor', title: 'Questions for My Doctor', text: 'One page to bring to your next appointment.' },
    ],
  },

  // ---------- Buttons (3 on the page) ----------
  cta: {
    first: { title: 'Ready to stop guessing?', button: 'GET THE EVERYDAY PLATE', support: 'One-time purchase · Instant PDF download' },
    mid: { title: 'Print it. Stick it up. Follow along.', button: 'GET THE EVERYDAY PLATE', support: 'One-time purchase · Instant PDF download' },
    final: {
      title: 'Give your next grocery trip a clear plan.',
      lines: ['Six printable pieces.', 'Thirty recipe cards.', 'Fourteen days of meals, ready to stick on the fridge.'],
      priceLine: 'The Everyday Plate: {price}',
      button: 'GET MY 14-DAY PRINTABLE KIT',
      support: 'One-time purchase · Instant PDF download',
    },
  },

  // ---------- 4. Print what you need ----------
  print: {
    title: 'Print what you need',
    text: 'Print it all or just the pages you want. Works in black and white. No app to download.',
    points: ['Prints on standard paper at home', 'Black and white or color', 'Or view it on your phone or tablet'],
  },

  // ---------- 6. How it works ----------
  steps: {
    title: 'How it works',
    items: [
      { title: 'Download', text: 'Get the PDF kit right after checkout.' },
      { title: 'Print the chart and the week you want', text: 'Stick the Fridge Chart up and print the meals and grocery list for the week ahead.' },
      { title: 'Follow along and check off the tracker', text: 'Cross things off as you go and keep your notes on paper.' },
    ],
    note: 'For individual dietary changes or substitutions, ask your doctor or registered dietitian.',
  },

  // ---------- 7. Registered dietitian review (hidden until real and finished) ----------
  review: {
    title: 'Reviewed by a Registered Dietitian',
    reviewerName: '', // real name  [RD NAME]
    credential: '', // verified credential  [CREDENTIALS]
    text: '', // what was reviewed, and when
    photo: '',
  },

  // ---------- 8. Customer reviews (hidden until you add real ones) ----------
  // Only genuine, authorized quotes. Identify any incentive or free access.
  testimonials: {
    title: 'See what customers have shared',
    items: [
      // { quote: '...', name: 'Permitted name or initials', disclosure: 'Received free access in exchange for feedback.' },
    ],
  },

  // ---------- 9. Creator (hidden until filled) ----------
  creator: {
    title: 'Who created The Everyday Plate?',
    paragraphs: [],
    photo: '',
    photoAlt: '',
  },

  // ---------- The approach behind the kit (plain-language, public sources, no promises) ----------
  // Confirm that this wording matches the final kit and have your dietitian review it, then set confirmed: true.
  approach: {
    confirmed: false,
    title: 'The approach behind the kit',
    intro: 'No gimmicks and no secret formula. The kit puts a few well-known, publicly available ideas on paper, so you don’t have to piece them together from ten different websites.',
    items: [
      { icon: 'plate', title: 'A simple, balanced plate', text: 'The meal plan and the recipes follow the plate idea the American Diabetes Association teaches: about half the plate non-starchy vegetables, a quarter protein, a quarter carbohydrate foods. No counting, weighing or measuring.' },
      { icon: 'recipe', title: 'Carbs and fiber, in plain sight', text: 'Every recipe card shows carbs and fiber per serving, so you can see what’s on your plate. We keep it practical instead of asking you to memorize glycemic index tables.' },
      { icon: 'heart', title: 'Small everyday habits', text: 'Eating well and moving regularly are the heart of the lifestyle approach studied in the NIH-led Diabetes Prevention Program, the research behind the CDC’s National DPP lifestyle change program. The tracker keeps your meals, a 10-minute walk after eating, and sleep in one place.' },
      { icon: 'questions', title: 'Your care team stays in charge', text: 'The kit is a planning tool, not medical care. One page helps you bring good questions to your doctor or registered dietitian.' },
    ],
    sourcesTitle: 'Read the sources',
    sources: [
      { name: 'American Diabetes Association: the Diabetes Plate method', url: 'https://professional.diabetes.org/sites/dpro/files/2025-05/PE25-Plan-Your-Plate-FINAL-5-22-25.pdf' },
      { name: 'NIDDK: Diabetes Prevention Program (DPP) research study', url: 'https://www.niddk.nih.gov/about-niddk/research-areas/diabetes/diabetes-prevention-program-dpp' },
      { name: 'CDC: What is the National Diabetes Prevention Program?', url: 'https://www.cdc.gov/diabetes-prevention/programs/what-is-the-national-dpp.html' },
    ],
    note: 'The Everyday Plate is independent. It is not affiliated with or endorsed by the ADA, NIH or CDC, it is not the DPP or the National DPP, and it doesn’t promise any health result.',
  },

  // ---------- 10. Who it fits ----------
  fit: {
    title: 'Is this kit a good fit?',
    intro: 'The Everyday Plate is made for adults who’ve heard the word “prediabetes” from their doctor, or who were told their blood sugar is a little high, and want a clear, printable way to plan everyday meals. It is educational: it doesn’t diagnose anything and doesn’t promise any health result.',
    listIntro: 'It may suit you if you want:',
    items: [
      'A two-week starting point for organizing meals.',
      'A chart on the fridge instead of another tab on your phone.',
      'Recipes and shopping lists you can print and write on.',
      'Practical material to talk through with your doctor or dietitian.',
    ],
    notTitle: 'It is probably not for you if you want:',
    notItems: [
      'A shortcut or an overnight miracle.',
      'Personalized medical care or a diagnosis. Please see your doctor for that.',
      'To change or stop any medication. Always follow your doctor’s advice.',
    ],
    note: 'It provides general information. Individual nutrition needs require personalized guidance.',
  },

  // ---------- 11. Guarantee ----------
  // Confirm the terms with your merchant of record, then set confirmedWithMerchant: true.
  guarantee: {
    show: true,
    confirmedWithMerchant: false,
    days: 14,
    title: '{days}-Day Money-Back Guarantee',
    text: 'Try the kit for {days} days. If it isn’t useful to you, email us and we’ll refund your purchase. No long forms, no hoops.',
  },

  // ---------- 12. FAQ ----------
  // Empty answers are hidden. {delivery} and {refundPolicy} come from the two fields below.
  delivery: '', // How will I receive the files? (fill after choosing the checkout provider)
  refundPolicy: '', // Exact refund policy; empty = the guarantee text above is used
  faq: {
    title: 'A few questions before you start',
    items: [
      { q: 'Is this a physical product?', a: 'No. It’s a digital PDF kit. You download it, then print it at home or at a print shop, or view it on a phone or tablet.' },
      { q: 'Do I need to print it?', a: 'You can print it or view it on your phone or tablet. Printing is optional.' },
      { q: 'Does it work in black and white?', a: 'Yes. It’s designed to print well in black and white, or in color if you like.' },
      { q: 'What does the kit include?', a: 'The Fridge Chart, the 14-Day Meal Plan, two Weekly Grocery Lists (budget swaps included), 30 Recipe Cards, the 14-Day Habit & Meal Tracker, and Questions for My Doctor.' },
      { q: 'How many recipes are there?', a: '30 recipe cards, one recipe per page.' },
      { q: 'Do I need an air fryer?', a: 'No. No special equipment. There’s no air fryer or Instant Pot in any recipe.' },
      { q: 'Do I need special ingredients?', a: 'No. Everything is available at a regular grocery store.' },
      { q: 'Is this a subscription?', a: 'No. It’s a one-time purchase. Any applicable taxes will be shown at checkout.' },
      { q: 'How do I get a discount?', a: 'Tear through the “Sound familiar?” page near the top of this page. When you reach the end, your coupon code and your new price appear, and the coupon is saved on that device and added to your checkout link. If it doesn’t apply by itself, just type the code into the coupon box.' },
      { q: 'Who is this kit for?', a: 'It’s made for adults who’ve heard the word “prediabetes” and want a simple, printable plan for everyday meals, shopping and routines. It’s educational: it gives general information, doesn’t diagnose anything and doesn’t promise any health result.' },
      { q: 'Does this replace advice from my doctor or dietitian?', a: 'No. Use it as educational material and discuss dietary changes with your healthcare professional.' },
      { q: 'What if I take medication or have specific dietary needs?', a: 'Talk to your doctor or registered dietitian before changing your diet. Do not stop or adjust medication based on this kit.' },
      { q: 'How will I receive the files?', a: '{delivery}' },
      { q: 'What is the refund policy?', a: '{refundAnswer}' },
    ],
  },

  thankYou: {
    title: 'Thank you!',
    text: 'Your purchase is complete. Your download link is on this page if your checkout provides one, and a copy is sent to the email you used at checkout.',
    note: 'Don’t see it? Check your spam folder, or email us and we’ll help.',
  },

  footer: {
    tagline: 'Made with care for your everyday table.',
    copyright: '© {year} {brand}. Operated by {legalName}.',
  },

  // ---------- Legal / info pages (DRAFTS: have a lawyer review) ----------
  pages: {
    disclaimer: {
      title: 'Medical & Educational Disclaimer',
      sections: [
        { h: 'Educational information only', p: ['The content on this website and in {brand} and our other digital products, including the meal plans, recipe cards, grocery lists, habit trackers and charts, is provided for general educational purposes only. It is not medical advice.'] },
        { h: 'Talk to a professional first', p: ['Talk to your doctor or a registered dietitian before changing your diet, especially if you take medication or have a medical condition, are pregnant or nursing, or have food allergies.', 'Never stop, change or skip any medication because of anything you read here. Always follow the instructions of your healthcare provider.'] },
        { h: 'No diagnosis, no personal care', p: ['We do not diagnose conditions or provide personalized medical care. Our products are not a substitute for professional medical advice, and no doctor-patient or dietitian-client relationship is created by using this site or buying our products.'] },
        { h: 'No results are promised', p: ['Everyone is different, and we make no promises about any health outcome. Our products are meant to help you organize meals, shopping and everyday routines.'] },
        { h: 'Emergencies', p: ['If you think you may have a medical emergency, call your doctor or 911 right away.'] },
      ],
    },
    terms: {
      title: 'Terms of Use & Sale',
      draft: true,
      sections: [
        { h: '1. About these terms', p: ['These terms apply to your use of this website and your purchase of {brand} and our other digital products. By using the site or buying a product you agree to them. If you do not agree, please do not use the site.'] },
        { h: '2. Educational purpose', p: ['Our products are for general educational use only and are not medical advice. Please read our Disclaimer page. You are responsible for your own health decisions.'] },
        { h: '3. Digital products and license', p: ['Our products are digital PDF files delivered by download. When you buy, you get a personal, non-transferable license to use the product for yourself and your household. You may print it for your own use. You may not resell, share publicly, copy or redistribute it.'] },
        { h: '4. Payments', p: ['Payments are handled by our payment partner, which acts as the seller of record. Prices are shown in U.S. dollars. Taxes may apply and are handled at checkout.'] },
        { h: '5. Refunds', p: ['{refundText}'] },
        { h: '6. Coupons and discounts', p: ['A discount is unlocked by going through the “Sound familiar?” section of the sales page, and reduces the price of the kit from {listPrice} to {couponPrice}. We may change or end a promotion at any time. [[Confirm the coupon works at checkout.]]'] },
        { h: '7. No guarantees of results', p: ['We do not promise any particular result. Use of the products is at your own risk.'] },
        { h: '8. Intellectual property', p: ['All content on this site and in our products is owned by {legalName} or its licensors and is protected by copyright.'] },
        { h: '9. Limitation of liability', p: ['To the fullest extent permitted by law, we are not liable for indirect, incidental or consequential damages arising from your use of the site or products, and our total liability is limited to the amount you paid for the product. [[Lawyer to confirm wording and governing law/jurisdiction.]]'] },
        { h: '10. Changes', p: ['We may update these terms from time to time. The date at the top shows when they were last changed.'] },
        { h: '11. Contact', p: ['Questions? Email {supportEmail}.'] },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      draft: true,
      sections: [
        { h: 'The short version', p: ['We keep data collection to a minimum. We do not ask for any health information on this website. At checkout, only your email address is needed to deliver your purchase.'] },
        { h: 'What we collect', p: ['Checkout: your email address and payment details are collected by our payment partner, not by us. We receive your email address and order details so we can deliver your product and support you.', 'Website usage: we use the Meta (Facebook) Pixel, if enabled, to measure visits and the effectiveness of our ads. The pixel uses cookies and may collect your IP address, browser information and the pages you view, including whether you clicked to buy.', 'Contact: if you email us, we keep your message and email address so we can reply.'] },
        { h: 'What we do not collect', p: ['We do not collect health information, medical conditions, diagnoses or medication details on this website.'] },
        { h: 'How we use it', p: ['To deliver and support your purchase, to measure and improve our site and ads, to send you important messages about your order, and to send emails you have opted into. You can unsubscribe at any time from any marketing email.'] },
        { h: 'Sharing', p: ['We share data only with service providers who help us run the business (payment processor, email delivery, analytics and advertising platforms such as Meta). We do not sell your personal information for money.'] },
        { h: 'Cookies and ads', p: ['You can manage cookies in your browser settings and manage ad preferences in your Facebook account settings. Some browsers and extensions block tracking pixels.'] },
        { h: 'Your choices and rights', p: ['You can ask us to access or delete the personal information we hold about you by emailing {supportEmail}. Depending on where you live (for example California), you may have additional privacy rights, and we will honor valid requests. [[Lawyer to confirm state privacy law compliance.]]'] },
        { h: 'Children', p: ['This site is not intended for children under 13, and we do not knowingly collect their information.'] },
        { h: 'Changes and contact', p: ['We may update this policy and will change the date above when we do. {brand} questions? Email {supportEmail}.'] },
      ],
    },
    contact: {
      title: 'Contact Us',
      intro: 'Questions about your order, the download or refunds? Email us and we’ll get back to you, usually within 1 to 2 business days.',
      emailLabel: 'Email',
      hint: 'Please include the email address you used at checkout. Please don’t send us medical details. For medical questions, talk to your doctor.',
    },
  },
};
