
function setActiveNav(){
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('header .nav a').forEach(a=>{
    const href = a.getAttribute('href').toLowerCase();
    if((!href && path==='index.html') || href===path) a.classList.add('active');
  });
}
document.addEventListener('DOMContentLoaded', setActiveNav);
function animateCounters(){
  document.querySelectorAll('[data-count]').forEach(el=>{
    const target = Number(el.getAttribute('data-count')) || 0;
    const dur = 1200; const start = performance.now();
    function tick(t){ const p = Math.min(1, (t-start)/dur); el.textContent = (target*p).toFixed(3) + 'W'; if(p<1) requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
  });
}
const FEES = { TRC20: '~1 USDT (TRC20)', BEP20: '~0.5 USDT (BEP20)', ERC20: '~5 USDT (ERC20)' };
function bindFees(){ const sel=document.getElementById('walletNetwork'); const out=document.getElementById('feePreview'); if(sel && out){ const fn=()=>{out.textContent=FEES[sel.value]||FEES.TRC20}; sel.addEventListener('change',fn); fn(); } }
function randHex(n){const c='0123456789abcdef';let s='';for(let i=0;i<n;i++)s+=c[Math.floor(Math.random()*16)];return s;}
function genAddress(net){if(net==='TRC20'){const b='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';let s='T';for(let i=0;i<33;i++)s+=b[Math.floor(Math.random()*b.length)];return s;}return '0x'+randHex(40);}
function bindWalletDemo(){
  const gen=document.getElementById('btnGenerateDeposit'); if(!gen) return;
  const addrEl=document.getElementById('walletAddress'); const qr=document.getElementById('walletQr');
  const amtSel=document.getElementById('demoAmount'); const delaySel=document.getElementById('demoDelay'); const status=document.getElementById('demoStatus');
  const balanceEl=document.getElementById('walletAvailable'); const copyBtn=document.getElementById('walletCopyBtn');
  if(copyBtn){ copyBtn.addEventListener('click', async ()=>{ try { await navigator.clipboard.writeText(addrEl.value || addrEl.textContent || ''); alert('Address copied'); } catch(e){ alert('Copy failed'); } }); }
  function renderQR(text){ if(!qr) return; qr.innerHTML=''; if(window.QRCode){ new QRCode(qr,{text,width:160,height:160,colorDark:'#EAF2FF',colorLight:'rgba(255,255,255,0)'}); } }
  gen.addEventListener('click', ()=>{
    const net=document.getElementById('walletNetwork').value; const addr=genAddress(net);
    if(addrEl.tagName==='INPUT') addrEl.value=addr; else addrEl.textContent=addr;
    renderQR(addr);
    const amt=Number(amtSel?.value||100), delay=Number(delaySel?.value||5);
    if(status) status.textContent=`Demo deposit scheduled: +${amt} USDT in ~${delay}s...`;
    const tbody=document.querySelector('#historyTable tbody'); if(tbody){ const tr=document.createElement('tr'); tr.innerHTML=`<td>${new Date().toLocaleString()}</td><td>deposit</td><td>${amt.toFixed(2)}</td><td>0.00</td><td>pending</td>`; tbody.prepend(tr); }
    setTimeout(()=>{ if(balanceEl){ const cur=Number(balanceEl.textContent)||0; balanceEl.textContent=(cur+amt).toFixed(2); }
      if(tbody){ const tr=document.createElement('tr'); tr.innerHTML=`<td>${new Date().toLocaleString()}</td><td>deposit</td><td>${amt.toFixed(2)}</td><td>0.00</td><td>confirmed</td>`; tbody.prepend(tr); }
      if(status) status.textContent=`Demo deposit confirmed: +${amt} USDT`; }, delay*1000);
  });
}
function bindActivatePlan(){
  document.querySelectorAll('[data-tier]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const tier=btn.dataset.tier, min=Number(btn.dataset.min),max=Number(btn.dataset.max);
      const modal=document.createElement('div');
      modal.className='fixed inset-0'; modal.style.background='rgba(0,0,0,.45)'; modal.style.display='flex'; modal.style.alignItems='center'; modal.style.justifyContent='center';
      modal.innerHTML=`
      <div class="card" style="width:92%;max-width:440px">
        <div class="stripe"></div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <h3 style="font-size:1.1rem;font-weight:800">Activate ${tier}</h3>
          <button id="mClose" class="btn-ghost">Close</button>
        </div>
        <div class="small" style="margin-top:.35rem">Min–Max: $${min.toLocaleString()}–$${max.toLocaleString()}</div>
        <label class="small" style="margin-top:.6rem">Amount (USDT)</label>
        <input id="mAmt" type="number" class="input" placeholder="Enter amount">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:.8rem">
          <div class="small">Funds will be locked to this plan (demo)</div>
          <button id="mConfirm" class="btn">Confirm</button>
        </div>
      </div>`;
      document.body.appendChild(modal);
      modal.querySelector('#mClose').onclick=()=>modal.remove();
      modal.onclick=(e)=>{ if(e.target===modal) modal.remove(); }
      modal.querySelector('#mConfirm').onclick=()=>{
        const amt=Number(modal.querySelector('#mAmt').value||0); if(!amt||amt<=0) return alert('Enter amount');
        const bal=document.getElementById('walletAvailable'); if(bal){ const cur=Number(bal.textContent)||0; if(cur<amt) return alert('Insufficient balance'); bal.textContent=(cur-amt).toFixed(2); }
        const tbody=document.querySelector('#historyTable tbody'); if(tbody){ const tr=document.createElement('tr'); tr.innerHTML=`<td>${new Date().toLocaleString()}</td><td>lock</td><td>${amt.toFixed(2)}</td><td>0.00</td><td>active</td>`; tbody.prepend(tr); }
        alert('Plan activated (demo).'); modal.remove();
      };
    });
  });
}


