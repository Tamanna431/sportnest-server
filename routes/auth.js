const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate token & set cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'sportnest_super_secret_jwt_key_2026',
    { expiresIn: '7d' }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photo_url: user.photo_url,
        role: user.role
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, photo_url, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
  }

  // Password validation: min 6 chars, 1 uppercase, 1 lowercase
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters and contain at least one uppercase and one lowercase letter'
    });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      photo_url: photo_url || undefined,
      role: role || 'user'
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please login.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Google login / integration
// @route   POST /api/auth/google
// @access  Public
router.post('/google', async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, message: 'Missing Google ID Token' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { name, email, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create random password for Google-registered users since it's required
      const randomPassword = Math.random().toString(36).slice(-8) + 'A' + 'a';
      user = await User.create({
        name,
        email,
        photo_url: picture,
        password: randomPassword,
        role: 'user'
      });
    } else if (!user.photo_url && picture) {
       user.photo_url = picture;
       await user.save();
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Google Auth Error:', err.message);
    res.status(401).json({ success: false, message: 'Invalid Google credentials' });
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
router.post('/logout', (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get current user profile (using session cookie)
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

module.exports = router;
