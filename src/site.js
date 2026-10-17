// Pixel events + checkout link handling. No health data is ever sent.
(function () {
  var S = window.__SITE__ || {};
  function track(name, params) { try { if (S.pixel && window.fbq) window.fbq('track', name, params); } catch (e) {} }
  var base = { content_name: S.contentName, value: S.value, currency: S.currency };

  if (S.page === 'home') track('ViewContent', base);

  if (S.page === 'thank-you') {
    var q = new URLSearchParams(location.search), v = parseFloat(q.get('value'));
    track('Purchase', { content_name: S.contentName, value: isNaN(v) ? S.value : v, currency: S.currency });
  }

  var links = document.querySelectorAll('a[data-checkout]');
  var pass = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];
  Array.prototype.forEach.call(links, function (a) {
    var href = a.getAttribute('href');
    if (href.charAt(0) === '#') return;
    if (S.passQuery) {
      try {
        var u = new URL(href), cur = new URLSearchParams(location.search);
        pass.forEach(function (k) { if (cur.get(k) && !u.searchParams.has(k)) u.searchParams.set(k, cur.get(k)); });
        a.setAttribute('href', u.toString());
      } catch (e) {}
    }
    a.addEventListener('click', function () { track('InitiateCheckout', base); });
  });
})();
