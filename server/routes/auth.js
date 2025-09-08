import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// In-memory OTP store (for demo only)
const otpStore = {};

// Register
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, bloodGroup, location, role } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    // Create user
    const userData = {
      name,
      email,
      password: hashedPassword,
      bloodGroup,
      location,
      role: role || 'donor',
    };
    const user = await User.create(userData);
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.status(201).json({
      message: 'User created successfully',
      token,
      user,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    // Generate JWT token
    const expiresIn = rememberMe ? '7d' : '24h';
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn }
    );
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    res.json({
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to login' });
  }
});

// Verify token
router.get('/verify', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // In a real app, send password reset email
    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process request' });
  }
});

// Send OTP for password reset
router.post('/send-otp', async (req, res) => {
  try {
    const { method, value } = req.body; // method: 'email' or 'phone', value: email or phone
    let user;
    if (method === 'email') {
      user = await User.findOne({ email: value });
    } else if (method === 'phone') {
      user = await User.findOne({ phone: value });
    } else {
      return res.status(400).json({ message: 'Invalid method' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[value] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 min expiry
    // In a real app, send OTP via email/SMS
    console.log(`OTP for ${value}: ${otp}`);
    res.json({ message: 'OTP sent', otp }); // For demo, return OTP in response
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Reset password using OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { method, value, otp, newPassword } = req.body;
    let user;
    if (method === 'email') {
      user = await User.findOne({ email: value });
    } else if (method === 'phone') {
      user = await User.findOne({ phone: value });
    } else {
      return res.status(400).json({ message: 'Invalid method' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const stored = otpStore[value];
    if (!stored || stored.otp !== otp || stored.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    delete otpStore[value];
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

export default router;