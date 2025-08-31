import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  
  applicantInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    experience: {
      type: String,
      required: true,
      enum: ['0-1', '1-3', '3-5', '5-8', '8+']
    },
    linkedin: {
      type: String,
      trim: true
    },
    portfolio: {
      type: String,
      trim: true
    }
  },
  resume: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  coverLetter: {
    type: String,
    required: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Rejected', 'Withdrawn'],
    default: 'Submitted'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  lastStatusUpdate: {
    type: Date,
    default: Date.now
  },
  reviewNotes: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  interview: {
    scheduled: {
      type: Boolean,
      default: false
    },
    date: Date,
    time: String,
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    mode: {
      type: String,
      enum: ['In-person', 'Video Call', 'Phone'],
      default: 'Video Call'
    },
    feedback: {
      technical: Number,
      communication: Number,
      cultureFit: Number,
      overall: Number,
      comments: String
    }
  },
  source: {
    type: String,
    enum: ['Website', 'LinkedIn', 'Referral', 'Job Portal', 'Campus', 'Walk-in'],
    default: 'Website'
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ 'applicantInfo.email': 1 });
applicationSchema.index({ applicationDate: -1 });
applicationSchema.index({ status: 1, lastStatusUpdate: -1 });

// Update lastStatusUpdate when status changes
applicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.lastStatusUpdate = new Date();
  }
  next();
});

// Virtual for days since application
applicationSchema.virtual('daysSinceApplication').get(function() {
  return Math.floor((Date.now() - this.applicationDate) / (1000 * 60 * 60 * 24));
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;