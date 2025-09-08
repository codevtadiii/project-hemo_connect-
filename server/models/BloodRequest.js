import mongoose from 'mongoose';
import { ensureCollection } from '../utils/collectionManager.js';

const donorResponseSchema = new mongoose.Schema({
  donorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  donorName: { type: String, required: true },
  donorPhone: { type: String },
  donorEmail: { type: String },
  responseType: { 
    type: String, 
    enum: ['accept', 'decline', 'maybe'], 
    required: true 
  },
  responseMessage: { type: String, maxlength: 500 },
  availabilityDate: { type: Date },
  location: { type: String },
  timestamp: { type: Date, default: Date.now },
  isConfirmed: { type: Boolean, default: false }
});

const bloodRequestSchema = new mongoose.Schema({
  // Requester information
  requesterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  requesterName: { type: String, required: true },
  requesterPhone: { type: String, required: true },
  requesterEmail: { type: String },
  
  // Blood requirement details
  bloodGroup: { 
    type: String, 
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  units: { 
    type: Number, 
    required: true,
    min: 1,
    max: 10
  },
  urgencyLevel: { 
    type: String, 
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Medical information
  hospital: { type: String, required: true },
  hospitalAddress: { type: String },
  doctorName: { type: String },
  doctorContact: { type: String },
  medicalCondition: { type: String },
  prescriptionRequired: { type: Boolean, default: false },
  
  // Location and timing
  location: { type: String, required: true },
  requiredByDate: { type: Date, required: true },
  preferredTimeSlots: [{
    date: Date,
    startTime: String,
    endTime: String
  }],
  
  // Additional information
  additionalNotes: { 
    type: String, 
    maxlength: 1000 
  },
  specialRequirements: { type: String },
  
  // Status and tracking
  status: { 
    type: String, 
    enum: ['pending', 'matched', 'confirmed', 'in_progress', 'fulfilled', 'cancelled', 'expired'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Donor responses
  responses: [donorResponseSchema],
  matchedDonors: [{
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    confirmedAt: { type: Date },
    donationDate: { type: Date },
    status: { 
      type: String, 
      enum: ['matched', 'confirmed', 'donated', 'cancelled'] 
    }
  }],
  
  // Administrative
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String },
  flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  flaggedAt: { type: Date },
  
  // Analytics
  viewCount: { type: Number, default: 0 },
  responseCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
}, {
  timestamps: true,
  collection: 'bloodrequests'
});

// Indexes for better query performance
bloodRequestSchema.index({ requesterId: 1 });
bloodRequestSchema.index({ bloodGroup: 1 });
bloodRequestSchema.index({ location: 1 });
bloodRequestSchema.index({ status: 1 });
bloodRequestSchema.index({ urgencyLevel: 1 });
bloodRequestSchema.index({ requiredByDate: 1 });
bloodRequestSchema.index({ createdAt: -1 });
bloodRequestSchema.index({ bloodGroup: 1, location: 1, status: 1 });
bloodRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware
bloodRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set expiration date if not set (default 30 days)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  // Update response count
  this.responseCount = this.responses.length;
  
  next();
});

// Static methods for querying
bloodRequestSchema.statics.findActive = function() {
  return this.find({ 
    status: { $in: ['pending', 'matched', 'confirmed'] },
    expiresAt: { $gt: new Date() }
  });
};

bloodRequestSchema.statics.findByBloodGroup = function(bloodGroup) {
  return this.find({ bloodGroup, status: 'pending' });
};

bloodRequestSchema.statics.findByLocation = function(location) {
  return this.find({ 
    location: { $regex: location, $options: 'i' },
    status: 'pending'
  });
};

bloodRequestSchema.statics.findUrgent = function() {
  return this.find({ 
    urgencyLevel: { $in: ['high', 'critical'] },
    status: { $in: ['pending', 'matched'] }
  });
};

bloodRequestSchema.statics.findExpired = function() {
  return this.find({ 
    expiresAt: { $lt: new Date() },
    status: { $in: ['pending', 'matched'] }
  });
};

// Instance methods
bloodRequestSchema.methods.addResponse = function(donorId, responseType, responseMessage = '') {
  const response = {
    donorId,
    responseType,
    responseMessage,
    timestamp: new Date()
  };
  
  this.responses.push(response);
  
  if (responseType === 'accept') {
    this.status = 'matched';
  }
  
  return this.save();
};

bloodRequestSchema.methods.confirmDonor = function(donorId, donationDate) {
  const matchedDonor = this.matchedDonors.find(d => d.donorId.toString() === donorId.toString());
  if (matchedDonor) {
    matchedDonor.status = 'confirmed';
    matchedDonor.confirmedAt = new Date();
    matchedDonor.donationDate = donationDate;
    this.status = 'confirmed';
  }
  return this.save();
};

bloodRequestSchema.methods.markAsFulfilled = function() {
  this.status = 'fulfilled';
  return this.save();
};

bloodRequestSchema.methods.cancel = function(reason = '') {
  this.status = 'cancelled';
  this.additionalNotes = this.additionalNotes + `\nCancelled: ${reason}`;
  return this.save();
};

// Ensure collection exists before creating model
const initBloodRequestModel = async () => {
  await ensureCollection('bloodrequests');
  return mongoose.model('BloodRequest', bloodRequestSchema);
};

// Create model immediately for backward compatibility
const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);

export default BloodRequest;
export { initBloodRequestModel };