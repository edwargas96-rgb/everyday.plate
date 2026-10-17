// Pixel events, price/coupon state, carousel and checkout links. No health data is ever sent.
(function () {
  var S = window.__SITE__ || {};
  var C = S.coupon || {};
  var root = document.documentElement;
  var unlocked = root.classList.contains('unlocked'); // saved from an earlier visit (inline script in <head>)

  function track(name, params) { try { if (S.pixel && window.fbq) window.fbq('track', name, params); } catch (e) {} }
  function trackCustom(name) { try { if (S.pixel && window.fbq) window.fbq('trackCustom', name); } catch (e) {} }
  function current() { return { content_name: S.contentName, value: unlocked ? C.amount : S.value, currency: S.currency }; }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function paintPrices() { if (unlocked) $all('[data-price]').forEach(function (el) { el.textContent = C.display; }); }
  paintPrices();

  // ---- Hook A/B: ?v=b shows variant B ----
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

  $all('a[data-free]').forEach(function (a) { a.addEventListener('click', function () { var m = document.getElementById('unlock-modal'); if (m && m.open) m.close(); }); });

  // ---- Checkout links: utm_*/fbclid pass through; coupon added once unlocked ----
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
  var links = $all('a[data-checkout]').map(function (a) { return { a: a, base: a.getAttribute('href') }; });
  function refreshLinks() { links.forEach(function (l) { l.a.setAttribute('href', withParams(l.base, unlocked)); }); }
  refreshLinks();
  links.forEach(function (l) {
    l.a.addEventListener('click', function (e) {
      if (!unlocked && canModal) {
        // Buying before reading the free recipe: suggest the recipe (and the coupon) first.
        e.preventDefault();
        if (cont) cont.setAttribute('href', withParams(l.base, false));
        modal.showModal();
        return;
      }
      track('InitiateCheckout', current());
    });
  });
  if (cont) cont.addEventListener('click', function () { track('InitiateCheckout', { content_name: S.contentName, value: S.value, currency: S.currency }); });
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });

  // ---- Free recipe: confirm ("I read it") -> congratulations + coupon ----
  var form = document.getElementById('confirm-form');
  var congrats = document.getElementById('congrats');
  function showCongrats(scroll) {
    if (form) form.hidden = true;
    if (congrats) { congrats.hidden = false; if (scroll) congrats.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }
  function unlock() {
    unlocked = true;
    try { localStorage.setItem('ep_unlock', '1'); } catch (e) {}
    root.classList.add('unlocked');
    paintPrices(); refreshLinks();
  }
  if (S.page === 'free-recipe') {
    if (unlocked) showCongrats(false);
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = form.querySelector('input[name="likely"]:checked') && form.querySelector('input[name="think"]:checked');
      var err = document.getElementById('confirm-error');
      if (!ok) { if (err) err.hidden = false; return; }
      if (err) err.hidden = true;
      unlock(); trackCustom('RecipeConfirmed'); showCongrats(true);
    });
  }


  // ---- Tear-the-page intro: swipe down (or tap) to rip each sheet, then move on to "A look inside" ----
  var tear = document.getElementById('tear');
  if (tear) {
    root.classList.add('js-tear');
    var sheets = $all('.sheet', tear), cur = 0;
    var doneEl = document.getElementById('tear-reveal');
    function place() {
      sheets.forEach(function (sh, i) {
        if (i < cur) { sh.classList.add('gone'); sh.removeAttribute('data-pos'); return; }
        sh.setAttribute('data-pos', i - cur);
        sh.tabIndex = i === cur ? 0 : -1;
        sh.setAttribute('role', 'button');
        sh.setAttribute('aria-hidden', i === cur ? 'false' : 'true');
        if (i === cur) sh.setAttribute('aria-label', sh.textContent.trim() + ' (tap or press Enter to tear)');
      });
    }
    function finish() {
      tear.classList.add('is-done'); if (doneEl) doneEl.hidden = false;
      if (!unlocked) { unlock(); track('Lead', { content_name: 'Discount unlocked' }); trackCustom('DiscountUnlocked'); }
      if (doneEl) setTimeout(function () { doneEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150);
    }
    function ripOff(sh) {
      var half = sh.querySelectorAll('.half');
      sh.classList.add('snap');
      Array.prototype.forEach.call(half, function (h) { h.style.setProperty('--p', 1); });
      setTimeout(function () { cur++; if (cur >= sheets.length) { sheets.forEach(function (x) { x.classList.add('gone'); }); finish(); } else place(); }, 420);
    }
    function setP(sh, p) { Array.prototype.forEach.call(sh.querySelectorAll('.half'), function (h) { h.style.setProperty('--p', p); }); }
    sheets.forEach(function (sh, i) {
      var y0 = null, moved = false;
      sh.addEventListener('pointerdown', function (e) {
        if (i !== cur) return;
        y0 = e.clientY; moved = false; sh.classList.remove('snap');
        try { sh.setPointerCapture(e.pointerId); } catch (x) {}
      });
      sh.addEventListener('pointermove', function (e) {
        if (y0 === null) return;
        var dy = e.clientY - y0;
        if (Math.abs(dy) > 6) moved = true;
        setP(sh, Math.max(0, Math.min(1, dy / (sh.offsetHeight * 0.8))));
      });
      function end(e) {
        if (y0 === null) return;
        var dy = e.clientY - y0; y0 = null; sh.classList.add('snap');
        if (!moved || dy / (sh.offsetHeight * 0.8) > 0.35) ripOff(sh); else setP(sh, 0);
      }
      sh.addEventListener('pointerup', end);
      sh.addEventListener('pointercancel', function () { y0 = null; sh.classList.add('snap'); setP(sh, 0); });
      sh.addEventListener('keydown', function (e) { if (i === cur && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); sh.classList.add('snap'); ripOff(sh); } });
    });
    if (unlocked) { sheets.forEach(function (x) { x.classList.add('gone'); }); tear.classList.add('is-done'); if (doneEl) doneEl.hidden = false; }
    else place();
  }

  // ---- Copy the coupon code ----
  $all('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var code = btn.getAttribute('data-copy'), done = btn.getAttribute('data-copied'), label = btn.textContent;
      function ok() { btn.textContent = done; setTimeout(function () { btn.textContent = label; }, 1800); }
      try { navigator.clipboard.writeText(code).then(ok, ok); } catch (e) { ok(); }
    });
  });

  // ---- "A look inside": endless auto-scrolling carousel (same base as the Active Tu Ingles mind-map carousel) ----
  // Two identical groups; the scroll position wraps between them. Swipe/drag works both ways; a touch or drag
  // holds the motion for a moment; the pause button (or a tap) stops and resumes it.
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  $all('.preview-carousel').forEach(function (el) {
    var group = el.querySelector('.carousel-group');
    if (!group) return;
    var duration = 50; // seconds to travel one full group
    var pos = 0, userPaused = false, touching = false, resumeAt = 0, last = 0, down = null, moved = false, visible = true;
    var pauseBtn = el.parentNode.querySelector('[data-pause]');
    function width() { return group.offsetWidth; }
    function wrap() {
      var g = width(); if (!g) return;
      if (pos < g * 0.25) pos += g; else if (pos > g * 1.25) pos -= g;
      el.scrollLeft = pos;
    }
    function holdOff(ms) { resumeAt = Date.now() + ms; }
    function setPaused(p) {
      userPaused = p; el.classList.toggle('is-paused', p);
      if (pauseBtn) pauseBtn.setAttribute('aria-label', p ? 'Resume the moving carousel' : 'Pause the moving carousel');
    }
    function tick(t) {
      var dt = last ? Math.min(t - last, 64) : 16; last = t;
      var g = width();
      if (g && visible && !reduce && !userPaused && !touching && !down && Date.now() >= resumeAt) { pos += (g / duration) * (dt / 1000); wrap(); }
      requestAnimationFrame(tick);
    }
    function init() { var g = width(); if (!g) return false; pos = g * 0.5; el.scrollLeft = pos; return true; }
    el.addEventListener('scroll', function () {
      if (Math.abs(el.scrollLeft - pos) > 1.5) {
        pos = el.scrollLeft; holdOff(2500);
        var g = width(); if (g && (pos < g * 0.25 || pos > g * 1.25)) wrap();
      }
    }, { passive: true });
    el.addEventListener('touchstart', function () { touching = true; }, { passive: true });
    el.addEventListener('touchend', function () { touching = false; holdOff(2500); }, { passive: true });
    el.addEventListener('touchcancel', function () { touching = false; holdOff(2500); }, { passive: true });
    el.addEventListener('pointerdown', function (e) { moved = false; if (e.pointerType !== 'mouse' || e.button !== 0) return; down = { x: e.clientX, left: el.scrollLeft }; });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - down.x;
      if (Math.abs(dx) > 6) { moved = true; el.classList.add('is-dragging'); }
      if (moved) { pos = down.left - dx; wrap(); }
    });
    window.addEventListener('pointerup', function () { if (!down) return; down = null; el.classList.remove('is-dragging'); holdOff(2500); });
    el.addEventListener('click', function () { if (moved) { moved = false; return; } setPaused(!userPaused); });
    if (pauseBtn) pauseBtn.addEventListener('click', function () { setPaused(!userPaused); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.1 }).observe(el);
    if (reduce) setPaused(true);
    function start() { if (!init()) return; requestAnimationFrame(tick); }
    if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
  });
})();
