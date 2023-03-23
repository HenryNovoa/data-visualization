const promotionTypeMapping = {
  0: 'Miscellaneous',
  1: 'Percent Off',
  2: 'Dollar Off',
  3: 'Free Shipping',
  4: 'Buy One Get One',
  5: 'Free Gift',
};

fetch('/public/compressed_stats.json')
  .then(response => response.json())
  .then(stats => {
    createCouponTypesChart(stats.ct);
    createGeneralStatsCharts(stats.pos, stats.dos);
    createRetailerStatsCharts(stats.rs);
  });

function createCouponTypesChart(couponTypes) {
  const ctx = document.getElementById('couponTypesChart').getContext('2d');
  const labels = Object.keys(couponTypes).map(key => promotionTypeMapping[key]);
  const data = Object.values(couponTypes);

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#4c9aff', '#ff6464', '#DFFF00', '#FFFF00', '#A020F0', '#FFA500'],
      }],
    },
    options: {
      plugins: {
        legend: {
          position: 'top',
        },
      },
    },
  });
}

function createGeneralStatsCharts(percentOffStats, dollarOffStats) {
  const labels = ['Count', 'Min Discount', 'Max Discount', 'Average Discount'];
  const data = [percentOffStats, dollarOffStats];
  const ctx = document.getElementById('generalStatsChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Percent Off',
          data: data[0],
          backgroundColor: '#4c9aff',
        },
        {
          label: 'Dollar Off',
          data: data[1],
          backgroundColor: '#ff6464',
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: 'top',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function createRetailerStatsCharts(retailerStats) {
  const retailers = Object.keys(retailerStats);
  const data = retailers.map((retailer) => {
    const retailerData = retailerStats[retailer];
    let totalCount = 0;

    for (const key in retailerData) {
      totalCount += retailerData[key][0];
    }

    return {
      retailer,
      totalCount,
      percentOffCount: retailerData[1][0],
      dollarOffCount: retailerData[2][0],
    };
  });

  const labels = data.map((item) => item.retailer);
  const percentOffData = data.map((item) => item.percentOffCount);
  const dollarOffData = data.map((item) => item.dollarOffCount);

  const ctx = document.getElementById('retailerStatsChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Percent Off',
          data: percentOffData,
          backgroundColor: '#4c9aff',
        },
        {
          label: 'Dollar Off',
          data: dollarOffData,
          backgroundColor: '#ff6464',
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: 'top',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}