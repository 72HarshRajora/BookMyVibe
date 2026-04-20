const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBookingById, updateBooking, deleteBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/bookings
router.post('/', protect, createBooking);

// GET /api/bookings/my-bookings
router.get('/my-bookings', protect, getMyBookings);

// GET /api/bookings/:id
router.get('/:id', protect, getBookingById);

// PUT /api/bookings/:id
router.put('/:id', protect, updateBooking);

// DELETE /api/bookings/:id
router.delete('/:id', protect, deleteBooking);

module.exports = router;
