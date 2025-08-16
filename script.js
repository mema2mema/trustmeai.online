// Basic helpers
const $ = (s) => document.querySelector(s);
const fmt2 = (n) => Number(n).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2});

// Hero calculator
function recalcHero() {
  const A = Number($("#calcAmount").value || 0);
  const r = Number($("#calcDaily").value || 0) / 100;
  const days = Number($("#calcDays").value || 0);
  const reinv = $("#calcReinvest").checked;
  let v = A;
  for (let d=0; d<days; d++) {
    const gain = v * r;
    if (reinv) v += gain;
  }
  $("#calcOut").textContent = fmt2(v) + " USDT";
}
["#calcAmount","#calcDaily","#calcDays","#calcReinvest"].forEach(id=>{
  document.addEventListener("input", (e)=>{ if (e.target.matches(id)) recalcHero(); });
});
recalcHero();

// Wallet mock
let wallet = { available: 0, locked: 0, address: null };
$("#walletAvailable").textContent = fmt2(wallet.available);
$("#walletLocked").textContent = fmt2(wallet.locked);

$("#btnGenerateDeposit").addEventListener("click", ()=>{
  // Replace with POST /api/deposit/create
  wallet.address = "TQ2xP1EXAMPLEADDRESS987654321";
  $("#walletAddress").textContent = wallet.address;
  $("#walletAddressWrap").classList.remove("hidden");
  alert("Deposit address generated (mock). Replace with real API.");
});
$("#btnCheckDeposit").addEventListener("click", ()=>{
  alert("This would poll backend for confirmations. Hook to your API.");
});

$("#withdrawForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const to = String(fd.get("to")||"");
  const amt = Number(fd.get("amount")||0);
  if (!to || !amt) return;
  // TODO: POST /api/withdraw/create then show pending row:
  addHistory({type:"withdraw", amount: amt, fee:1, status:"pending"});
  wallet.available = Math.max(0, wallet.available - amt);
  $("#walletAvailable").textContent = fmt2(wallet.available);
  e.target.reset();
  alert("Withdraw request submitted (mock). Add 2FA + admin approval in backend.");
});

function addHistory(row){
  const tbody = $("#historyTable tbody");
  const tr = document.createElement("tr");
  const now = new Date().toISOString();
  tr.innerHTML = `<td class="p-2 whitespace-nowrap">${new Date(now).toLocaleString()}</td>
  <td class="p-2">${row.type}</td>
  <td class="p-2">${fmt2(row.amount)}</td>
  <td class="p-2">${row.fee?fmt2(row.fee):"0.00"}</td>
  <td class="p-2">${row.status}</td>`;
  tbody.prepend(tr);
}

// Strategy tiers
const tiers = [
  { code: "T1", range: "0.5%–1.0%", min: 50, max: 1000, risk: 2 },
  { code: "T2", range: "1.0%–1.5%", min: 500, max: 5000, risk: 3 },
  { code: "T3", range: "1.5%–2.0%", min: 3000, max: 25000, risk: 5 },
  { code: "T4", range: "2.0%–3.0%", min: 10000, max: 1000000, risk: 7 },
];
const tiersWrap = $("#tiers");
tiers.forEach(t=>{
  const card = document.createElement("div");
  card.className = "rounded-2xl p-4 border hover:shadow transition";
  const riskPct = (t.risk/8)*100;
  card.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="text-xl font-bold">${t.code}</div>
      <div class="text-sm bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">${t.range} / day</div>
    </div>
    <div class="mt-2 text-sm opacity-80">${t.min.toLocaleString()}–${t.max.toLocaleString()} USDT</div>
    <div class="mt-3">
      <div class="text-xs opacity-70 mb-1">Risk</div>
      <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div class="h-full bg-orange-400" style="width:${riskPct}%"></div>
      </div>
    </div>
    <button class="mt-3 w-full rounded-xl py-2 bg-emerald-600 text-white">Activate Plan</button>
  `;
  tiersWrap.appendChild(card);
});

// (RedHawk simulator removed for user site) });
});
updateSim();

// Crypto hot list (Binance 24h ticker)
async function loadHotlist(){
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
    const data = await res.json();
    // Filter for USDT pairs and sort by priceChangePercent desc
    const usdt = data.filter(r => r.symbol.endsWith("USDT"));
    usdt.sort((a,b) => Number(b.priceChangePercent) - Number(a.priceChangePercent));
    const top = usdt.slice(0, 15);
    const tbody = $("#hotlistTable tbody");
    tbody.innerHTML = "";
    top.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td class="p-2">${row.symbol}</td>
        <td class="p-2">${Number(row.lastPrice).toFixed(6)}</td>
        <td class="p-2">${Number(row.priceChangePercent).toFixed(2)}%</td>`;
      tbody.appendChild(tr);
    });
  } catch(err){
    console.error("Hotlist error", err);
  }
}
loadHotlist();
setInterval(loadHotlist, 30000);

// Referral pie chart
const ctx = document.getElementById("refPie");
let refPie = new Chart(ctx, {
  type: "pie",
  data: {
    labels: ["Level 1", "Level 2", "Level 3"],
    datasets: [{
      data: [10, 3, 1], // mock counts; wire to DB later
    }]
  },
  options: { plugins: { legend: { position: "bottom" } } }
});

// Footer year
$("#year").textContent = new Date().getFullYear();
