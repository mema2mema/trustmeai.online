
// Tiny hash-based pseudo QR (visual placeholder, deterministic)
function drawPseudoQR(canvas, text){
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  // hash
  let hash = 2166136261;
  for (let i=0;i<text.length;i++){ hash ^= text.charCodeAt(i); hash += (hash<<1) + (hash<<4) + (hash<<7) + (hash<<8) + (hash<<24); }
  // draw 21x21 modules
  const n=25, mSize = Math.floor(Math.min(w,h)/n);
  const offX = Math.floor((w - n*mSize)/2);
  const offY = Math.floor((h - n*mSize)/2);
  for (let y=0;y<n;y++){
    for (let x=0;x<n;x++){
      hash = (hash ^ (hash>>>13)) * 16777619 >>> 0;
      const on = (hash & 0x1ff) > 180; // ~25% density
      ctx.fillStyle = on ? '#c8fff1' : 'transparent';
      if(on) ctx.fillRect(offX + x*mSize, offY + y*mSize, mSize-1, mSize-1);
    }
  }
  // gradient overlay for a nice look
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0,'rgba(103,232,249,.25)');
  g.addColorStop(1,'rgba(34,197,94,.25)');
  ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
}
function $(sel,scope=document){return scope.querySelector(sel)}
function $all(sel,scope=document){return [...scope.querySelectorAll(sel)]}
function now(){return new Date().toLocaleString()}
function addHistoryRow(tbody, row){ // row: {time,type,amount,fee,status}
  // UI row
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${row.time}</td><td>${row.type}</td><td>${(row.amount||0).toFixed(2)}</td><td>${(row.fee||0).toFixed(2)}</td><td>${row.status}</td>`;
  if (tbody && tbody.prepend) tbody.prepend(tr);

  // Persist to localStorage
  try {
    const key = 'tm_tx';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push({ time: row.time, type: row.type, amount: Number(row.amount||0), fee: Number(row.fee||0), status: row.status });
    localStorage.setItem(key, JSON.stringify(list));
  } catch(e){ console.warn('persist tx failed', e); }

  // Update cached balance
  try {
    const txs = JSON.parse(localStorage.getItem('tm_tx') || '[]');
    const balance = txs.reduce((acc, t) => {
      if (t.type === 'deposit' && t.status === 'confirmed') return acc + Number(t.amount||0);
      if (t.type === 'withdraw') return acc - Number(t.amount||0) - Number(t.fee||0);
      return acc;
    }, 0);
    localStorage.setItem('tm_balance', String(balance));
  } catch(e){}
}
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${row.time}</td><td>${row.type}</td><td>${row.amount.toFixed(2)}</td><td>${row.fee.toFixed(2)}</td><td>${row.status}</td>`;
  tbody.prepend(tr);
}
function copyText(txt){
  navigator.clipboard.writeText(txt).catch(()=>{});
}
function randomHex(n){const s='abcdef0123456789';let out='';while(out.length<n) out+=s[Math.floor(Math.random()*s.length)];return out}
function randomTRON(){return 'T'+randomHex(33)}
function randomEVM(){return '0x'+randomHex(40)}

