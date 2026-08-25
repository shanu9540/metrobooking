const User = require('../models/User');
const Booking = require('../models/Booking');
const Station = require('../models/Station');
const FareConfig = require('../models/FareConfig');

/**
 * Get overall dashboard analytics
 * GET /api/admin/dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'USER' });
    const totalBookings = await Booking.countDocuments();
    
    // Today's bookings
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaysBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    // Payment stats
    const successfulPaymentsCount = await Booking.countDocuments({ paymentStatus: 'SUCCESS' });
    const failedPaymentsCount = await Booking.countDocuments({ paymentStatus: 'FAILED' });
    const cancelledCount = await Booking.countDocuments({ bookingStatus: 'CANCELLED' });

    // Revenue calculation
    const revenueAggregation = await Booking.aggregate([
      { $match: { paymentStatus: 'SUCCESS' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBookings,
        todaysBookings,
        successfulPaymentsCount,
        failedPaymentsCount,
        cancelledCount,
        totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users list
 * GET /api/admin/users
 */
const manageUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new station
 * POST /api/admin/stations
 */
const addStation = async (req, res, next) => {
  const { stationId, stationName, lineName, latitude, longitude, address } = req.body;
  try {
    if (!stationId || !stationName || !lineName || !latitude || !longitude) {
      res.status(400);
      throw new Error('All fields except address are required');
    }

    const exists = await Station.findOne({ stationId });
    if (exists) {
      res.status(400);
      throw new Error('Station ID already exists');
    }

    // Convert lineName to array if string
    const lines = Array.isArray(lineName) ? lineName : lineName.split(',').map(l => l.trim());

    const station = await Station.create({
      stationId,
      stationName,
      lineName: lines,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)] // [lng, lat]
      },
      address: address || '',
      isActive: true
    });

    res.status(201).json({
      success: true,
      station
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Edit an existing station
 * PUT /api/admin/stations/:id
 */
const editStation = async (req, res, next) => {
  const { stationName, lineName, latitude, longitude, address, isActive } = req.body;
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      res.status(404);
      throw new Error('Station not found');
    }

    station.stationName = stationName || station.stationName;
    station.address = address !== undefined ? address : station.address;
    station.isActive = isActive !== undefined ? isActive : station.isActive;

    if (lineName) {
      station.lineName = Array.isArray(lineName) ? lineName : lineName.split(',').map(l => l.trim());
    }

    if (latitude && longitude) {
      station.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }

    await station.save();
    res.json({
      success: true,
      station
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Fare Configuration brackets
 * POST /api/admin/fares
 */
const updateFares = async (req, res, next) => {
  const { brackets } = req.body; // Expects array: [{ minDistance, maxDistance, fare }]
  try {
    if (!brackets || !Array.isArray(brackets) || brackets.length === 0) {
      res.status(400);
      throw new Error('Invalid brackets format. Array is required.');
    }

    // Wipe and insert new configs
    await FareConfig.deleteMany({});
    const newConfigs = await FareConfig.insertMany(brackets);

    res.json({
      success: true,
      message: 'Fare configuration updated successfully',
      configs: newConfigs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  manageUsers,
  addStation,
  editStation,
  updateFares
};
