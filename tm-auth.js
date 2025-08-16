/* TMAuth — namespaced, non-invasive auth (localStorage demo) */
;(() => {
  const NS = (window.TMAuth = window.TMAuth || {});

  function jget(k, d){ try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d} }
  function jset(k, v){ try{localStorage.setItem(k, JSON.stringify(v))}catch(e){} }

  async function hash(t){
    if (crypto && crypto.subtle){
      const enc = new TextEncoder().encode(t);
      const h = await crypto.subtle.digest('SHA-256', enc);
      return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }
    try{ return btoa(t) }catch(e){ return t }
  }

  NS.register = async ({email, pass, ref}) => {
    const users = jget('tm_users', []);
    if (users.find(u=>u.email===email)) return false;
    const h = await hash(pass);
    users.push({email, pass:h, ref:ref||null, created:Date.now()});
    jset('tm_users', users);
    jset('tm_auth', {email});
    return true;
  };

  NS.login = async (email, pass) => {
    const users = jget('tm_users', []);
    const h = await hash(pass);
    const u = users.find(u=>u.email===email && u.pass===h);
    if (!u) return false;
    jset('tm_auth', {email:u.email});
    return true;
  };

  NS.auth  = () => jget('tm_auth', null);
  NS.logout = () => { localStorage.removeItem('tm_auth'); location.reload(); };

  // Optional header renderer (safe: only runs if #authArea exists)
  NS.renderHeader = () => {
    const area = document.getElementById('authArea'); if(!area) return;
    area.innerHTML = '';
    const a = NS.auth();
    if (a){
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
      reg.href = 'register.html?next=' + encodeURIComponent(here);
      reg.className = 'btn'; reg.textContent = 'Register';
      area.appendChild(login); area.appendChild(reg);
    }
  };

  document.addEventListener('DOMContentLoaded', NS.renderHeader);

  // Tiny fallback style for .btn-ghost (won't affect your theme)
  const s=document.createElement('style');
  s.textContent='.btn-ghost{padding:.45rem .8rem;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:transparent;color:inherit;text-decoration:none}.btn-ghost:hover{background:rgba(255,255,255,.06)}';
  document.head.appendChild(s);
})();