// ===== Simple localStorage Auth (demo) =====
function tm_ls_get(k, def){ try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(def))}catch(e){return def} }
function tm_ls_set(k, v){ try{localStorage.setItem(k, JSON.stringify(v))}catch(e){} }
async function tm_hash(text){ if(window.crypto&&window.crypto.subtle){ const enc=new TextEncoder().encode(text); const dig=await crypto.subtle.digest('SHA-256', enc); return Array.from(new Uint8Array(dig)).map(b=>b.toString(16).padStart(2,'0')).join(''); } try{return btoa(text)}catch(e){return text} }
async function tm_register({name,email,pass,ref}){ const users=tm_ls_get('tm_users',[]); if(users.find(u=>u.email===email)) return false; const hash=await tm_hash(pass); users.push({name,email,pass:hash,ref:ref||null,created:Date.now()}); tm_ls_set('tm_users',users); tm_ls_set('tm_auth',{email,name}); return true; }
async function tm_login(email,pass){ const users=tm_ls_get('tm_users',[]); const hash=await tm_hash(pass); const u=users.find(u=>u.email===email&&u.pass===hash); if(!u) return false; tm_ls_set('tm_auth',{email:u.email,name:u.name}); return true; }
function tm_logout(){ localStorage.removeItem('tm_auth'); location.reload(); }
function tm_auth(){ return tm_ls_get('tm_auth',null); }

function tm_updateAuthUI(){
  const a = tm_auth();
  const area = document.getElementById('authArea');
  if(!area) return;
  area.innerHTML = '';
  if(a){
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'Logout';
    btn.onclick = tm_logout;
    area.appendChild(btn);
  } else {
    const path = (location.pathname.split('/').pop()||'index.html');
    const login = document.createElement('a');
    login.href = 'login.html?next=' + encodeURIComponent(path);
    login.className = 'btn-ghost';
    login.textContent = 'Login';
    const reg = document.createElement('a');
    reg.href = 'register.html?next=' + encodeURIComponent(path);
    reg.className = 'btn';
    reg.textContent = 'Register';
    area.appendChild(login);
    area.appendChild(reg);
  }
}
 else { const path=(location.pathname.split('/').pop()||'index.html'); const login=document.createElement('a'); login.href='login.html?next='+encodeURIComponent(path); login.className='btn'; login.textContent='Login'; const reg=document.createElement('a'); reg.href='register.html?next='+encodeURIComponent(path); reg.className='btn'; reg.textContent='Register'; area.appendChild(login); area.appendChild(reg);} }
