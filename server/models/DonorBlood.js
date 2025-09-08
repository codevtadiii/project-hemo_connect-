import mongoose from 'mongoose';
import { ensureCollection } from '../utils/collectionManager.js';

const donationRecordSchema = new mongoose.Schema({
  donationId: { type: String, required: true, unique: true },
  donationDate: { type: Date, required: true },
  bloodBank: { type: String, required: true },
  bloodBankAddress: { type: String },
  unitsDonated: { type: Number, required: true, min: 1, max: 2 },
  bloodType: { 
    type: String, 
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  hemoglobinLevel: { type: Number },
  bloodPressure: { type: String },
  weight: { type: Number },
  temperature: { type: Number },
  medicalOfficer: { type: String },
  certificateNumber: { type: String },
  nextEligibleDate: { type: Date },
  status: {
    type: String,
    enum: ['completed', 'rejected', 'deferred'],
    default: 'completed'
  },
  rejectionReason: { type: String },
  notes: { type: String }
});

const donorBloodSchema = new mongoose.Schema({
  // Donor information
  donorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  donorName: { type: String, required: true },
  donorEmail: { type: String, required: true },
  donorPhone: { type: String, required: true },
  
  // Blood information
  bloodGroup: { 
    type: String, 
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  rhFactor: { 
    type: String, 
    enum: ['positive', 'negative'],
    required: true
  },
  
  // Donation eligibility
  isEligible: { type: Boolean, default: true },
  eligibilityReason: { type: String },
  lastDonationDate: { type: Date },
  nextEligibleDate: { type: Date },
  totalDonations: { type: Number, default: 0 },
  totalUnitsDonated: { type: Number, default: 0 },
  
  // Medical information
  medicalHistory: {
    hasDiabetes: { type: Boolean, default: false },
    hasHypertension: { type: Boolean, default: false },
    hasHeartDisease: { type: Boolean, default: false },
    hasHepatitis: { type: Boolean, default: false },
    hasHIV: { type: Boolean, default: false },
    hasMalaria: { type: Boolean, default: false },
    hasTuberculosis: { type: Boolean, default: false },
    hasCancer: { type: Boolean, default: false },
    hasEpilepsy: { type: Boolean, default: false },
    hasBleedingDisorder: { type: Boolean, default: false },
    isPregnant: { type: Boolean, default: false },
    isBreastfeeding: { type: Boolean, default: false },
    recentSurgery: { type: Boolean, default: false },
    recentTattoo: { type: Boolean, default: false },
    recentTravel: { type: Boolean, default: false },
    medications: [{ 
      name: String, 
      dosage: String, 
      startDate: Date,
      endDate: Date
    }],
    allergies: [String],
    otherConditions: { type: String }
  },
  
  // Physical information
  physicalInfo: {
    age: { type: Number, min: 18, max: 65 },
    weight: { type: Number, min: 45, max: 200 },
    height: { type: Number, min: 140, max: 220 },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'other'],
      required: true
    }
  },
  
  // Availability and preferences
  availability: {
    isAvailable: { type: Boolean, default: true },
    preferredLocations: [String],
    preferredTimeSlots: [{
      day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
      startTime: String,
      endTime: String
    }],
    maxDistance: { type: Number, default: 50 }, // in kilometers
    emergencyOnly: { type: Boolean, default: false }
  },
  
  // Donation records
  donationHistory: [donationRecordSchema],
  
  // Verification and certification
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  certificationNumber: { type: String },
  certificationExpiry: { type: Date },
  
  // Statistics
  stats: {
    totalRequests: { type: Number, default: 0 },
    acceptedRequests: { type: Number, default: 0 },
    declinedRequests: { type: Number, default: 0 },
    responseRate: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 }, // in minutes
    lastActiveDate: { type: Date, default: Date.now }
  },
  
  // Status and flags
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'banned'],
    default: 'active'
  },
  isFlagged: { type: Boolean, default: false },
  flagReason: { type: String },
  flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  flaggedAt: { type: Date },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'donorblood'
});

