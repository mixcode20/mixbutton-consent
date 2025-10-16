/* === Cookie Consent INIT (MixButton) ===================================== */
console.log('[cc-init] file loaded');

(function () {
  /* ------------ Loader: ensure CookieConsent library is present --------- */
  function loadCC(cb){
    if (window.cookieconsent && window.cookieconsent.initialise) {
      console.log('[cc-init] library already present');
      return cb();
    }
    // try jsDelivr, fall back to cdnjs
    var triedCdnjs = false;
    function load(src){
      var s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload  = function(){ console.log('[cc-init] library loaded:', src); cb(); };
      s.onerror = function(){
        console.warn('[cc-init] load failed:', src);
        if(!triedCdnjs){ triedCdnjs = true;
          load('https://cdnjs.cloudflare.com/ajax/libs/cookieconsent/3.1.1/cookieconsent.min.js');
        } else {
          console.error('[cc-init] all library loads failed');
        }
      };
      document.head.appendChild(s);
    }
    load('https://cdn.jsdelivr.net/npm/cookieconsent@3/build/cookieconsent.min.js');
  }

  /* --------------------- Helpers: GA / Clarity loaders ------------------ */
  var gaLoaded=false, clarityLoaded=false;
  function loadScript(src){ var s=document.createElement('script'); s.src=src; s.async=true; document.head.appendChild(s); }

  function enableGA(){
    if(gaLoaded) return; gaLoaded=true;
    loadScript('https://www.googletagmanager.com/gtag/js?id=G-5R3C9KD1S3');
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
    gtag('consent','update',{ analytics_storage:'granted' });
    gtag('js', new Date());
    gtag('config','G-5R3C9KD1S3',{ anonymize_ip:true });
    console.log('[cc-init] GA enabled');
  }

  function enableClarity(){
    if(clarityLoaded){ if(window.clarity) window.clarity('consent', true); return; }
    clarityLoaded = true;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+'54ab90qc07';
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window,document,"clarity","script");
    window.clarity && window.clarity('consent', true);
    console.log('[cc-init] Clarity enabled');
  }
  function disableClarity(){ if(window.clarity){ window.clarity('consent', false); } console.log('[cc-init] Clarity disabled'); }

  /* ----------------------- Manage button target step -------------------- */
  var __cc_goManage = false;   // when true, open modal directly on Step 2

  /* ----------------------- Main initialiser (after lib) ----------------- */
  function initConsent(){
    console.log('[cc-init] initialise start');

    // overlay
    const overlay = document.createElement('div');
    overlay.className = 'cc-overlay';
    document.body.appendChild(overlay);

    // prevent double init
    if (window.__cc_inited){ console.warn('[cc-init] already initialised'); return; }
    window.__cc_inited = true;

    // nuke any legacy revoke buttons just in case
    document.querySelectorAll('.cc-revoke').forEach(n=>n.remove());

    // build banner
    window.__cc = window.cookieconsent.initialise({
      type: 'opt-in',
      position: 'none',                               // custom layout
      palette: { popup:{ background:'#faf7f7', text:'#0f1220' }, button:{ background:'#431a1a', text:'#ffffff' } },
      content: { message:'', allow:'', deny:'', link:'', href:'' }, // custom UI
      revokable: false,                               // we supply our own “Privacy” button
      location: false,
      cookie: {
        path: '/',
        // domain: '.mixbutton.com',                  // set when ready; keep commented while debugging if needed
        expiryDays: 180,
        secure: true
      },

      onPopupOpen: function(){
        overlay.style.display = 'block';

        const win = document.querySelector('.cc-window');
        if (win && !win.querySelector('[data-cc-built]')) {
          win.setAttribute('data-cc-built','1');

          // STEP 1
          const s1 = document.createElement('div'); s1.className='cc-step active'; s1.id='cc-step-1';
          s1.innerHTML = `
            <h3 class="cc-heading">We respect your privacy</h3>
            <p class="cc-message">We always look to improve the experience of our website through monitoring our users' behaviour.</p>
            <div class="cc-actions">
              <button class="cc-btn secondary" id="cc-manage">Manage consent</button>
              <button class="cc-btn primary" id="cc-accept-all">Continue</button>
            </div>
          `;

          // STEP 2
          const s2 = document.createElement('div'); s2.className='cc-step'; s2.id='cc-step-2';
          s2.innerHTML = `
            <h3 class="cc-heading">Manage consent</h3>
            <div class="cc-toggles">
              <div class="cc-toggle">
                <div>
                  <h4>Strictly functional</h4>
                  <p>Required for core site functions. Always on.</p>
                </div>
                <label class="switch">
                  <input type="checkbox" checked disabled>
                  <span class="slider"></span>
                </label>
              </div>
              <div class="cc-toggle">
                <div>
                  <h4>How we improve</h4>
                  <p>Helps us understand the way you navigate the website so we can improve for the next time you visit.</p>
                </div>
                <label class="switch">
                  <input type="checkbox" id="cc-t-analytics">
                  <span class="slider"></span>
                </label>
              </div>
              <div class="cc-toggle">
                <div>
                  <h4>Your personalisation</h4>
                  <p>Personalises any Ads you may see whilst navigating on some pages.</p>
                </div>
                <label class="switch">
                  <input type="checkbox" id="cc-t-marketing">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            <div class="cc-actions">
              <button class="cc-btn secondary" id="cc-back">Go back</button>
              <button class="cc-btn primary" id="cc-save">Continue</button>
            </div>
          `;

          // replace default content
          win.innerHTML = '';
          win.appendChild(s1);
          win.appendChild(s2);

          // step helper
          const showStep = n => {
            win.querySelectorAll('.cc-step').forEach(el=>el.classList.remove('active'));
            win.querySelector('#cc-step-'+n).classList.add('active');
          };

          // wire buttons
          win.querySelector('#cc-manage').addEventListener('click', () => showStep(2));
          win.querySelector('#cc-back').addEventListener('click', () => showStep(1));

          // Accept all
          win.querySelector('#cc-accept-all').addEventListener('click', () => {
            if(window.gtag) gtag('consent','update',{ analytics_storage:'granted', ad_storage:'granted', ad_user_data:'granted', ad_personalization:'granted' });
            enableGA(); enableClarity();
            const allowBtn = document.createElement('button');
            allowBtn.className = 'cc-btn cc-allow'; allowBtn.style.display='none';
            win.appendChild(allowBtn); allowBtn.click();
          });

          // Save preferences
          win.querySelector('#cc-save').addEventListener('click', () => {
            const a = win.querySelector('#cc-t-analytics').checked;
            const m = win.querySelector('#cc-t-marketing').checked;

            gtag('consent','update',{
              analytics_storage: a ? 'granted' : 'denied',
              ad_storage:        m ? 'granted' : 'denied',
              ad_user_data:      m ? 'granted' : 'denied',
              ad_personalization:m ? 'granted' : 'denied'
            });

            if(a){ enableGA(); enableClarity(); } else { disableClarity(); }
            // TODO: add any marketing pixels gated by `m`

            const hiddenBtn = document.createElement('button');
            hiddenBtn.className = 'cc-btn ' + (a || m ? 'cc-allow' : 'cc-deny');
            hiddenBtn.style.display='none';
            win.appendChild(hiddenBtn); hiddenBtn.click();
          });
        }

        // if opened from the floating “Privacy” button, jump straight to Step 2
        if (__cc_goManage) {
          const win = document.querySelector('.cc-window');
          if (win) {
            win.querySelectorAll('.cc-step').forEach(el=>el.classList.remove('active'));
            const s2 = win.querySelector('#cc-step-2'); if (s2) s2.classList.add('active');
          }
          __cc_goManage = false;
        }
      },

      onPopupClose: function(){ overlay.style.display='none'; },

      onInitialise: function(){
        if(this.hasConsented()){ enableGA(); enableClarity(); }
      },

      onStatusChange: function(){
        if(!this.hasConsented()){
          if(window.gtag) gtag('consent','update',{ analytics_storage:'denied' });
          disableClarity();
        }
      },

      onRevokeChoice: function(){
        if(window.gtag) gtag('consent','update',{ analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied' });
        disableClarity();
      }
    });

    // Floating Privacy button (always visible; opens to Step 2)
    const manageBtn = document.createElement('button');
    manageBtn.id = 'cc-manage-btn';
    manageBtn.textContent = 'Privacy';
    document.body.appendChild(manageBtn);

    manageBtn.addEventListener('click', function(e){
      e.preventDefault();
      __cc_goManage = true;
      if (window.__cc && typeof window.__cc.open === 'function') {
        window.__cc.open();              // open without wiping choices
      } else if (window.__cc && typeof window.__cc.revokeChoice === 'function') {
        window.__cc.revokeChoice();      // fallback
      } else if (window.__cc && typeof window.__cc.reset === 'function') {
        window.__cc.reset();             // last resort
      }
    });

    console.log('[cc-init] initialise end');
  }

  // DOM ready → load library → init
  function ready(fn){ (document.readyState === 'loading') ? document.addEventListener('DOMContentLoaded', fn) : fn(); }
  ready(function(){ loadCC(initConsent); });
})();
