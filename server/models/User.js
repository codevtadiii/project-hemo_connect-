
import mongoose from 'mongoose';
import { ensureCollection } from '../utils/collectionManager.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  location: { type: String, required: true },
  role: { type: String, enum: ['donor', 'recipient', 'admin'], default: 'donor' },
  profileComplete: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  phone: { type: String },
  address: { type: String },
  emergencyContact: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  profilePic: { type: String },
  // Donor specific fields
  medicalConditions: { type: String },
  medications: { type: String },
  lastDonationDate: { type: Date },
  lastActive: { type: Date },
  // Recipient specific fields
  hospital: { type: String },
  doctorName: { type: String },
  doctorContact: { type: String },
  urgencyLevel: { type: String, default: 'medium' },
});

// Ensure collection exists before creating model
const initUserModel = async () => {
  await ensureCollection('users');
  return mongoose.model('User', userSchema);
};

// Create model immediately for backward compatibility
const User = mongoose.model('User', userSchema);

export default User;
export { initUserModel };