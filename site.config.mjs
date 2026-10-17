// =====================================================================
//  ALL page copy, prices, images and links live in THIS file.
//  Edit here, run `npm run build`, deploy. No need to touch build.mjs or CSS.
//
//  EMPTY = HIDDEN. Sections that need real information (customer quotes,
//  creator bio, professional review, delivery and refund answers, guide
//  previews, food photos) stay off the public page while their fields are
//  empty. `npm run dev` shows dashed "edit slots" for them so you can see
//  where they will appear.
//
//  Anything written like "[[ ... ]]" is a placeholder that stays visible
//  (business identity, legal drafts). `npm run launch-check` lists everything
//  still open and fails until it is resolved.
//
//  COMPLIANCE: no clinical promises, no suggestion to change medication,
//  no unverified credentials, no invented social proof. `npm run check`
//  scans the built pages for forbidden wording (cure, reverse, treat, heal,
//  "lower your A1C", "get off medication", etc.).
// =====================================================================

const env = process.env;

export default {
  // ---------- Business / links ----------
  site: {
    brand: 'The Everyday Plate',
    productName: 'The Everyday Plate',
    productSubtitle: 'A simple 14-day meal plan with 30 recipes and weekly grocery lists.',
    url: env.SITE_URL || '', // e.g. https://yourdomain.com
    supportEmail: env.SUPPORT_EMAIL || '[[support@yourdomain.com]]',
    legalName: '[[Legal business name]]',
    legalAddress: '[[Business mailing address]]',
    effectiveDate: 'October 2026',
  },

  // ---------- Price & checkout ----------
  price: { amount: 19, currency: 'USD', display: '$19' },
  // Merchant-of-record checkout link (or set the CHECKOUT_URL env var in Vercel).
  checkoutUrl: env.CHECKOUT_URL || '[[CHECKOUT_URL]]',
  passQueryToCheckout: true, // forwards utm_* and fbclid to the checkout link

  // ---------- Meta Pixel (empty = not loaded) ----------
  tracking: {
    metaPixelId: env.META_PIXEL_ID || '',
    contentName: '14-Day Meal Plan', // generic on purpose: never a health term
  },

  // ---------- Required disclaimer (exact text) ----------
  disclaimer:
    'Educational information only. Not medical advice. Talk to your doctor or a registered dietitian before changing your diet, especially if you take medication or have a medical condition.',

  seo: {
    title: 'The Everyday Plate: A Simple 14-Day Meal Plan with 30 Recipes and Weekly Grocery Lists',
    description:
      'A simple 14-day meal plan with 30 recipes and weekly grocery lists. Know what’s on the menu, what to buy, and how to cook it. Digital PDF.',
    ogImage: '/og.png',
  },

  // ---------- Images (files go in static/, paths start with "/") ----------
  images: {
    // Main mockup: the PDF cover next to REAL previews of a recipe, the 14-day
    // calendar and a grocery list. Until it exists, a neutral frame is shown.
    mockup: '',
    mockupAlt: 'The Everyday Plate guide cover with previews of a recipe page, the 14-day calendar and a grocery list',
    // Appetizing everyday-meal photos. Empty = hidden. Use photos you own or are licensed to use.
    hero: { src: '', alt: '' }, // beside the opening copy
    meals: [
      // { src: '/meal-1.jpg', alt: 'Describe the dish' },  (3 photos show as a strip)
    ],
  },

  // ---------- 1. Pain / opening ----------
  pain: {
    headline: 'Now what do I eat?',
    lead: 'Another grocery trip. Another list of ingredients. And the same unanswered question when it’s time to make a meal.',
    paragraphs: [
      'You search for ideas. Save a few recipes. Read another article.',
      'One says to avoid a food. Another says it belongs on your plate.',
      'Meanwhile, dinner still needs to happen.',
    ],
    listIntro: 'Without a clear plan, the decisions keep piling up:',
    list: [
      'What should I buy?',
      'What can I make with it?',
      'Will this recipe take forever?',
      'And what am I supposed to eat tomorrow?',
    ],
    closing: [
      'A folder full of saved recipes doesn’t tell you what to put in your cart this week.',
      'You need a practical place to start.',
    ],
  },

  // ---------- 2. Product name ----------
  meet: {
    eyebrow: 'Meet',
    name: 'The Everyday Plate',
    subtitle: 'A simple 14-day meal plan with 30 recipes and weekly grocery lists.',
    paragraphs: [
      'Bring your meals, shopping, and everyday routines together in one easy-to-follow digital guide.',
      'Know what’s on the menu. See what ingredients you need. Follow the recipe when it’s time to cook.',
    ],
  },

  // ---------- 4. Bonuses ----------
  bonuses: {
    title: 'Your plan also includes:',
    items: [
      { icon: 'habits', label: 'BONUS 1', title: 'The Everyday Habits Guide', text: 'Simple prompts to help organize everyday routines, with space to choose habits that fit your circumstances.' },
      { icon: 'dining', label: 'BONUS 2', title: 'The Eating Out Guide', text: 'Practical pointers for reading menus, asking questions, and planning meals away from home.' },
      { icon: 'tracker', label: 'BONUS 3', title: 'Your 14-Day Tracker', text: 'A printable place to record meals, routines, and notes as you use the plan.' },
      { icon: 'questions', label: 'BONUS 4', title: 'Questions for Your Doctor or Dietitian', text: 'A prepared question list to help you discuss food choices and your individual needs with a qualified professional.' },
    ],
  },

  // ---------- 5 and 9. Buttons ----------
  cta: {
    first: { button: 'GET THE EVERYDAY PLATE — $19', support: 'One-time purchase · Digital PDF' },
    final: {
      title: 'Give your next grocery trip a clear plan.',
      lines: ['Two weeks of meal ideas.', 'Thirty recipes in one guide.', 'Weekly shopping lists ready to check against your kitchen.'],
      priceLine: 'The Everyday Plate — $19',
      button: 'GET MY 14-DAY MEAL PLAN',
      support: 'One-time purchase · Digital PDF',
    },
  },

  // ---------- 6a. What's inside ----------
  inside: {
    title: 'From “What should I make?” to a plan you can open and follow.',
    intro: 'Here’s what’s inside:',
    items: [
      { title: 'A 14-day meal schedule', text: 'Breakfast, lunch, and dinner ideas arranged across two weeks.' },
      { title: '30 straightforward recipes', text: 'Ingredients, quantities, serving information, and preparation instructions in one place.' },
      { title: 'Weekly grocery lists', text: 'Shopping lists organized by store section, so you can check your kitchen before heading out.' },
      { title: 'Budget-conscious alternatives', text: 'Ingredient options to help you work with availability and your shopping budget.' },
      { title: 'A digital format for everyday use', text: 'Read it on your phone or tablet, or print the pages you want beside you in the kitchen.' },
    ],
  },

  // ---------- 6b. Real previews (hidden until filled) ----------
  // Three readable, genuine pages of the finished guide, including one complete sample recipe.
  previews: {
    title: 'Inside the guide',
    pages: [
      // { src: '/preview-recipe.png', alt: 'A complete sample recipe page', caption: 'A complete recipe' },
      // { src: '/preview-calendar.png', alt: 'The 14-day meal calendar', caption: 'The 14-day calendar' },
      // { src: '/preview-grocery.png', alt: 'A weekly grocery list', caption: 'A weekly grocery list' },
    ],
  },

  // ---------- 6c. How to use ----------
  steps: {
    title: 'How to use your plan',
    items: [
      { title: 'Look through the coming week.', text: 'Read the menu and recipes before shopping.' },
      { title: 'Check what you already have.', text: 'Use the grocery list to identify what you need.' },
      { title: 'Prepare your meals and keep notes.', text: 'Follow the instructions and use your tracker to record what worked for your routine.' },
    ],
    note: 'For individual dietary changes or substitutions, ask your doctor or registered dietitian.',
  },

  // ---------- 6d. Verified customer feedback (hidden until you add real ones) ----------
  // Only genuine, authorized quotes about a specific experience (recipe clarity,
  // shopping-list organization, ease of use). Identify any incentive or free access.
  // Never publish placeholder ratings, results or customer counts.
  testimonials: {
    title: 'See what customers have shared',
    items: [
      // { quote: '...', name: 'Permitted name or initials', disclosure: 'Received free access in exchange for feedback.' },
    ],
  },

  // ---------- 6e. Creator (hidden until filled) ----------
  // Short and factual: who made it, their actual role, why they built it, how it was made.
  // Qualifications only if verified.
  creator: {
    title: 'Who created The Everyday Plate?',
    paragraphs: [],
    photo: '', // optional, e.g. '/creator.jpg'
    photoAlt: '',
  },

  // ---------- 6f. Professional review (hidden until it is real and finished) ----------
  review: {
    title: 'Reviewed by a registered dietitian',
    reviewerName: '', // real name
    credential: '', // verified credential / license
    text: '', // what was reviewed, and when
    photo: '',
  },

  // ---------- 7. Who it fits ----------
  fit: {
    title: 'Is this guide a good fit?',
    intro: 'The Everyday Plate is an educational meal-planning resource for adults seeking practical meal ideas, including those exploring food choices in the context of prediabetes.',
    listIntro: 'It may suit you if you want:',
    items: [
      'A two-week starting point for organizing meals.',
      'Recipes and shopping lists kept together.',
      'A printable guide you can refer to during the week.',
      'Practical material to discuss with your doctor or dietitian.',
    ],
    note: 'It provides general information. Individual nutrition needs require personalized guidance.',
  },

  // ---------- 8. FAQ ----------
  // Delivery and refund answers come from the two fields below. Empty = that question is hidden.
  delivery: '', // How will I receive the files? (fill after choosing the checkout provider)
  refundPolicy: '', // Exact refund policy (must match the merchant of record)
  faq: {
    title: 'A few questions before you start',
    items: [
      { q: 'Is this a physical book?', a: 'No. It’s a digital PDF you can read on a compatible device or print.' },
      { q: 'What does the $19 purchase include?', a: 'The 14-day meal plan, 30 recipes, weekly grocery lists with budget-conscious alternatives, and the four bonus resources listed above.' },
      { q: 'Is this a subscription?', a: 'No. The $19 price is a one-time purchase. Any applicable taxes will be shown at checkout.' },
      { q: 'Does this replace advice from my doctor or dietitian?', a: 'No. Use it as educational material and discuss dietary changes with your healthcare professional.' },
      { q: 'What if I take medication or have specific dietary needs?', a: 'Talk to your doctor or registered dietitian before changing your diet. Do not stop or adjust medication based on this guide.' },
      { q: 'How will I receive the files?', a: '{delivery}' },
      { q: 'What is the refund policy?', a: '{refundPolicy}' },
    ],
  },

  thankYou: {
    title: 'Thank you!',
    text: 'Your purchase is complete. Your download link is on this page if your checkout provides one, and a copy is sent to the email you used at checkout.',
    note: 'Don’t see it? Check your spam folder, or email us and we’ll help.',
  },

  footer: { copyright: '© {year} {legalName}. All rights reserved.' },

  // ---------- Legal / info pages (DRAFTS: have a lawyer review) ----------
  pages: {
    disclaimer: {
      title: 'Medical & Educational Disclaimer',
      sections: [
        { h: 'Educational information only', p: ['The content on this website and in our digital products, including the meal plans, recipes, grocery lists, habit guides and trackers, is provided for general educational purposes only. It is not medical advice.'] },
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
        { h: '1. About these terms', p: ['These terms apply to your use of this website and your purchase of our digital products. By using the site or buying a product you agree to them. If you do not agree, please do not use the site.'] },
        { h: '2. Educational purpose', p: ['Our products are for general educational use only and are not medical advice. Please read our Disclaimer page. You are responsible for your own health decisions.'] },
        { h: '3. Digital products and license', p: ['Our products are digital files delivered by download. When you buy, you get a personal, non-transferable license to use the product for yourself and your household. You may print it for your own use. You may not resell, share publicly, copy or redistribute it.'] },
        { h: '4. Payments', p: ['Payments are handled by our payment partner, which acts as the seller of record. Prices are shown in U.S. dollars. Taxes may apply and are handled at checkout.'] },
        { h: '5. Refunds', p: ['{refundText}'] },
        { h: '6. No guarantees', p: ['We do not guarantee any particular result. Use of the products is at your own risk.'] },
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
        { h: 'Cookies and ads', p: ['You can control cookies in your browser settings and manage ad preferences in your Facebook account settings. Some browsers and extensions block tracking pixels.'] },
        { h: 'Your choices and rights', p: ['You can ask us to access or delete the personal information we hold about you by emailing {supportEmail}. Depending on where you live (for example California), you may have additional privacy rights, and we will honor valid requests. [[Lawyer to confirm state privacy law compliance.]]'] },
        { h: 'Children', p: ['This site is not intended for children under 13, and we do not knowingly collect their information.'] },
        { h: 'Changes and contact', p: ['We may update this policy and will change the date above when we do. Questions? Email {supportEmail}.'] },
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
