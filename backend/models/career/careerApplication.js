import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  
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
      required: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    portfolio: {
      type: String,
      trim: true
    },
    
    // Student/Educational Details
    university: {
      type: String,
      trim: true
    },
    degree: {
      type: String,
      trim: true
    },
    graduationYear: {
      type: String,
      trim: true
    },
    cgpa: {
      type: String,
      trim: true
    },
    skills: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  
  coverLetter: {
    type: String,
    required: true
  },
  
  resume: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  },
  
  status: {
    type: String,
    enum: ['submitted', 'under-review', 'shortlisted', 'interview-scheduled', 'selected', 'rejected'],
    default: 'submitted'
  },
  
  applicationDate: {
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
    scheduledDate: Date,
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    feedback: String,
    result: {
      type: String,
      enum: ['pending', 'passed', 'failed']
    }
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
applicationSchema.index({ jobId: 1, 'applicantInfo.email': 1 }, { unique: true });
applicationSchema.index({ status: 1 });
applicationSchema.index({ applicationDate: -1 });
applicationSchema.index({ 'applicantInfo.university': 1 });

const Application = mongoose.model('Application', applicationSchema);

export default Application;