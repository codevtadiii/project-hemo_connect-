import mongoose from 'mongoose';
import { ensureCollection } from '../utils/collectionManager.js';

const contactMessageSchema = new mongoose.Schema({
  // Basic contact information
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  email: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  
  // Message details
  subject: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  message: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  // Message categorization
  category: {
    type: String,
    enum: ['general', 'support', 'feedback', 'complaint', 'suggestion', 'partnership', 'media'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['new', 'in_progress', 'responded', 'resolved', 'closed'],
    default: 'new'
  },
  
  // Response tracking
  response: {
    message: String,
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    respondedAt: Date
  },
  
  // Additional metadata
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'api', 'admin_panel'],
    default: 'website'
  },
  userAgent: String,
  ipAddress: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'contactmessages'
});

// Indexes for better query performance
contactMessageSchema.index({ email: 1 });
contactMessageSchema.index({ status: 1 });
contactMessageSchema.index({ category: 1 });
contactMessageSchema.index({ priority: 1 });
contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ status: 1, priority: 1 });

// Pre-save middleware
contactMessageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods for querying
contactMessageSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

contactMessageSchema.statics.findByCategory = function(category) {
  return this.find({ category });
};

contactMessageSchema.statics.findByPriority = function(priority) {
  return this.find({ priority });
};

contactMessageSchema.statics.findUnresolved = function() {
  return this.find({ status: { $in: ['new', 'in_progress'] } });
};

contactMessageSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

// Instance methods
contactMessageSchema.methods.markAsResponded = function(responseMessage, respondedBy) {
  this.status = 'responded';
  this.response = {
    message: responseMessage,
    respondedBy: respondedBy,
    respondedAt: new Date()
  };
  return this.save();
};

contactMessageSchema.methods.markAsResolved = function() {
  this.status = 'resolved';
  return this.save();
};

// Ensure collection exists before creating model
const initContactMessageModel = async () => {
  await ensureCollection('contactmessages');
  return mongoose.model('ContactMessage', contactMessageSchema);
};

// Create model immediately for backward compatibility
const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;
export { initContactMessageModel };
