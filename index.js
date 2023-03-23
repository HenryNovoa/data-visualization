const fs = require('fs');

const promotionTypeMapping = {
  'percent-off': 1,
  'dollar-off': 2,
  'free-shipping': 3,
  'buy-one-get-one': 4,
  'free-gift': 5
};

fs.readFile('data/coupons.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  const database = JSON.parse(data);
  const stats = analyzeCoupons(database.coupons);
  fs.writeFile('public/compressed_stats.json', JSON.stringify(stats), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Compressed statistics saved to compressed_stats.json');
  });
});

function analyzeCoupons(coupons) {
  const couponTypes = countCouponTypes(coupons);
  const percentOffStats = calculateDiscountStats(coupons, 'percent-off');
  const dollarOffStats = calculateDiscountStats(coupons, 'dollar-off');
  const retailerStats = calculateRetailerStats(coupons);

  return {
    ct:couponTypes,
    pos: percentOffStats,
    dos: dollarOffStats,
    rs: retailerStats,
  };
}

function countCouponTypes(coupons) {
  const countTypes = {};
  for (const coupon of coupons) {
    const typeId = promotionTypeMapping[coupon.promotion_type] || 0;
    countTypes[typeId] = (countTypes[typeId] || 0) + 1;
  }
  return countTypes;
}

function calculateDiscountStats(coupons, promotionType) {
  const stats = [0, Infinity, -Infinity, 0];

  for (const coupon of coupons) {
    if (coupon.promotion_type === promotionType) {
      stats[0]++; // count
      stats[1] = Math.min(stats[1], coupon.value); // min
      stats[2] = Math.max(stats[2], coupon.value); // max
      stats[3] += coupon.value; // total
    }
  }

  stats[3] /= stats[0]; // average
  return stats;
}

function calculateRetailerStats(coupons) {
  const retailerStats = {};

  for (const coupon of coupons) {
    const { webshop_id, promotion_type, value } = coupon;
    const typeId = promotionTypeMapping[promotion_type] || 0;

    // Setting the initial values
    if (!retailerStats[webshop_id]) {
      retailerStats[webshop_id] = {};
    }
    if (!retailerStats[webshop_id][typeId]) {
      retailerStats[webshop_id][typeId] = [0, Infinity, -Infinity, 0];
    }

    const stats = retailerStats[webshop_id][typeId];
    stats[0]++; // count
    stats[1] = Math.min(stats[1], value); // min
    stats[2] = Math.max(stats[2], value); // max
    stats[3] += value; // total
  }

  // Calculate averages
  for (const retailer in retailerStats) {
    for (const typeId in retailerStats[retailer]) {
      retailerStats[retailer][typeId][3] /= retailerStats[retailer][typeId][0]; // average
    }
  }

  return retailerStats;
}
