
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
