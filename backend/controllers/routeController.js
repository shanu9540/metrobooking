const { findRoute } = require('../services/routingService');
const { calculateFare } = require('../services/fareService');

/**
 * Calculates shortest route and corresponding ticket fare.
 * POST /api/fare/calculate
 */
const calculateFareAndRoute = async (req, res, next) => {
  const { sourceStationId, destinationStationId } = req.body;

  try {
    if (!sourceStationId || !destinationStationId) {
      res.status(400);
      throw new Error('Both sourceStationId and destinationStationId are required');
    }

    if (sourceStationId === destinationStationId) {
      res.status(400);
      throw new Error('Source and destination stations cannot be the same');
    }

    // Find route details
    const routeDetails = await findRoute(sourceStationId, destinationStationId);

    // Calculate fare
    const farePerPassenger = await calculateFare(routeDetails.distance);

    res.json({
      success: true,
      route: {
        path: routeDetails.path,
        segments: routeDetails.segments,
        distance: routeDetails.distance,
        duration: routeDetails.duration,
        stationCount: routeDetails.stationCount,
        interchangeCount: routeDetails.interchangeCount,
        interchanges: routeDetails.interchanges
      },
      fare: farePerPassenger
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateFareAndRoute
};
