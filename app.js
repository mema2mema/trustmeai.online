// Shared state (demo only)
const store = {
  history: JSON.parse(localStorage.getItem('tm_history')||'[]')
};

function saveHistory(){ localStorage.setItem('tm_history', JSON.stringify(store.history)); }

// Utils
const fmtTime = d => d.toLocaleString();
function addHistory(row){
  store.history.unshift(row);
  saveHistory();
  renderHistory();
}
function renderHistory(){
  const strategyTbl = document.querySelector('#history-table tbody');
  const depTbl = document.querySelector('#dep-history tbody');
  const wdTbl = document.querySelector('#wd-history tbody');
  const rows = store.history.slice(0,200).map(r=>`<tr><td>${r.time}</td><td>${r.type}</td><td>${Number(r.amount).toFixed(2)}</td><td>${(r.fee||0).toFixed(2)}</td><td>${r.status}</td></tr>`).join('');
  if(strategyTbl) strategyTbl.innerHTML = rows;
  if(depTbl) depTbl.innerHTML = rows;
  if(wdTbl) wdTbl.innerHTML = rows;
}

document.addEventListener('DOMContentLoaded', () => {
  renderHistory();

  // Index counters wiggle (demo)
  ['stat-scale','stat-users','stat-orders'].forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    setInterval(()=>{
      const base = el.textContent;
      el.textContent = base.replace(/\d+(\.\d+)?W/, (m)=>{
        const num = parseFloat(m.replace('W','')) + (Math.random()*0.01-0.005);
        return num.toFixed(3)+'W';
      });
    }, 2500);
  });

  // Strategy page
  if(document.querySelector('.tiers')){
    const modal = document.getElementById('plan-modal');
    const title = document.getElementById('modal-title');
    const range = document.getElementById('modal-range');
    const est = document.getElementById('modal-est');
    const amountInput = document.getElementById('modal-amount');
    let current = null;

    function openModal(tierEl){
      const id = tierEl.dataset.id;
      const min = Number(tierEl.dataset.min);
      const max = Number(tierEl.dataset.max);
      const rate = tierEl.dataset.rate;
      current = {id,min,max,rate};
      title.textContent = `Activate ${id}`;
      range.textContent = `Min–Max: $${min.toLocaleString()}–$${max.toLocaleString()}`;
      amountInput.value = '';
      est.textContent = 'Estimated daily: —';
      modal.hidden = false;
      amountInput.focus();
    }

    document.querySelectorAll('[data-action="activate"]').forEach(btn=>{
      btn.addEventListener('click', e=>openModal(e.currentTarget.closest('.tier')));
    });
    document.getElementById('modal-close').onclick = ()=> modal.hidden = true;
    document.getElementById('modal-cancel').onclick = ()=> modal.hidden = true;

    amountInput?.addEventListener('input', ()=>{
      if(!current) return;
      const v = Number(amountInput.value||0);
      // Estimate using mid rate of the band
      let low=0, high=0;
      if(current.id==='T1'){ low=0.005; high=0.01 }
      if(current.id==='T2'){ low=0.01; high=0.015 }
      if(current.id==='T3'){ low=0.015; high=0.02 }
      if(current.id==='T4'){ low=0.02; high=0.03 }
      const mid = (low+high)/2;
      if(v>0) est.textContent = `Estimated daily: ${(v*mid).toFixed(2)} USDT`;
      else est.textContent = 'Estimated daily: —';
    });

    document.getElementById('modal-confirm').onclick = ()=>{
      if(!current) return;
      const v = Number(amountInput.value||0);
      if(isNaN(v) || v<current.min || v>current.max){
        alert(`Amount must be between ${current.min} and ${current.max} USDT for ${current.id}.`);
        return;
      }
      addHistory({ time: fmtTime(new Date()), type:'lock', amount:v, fee:0, status:'active' });
      modal.hidden = true;
    };
  }

  // Deposit page
  const genBtn = document.getElementById('gen-addr');
  const netSel = document.getElementById('net-select');
  const addr = document.getElementById('addr');
  const copyBtn = document.getElementById('copy-addr');
  const qrEl = document.getElementById('qr');
  const scheduleBtn = document.getElementById('schedule');

  function makeAddr(net){
    if(net==='TRC20'){
      return 'T' + Math.random().toString(36).slice(2, 9) + Math.random().toString(36).slice(2, 9);
    }
    // EVM-like
    const hex = Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b=>b.toString(16).padStart(2,'0')).join('');
    return '0x' + hex;
  }

  function renderQR(text){
    if(!qrEl) return;
    qrEl.innerHTML='';
    try{
      const qr = new QRCode({text});
      const size = 150;
      const canvas = document.createElement('canvas');
      canvas.width=size; canvas.height=size;
      const ctx = canvas.getContext('2d');
      const count = qr.getModuleCount();
      const cell = size / count;
      ctx.fillStyle = '#0B1220';
      ctx.fillRect(0,0,size,size);
      ctx.fillStyle = '#E6F1FF';
      for(let r=0;r<count;r++){
        for(let c=0;c<count;c++){
          if(qr.isDark(r,c)){
            ctx.fillRect(Math.round(c*cell), Math.round(r*cell), Math.ceil(cell), Math.ceil(cell));
          }
        }
      }
      qrEl.appendChild(canvas);
    }catch(e){
      const pre = document.createElement('div');
      pre.textContent = text;
      qrEl.appendChild(pre);
    }
  }

  genBtn?.addEventListener('click', ()=>{
    const a = makeAddr(netSel.value);
    addr.value = a;
    renderQR(a);
  });
  copyBtn?.addEventListener('click', ()=>{
    if(!addr.value) return;
    navigator.clipboard.writeText(addr.value);
    copyBtn.textContent='Copied';
    setTimeout(()=>copyBtn.textContent='Copy',900);
  });

  scheduleBtn?.addEventListener('click', ()=>{
    if(!addr.value){ alert('Generate address first.'); return; }
    const amt = Number(document.getElementById('demo-amount').value||0);
    const delay = Math.max(1, Number(document.getElementById('demo-delay').value||5));
    const timeStr = fmtTime(new Date());
    addHistory({ time: timeStr, type:'deposit', amount:amt, fee:0, status:'pending' });
    setTimeout(()=>{
      // mark most recent matching pending as confirmed
      const row = store.history.find(r=>r.type==='deposit' && r.status==='pending' && r.amount===amt && r.time===timeStr);
      if(row){ row.status='confirmed'; saveHistory(); renderHistory(); }
    }, delay*1000);
  });

  // Withdraw page
  const wdBtn = document.getElementById('wd-submit');
  wdBtn?.addEventListener('click', ()=>{
    const to = document.getElementById('wd-to').value.trim();
    const amt = Number(document.getElementById('wd-amt').value||0);
    if(!/^T|0x/.test(to)){ alert('Enter a valid TRC20 (T...) or EVM (0x...) address.'); return; }
    addHistory({ time: fmtTime(new Date()), type:'withdraw', amount:amt, fee:1, status:'pending' });
    setTimeout(()=>{
      const row = store.history.find(r=>r.type==='withdraw' && r.status==='pending' && r.amount===amt);
      if(row){ row.status='sent'; saveHistory(); renderHistory(); }
    }, 4000);
  });
});
