/* GA/Clarity loaders (deferred) */
var gaLoaded=false, clarityLoaded=false;
function loadScript(src){var s=document.createElement('script');s.src=src;s.async=true;document.head.appendChild(s);}

/* GA4 */
function enableGA(){
  if(gaLoaded) return; gaLoaded=true;
  loadScript('https://www.googletagmanager.com/gtag/js?id=G-5R3C9KD1S3');
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
  gtag('consent','update',{ analytics_storage:'granted' });
  gtag('js', new Date());
  gtag('config','G-5R3C9KD1S3',{ anonymize_ip:true });
}

/* Microsoft Clarity */
function enableClarity(){
  if(clarityLoaded){ if(window.clarity) window.clarity('consent', true); return; }
  clarityLoaded=true;
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+'54ab90qc07';
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window,document,"clarity","script");
  window.clarity && window.clarity('consent', true);
}
function disableClarity(){ if(window.clarity) window.clarity('consent', false); }

/* Initialise + custom UI */
window.addEventListener('load', function(){
  // Overlay
  const overlay = document.createElement('div');
  overlay.className='cc-overlay';
  document.body.appendChild(overlay);

  // Keep a handle to the instance
  window.__cc = window.cookieconsent.initialise({
    type:'opt-in',
    position:'none', /* custom layout */
    palette:{ popup:{ background:'#faf7f7', text:'#0f1220' }, button:{ background:'#431a1a', text:'#ffffff' } },
    content:{ message:'', allow:'', deny:'', link:'', href:'' }, /* custom UI */
    revokable:true,
    location:false,
    cookie:{
      path:'/',
      domain:'.mixbutton.com', /* set your apex domain */
      expiryDays:180,
      secure:true
    },

    onPopupOpen:function(){
      overlay.style.display='block';

      /* Build custom steps once */
      const win = document.querySelector('.cc-window');
      if(win && !win.querySelector('[data-cc-built]')){
        win.setAttribute('data-cc-built','1');

        /* STEP 1 */
        const s1 = document.createElement('div'); s1.className='cc-step active'; s1.id='cc-step-1';
        s1.innerHTML = `
          <h3 class="cc-heading">We respect your privacy</h3>
          <p class="cc-message">We always look to improve the experience of our website through monitoring our users' behaviour.</p>
          <div class="cc-actions">
            <button class="cc-btn secondary" id="cc-manage">Manage consent</button>
            <button class="cc-btn primary" id="cc-accept-all">Continue</button>
          </div>
        `;

        /* STEP 2 */
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

        // Replace default content
        win.innerHTML = '';
        win.appendChild(s1);
        win.appendChild(s2);

        // Step helper
        const showStep = n => {
          win.querySelectorAll('.cc-step').forEach(el=>el.classList.remove('active'));
          win.querySelector('#cc-step-'+n).classList.add('active');
        };

        // Accept all
        win.querySelector('#cc-accept-all').addEventListener('click', () => {
          if(window.gtag) gtag('consent','update',{ analytics_storage:'granted', ad_storage:'granted', ad_user_data:'granted', ad_personalization:'granted' });
          enableGA(); enableClarity();

          // close via library (allow)
          const allowBtn = document.createElement('button');
          allowBtn.className = 'cc-btn cc-allow'; allowBtn.style.display='none';
          win.appendChild(allowBtn); allowBtn.click();
        });

        // Manage -> Step 2
        win.querySelector('#cc-manage').addEventListener('click', () => showStep(2));

        // Back -> Step 1
        win.querySelector('#cc-back').addEventListener('click', () => showStep(1));

        // Save preferences
        win.querySelector('#cc-save').addEventListener('click', () => {
          const a = win.querySelector('#cc-t-analytics').checked;
          const m = win.querySelector('#cc-t-marketing').checked;

          // Consent Mode update
          gtag('consent','update',{
            analytics_storage: a ? 'granted' : 'denied',
            ad_storage:        m ? 'granted' : 'denied',
            ad_user_data:      m ? 'granted' : 'denied',
            ad_personalization:m ? 'granted' : 'denied'
          });

          // Enable/disable scripts
          if(a){ enableGA(); enableClarity(); } else { disableClarity(); }
          // TODO: add marketing pixels here, gated by `m`

          // Close banner: allow if any non-essential is on, else deny
          const hiddenBtn = document.createElement('button');
          hiddenBtn.className = 'cc-btn ' + (a || m ? 'cc-allow' : 'cc-deny');
          hiddenBtn.style.display='none';
          win.appendChild(hiddenBtn);
          hiddenBtn.click();
        });
      }
    },

    onPopupClose:function(){ overlay.style.display='none'; },

    onInitialise:function(){
      if(this.hasConsented()){
        enableGA(); enableClarity();
      }
    },

    onStatusChange:function(){
      if(!this.hasConsented()){
        if(window.gtag) gtag('consent','update',{ analytics_storage:'denied' });
        disableClarity();
      }
    },

    onRevokeChoice:function(){
      if(window.gtag) gtag('consent','update',{ analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied' });
      disableClarity();
    }
  });

  /* Floating Privacy button (reopen modal any time) */
  const manageBtn = document.createElement('button');
  manageBtn.id = 'cc-manage-btn';
  manageBtn.textContent = 'Privacy';
  document.body.appendChild(manageBtn);

  manageBtn.addEventListener('click', function(e){
    e.preventDefault();
    if (window.__cc && typeof window.__cc.revokeChoice === 'function') {
      window.__cc.revokeChoice();   // resets + reopens
    } else if (window.__cc && typeof window.__cc.reset === 'function') {
      window.__cc.reset();
    } else if (window.__cc && typeof window.__cc.open === 'function') {
      window.__cc.open();
    }
  });
});
