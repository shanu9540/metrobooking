const express = require('express');
const router = express.Router();
const { getTicketById, validateTicket } = require('../controllers/ticketController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/:id', protect, getTicketById);
router.post('/validate', protect, isAdmin, validateTicket); // Only admins can validate tickets

module.exports = router;