document.addEventListener('DOMContentLoaded', ()=>{ tm_updateAuthUI(); tm_renderAuth(); const body=document.body; if(body&&body.getAttribute('data-auth')==='required'){ if(!tm_auth()){ const next=encodeURIComponent(location.pathname.split('/').pop()||'index.html'); location.href='login.html?next='+next; } } });


// ---- Octagon tilt + parallax glow ----
function bindOctagonTilt(){
  const cards = document.querySelectorAll('.oct-card');
  cards.forEach(card=>{
    let raf = null;
    const rect = ()=>card.getBoundingClientRect();
    function onMove(e){
      const r = rect();
      const x = (e.clientX - r.left)/r.width;
      const y = (e.clientY - r.top)/r.height;
      const tiltX = (0.5 - y) * 10;
      const tiltY = (x - 0.5) * 10;
      const gx = Math.round(x*100)+'%';
      const gy = Math.round(y*100)+'%';
      if(raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{
        card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        card.style.setProperty('--gx', gx);
        card.style.setProperty('--gy', gy);
      });
    }
    function onLeave(){
      if(raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{
        card.style.transform = 'rotateX(0) rotateY(0)';
        card.style.setProperty('--gx','80%');
        card.style.setProperty('--gy','20%');
      });
    }
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
  });
}
document.addEventListener('DOMContentLoaded', bindOctagonTilt);


// -- Render auth UI reliably on every load --
function tm_renderAuth(){
  const a = tm_auth();
  const area = document.getElementById('authArea');
  if(!area) return;
  area.innerHTML = '';
  if(a){
    const out = document.createElement('button');
    out.className = 'btn';
    out.textContent = 'Logout';
    out.onclick = tm_logout;
    area.appendChild(out);
  }else{
    const path = (location.pathname.split('/').pop()||'index.html');
    const login = document.createElement('a');
    login.href = 'login.html?next=' + encodeURIComponent(path);
    login.className = 'btn-ghost';
    login.textContent = 'Login';
    const reg = document.createElement('a');
    reg.href = 'register.html?next=' + encodeURIComponent(path);
    reg.className = 'btn';
    reg.textContent = 'Register';
    area.appendChild(login);
    area.appendChild(reg);
  }
}
document.addEventListener('DOMContentLoaded', tm_renderAuth);


// ===================== DEMO WALLET CORE =====================
function tm_getTxs(){ try{return JSON.parse(localStorage.getItem('tm_tx')||'[]')}catch(e){return[]} }
function tm_setTxs(v){ try{localStorage.setItem('tm_tx', JSON.stringify(v||[]))}catch(e){} }
function tm_addTx(tx){ const list=tm_getTxs(); list.unshift(tx); tm_setTxs(list); }
function tm_now(){ return new Date().toLocaleString(); }
function tm_balance(){
  return tm_getTxs().reduce((n,t)=>{
    if(t.type==='deposit' && t.status==='confirmed') return n + Number(t.amount||0);
    if(t.type==='withdraw') return n - Number(t.amount||0) - Number(t.fee||0);
    return n;
  },0);
}
function tm_syncBalanceUI(){
  const bal = tm_balance();
  const els = document.querySelectorAll('#balanceValue, #walletAvailable');
  els.forEach(el=> el.textContent = bal.toFixed(2));
}

