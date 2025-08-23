// ===== Persisted state (localStorage) =====
const STORAGE_KEY = "tmi_state_v11";
const defaultState = {
  brand: "TrustMe AI",
  loggedIn: false,
  user: { name: "TrustMeAI-100222", uid: "100222", invite: "MPQQ8K", level: "TMI1" },
  wallet: { available: 0, locked: 0, income: 0 },
  strategy: { active: false, amount: 0, rate: 0, compound: true, startedAt: null },
};
function loadState(){
  try { return { ...defaultState, ...(JSON.parse(localStorage.getItem(STORAGE_KEY))||{}) }; }
  catch { return { ...defaultState }; }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

let state = loadState();

// ===== Views & tabs =====
const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".view");

function setActive(viewId){
  views.forEach(v => v.classList.toggle("active", v.id === `view-${viewId}`));
  tabs.forEach(t => t.classList.toggle("active", t.dataset.view === viewId));
  if(viewId==="assets") refreshBalances();
  if(viewId==="strategy") refreshStrategy();
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const v = tab.dataset.view;
    if (["assets","strategy","team"].includes(v) && !state.loggedIn){
      openAuth();
      return;
    }
    setActive(v);
  });
});

// Brand + profile fill
document.querySelector(".brand-title").textContent = state.brand;
document.getElementById("profileName").textContent = state.user.name;
document.getElementById("profileUid").textContent = state.user.uid;
document.getElementById("inviteCode").textContent = state.user.invite;

// Get Started opens auth
document.getElementById("getStartedBtn").addEventListener("click", openAuth);

// ===== Auth modal =====
const authDialog = document.getElementById("authDialog");
function openAuth(){ authDialog.showModal(); }
document.querySelectorAll("[data-auth-tab]").forEach(btn => {
  btn.addEventListener("click", e => {
    document.querySelectorAll("[data-auth-tab]").forEach(b=>b.classList.remove("active"));
    e.currentTarget.classList.add("active");
    const tab = e.currentTarget.dataset.authTab;
    document.getElementById("formPhone").style.display = tab==="phone" ? "" : "none";
    document.getElementById("formMail").style.display  = tab==="mail" ? "" : "none";
  });
});
document.getElementById("loginBtn").addEventListener("click", () => {
  state.loggedIn = true;
  saveState();
  authDialog.close();
  alert("Logged in (demo). Now you can access Assets, Strategy and Team.");
});
document.getElementById("registerBtn").addEventListener("click", () => {
  alert("Registration flow is a placeholder for now.");
});

// Shortcuts on home tiles
document.getElementById("tileTopUp").addEventListener("click", ()=>{
  if(!state.loggedIn){ openAuth(); return; }
  openTopup();
});
document.getElementById("tileWithdraw").addEventListener("click", ()=>{
  if(!state.loggedIn){ openAuth(); return; }
  openWithdraw();
});

// ===== Fake visual QR helper (demo) =====
function drawFakeQR(canvas, seed){
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const cells = 29;
  const cell = Math.floor(size / cells);
  function seededRand(s){
    let h=0; for (let i=0;i<s.length;i++) { h = Math.imul(31, h) + s.charCodeAt(i) | 0; }
    return ()=>{ h = Math.imul(48271, h) % 0x7fffffff; return (h & 0x7fffffff) / 0x7fffffff; };
  }
  const rnd = seededRand(seed);

  ctx.fillStyle = "#fff"; ctx.fillRect(0,0,size,size);
  ctx.fillStyle = "#000";
  const corner = (x,y)=>{
    ctx.fillRect(x*cell, y*cell, 7*cell, 7*cell);
    ctx.fillStyle="#fff"; ctx.fillRect((x+1)*cell, (y+1)*cell, 5*cell, 5*cell);
    ctx.fillStyle="#000"; ctx.fillRect((x+2)*cell, (y+2)*cell, 3*cell, 3*cell);
  };
  ctx.fillStyle="#000"; corner(1,1); corner(cells-8,1); corner(1,cells-8);
  ctx.fillStyle="#000";
  for(let r=0;r<cells;r++){
    for(let c=0;c<cells;c++){
      if ((r<8 && c<8) || (r<8 && c>cells-9) || (r>cells-9 && c<8)) continue;
      if (rnd() > 0.6) ctx.fillRect(c*cell, r*cell, cell, cell);
    }
  }
}

