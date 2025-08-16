/* Additions to your existing script.js — safe plan binding */
(function(){
  function openPlanPopup(tier, min, max){
    const modal = document.getElementById('torrent-scanner-popup') || document.getElementById('plan-popup');
    if(!modal){ console.error('Plan popup element not found'); return; }
    modal.style.display = 'block';
    // if you have fields, set them:
    const t = document.getElementById('plan-tier'); if (t) t.textContent = tier || 'T1';
    const a = document.getElementById('plan-amount'); if (a){ if(min) a.min=min; if(max) a.max=max; }
  }

  function bindActivatePlan(){
    const buttons = document.querySelectorAll('[data-activate], .btn-activate');
    if(!buttons.length){ /* fallback: try text match */ 
      document.querySelectorAll('button').forEach(b=>{
        if(/activate plan/i.test(b.textContent)) b.classList.add('btn-activate');
      });
    }
    (document.querySelectorAll('[data-activate], .btn-activate')||[]).forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const tier = btn.dataset.tier || btn.getAttribute('data-tier') || '';
        const min  = +(btn.dataset.min  || btn.getAttribute('data-min')  || 0);
        const max  = +(btn.dataset.max  || btn.getAttribute('data-max')  || 0);
        openPlanPopup(tier, min, max);
      });
    });
  }

  // EXPOSE for strategy.html
  window.bindActivatePlan = bindActivatePlan;
})();