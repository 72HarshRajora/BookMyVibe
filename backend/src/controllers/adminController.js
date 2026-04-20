const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    let totalBookings = 0;
    
    try {
      if (Booking && typeof Booking.countDocuments === 'function') {
        totalBookings = await Booking.countDocuments({});
      }
    } catch (e) {
      console.log('Booking model not fully setup yet');
    }

    // Get latest users/vendors, sorted by newest
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      stats: {
        users: totalUsers,
        vendors: totalVendors,
        bookings: totalBookings
      },
      users
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ message: 'Failed to fetch admin data' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting other admins or yourself
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    // Optional: Delete their events or bookings if they are a vendor or user
    if (user.role === 'vendor') {
      await Event.deleteMany({ vendor: user._id });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// @desc    Get detailed user profile (Admin)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let events = [];
    let bookings = [];

    if (user.role === 'vendor') {
      events = await Event.find({ vendor: user._id });
      const eventIds = events.map(e => e._id);
      
      try {
        if (Booking && typeof Booking.find === 'function') {
          bookings = await Booking.find({ event: { $in: eventIds } })
            .populate('user', 'name email phone')
            .populate('event', 'title price date');
        }
      } catch (e) {
        console.log("Booking error:", e);
      }
    } else if (user.role === 'user') {
      try {
        if (Booking && typeof Booking.find === 'function') {
          bookings = await Booking.find({ user: user._id })
            .populate('event', 'title price imageUrl location');
        }
      } catch (e) {
        console.log("Booking error:", e);
      }
    }

    res.json({
      user,
      events,
      bookings
    });

  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
};

module.exports = {
  getAdminDashboard,
  deleteUser,
  getUserDetails
};
