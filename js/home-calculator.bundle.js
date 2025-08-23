
/* TrustMe AI — Home Yield Calculator (self-inject) */
(function(){
  const css = `
  .calc-card{
    margin:18px 0 32px;
    background:rgba(255,255,255,.06);
    border:1px solid rgba(255,255,255,.14);
    border-radius:18px;
    padding:16px;
    color:var(--text,#E6F1FF);
    box-shadow:0 12px 40px rgba(0,0,0,.35);
  }
  .calc-head{display:flex;align-items:baseline;gap:.6rem;margin-bottom:.75rem}
  .calc-title{font-size:1.15rem;margin:0}
  .calc-sub{opacity:.8;font-size:.9rem}
  .calc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem}
  @media (max-width:900px){.calc-grid{grid-template-columns:1fr}}
  .calc-field{display:flex;flex-direction:column;gap:.35rem}
  .calc-field span{opacity:.85;font-size:.95rem}
  .calc-field input,.calc-field select{
    background:transparent;color:inherit;border:1px solid rgba(255,255,255,.16);
    border-radius:12px;padding:.6rem .75rem;outline:none;
  }
  .calc-field input:focus,.calc-field select:focus{
    border-color:rgba(103,232,249,.55);box-shadow:0 0 0 3px rgba(103,232,249,.15);
  }
  .calc-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem;margin:.9rem 0 .6rem}
  @media (max-width:900px){.calc-metrics{grid-template-columns:1fr}}
  .metric{background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:.75rem .9rem}
  .m-label{opacity:.85;font-size:.9rem;margin-bottom:.25rem}
  .m-value{font-weight:700;font-size:1.15rem}
  .calc-actions{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.5rem}
  .btn{padding:.6rem .9rem;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:#1b2b22;color:#d7ffe6;cursor:pointer}
  .btn.primary{background:#1f8a52;border-color:#1f8a52}
  .calc-note{opacity:.85;margin-top:.35rem;font-size:.92rem}
  `;

  const html = `
  <section id="yield-calculator" class="tm-calc-wrap">
    <div class="calc-card">
      <div class="calc-head">
        <h2 class="calc-title">Yield Calculator</h2>
        <span class="calc-sub">Estimate earnings before you activate a plan</span>
      </div>
      <div class="calc-grid">
        <label class="calc-field">
          <span>Amount (USDT)</span>
          <input id="calcAmount" type="number" min="50" step="10" placeholder="Enter amount">
        </label>
        <label class="calc-field">
          <span>Plan</span>
          <select id="calcPlan">
            <option value="T1">T1 — 0.5%–1.0% / day (50–999 USDT)</option>
            <option value="T2">T2 — 1.0%–1.5% / day (1k–9,999 USDT)</option>
            <option value="T3">T3 — 1.5%–2.0% / day (10k–49,999 USDT)</option>
            <option value="T4">T4 — 2.0%–3.0% / day (50k+ USDT)</option>
          </select>
        </label>
        <label class="calc-field">
          <span>Days</span>
          <input id="calcDays" type="number" min="1" max="30" value="7">
        </label>
      </div>
      <div class="calc-metrics">
        <div class="metric">
          <div class="m-label">Daily Rate</div>
          <div class="m-value" id="calcRate">—</div>
        </div>
        <div class="metric">
          <div class="m-label">Daily Earnings</div>
          <div class="m-value" id="calcDaily">—</div>
        </div>
        <div class="metric">
          <div class="m-label">Total Return</div>
          <div class="m-value" id="calcTotal">—</div>
        </div>
      </div>
      <div class="calc-actions">
        <button class="btn primary" id="calcActivate">Activate Plan</button>
        <button class="btn" id="calcDeposit">Deposit</button>
      </div>
      <div class="calc-note" id="calcNote">Select a plan to see min/max and estimated yield.</div>
    </div>
  </section>`;

  function inject() {
    // style
    const style = document.createElement('style');
    style.id = 'tm-calc-style';
    style.textContent = css;
    document.head.appendChild(style);

    // add section after first ".container" or to body
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    const firstContainer = document.querySelector('.container') || document.querySelector('main') || document.body;
    firstContainer.appendChild(wrap.firstElementChild);

    // calculator logic
    const PLANS = {
      T1:{min:50,max:999,     rMin:0.005,rMax:0.010},
      T2:{min:1000,max:9999,  rMin:0.010,rMax:0.015},
      T3:{min:10000,max:49999,rMin:0.015,rMax:0.020},
      T4:{min:50000,max:Infinity,rMin:0.020,rMax:0.030},
    };

    const $ = id=>document.getElementById(id);
    const amountEl=$('calcAmount'), planEl=$('calcPlan'), daysEl=$('calcDays');
    const rateEl=$('calcRate'), dailyEl=$('calcDaily'), totalEl=$('calcTotal'), noteEl=$('calcNote');
    const btnAct=$('calcActivate'), btnDep=$('calcDeposit');

    try{
      const saved = JSON.parse(localStorage.getItem('tm_calc')||'{}');
      if(saved.amount) amountEl.value=saved.amount;
      if(saved.plan) planEl.value=saved.plan;
      if(saved.days) daysEl.value=saved.days;
    }catch{}

    const fmt = n => Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
    const clamp = (a,p)=> a<p.min? p.min : (a>p.max? p.max : a);

    function update(){
      const plan = PLANS[planEl.value];
      let amount = Number(amountEl.value||0);
      let days = Number(daysEl.value||0);
      if(!plan || !amount || !days){
        rateEl.textContent=dailyEl.textContent=totalEl.textContent='—';
        noteEl.textContent='Select a plan to see min/max and estimated yield.';
        return;
      }
      const rMid = (plan.rMin+plan.rMax)/2;
      const clamped = clamp(amount, plan);
      if(amount!==clamped){
        amount = clamped; amountEl.value=amount;
        noteEl.textContent = `Adjusted to plan limits: ${planEl.value} min ${fmt(plan.min)} • max ${plan.max===Infinity?'∞':fmt(plan.max)} USDT.`;
      }else{
        noteEl.textContent = `${planEl.value} daily ${(plan.rMin*100).toFixed(2)}%–${(plan.rMax*100).toFixed(2)}% • days: ${days}`;
      }
      const daily = amount*rMid;
      const total = amount*Math.pow(1+rMid, days)-amount;
      rateEl.textContent = `${(rMid*100).toFixed(2)}% / day`;
      dailyEl.textContent = `${fmt(daily)} USDT`;
      totalEl.textContent = `${fmt(total)} USDT`;
      localStorage.setItem('tm_calc', JSON.stringify({amount, plan:planEl.value, days}));
    }

    btnAct.addEventListener('click', ()=>{
      location.href = `strategy.html#plan=${encodeURIComponent(planEl.value)}&amount=${encodeURIComponent(amountEl.value||'')}`;
    });
    btnDep.addEventListener('click', ()=> location.href='deposit.html');

    [amountEl, planEl, daysEl].forEach(el=>el.addEventListener('input', update));
    update();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
})();
