/* TMAuth Core — namespaced, ZERO side‑effects (no header, no guards) */
;(() => {
  const NS = (window.TMAuth = window.TMAuth || {});

  // storage helpers
  function jget(k, d){ try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(e){return d} }
  function jset(k, v){ try{localStorage.setItem(k, JSON.stringify(v))}catch(e){} }

  // hashing
  async function sha256(t){
    if (crypto && crypto.subtle){
      const enc = new TextEncoder().encode(t);
      const h = await crypto.subtle.digest('SHA-256', enc);
      return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }
    try{ return btoa(t) }catch(e){ return t }
  }

  // core api (no DOM usage)
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

  NS.auth   = () => jget('tm_auth', null);
  NS.logout = () => { localStorage.removeItem('tm_auth'); };
})();