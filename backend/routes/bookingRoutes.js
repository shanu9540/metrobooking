const express = require('express');
const router = express.Router();
const { createBooking, getBookings, getBookingById, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // protect all booking routes

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/:id/cancel', cancelBooking);

module.exports = router;
