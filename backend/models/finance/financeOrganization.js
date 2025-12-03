// backend/models/Organization.js
import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  organizationType: {
    type: String,
    required: true,
    enum: ['Bank', 'NBFC', 'Credit Union', 'Government Agency', 'Microfinance Institution', 'Peer-to-Peer Lending Platform', 'Fintech Company', 'Other'],
    index: true
  },
  registrationNumber: String,
  establishedYear: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  
  // Contact Information
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  designation: String,
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  website: String,
  
  // Address
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: String,
    country: { type: String, required: true, index: true },
    zipCode: String
  },
  
  // Loan Information
  loanTypes: [String],
  minLoanAmount: Number,
  maxLoanAmount: Number,
  interestRateRange: String,
  
  // Additional Information
  description: String,
  specialPrograms: String,
  eligibilityCriteria: String,
  
  // Status Management
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  
  // Review Information
  reviewedBy: String,
  reviewedAt: Date,
  reviewNotes: String,
  approvedAt: Date,
  rejectedAt: Date,
  
  // Metadata
  ipAddress: String,
  userAgent: String
}, { 
  timestamps: true,
  collection: 'organizations'
});

// Indexes
OrganizationSchema.index({ createdAt: -1 });
OrganizationSchema.index({ status: 1, createdAt: -1 });
OrganizationSchema.index({ 'address.country': 1, organizationType: 1 });

// Methods
OrganizationSchema.methods.approve = function(reviewerName, notes) {
  this.status = 'approved';
  this.reviewedBy = reviewerName;
  this.reviewedAt = new Date();
  this.approvedAt = new Date();
  this.reviewNotes = notes;
  return this.save();
};

OrganizationSchema.methods.reject = function(reviewerName, notes) {
  this.status = 'rejected';
  this.reviewedBy = reviewerName;
  this.reviewedAt = new Date();
  this.rejectedAt = new Date();
  this.reviewNotes = notes;
  return this.save();
};

// Statics
OrganizationSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const pending = await this.countDocuments({ status: 'pending' });
  const approved = await this.countDocuments({ status: 'approved' });
  const rejected = await this.countDocuments({ status: 'rejected' });
  
  const byType = await this.aggregate([
    { $group: { _id: '$organizationType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  const byCountry = await this.aggregate([
    { $group: { _id: '$address.country', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  return { total, pending, approved, rejected, byType, byCountry };
};

export default mongoose.model('financeOrganization', OrganizationSchema);