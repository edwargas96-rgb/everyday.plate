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

  $all('a[data-free]').forEach(function (a) { a.addEventListener('click', function () { track('Lead', { content_name: 'Free recipe' }); }); });

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
      var ok = form.read.checked && form.querySelector('input[name="likely"]:checked') && form.querySelector('input[name="think"]:checked');
      var err = document.getElementById('confirm-error');
      if (!ok) { if (err) err.hidden = false; return; }
      if (err) err.hidden = true;
      unlock(); trackCustom('RecipeConfirmed'); showCongrats(true);
    });
  }

  // ---- Copy the coupon code ----
  $all('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var code = btn.getAttribute('data-copy'), done = btn.getAttribute('data-copied'), label = btn.textContent;
      function ok() { btn.textContent = done; setTimeout(function () { btn.textContent = label; }, 1800); }
      try { navigator.clipboard.writeText(code).then(ok, ok); } catch (e) { ok(); }
    });
  });

  // ---- "A look inside" carousel: auto-rotates, the active card lifts; swipe, arrows and dots work ----
  $all('.carousel').forEach(function (car) {
    var track = car.querySelector('.car-track');
    var slides = $all('.slide', track), dots = $all('.dot', car), pauseBtn = car.querySelector('[data-pause]');
    var idx = 0, timer = null, userPaused = false, hovering = false, visible = false, resume = null;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function left(i) { var s = slides[i]; return s.offsetLeft - (track.clientWidth - s.clientWidth) / 2; }
    function mark(i) {
      slides.forEach(function (s, k) { s.classList.toggle('active', k === i); });
      dots.forEach(function (d, k) { if (k === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    }
    function go(i, smooth) {
      idx = (i + slides.length) % slides.length;
      track.scrollTo({ left: left(idx), behavior: smooth === false || reduce ? 'auto' : 'smooth' });
      mark(idx);
    }
    function nearest() {
      var mid = track.scrollLeft + track.clientWidth / 2, best = 0, bd = 1e9;
      slides.forEach(function (s, k) { var d = Math.abs(s.offsetLeft + s.clientWidth / 2 - mid); if (d < bd) { bd = d; best = k; } });
      return best;
    }
    var raf;
    track.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { idx = nearest(); mark(idx); }); }, { passive: true });
    function stop() { clearInterval(timer); timer = null; }
    function play() { stop(); if (reduce || userPaused || hovering || !visible) return; timer = setInterval(function () { go(idx + 1); }, 3800); }
    function later() { clearTimeout(resume); resume = setTimeout(play, 6000); }
    car.addEventListener('mouseenter', function () { hovering = true; stop(); });
    car.addEventListener('mouseleave', function () { hovering = false; play(); });
    track.addEventListener('touchstart', function () { stop(); clearTimeout(resume); }, { passive: true });
    track.addEventListener('touchend', later, { passive: true });
    car.addEventListener('focusin', stop);
    car.addEventListener('focusout', play);
    $all('.car-btn[data-dir]', car).forEach(function (b) { b.addEventListener('click', function () { go(idx + parseInt(b.getAttribute('data-dir'), 10)); stop(); later(); }); });
    dots.forEach(function (d) { d.addEventListener('click', function () { go(parseInt(d.getAttribute('data-i'), 10)); stop(); later(); }); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); stop(); later(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); stop(); later(); }
    });
    if (pauseBtn) {
      if (reduce) { userPaused = true; pauseBtn.classList.add('paused'); pauseBtn.setAttribute('aria-label', 'Start automatic rotation'); }
      pauseBtn.addEventListener('click', function () {
        userPaused = !userPaused;
        pauseBtn.classList.toggle('paused', userPaused);
        pauseBtn.setAttribute('aria-label', userPaused ? 'Start automatic rotation' : 'Pause automatic rotation');
        if (userPaused) stop(); else play();
      });
    }
    window.addEventListener('resize', function () { go(idx, false); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) play(); else stop(); }, { threshold: 0.35 }).observe(car);
    } else { visible = true; play(); }
    requestAnimationFrame(function () { go(0, false); });
  });
})();
