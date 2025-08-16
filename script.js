
function setActiveNav(){
  const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  document.querySelectorAll('header .nav a').forEach(a=>{
    const href=a.getAttribute('href').toLowerCase();
    if((!href&&path==='index.html')||href===path) a.classList.add('active');
  });
}
document.addEventListener('DOMContentLoaded', setActiveNav);

function animateCounters(){
  document.querySelectorAll('[data-count]').forEach(el=>{
    const target=Number(el.getAttribute('data-count'))||0; const dur=1200; const start=performance.now();
    function tick(t){const p=Math.min(1,(t-start)/dur); el.textContent=(target*p).toFixed(3)+'W'; if(p<1) requestAnimationFrame(tick);}
    requestAnimationFrame(tick);
  });
}

function rangePct(tier){ switch(tier){ case 'T1': return [0.5,1.0]; case 'T2': return [1.0,1.5]; case 'T3': return [1.5,2.0]; case 'T4': return [2.0,3.0]; default: return [1,1.5]; } }

function randHex(n){const c='0123456789abcdef';let s='';for(let i=0;i<n;i++)s+=c[Math.floor(Math.random()*16)];return s;}
function genAddress(net){if(net==='TRC20'){const b='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';let s='T';for(let i=0;i<33;i++)s+=b[Math.floor(Math.random()*b.length)];return s;}return '0x'+randHex(40);}

function bindWalletDemo(){
  const gen=document.getElementById('btnGenerateDeposit'); if(!gen) return;
  const netSel=document.getElementById('walletNetwork');
  const addrEl=document.getElementById('walletAddress');
  const qr=document.getElementById('walletQr');
  const amtSel=document.getElementById('demoAmount');
  const delaySel=document.getElementById('demoDelay');
  const status=document.getElementById('demoStatus');
  const balanceEl=document.getElementById('walletAvailable');
  const copyBtn=document.getElementById('walletCopyBtn');

  function renderQR(text){ if(!qr) return; qr.innerHTML=''; if(window.QRCode){ new QRCode(qr,{text,width:160,height:160,colorDark:'#EAF2FF',colorLight:'rgba(255,255,255,0)'}); } }

  if(copyBtn){
    copyBtn.addEventListener('click', async ()=>{
      try{ await navigator.clipboard.writeText(addrEl.value||''); alert('Address copied'); }catch(e){ alert('Copy failed'); }
    });
  }

  gen.addEventListener('click', ()=>{
    const addr=genAddress(netSel.value); addrEl.value=addr; renderQR(addr);
    const amt=Number(amtSel.value||100); const delay=Number(delaySel.value||5);
    if(status) status.textContent=`Demo deposit scheduled: +${amt} USDT in ~${delay}s...`;
    const tbody=document.querySelector('#historyTable tbody');
    if(tbody){ const tr=document.createElement('tr'); tr.innerHTML=`<td>${new Date().toLocaleString()}</td><td>deposit</td><td>${amt.toFixed(2)}</td><td>0.00</td><td>pending</td>`; tbody.prepend(tr); }
    setTimeout(()=>{
      if(balanceEl){ const cur=Number(balanceEl.textContent)||0; balanceEl.textContent=(cur+amt).toFixed(2); }
      if(tbody){ const tr=document.createElement('tr'); tr.innerHTML=`<td>${new Date().toLocaleString()}</td><td>deposit</td><td>${amt.toFixed(2)}</td><td>0.00</td><td>confirmed</td>`; tbody.prepend(tr); }
      if(status) status.textContent=`Demo deposit confirmed: +${amt} USDT`;
    }, delay*1000);
  });
}

function openModal(html){
  const m=document.createElement('div'); m.className='modal'; m.innerHTML=html; document.body.appendChild(m); document.body.classList.add('noscroll');
  m.addEventListener('click',e=>{ if(e.target===m){ document.body.classList.remove('noscroll'); m.remove(); } });
  m.querySelectorAll('[data-close]').forEach(x=>x.addEventListener('click',()=>{document.body.classList.remove('noscroll'); m.remove();}));
  return m;
}

