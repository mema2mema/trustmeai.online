
window.TM = window.TM || {};
TM.modal = { open:(id)=>document.getElementById(id)?.classList.add('show'),
             close:(id)=>document.getElementById(id)?.classList.remove('show') };

async function tmOpenDeposit(){ TM.modal.open('mDeposit');
  const box=document.getElementById('tmDepositInfo'); box.innerHTML='<span class="tm2-note">Generating address…</span>';
  try{ const r=await fetch(API+'/wallet/deposit-address',{credentials:'include'}).then(r=>r.json());
    box.innerHTML=`<div class="row"><img id="tmDepositQR" class="qr" alt="QR"/><div><div class="muted">TRC20 Address</div><code>${r.address}</code></div></div>`;
    document.getElementById('tmDepositQR').src=r.qr;
  }catch{ box.innerHTML='<span class="tm2-note">Failed to load address.</span>'; } }
async function tmTopupDemo(){ const amt=Number(document.getElementById('tmTopupAmt').value||0);
  if(!(amt>0))return alert('Enter amount>0');
  const r=await fetch(API+'/wallet/mock-credit',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:amt})}).then(r=>r.json());
  document.getElementById('tmDepositMsg').textContent='Balance updated: '+Number(r.balance_available||0).toFixed(2); }

async function tmOpenWithdraw(){ TM.modal.open('mWithdraw'); await tmLoadBal(); }
async function tmLoadBal(){ try{ const r=await fetch(API+'/wallet/balance',{credentials:'include'}).then(r=>r.json());
  document.getElementById('tmBal').textContent=Number(r.balance_available||0).toFixed(2)+' USDT'; }catch{ document.getElementById('tmBal').textContent='—'; } }
async function tmSubmitWithdraw(){ const addr=tmWAddr.value.trim(); const amt=Number(tmWAmt.value||0);
  if(!addr||!(amt>0))return alert('Fill address and amount');
  await fetch(API+'/wallet/withdraw',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({address:addr,amount:amt})});
  tmWMsg.textContent='Withdraw request submitted.'; }

async function tmOpenPlan(){ TM.modal.open('mPlan'); }
async function tmActivatePlan(){ const tier=tmTier.value; const amount=Number(tmPAmt.value||0); const days=Number(tmDays.value||0);
  if(!(amount>0))return alert('Enter amount');
  const r=await fetch(API+'/plans/activate',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({tier,amount,days})}).then(r=>r.json());
  tmPlanMsg.textContent=r.ok?'Plan activated.':(r.error||'Failed'); }
async function tmOpenAsset(symbol){ TM.modal.open('mAsset'); const box=document.getElementById('tmAssetBox'); box.innerHTML='Loading…';
  try{ const r=await fetch(API+'/wallet/assets',{credentials:'include'}).then(r=>r.json()); const a=(r.assets||[]).find(x=>x.symbol===symbol);
    if(!a){ box.textContent='Not found.'; return; } box.innerHTML=`<div><b>${a.symbol}</b> <span class="muted">(${a.type})</span></div><div>Value: <b>${Number(a.value||0).toFixed(2)}</b></div><div class="muted">Updated: ${new Date(a.updated_at).toLocaleString()}</div>`;
  }catch{ box.textContent='Error'; } }
