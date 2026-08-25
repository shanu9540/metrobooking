const Station = require('../models/Station');

// Helper for Haversine distance calculation (fallback)
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d * 1000; // Distance in meters
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Get all stations
 * GET /api/stations
 */
const getStations = async (req, res, next) => {
  try {
    const stations = await Station.find({ isActive: true }).sort({ stationName: 1 });
    res.json({
      success: true,
      count: stations.length,
      stations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search stations by name
 * GET /api/stations/search?q=
 */
const searchStations = async (req, res, next) => {
  const { q } = req.query;
  try {
    if (!q) {
      return res.json({ success: true, stations: [] });
    }

    const stations = await Station.find({
      stationName: { $regex: q, $options: 'i' },
      isActive: true
    }).sort({ stationName: 1 });

    res.json({
      success: true,
      stations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Find nearby stations using lat, lng
 * GET /api/stations/nearby?lat=&lng=&radius=
 */
const getNearbyStations = async (req, res, next) => {
  const { lat, lng, radius } = req.query;

  try {
    if (!lat || !lng) {
      res.status(400);
      throw new Error('Latitude and longitude are required');
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDist = parseInt(radius) || 10000; // default 10km in meters

    let stations = [];
    try {
      // Try MongoDB geospatial search
      stations = await Station.find({
        isActive: true,
        location: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude] // [lng, lat]
            },
            $maxDistance: maxDist
          }
        }
      });
    } catch (geoError) {
      console.warn('Geospatial index query failed, using Haversine calculation fallback:', geoError.message);
      // Fallback: load all stations and filter manually (crash-proof)
      const allStations = await Station.find({ isActive: true });
      stations = allStations
        .map(station => {
          const [sLng, sLat] = station.location.coordinates;
          const dist = getHaversineDistance(latitude, longitude, sLat, sLng);
          return { station, distance: dist };
        })
        .filter(item => item.distance <= maxDist)
        .sort((a, b) => a.distance - b.distance)
        .map(item => item.station);
    }

    res.json({
      success: true,
      count: stations.length,
      stations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get station by ID
 * GET /api/stations/:id
 */
const getStationById = async (req, res, next) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      res.status(404);
      throw new Error('Station not found');
    }
    res.json({
      success: true,
      station
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStations,
  searchStations,
  getNearbyStations,
  getStationById
};
