const Event = require('../models/Event');
const { cloudinary } = require('../utils/cloudinary');
const fs = require('fs');

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

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'bookmyvibe',
    });
    
    // Delete local file after upload
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.error('Failed to delete local image file:', err);
    }

    const event = await Event.create({
      vendor: req.user._id,
      title,
      description,
      price: Number(price),
      category,
      availability,
      imageUrl: result.secure_url // Cloudinary URL
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
// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Vendor
const updateEvent = async (req, res) => {
  const { title, description, price, category, availability } = req.body;
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the vendor of the event
    if (event.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    let imageUrl = event.imageUrl;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'bookmyvibe',
      });
      imageUrl = result.secure_url;
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Failed to delete local image file:', err);
      }
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        price: Number(price),
        category,
        availability,
        imageUrl,
      },
      { new: true }
    );

    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event' });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Vendor
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event removed successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
};
