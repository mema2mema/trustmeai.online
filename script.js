
(function(){
  function fmt(n){ return n.toLocaleString(undefined, {maximumFractionDigits: 2}); }
  const amt = document.getElementById('amt');
  const pct = document.getElementById('pct');
  const days = document.getElementById('days');
  const proj = document.getElementById('proj');
  const profit = document.getElementById('profit');
  const mode = document.getElementById('mode');
  if(!amt || !pct || !days) return;

  function calc(){
    const a = Math.max(0, parseFloat(amt.value||0));
    const p = Math.max(0, parseFloat(pct.value||0))/100;
    const d = Math.max(0, parseInt(days.value||0, 10));
    // daily compounding
    let balance = a;
    for(let i=0;i<d;i++){ balance *= (1+p); }
    const prof = balance - a;
    proj.textContent = "$" + fmt(balance);
    profit.textContent = "$" + fmt(prof);
  }

  ['input','change'].forEach(ev=>{
    amt.addEventListener(ev, calc);
    pct.addEventListener(ev, calc);
    days.addEventListener(ev, calc);
  });
  calc();
})();
