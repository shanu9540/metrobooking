const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    qrCodeData: {
      type: String,
      required: true
    },
    isValid: {
      type: Boolean,
      default: true
    },
    isUsed: {
      type: Boolean,
      default: false
    },
    usedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
