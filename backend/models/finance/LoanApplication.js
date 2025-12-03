const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
  // Loan Information
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
    required: true,
    enum: ['bank', 'nbfc', 'government', 'fintech', 'other'],
    index: true
  },
  applicationUrl: {
    type: String,
    required: true
  },
  
  // User Information
  userIp: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  
  // Session and tracking
  sessionId: {
    type: String,
    required: false,
    index: true
  },
  referrer: {
    type: String,
    required: false
  },
  
  // Additional metadata
  loanAmount: {
    requested: {
      type: Number,
      required: false
    },
    min: {
      type: Number,
      required: false
    },
    max: {
      type: Number,
      required: false
    }
  },
  
  interestRate: {
    type: String,
    required: false
  },
  
  // Application status tracking
  status: {
    type: String,
    enum: ['clicked', 'redirected', 'completed', 'abandoned'],
    default: 'clicked',
    index: true
  },
  
  // Timestamps
  clickedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  redirectedAt: {
    type: Date,
    required: false
  },
  completedAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'loan_applications'
});

// Indexes for better query performance
loanApplicationSchema.index({ createdAt: -1 });
loanApplicationSchema.index({ loanId: 1, createdAt: -1 });
loanApplicationSchema.index({ country: 1, category: 1 });
loanApplicationSchema.index({ lenderType: 1, status: 1 });

// Static methods for analytics
loanApplicationSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        byCountry: [
          { $group: { _id: "$country", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        byCategory: [
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        byLenderType: [
          { $group: { _id: "$lenderType", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        byStatus: [
          { $group: { _id: "$status", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        recent: [
          {
            $match: {
              createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: -1 } }
        ]
      }
    }
  ]);
};

loanApplicationSchema.statics.getPopularLoans = function(limit = 10) {
  return this.aggregate([
    {
      $group: {
        _id: {
          loanId: "$loanId",
          loanName: "$loanName",
          lender: "$lender",
          country: "$country",
          category: "$category"
        },
        applicationCount: { $sum: 1 },
        lastApplied: { $max: "$createdAt" }
      }
    },
    { $sort: { applicationCount: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        loanId: "$_id.loanId",
        loanName: "$_id.loanName",
        lender: "$_id.lender",
        country: "$_id.country",
        category: "$_id.category",
        applicationCount: 1,
        lastApplied: 1
      }
    }
  ]);
};

loanApplicationSchema.statics.getTrends = function(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          hour: { $hour: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.date": 1, "_id.hour": 1 } }
  ]);
};

// Instance methods
loanApplicationSchema.methods.markAsRedirected = function() {
  this.status = 'redirected';
  this.redirectedAt = new Date();
  return this.save();
};

loanApplicationSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

loanApplicationSchema.methods.markAsAbandoned = function() {
  this.status = 'abandoned';
  return this.save();
};

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);