// ===== Top-Up =====
const topupDialog = document.getElementById("topupDialog");
const topupNetwork = document.getElementById("topupNetwork");
const topupAddress = document.getElementById("topupAddress");
const topupQr = document.getElementById("topupQr");

function networkAddress(net){
  switch(net){
    case "TRC20": return "TQ1-TRC20-DEMO-ADDRESS-12345";
    case "BEP20": return "0xBEP20DEMOADDRESS1234567890";
    case "ERC20": return "0xERC20DEMOADDRESS1234567890";
  }
}
function refreshTopup(){
  const net = topupNetwork.value;
  const addr = networkAddress(net);
  topupAddress.value = addr;
  drawFakeQR(topupQr, addr + "|" + net);
}
topupNetwork.addEventListener("change", refreshTopup);
document.getElementById("copyTopup").addEventListener("click", ()=>{
  topupAddress.select(); document.execCommand("copy");
});
document.getElementById("creditDemo").addEventListener("click", ()=>{
  const v = parseFloat(document.getElementById("topupAmountDemo").value||0);
  if (v>0){
    state.wallet.available += v;
    saveState(); refreshBalances();
    alert(`Credited ${v} USDT (demo).`);
  }
});
function openTopup(){ refreshTopup(); topupDialog.showModal(); }
document.getElementById("openTopUp")?.addEventListener("click", openTopup);

// ===== Withdraw =====
const withdrawDialog = document.getElementById("withdrawDialog");
const withdrawAddress = document.getElementById("withdrawAddress");
const withdrawQr = document.getElementById("withdrawQr");
const withdrawNetwork = document.getElementById("withdrawNetwork");

function refreshWithdraw(){
  const addr = withdrawAddress.value || "ENTER-ADDRESS";
  drawFakeQR(withdrawQr, addr + "|" + withdrawNetwork.value);
}
["input","change"].forEach(ev=> withdrawAddress.addEventListener(ev, refreshWithdraw));
withdrawNetwork.addEventListener("change", refreshWithdraw);
document.getElementById("confirmWithdraw").addEventListener("click", ()=>{
  const amt = parseFloat(document.getElementById("withdrawAmount").value||0);
  if(amt<=0) return alert("Enter an amount.");
  if(amt > state.wallet.available) return alert("Insufficient available balance.");
  state.wallet.available -= amt;
  saveState(); refreshBalances();
  alert("Withdrawal submitted (demo).");
  withdrawDialog.close();
});
function openWithdraw(){ refreshWithdraw(); withdrawDialog.showModal(); }
document.getElementById("openWithdraw")?.addEventListener("click", openWithdraw);

// ===== Assets balances =====
function refreshBalances(){
  document.getElementById("balAvail").textContent = state.wallet.available.toFixed(2);
  document.getElementById("balLocked").textContent = state.wallet.locked.toFixed(2);
  document.getElementById("balIncome").textContent = state.wallet.income.toFixed(2);
}
document.getElementById("demoAdd100").addEventListener("click", ()=>{
  state.wallet.available += 100;
  saveState(); refreshBalances();
});

// ===== Strategy activation =====
const stratStatus = document.getElementById("stratStatus");
const stratActions = document.getElementById("stratActions");
function refreshStrategy(){
  const s = state.strategy;
  if(s.active){
    const days = s.startedAt ? Math.floor((Date.now() - new Date(s.startedAt).getTime())/(24*3600*1000)) : 0;
    const r = s.rate/100;
    const earned = s.compound ? s.amount*Math.pow(1+r, days) - s.amount : s.amount*r*days;
    stratStatus.innerHTML = `TMI1 is <b>ACTIVE</b> — Amount <b>${s.amount.toFixed(2)} USDT</b> @ ${s.rate.toFixed(1)}% daily${s.compound? " (compound)":""}. Days running: ${days}.<br/>Estimated accrued: <b>${earned.toFixed(2)} USDT</b> (not settled).`;
    stratActions.innerHTML = `<button class="btn" id="settleBtn">Settle Earnings (demo)</button> <button class="btn" id="stopBtn">Stop Plan</button>`;
    document.getElementById("settleBtn").addEventListener("click", ()=>{
      const days = s.startedAt ? Math.floor((Date.now() - new Date(s.startedAt).getTime())/(24*3600*1000)) : 0;
      const r = s.rate/100;
      const earned = s.compound ? s.amount*Math.pow(1+r, days) - s.amount : s.amount*r*days;
      state.wallet.available += earned;
      state.wallet.income += earned;
      s.startedAt = new Date().toISOString(); // reset accrual
      saveState(); refreshBalances(); refreshStrategy();
      alert(`Settled ${earned.toFixed(2)} USDT to Available (demo).`);
    });
    document.getElementById("stopBtn").addEventListener("click", ()=>{
      // unlock principal
      state.wallet.available += s.amount;
      state.wallet.locked -= s.amount;
      state.strategy = { ...defaultState.strategy }; // reset
      saveState(); refreshBalances(); refreshStrategy();
      alert("Plan stopped. Principal unlocked (demo).");
    });
  } else {
    stratStatus.innerHTML = `Current plan: <b>TMI1</b> — 50 to 500,000 USDT, target yield <b>1.5% – 3%</b>.`;
    stratActions.innerHTML = `<button class="btn btn-primary" id="activateBtn">Activate TMI1</button>`;
    document.getElementById("activateBtn").addEventListener("click", openActivate);
  }
}

