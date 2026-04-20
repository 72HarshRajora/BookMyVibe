const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');
const sendEmail = require('../utils/emailSetup');

// @desc    Get all events created by this vendor
// @route   GET /api/vendor/events
// @access  Private/Vendor
const getVendorEvents = async (req, res) => {
  try {
    const events = await Event.find({ vendor: req.user._id });
    res.json({ events });
  } catch (error) {
    console.error('Error fetching vendor events:', error);
    res.status(500).json({ message: 'Failed to fetch vendor events' });
  }
};

// @desc    Get all bookings for this vendor's events
// @route   GET /api/vendor/bookings
// @access  Private/Vendor
const getVendorBookings = async (req, res) => {
  try {
    const events = await Event.find({ vendor: req.user._id }).select('_id');
    const eventIds = events.map(e => e._id);
    
    let bookings = [];
    try {
      if (Booking && typeof Booking.find === 'function') {
        bookings = await Booking.find({ event: { $in: eventIds } })
          .populate('user', 'name email')
          .populate('event', 'title price');
      }
    } catch (err) {
      console.error("Booking model might not be fully configured yet:", err);
    }

    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching vendor bookings:', error);
    res.status(500).json({ message: 'Failed to fetch vendor bookings' });
  }
};

// @desc    Update booking status (confirm/cancel)
// @route   PUT /api/vendor/bookings/:id/status
// @access  Private/Vendor
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "confirmed" or "cancelled"' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title price');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify the booking belongs to one of this vendor's events
    if (booking.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    await booking.save();

    // Send email notification to user
    try {
      const customer = await User.findById(booking.user);
      if (customer && customer.email) {
        const isConfirmed = status === 'confirmed';
        const statusColor = isConfirmed ? '#22c55e' : '#ef4444';
        const statusIcon = isConfirmed ? '✅' : '❌';
        const statusText = isConfirmed ? 'Confirmed' : 'Cancelled';

        await sendEmail({
          email: customer.email,
          subject: `${statusIcon} Booking ${statusText} - ${booking.event?.title || 'Your Booking'}`,
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; border-radius: 12px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, ${isConfirmed ? '#22c55e, #16a34a' : '#ef4444, #dc2626'}); padding: 30px; text-align: center;">
                <h1 style="margin: 0; color: #fff; font-size: 24px;">${statusIcon} Booking ${statusText}</h1>
              </div>
              <div style="padding: 30px;">
                <p style="font-size: 16px; color: #c0c0c0;">Hi <strong style="color: #fff;">${customer.name}</strong>,</p>
                <p style="color: #c0c0c0;">Your booking has been <strong style="color: ${statusColor};">${statusText.toLowerCase()}</strong> by the vendor.</p>
                
                <div style="background: rgba(99, 102, 241, 0.1); border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #a0a0a0;">Event</td><td style="padding: 8px 0; color: #fff; font-weight: 500;">${booking.event?.title || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px 0; color: #a0a0a0;">Vendor</td><td style="padding: 8px 0; color: #fff; font-weight: 500;">${req.user.name}</td></tr>
                    <tr><td style="padding: 8px 0; color: #a0a0a0;">Date</td><td style="padding: 8px 0; color: #fff; font-weight: 500;">${new Date(booking.date).toLocaleDateString()}</td></tr>
                    <tr><td style="padding: 8px 0; color: #a0a0a0;">Time</td><td style="padding: 8px 0; color: #fff; font-weight: 500;">${booking.time || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px 0; color: #a0a0a0;">Amount</td><td style="padding: 8px 0; color: #fff; font-weight: 500;">₹${booking.event?.price || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px 0; color: #a0a0a0;">Status</td><td style="padding: 8px 0; color: ${statusColor}; font-weight: 700;">${statusText}</td></tr>
                  </table>
                </div>

                ${isConfirmed 
                  ? '<p style="color: #c0c0c0;">The vendor will be at your location as per the booking details. If you have any questions, feel free to contact the vendor.</p>' 
                  : '<p style="color: #c0c0c0;">Unfortunately the vendor was unable to accept this booking. You can browse other vendors on BookMyVibe.</p>'
                }
                <p style="color: #888; font-size: 13px; margin-top: 30px;">— BookMyVibe Team</p>
              </div>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.error('Failed to send user notification email:', emailErr);
    }

    res.json({ message: `Booking ${status} successfully`, booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
};

module.exports = {
  getVendorEvents,
  getVendorBookings,
  updateBookingStatus
};