// ===================== STRATEGY (Activate plan) =====================
function bindStrategy(){
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-tier],[data-activate]');
    if(!btn) return;
    const tier = btn.dataset.tier || btn.dataset.activate || btn.textContent.trim();
    const min = Number(btn.dataset.min || btn.getAttribute('data-min') || 0);
    const max = Number(btn.dataset.max || btn.getAttribute('data-max') || 0);
    const modal = document.createElement('div');
    modal.style.position='fixed'; modal.style.inset='0'; modal.style.background='rgba(0,0,0,.55)';
    modal.style.display='flex'; modal.style.alignItems='center'; modal.style.justifyContent='center'; modal.style.zIndex='9999';
    modal.innerHTML=`
      <div class="card" style="width:92%;max-width:480px">
        <div class="stripe"></div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <h3 style="font-size:1.1rem;font-weight:800">Activate ${tier}</h3>
          <button id="mClose" class="btn-ghost">Close</button>
        </div>
        <div class="small" style="margin-top:.35rem">Min–Max: $${min||'—'}–$${max||'—'}</div>
        <label class="small" style="margin-top:.6rem">Amount (USDT)</label>
        <input id="mAmt" type="number" class="input" placeholder="Enter amount">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:.8rem">
          <div class="small">Funds will be deposited and plan set to active (demo)</div>
          <button id="mConfirm" class="btn">Confirm</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const close = ()=>modal.remove();
    modal.querySelector('#mClose').onclick=close;
    modal.onclick=(ev)=>{ if(ev.target===modal) close(); };
    modal.querySelector('#mConfirm').onclick=()=>{
      const amt = Number(modal.querySelector('#mAmt').value||0);
      if(!(amt>0)) return alert('Enter amount');
      if(min && amt<min) return alert('Minimum for this tier is '+min+' USDT');
      if(max && amt>max) return alert('Maximum for this tier is '+max+' USDT');
      tm_addTx({time:tm_now(), type:'deposit', amount:amt, fee:0, status:'confirmed', source:'plan-'+tier});
      // log plan activation event
      tm_addTx({time:tm_now(), type:'plan', plan:tier, amount:amt, fee:0, status:'active'});
      tm_syncBalanceUI();
      const tbody = document.querySelector('#historyTable tbody, #historyBody');
      if(tbody){
        const row = (t)=>`<tr><td>${t.time}</td><td>${t.type}</td><td>${Number(t.amount||0).toFixed(2)}</td><td>${Number(t.fee||0).toFixed(2)}</td><td>${t.status||''}</td></tr>`;
        tbody.insertAdjacentHTML('afterbegin', row({time:tm_now(),type:'plan-'+tier,amount:amt,fee:0,status:'active'}));
      }
      alert('Plan activated & deposit recorded (demo).');
      close();
    };
  });
}

// ===================== DEPOSIT PAGE =====================
function randomAddr(network){
  if(network==='TRC20') return 'T' + Math.random().toString(36).slice(2,34);
  return '0x' + Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b=>b.toString(16).padStart(2,'0')).join('');
}
function drawQR(canvas, text){
  if(!canvas) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = ()=>{ const ctx=canvas.getContext('2d'); canvas.width=200; canvas.height=200; ctx.drawImage(img,0,0,200,200); };
  img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data='+encodeURIComponent(text);
}
function bindDeposit(){
  const netSel = document.querySelector('#network, select[name="network"]');
  const genBtn = document.getElementById('genBtn') || document.querySelector('[data-action="generate-address"]');
  const addrInp = document.getElementById('addr') || document.querySelector('input[readonly][name="address"]');
  const copyBtn = document.getElementById('copyBtn') || document.querySelector('[data-action="copy-address"]');
  const qr = document.getElementById('qr') || document.querySelector('canvas.qr');
  const amountSel = document.getElementById('amountSel') || document.querySelector('input[name="amount"]');
  const delaySel = document.getElementById('delaySel') || document.querySelector('input[name="delay"]');
  const scheduleBtn = document.getElementById('scheduleBtn') || document.querySelector('[data-action="schedule-deposit"]');
  let currentAddr = (addrInp && addrInp.value) || '';

  if(genBtn){
    genBtn.addEventListener('click', ()=>{
      const net = netSel ? (netSel.value||'TRC20') : 'TRC20';
      currentAddr = randomAddr(net);
      if(addrInp) addrInp.value = currentAddr;
      drawQR(qr, currentAddr);
    });
  }
  if(copyBtn){
    copyBtn.addEventListener('click', ()=>{
      if(!currentAddr && addrInp) currentAddr = addrInp.value;
      if(!currentAddr) return;
      if(navigator.clipboard) navigator.clipboard.writeText(currentAddr);
      alert('Address copied');
    });
  }
  if(scheduleBtn){
    scheduleBtn.addEventListener('click', ()=>{
      const amt = Number((amountSel && amountSel.value) || 50);
      const delay = Number((delaySel && delaySel.value) || 5);
      if(!(amt>0)) return alert('Enter a valid amount');
      const pending = {time:tm_now(), type:'deposit', amount:amt, fee:0, status:'pending'};
      tm_addTx(pending);
      renderHistoryTable(); tm_syncBalanceUI();
      setTimeout(()=>{
        const txs = tm_getTxs();
        const i = txs.findIndex(t=>t===pending || (t.time===pending.time && t.amount===pending.amount && t.status==='pending'));
        if(i>-1){ txs[i].status='confirmed'; tm_setTxs(txs); renderHistoryTable(); tm_syncBalanceUI(); }
      }, (delay||5)*1000);
    });
  }
}

// ===================== WITHDRAW PAGE =====================
function bindWithdraw(){
  const btn = document.getElementById('withdrawBtn') || document.querySelector('[data-action="withdraw"]');
  const addr = document.getElementById('wAddr') || document.querySelector('input[name="withdraw-address"]');
  const amt = document.getElementById('wAmt') || document.querySelector('input[name="withdraw-amount"]');
  if(!btn) return;
  btn.addEventListener('click', ()=>{
    const a = addr ? addr.value.trim() : '';
    const v = Number(amt ? amt.value : 0);
    if(!a || !(a.startsWith('T') || a.startsWith('0x'))) return alert('Enter a valid address (TRC20 starts with T or EVM 0x)');
    if(!(v>0)) return alert('Enter a valid amount');
    const fee = Math.max(1, v*0.005);
    tm_addTx({time:tm_now(), type:'withdraw', amount:v, fee:fee, status:'pending', address:a});
    renderHistoryTable(); tm_syncBalanceUI();
    setTimeout(()=>{
      const txs = tm_getTxs();
      const t = txs.find(t=>t.type==='withdraw' && t.status==='pending' && t.address===a && t.amount===v);
      if(t){ t.status='confirmed'; tm_setTxs(txs); renderHistoryTable(); tm_syncBalanceUI(); }
    }, 4000);
    alert('Withdrawal submitted (demo).');
  });
}

// ===================== ASSETS / HISTORY RENDER =====================
function renderHistoryTable(){
  const tbody = document.querySelector('#historyTable tbody, #historyBody');
  if(!tbody) return;
  tbody.innerHTML='';
  const txs = tm_getTxs();
  txs.forEach(t=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${t.time||''}</td><td>${t.type||''}</td><td>${Number(t.amount||0).toFixed(2)}</td><td>${Number(t.fee||0).toFixed(2)}</td><td>${t.status||''}</td>`;
    tbody.appendChild(tr);
  });
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', ()=>{
  tm_syncBalanceUI();
  renderHistoryTable();
  const path = (location.pathname||'').toLowerCase();
  if(path.endsWith('strategy.html') || document.body.dataset.page==='strategy') bindStrategy();
  if(path.endsWith('deposit.html')  || document.body.dataset.page==='deposit') bindDeposit();
  if(path.endsWith('withdraw.html') || document.body.dataset.page==='withdraw') bindWithdraw();
});
