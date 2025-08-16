
// ---- Wallet helpers (localStorage-based) ----
function tm_getTxs(){ try{return JSON.parse(localStorage.getItem('tm_tx')||'[]')}catch(e){return[]} }
function tm_setTxs(arr){ try{localStorage.setItem('tm_tx', JSON.stringify(arr||[]))}catch(e){} }
function tm_addTx(tx){ const list = tm_getTxs(); list.push(tx); tm_setTxs(list); }
function tm_now(){ return new Date().toLocaleString(); }
function tm_balance(){
  const txs = tm_getTxs();
  return txs.reduce((acc,t)=>{
    if(t.type==='deposit' && t.status==='confirmed') return acc + Number(t.amount||0);
    if(t.type==='withdraw') return acc - Number(t.amount||0) - Number(t.fee||0);
    return acc;
  }, 0);
}
function tm_updateBalanceEls(){
  const bal = tm_balance();
  const els = document.querySelectorAll('#walletAvailable, #balanceValue');
  els.forEach(el=>{ if(el) el.textContent = bal.toFixed(2); });
}
document.addEventListener('DOMContentLoaded', tm_updateBalanceEls);


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


function bindActivatePlan(){
  document.querySelectorAll('[data-tier]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const tier = btn.dataset.tier;
      const min = Number(btn.dataset.min||0);
      const max = Number(btn.dataset.max||0);
      const modal = document.createElement('div');
      modal.style.position='fixed'; modal.style.inset='0'; modal.style.background='rgba(0,0,0,.55)';
      modal.style.display='flex'; modal.style.alignItems='center'; modal.style.justifyContent='center'; modal.style.zIndex='9999';
      modal.innerHTML = `
      <div class="card" style="width:92%;max-width:480px">
        <div class="stripe"></div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <h3 style="font-size:1.1rem;font-weight:800">Activate ${tier}</h3>
          <button id="mClose" class="btn-ghost">Close</button>
        </div>
        <div class="small" style="margin-top:.35rem">Min–Max: $${min.toLocaleString()}–$${max.toLocaleString()}</div>
        <label class="small" style="margin-top:.6rem">Amount (USDT)</label>
        <input id="mAmt" type="number" class="input" placeholder="Enter amount">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:.8rem">
          <div class="small">Funds will be deposited and plan set to active (demo)</div>
          <button id="mConfirm" class="btn">Confirm</button>
        </div>
      </div>`;
      document.body.appendChild(modal);
      modal.querySelector('#mClose').onclick=()=>modal.remove();
      modal.onclick=(e)=>{ if(e.target===modal) modal.remove(); };
      modal.querySelector('#mConfirm').onclick=()=>{
        const amt = Number(modal.querySelector('#mAmt').value||0);
        if(!(amt>0)) return alert('Enter amount');
        if(amt < min || amt > max) return alert(`Amount must be between ${min} and ${max} USDT`);
        // Record a deposit (confirmed) from plan activation
        tm_addTx({time:tm_now(), type:'deposit', amount:amt, fee:0, status:'confirmed', source:'plan-'+tier});
        tm_updateBalanceEls();
        // Append to strategy history table if present
        const tbody = document.querySelector('#historyTable tbody');
        if(tbody){
          const tr1 = document.createElement('tr');
          tr1.innerHTML = `<td>${tm_now()}</td><td>deposit</td><td>${amt.toFixed(2)}</td><td>0.00</td><td>confirmed</td>`;
          tbody.prepend(tr1);
          const tr2 = document.createElement('tr');
          tr2.innerHTML = `<td>${tm_now()}</td><td>plan-${tier}</td><td>${amt.toFixed(2)}</td><td>0.00</td><td>active</td>`;
          tbody.prepend(tr2);
        }
        alert('Plan activated and deposit recorded (demo).');
        modal.remove();
      };
    });
  });
}

