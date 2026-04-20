const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEventById } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');

// GET all events
router.get('/', getEvents);

// GET single event
router.get('/:id', getEventById);

// POST create event (Vendor only, uses multer/cloudinary for image upload)
// Note: We'll assume the protect middleware attaches req.user and checks if user is logged in
router.post('/', protect, upload.single('image'), createEvent);

module.exports = router;
