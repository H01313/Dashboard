const STORAGE_KEY = 'crypto_dca_purchases_v1';
let livePrices = { XRP: { eur: 0, usd: 0 }, NEXO: { eur: 0, usd: 0 } };
let purchases = loadPurchases();
const euro = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });

function loadPurchases() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function savePurchases() { localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases)); }
function formatNumber(value, digits = 4) {
  return new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(value || 0);
}

async function loadLivePrices() {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ripple,nexo&vs_currencies=eur,usd';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('API fout: ' + response.status);
    const data = await response.json();
    livePrices = {
      XRP: { eur: data?.ripple?.eur || 0, usd: data?.ripple?.usd || 0 },
      NEXO: { eur: data?.nexo?.eur || 0, usd: data?.nexo?.usd || 0 }
    };
    document.getElementById('xrpPrice').textContent = euro.format(livePrices.XRP.eur);
    document.getElementById('xrpUsd').textContent = 'USD: $' + formatNumber(livePrices.XRP.usd, 4);
    document.getElementById('nexoPrice').textContent = euro.format(livePrices.NEXO.eur);
    document.getElementById('nexoUsd').textContent = 'USD: $' + formatNumber(livePrices.NEXO.usd, 4);
    const ratio = livePrices.XRP.eur > 0 ? livePrices.NEXO.eur / livePrices.XRP.eur : 0;
    document.getElementById('nexoRatio').textContent = formatNumber(ratio, 4) + ' XRP';
    document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    renderPortfolio();
  } catch (error) {
    console.error('Fout bij laden CoinGecko data:', error);
    document.getElementById('xrpPrice').textContent = 'Fout';
    document.getElementById('nexoPrice').textContent = 'Fout';
    document.getElementById('nexoRatio').textContent = 'Fout';
    document.getElementById('lastUpdated').textContent = 'Mislukt';
  }
}

function addPurchase() {
  const coin = document.getElementById('purchaseCoin').value;
  const amount = parseFloat(document.getElementById('purchaseAmount').value);
  const price = parseFloat(document.getElementById('purchasePrice').value);
  const fees = parseFloat(document.getElementById('purchaseFees').value || '0');
  if (!coin || !amount || !price || amount <= 0 || price <= 0) {
    alert('Vul coin, aantal en prijs correct in.');
    return;
  }
  purchases.push({ coin, amount, price, fees, createdAt: new Date().toISOString() });
  savePurchases();
  document.getElementById('purchaseAmount').value = '';
  document.getElementById('purchasePrice').value = '';
  document.getElementById('purchaseFees').value = '0';
  renderPortfolio();
}

function groupedPortfolio() {
  const grouped = { XRP: { amount: 0, cost: 0 }, NEXO: { amount: 0, cost: 0 } };
  purchases.forEach(item => {
    grouped[item.coin].amount += item.amount;
    grouped[item.coin].cost += (item.amount * item.price) + item.fees;
  });
  return grouped;
}

function renderPortfolio() {
  const grouped = groupedPortfolio();
  const xrpAmount = grouped.XRP.amount;
  const nexoAmount = grouped.NEXO.amount;
  const xrpCost = grouped.XRP.cost;
  const nexoCost = grouped.NEXO.cost;
  const totalCost = xrpCost + nexoCost;
  const xrpValue = xrpAmount * livePrices.XRP.eur;
  const nexoValue = nexoAmount * livePrices.NEXO.eur;
  const totalValue = xrpValue + nexoValue;
  const pnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
  const avgXRP = xrpAmount > 0 ? xrpCost / xrpAmount : 0;
  const avgNEXO = nexoAmount > 0 ? nexoCost / nexoAmount : 0;
  document.getElementById('totalPurchases').textContent = purchases.length;
  document.getElementById('totalCostLocal').textContent = euro.format(totalCost);
  document.getElementById('avgXRP').textContent = xrpAmount > 0 ? euro.format(avgXRP) : '€ -';
  document.getElementById('avgNEXO').textContent = nexoAmount > 0 ? euro.format(avgNEXO) : '€ -';
  document.getElementById('totalInvested').textContent = euro.format(totalCost);
  document.getElementById('portfolioValue').textContent = euro.format(totalValue);
  document.getElementById('unrealizedPnL').textContent = euro.format(pnl);
  document.getElementById('unrealizedPnL').className = 'value ' + (pnl >= 0 ? 'positive' : 'negative');
  document.getElementById('unrealizedPnLPct').textContent = formatNumber(pnlPct, 2) + '%';
  document.getElementById('unrealizedPnLPct').className = 'subtext ' + (pnl >= 0 ? 'positive' : 'negative');
  document.getElementById('totalXRP').textContent = formatNumber(xrpAmount, 4);
  document.getElementById('totalNEXO').textContent = formatNumber(nexoAmount, 4);
  const positionsTable = document.getElementById('positionsTable');
  const rows = [];
  if (xrpAmount > 0) {
    const xrpPnl = xrpValue - xrpCost;
    rows.push(`<tr><td>XRP</td><td>${formatNumber(xrpAmount, 4)}</td><td>${euro.format(avgXRP)}</td><td>${euro.format(livePrices.XRP.eur)}</td><td>${euro.format(xrpValue)}</td><td class="${xrpPnl >= 0 ? 'positive' : 'negative'}">${euro.format(xrpPnl)}</td></tr>`);
  }
  if (nexoAmount > 0) {
    const nexoPnl = nexoValue - nexoCost;
    rows.push(`<tr><td>NEXO</td><td>${formatNumber(nexoAmount, 4)}</td><td>${euro.format(avgNEXO)}</td><td>${euro.format(livePrices.NEXO.eur)}</td><td>${euro.format(nexoValue)}</td><td class="${nexoPnl >= 0 ? 'positive' : 'negative'}">${euro.format(nexoPnl)}</td></tr>`);
  }
  positionsTable.innerHTML = rows.length ? rows.join('') : '<tr><td colspan="6">Nog geen aankopen toegevoegd.</td></tr>';
  updateCharts(xrpValue, nexoValue, totalValue);
}

let portfolioChart;
let allocationChart;
function initCharts() {
  portfolioChart = new Chart(document.getElementById('portfolioChart'), {
    type: 'line',
    data: { labels: ['Start', 'Nu'], datasets: [{ label: 'Portfolio', data: [0, 0], borderColor: '#4f98a3', backgroundColor: 'rgba(79,152,163,0.16)', fill: true, tension: 0.35 }] },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
  allocationChart = new Chart(document.getElementById('allocationChart'), {
    type: 'doughnut',
    data: { labels: ['XRP', 'NEXO'], datasets: [{ data: [0, 0], backgroundColor: ['#4f98a3', '#e8af34'] }] },
    options: { responsive: true, plugins: { legend: { labels: { color: '#cdccca' } } } }
  });
}
function updateCharts(xrpValue, nexoValue, totalValue) {
  if (!portfolioChart || !allocationChart) return;
  portfolioChart.data.datasets[0].data = [0, totalValue];
  portfolioChart.update();
  allocationChart.data.datasets[0].data = [xrpValue, nexoValue];
  allocationChart.update();
}

document.getElementById('addPurchaseBtn').addEventListener('click', addPurchase);
initCharts();
renderPortfolio();
loadLivePrices();
setInterval(loadLivePrices, 60000);
