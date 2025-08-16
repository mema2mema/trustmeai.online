
// Simple store in localStorage for demo
const storeKey = "tmai-demo-v2";
const $ = (sel, parent=document) => parent.querySelector(sel);
const $$ = (sel, parent=document) => Array.from(parent.querySelectorAll(sel));

function loadState(){
  try{ return JSON.parse(localStorage.getItem(storeKey)) || {wallet:{available:0,locked:0,history:[]}} }catch(e){ return {wallet:{available:0,locked:0,history:[]}} }
}
function saveState(s){ localStorage.setItem(storeKey, JSON.stringify(s)); }
const state = loadState();

function fmt(n){ return Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}); }
function tstamp(){ return new Date().toLocaleString(); }

// QR (very tiny fake generator)
function drawQR(canvas, seed=""){ const ctx=canvas.getContext("2d"); const s=8; const cols=18, rows=18; ctx.fillStyle="#0e1a2f"; ctx.fillRect(0,0,canvas.width,canvas.height); for(let y=0;y<rows;y++){ for(let x=0;x<cols;x++){ const rnd = ((x*37+y*91+seed.length*13) % 7); if(rnd>3){ ctx.fillStyle = x%2? "#9bf7ff":"#b3ffd9"; ctx.fillRect(8+x*s,8+y*s,s-2,s-2); } } } ctx.strokeStyle="rgba(255,255,255,.2)"; ctx.strokeRect(0,0,canvas.width,canvas.height);}

// Navbar active
(function(){
  const path = location.pathname.replace(/\/+$/,'') || "/";
  $$(".menu a").forEach(a=>{
    const href = a.getAttribute("href");
    if(href===path) a.classList.add("active");
  });
})();

// Strategy page logic
function initStrategy(){
  const tiers = [
    {id:"T1", min:50, max:999, apr:"0.5%–1.0% / day"},
    {id:"T2", min:1000, max:9999, apr:"1.0%–1.5% / day"},
    {id:"T3", min:10000, max:19999, apr:"1.5%–2.0% / day"},
    {id:"T4", min:20000, max:100000, apr:"2.0%–3.0% / day"}
  ];
  const tbody = $("#history-body");
  function refreshHistory(){
    tbody.innerHTML = state.wallet.history.map(h=>`
      <tr>
        <td>${h.time}</td><td>${h.type}</td><td>${fmt(h.amount)}</td><td>${fmt(h.fee||0)}</td><td>${h.status}</td>
      </tr>`).join("");
  }
  refreshHistory();

  // modal
  const backdrop = $(".modal-backdrop"); const amountEl = $("#plan-amount"); const titleEl=$("#plan-title"); const rangeEl=$("#plan-range"); const estEl=$("#plan-est");
  let currentTier = null;
  $$(".act-btn").forEach((btn,i)=>{
    btn.addEventListener("click", ()=>{
      currentTier = tiers[i];
      titleEl.textContent = `Activate ${currentTier.id}`;
      rangeEl.textContent = `Min–Max: ${currentTier.min.toLocaleString()}–${currentTier.max.toLocaleString()} USDT`;
      amountEl.value = currentTier.min;
      estEl.textContent = "—";
      backdrop.style.display = "flex";
    });
  });
  $("#close-modal").addEventListener("click", ()=> backdrop.style.display="none");
  $("#cancel-modal").addEventListener("click", ()=> backdrop.style.display="none");
  amountEl.addEventListener("input", ()=>{
    const v = Number(amountEl.value||0);
    if(!currentTier) return;
    if(v<currentTier.min || v>currentTier.max){ estEl.textContent = "Out of range"; estEl.style.color="var(--danger)"; }
    else{ const daily = v * (currentTier.id==="T1"?0.008: currentTier.id==="T2"?0.012: currentTier.id==="T3"?0.017:0.025); estEl.textContent = `Estimated daily: ${fmt(daily)} USDT`; estEl.style.color="var(--text)"; }
  });
  $("#confirm-modal").addEventListener("click", ()=>{
    if(!currentTier) return;
    const v = Number(amountEl.value||0);
    if(isNaN(v) || v<currentTier.min || v>currentTier.max){ alert("Amount must be within plan min/max."); return; }
    // write history
    state.wallet.locked += v;
    state.wallet.history.unshift({time:tstamp(), type:`lock ${currentTier.id}`, amount:v, fee:0, status:"active"});
    saveState(state);
    refreshHistory();
    backdrop.style.display="none";
    showToast(`Locked ${fmt(v)} USDT in ${currentTier.id}.`);
  });
}

// Deposit page logic
function initDeposit(){
  const netSel = $("#net");
  const addr = $("#addr");
  const copyBtn = $("#copy");
  const amount = $("#demo-amt");
  const delay = $("#demo-delay");
  const goBtn = $("#demo-go");
  const qr = $("#qr");
  const ctx = qr.getContext("2d");
  function genAddr(){
    const n = netSel.value;
    const prefix = n==="TRC20" ? "T" : "0x";
    const rand = Math.random().toString(36).slice(2,12);
    addr.value = prefix + rand;
    drawQR(qr, addr.value);
  }
  $("#gen").addEventListener("click", genAddr);
  genAddr();
  copyBtn.addEventListener("click", ()=>{ addr.select(); document.execCommand("copy"); showToast("Address copied"); });
  goBtn.addEventListener("click", ()=>{
    const v = Number(amount.value||0); const d = Number(delay.value||5);
    if(!addr.value){ showToast("Generate address first"); return; }
    // schedule a deposit
    const pending = {time:tstamp(), type:"deposit", amount:v, fee:0, status:"pending", net:netSel.value};
    state.wallet.history.unshift(pending); saveState(state); renderHistory();
    showToast(`Deposit of ${fmt(v)} scheduled (~${d}s)`);
    setTimeout(()=>{
      pending.status="confirmed";
      state.wallet.available += v;
      saveState(state); renderHistory(); showToast(`Deposit of ${fmt(v)} confirmed`);
    }, d*1000);
  });
  function renderHistory(){
    $("#dep-body").innerHTML = state.wallet.history.filter(h=>["deposit"].includes(h.type) || String(h.type).startsWith("lock")).map(h=>`
      <tr><td>${h.time}</td><td>${h.type}</td><td>${fmt(h.amount)}</td><td>${fmt(h.fee||0)}</td><td>${h.status}</td></tr>
    `).join("");
  }
  renderHistory();
}

// Withdraw page demo
function initWithdraw(){
  $("#w-go").addEventListener("click", ()=>{
    const to = $("#w-to").value.trim(); const amt = Number($("#w-amt").value||0);
    if(!/^T|0x/.test(to)) return alert("Enter a valid TRC20/ERC20/BEP20 address (T... or 0x...)");
    if(amt<=0 || amt>state.wallet.available) return alert("Insufficient available balance (demo).");
    state.wallet.available -= amt;
    const fee=1;
    state.wallet.history.unshift({time:tstamp(), type:"withdraw", amount:amt, fee, status:"submitted"});
    saveState(state);
    showToast(`Withdraw submitted: ${fmt(amt)} USDT`);
  });
}

// tiny toast
function showToast(msg){
  const t = $(".toast"); t.textContent = msg; t.style.display="block"; setTimeout(()=>t.style.display="none", 2500);
}

// Page router
document.addEventListener("DOMContentLoaded", ()=>{
  if(document.body.dataset.page==="strategy") initStrategy();
  if(document.body.dataset.page==="deposit") initDeposit();
  if(document.body.dataset.page==="withdraw") initWithdraw();
});