// Page routers
document.addEventListener('DOMContentLoaded',()=>{
  const page = document.body.dataset.page;

  // Nav active
  const href = location.pathname.replace(/\/$/,'') || '/index.html';
  $all('nav a').forEach(a=>{ if(a.getAttribute('href')===href) a.style.opacity='1' });

  if(page==='home'){
    // Nothing special; counters ticking
    const nums = $all('[data-kpi]');
    setInterval(()=>{
      nums.forEach(el=>{
        const base = parseFloat(el.dataset.kpi);
        const jitter = (Math.random()-.5)*0.01*base;
        el.textContent = (base + jitter).toFixed(3)+'W';
      })
    }, 2500);
  }

  if(page==='strategy'){
    const tiers = [
      { id:'T1', min:50,    max:999,    apy:'0.5%–1.0% / day' },
      { id:'T2', min:1000,  max:9999,   apy:'1.0%–1.5% / day' },
      { id:'T3', min:10000, max:19999,  apy:'1.5%–2.0% / day' },
      { id:'T4', min:20000, max:100000, apy:'2.0%–3.0% / day' },
    ];
    const modal = $('.modal');
    const title = $('#modalTitle');
    const input = $('#amountInput');
    const est = $('#estDaily');
    const confirmBtn = $('#confirmBtn');
    const closeBtn = $('#closeBtn');
    const tbody = $('#historyBody');
    let currentTier = null;

    $all('[data-activate]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const id = btn.dataset.activate;
        currentTier = tiers.find(t=>t.id===id);
        title.textContent = `Activate ${id}`;
        input.value='';
        est.textContent='—';
        modal.classList.add('show');
        input.focus();
      });
    });
    closeBtn.addEventListener('click',()=>modal.classList.remove('show'));
    $('#cancelBtn').addEventListener('click',()=>modal.classList.remove('show'));

    input.addEventListener('input',()=>{
      const v = parseFloat(input.value||'0');
      if(!currentTier) return;
      let rate = 0.008; // midpoint rough
      if(currentTier.id==='T1') rate=0.0075;
      if(currentTier.id==='T2') rate=0.0125;
      if(currentTier.id==='T3') rate=0.0175;
      if(currentTier.id==='T4') rate=0.025;
      est.textContent = isFinite(v) && v>0 ? (v*rate).toFixed(2)+' USDT/day' : '—';
    });

    confirmBtn.addEventListener('click',()=>{
      const v = parseFloat(input.value||'0');
      if(!currentTier) return;
      if(!(v>=currentTier.min && v<=currentTier.max)){
        alert(`Enter an amount between ${currentTier.min} and ${currentTier.max} USDT for ${currentTier.id}.`);
        return;
      }
      addHistoryRow(tbody,{time:now(), type:'lock', amount:v, fee:0, status:'active'});
      modal.classList.remove('show');
    });
  }

  if(page==='deposit'){
    const netSel = $('#network');
    const addr = $('#addr');
    const copyBtn = $('#copyBtn');
    const amountSel = $('#amountSel');
    const delaySel = $('#delaySel');
    const scheduleBtn = $('#scheduleBtn');
    const qr = $('#qr');
    const tbody = $('#historyBody');
    const genBtn = $('#genBtn');

    function ensureAddress(){
      if(addr.value.trim()) return;
      genAddress();
    }
    function genAddress(){
      const net = netSel.value;
      addr.value = net==='TRC20' ? randomTRON() : randomEVM();
      drawPseudoQR(qr, addr.value);
    }
    genBtn.addEventListener('click', genAddress);
    netSel.addEventListener('change', genAddress);
    copyBtn.addEventListener('click',()=>{ copyText(addr.value); copyBtn.textContent='Copied'; setTimeout(()=>copyBtn.textContent='Copy',900)});
    scheduleBtn.addEventListener('click',()=>{
      ensureAddress();
      const v = parseFloat(amountSel.value||'0');
      const d = parseInt(delaySel.value||'5',10);
      if(!(v>0)) return;
      const row = {time:now(), type:'deposit', amount:v, fee:0, status:'pending'};
      addHistoryRow(tbody,row);
      setTimeout(()=>{ row.status='confirmed'; addHistoryRow(tbody,{...row}); }, d*1000);
    });
    // init
    genAddress();
  }

  if(page==='withdraw'){
    const to = $('#to');
    const amt = $('#wamt');
    const btn = $('#wsubmit');
    const tbody = $('#historyBody');
    btn.addEventListener('click',()=>{
      const a = parseFloat(amt.value||'0');
      const t = to.value.trim();
      if(!/^T|0x/.test(t)){ alert('Enter a valid TRC20 (T...) or EVM (0x...) address'); return; }
      if(!(a>0)){ alert('Enter amount'); return; }
      addHistoryRow(tbody,{time:now(), type:'withdraw', amount:a, fee:1, status:'submitted'});
      to.value=''; amt.value='';
    });
  }
});



// --- Assets page renderer ---
document.addEventListener('DOMContentLoaded', ()=>{
  if (document.body.dataset.page === 'assets') {
    const balEl = document.querySelector('#balanceValue');
    const tbody = document.querySelector('#portfolioBody');
    const histBody = document.querySelector('#historyBody');
    try {
      const balance = parseFloat(localStorage.getItem('tm_balance') || '0');
      if (balEl) balEl.textContent = balance.toFixed(2);
      const txs = JSON.parse(localStorage.getItem('tm_tx') || '[]');

      // Portfolio (simple single-asset USDT)
      if (tbody) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>USDT</td><td>${balance.toFixed(2)}</td><td>$${balance.toFixed(2)}</td>`;
        tbody.appendChild(tr);
      }

      // Recent history (10)
      if (histBody) {
        [...txs.slice(-10).reverse()].forEach(t => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${t.time}</td><td>${t.type}</td><td>${(t.amount||0).toFixed(2)}</td><td>${(t.fee||0).toFixed(2)}</td><td>${t.status}</td>`;
          histBody.appendChild(tr);
        });
      }
    } catch(e) { console.warn('assets render failed', e); }
  }
});
