// Simple state
const state = {
  brand: "TrustMe AI",
  loggedIn: false,
  user: { name: "TrustMeAI‑100222", uid: "100222", invite: "MPQQ8K", level: "TMI1" },
};

// Views & tabs
const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".view");

function setActive(viewId){
  views.forEach(v => v.classList.toggle("active", v.id === `view-${viewId}`));
  tabs.forEach(t => t.classList.toggle("active", t.dataset.view === viewId));
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

// Auth modal
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

// ===== QR helper (fake visual QR for demo) =====
// Not a real encoder; it just draws a deterministic pattern from a string.
// Replace later with a real QR lib when APIs are wired.
function drawFakeQR(canvas, seed){
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const cells = 29; // "version-ish"
  const cell = Math.floor(size / cells);
  function seededRand(s){
    let h=0; for (let i=0;i<s.length;i++) { h = Math.imul(31, h) + s.charCodeAt(i) | 0; }
    return ()=>{ h = Math.imul(48271, h) % 0x7fffffff; return (h & 0x7fffffff) / 0x7fffffff; };
  }
  const rnd = seededRand(seed);

  ctx.fillStyle = "#fff"; ctx.fillRect(0,0,size,size);
  ctx.fillStyle = "#000";
  // finder-like squares in three corners
  const corner = (x,y)=>{
    ctx.fillRect(x*cell, y*cell, 7*cell, 7*cell);
    ctx.fillStyle="#fff"; ctx.fillRect((x+1)*cell, (y+1)*cell, 5*cell, 5*cell);
    ctx.fillStyle="#000"; ctx.fillRect((x+2)*cell, (y+2)*cell, 3*cell, 3*cell);
  };
  ctx.fillStyle="#000"; corner(1,1); corner(cells-8,1); corner(1,cells-8);

  // random-ish data modules
  ctx.fillStyle="#000";
  for(let r=0;r<cells;r++){
    for(let c=0;c<cells;c++){
      if ((r<8 && c<8) || (r<8 && c>cells-9) || (r>cells-9 && c<8)) continue; // skip finders
      if (rnd() > 0.6) ctx.fillRect(c*cell, r*cell, cell, cell);
    }
  }
}

// ===== Top‑Up =====
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
function openWithdraw(){ refreshWithdraw(); withdrawDialog.showModal(); }
document.getElementById("openWithdraw")?.addEventListener("click", openWithdraw);

// Default active
setActive("home");
