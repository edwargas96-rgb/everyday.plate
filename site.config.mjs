// =====================================================================
//  ALL page copy, prices, images and links live in THIS file.
//  Edit here, run `npm run build`, deploy. No need to touch build.mjs or CSS.
//
//  Variables you can use inside any text: {price} {brand} {days}
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
    url: env.SITE_URL || '', // e.g. https://yourdomain.com
    supportEmail: env.SUPPORT_EMAIL || '[[support@yourdomain.com]]',
    legalName: '[[Legal business name]]',
    legalAddress: '[[Business mailing address]]',
    effectiveDate: 'October 2026',
  },
  logo: { src: '/images/logo.webp', width: 900, height: 237 },

  // ---------- Price & checkout ----------
  price: { amount: 19, currency: 'USD', display: '$19' }, // test range: 17 to 27
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

  seo: {
    title: 'The Everyday Plate | The 14-Day Printable Kit: Easy Meals, Grocery Lists & Daily Habits',
    description:
      'A 14-day printable kit: fridge chart, meal plan, grocery lists, 30 recipe cards and a tracker. Print it or view it on your phone. Instant PDF download.',
    ogImage: '/og.png',
  },

  // ---------- Images (files go in static/, paths start with "/") ----------
  images: {
    // Printed kit on the kitchen table + chart on the fridge. Swap the placeholder
    // for your real photo. No generated people.
    kitMockup: '/images/placeholder-kit-mockup.svg',
    kitMockupAlt: 'The printed kit on a kitchen table, with the fridge chart on the refrigerator',
    // Optional appetizing everyday-meal photos. Empty = hidden.
    hero: { src: '', alt: '' },
    meals: [
      // { src: '/meal-1.jpg', alt: 'Describe the dish' },
    ],
  },

  // ---------- Headline A/B ----------
  // Default is A. Open the page with ?v=b to see variant B.
  headline: {
    a: 'Now what do I eat?',
    b: 'Know exactly what to eat, buy and do every day, so you stop guessing.',
  },

  // ---------- 1. Pain / opening ----------
  pain: {
    lead: 'Another grocery trip. Another list of ingredients. And the same unanswered question when it’s time to make a meal.',
    paragraphs: [
      'You search for ideas. Save a few recipes. Read another article.',
      'One says to avoid a food. Another says it belongs on your plate.',
      'Meanwhile, dinner still needs to happen.',
    ],
    listIntro: 'Without a clear plan, the decisions keep piling up:',
    list: [
      'I don’t know what to eat tonight.',
      'The grocery store feels confusing.',
      'I’m tired of Googling.',
      'I don’t want to give up everything I love.',
    ],
    closing: [
      'A folder full of saved recipes doesn’t tell you what to put in your cart this week.',
      'You need a practical place to start.',
    ],
  },

  // ---------- Encouraging phrases (hearts bands) ----------
  phrases: {
    afterPain: 'You’ve got this. One good meal at a time.',
    afterLook: 'Small steps count. Progress, not perfection.',
    beforeFinal: 'Be kind to yourself. Dinner doesn’t have to be complicated.',
  },

  // ---------- 2. Product name + promise ----------
  meet: {
    eyebrow: 'Meet',
    name: 'The Everyday Plate',
    subtitle: 'The 14-Day Printable Kit: Easy Meals, Grocery Lists & Daily Habits',
    promise: 'Know exactly what to eat, buy and do every day, so you stop guessing.',
    paragraphs: [
      'Six printable pieces that bring your meals, shopping and everyday routines together on paper, where you can see them.',
    ],
    chips: ['6 printable pieces', 'PDF · US Letter', 'Black & white or color', 'No app · No login · No subscription'],
  },

  // ---------- 3. What's in the kit ----------
  kit: {
    title: 'What’s in the kit',
    intro: 'Six simple pieces. Print them all, or just the ones you want.',
    items: [
      { icon: 'fridge', title: 'Fridge Chart', text: 'One page: “Eat More / Enjoy Sometimes / Go Easy On.” Stick it on your fridge.' },
      { icon: 'calendar', title: '14-Day Meal Plan', text: 'One block per day: breakfast, lunch, dinner and a snack, in large, easy-to-read type.' },
      { icon: 'cart', title: 'Weekly Grocery Lists', text: 'Two lists to check against your kitchen, including budget swaps.' },
      { icon: 'recipe', title: '30 Recipe Cards', text: 'One recipe per page, with photos, servings, and carbs and fiber per serving. Regular grocery-store ingredients, ready in 30 minutes or less. No air fryer or Instant Pot needed.' },
      { icon: 'tracker', title: '14-Day Habit & Meal Tracker', text: 'Check off meals, a 10-minute walk after eating, and sleep.' },
      { icon: 'questions', title: 'Questions for My Doctor', text: 'One page to bring to your next appointment.' },
    ],
  },

  // ---------- Buttons (3 on the page) ----------
  cta: {
    first: { button: 'GET THE EVERYDAY PLATE — {price}', support: 'One-time purchase · Instant PDF download' },
    mid: { button: 'GET THE EVERYDAY PLATE — {price}', support: 'One-time purchase · Instant PDF download' },
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
    points: ['Prints on standard US Letter paper', 'Black and white or color', 'Or view it on your phone or tablet'],
  },

  // ---------- 5. A look inside (2 previews) ----------
  look: {
    title: 'A look inside',
    intro: 'Here are two of the pieces.',
    pages: [
      { src: '/images/placeholder-fridge-chart.svg', alt: 'The Fridge Chart', caption: 'The Fridge Chart' },
      { src: '/images/placeholder-recipe-card.svg', alt: 'A recipe card', caption: 'A Recipe Card' },
    ],
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

  // ---------- 10. Who it fits ----------
  fit: {
    title: 'Is this kit a good fit?',
    intro: 'The Everyday Plate is an educational meal-planning kit for adults who want practical meal ideas they can see at a glance.',
    listIntro: 'It may suit you if you want:',
    items: [
      'A two-week starting point for organizing meals.',
      'A chart on the fridge instead of another tab on your phone.',
      'Recipes and shopping lists you can print and write on.',
      'Practical material to talk through with your doctor or dietitian.',
    ],
    note: 'It provides general information. Individual nutrition needs require personalized guidance.',
  },

  // ---------- 11. Guarantee ----------
  // Confirm the terms with your merchant of record, then set confirmedWithMerchant: true.
  guarantee: {
    show: true,
    confirmedWithMerchant: false,
    days: 30,
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
      { q: 'Is this a physical product?', a: 'No. It’s a digital PDF kit in US Letter size. You download it, then print it at home or at a print shop, or view it on a phone or tablet.' },
      { q: 'Do I need to print it?', a: 'You can print it or view it on your phone or tablet. Printing is optional.' },
      { q: 'Does it work in black and white?', a: 'Yes. It’s designed to print well in black and white, or in color if you like.' },
      { q: 'What does the {price} purchase include?', a: 'The Fridge Chart, the 14-Day Meal Plan, two Weekly Grocery Lists (budget swaps included), 30 Recipe Cards, the 14-Day Habit & Meal Tracker, and Questions for My Doctor.' },
      { q: 'How many recipes are there?', a: '30 recipe cards, one recipe per page.' },
      { q: 'Do I need an air fryer?', a: 'No. No special equipment. There’s no air fryer or Instant Pot in any recipe.' },
      { q: 'Do I need special ingredients?', a: 'No. Everything is available at a regular grocery store.' },
      { q: 'Is this a subscription?', a: 'No. The {price} price is a one-time purchase. Any applicable taxes will be shown at checkout.' },
      { q: 'Who is this kit for?', a: 'It’s an educational meal-planning resource for adults seeking practical meal ideas, including people exploring food choices in the context of prediabetes. It provides general information, not personalized guidance.' },
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
        { h: '6. No guarantees of results', p: ['We do not promise any particular result. Use of the products is at your own risk.'] },
        { h: '7. Intellectual property', p: ['All content on this site and in our products is owned by {legalName} or its licensors and is protected by copyright.'] },
        { h: '8. Limitation of liability', p: ['To the fullest extent permitted by law, we are not liable for indirect, incidental or consequential damages arising from your use of the site or products, and our total liability is limited to the amount you paid for the product. [[Lawyer to confirm wording and governing law/jurisdiction.]]'] },
        { h: '9. Changes', p: ['We may update these terms from time to time. The date at the top shows when they were last changed.'] },
        { h: '10. Contact', p: ['Questions? Email {supportEmail}.'] },
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
