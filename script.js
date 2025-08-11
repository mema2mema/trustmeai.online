// Day 7 visuals + full calculator logic
(function(){
  function fmt(n){ return n.toLocaleString(undefined,{style:'currency', currency:'USD', maximumFractionDigits:2}); }
  function ready(fn){ if(document.readyState!=='loading'){ fn(); } else { document.addEventListener('DOMContentLoaded', fn); } }

  ready(function(){
    // HERO VIDEO handling (mute + autoplay + fallback)
    const heroVideo = document.getElementById('heroVideo');
    const fallback = document.querySelector('.hero-no-video');
    if(heroVideo){
      // Prefer not to play video on very small screens to save data
      const prefersReducedData = window.matchMedia('(max-width: 680px)').matches;
      if(prefersReducedData){
        heroVideo.style.display = 'none';
        if(fallback) fallback.style.display = 'block';
      }else{
        heroVideo.muted = true;
        const playAttempt = heroVideo.play();
        if(playAttempt && typeof playAttempt.then === 'function'){
          playAttempt.then(()=>{
            // playing
            if(fallback) fallback.style.display = 'none';
          }).catch(()=>{
            // autoplay blocked
            heroVideo.style.display = 'none';
            if(fallback) fallback.style.display = 'block';
          });
        }
      }
    }

    const els = {
      amount: document.getElementById('amount'),
      rate: document.getElementById('rate'),
      days: document.getElementById('days'),
      tpd: document.getElementById('tradesPerDay'),
      tpdLabel: document.getElementById('tradesLabel'),
      rateTypeRadios: document.querySelectorAll('input[name=\"rateType\"]'),
      modeToggle: document.getElementById('modeToggle'),
      tableBody: document.querySelector('#planTable tbody'),
      totalEnd: document.getElementById('total-end'),
      totalProfit: document.getElementById('total-profit'),
      totalWithdrawn: document.getElementById('total-withdrawn'),
      withdrawBox: document.getElementById('withdraw-box'),
      snapStart: document.getElementById('snap-start'),
      snapRate: document.getElementById('snap-rate'),
      snapRateLabel: document.getElementById('snap-rate-label'),
      snapEff: document.getElementById('snap-effective'),
      snapTrades: document.getElementById('snap-trades'),
      snapDay120: document.getElementById('snap-day120'),
      snapMode: document.getElementById('snapshot-mode'),
      risk: document.getElementById('risk'),
      rateLabel: document.getElementById('rateLabel'),
      chart: document.getElementById('balanceChart'),
      exportBtn: document.getElementById('exportCsvBtn'),
      scaleRadios: document.querySelectorAll('input[name=\"scale\"]'),
    };

    function getRateType(){ for(const r of els.rateTypeRadios){ if(r && r.checked) return r.value; } return 'per_day'; }
    function getScale(){ for(const r of els.scaleRadios){ if(r && r.checked) return r.value; } return 'linear'; }
    function valFloat(el, fb){ const v=parseFloat(el&&el.value||''); return isNaN(v)?fb:v; }
    function valInt(el, fb){ const v=parseInt(el&&el.value||''); return isNaN(v)?fb:v; }
    function effectiveDaily(rateType, rateValue, tpd){ if(rateType!=='per_trade') return null; const per=rateValue/100; return (Math.pow(1+per, Math.max(1,tpd))-1)*100; }

    function simulate(amount, rateValue, days, tradesPerDay, rateType, reinvest=true){
      const rows=[]; let balance=amount; let cumWithdraw=0; const tpd=Math.max(1, tradesPerDay|0);
      const perTradeRate = rateType==='per_trade'? (rateValue/100) : (rateValue/100)/tpd;
      const series=[balance];
      for(let d=1; d<=days; d++){
        const start=balance; let end=start; let dayProfit=0;
        if(reinvest){
          for(let t=0; t<tpd; t++){ const p=end*perTradeRate; end+=p; dayProfit+=p; }
        }else{
          dayProfit = rateType==='per_trade'? start*(perTradeRate*tpd) : start*(rateValue/100);
          cumWithdraw+=dayProfit; end=start;
        }
        rows.push({ day:d, start, profit:dayProfit, withdrawn:reinvest?0:dayProfit, end, cumWithdraw });
        balance=end; series.push(balance);
      }
      const endBalance = reinvest? balance : amount;
      const totalProfit = reinvest? (endBalance-amount) : cumWithdraw;
      return { rows, end:endBalance, totalProfit, cumWithdraw, balanceSeries:series };
    }

    function drawChart(series, scale){
      if(!els.chart) return;
      const ctx = els.chart.getContext('2d'); const w=els.chart.width, h=els.chart.height;
      ctx.clearRect(0,0,w,h);
      const pad={l:50,r:20,t:20,b:30}; ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(pad.l,pad.t); ctx.lineTo(pad.l,h-pad.b); ctx.lineTo(w-pad.r,h-pad.b); ctx.stroke();
      if(!series || series.length<2) return;
      let min=Math.min(...series), max=Math.max(...series); let yMin=min*0.98, yMax=max*1.02; let mapY=v=>v;
      if(scale==='log'){ const log=x=>Math.log10(Math.max(1e-9,x)); yMin=log(yMin); yMax=log(yMax); mapY=v=>log(v); }
      function X(i){ return pad.l + (i/(series.length-1))*(w-pad.l-pad.r); }
      function Y(v){ const vv=mapY(v); return h - pad.b - ((vv-yMin)/(yMax-yMin))*(h-pad.t-pad.b); }
      ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.setLineDash([4,6]);
      for(let g=0; g<=4; g++){ const yy=pad.t + g*(h-pad.t-pad.b)/4; ctx.beginPath(); ctx.moveTo(pad.l,yy); ctx.lineTo(w-pad.r,yy); ctx.stroke(); }
      ctx.setLineDash([]);
      ctx.strokeStyle='#7aa2ff'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(X(0),Y(series[0]));
      for(let i=1;i<series.length;i++){ ctx.lineTo(X(i),Y(series[i])); } ctx.stroke();
    }

    function toCSV(rows){
      const header=['Day','Start','Profit','Withdrawn','End','Cumulative Withdrawn'];
      const lines=[header.join(',')];
      rows.forEach(r=> lines.push([r.day,r.start.toFixed(2),r.profit.toFixed(2),r.withdrawn.toFixed(2),r.end.toFixed(2),r.cumWithdraw.toFixed(2)].join(',')));
      return lines.join('\\n');
    }
    function download(filename, text){ const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(text); a.download=filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
    function fitText(el){ if(!el) return; const len=(el.textContent||'').length; const size=Math.max(12, Math.min(22, 22 - Math.max(0,len-12)*0.6)); el.style.fontSize=size+'px'; }

    function render(){
      const amount=Math.max(0, valFloat(els.amount,1000)); const rateValue=Math.max(0, valFloat(els.rate,2));
      const days=Math.min(120, Math.max(1, valInt(els.days,120))); const tpd=Math.max(1, valInt(els.tpd,10));
      const reinvest=!!(els.modeToggle&&els.modeToggle.checked); const rateType=getRateType(); const scale=getScale();

      if(els.tpdLabel) els.tpdLabel.textContent=String(tpd);
      if(els.rateLabel) els.rateLabel.textContent=`Rate (%) — ${rateType==='per_day'?'Per Day':'Per Trade'}`;
      if(els.snapRateLabel) els.snapRateLabel.textContent=rateType==='per_day'?'Daily %':'Per-Trade %';

      const eff=effectiveDaily(rateType, rateValue, tpd);
      if(eff!=null){ els.snapEff.style.display='block'; els.snapEff.textContent=`Effective Daily: ${eff.toFixed(2)}%`; }
      else if(els.snapEff){ els.snapEff.style.display='none'; }

      if(els.risk){ tpd>=50 ? els.risk.classList.remove('hidden') : els.risk.classList.add('hidden'); }

      const sim=simulate(amount, rateValue, days, tpd, rateType, reinvest);
      const { rows, end, totalProfit, cumWithdraw, balanceSeries } = sim;

      if(els.tableBody) els.tableBody.innerHTML = rows.map(r=>`
        <tr>
          <td>${r.day}</td><td>${fmt(r.start)}</td><td>${fmt(r.profit)}</td>
          <td>${fmt(r.withdrawn)}</td><td>${fmt(r.end)}</td><td>${fmt(r.cumWithdraw)}</td>
        </tr>`).join('');

      if(els.totalEnd) els.totalEnd.textContent=fmt(end);
      if(els.totalProfit) els.totalProfit.textContent=fmt(totalProfit);
      if(els.totalWithdrawn) els.totalWithdrawn.textContent=reinvest?fmt(0):fmt(cumWithdraw);
      if(els.withdrawBox) els.withdrawBox.style.display=reinvest?'none':'block';

      if(els.snapStart) els.snapStart.textContent=fmt(amount);
      if(els.snapRate) els.snapRate.textContent=`${rateValue.toFixed(2)}%`;
      if(els.snapTrades) els.snapTrades.textContent=String(tpd);
      if(els.snapMode) els.snapMode.textContent=reinvest?'Auto Reinvest':'Withdraw';
      if(els.snapDay120){ const d120=simulate(amount,rateValue,120,tpd,rateType,true).end; els.snapDay120.textContent=fmt(d120); fitText(els.snapDay120); }

      drawChart(balanceSeries, scale);

      if(els.exportBtn){ els.exportBtn.onclick = ()=> download('trustmeai_projection.csv', toCSV(rows)); }
    }

    ['input','change'].forEach(evt=>{
      ['amount','rate','days','tradesPerDay','modeToggle'].forEach(id=>{
        const el=document.getElementById(id); if(el) el.addEventListener(evt, render, {passive:true});
      });
      document.querySelectorAll('input[name=\"rateType\"]').forEach(el=> el.addEventListener(evt, render, {passive:true}));
      document.querySelectorAll('input[name=\"scale\"]').forEach(el=> el.addEventListener(evt, render, {passive:true}));
    });

    const y=document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();
    render();
  });
})();