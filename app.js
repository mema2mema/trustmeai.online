
// Simple SPA state
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const state = {
  loggedIn: false,
  balances: { available: 0, locked: 0 },
  plan: null, // {amount, rate, compound, sinceMs, accrued}
  uid: null,
  invite: null,
};

// Helpers
const fmt = (n) => Number(n).toLocaleString(undefined,{maximumFractionDigits:2});
const now = () => Date.now();
function randCode(len){const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<len;i++) s+=a[Math.floor(Math.random()*a.length)]; return s;}

// Persist
function save(){ localStorage.setItem('tmai_state', JSON.stringify(state)); }
function load(){
  const raw = localStorage.getItem('tmai_state');
  if(raw){ try{ Object.assign(state, JSON.parse(raw)); }catch{} }
  if(!state.uid) state.uid = (100000 + Math.floor(Math.random()*900000)).toString();
  if(!state.invite) state.invite = randCode(5);
}
load();

function updateBalances(){
  $('#balAvailable').textContent = fmt(state.balances.available);
  $('#balLocked').textContent    = fmt(state.balances.locked);
  $('#balTotal').textContent     = fmt(state.balances.available + state.balances.locked);
}

function updateMine(){
  $('#mineUid').textContent = 'TrustMe‑' + state.uid;
  $('#mineUidNum').textContent = state.uid;
  $('#mineInvite').textContent = state.invite;
}

// Nav + gating
function showTab(tab){
  const needsLogin = ['assets','strategy','team','mine'];
  if(needsLogin.includes(tab) && !state.loggedIn){ openLogin(); return; }

  $$('.page').forEach(p => p.classList.remove('active'));
  $('#page-'+tab).classList.add('active');
  $$('.tabbar button').forEach(b => b.classList.remove('active'));
  document.querySelector('.tabbar button[data-tab="'+tab+'"]').classList.add('active');
}
$$('.tabbar button').forEach(btn=>{
  btn.addEventListener('click', ()=> showTab(btn.dataset.tab));
});
$('#getStartedBtn').addEventListener('click', ()=> openLogin());

// Login modal
function openLogin(){ $('#loginModal').classList.remove('hidden'); $('#loginMsg').textContent=''; }
function closeLogin(){ $('#loginModal').classList.add('hidden'); }
$('#loginClose').addEventListener('click', closeLogin);
$$('.tabs [data-login-tab]').forEach(b=>{
  b.addEventListener('click',()=>{
    $$('.tabs [data-login-tab]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const mode=b.dataset.loginTab;
    $('#loginPhonePane').style.display = mode==='phone'?'block':'none';
    $('#loginMailPane').style.display = mode==='mail'?'block':'none';
  });
});
$('#doLogin').addEventListener('click', ()=>{
  state.loggedIn = true;
  save();
  $('#loginMsg').textContent = 'Logged in as TrustMe‑'+state.uid;
  setTimeout(()=>{ closeLogin(); showTab('mine'); }, 500);
});

// Calculator
$('#calcBtn').addEventListener('click', ()=>{
  const amt = Math.max(50, +$('#calcAmount').value||0);
  const r   = Math.min(3, Math.max(1.5, +$('#calcRate').value||0));
  const d   = Math.max(1, +$('#calcDays').value||1);
  const comp= $('#calcCompound').checked;
  let final = amt;
  for(let i=0;i<d;i++){
    const gain = comp ? final*r/100 : amt*r/100;
    final += gain;
  }
  const profit = final-amt;
  $('#calcResult').textContent = `Projected profit: ${fmt(profit)} USDT, final: ${fmt(final)} USDT`;
});

// Assets: addresses + QR
function buildAddress(prefix){
  // mock addresses per network
  const base = state.uid + state.invite;
  if(prefix==='TRC20') return 'TQ'+base+'TRON';
  if(prefix==='BEP20') return '0x'+base+'BEP20';
  if(prefix==='ERC20') return '0x'+base+'ERC20';
  return '0x'+base;
}
function setTopInfo(){
  const net = $('#topNet').value;
  const addr = buildAddress(net);
  $('#topAddr').value = addr;
  $('#topQr').src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(addr)}&size=180x180`;
}
function setWdInfo(){
  const net = $('#wdNet').value;
  const addr = $('#wdAddr').value || buildAddress(net);
  $('#wdQr').src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(addr)}&size=180x180`;
}
$('#topNet').addEventListener('change', setTopInfo);
$('#wdNet').addEventListener('change', setWdInfo);
$('#wdAddr').addEventListener('input', setWdInfo);
$('#copyTop').addEventListener('click', ()=> navigator.clipboard.writeText($('#topAddr').value));
$('#copyWd').addEventListener('click', ()=> navigator.clipboard.writeText($('#wdAddr').value));
$('#topAddBtn').addEventListener('click', ()=>{
  const v = Math.max(1, +$('#topAmount').value||0);
  state.balances.available += v;
  save(); updateBalances();
});

