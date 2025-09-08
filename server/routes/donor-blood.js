import express from 'express';
import DonorBlood from '../models/DonorBlood.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create or update donor blood profile
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ 
        success: false,
        message: 'Only donors can create blood profiles' 
      });
    }
    
    const donorBloodData = {
      ...req.body,
      donorId: req.user._id,
      donorName: req.user.name,
      donorEmail: req.user.email,
      donorPhone: req.user.phone
    };
    
    // Check if profile already exists
    let donorBlood = await DonorBlood.findOne({ donorId: req.user._id });
    
    if (donorBlood) {
      // Update existing profile
      Object.assign(donorBlood, donorBloodData);
      await donorBlood.save();
    } else {
      // Create new profile
      donorBlood = await DonorBlood.create(donorBloodData);
    }
    
    console.log('Donor blood profile saved:', donorBlood._id);
    
    res.status(201).json({
      success: true,
      message: 'Donor blood profile saved successfully',
      profile: donorBlood
    });
  } catch (error) {
    console.error('Save donor blood profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to save donor blood profile',
      error: error.message 
    });
  }
});

// Get donor's own blood profile
router.get('/my-profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ 
        success: false,
        message: 'Only donors can view blood profiles' 
      });
    }
    
    const profile = await DonorBlood.findOne({ donorId: req.user._id });
    
    if (!profile) {
      return res.status(404).json({ 
        success: false,
        message: 'Blood profile not found. Please create your profile first.' 
      });
    }
    
    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get donor blood profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch blood profile',
      error: error.message 
    });
  }
});

// Get eligible donors for blood group
router.get('/eligible/:bloodGroup', async (req, res) => {
  try {
    const { bloodGroup } = req.params;
    const { location } = req.query;
    
    const eligibleDonors = await DonorBlood.findEligibleDonors(bloodGroup, location);
    
    res.json({
      success: true,
      donors: eligibleDonors,
      count: eligibleDonors.length
    });
  } catch (error) {
    console.error('Get eligible donors error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch eligible donors',
      error: error.message 
    });
  }
});

// Get all available donors
router.get('/available', async (req, res) => {
  try {
    const { bloodGroup, location, page = 1, limit = 10 } = req.query;
    
    const query = {
      'availability.isAvailable': true,
      isEligible: true,
      status: 'active'
    };
    
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (location) {
      query['availability.preferredLocations'] = { $regex: location, $options: 'i' };
    }
    
    const donors = await DonorBlood.find(query)
      .sort({ 'stats.responseRate': -1, 'stats.lastActiveDate': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-medicalHistory -donationHistory');
    
    const total = await DonorBlood.countDocuments(query);
    
    res.json({
      success: true,
      donors,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get available donors error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch available donors',
      error: error.message 
    });
  }
});

// Get emergency donors
router.get('/emergency/:bloodGroup', async (req, res) => {
  try {
    const { bloodGroup } = req.params;
    
    const emergencyDonors = await DonorBlood.findEmergencyDonors(bloodGroup);
    
    res.json({
      success: true,
      donors: emergencyDonors,
      count: emergencyDonors.length
    });
  } catch (error) {
    console.error('Get emergency donors error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch emergency donors',
      error: error.message 
    });
  }
});

// Update donor availability
router.patch('/availability', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ 
        success: false,
        message: 'Only donors can update availability' 
      });
    }
    
    const { isAvailable, reason } = req.body;
    
    const profile = await DonorBlood.findOne({ donorId: req.user._id });
    if (!profile) {
      return res.status(404).json({ 
        success: false,
        message: 'Blood profile not found' 
      });
    }
    
    await profile.updateAvailability(isAvailable, reason);
    
    res.json({
      success: true,
      message: 'Availability updated successfully',
      profile: profile
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update availability',
      error: error.message 
    });
  }
});

// Add donation record
router.post('/donation', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ 
        success: false,
        message: 'Only donors can add donation records' 
      });
    }
    
    const profile = await DonorBlood.findOne({ donorId: req.user._id });
    if (!profile) {
      return res.status(404).json({ 
        success: false,
        message: 'Blood profile not found' 
      });
    }
    
    await profile.addDonation(req.body);
    
    res.json({
      success: true,
      message: 'Donation record added successfully',
      profile: profile
    });
  } catch (error) {
    console.error('Add donation record error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add donation record',
      error: error.message 
    });
  }
});

// Get donation history
router.get('/donation-history', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ 
        success: false,
        message: 'Only donors can view donation history' 
      });
    }
    
    let profile = await DonorBlood.findOne({ donorId: req.user._id })
      .select('donationHistory totalDonations totalUnitsDonated');

    if (!profile) {
      // Auto-create donor profile if missing
      profile = await DonorBlood.create({
        donorId: req.user._id,
        donorName: req.user.name,
        donorEmail: req.user.email,
        donorPhone: req.user.phone,
        bloodGroup: req.user.bloodGroup || 'O+',
        rhFactor: 'positive',
        physicalInfo: { age: 30, weight: 60, height: 170, gender: 'other' },
      });
    }

    res.json({
      success: true,
      donationHistory: profile.donationHistory,
      totalDonations: profile.totalDonations,
      totalUnitsDonated: profile.totalUnitsDonated
    });
  } catch (error) {
    console.error('Get donation history error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch donation history',
      error: error.message 
    });
  }
});

// Update donor statistics
router.patch('/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ 
        success: false,
        message: 'Only donors can update statistics' 
      });
    }
    
    const { requestType } = req.body;
    
    const profile = await DonorBlood.findOne({ donorId: req.user._id });
    if (!profile) {
      return res.status(404).json({ 
        success: false,
        message: 'Blood profile not found' 
      });
    }
    
    await profile.updateStats(requestType);
    
    res.json({
      success: true,
      message: 'Statistics updated successfully',
      stats: profile.stats
    });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update statistics',
      error: error.message 
    });
  }
});

// Suspend donor (admin only)
router.patch('/:id/suspend', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only admins can suspend donors' 
      });
    }
    
    const { reason } = req.body;
    const donorId = req.params.id;
    
    const profile = await DonorBlood.findOne({ donorId });
    if (!profile) {
      return res.status(404).json({ 
        success: false,
        message: 'Donor profile not found' 
      });
    }
    
    await profile.suspend(reason);
    
    res.json({
      success: true,
      message: 'Donor suspended successfully',
      profile: profile
    });
  } catch (error) {
    console.error('Suspend donor error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to suspend donor',
      error: error.message 
    });
  }
});

// Activate donor (admin only)
router.patch('/:id/activate', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only admins can activate donors' 
      });
    }
    
    const donorId = req.params.id;
    
    const profile = await DonorBlood.findOne({ donorId });
    if (!profile) {
      return res.status(404).json({ 
        success: false,
        message: 'Donor profile not found' 
      });
    }
    
    await profile.activate();
    
    res.json({
      success: true,
      message: 'Donor activated successfully',
      profile: profile
    });
  } catch (error) {
    console.error('Activate donor error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to activate donor',
      error: error.message 
    });
  }
});

export default router;
