// app.js — minimal glue for calculator and demo interactions
document.addEventListener('DOMContentLoaded', () => {
  // Calculator
  const calcBtn = document.getElementById('calcBtn');
  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      const amount = parseFloat(document.getElementById('calcAmount').value || '0');
      const rate   = parseFloat(document.getElementById('calcRate').value || '0') / 100;
      const days   = parseInt(document.getElementById('calcDays').value || '0', 10);
      const comp   = document.getElementById('calcCompound').checked;
      let final = amount;
      if (comp) {
        for (let i=0;i<days;i++) final *= (1 + rate);
      } else {
        final = amount * (1 + rate * days);
      }
      const profit = final - amount;
      document.getElementById('calcResult').textContent = `Est. profit: ${profit.toFixed(2)} USDT — Final: ${final.toFixed(2)} USDT`;
    });
  }

  // Login modal (Get Started)
  const modal = document.getElementById('loginModal');
  document.getElementById('getStartedBtn')?.addEventListener('click', ()=> modal.classList.remove('hidden'));
  document.getElementById('loginClose')?.addEventListener('click', ()=> modal.classList.add('hidden'));

  // Fake balances placeholder
  const balAvail = document.getElementById('balAvailable');
  const balLocked = document.getElementById('balLocked');
  const balTotal = document.getElementById('balTotal');
  if (balAvail && balLocked && balTotal) {
    const a = parseFloat(localStorage.getItem('tmai.avail') || '120.00');
    const l = parseFloat(localStorage.getItem('tmai.locked') || '30.00');
    balAvail.textContent = a.toFixed(2);
    balLocked.textContent = l.toFixed(2);
    balTotal.textContent = (a + l).toFixed(2);
  }
});
