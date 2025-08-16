function calculateProfit() {
  const amt = parseFloat(document.getElementById('calcAmount').value);
  const pct = parseFloat(document.getElementById('calcPercent').value);
  const daily = amt * (pct/100);
  document.getElementById('calcResult').innerText = `Daily Profit: ${daily.toFixed(2)} USDT`;
}

function mockDeposit() {
  alert("Deposit address generated (mock TRC20: TXXXXXX...).");
  const tbody = document.querySelector("#history tbody");
  tbody.innerHTML += `<tr><td>${new Date().toLocaleString()}</td><td>Deposit</td><td>100 USDT</td><td>Confirmed</td></tr>`;
}
function mockWithdraw() {
  alert("Withdraw request submitted (mock).");
  const tbody = document.querySelector("#history tbody");
  tbody.innerHTML += `<tr><td>${new Date().toLocaleString()}</td><td>Withdraw</td><td>50 USDT</td><td>Pending</td></tr>`;
}

// Referral chart
const ctx = document.getElementById('referralChart').getContext('2d');
new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['Level 1', 'Level 2', 'Level 3'],
    datasets: [{
      data: [60, 25, 15],
      backgroundColor: ['#007bff','#28a745','#ffc107']
    }]
  }
});
