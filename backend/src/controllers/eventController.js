const Event = require('../models/Event');

// @desc    Create a new event/service
// @route   POST /api/events
// @access  Private/Vendor
const createEvent = async (req, res) => {
  const { title, description, price, category, availability } = req.body;

  try {
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const event = await Event.create({
      vendor: req.user._id,
      title,
      description,
      price: Number(price),
      category,
      availability,
      imageUrl: req.file.path // Cloudinary URL
    });

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({}).populate('vendor', 'name email');
    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('vendor', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ event });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Failed to fetch event' });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById
};
