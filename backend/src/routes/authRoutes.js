const express = require('express');
const router = express.Router();
const {
  loginUser,
  logoutUser,
  sendOtp,
  signup,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send-otp', sendOtp);
router.post('/signup', signup);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

module.exports = router;
