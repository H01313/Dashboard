const portfolioChart = new Chart(document.getElementById('portfolioChart'), {
  type: 'line',
  data: {
    labels: ['27 mrt', '28 mrt', '29 mrt', '30 mrt', '31 mrt', '1 apr'],
    datasets: [{
      label: 'Portfolio',
      data: [4210, 4285, 4332, 4476, 4529, 4604],
      borderColor: '#4f98a3',
      backgroundColor: 'rgba(79,152,163,0.16)',
      fill: true,
      tension: 0.35
    }]
  },
  options: { plugins: { legend: { display: false } } }
});

const allocationChart = new Chart(document.getElementById('allocationChart'), {
  type: 'doughnut',
  data: {
    labels: ['XRP', 'NEXO'],
    datasets: [{
      data: [4346, 2296],
      backgroundColor: ['#4f98a3', '#e8af34']
    }]
  },
  options: { plugins: { legend: { labels: { color: '#cdccca' } } } }
});

async function loadLivePrices() {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ripple,nexo&vs_currencies=eur,usd';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('API fout: ' + response.status);
    }

    const data = await response.json();

    const xrpEur = data.ripple.eur;
    const xrpUsd = data.ripple.usd;
    const nexoEur = data.nexo.eur;
    const nexoUsd = data.nexo.usd;
    const ratio = nexoEur / xrpEur;

    document.getElementById('xrpPrice').textContent = '€ ' + xrpEur.toFixed(4);
    document.getElementById('xrpUsd').textContent = 'USD: $' + xrpUsd.toFixed(4);

    document.getElementById('nexoPrice').textContent = '€ ' + nexoEur.toFixed(4);
    document.getElementById('nexoUsd').textContent = 'USD: $' + nexoUsd.toFixed(4);

    document.getElementById('nexoInXrp').textContent = ratio.toFixed(4) + ' XRP';

    document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.error('Fout bij laden CoinGecko data:', error);
    document.getElementById('xrpPrice').textContent = 'Fout';
    document.getElementById('nexoPrice').textContent = 'Fout';
    document.getElementById('nexoInXrp').textContent = 'Fout';
    document.getElementById('lastUpdated').textContent = 'Mislukt';
  }
}

loadLivePrices();
setInterval(loadLivePrices, 60000);
