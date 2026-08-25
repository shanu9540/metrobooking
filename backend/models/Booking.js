const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sourceStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true
    },
    destinationStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true
    },
    passengerName: {
      type: String,
      required: [true, 'Passenger name is required'],
      trim: true
    },
    passengerEmail: {
      type: String,
      required: [true, 'Passenger email is required'],
      trim: true
    },
    passengerPhone: {
      type: String,
      required: [true, 'Passenger mobile number is required'],
      trim: true
    },
    journeyDate: {
      type: Date,
      required: true
    },
    journeyTime: {
      type: String,
      required: true
    },
    passengerCount: {
      type: Number,
      required: true,
      min: [1, 'Must have at least 1 passenger'],
      max: [10, 'Maximum 10 passengers allowed per booking']
    },
    distance: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    farePerPassenger: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    orderId: {
      type: String,
      index: true
    },
    paymentId: {
      type: String,
      index: true
    },
    bookingStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED'],
      default: 'PENDING'
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'PENDING'
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket'
    }
  },
  {
    timestamps: true
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
