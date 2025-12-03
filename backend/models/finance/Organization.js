const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  // Organization Details
  organizationName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  organizationType: {
    type: String,
    required: true,
    enum: ['Bank', 'NBFC (Non-Banking Financial Company)', 'Credit Union', 'Government Agency', 'Microfinance Institution', 'Peer-to-Peer Lending Platform', 'Fintech Company', 'Other'],
    index: true
  },
  registrationNumber: {
    type: String,
    required: false,
    trim: true
  },
  establishedYear: {
    type: Number,
    required: false,
    min: 1800,
    max: new Date().getFullYear()
  },
  
  // Contact Information
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: false,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    required: false,
    trim: true,
    match: [/^https?:\/\/.+\..+/, 'Please enter a valid website URL']
  },
  
  // Address
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    state: {
      type: String,
      required: false,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    zipCode: {
      type: String,
      required: false,
      trim: true
    }
  },
  
  // Loan Products
  loanTypes: [{
    type: String,
    enum: ['Personal Loan', 'Business Loan', 'Home Loan', 'Car Loan', 'Education Loan', 'Agricultural Loan', 'Microfinance', 'Startup Funding', 'Equipment Financing', 'Working Capital', 'Other']
  }],
  minLoanAmount: {
    type: Number,
    required: false,
    min: 0
  },
  maxLoanAmount: {
    type: Number,
    required: false,
    min: 0
  },
  interestRateRange: {
    type: String,
    required: false,
    trim: true
  },
  
  // Additional Information
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: 1000
  },
  specialPrograms: {
    type: String,
    required: false,
    trim: true,
    maxlength: 500
  },
  eligibilityCriteria: {
    type: String,
    required: false,
    trim: true,
    maxlength: 500
  },
  
  // Documents
  documents: {
    license: {
      filename: String,
      originalName: String,
      path: String,
      uploadedAt: Date
    },
    certificate: {
      filename: String,
      originalName: String,
      path: String,
      uploadedAt: Date
    }
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  
  // Review Information
  reviewedBy: {
    type: String,
    required: false
  },
  reviewedAt: {
    type: Date,
    required: false
  },
  reviewNotes: {
    type: String,
    required: false,
    trim: true
  },
  
  // Approval Information
  approvedAt: {
    type: Date,
    required: false
  },
  rejectedAt: {
    type: Date,
    required: false
  },
  
  // Additional Metadata
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'organization_submissions'
});

// Indexes for better query performance
organizationSchema.index({ createdAt: -1 });
organizationSchema.index({ status: 1, createdAt: -1 });
organizationSchema.index({ 'address.country': 1, organizationType: 1 });
organizationSchema.index({ organizationName: 'text', description: 'text' });

// Virtual for formatted address
organizationSchema.virtual('formattedAddress').get(function() {
  const addr = this.address;
  return [addr.street, addr.city, addr.state, addr.country, addr.zipCode]
    .filter(Boolean)
    .join(', ');
});

// Static methods for analytics
organizationSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        pending: [
          { $match: { status: 'pending' } },
          { $count: "count" }
        ],
        approved: [
          { $match: { status: 'approved' } },
          { $count: "count" }
        ],
        rejected: [
          { $match: { status: 'rejected' } },
          { $count: "count" }
        ],
        byType: [
          { $group: { _id: "$organizationType", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        byCountry: [
          { $group: { _id: "$address.country", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        recentSubmissions: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $project: {
              organizationName: 1,
              organizationType: 1,
              'address.country': 1,
              status: 1,
              createdAt: 1
            }
          }
        ]
      }
    }
  ]);
};

// Static method to get organizations by status
organizationSchema.statics.getByStatus = function(status, options = {}) {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
  const skip = (page - 1) * limit;
  
  const query = status ? { status } : {};
  const sort = { [sortBy]: sortOrder };
  
  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select('-documents -userAgent -ipAddress')
    .lean();
};

// Instance methods
organizationSchema.methods.approve = function(reviewerName, notes) {
  this.status = 'approved';
  this.reviewedBy = reviewerName;
  this.reviewedAt = new Date();
  this.approvedAt = new Date();
  this.reviewNotes = notes;
  return this.save();
};

organizationSchema.methods.reject = function(reviewerName, notes) {
  this.status = 'rejected';
  this.reviewedBy = reviewerName;
  this.reviewedAt = new Date();
  this.rejectedAt = new Date();
  this.reviewNotes = notes;
  return this.save();
};

organizationSchema.methods.addDocument = function(docType, fileInfo) {
  if (!this.documents) {
    this.documents = {};
  }
  
  this.documents[docType] = {
    filename: fileInfo.filename,
    originalName: fileInfo.originalname,
    path: fileInfo.path,
    uploadedAt: new Date()
  };
  
  return this.save();
};

// Pre-save middleware
organizationSchema.pre('save', function(next) {
  // Ensure loanTypes is an array
  if (this.loanTypes && !Array.isArray(this.loanTypes)) {
    this.loanTypes = [this.loanTypes];
  }
  
  // Validate loan amount range
  if (this.minLoanAmount && this.maxLoanAmount && this.minLoanAmount >= this.maxLoanAmount) {
    const error = new Error('Minimum loan amount must be less than maximum loan amount');
    return next(error);
  }
  
  next();
});

// Post-save middleware for logging
organizationSchema.post('save', function(doc) {
  console.log(`Organization ${doc.organizationName} saved with status: ${doc.status}`);
});

module.exports = mongoose.model('Organization', organizationSchema);