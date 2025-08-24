(function(){
  // basic state helpers
  const LS = {
    get(k, def){ try{const v=localStorage.getItem(k); return v?JSON.parse(v):def;}catch(e){return def}},
    set(k,v){ try{localStorage.setItem(k, JSON.stringify(v));}catch(e){}}
  };

  // Create / reuse UID + invite code
  function ensureIdentity(){
    let uid = LS.get('tmai_uid');
    let code = LS.get('tmai_invite_code');
    if(!uid){ uid = String(Math.floor(Math.random()*9e5)+100000); LS.set('tmai_uid', uid); }
    if(!code){ code = (Math.random().toString(36).slice(2,7)+Math.random().toString(36).slice(2,7)).toUpperCase().slice(0,6); LS.set('tmai_invite_code', code); }
    return { uid, code };
  }

  function siteOrigin(){
    try { return window.location.origin; } catch(_){ return ''; }
  }

  function buildInviteLink(code){
    // registration route — adjust if your route differs
    return siteOrigin() + '/reg/?tid=' + encodeURIComponent(code);
  }

  // Render helpers
  function setVal(id, val){ const el = document.getElementById(id); if(el){ el.value = val; el.setAttribute('value', val); el.dataset.value = val; } }
  function setText(id, txt){ const el = document.getElementById(id); if(el) el.textContent = txt; }

  function copy(id){
    const el = document.getElementById(id);
    if(!el) return;
    navigator.clipboard.writeText(el.value || el.dataset.value || '').then(()=>{
      const btn = document.querySelector('[data-copy-for="'+id+'"]');
      if(btn){ const prev = btn.textContent; btn.textContent='Copied'; setTimeout(()=>btn.textContent=prev,1200); }
    });
  }

  function renderQR(url){
    const img = document.getElementById('qrImg');
    if(!img) return;
    // Use a reliable QR API for now (static image). Swap to local generator later if desired.
    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(url);
    img.src = qrUrl;
    img.alt = 'Invite QR';
  }

  function init(){
    const id = ensureIdentity();
    const link = buildInviteLink(id.code);

    setText('uidText', '#'+id.uid);
    setVal('inviteLink', link);
    setVal('inviteCode', id.code);
    renderQR(link);

    // Fake numbers (placeholder until API wiring)
    setText('statTeamCount', '1');
    setText('statTotalReward', '0 USDT');
    setText('statToday', '0 USDT');
    setText('statMonthly', '0 USDT');

    // Copy bindings
    document.querySelectorAll('[data-copy-for]').forEach(btn => {
      btn.addEventListener('click', () => copy(btn.getAttribute('data-copy-for')));
    });
  }

  if(document.readyState !== 'loading'){ init(); }
  else document.addEventListener('DOMContentLoaded', init);
})();