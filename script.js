// Helpers
function $(sel){return document.querySelector(sel)}
function addHistoryRow(type, amount, fee, status){
  const tbody = document.querySelector("#historyTable tbody");
  const tr = document.createElement("tr");
  const now = new Date();
  tr.innerHTML = `<td>${now.toLocaleString()}</td><td>${type}</td>
                  <td>${Number(amount).toFixed(2)}</td><td>${fee?Number(fee).toFixed(2):'0.00'}</td><td>${status}</td>`;
  tbody.prepend(tr);
}
function setAvailable(v){ $("#walletAvailable").textContent = Number(v).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) }
function getAvailable(){ const n = Number($("#walletAvailable").textContent.replace(/,/g,'')); return isNaN(n)?0:n; }
function debit(v){ setAvailable(Math.max(0, getAvailable() - v)) }
function credit(v){ setAvailable(getAvailable() + v) }

// Fee preview
(function(){
  const fees = { TRC20: '~1 USDT (TRC20)', BEP20: '~0.5 USDT (BEP20)', ERC20: '~5 USDT (ERC20)' };
  const sel = $("#walletNetwork"); const out = $("#feePreview");
  function update(){ if(out) out.textContent = fees[sel.value] || fees.TRC20; }
  sel.addEventListener("change", update); update();
})();

// Deposit: generate per-network address, copy, QR, demo credit
(function(){
  function randHex(n){ const c='0123456789abcdef'; let s=''; for(let i=0;i<n;i++) s+=c[Math.floor(Math.random()*16)]; return s; }
  function genAddr(net){
    if(net==='TRC20'){const body='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'; let s='T'; for(let i=0;i<33;i++) s+=body[Math.floor(Math.random()*body.length)]; return s;}
    return '0x'+randHex(40);
  }
  const btn = $("#btnGenerateDeposit");
  const addrWrap = $("#walletAddressWrap");
  const addrEl = $("#walletAddress");
  const copyBtn = $("#walletCopyBtn");
  const qrWrap = $("#walletQr");
  const status = $("#demoStatus");
  btn.addEventListener("click", ()=>{
    const net = $("#walletNetwork").value;
    const addr = genAddr(net);
    addrEl.textContent = addr;
    addrWrap.classList.remove("hidden");
    // render QR
    qrWrap.innerHTML = "";
    new QRCode(qrWrap, { text: addr, width: 160, height: 160 });
    // demo pending -> confirm
    const amount = Number($("#demoAmount").value||100);
    const delay = Number($("#demoDelay").value||5);
    status.textContent = `Demo deposit scheduled: +${amount} USDT in ~${delay}s...`;
    addHistoryRow("deposit", amount, 0, "pending");
    setTimeout(()=>{
      credit(amount);
      addHistoryRow("deposit", amount, 0, "confirmed");
      status.textContent = `Demo deposit confirmed: +${amount} USDT`;
    }, delay*1000);
  });
  if(copyBtn){
    copyBtn.addEventListener("click", async ()=>{
      try{ await navigator.clipboard.writeText(addrEl.textContent.trim()); alert("Address copied"); }
      catch{ alert("Copy failed. You can select and copy manually."); }
    });
  }
})();

// Activate Plan modal
(function(){
  const modal = $("#planModal"); const closeBtn = $("#planModalClose"); const confirmBtn = $("#planConfirm");
  const tierEl = $("#planModalTier"); const rangeEl = $("#planModalRange"); const amountInput = $("#planAmount");
  function open(tier, min, max){
    tierEl.textContent = tier;
    rangeEl.textContent = `$${Number(min).toLocaleString()}–$${Number(max).toLocaleString()}`;
    amountInput.value = "";
    modal.classList.remove("hidden");
  }
  function close(){ modal.classList.add("hidden") }
  closeBtn.addEventListener("click", close);
  modal.addEventListener("click", (e)=>{ if(e.target===modal) close(); });
  document.querySelectorAll("[data-tier]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      open(btn.dataset.tier, btn.dataset.min, btn.dataset.max);
    });
  });
  confirmBtn.addEventListener("click", ()=>{
    const amt = Number(amountInput.value||0);
    if(!amt || amt<1){ alert("Enter a valid amount"); return; }
    debit(amt);
    addHistoryRow("lock", amt, 0, "active");
    alert("Plan activated (demo). Funds locked.");
    close();
  });
})();