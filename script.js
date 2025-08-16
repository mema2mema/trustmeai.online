
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const fmt = (n) => Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2});

function showToast(msg){
  const t = $("#toast"); if(!t) return;
  t.textContent = msg; t.classList.add("show");
  setTimeout(()=> t.classList.remove("show"), 2000);
}

// Modal
function openModal(innerHTML){
  const back = $("#modal"), body=$("#modal-body");
  if(!back || !body) return;
  body.innerHTML = innerHTML;
  back.style.display = "flex";
  back.onclick = (e)=>{ if(e.target.id==="modal") closeModal(); };
  $$(".btn-ghost[data-close], [data-close]").forEach(el=> el.addEventListener("click", closeModal));
}
function closeModal(){ const back=$("#modal"); if(back) back.style.display="none"; }

// Storage helpers
const LS = {
  read(k, def){ try{ return JSON.parse(localStorage.getItem(k)) ?? def }catch(e){ return def; } },
  write(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
};

// Demo state
const STATE = LS.read("tm_state", {
  wallet:{ available: 0, locked: 0 },
  history: [], // {time,type,amount,fee,status}
  kpis:{ scale: 6048.256, participants: 469.607, orders: 944.522 },
  users:[], // {email, pass}
  session:null
});
function save(){ LS.write("tm_state", STATE); }

// Home KPIs
(function initHome(){
  const s=$("#kpi-scale"), p=$("#kpi-participants"), o=$("#kpi-orders");
  if(s){ s.textContent = STATE.kpis.scale.toFixed(3)+"W"; }
  if(p){ p.textContent = STATE.kpis.participants.toFixed(3)+"W"; }
  if(o){ o.textContent = STATE.kpis.orders.toFixed(3)+"W"; }
})();

// History render
function renderHistory(tableSel="#history tbody"){
  const tb = $(tableSel); if(!tb) return;
  tb.innerHTML = STATE.history.slice().reverse().map(h=>{
    return `<tr>
      <td>${new Date(h.time).toLocaleString()}</td>
      <td>${h.type}</td>
      <td>${fmt(h.amount)}</td>
      <td>${fmt(h.fee)}</td>
      <td>${h.status}</td>
    </tr>`;
  }).join("");
}

// Strategy
const TIER_LIMITS = {
  T1:{min:50, max:999},
  T2:{min:1000, max:9999},
  T3:{min:10000, max:19999},
  T4:{min:20000, max:100000},
};
function validateTierAmount(tier, amt){
  const lim = TIER_LIMITS[tier]; if(!lim) return {ok:false, msg:"Unknown tier"};
  if(isNaN(amt) || amt<=0) return {ok:false, msg:"Enter a valid amount"};
  if(amt<lim.min || amt>lim.max) return {ok:false, msg:`Amount must be between ${lim.min} and ${lim.max} USDT`};
  if(amt > (STATE.wallet.available||0)) return {ok:false, msg:"Insufficient available balance. Please deposit."};
  return {ok:true};
}
function addHistoryRow(date, type, amount, fee, status){
  STATE.history.push({time: date.toISOString(), type, amount, fee, status});
  if(type==="lock"){ STATE.wallet.available -= amount; STATE.wallet.locked += amount; }
  save();
  renderHistory("#history tbody");
  renderWalletBits();
}
function showTierModal(tier){
  const lim=TIER_LIMITS[tier];
  const html = `
    <div class="card panel" style="padding:1rem 1rem 1.2rem">
      <div class="stripe"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
        <h3 style="margin:0">Activate ${tier}</h3>
        <button class="btn-ghost" data-close>Close</button>
      </div>
      <p class="small" style="opacity:.85;margin:.25rem 0 .75rem 0">Min–Max: ${lim.min.toLocaleString()}–${lim.max.toLocaleString()} USDT</p>
      <input id="tierAmountInput" class="input" placeholder="Enter amount" inputmode="decimal"/>
      <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:.9rem">
        <button class="btn-ghost" data-close>Cancel</button>
        <button class="btn" id="tierConfirmBtn" type="button">Confirm</button>
      </div>
    </div>`;
  openModal(html);
  const input = $("#tierAmountInput");
  const doSubmit = ()=>{
    const amt = parseFloat(String(input.value||"0").replace(/[, ]/g,''));
    const v=validateTierAmount(tier, amt);
    if(!v.ok){ alert(v.msg); return; }
    addHistoryRow(new Date(), "lock", amt, 0, "active"); 
    closeModal(); showToast(`${tier} activated: ${fmt(amt)} USDT`);
  };
  $("#tierConfirmBtn").addEventListener("click", doSubmit, {once:true});
  input.addEventListener("keydown", e=>{ if(e.key==="Enter"){ e.preventDefault(); doSubmit(); } });
}
// Delegate clicks
document.addEventListener("click", (e)=>{
  const el = e.target.closest("[data-tier]");
  if(!el) return;
  e.preventDefault();
  showTierModal(el.getAttribute("data-tier"));
}, true);

// Render initial history
renderHistory("#history tbody");

// Wallet bits
function renderWalletBits(){
  const a=$("#avail"), l=$("#locked");
  const a2=$("#avail2"), l2=$("#locked2");
  [a,a2].forEach(n=> n && (n.textContent = fmt(STATE.wallet.available)));
  [l,l2].forEach(n=> n && (n.textContent = fmt(STATE.wallet.locked)));
  const wh=$("#walletHistory tbody"); if(wh){
    wh.innerHTML = STATE.history.filter(h=>["deposit","withdraw"].includes(h.type)).slice().reverse().map(h=>`
      <tr><td>${new Date(h.time).toLocaleString()}</td><td>${h.type}</td><td>${fmt(h.amount)}</td><td>${fmt(h.fee)}</td><td>${h.status}</td></tr>`).join("");
  }
  const rr=$("#recent tbody"); if(rr){
    rr.innerHTML = STATE.history.slice().reverse().slice(0,6).map(h=>`
      <tr><td>${new Date(h.time).toLocaleString()}</td><td>${h.type}</td><td>${fmt(h.amount)}</td></tr>`).join("");
  }
}
renderWalletBits();

// QR simple visual

function drawFakeQR(canvas, text){
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.height = 160;
  ctx.fillStyle = "#fff"; ctx.fillRect(0,0,W,W);
  ctx.fillStyle = "#000";
  const cell=8;
  for(let y=0;y<W/cell;y++){
    for(let x=0;x<W/cell;x++){
      if( ((x*y + x + y) % 7)===0 ) ctx.fillRect(x*cell,y*cell,cell,cell);
    }
  }
  ctx.fillStyle="#fff";
  ctx.fillRect(40,70,80,20);
  ctx.fillStyle="#000";
  ctx.font="bold 14px Arial"; ctx.textAlign="center"; ctx.fillText("USDT",80,85);
}


function genAddrFor(net){
  if(net==="TRC20") return "T" + Math.random().toString(36).slice(2,10) + Math.random().toString(36).slice(2,10);
  return "0x" + Math.random().toString(16).slice(2,18) + Math.random().toString(16).slice(2,18);
}
(function initDeposit(){
  const gen=$("#genAddr"); if(!gen) return;
  const netSel=$("#net"), addr=$("#addr"), status=$("#demoStatus"), qr=$("#qr"), netLbl=$("#netLabel");
  const amtSel=$("#demoAmt"), delaySel=$("#demoDelay");
  const checkBtn=$("#checkDeposits"), copy=$("#copyAddr"), clear=$("#clearAddr");
  function updateQR(){
    if(qr && addr.value){ drawFakeQR(qr, addr.value); }
  }
  gen.addEventListener("click", ()=>{
    const net = netSel.value; const a = genAddrFor(net);
    addr.value = a; if(netLbl) netLbl.textContent = net;
    updateQR();
    const amt = parseFloat(amtSel.value);
    const delay = parseInt(delaySel.value)*1000;
    status.textContent = `Demo: +${fmt(amt)} in ${delay/1000}s…`;
    setTimeout(()=>{
      STATE.wallet.available += amt;
      STATE.history.push({time:new Date().toISOString(), type:"deposit", amount:amt, fee:0, status:"confirmed"});
      save(); renderWalletBits(); status.textContent = "Demo deposit confirmed.";
      showToast(`Deposit confirmed: ${fmt(amt)} USDT`);
    }, delay);
  });
  checkBtn.addEventListener("click", ()=>{ renderWalletBits(); showToast("Checked. No pending items."); });
  copy.addEventListener("click", async ()=>{
    if(!addr.value) return;
    try{ await navigator.clipboard.writeText(addr.value); showToast("Address copied"); }catch(e){ alert("Copy failed"); }
  });
  clear.addEventListener("click", ()=>{ addr.value=""; const ctx=qr.getContext('2d'); ctx.clearRect(0,0,qr.width,qr.height); });
  netSel.addEventListener("change", ()=>{ if(netLbl){ netLbl.textContent = netSel.value; } updateQR(); });
  updateQR();
})();

// Withdraw
(function initWithdraw(){
  const s=$("#wdSubmit"); if(!s) return;
  s.addEventListener("click", ()=>{
    const to=$("#wdTo").value.trim(); const amt=parseFloat($("#wdAmt").value);
    if(!to){ alert("Enter withdraw address"); return; }
    if(isNaN(amt) || amt<=0){ alert("Enter valid amount"); return; }
    if(amt > (STATE.wallet.available||0)){ alert("Insufficient balance"); return; }
    const fee = 1.00;
    STATE.wallet.available -= (amt + fee);
    STATE.history.push({time:new Date().toISOString(), type:"withdraw", amount:amt, fee, status:"pending"});
    save(); renderWalletBits(); showToast("Withdrawal submitted (demo)");
  });
})();

// Auth (demo)
(function auth(){
  const r=$("#doRegister"), l=$("#doLogin");
  if(r){ r.addEventListener("click", ()=>{
    const email=$("#regEmail").value.trim(), pass=$("#regPass").value.trim();
    if(!email || pass.length<6){ alert("Enter a valid email and 6+ char password"); return; }
    if(STATE.users.some(u=>u.email===email)){ alert("Email already exists"); return; }
    STATE.users.push({email, pass}); STATE.session=email; save(); showToast("Registered!"); location.href="index.html";
  });}
  if(l){ l.addEventListener("click", ()=>{
    const email=$("#loginEmail").value.trim(), pass=$("#loginPass").value.trim();
    const ok=STATE.users.find(u=>u.email===email && u.pass===pass);
    if(!ok){ alert("Invalid credentials"); return; }
    STATE.session=email; save(); showToast("Logged in!"); location.href="index.html";
  });}
})();
