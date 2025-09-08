import express from 'express';
import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get admin statistics
router.get('/stats', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeRequests = await BloodRequest.countDocuments({ status: { $in: ['pending', 'matched'] } });
    const pendingReports = await BloodRequest.countDocuments({ isFlagged: true });
    // completedDonations: This should be a separate collection in a real app
    const stats = {
      totalUsers,
      activeRequests,
      completedDonations: 45, // Mock data
      pendingReports,
    };
    res.json(stats);
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Get recent users
router.get('/recent-users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10);
    res.json(recentUsers);
  } catch (error) {
    console.error('Get recent users error:', error);
    res.status(500).json({ message: 'Failed to fetch recent users' });
  }
});

// Get flagged requests
router.get('/flagged-requests', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const flaggedRequests = await BloodRequest.find({ isFlagged: true });
    res.json(flaggedRequests);
  } catch (error) {
    console.error('Get flagged requests error:', error);
    res.status(500).json({ message: 'Failed to fetch flagged requests' });
  }
});

// Approve request
router.post('/requests/:id/approve', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const requestId = req.params.id;
    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      requestId,
      { isFlagged: false, flagReason: null, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json({
      message: 'Request approved successfully',
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ message: 'Failed to approve request' });
  }
});

// Reject request
router.post('/requests/:id/reject', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const requestId = req.params.id;
    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      requestId,
      { status: 'cancelled', flagReason: 'Rejected by admin', updatedAt: new Date() },
      { new: true }
    );
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    // Notify the requester
    const io = req.app.get('io');
    const notificationData = {
      userId: updatedRequest.userId,
      type: 'request_rejected',
      title: 'Request Rejected',
      message: 'Your blood request has been rejected by our moderation team',
      timestamp: new Date(),
    };
    io.to(`user_${updatedRequest.userId}`).emit('notification', notificationData);
    // Save notification to DB
    try {
      const Notification = (await import('../models/Notification.js')).default;
      await Notification.create(notificationData);
    } catch (err) {
      console.error('Failed to save notification:', err);
    }
    res.json({
      message: 'Request rejected successfully',
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ message: 'Failed to reject request' });
  }
});

export default router;