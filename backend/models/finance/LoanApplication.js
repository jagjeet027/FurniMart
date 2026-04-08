// backend/models/LoanApplication.js
import mongoose from 'mongoose';

const LoanApplicationSchema = new mongoose.Schema({
  loanId: {
    type: String,
    required: true,
    index: true
  },
  loanName: {
    type: String,
    required: true,
    trim: true
  },
  lender: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  lenderType: {
    type: String,
    enum: ['bank', 'nbfc', 'government', 'fintech', 'other'],
    index: true
  },
  applicationUrl: {
    type: String,
    required: true
  },
  
  // User tracking
  sessionId: {
    type: String,
    index: true
  },
  userIp: String,
  userAgent: String,
  referrer: String,
  
  // Timestamps
  clickedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Analytics
  status: {
    type: String,
    enum: ['clicked', 'redirected', 'completed', 'abandoned'],
    default: 'clicked',
    index: true
  }
}, { 
  timestamps: true,
  collection: 'loan_applications'
});

// Compound indexes for analytics queries
LoanApplicationSchema.index({ createdAt: -1 });
LoanApplicationSchema.index({ loanId: 1, createdAt: -1 });
LoanApplicationSchema.index({ country: 1, category: 1, createdAt: -1 });
LoanApplicationSchema.index({ lenderType: 1, status: 1 });

// Static methods for analytics
LoanApplicationSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  
  const byCountry = await this.aggregate([
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  const byCategory = await this.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  const byLenderType = await this.aggregate([
    { $group: { _id: '$lenderType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  return {
    total,
    byCountry,
    byCategory,
    byLenderType
  };
};

LoanApplicationSchema.statics.getPopularLoans = async function(limit = 10) {
  return this.aggregate([
    {
      $group: {
        _id: {
          loanId: '$loanId',
          loanName: '$loanName',
          lender: '$lender',
          country: '$country',
          category: '$category'
        },
        applicationCount: { $sum: 1 },
        lastApplied: { $max: '$createdAt' }
      }
    },
    { $sort: { applicationCount: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        loan_id: '$_id.loanId',
        loan_name: '$_id.loanName',
        lender: '$_id.lender',
        country: '$_id.country',
        category: '$_id.category',
        application_count: '$applicationCount',
        lastApplied: '$lastApplied'
      }
    }
  ]);
};

export default mongoose.model('LoanApplication', LoanApplicationSchema);