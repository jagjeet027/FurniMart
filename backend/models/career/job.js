import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Technology', 'Sales', 'Quality Assurance', 'Analytics', 'Customer Relations', 'Design', 'Marketing', 'Finance', 'Operations']
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship']
  },
  salary: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    enum: ['High', 'Urgent', 'Hot', 'New', 'Featured'],
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  requirements: [{
    type: String,
    required: true
  }],
  responsibilities: [{
    type: String
  }],
  benefits: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  applicationDeadline: {
    type: Date
  },
  tags: [{
    type: String
  }],
  remoteOptions: {
    type: String,
    enum: ['No', 'Hybrid', 'Full Remote'],
    default: 'No'
  }
}, {
  timestamps: true
});

// Index for better search performance
jobSchema.index({ title: 'text', department: 'text', location: 'text' });
jobSchema.index({ department: 1, isActive: 1 });
// jobSchema.index({ postedDate: -1 });

// Virtual for application count
jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'jobId',
  count: true
});

// Update lastUpdated on save
jobSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const Job = mongoose.model('Job', jobSchema);

export default Job;