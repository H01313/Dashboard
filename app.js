// Portfolio data voor demo charts
const portfolioChart = new Chart(document.getElementById('portfolioChart'), {
  type: 'line',
  data: {
    labels: ['27 mrt', '28 mrt', '29 mrt', '30 mrt', '31 mrt', '1 apr'],
    datasets: [{
      label: 'Portfolio',
      data: [4210, 4285, 4332, 4476, 4529, 4604],
      border
