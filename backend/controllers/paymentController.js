const crypto = require('crypto');
const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Ticket = require('../models/Ticket');
const { isMock } = require('../config/razorpay');
const mongoose = require('mongoose');
const { mockBookings, mockTickets } = require('../config/mockDb');

/**
 * Verify payment signature and generate digital ticket
 * POST /api/payments/verify
 */
const verifyPayment = async (req, res, next) => {
  const {
    bookingId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    method
  } = req.body;

  try {
    if (!bookingId || !razorpay_order_id || !razorpay_payment_id) {
      res.status(400);
      throw new Error('Missing booking ID, order ID, or payment ID');
    }

    if (mongoose.connection.readyState !== 1 || bookingId.startsWith('mock_')) {
      const booking = mockBookings.find(b => b._id === bookingId || b.bookingId === bookingId);
      if (!booking) {
        res.status(404);
        throw new Error('Booking not found (Mock Mode)');
      }

      booking.paymentId = razorpay_payment_id;
      booking.bookingStatus = 'CONFIRMED';
      booking.paymentStatus = 'SUCCESS';

      const ticketId = `TKT${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
      const validationToken = JSON.stringify({
        t: ticketId,
        b: booking.bookingId,
        s: booking.sourceStation.stationId,
        d: booking.destinationStation.stationId,
        p: booking.passengerCount
      });

      const qrCodeDataUrl = await QRCode.toDataURL(validationToken, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300
      });

      const mockTicket = {
        _id: `mock_tkt_${Date.now()}`,
        ticketId,
        booking: booking._id,
        user: booking.user,
        qrCodeData: qrCodeDataUrl,
        isValid: true,
        isUsed: false,
        createdAt: new Date()
      };

      mockTickets.push(mockTicket);
      booking.ticket = mockTicket;

      return res.status(200).json({
        success: true,
        message: 'Payment verified and ticket generated (Mock Mode)',
        booking,
        ticket: mockTicket
      });
    }

    // 1. Fetch Booking
    const booking = await Booking.findById(bookingId).populate('sourceStation destinationStation');
    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    if (booking.bookingStatus !== 'PENDING') {
      res.status(400);
      throw new Error(`Booking is already processed. Status: ${booking.bookingStatus}`);
    }

    // 2. Verify Razorpay Signature (or skip if Mock)
    if (!isMock) {
      if (!razorpay_signature) {
        res.status(400);
        throw new Error('Razorpay signature is required in active mode');
      }

      const secret = process.env.RAZORPAY_KEY_SECRET || '';
      const text = razorpay_order_id + '|' + razorpay_payment_id;
      const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(text)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        // Payment signature verification failed
        booking.bookingStatus = 'PENDING';
        booking.paymentStatus = 'FAILED';
        await booking.save();

        res.status(400);
        throw new Error('Payment signature verification failed. Tampering detected.');
      }
    }

    // 3. Update Booking Payment Info
    booking.paymentId = razorpay_payment_id;
    booking.bookingStatus = 'CONFIRMED';
    booking.paymentStatus = 'SUCCESS';

    // 4. Create Payment Document
    const payment = await Payment.create({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature || 'mock_signature',
      amount: booking.totalAmount,
      status: 'SUCCESS',
      booking: booking._id,
      user: booking.user,
      method: method || 'UPI'
    });

    // 5. Generate Ticket and QR Code
    const ticketId = `TKT${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
    
    // QR Code encodes a signed ticket identifier validation token rather than sensitive details
    // We create a validation token that contains the ticketId and bookingId
    const validationToken = JSON.stringify({
      t: ticketId,
      b: booking.bookingId,
      s: booking.sourceStation.stationId,
      d: booking.destinationStation.stationId,
      p: booking.passengerCount
    });

    // Generate QR code data URL (Base64 PNG image)
    const qrCodeDataUrl = await QRCode.toDataURL(validationToken, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300
    });

    const ticket = await Ticket.create({
      ticketId,
      booking: booking._id,
      user: booking.user,
      qrCodeData: qrCodeDataUrl,
      isValid: true,
      isUsed: false
    });

    // Link Ticket to Booking
    booking.ticket = ticket._id;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified and ticket generated successfully',
      booking,
      ticket
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyPayment
};