// Indexes for better query performance
// Note: donorId index is automatically created due to unique: true
donorBloodSchema.index({ bloodGroup: 1 });
donorBloodSchema.index({ isEligible: 1 });
donorBloodSchema.index({ 'availability.isAvailable': 1 });
donorBloodSchema.index({ nextEligibleDate: 1 });
donorBloodSchema.index({ status: 1 });
donorBloodSchema.index({ 'availability.preferredLocations': 1 });
donorBloodSchema.index({ bloodGroup: 1, 'availability.isAvailable': 1, isEligible: 1 });

// Pre-save middleware
donorBloodSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate next eligible date (56 days from last donation)
  if (this.lastDonationDate) {
    const nextDate = new Date(this.lastDonationDate);
    nextDate.setDate(nextDate.getDate() + 56);
    this.nextEligibleDate = nextDate;
    
    // Check if eligible based on last donation
    this.isEligible = new Date() >= nextDate;
  }
  
  // Update total donations count
  this.totalDonations = this.donationHistory.length;
  this.totalUnitsDonated = this.donationHistory.reduce((total, donation) => {
    return total + (donation.status === 'completed' ? donation.unitsDonated : 0);
  }, 0);
  
  // Calculate response rate
  if (this.stats.totalRequests > 0) {
    this.stats.responseRate = (this.stats.acceptedRequests / this.stats.totalRequests) * 100;
  }
  
  next();
});

// Static methods for querying
donorBloodSchema.statics.findEligibleDonors = function(bloodGroup, location = null) {
  const query = {
    bloodGroup,
    isEligible: true,
    'availability.isAvailable': true,
    status: 'active',
    $or: [
      { nextEligibleDate: { $exists: false } },
      { nextEligibleDate: { $lte: new Date() } }
    ]
  };
  
  if (location) {
    query['availability.preferredLocations'] = { $regex: location, $options: 'i' };
  }
  
  return this.find(query);
};

donorBloodSchema.statics.findByBloodGroup = function(bloodGroup) {
  return this.find({ bloodGroup, status: 'active' });
};

donorBloodSchema.statics.findAvailableDonors = function() {
  return this.find({
    'availability.isAvailable': true,
    isEligible: true,
    status: 'active'
  });
};

donorBloodSchema.statics.findEmergencyDonors = function(bloodGroup) {
  return this.find({
    bloodGroup,
    'availability.emergencyOnly': true,
    'availability.isAvailable': true,
    isEligible: true,
    status: 'active'
  });
};

// Instance methods
donorBloodSchema.methods.addDonation = function(donationData) {
  const donation = {
    donationId: `DON${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    donationDate: new Date(),
    ...donationData
  };
  
  this.donationHistory.push(donation);
  this.lastDonationDate = donation.donationDate;
  this.totalDonations += 1;
  
  if (donation.status === 'completed') {
    this.totalUnitsDonated += donation.unitsDonated;
  }
  
  return this.save();
};

donorBloodSchema.methods.updateAvailability = function(isAvailable, reason = '') {
  this.availability.isAvailable = isAvailable;
  if (reason) {
    this.availability.notes = reason;
  }
  return this.save();
};

donorBloodSchema.methods.updateStats = function(requestType) {
  this.stats.totalRequests += 1;
  this.stats.lastActiveDate = new Date();
  
  if (requestType === 'accepted') {
    this.stats.acceptedRequests += 1;
  } else if (requestType === 'declined') {
    this.stats.declinedRequests += 1;
  }
  
  return this.save();
};

donorBloodSchema.methods.suspend = function(reason) {
  this.status = 'suspended';
  this.flagReason = reason;
  this.flaggedAt = new Date();
  return this.save();
};

donorBloodSchema.methods.activate = function() {
  this.status = 'active';
  this.isFlagged = false;
  this.flagReason = '';
  return this.save();
};

// Ensure collection exists before creating model
const initDonorBloodModel = async () => {
  await ensureCollection('donorblood');
  return mongoose.model('DonorBlood', donorBloodSchema);
};

// Create model immediately for backward compatibility
const DonorBlood = mongoose.model('DonorBlood', donorBloodSchema);

export default DonorBlood;
export { initDonorBloodModel };