function bindActivatePlan(){
  document.querySelectorAll('[data-tier]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const tier=btn.dataset.tier, min=Number(btn.dataset.min), max=Number(btn.dataset.max);
      const [lo,hi]=rangePct(tier);
      const m=openModal(`
        <div class="card panel">
          <div class="stripe"></div>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h3 style="font-size:1.1rem;font-weight:800">Activate ${tier}</h3>
            <button class="btn-ghost" data-close>Close</button>
          </div>
          <div class="small" style="margin-top:.35rem">Min–Max: $${min.toLocaleString()}–$${max.toLocaleString()}</div>
          <label class="small" style="margin-top:.6rem">Amount (USDT)</label>
          <input id="mAmt" type="number" class="input" placeholder="Enter amount">
          <div id="yieldPrev" class="small" style="margin-top:.5rem">Estimated daily: —</div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:.8rem">
            <div class="small">Funds will be locked to this plan (demo)</div>
            <button id="mConfirm" class="btn">Confirm</button>
          </div>
        </div>
      `);
      const amtInput=m.querySelector('#mAmt'); const yPrev=m.querySelector('#yieldPrev');
      amtInput.addEventListener('input',()=>{
        const a=Number(amtInput.value||0); if(!a){ yPrev.textContent='Estimated daily: —'; return; }
        const low=(a*lo/100).toFixed(2), high=(a*hi/100).toFixed(2);
        yPrev.textContent=`Estimated daily: ${low}–${high} USDT (${lo}%–${hi}%)`;
      });
      m.querySelector('#mConfirm').onclick=()=>{
        const amt=Number(amtInput.value||0); if(!amt||amt<=0) return alert('Enter amount');
        const bal=document.getElementById('walletAvailable'); if(bal){ const cur=Number(bal.textContent)||0; if(cur<amt) return alert('Insufficient balance'); bal.textContent=(cur-amt).toFixed(2); }
        const tbody=document.querySelector('#historyTable tbody');
        if(tbody){ const tr=document.createElement('tr'); tr.innerHTML=`<td>${new Date().toLocaleString()}</td><td>lock</td><td>${amt.toFixed(2)}</td><td>0.00</td><td>active</td>`; tbody.prepend(tr); }
        document.body.classList.remove('noscroll'); m.remove(); alert('Plan activated (demo)');
      };
    });
  });
}

function buildGainersChart(){
  const c=document.getElementById('gainersChart'); if(!c) return;
  const rows=[...document.querySelectorAll('#gainersTable tbody tr')];
  const labels=[], values=[];
  rows.forEach(r=>{ labels.push(r.children[0].textContent.trim()); values.push(parseFloat((r.children[2].textContent||'').replace('+','').replace('%',''))||0); });
  const ctx=c.getContext('2d');
  new Chart(ctx,{ type:'bar', data:{ labels, datasets:[{ label:'24h %', data:values }] },
    options:{ responsive:true, plugins:{ legend:{display:false}}, scales:{ x:{grid:{display:false}}, y:{grid:{color:'rgba(255,255,255,.08)'}, ticks:{callback:(v)=>v+'%'}}} }
  });
}

function bindSupportWidget(){
  const fab=document.getElementById('supportFab'); const panel=document.getElementById('supportPanel');
  if(!fab||!panel) return;
  fab.addEventListener('click', ()=>{ panel.classList.toggle('open'); });
  document.addEventListener('click', (e)=>{
    if(!panel.contains(e.target) && !fab.contains(e.target)) panel.classList.remove('open');
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  if (document.querySelector('[data-count]')) animateCounters();
  bindSupportWidget();
});

// v1.5 Feature modals
const FEATURE_INFO={
  transparent:{title:'Transparent Security', body:'Every transaction is traceable on-chain. We show fees, addresses, and time-stamped records to keep your funds secure and auditable.'},
  automated:{title:'Automated Trading', body:'Our bots execute 24/7 with predefined risk rules. No manual timing required — you get consistent, rules-based entries and exits.'},
  realtime:{title:'Real-Time Data', body:'We aggregate market feeds across major exchanges to react quickly to volatility spikes and changes in liquidity.'},
  risk:{title:'AI Risk Control', body:'Dynamic position sizing, layered stop-loss, and circuit breakers help protect capital in extreme conditions.'}
};
function bindFeatureCards(){
  document.querySelectorAll('[data-feature]').forEach(card=>{
    card.addEventListener('click',()=>{
      const key=card.getAttribute('data-feature');
      const info=FEATURE_INFO[key]||{title:'Info',body:'Details coming soon.'};
      openModal(`
        <div class="card panel">
          <div class="stripe"></div>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h3 style="margin:0">${info.title}</h3>
            <button class="btn-ghost" data-close>Close</button>
          </div>
          <p class="small" style="margin-top:.6rem">${info.body}</p>
        </div>
      `);
    });
  });
}
document.addEventListener('DOMContentLoaded', bindFeatureCards);

// v1.6 simple movers chart
function drawMoversChart(){
  const el=document.getElementById('moversChart'); if(!el) return;
  const ctx=el.getContext('2d');
  const labels=['XRP/USDT','ADA/USDT','BNB/USDT','SOL/USDT','DOT/USDT'];
  const values=[0.28,0.35,0.31,0.26,0.24]; // demo %
  // clear
  ctx.clearRect(0,0,el.width,el.height);
  // sizing
  const w=el.width, h=el.height; const pad=40; const bw=(w-pad*2)/labels.length-20;
  const max=Math.max(...values)*1.2;
  // axes
  ctx.strokeStyle='rgba(255,255,255,.15)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(pad,10); ctx.lineTo(pad,h-pad); ctx.lineTo(w-10,h-pad); ctx.stroke();
  // bars
  for(let i=0;i<labels.length;i++){
    const x=pad+10+i*(bw+20); const y=h-pad; const barH=(values[i]/max)*(h-pad-20);
    ctx.fillStyle='rgba(103,232,249,.55)';
    ctx.fillRect(x,y-barH,bw,barH);
    // label
    ctx.fillStyle='rgba(255,255,255,.8)'; ctx.font='12px Inter';
    ctx.fillText(labels[i], x-2, h-pad+14);
  }
}
document.addEventListener('DOMContentLoaded', drawMoversChart);

// v1.6.3 strict tier limits
const TIER_LIMITS = {
  T1:{min:50, max:999},
  T2:{min:1000, max:9999},
  T3:{min:10000, max:19999},
  T4:{min:20000, max:100000}
};
function validateTierAmount(tier, amt){
  const lim=TIER_LIMITS[tier];
  if(!lim) return {ok:false,msg:'Unknown tier'};
  if(isNaN(amt) || amt<=0) return {ok:false,msg:'Enter a valid amount'};
  if(amt<lim.min) return {ok:false,msg:`Minimum for ${tier} is ${lim.min} USDT`};
  if(amt>lim.max) return {ok:false,msg:`Maximum for ${tier} is ${lim.max} USDT`};
  return {ok:true};
}

// Hook into any modal confirm buttons dynamically created by openModal()
document.addEventListener('click', (e)=>{
  const btn=e.target.closest('[data-confirm-tier]');
  if(!btn) return;
  const tier=btn.getAttribute('data-confirm-tier');
  const input=document.querySelector('#tierAmountInput');
  const amt=parseFloat((input?.value||'0').trim());
  const v=validateTierAmount(tier, amt);
  if(!v.ok){ alert(v.msg); return; }
  // proceed with existing lock demo
  addHistoryRow(new Date(), 'lock', amt, 0, 'active');
  closeModal();
  toast(`${tier} activated with ${amt.toFixed(2)} USDT (demo)`);
});


// Bind activate buttons on strategy page
function bindStrategyActivate(){
  document.querySelectorAll('[data-tier]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const tier=btn.getAttribute('data-tier');
      showTierModal(tier);
    });
  });
}
document.addEventListener('DOMContentLoaded', bindStrategyActivate);

