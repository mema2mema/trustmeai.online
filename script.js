// Helpers
const $ = (sel)=>document.querySelector(sel);

// Fees by network
const FEES = { TRC20: '~1 USDT (TRC20)', BEP20: '~0.5 USDT (BEP20)', ERC20: '~5 USDT (ERC20)' };

// Update fee preview on change
(function(){
  const sel = $('#walletNetwork'); const out = $('#feePreview');
  function update(){ if(out && sel) out.textContent = FEES[sel.value] || FEES.TRC20; }
  if(sel){ sel.addEventListener('change', update); update(); }
})();

// Generate address per network
function randHex(n){ const c='0123456789abcdef'; let s=''; for(let i=0;i<n;i++) s+=c[Math.floor(Math.random()*16)]; return s; }
function genAddress(net){
  if(net==='TRC20'){ const body='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; let s='T'; for(let i=0;i<33;i++) s+=body[Math.floor(Math.random()*body.length)]; return s; }
  return '0x'+randHex(40);
}

// Copy & QR
(function(){
  const copyBtn = $('#walletCopyBtn'); const addr = $('#walletAddress'); const qr = $('#walletQr');
  if(copyBtn){
    copyBtn.addEventListener('click', async ()=>{
      try{ await navigator.clipboard.writeText(addr.value || addr.textContent || ''); alert('Address copied'); }
      catch(e){ alert('Copy failed.'); }
    });
  }
  window.renderQR = ()=>{ if(!qr) return; qr.innerHTML=''; new QRCode(qr,{text:(addr.value||'').trim(), width:160, height:160}); };
})();

// Wallet state
const wallet = { available: 0, locked: 0 };
function renderBalances(){
  $('#walletAvailable').textContent = wallet.available.toFixed(2);
  $('#walletLocked').textContent = wallet.locked.toFixed(2);
}
renderBalances();

// History helpers
function addHistoryRow(type, amount, fee, status){
  const tbody = $("#historyTable tbody"); if(!tbody) return;
  const tr = document.createElement('tr');
  const now = new Date().toLocaleString();
  tr.innerHTML = `<td class="p-2">${now}</td><td class="p-2">${type}</td><td class="p-2">${Number(amount).toFixed(2)}</td><td class="p-2">${fee?Number(fee).toFixed(2):'0.00'}</td><td class="p-2">${status}</td>`;
  tbody.prepend(tr);
}

// Generate Deposit click
$('#btnGenerateDeposit').addEventListener('click', ()=>{
  const net = $('#walletNetwork').value;
  const address = genAddress(net);
  const addrEl = $('#walletAddress');
  if (addrEl.tagName.toLowerCase()==='input'){ addrEl.value = address; } else { addrEl.textContent = address; }
  renderQR();

  // schedule demo credit
  const amount = Number($('#demoAmount').value || 100);
  const delay = Number($('#demoDelay').value || 5);
  $('#demoStatus').textContent = `Demo deposit scheduled: +${amount} USDT in ~${delay}s...`;
  addHistoryRow('deposit', amount, 0, 'pending');
  setTimeout(()=>{
    wallet.available += amount;
    renderBalances();
    addHistoryRow('deposit', amount, 0, 'confirmed');
    $('#demoStatus').textContent = `Demo deposit confirmed: +${amount} USDT`;
  }, delay*1000);
});

// Withdraw (demo)
$('#btnWithdraw').addEventListener('click', ()=>{
  const amt = Number($('#wdAmt').value||0);
  if (!amt || amt <= 0) return alert('Enter amount');
  if (wallet.available < amt) return alert('Insufficient balance');
  wallet.available -= amt; renderBalances();
  const fee = 0; addHistoryRow('withdraw', amt, fee, 'submitted');
  alert('Withdrawal submitted (demo).');
});

// Activate Plan modal
function openModal(tier, min, max){
  const modal = document.createElement('div');
  modal.className = "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50";
  modal.innerHTML = `
    <div class="bg-white rounded-2xl w-[90%] max-w-md p-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Activate ${tier}</h3>
        <button class="px-2 py-1 rounded-lg bg-gray-100" id="mClose">✕</button>
      </div>
      <div class="mt-2 text-sm">
        <div>Min–Max: $${min.toLocaleString()}–$${max.toLocaleString()}</div>
        <div class="mt-2">
          <label class="text-sm">Amount (USDT)</label>
          <input id="mAmt" type="number" class="w-full p-2 rounded-xl border mt-1" placeholder="Enter amount" />
        </div>
      </div>
      <div class="mt-3 flex items-center justify-between">
        <div class="text-xs text-gray-500">Funds will be locked to this plan.</div>
        <button id="mConfirm" class="px-4 py-2 rounded-xl bg-green-600 text-white">Confirm</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector('#mClose').onclick = ()=> modal.remove();
  modal.onclick = (e)=>{ if(e.target===modal) modal.remove(); }
  modal.querySelector('#mConfirm').onclick = ()=>{
    const amt = Number(modal.querySelector('#mAmt').value||0);
    if(!amt || amt<=0) return alert('Enter amount');
    if(wallet.available < amt) return alert('Insufficient balance');
    wallet.available -= amt; wallet.locked += amt; renderBalances();
    addHistoryRow('lock', amt, 0, 'active');
    alert('Plan activated (demo). Funds locked.');
    modal.remove();
  };
}

// Bind buttons
document.querySelectorAll('.activate').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const tier = btn.getAttribute('data-tier');
    const min = Number(btn.getAttribute('data-min'));
    const max = Number(btn.getAttribute('data-max'));
    openModal(tier, min, max);
  });
});

