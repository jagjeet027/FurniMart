import mongoose from 'mongoose';

// Simple Individual User Schema for registration
const individualUserSchema = new mongoose.Schema({
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      city: {
        type: String,
        trim: true
      },
      state: {
        type: String,
        trim: true
      }
    }
  },
  professionalInfo: {
    experienceLevel: {
      type: String,
      required: true,
      enum: ['Entry Level (0-1 years)',
    'Junior (1-3 years)',
    'Mid Level (3-5 years)',
    'Senior (5-8 years)',
    'Lead (8+ years)',
    'Executive (10+ years)']
    },
    skills: [{
      type: String,
      trim: true
    }],
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
    portfolio: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    }
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for full name
individualUserSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Index for email
individualUserSchema.index({ 'personalInfo.email': 1 });

const IndividualUser = mongoose.model('IndividualUser', individualUserSchema);

export default IndividualUser;