// v1.6.4: ensure single Activate modal by hijacking buttons (strip old listeners)
function hijackActivateButtons(){
  document.querySelectorAll('[data-tier]').forEach(btn=>{
    // replace node to remove any existing listeners bound earlier
    const clone=btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
    clone.addEventListener('click', (ev)=>{
      ev.preventDefault(); ev.stopPropagation();
      const tier=clone.getAttribute('data-tier');
      showTierModal(tier);
    });
  });
}
document.addEventListener('DOMContentLoaded', hijackActivateButtons);

// v1.6.5: minimal modal UI (style like picture 1) + guaranteed submit
    addHistoryRow(new Date(), 'lock', amt, 0, 'active');
    closeModal();
    toast(`${tier} activated with ${amt.toFixed(2)} USDT (demo)`);
  }, {once:true});
}

function showTierModal(tier){
  const lim=TIER_LIMITS[tier];
  const rangeTxt = lim ? `${lim.min.toLocaleString()}–${lim.max.toLocaleString()} USDT` : '';
  const modalHTML = `
    <div class="card panel" style="padding:1rem 1rem 1.25rem">
      <div class="stripe"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
        <h3 style="margin:0">Activate ${tier}</h3>
        <button class="btn-ghost" data-close>Close</button>
      </div>
      <p class="small" style="opacity:.85;margin:.25rem 0 .75rem 0">Min–Max: ${rangeTxt}</p>
      <input id="tierAmountInput" type="text" inputmode="decimal" placeholder="Enter amount" class="input" style="width:100%"/>
      <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:.9rem">
        <button class="btn-ghost" data-close>Cancel</button>
        <button class="btn" id="tierConfirmBtn">Confirm</button>
      </div>
    </div>`;
  openModal(modalHTML);
  bindTierConfirm(tier);
}

// v1.6.6: robust confirm flow
window.TIER_LIMITS = window.TIER_LIMITS || {
  T1:{min:50,max:999},
  T2:{min:1000,max:9999},
  T3:{min:10000,max:19999},
  T4:{min:20000,max:100000}
};
function sanitizeNumber(val){
  // remove commas/spaces and convert
  return parseFloat(String(val).replace(/[,\s]/g,''));
}
function bindTierConfirm(tier){
  const btn=document.getElementById('tierConfirmBtn');
  const input=document.getElementById('tierAmountInput');
  if(!btn || !input) return;
  const submit=()=>{
    const amt=sanitizeNumber(input.value||'0');
    const v=validateTierAmount(tier, amt);
    if(!v.ok){ alert(v.msg); return; }
    addHistoryRow(new Date(), 'lock', amt, 0, 'active');
    closeModal();
    toast(`${tier} activated with ${amt.toFixed(2)} USDT (demo)`);
  };
  btn.addEventListener('click', submit, {once:true});
  input.addEventListener('keydown', (e)=>{
    if(e.key==='Enter'){ e.preventDefault(); submit(); }
  });
}
