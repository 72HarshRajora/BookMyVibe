const express = require('express');
const router = express.Router();
const { getVendorEvents, getVendorBookings, updateBookingStatus } = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/vendor/events
router.get('/events', protect, getVendorEvents);

// GET /api/vendor/bookings
router.get('/bookings', protect, getVendorBookings);

// PUT /api/vendor/bookings/:id/status
router.put('/bookings/:id/status', protect, updateBookingStatus);

module.exports = router;
