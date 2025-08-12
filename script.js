function skipIntro() {
    document.querySelector('.hero').style.display = 'none';
    document.getElementById('calculator').style.display = 'block';
}
function showCalculator() {
    skipIntro();
}
function calculateProfit() {
    let start = parseFloat(document.getElementById('startAmount').value);
    let dailyPercent = parseFloat(document.getElementById('dailyPercent').value) / 100;
    let days = parseInt(document.getElementById('days').value);
    let table = document.getElementById('results');
    table.innerHTML = '<tr><th>Day</th><th>Start</th><th>Profit</th><th>End</th></tr>';
    for (let i = 1; i <= days; i++) {
        let profit = start * dailyPercent;
        let end = start + profit;
        table.innerHTML += `<tr><td>${i}</td><td>$${start.toFixed(2)}</td><td>+$${profit.toFixed(2)}</td><td>$${end.toFixed(2)}</td></tr>`;
        start = end;
    }
}
