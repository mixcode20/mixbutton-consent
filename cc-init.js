/* cc-init.js (GA4 + Clarity gated by consent) */
(function () {
  function loadScript(src, attrs) {
    var s = document.createElement('script');
    s.src = src; s.async = true;
    if (attrs) Object.keys(attrs).forEach(k => s.setAttribute(k, attrs[k]));
    document.head.appendChild(s);
  }

  // ---- GA4 ----
  var gaLoaded = false;
  function enableGA() {
    if (gaLoaded) return; gaLoaded = true;
    loadScript('https://www.googletagmanager.com/gtag/js?id=G-5R3C9KD1S3');
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ dataLayer.push(arguments); };

    // grant analytics after consent
    gtag('consent', 'update', { analytics_storage: 'granted' });

    gtag('js', new Date());
    gtag('config', 'G-5R3C9KD1S3', { anonymize_ip: true });
  }

  // ---- Clarity ----
  var clarityLoaded = false;
  function enableClarity() {
    if (clarityLoaded) { if (window.clarity) window.clarity('consent', true); return; }
    clarityLoaded = true;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments);};
      t=l.createElement(r); t.async=1; t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t,y);
    })(window, document, 'clarity', 'script', '54ab90qc07');

    window.clarity && window.clarity('consent', true);
  }
  function disableClarity() {
    if (window.clarity) window.clarity('consent', false);
  }

  // ---- Cookie banner init ----
  window.addEventListener('load', function () {
    window.cookieconsent.initialise({
      type: 'opt-in',
      theme: 'classic',
      position: 'bottom',
      palette: {
        popup:  { background: '#ffffff', text: '#0f1220' },
        button: { background: '#734573', text: '#ffffff' },
        highlight: { background: '#f3eef3', text: '#0f1220' }
      },
      content: {
        message: 'We use cookies to improve your experience.',
        allow:   'Allow',
        deny:    'Decline',
        link:    'Learn more',
        href:    '/privacy-policy'
      },
      cookie: { path: '/', expiryDays: 180, secure: true },
      revokable: true,
      location: false,

      onInitialise: function () {
        if (this.hasConsented()) { enableGA(); enableClarity(); }
      },
      onStatusChange: function () {
        if (this.hasConsented()) {
          enableGA(); enableClarity();
        } else {
          if (window.gtag) gtag('consent', 'update', { analytics_storage: 'denied' });
          disableClarity();
        }
      },
      onRevokeChoice: function () {
        if (window.gtag) gtag('consent', 'update', { analytics_storage: 'denied' });
        disableClarity();
      }
    });
  });
})();
