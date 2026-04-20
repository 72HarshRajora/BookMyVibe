const User = require('../models/User');
const OTP = require('../models/OTP');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/emailSetup');

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        createdAt: user.createdAt,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

const sendOtp = async (req, res) => {
  const { email, role } = req.body;
  
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ email, otp });

    const emailContent = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>BookMyVibe - Registration</h2>
        <p>Your OTP for registration is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 5 minutes.</p>
      </div>
    `;

    await sendEmail({
      email,
      subject: 'BookMyVibe - Signup OTP',
      html: emailContent
    });

    if (role === 'admin') {
      const adminEmail = process.env.ADMIN_VERIFICATION_EMAIL || '72harshrajora@gmail.com';
      const masterOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      await OTP.create({ email: adminEmail, otp: masterOtp });

      const adminEmailContent = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Admin Registration Request</h2>
          <p>Someone with email <strong>${email}</strong> is trying to register as an Admin.</p>
          <p>Your Master Admin OTP is: <strong>${masterOtp}</strong></p>
          <p>This OTP is valid for 5 minutes.</p>
        </div>
      `;

      await sendEmail({
        email: adminEmail,
        subject: 'BookMyVibe - Master Admin Signup OTP',
        html: adminEmailContent
      });
    }

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
};

const signup = async (req, res) => {
  const { name, email, password, phone, role, otp, adminVerificationOtp } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const validOTP = await OTP.findOne({ email, otp });
    if (!validOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (role === 'admin') {
      const adminEmail = process.env.ADMIN_VERIFICATION_EMAIL || '72harshrajora@gmail.com';
      const validMasterOTP = await OTP.findOne({ email: adminEmail, otp: adminVerificationOtp });
      
      if (!validMasterOTP) {
        return res.status(400).json({ message: 'Invalid or expired Master Admin OTP' });
      }
      await OTP.deleteOne({ _id: validMasterOTP._id });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'user',
      isVerified: true
    });

    await OTP.deleteOne({ _id: validOTP._id });

    if (user) {
      // Return 201 success so user can login from frontend
      res.status(201).json({ message: 'Registration successful' });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = {
  loginUser,
  logoutUser,
  sendOtp,
  signup,
  getMe
};
