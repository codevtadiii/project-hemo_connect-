
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Update password
router.put('/update-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }
    user.password = await bcrypt.hash(newPassword, 12);
    user.updatedAt = new Date();
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Failed to update password' });
  }
});

// Update profile picture
router.put('/profile-pic', authenticateToken, async (req, res) => {
  try {
    const { profilePic } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic, updatedAt: new Date() },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Profile picture updated', profilePic: user.profilePic });
  } catch (error) {
    console.error('Profile pic update error:', error);
    res.status(500).json({ message: 'Failed to update profile picture' });
  }
});

// Complete profile setup
router.post('/complete-profile', authenticateToken, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      profileComplete: true,
      updatedAt: new Date(),
    };
    let userId = req.user._id;
    if (typeof userId !== 'string') userId = String(userId);
    console.log('Profile setup for userId:', userId);
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) {
      console.error('Profile setup failed: User not found for userId', userId);
      return res.status(404).json({ message: 'User not found', userId });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('Profile setup error:', error);
    res.status(500).json({ message: 'Failed to complete profile setup' });
  }
});

// Save draft profile
router.post('/save-draft', authenticateToken, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };
    let userId = req.user._id;
    if (typeof userId !== 'string') userId = String(userId);
    console.log('Save draft for userId:', userId);
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) {
      console.error('Save draft failed: User not found for userId', userId);
      return res.status(404).json({ message: 'User not found', userId });
    }
    res.json({ message: 'Draft saved successfully' });
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({ message: 'Failed to save draft' });
  }
});

// Toggle availability (for donors)
router.post('/toggle-availability', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only donors can toggle availability' });
    }

    const { isAvailable } = req.body;
    const updateData = {
      isAvailable,
      lastActive: new Date(),
      updatedAt: new Date(),
    };

    let userId = req.user._id;
    if (typeof userId !== 'string') userId = String(userId);
    console.log('Toggle availability for userId:', userId);
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) {
      console.error('Toggle availability failed: User not found for userId', userId);
      return res.status(404).json({ message: 'User not found', userId });
    }
    res.json({ 
      message: 'Availability updated successfully',
      isAvailable: updatedUser.isAvailable 
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ message: 'Failed to update availability' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  let userId = req.user._id;
  if (typeof userId !== 'string') userId = String(userId);
  console.log('Get profile for userId:', userId);
  const user = await User.findById(userId);
  if (!user) {
    console.error('Get profile failed: User not found for userId', userId);
    return res.status(404).json({ message: 'User not found', userId });
  }
  res.json(user);
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    let userId = req.user._id;
    if (typeof userId !== 'string') userId = String(userId);
    console.log('Update profile for userId:', userId);
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) {
      console.error('Update profile failed: User not found for userId', userId);
      return res.status(404).json({ message: 'User not found', userId });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

export default router;