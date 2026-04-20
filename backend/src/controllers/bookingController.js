const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const sendEmail = require('../utils/emailSetup');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const { eventId, date, time, phone, addressLine, area, cityState } = req.body;

  try {
    // 1. Validation
    if (!eventId || !date || !time || !phone || !addressLine || !area || !cityState) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if date is valid and not in the past
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({ message: 'Cannot book past dates' });
    }

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // 2. Create Booking
    const booking = await Booking.create({
      user: req.user._id,
      vendor: event.vendor,
      event: eventId,
      date: bookingDate,
      time,
      phone,
      address: {
        line1: addressLine,
        area,
        cityState
      },
      status: 'pending'
    });

    // 3. Send email notification to vendor
    try {
      const vendor = await User.findById(event.vendor);
      if (vendor && vendor.email) {
        await sendEmail({
          email: vendor.email,
          subject: `📩 New Booking Request - ${event.title}`,
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; border-radius: 12px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center;">
                <h1 style="margin: 0; color: #fff; font-size: 24px;">📩 New Booking Request</h1>
              </div>
              <div style="padding: 30px;">
                <p style="font-size: 16px; color: #c0c0c0;">Hi <strong style="color: #fff;">${vendor.name}</strong>,</p>
                <p style="color: #c0c0c0;">You have received a new booking request. Here are the details:</p>
                
                <div style="background: rgba(99, 102, 241, 0.1); border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #a0a0a0;">Service</td><td style="padding: 8px 0; color: #fff; font-weight: 500;">${event.title}</td></tr>
                    <tr><td style="padding: 8px 0; color: #a0a0a0;">Customer</td><td style="padding: 8px 0; color: #fff; font-weight: 500;">${req.user.name}</td></tr>
                    <tr><td style="padding: 8px 0; color: #a0a0a0;">Email</td><td style="padding: 8px 0; color: #fff; font-weight: 500;">${req.user.email}</td></tr>
                    <tr><td style="padding: 8px 0; color: #a0a0a0;">Phone</td><td style="padding: 8px 0; color: #fff; font-weight: 500;">${phone}</td></tr>
                    <tr><td style="padding: 8px 0; color: #a0a0a0;">Date</td><td style="padding: 8px 0; color: #fff; font-weight: 500;">${bookingDate.toLocaleDateString()}</td></tr>
                    <tr><td style="padding: 8px 0; color: #a0a0a0;">Time</td><td style="padding: 8px 0; color: #fff; font-weight: 500;">${time}</td></tr>
                    <tr><td style="padding: 8px 0; color: #a0a0a0;">Address</td><td style="padding: 8px 0; color: #fff; font-weight: 500;">${addressLine}, ${area}, ${cityState}</td></tr>
                  </table>
                </div>

                <p style="color: #c0c0c0;">Please log in to your dashboard to <strong>Confirm</strong> or <strong>Cancel</strong> this booking.</p>
                <p style="color: #888; font-size: 13px; margin-top: 30px;">— BookMyVibe Team</p>
              </div>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.error('Failed to send vendor notification email:', emailErr);
    }

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error while creating booking' });
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title price imageUrl category')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title price imageUrl category')
      .populate('vendor', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure only the booking owner can view it
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Failed to fetch booking' });
  }
};

// @desc    Update a booking (only if > 24hrs before event)
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this booking' });
    }

    // 24-hour restriction check
    const eventDateTime = new Date(booking.date);
    if (booking.time) {
      const [hours, minutes] = booking.time.split(':');
      eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    const now = new Date();
    const hoursLeft = (eventDateTime - now) / (1000 * 60 * 60);

    if (hoursLeft < 24) {
      return res.status(400).json({ message: 'Cannot edit booking within 24 hours of the event' });
    }

    const { date, time, phone, addressLine, area, cityState } = req.body;

    // Validate new date is not in the past
    if (date) {
      const newDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (newDate < today) {
        return res.status(400).json({ message: 'Cannot set a past date' });
      }
      booking.date = newDate;
    }

    if (time) booking.time = time;
    if (phone) booking.phone = phone;
    if (addressLine || area || cityState) {
      booking.address = {
        line1: addressLine || booking.address.line1,
        area: area || booking.address.area,
        cityState: cityState || booking.address.cityState
      };
    }

    await booking.save();
    res.json({ message: 'Booking updated successfully', booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Failed to update booking' });
  }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this booking' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Failed to delete booking' });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  deleteBooking
};
