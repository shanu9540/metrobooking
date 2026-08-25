const Booking = require('../models/Booking');
const Station = require('../models/Station');
const { findRoute } = require('../services/routingService');
const { calculateFare } = require('../services/fareService');
const { razorpay, isMock } = require('../config/razorpay');
const mongoose = require('mongoose');
const { mockBookings, mockStations } = require('../config/mockDb');

/**
 * Create a new booking and initialize Razorpay order
 * POST /api/bookings
 */
const createBooking = async (req, res, next) => {
  const {
    sourceStationId,
    destinationStationId,
    passengerName,
    passengerEmail,
    passengerPhone,
    journeyDate,
    journeyTime,
    passengerCount
  } = req.body;

  try {
    if (!sourceStationId || !destinationStationId || !passengerName || !passengerEmail || !passengerPhone || !journeyDate || !journeyTime || !passengerCount) {
      res.status(400);
      throw new Error('All passenger, route, and schedule fields are required');
    }

    const count = parseInt(passengerCount);
    if (isNaN(count) || count < 1 || count > 10) {
      res.status(400);
      throw new Error('Passenger count must be between 1 and 10');
    }

    // 1. Fetch Source and Destination Stations
    if (mongoose.connection.readyState !== 1) {
      const translateOldId = (id) => {
        if (!id) return '';
        const mapping = {
          'SEC18': 'noida_sector_18',
          'NCC': 'noida_city_centre',
          'SEC34': 'noida_sector_34',
          'SEC52': 'noida_sector_52',
          'NEC': 'noida_electronic_city',
          'HCC': 'millennium_city_centre_gurugram',
          'AIIMS': 'aiims',
          'CS': 'central_secretariat',
          'RC': 'rajiv_chowk',
          'ND': 'new_delhi',
          'CC': 'chandni_chowk',
          'KG': 'kashmere_gate',
          'DW21': 'dwarka_sector_21',
          'RG': 'rajouri_garden',
          'MH': 'mandi_house',
          'YB': 'yamuna_bank',
          'DL': 'dilshad_garden'
        };
        return mapping[id] || id;
      };

      const findStation = (id) => {
        if (!id) return null;
        const clean = id.toLowerCase().replace(/[^a-z0-9]/g, '');
        const mappedId = translateOldId(id);
        return mockStations.find(s => 
          s._id === id || 
          s.stationId === id ||
          s._id === mappedId ||
          s.stationId === mappedId ||
          s.stationName.toLowerCase().replace(/[^a-z0-9]/g, '') === clean
        );
      };

      const srcStation = findStation(sourceStationId);
      const destStation = findStation(destinationStationId);

      if (!srcStation || !destStation) {
        res.status(404);
        throw new Error('Source or Destination station not found (Mock Mode)');
      }
      const farePerPassenger = 30;
      const totalAmount = farePerPassenger * count;
      const bookingId = `MT${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
      const orderId = `order_mock_${Date.now()}`;
      const mockBooking = {
        _id: `mock_bk_${Date.now()}`,
        bookingId,
        user: req.user._id,
        sourceStation: srcStation,
        destinationStation: destStation,
        passengerName,
        passengerEmail,
        passengerPhone,
        journeyDate,
        journeyTime,
        passengerCount: count,
        farePerPassenger,
        totalAmount,
        razorpayOrderId: orderId,
        paymentStatus: 'PENDING',
        createdAt: new Date()
      };
      mockBookings.push(mockBooking);
      return res.status(201).json({
        success: true,
        booking: mockBooking,
        razorpayOrder: {
          id: orderId,
          amount: Math.round(totalAmount * 100),
          currency: 'INR'
        }
      });
    }

    const srcStation = await Station.findById(sourceStationId);
    const destStation = await Station.findById(destinationStationId);

    if (!srcStation || !destStation) {
      res.status(404);
      throw new Error('Source or Destination station not found');
    }

    // 2. Validate Route & Distance (Backend Validation)
    const routeDetails = await findRoute(srcStation._id.toString(), destStation._id.toString());
    const farePerPassenger = await calculateFare(routeDetails.distance);
    const totalAmount = farePerPassenger * count;

    // 3. Generate Booking ID
    const bookingId = `MT${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Create Razorpay order (or Mock)
    let orderId = `order_mock_${Date.now()}`;
    if (!isMock && razorpay) {
      try {
        const order = await razorpay.orders.create({
          amount: Math.round(totalAmount * 100), // in paise
          currency: 'INR',
          receipt: bookingId
        });
        orderId = order.id;
      } catch (rzpError) {
        console.error('Razorpay order creation failed, error:', rzpError);
        res.status(500);
        throw new Error(`Payment gateway order creation failed: ${rzpError.message}`);
      }
    }

    // 5. Create Booking Document
    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      sourceStation: srcStation._id,
      destinationStation: destStation._id,
      passengerName,
      passengerEmail,
      passengerPhone,
      journeyDate: new Date(journeyDate),
      journeyTime,
      passengerCount: count,
      distance: routeDetails.distance,
      duration: routeDetails.duration,
      farePerPassenger,
      totalAmount,
      orderId,
      bookingStatus: 'PENDING',
      paymentStatus: 'PENDING'
    });

    res.status(201).json({
      success: true,
      booking,
      razorpayKeyId: isMock ? 'mock' : process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get logged-in user's booking history
 * GET /api/bookings
 */
const getBookings = async (req, res, next) => {
  const { status } = req.query;
  try {
    if (mongoose.connection.readyState !== 1) {
      const userBookings = mockBookings.filter(b => b.user === req.user._id);
      return res.json({
        success: true,
        count: userBookings.length,
        bookings: userBookings
      });
    }
    const filter = { user: req.user._id };
    if (status) {
      filter.bookingStatus = status.toUpperCase();
    }

    const bookings = await Booking.find(filter)
      .populate('sourceStation destinationStation ticket')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking by ID
 * GET /api/bookings/:id
 */
const getBookingById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1 || req.params.id.startsWith('mock_')) {
      const booking = mockBookings.find(b => b._id === req.params.id || b.bookingId === req.params.id);
      if (!booking) {
        res.status(404);
        throw new Error('Booking not found (Mock Mode)');
      }
      return res.json({
        success: true,
        booking
      });
    }
    const booking = await Booking.findById(req.params.id)
      .populate('sourceStation destinationStation ticket');

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Check if authorized (must be user who booked, or admin)
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      res.status(403);
      throw new Error('Not authorized to view this booking');
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel ticket
 * POST /api/bookings/:id/cancel
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Check ownership
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      res.status(403);
      throw new Error('Not authorized to cancel this booking');
    }

    // Check status
    if (booking.bookingStatus !== 'CONFIRMED') {
      res.status(400);
      throw new Error(`Cannot cancel a booking with status: ${booking.bookingStatus}`);
    }

    // Check travel date/time (cannot cancel after/on journey date if it has already passed)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const journey = new Date(booking.journeyDate);
    journey.setHours(0, 0, 0, 0);

    if (journey < today) {
      res.status(400);
      throw new Error('Cannot cancel tickets for past journeys');
    }

    // Initiate refund if payment completed and keys are not mock
    let refundSuccessful = false;
    let refundId = null;

    if (booking.paymentStatus === 'SUCCESS' && booking.paymentId) {
      if (!isMock && razorpay) {
        try {
          const refund = await razorpay.payments.refund(booking.paymentId, {
            amount: Math.round(booking.totalAmount * 100) // full refund in paise
          });
          refundId = refund.id;
          refundSuccessful = true;
        } catch (rfError) {
          console.error('Razorpay refund failed:', rfError);
          // Don't crash, update status locally and warn
        }
      } else {
        refundSuccessful = true;
        refundId = `refund_mock_${Date.now()}`;
      }
    }

    // Update statuses
    booking.bookingStatus = 'CANCELLED';
    booking.paymentStatus = refundSuccessful ? 'REFUNDED' : booking.paymentStatus;
    
    // Invalidate ticket
    if (booking.ticket) {
      const Ticket = require('../models/Ticket');
      await Ticket.findByIdAndUpdate(booking.ticket, { isValid: false });
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully' + (refundSuccessful ? ' and refund initiated' : ''),
      booking,
      refundId
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking
};
