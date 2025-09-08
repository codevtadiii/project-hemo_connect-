import express from 'express';
import ContactMessage from '../models/ContactMessage.js';

const router = express.Router();

// Handle contact form submission
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message, category, priority } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        message: 'Name, email, subject, and message are required' 
      });
    }
    
    // Create contact message
    const contactMessage = new ContactMessage({
      name,
      email,
      phone,
      subject,
      message,
      category: category || 'general',
      priority: priority || 'medium',
      source: 'website',
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress
    });
    
    const savedMessage = await contactMessage.save();
    console.log('Contact message saved:', savedMessage._id);
    
    res.status(201).json({ 
      success: true,
      message: 'Thank you for your message. We will get back to you soon!',
      id: savedMessage._id,
      category: savedMessage.category,
      priority: savedMessage.priority
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send message',
      error: error.message 
    });
  }
});

// Get all contact messages (admin only)
router.get('/', async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    
    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('response.respondedBy', 'name email');
    
    const total = await ContactMessage.countDocuments(query);
    
    res.json({
      success: true,
      messages,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch contact messages',
      error: error.message 
    });
  }
});

// Get contact message by ID
router.get('/:id', async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id)
      .populate('response.respondedBy', 'name email');
    
    if (!message) {
      return res.status(404).json({ 
        success: false,
        message: 'Contact message not found' 
      });
    }
    
    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Get contact message error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch contact message',
      error: error.message 
    });
  }
});

// Update contact message status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, responseMessage } = req.body;
    
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ 
        success: false,
        message: 'Contact message not found' 
      });
    }
    
    if (status === 'responded' && responseMessage) {
      await message.markAsResponded(responseMessage, req.user?._id);
    } else if (status === 'resolved') {
      await message.markAsResolved();
    } else {
      message.status = status;
      await message.save();
    }
    
    res.json({
      success: true,
      message: 'Contact message updated successfully',
      updatedMessage: message
    });
  } catch (error) {
    console.error('Update contact message error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update contact message',
      error: error.message 
    });
  }
});

export default router;