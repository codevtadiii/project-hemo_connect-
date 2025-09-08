import express from 'express';
import BloodRequest from '../models/BloodRequest.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create blood request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      requesterId: req.user._id,
      requesterName: req.user.name,
      requesterEmail: req.user.email,
      requesterPhone: req.user.phone || req.body.requesterPhone
    };
    
    const newRequest = await BloodRequest.create(requestData);
    console.log('Blood request created:', newRequest._id);
    
    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      request: newRequest
    });
  } catch (error) {
    console.error('Create blood request error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create blood request',
      error: error.message 
    });
  }
});

// Get active blood requests (for ticker)
router.get('/active', async (req, res) => {
  try {
    const activeRequests = await BloodRequest.findActive()
      .sort({ urgencyLevel: -1, createdAt: -1 })
      .limit(10)
      .populate('requesterId', 'name location');
    
    res.json({
      success: true,
      requests: activeRequests
    });
  } catch (error) {
    console.error('Get active requests error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch active requests',
      error: error.message 
    });
  }
});

// Get nearby requests for donor
router.get('/nearby', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ 
        success: false,
        message: 'Only donors can view nearby requests' 
      });
    }
    
    const { location, bloodGroup } = req.query;
    const searchLocation = location || req.user.location;
    const searchBloodGroup = bloodGroup || req.user.bloodGroup;
    
    const nearbyRequests = await BloodRequest.find({
      status: 'pending',
      location: { $regex: searchLocation, $options: 'i' },
      bloodGroup: searchBloodGroup,
      expiresAt: { $gt: new Date() }
    }).populate('requesterId', 'name phone');
    
    res.json({
      success: true,
      requests: nearbyRequests
    });
  } catch (error) {
    console.error('Get nearby requests error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch nearby requests',
      error: error.message 
    });
  }
});

// Get user's own requests
router.get('/my-requests', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { requesterId: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    const userRequests = await BloodRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('responses.donorId', 'name phone email');
    
    res.json({
      success: true,
      requests: userRequests
    });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch your requests',
      error: error.message 
    });
  }
});

// Get user's request history
router.get('/my-history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const userHistory = await BloodRequest.find({ requesterId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('responses.donorId', 'name phone email')
      .populate('matchedDonors.donorId', 'name phone email');
    
    const total = await BloodRequest.countDocuments({ requesterId: req.user._id });
    
    res.json({
      success: true,
      requests: userHistory,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get request history error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch request history',
      error: error.message 
    });
  }
});

// Get blood request by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requesterId', 'name email phone')
      .populate('responses.donorId', 'name phone email')
      .populate('matchedDonors.donorId', 'name phone email');
    
    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Blood request not found' 
      });
    }
    
    // Check if user can view this request
    if (request.requesterId._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        req.user.role !== 'donor') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this request' 
      });
    }
    
    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Get blood request error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch blood request',
      error: error.message 
    });
  }
});

// Respond to blood request (donor)
router.post('/:id/respond', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ 
        success: false,
        message: 'Only donors can respond to requests' 
      });
    }
    
    const { responseType, responseMessage, availabilityDate, location } = req.body;
    const requestId = req.params.id;
    
    const request = await BloodRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Blood request not found' 
      });
    }
    
    // Check if donor already responded
    const existingResponse = request.responses.find(
      r => r.donorId.toString() === req.user._id.toString()
    );
    
    if (existingResponse) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already responded to this request' 
      });
    }
    
    // Add response
    await request.addResponse(req.user._id, responseType, responseMessage);
    
    // Update donor info in response
    const response = request.responses[request.responses.length - 1];
    response.donorName = req.user.name;
    response.donorPhone = req.user.phone;
    response.donorEmail = req.user.email;
    response.availabilityDate = availabilityDate;
    response.location = location;
    
    await request.save();
    
    res.json({
      success: true,
      message: `Response recorded: ${responseType}`,
      request: request
    });
  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to respond to request',
      error: error.message 
    });
  }
});

// Confirm donor for blood request
router.post('/:id/confirm-donor', authenticateToken, async (req, res) => {
  try {
    const { donorId, donationDate } = req.body;
    const requestId = req.params.id;
    
    const request = await BloodRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Blood request not found' 
      });
    }
    
    // Check if user can confirm donors for this request
    if (request.requesterId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to confirm donors for this request' 
      });
    }
    
    await request.confirmDonor(donorId, donationDate);
    
    res.json({
      success: true,
      message: 'Donor confirmed successfully',
      request: request
    });
  } catch (error) {
    console.error('Confirm donor error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to confirm donor',
      error: error.message 
    });
  }
});

// Cancel blood request
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const requestId = req.params.id;
    
    const request = await BloodRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Blood request not found' 
      });
    }
    
    if (request.requesterId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to cancel this request' 
      });
    }
    
    await request.cancel(reason);
    
    res.json({
      success: true,
      message: 'Request cancelled successfully',
      request: request
    });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to cancel request',
      error: error.message 
    });
  }
});

// Mark request as fulfilled
router.post('/:id/fulfill', authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    
    const request = await BloodRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Blood request not found' 
      });
    }
    
    if (request.requesterId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to fulfill this request' 
      });
    }
    
    await request.markAsFulfilled();
    
    res.json({
      success: true,
      message: 'Request marked as fulfilled',
      request: request
    });
  } catch (error) {
    console.error('Fulfill request error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fulfill request',
      error: error.message 
    });
  }
});

export default router;
