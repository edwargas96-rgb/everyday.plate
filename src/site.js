// Pixel events, price/coupon state and checkout links. No health data is ever sent.
(function () {
  var S = window.__SITE__ || {};
  var C = S.coupon || {};
  var root = document.documentElement;
  var unlocked = root.classList.contains('unlocked'); // set by the inline script in <head>

  function track(name, params) { try { if (S.pixel && window.fbq) window.fbq('track', name, params); } catch (e) {} }
  function current() { return { content_name: S.contentName, value: unlocked ? C.amount : S.value, currency: S.currency }; }

  // Price text: $90 until the free recipe has been opened, then the coupon price.
  if (unlocked) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-price]'), function (el) { el.textContent = C.display; });
  }

  // Hook A/B: ?v=b shows variant B. The variant is sent as a generic custom parameter.
  var variant = 'a';
  if (S.page === 'home') {
    if (new URLSearchParams(location.search).get('v') === 'b') {
      var A = document.querySelector('.hook-copy[data-v="a"]'), B = document.querySelector('.hook-copy[data-v="b"]');
      if (A && B) { A.hidden = true; B.hidden = false; variant = 'b'; }
    }
    var vc = current(); vc.headline_variant = variant;
    track('ViewContent', vc);
  }
  if (S.page === 'free-recipe') track('ViewContent', { content_name: 'Free recipe' });

  if (S.page === 'thank-you') {
    var q = new URLSearchParams(location.search), v = parseFloat(q.get('value'));
    track('Purchase', { content_name: S.contentName, value: isNaN(v) ? current().value : v, currency: S.currency });
  }

  // Free recipe links
  Array.prototype.forEach.call(document.querySelectorAll('a[data-free]'), function (a) {
    a.addEventListener('click', function () { track('Lead', { content_name: 'Free recipe' }); });
  });

  // Checkout links: pass utm_*/fbclid along and add the coupon once it is unlocked.
  var pass = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];
  function withParams(href, addCoupon) {
    if (href.charAt(0) === '#') return href;
    try {
      var u = new URL(href, location.href), cur = new URLSearchParams(location.search);
      if (S.passQuery) pass.forEach(function (k) { if (cur.get(k) && !u.searchParams.has(k)) u.searchParams.set(k, cur.get(k)); });
      if (addCoupon && C.param && C.code) u.searchParams.set(C.param, C.code);
      return u.toString();
    } catch (e) { return href; }
  }

  var modal = document.getElementById('unlock-modal');
  var cont = modal ? modal.querySelector('[data-continue]') : null;
  var canModal = modal && typeof modal.showModal === 'function';

  Array.prototype.forEach.call(document.querySelectorAll('a[data-checkout]'), function (a) {
    var base = a.getAttribute('href');
    a.setAttribute('href', withParams(base, unlocked));
    a.addEventListener('click', function (e) {
      if (!unlocked && canModal) {
        // Buying before opening the free recipe: suggest the recipe (and the coupon) first.
        e.preventDefault();
        if (cont) cont.setAttribute('href', withParams(base, false));
        modal.showModal();
        return;
      }
      track('InitiateCheckout', current());
    });
  });
  if (cont) cont.addEventListener('click', function () { track('InitiateCheckout', { content_name: S.contentName, value: S.value, currency: S.currency }); });
  if (modal) {
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });
  }

  // Copy the coupon code
  Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (btn) {
    btn.addEventListener('click', function () {
      var code = btn.getAttribute('data-copy'), done = btn.getAttribute('data-copied'), label = btn.textContent;
      function ok() { btn.textContent = done; setTimeout(function () { btn.textContent = label; }, 1800); }
      try { navigator.clipboard.writeText(code).then(ok, ok); } catch (e) { ok(); }
    });
  });
})();
