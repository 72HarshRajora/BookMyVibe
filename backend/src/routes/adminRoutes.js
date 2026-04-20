const express = require('express');
const router = express.Router();
const { getAdminDashboard, deleteUser, getUserDetails } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// Add a specific admin middleware if you want to be extra secure
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// GET /api/admin/dashboard
router.get('/dashboard', protect, adminOnly, getAdminDashboard);

// GET /api/admin/users/:id
router.get('/users/:id', protect, adminOnly, getUserDetails);

// DELETE /api/admin/users/:id
router.delete('/users/:id', protect, adminOnly, deleteUser);

module.exports = router;
