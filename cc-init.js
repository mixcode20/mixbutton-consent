/* cc-init.js */
(function () {
  // helper to load scripts after consent
  function loadScript(src, attrs) {
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    if (attrs) Object.keys(attrs).forEach(k => s.setAttribute(k, attrs[k]));
    document.head.appendChild(s);
  }

  // only load GA once
  var gaLoaded = false;
  function enableGA() {
    if (gaLoaded) return;
    gaLoaded = true;
    // GA4 tag
    loadScript('https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX');
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;

    // flip Consent Mode to granted for analytics only
    gtag('consent', 'update', {
      'analytics_storage': 'granted'
    });

    gtag('js', new Date());
    gtag('config', 'G-XXXXXXX', { anonymize_ip: true });
  }

  // Initialise banner once page finishes
  window.addEventListener('load', function () {
    window.cookieconsent.initialise({
      type: 'opt-in',                 // EU/UK: require explicit consent
      theme: 'classic',
      position: 'bottom',             // full-width bar
      palette: {
        popup:  { background: '#ffffff', text: '#0f1220' },
        button: { background: '#734573', text: '#ffffff' },
        highlight: { background: '#f3eef3', text: '#0f1220' } // right button
      },
      content: {
        message: 'We use cookies to improve your experience.',
        allow:   'Allow',
        deny:    'Decline',
        link:    'Learn more',
        href:    '/privacy-policy'
      },
      cookie: {
        // set your apex or leave empty to scope per domain
        // domain: '.yourdomain.com',
        path: '/',
        expiryDays: 180,
        secure: true
      },
      revokable: true,                // always show a small “settings” button
      location: false,                // show to everyone; avoids geo lookups
      onInitialise: function (status) {
        var didConsent = this.hasConsented();
        if (didConsent) {
          enableGA();
        }
      },
      onStatusChange: function (status) {
        var didConsent = this.hasConsented();
        if (didConsent) {
          enableGA();
        } else {
          // turn analytics off again
          if (window.gtag) {
            gtag('consent', 'update', { 'analytics_storage': 'denied' });
          }
        }
      },
      onRevokeChoice: function () {
        // user reopened and revoked: set denied again
        if (window.gtag) {
          gtag('consent', 'update', { 'analytics_storage': 'denied' });
        }
      }
    });
  });
})();