$('#wdBtn').addEventListener('click', ()=>{
  const v = Math.max(1, +$('#wdAmount').value||0);
  if(v > state.balances.available){ $('#wdNote').textContent = 'Insufficient balance.'; return; }
  state.balances.available -= v;
  save(); updateBalances();
  $('#wdNote').textContent = `Requested ${fmt(v)} USDT withdrawal on ${new Date().toLocaleString()}.`;
});

// Strategy TMI1
function refreshPlanUI(){
  if(state.plan){
    $('#planInactive').style.display='none';
    $('#planActive').style.display='block';
    $('#tmiAmt').textContent = fmt(state.plan.amount);
    $('#tmiPct').textContent = state.plan.rate.toFixed(2)+'%';
    // compute accrued since 'sinceMs'
    const days = Math.max(0, Math.floor((now()-state.plan.sinceMs) / (1000*60*60*24)));
    let accrued = 0, base = state.plan.amount;
    for(let i=0;i<days;i++){
      const gain = (state.plan.compound ? base : state.plan.amount) * state.plan.rate / 100;
      accrued += gain;
      if(state.plan.compound) base += gain;
    }
    state.plan.accrued = accrued;
    $('#tmiAccrued').textContent = fmt(accrued);
    $('#tmiSince').textContent = 'since ' + new Date(state.plan.sinceMs).toLocaleDateString();
  } else {
    $('#planInactive').style.display='block';
    $('#planActive').style.display='none';
  }
  updateBalances();
  save();
}

$('#tmiActivate').addEventListener('click', ()=>{
  const amt = Math.max(50, Math.min(500000, +$('#tmiAmount').value||0));
  const rate= Math.min(3, Math.max(1.5, +$('#tmiRate').value||0));
  const compound = $('#tmiCompound').checked;
  if(amt > state.balances.available){
    $('#tmiMsg').textContent = 'Insufficient balance. Top‑up first.';
    return;
  }
  state.balances.available -= amt;
  state.balances.locked += amt;
  state.plan = { amount: amt, rate, compound, sinceMs: now(), accrued: 0 };
  $('#tmiMsg').textContent = 'TMI1 activated.';
  refreshPlanUI();
});

$('#tmiSettle').addEventListener('click', ()=>{
  if(!state.plan) return;
  // settle accrued to available, reset sinceMs
  const add = state.plan.accrued || 0;
  state.balances.available += add;
  state.plan.sinceMs = now();
  state.plan.accrued = 0;
  refreshPlanUI();
});

$('#tmiStop').addEventListener('click', ()=>{
  if(!state.plan) return;
  // return principal to available
  state.balances.locked -= state.plan.amount;
  state.balances.available += state.plan.amount;
  state.plan = null;
  refreshPlanUI();
});

// Initial
updateBalances();
updateMine();
setTopInfo(); setWdInfo();

// Restore login + plan
if(state.loggedIn){ showTab('mine'); } else { showTab('front'); }
refreshPlanUI();
