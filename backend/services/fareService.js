const FareConfig = require('../models/FareConfig');

// Default pricing structure in case DB configurations are not loaded or seeded yet
const DEFAULT_FARE_CONFIG = [
  { minDistance: 0, maxDistance: 2, fare: 10 },
  { minDistance: 2, maxDistance: 5, fare: 20 },
  { minDistance: 5, maxDistance: 12, fare: 30 },
  { minDistance: 12, maxDistance: 21, fare: 40 },
  { minDistance: 21, maxDistance: 32, fare: 50 },
  { minDistance: 32, maxDistance: 9999, fare: 60 }
];

/**
 * Calculates fare based on distance (km) and the database configuration.
 * @param {Number} distance - The distance in km
 * @returns {Promise<Number>} - The fare in INR
 */
async function calculateFare(distance) {
  try {
    // Fetch configs from DB, sorted by minDistance
    const configs = await FareConfig.find({}).sort({ minDistance: 1 });
    
    const activeConfigs = configs.length > 0 ? configs : DEFAULT_FARE_CONFIG;

    // Find the matching range
    for (const range of activeConfigs) {
      if (distance >= range.minDistance && distance < range.maxDistance) {
        return range.fare;
      }
    }

    // Fallback if distance exceeds all ranges
    if (activeConfigs.length > 0) {
      return activeConfigs[activeConfigs.length - 1].fare;
    }

    return 60; // Default flat max fare
  } catch (error) {
    console.error('Error calculating fare:', error);
    // Hardcoded fallback on error
    for (const range of DEFAULT_FARE_CONFIG) {
      if (distance >= range.minDistance && distance < range.maxDistance) {
        return range.fare;
      }
    }
    return 60;
  }
}

module.exports = {
  calculateFare,
  DEFAULT_FARE_CONFIG
};
