
/**
 * TrustMe AI - Invite Friends addon
 * - Works as stand-alone page (invite.html) and as SPA modal (window.openInviteModal())
 * - Generates UID + Invite Code in localStorage, builds link, renders QR
 */
(function(){
  const LS_UID = 'tmai_uid';
  const LS_CODE = 'tmai_invite_code';
  const LS_RECORDS = 'tmai_invite_records';
  const LS_TEAM = 'tmai_team_stats';
  function uid(){ return localStorage.getItem(LS_UID) || (()=>{const v='1' + Math.floor(100000+Math.random()*900000); localStorage.setItem(LS_UID, v); return v;})(); }
  function code(){ return localStorage.getItem(LS_CODE) || (()=>{const v = (Math.random().toString(36).slice(2,6)+Math.random().toString(36).slice(2,6)).toUpperCase().slice(0,6); localStorage.setItem(LS_CODE, v); return v;})(); }
  function origin(){ try { return location.origin; } catch(e){ return 'https://trustmeai.online'; } }
  function link(){ return origin() + '/reg/?tid=' + code(); }
  function getStats(){
    try{ return JSON.parse(localStorage.getItem(LS_TEAM)||'{}'); }catch(e){ return {}; }
  }
  function setStats(v){ localStorage.setItem(LS_TEAM, JSON.stringify(v||{})); }

  function copy(text){
    navigator.clipboard && navigator.clipboard.writeText(text).then(()=>toast('Copied')).catch(()=>fallback());
    function fallback(){ const t=document.createElement('textarea'); t.value=text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); toast('Copied'); }
  }
  function toast(msg){
    const n = document.createElement('div');
    n.textContent = msg;
    n.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#111a2a;color:#e6eefc;border:1px solid rgba(255,255,255,.1);padding:10px 14px;border-radius:10px;z-index:99999';
    document.body.appendChild(n);
    setTimeout(()=>{ n.remove(); }, 900);
  }

  function renderInto(root){
    // Fill data
    const inv = link();
    const codeEl = root.querySelector('#inviteCode');
    const linkEl = root.querySelector('#inviteLink');
    const uidEl = root.querySelector('#uidSlot');
    if(codeEl) codeEl.value = code();
    if(linkEl) linkEl.value = inv;
    if(uidEl) uidEl.textContent = uid();

    // QR
    try{
      const q = new QRCode();
      q.addData(inv);
      q.make();
      const holder = root.querySelector('#qrcode');
      if(holder){ holder.innerHTML = ''; q.toCanvas(holder, 6); }
    }catch(e){ console.error(e); }

    // Copy buttons
    root.querySelectorAll('[data-copy]').forEach(btn=>{
      btn.onclick = ()=>{
        const target = btn.getAttribute('data-copy');
        const el = root.querySelector(target);
        if(el){ copy(el.value || el.textContent); }
      };
    });

    // Stats (placeholder – can be fed by API later)
    const st = getStats();
    const num = st.teamNumber || 0;
    const reward = st.totalReward || 0;
    const today = st.today || 0;
    const month = st.month || 0;
    setKV('#kv-team', num);
    setKV('#kv-reward', reward + ' USDT');
    setKV('#kv-today', today + ' USDT');
    setKV('#kv-month', month + ' USDT');
    function setKV(sel,val){ const b=root.querySelector(sel+' b'); if(b) b.textContent = val; }
  }

  // Modal for SPA
  window.openInviteModal = function(){
    const modal = document.createElement('div');
    modal.className = 'tm-modal';
    modal.innerHTML = `
      <div class="sheet card">
        <div class="header" style="position:sticky;top:0">
          <button class="back" onclick="this.closest('.tm-modal').remove()" aria-label="Close">✕</button>
          <div><b>Invite Friends</b><div style="color:var(--tm-muted);font-size:12px">Share your TrustMe AI link</div></div>
        </div>
        ${inviteInnerHTML()}
      </div>`;
    document.body.appendChild(modal);
    renderInto(modal);
  };

  function inviteInnerHTML(){
    return `
    <div class="container">
      <div class="row">
        <section class="card">
          <h1>Invite Friends</h1>
          <div class="qr-wrap"><div id="qrcode"></div></div>
          <div class="input" style="margin-top:8px">
            <input id="inviteLink" readonly>
            <button data-copy="#inviteLink">Copy</button>
          </div>
          <div class="input" style="margin-top:8px">
            <input id="inviteCode" readonly>
            <button data-copy="#inviteCode">Copy</button>
          </div>
          <div class="footer-note">Your UID: <b id="uidSlot"></b></div>
        </section>
        <aside class="card">
          <h2>Team Data</h2>
          <div class="grid">
            <div class="kv" id="kv-team"><small>Team Number</small><b>0</b></div>
            <div class="kv" id="kv-reward"><small>Total Reward</small><b>0 USDT</b></div>
            <div class="kv" id="kv-today"><small>Today's Earnings</small><b>0 USDT</b></div>
            <div class="kv" id="kv-month"><small>Monthly Income</small><b>0 USDT</b></div>
          </div>
          <div class="hr"></div>
          <h2>Invitation Record</h2>
          <table class="table">
            <thead><tr><th>Invitee</th><th>Date</th><th>Status</th></tr></thead>
            <tbody id="inviteList"><tr><td colspan="3" style="color:var(--tm-muted)">No records yet</td></tr></tbody>
          </table>
        </aside>
      </div>
    </div>`
  }

  // Standalone page support
  if(document.currentScript && document.currentScript.dataset.standalone === '1'){
    const page = document.querySelector('#invite-page-root');
    if(page){
      page.innerHTML = inviteInnerHTML();
      renderInto(page);
    }
  }
})();
