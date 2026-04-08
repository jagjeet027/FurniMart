import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  adminId: {
    type: String,
    required: true,
    unique: true,
    default: "ADmin820"
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  secretCode: {
    type: String,
    required: true
  },
  isRegistered: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to hash secret code
adminSchema.pre('save', async function(next) {
  if (!this.isModified('secretCode')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.secretCode = await bcrypt.hash(this.secretCode, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to compare secret code
adminSchema.methods.compareSecretCode = async function(candidateSecretCode) {
  return await bcrypt.compare(candidateSecretCode, this.secretCode);
};

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;