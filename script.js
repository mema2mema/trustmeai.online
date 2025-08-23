function fmt(n){return Number(n||0).toLocaleString(undefined,{maximumFractionDigits:2});}
function clamp(n,min,max){n=Number(n||0); if(isNaN(n))n=min; return Math.min(Math.max(n,min),max);}
function project({principal,dailyPct,days,reinvest,withdrawEvery,reinvestCap}){
  principal=Number(principal||0);
  dailyPct=Number(dailyPct||0);
  days=Math.max(1,Math.min(365,Number(days||1)));
  withdrawEvery=Number(withdrawEvery||0);
  reinvestCap=Number(reinvestCap||0);
  let balance=principal, totalWithdrawn=0;
  const data=[];
  for(let d=1; d<=days; d++){
    const profit = balance * (dailyPct/100);
    let withdrawn = 0;
    if(!reinvest){
      withdrawn = profit; totalWithdrawn += withdrawn;
    }else{
      if(reinvestCap>0 && balance>=reinvestCap){ withdrawn = profit; totalWithdrawn += withdrawn; }
      else{ balance += profit; }
    }
    data.push({day:d, balance:+balance.toFixed(2), withdrawn:+totalWithdrawn.toFixed(2)});
  }
  return {data, finalBalance:balance, totalWithdrawn};
}
let calcChart;
function setupCharts(){
  const ctx = document.getElementById('calcChart').getContext('2d');
  calcChart = new Chart(ctx, {
    type:'line',
    data:{labels:[], datasets:[
      {label:'Balance', data:[], tension:.2, fill:true},
      {label:'Withdrawn', data:[], tension:.2, fill:true}
    ]},
    options:{responsive:true, plugins:{legend:{display:true}}, scales:{x:{display:false}}}
  });
}
function updateCalculator(){
  const amount = clamp(document.getElementById('amount').value,0,1_000_000_000);
  const dailyPct = clamp(document.getElementById('dailyPct').value,0,1000);
  const days = clamp(document.getElementById('days').value,1,365);
  const reinvest = document.getElementById('reinvest').checked;
  const cap = clamp(document.getElementById('cap').value,0,1_000_000_000);
  const withdrawEvery = clamp(document.getElementById('withdrawEvery').value,0,365);
  const {data, finalBalance, totalWithdrawn} = project({principal:amount,dailyPct,days,reinvest,withdrawEvery,reinvestCap:cap});
  const totalProfit = reinvest ? finalBalance - amount : totalWithdrawn;
  document.getElementById('finalBalance').textContent = '$'+fmt(finalBalance);
  document.getElementById('totalProfit').textContent = '$'+fmt(totalProfit);
  document.getElementById('totalWithdrawn').textContent = '$'+fmt(totalWithdrawn);
  document.getElementById('initialInvestment').textContent = '$'+fmt(amount);
  const labels = data.map(x=>x.day);
  calcChart.data.labels = labels;
  calcChart.data.datasets[0].data = data.map(x=>x.balance);
  calcChart.data.datasets[1].data = data.map(x=>x.withdrawn);
  calcChart.update();
}
function wireInputs(){
  ['amount','dailyPct','days','reinvest','cap','withdrawEvery'].forEach(id=>{
    document.getElementById(id).addEventListener('input', updateCalculator);
    document.getElementById(id).addEventListener('change', updateCalculator);
  });
  document.getElementById('resetBtn')?.addEventListener('click', ()=>{
    document.getElementById('amount').value=1000;
    document.getElementById('dailyPct').value=1.2;
    document.getElementById('days').value=120;
    document.getElementById('reinvest').checked=true;
    document.getElementById('cap').value=10000;
    document.getElementById('withdrawEvery').value=0;
    updateCalculator();
  });
}
function renderHotList(){
  const coins=[
    {s:'ETH', p:4744.4, ch:-1.81433},
    {s:'BTC', p:115963.63, ch:-0.83154},
    {s:'SOL', p:204.86, ch: 2.07783},
    {s:'XRP', p:3.0344, ch:-1.30427},
    {s:'BNB', p:887.14, ch:-1.45078},
    {s:'ADA', p:0.9135, ch:-1.93326},
    {s:'LINK',p:26.12, ch:-2.53731},
    {s:'DOT', p:4.128, ch:-1.26763},
  ];
  const hot=document.getElementById('hotList'); hot.innerHTML='';
  coins.forEach(c=>{
    const row=document.createElement('div');
    row.className="py-2 flex items-center justify-between";
    row.innerHTML=`<div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-slate-100 grid place-items-center">${c.s[0]}</div>
        <div class="font-medium">${c.s} <span class="text-xs text-slate-500">USDT</span></div>
      </div>
      <div class="${c.ch>=0?'text-emerald-600':'text-rose-600'} font-semibold">${c.ch>=0?'+':''}${c.ch.toFixed(5)}%</div>
      <div class="w-24 text-right">${fmt(c.p)}</div>`;
    hot.appendChild(row);
  });
  const top = coins.slice().sort((a,b)=>b.ch-a.ch).slice(0,5);
  const tgt=document.getElementById('topGainers'); tgt.innerHTML='';
  top.forEach(c=>{
    const row=document.createElement('div');
    row.className="py-2 flex items-center justify-between";
    row.innerHTML=`<div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-slate-100 grid place-items-center">${c.s[0]}</div>
        <div class="font-medium">${c.s} <span class="text-xs text-slate-500">USDT</span></div>
      </div>
      <div class="${c.ch>=0?'text-emerald-600':'text-rose-600'} font-semibold">${c.ch>=0?'+':''}${c.ch.toFixed(5)}%</div>
      <div class="w-24 text-right">${fmt(c.p)}</div>`;
    tgt.appendChild(row);
  });
}
document.addEventListener('DOMContentLoaded', ()=>{ setupCharts(); wireInputs(); renderHotList(); updateCalculator(); });