// Activate modal
const actDialog = document.getElementById("activateDialog");
const actAmount = document.getElementById("actAmount");
const actRate   = document.getElementById("actRate");
const actRateLabel = document.getElementById("actRateLabel");
const actCompound = document.getElementById("actCompound");
const actDaily = document.getElementById("actDaily");
const actMonth = document.getElementById("actMonth");
const actWarning = document.getElementById("actWarning");
function actRecalc(){
  const A = parseFloat(actAmount.value||0);
  const r = parseFloat(actRate.value||0)/100;
  actRateLabel.textContent = (r*100).toFixed(1) + "%";
  const daily = A*r;
  const month = actCompound.checked ? (A*Math.pow(1+r,30) - A) : (daily*30);
  actDaily.textContent = "$"+daily.toFixed(2);
  actMonth.textContent = "$"+month.toFixed(2);
  let warn = "";
  if (A < 50 || A > 500000) warn = "Amount must be between 50 and 500,000 USDT.";
  else if (A > state.wallet.available) warn = `Insufficient available balance. Available: ${state.wallet.available.toFixed(2)} USDT.`;
  actWarning.textContent = warn;
}
["input","change"].forEach(ev => { actAmount.addEventListener(ev, actRecalc); actRate.addEventListener(ev, actRecalc); actCompound.addEventListener(ev, actRecalc); });
function openActivate(){ actRecalc(); actDialog.showModal(); }
document.getElementById("actConfirm").addEventListener("click", ()=>{
  const A = parseFloat(actAmount.value||0);
  const r = parseFloat(actRate.value||0);
  if (A < 50 || A > 500000) return alert("Amount must be between 50 and 500,000 USDT.");
  if (A > state.wallet.available) return alert("Insufficient available balance.");
  // lock funds
  state.wallet.available -= A;
  state.wallet.locked += A;
  state.strategy = { active:true, amount:A, rate:r, compound: actCompound.checked, startedAt: new Date().toISOString() };
  saveState();
  refreshBalances();
  refreshStrategy();
  actDialog.close();
  alert("TMI1 activated (demo).");
});

// ===== Calculator =====
const $ = id => document.getElementById(id);
const amt   = $("calcAmount");
const rate  = $("calcRate");
const days  = $("calcDays");
const comp  = $("calcCompound");
const lbl   = $("calcRateLabel");
const outDaily   = $("calcDaily");
const outPeriod  = $("calcPeriod");
const outBalance = $("calcBalance");

function calc(){
  const A = Math.max(0, parseFloat(amt.value || 0));
  const r = Math.max(0, parseFloat(rate.value || 0)) / 100.0;
  const d = Math.max(1, Math.min(365, parseInt(days.value || 1)));
  lbl.textContent = (r*100).toFixed(1) + "%";

  const daily = A * r;
  let balance, earnings;
  if (comp.checked){
    balance = A * Math.pow(1+r, d);
    earnings = balance - A;
  } else {
    earnings = daily * d;
    balance = A + earnings;
  }
  outDaily.textContent   = "$" + daily.toFixed(2);
  outPeriod.textContent  = "$" + earnings.toFixed(2);
  outBalance.textContent = "$" + balance.toFixed(2);
}
[amt, rate, days, comp].forEach(el => el.addEventListener("input", calc));
calc();

// Default active view + initial UI refresh
setActive("home");
refreshBalances();
refreshStrategy();
