const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const { mockBookings, mockTickets } = require('../config/mockDb');

/**
 * Get ticket details by ID
 * GET /api/tickets/:id
 */
const getTicketById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1 || req.params.id.startsWith('mock_')) {
      const ticket = mockTickets.find(t => t._id === req.params.id || t.ticketId === req.params.id);
      if (!ticket) {
        res.status(404);
        throw new Error('Ticket not found (Mock Mode)');
      }
      const booking = mockBookings.find(b => b._id === ticket.booking || b.bookingId === ticket.booking);
      ticket.booking = booking;
      return res.json({
        success: true,
        ticket
      });
    }
    const ticket = await Ticket.findById(req.params.id)
      .populate({
        path: 'booking',
        populate: {
          path: 'sourceStation destinationStation'
        }
      })
      .populate('user', 'name email phone');

    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }

    // Check ownership or Admin role
    if (ticket.user._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      res.status(403);
      throw new Error('Not authorized to view this ticket');
    }

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate ticket QR payload and mark as used
 * POST /api/tickets/validate
 */
const validateTicket = async (req, res, next) => {
  const { ticketId, qrToken } = req.body;

  try {
    let searchId = ticketId;

    // If QR token is passed, parse out the ticketId
    if (qrToken) {
      try {
        const parsed = JSON.parse(qrToken);
        searchId = parsed.t || parsed.ticketId;
      } catch (parseError) {
        // Try searching for token directly if parsing fails
        searchId = qrToken;
      }
    }

    if (!searchId) {
      res.status(400);
      throw new Error('Ticket ID or QR code token is required');
    }

    if (mongoose.connection.readyState !== 1 || searchId.startsWith('TKT')) {
      const ticket = mockTickets.find(t => t.ticketId === searchId || t._id === searchId);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          valid: false,
          message: 'Invalid Ticket: Ticket not found in mock records.'
        });
      }
      const booking = mockBookings.find(b => b._id === ticket.booking || b.bookingId === ticket.booking);
      ticket.booking = booking;
      if (ticket.isUsed) {
        return res.status(400).json({
          success: true,
          valid: false,
          message: `Invalid Ticket: This ticket has already been used (Mock Mode).`,
          ticket
        });
      }
      ticket.isUsed = true;
      ticket.usedAt = new Date();
      return res.json({
        success: true,
        valid: true,
        message: 'Ticket Valid: Check-in approved (Mock Mode). Have a safe journey!',
        ticket
      });
    }

    const ticket = await Ticket.findOne({ ticketId: searchId })
      .populate({
        path: 'booking',
        populate: {
          path: 'sourceStation destinationStation'
        }
      })
      .populate('user', 'name email phone');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Invalid Ticket: Ticket not found in records.'
      });
    }

    // 1. Check if valid
    if (!ticket.isValid) {
      return res.status(400).json({
        success: true,
        valid: false,
        message: 'Invalid Ticket: This ticket has been cancelled or invalidated.',
        ticket
      });
    }

    // 2. Check booking confirmation
    if (ticket.booking.bookingStatus !== 'CONFIRMED' || ticket.booking.paymentStatus !== 'SUCCESS') {
      return res.status(400).json({
        success: true,
        valid: false,
        message: `Invalid Ticket: Booking status is ${ticket.booking.bookingStatus} and payment status is ${ticket.booking.paymentStatus}.`,
        ticket
      });
    }

    // 3. Check if already used
    if (ticket.isUsed) {
      return res.status(400).json({
        success: true,
        valid: false,
        message: `Invalid Ticket: This ticket has already been used on ${new Date(ticket.usedAt).toLocaleString()}.`,
        ticket
      });
    }

    // 4. Mark ticket as used (gate exit/entry simulated)
    ticket.isUsed = true;
    ticket.usedAt = new Date();
    await ticket.save();

    res.json({
      success: true,
      valid: true,
      message: 'Ticket Valid: Check-in approved. Have a safe journey!',
      ticket
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTicketById,
  validateTicket
};
