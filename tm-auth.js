/* TMAuth+ — namespaced auth + UI polish (zero-conflict) */
;(() => {
  const NS = (window.TMAuth = window.TMAuth || {});

  // ---------- storage helpers ----------
  function jget(k, d){ try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d} }
  function jset(k, v){ try{localStorage.setItem(k, JSON.stringify(v))}catch(e){} }

  // ---------- hashing ----------
  async function sha256(t){
    if (crypto && crypto.subtle){
      const enc = new TextEncoder().encode(t);
      const h = await crypto.subtle.digest('SHA-256', enc);
      return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }
    try{ return btoa(t) }catch(e){ return t }
  }

  // public config flags
  NS.SHOW_USER = false;  // set true to show email next to Logout
  NS.GUARD_REDIRECT = 'login.html'; // where to redirect if auth required

  // ---------- core api ----------
  NS.register = async ({email, pass, ref}) => {
    const users = jget('tm_users', []);
    if (users.find(u=>u.email===email)) return false;
    const hash = await sha256(pass);
    users.push({email, pass:hash, ref:ref||null, created:Date.now()});
    jset('tm_users', users);
    jset('tm_auth', {email});
    return true;
  };

  NS.login = async (email, pass) => {
    const users = jget('tm_users', []);
    const hash  = await sha256(pass);
    const u = users.find(u=>u.email===email && u.pass===hash);
    if (!u) return false;
    jset('tm_auth', {email:u.email});
    return true;
  };

  NS.auth  = () => jget('tm_auth', null);
  NS.logout = () => { localStorage.removeItem('tm_auth'); location.reload(); };

  // ---------- optional: header renderer ----------
  NS.renderHeader = () => {
    const area = document.getElementById('authArea'); if(!area) return;
    area.innerHTML = '';
    const a = NS.auth();
    if (a){
      if (NS.SHOW_USER){
        const span = document.createElement('span');
        span.className = 'tm-user';
        span.textContent = a.email;
        span.style.marginRight = '10px';
        span.style.opacity = '.85';
        area.appendChild(span);
      }
      const out = document.createElement('button');
      out.className = 'btn';
      out.textContent = 'Logout';
      out.onclick = NS.logout;
      area.appendChild(out);
    } else {
      const here = (location.pathname.split('/').pop()||'index.html');
      const login = document.createElement('a');
      login.href = 'login.html?next=' + encodeURIComponent(here);
      login.className = 'btn-ghost'; login.textContent = 'Login';
      const reg = document.createElement('a');
      reg.href   = 'register.html?next=' + encodeURIComponent(here);
      reg.className = 'btn'; reg.textContent = 'Register';
      area.appendChild(login); area.appendChild(reg);
    }
  };

  // ---------- optional: page guard ----------
  function guardIfRequired(){
    const body = document.body;
    if (!body) return;
    if (body.getAttribute('data-auth') === 'required'){
      if (!NS.auth()){
        const here = (location.pathname.split('/').pop()||'index.html');
        location.href = NS.GUARD_REDIRECT + '?next=' + encodeURIComponent(here);
      }
    }
  }

  // ---------- optional: active-link highlight ----------
  function highlightActiveNav(){
    const nav = document.querySelector('nav, .nav');
    if(!nav) return;
    const links = nav.querySelectorAll('a[href]');
    const here  = location.pathname.split('/').pop() || 'index.html';
    let matched = null;
    links.forEach(a=>{
      const href = a.getAttribute('href')||'';
      if (href === here || (here === '' && (href === './' || href === '/'))){
        matched = a;
      } else if (!matched && href && here.startsWith(href)){
        matched = a;
      }
    });
    if (matched){
      matched.classList.add('active');
      // inject minimal style if site doesn't have it
      const s = document.createElement('style');
      s.textContent = `.nav a.active, nav a.active{ text-decoration:underline; text-underline-offset:6px }`;
      document.head.appendChild(s);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    NS.renderHeader();
    guardIfRequired();
    highlightActiveNav();
  });

  // tiny style for ghost button (only if missing in theme)
  const s=document.createElement('style');
  s.textContent='.btn-ghost{padding:.45rem .8rem;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:transparent;color:inherit;text-decoration:none}.btn-ghost:hover{background:rgba(255,255,255,.06)} .tm-user{font-size:.9rem}';
  document.head.appendChild(s);
})();