
// Utilities
const COMM = { L1: 0.10, L2: 0.05 }; // demo commission rates
const $ = (sel,ctx=document)=>ctx.querySelector(sel);
const $$ = (sel,ctx=document)=>Array.from(ctx.querySelectorAll(sel));
const fmt = n => Number(n).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2});
const nowStr = ()=> new Date().toLocaleString();

// Local storage keys
const K = {
  hist: 'tm_hist',  // [{time,type,amount,fee,status,extra}]
  addr: 'tm_addr',  // {TRC20:'T...',BEP20:'0x..',ERC20:'0x..'}
};

const store = {
  get(k,def){ try{ return JSON.parse(localStorage.getItem(k)) ?? def }catch(e){ return def }},
  set(k,v){ localStorage.setItem(k, JSON.stringify(v)) }
};

function pushHist(row){
  const all = store.get(K.hist, []);
  all.unshift(row);
  store.set(K.hist, all);
  // refresh if table exists
  const tbody = $('#hist tbody');
  if(tbody){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.time}</td><td>${row.type}</td><td>${fmt(row.amount)}</td><td>${fmt(row.fee||0)}</td><td>${row.status}</td>`;
    tbody.prepend(tr);
  }
}

function loadHist(){
  const tbody = $('#hist tbody');
  if(!tbody) return;
  tbody.innerHTML='';
  store.get(K.hist, []).forEach(row=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.time}</td><td>${row.type}</td><td>${fmt(row.amount)}</td><td>${fmt(row.fee||0)}</td><td>${row.status}</td>`;
    tbody.appendChild(tr);
  });
}

// Simple pseudo-QR: render deterministic blocks from string hash
function drawPseudoQR(canvas, text){
  if(!canvas) return;
  const n=21, ctx=canvas.getContext('2d'), size=canvas.width, cell = Math.floor(size/n);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0,0,size,size);
  let h=0; for(let i=0;i<text.length;i++){ h = ((h<<5)-h) + text.charCodeAt(i); h|=0; }
  for(let y=0;y<n;y++){
    for(let x=0;x<n;x++){
      h = (h * 1664525 + 1013904223)>>>0;
      if((h & 0xF) > 9){
        ctx.fillStyle = (h & 1) ? '#9AE6B4' : '#86E5F7';
        ctx.fillRect(x*cell, y*cell, cell-1, cell-1);
      }
    }
  }
}

// PAGE: Strategy
(()=>{
  const modal = $('#activateModal');
  if(!modal) return;
  const mTitle = $('#mTitle'), mRange = $('#mRange'), mAmount = $('#mAmount');
  let currentTier = null, min=0, max=0;
  $$('.open-activate').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const card = btn.closest('.tier');
      currentTier = card.dataset.tier;
      min = Number(card.dataset.min); max = Number(card.dataset.max);
      mTitle.textContent = `Activate ${currentTier}`;
      mRange.textContent = `Min–Max: $${min.toLocaleString()}–$${max.toLocaleString()} USDT`;
      mAmount.value='';
      modal.style.display='flex';
      mAmount.focus();
    });
  });
  $('#mCancel').onclick = ()=> modal.style.display='none';
  modal.addEventListener('click', (e)=>{ if(e.target===modal) modal.style.display='none'; });
  $('#mConfirm').onclick = ()=>{
    const amt = Number(mAmount.value);
    if(!amt || amt<min || amt>max){
      alert(`Amount must be between ${min} and ${max}.`); return;
    }
    pushHist({time:nowStr(), type:'lock', amount:amt, fee:0, status:'active', extra:{tier:currentTier}});
    modal.style.display='none';
  };
  loadHist();
})();

// PAGE: Deposit
(()=>{
  const net = $('#net');
  if(!net) return;
  const addrEl = $('#addr'), canvas = $('#qr'), copyBtn=$('#copyBtn'), scheduleBtn=$('#scheduleBtn'), demoAmt=$('#demoAmt'), demoDelay=$('#demoDelay');
  function genAddr(){
    const n = net.value;
    let val = (n==='TRC20'?'T':'0x') + Math.random().toString(36).slice(2,10) + Math.random().toString(36).slice(2,6);
    const map = store.get(K.addr, {}); map[n]=val; store.set(K.addr, map);
    addrEl.value = val; drawPseudoQR(canvas, val);
  }
  function refreshAddr(){
    const val = (store.get(K.addr,{})[net.value]) || '';
    addrEl.value = val; drawPseudoQR(canvas, val || 'trustme');
  }
  $('#copyBtn').onclick = ()=>{ navigator.clipboard.writeText(addrEl.value||''); copyBtn.textContent='Copied!'; setTimeout(()=>copyBtn.textContent='Copy',1400); };
  $('#net').onchange = refreshAddr;
  $('#scheduleBtn').onclick = ()=>{
    const amount = Number(demoAmt.value||0), delay = Math.max(1, Number(demoDelay.value||5));
    if(!addrEl.value){ alert('Generate an address first.'); return;}
    scheduleBtn.textContent='Scheduled...';
    setTimeout(()=>{
      pushHist({time:nowStr(), type:'deposit', amount, fee:0, status:'confirmed'});
      scheduleBtn.textContent='Schedule demo deposit';
    }, delay*1000);
  }
  $('#addr').value='';
  $('#GenerateAddress'); // noop placeholder
  $('#net').dispatchEvent(new Event('change'));
  // Attach generate action
  const genBtn = document.querySelector('button.btn.primary'); // not reliable on this page
  // Instead select by text content
  document.querySelectorAll('button').forEach(b=>{
    if(b.textContent.includes('Generate Address')) b.onclick = genAddr;
  });
  // But we also add handler directly to schedule generator if present
  const gen = Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Generate Address');
  if(gen) gen.onclick = genAddr;
  // History on load
  loadHist();
})();

// PAGE: Withdraw
(()=>{
  const wAddr = $('#wAddr'); if(!wAddr) return;
  const wAmt = $('#wAmt'), wSubmit = $('#wSubmit');
  wSubmit.onclick = ()=>{
    const a = (wAddr.value||'').trim(); const n = Number(wAmt.value||0);
    if(!a || (!a.startsWith('T') && !a.startsWith('0x'))){ alert('Enter a valid address (TRC20 T... or EVM 0x...)'); return; }
    if(n<=0){ alert('Enter a valid amount'); return; }
    pushHist({time:nowStr(), type:'withdraw', amount:n, fee:1, status:'pending'});
    alert('Withdrawal submitted (demo).');
  };
  loadHist();
})();



// --- Auto language (EN/DA) for common labels ---
(function(){
  try {
    var lang = (navigator.language || '').toLowerCase();
    var isDA = lang.startsWith('da');
    // Map of [selectorText, en, da]
    var L = [
      ['a[href="deposit.html"]', 'Deposit', 'Indbetal'],
      ['a[href="withdraw.html"]', 'Withdraw', 'Hæv'],
      ['a[href="strategy.html"]', 'Strategy', 'Strategi'],
      ['a[href="assets.html"]', 'Assets', 'Aktiver'],
      ['a[href="index.html"]', 'Home', 'Start'],
      ['h1', 'Deposit (USDT)', 'Indbetal (USDT)'],
      ['h1', 'Withdraw (USDT)', 'Hæv (USDT)'],
    ];
    if (isDA) {
      L.forEach(function(row){
        var sel = row[0], en = row[1], da = row[2];
        document.querySelectorAll(sel).forEach(function(el){
          if ((el.textContent||'').trim() === en) el.textContent = da;
        });
      });
    }
  } catch(e) {}
})();