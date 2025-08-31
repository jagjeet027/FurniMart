import mongoose from 'mongoose';

// Candidate Schema
const candidateSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  rollNo: { 
    type: String, 
    required: [true, 'Roll number is required'],
    trim: true,
    maxlength: [50, 'Roll number cannot exceed 50 characters']
  },
  email: { 
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: { 
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  branch: { 
    type: String, 
    required: [true, 'Branch is required'],
    enum: {
      values: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Electrical', 'Biotechnology', 'Other'],
      message: 'Please select a valid branch'
    }
  },
  specialization: { 
    type: String,
    trim: true,
    maxlength: [200, 'Specialization cannot exceed 200 characters']
  },
  year: { 
    type: String,
    enum: {
      values: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated', 'Post Graduate'],
      message: 'Please select a valid year'
    }
  },
  cgpa: { 
    type: Number,
    min: [0, 'CGPA cannot be negative'],
    max: [10, 'CGPA cannot exceed 10']
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each skill cannot exceed 50 characters']
  }],
  projects: [{ 
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Project title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Project description cannot exceed 1000 characters']
    },
    technologies: [{
      type: String,
      trim: true
    }],
    duration: {
      type: String,
      trim: true
    },
    link: {
      type: String,
      trim: true
    }
  }],
  internships: [{
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    position: {
      type: String,
      trim: true,
      maxlength: [100, 'Position cannot exceed 100 characters']
    },
    duration: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    }
  }],
  achievements: [{ 
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Achievement title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Achievement description cannot exceed 1000 characters']
    },
    date: Date
  }],
  addedDate: { 
    type: Date, 
    default: Date.now 
  }
});

// Organization Schema
const organizationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [200, 'Organization name cannot exceed 200 characters']
  },
  type: { 
    type: String, 
    required: [true, 'Organization type is required'],
    enum: {
      values: ['College', 'University', 'Technical Institute', 'Training Center', 'Research Institute'],
      message: 'Please select a valid organization type'
    }
  },
  location: { 
    type: String, 
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  website: { 
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  description: { 
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  establishedYear: { 
    type: Number,
    min: [1800, 'Established year cannot be before 1800'],
    max: [new Date().getFullYear(), 'Established year cannot be in the future']
  },
  accreditation: { 
    type: String,
    trim: true,
    maxlength: [300, 'Accreditation cannot exceed 300 characters']
  },
  logo: { 
    type: String,
    trim: true
  },
  candidates: [candidateSchema],
  registrationDate: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Status must be pending, approved, or rejected'
    },
    default: 'pending' 
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total candidates count
organizationSchema.virtual('candidatesCount').get(function() {
  return this.candidates ? this.candidates.length : 0;
});

// Virtual for organization age
organizationSchema.virtual('organizationAge').get(function() {
  if (!this.establishedYear) return null;
  return new Date().getFullYear() - this.establishedYear;
});

// Index for better query performance
organizationSchema.index({ email: 1 });
organizationSchema.index({ name: 1 });
organizationSchema.index({ type: 1 });
organizationSchema.index({ status: 1 });
organizationSchema.index({ 'candidates.rollNo': 1 });
organizationSchema.index({ 'candidates.branch': 1 });

// Pre-save middleware to validate unique roll numbers within organization
organizationSchema.pre('save', function(next) {
  if (this.candidates && this.candidates.length > 0) {
    const rollNumbers = this.candidates.map(c => c.rollNo.toLowerCase());
    const uniqueRollNumbers = new Set(rollNumbers);
    
    if (rollNumbers.length !== uniqueRollNumbers.size) {
      const error = new Error('Duplicate roll numbers are not allowed within the same organization');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

// Instance method to add a candidate
organizationSchema.methods.addCandidate = function(candidateData) {
  // Check if roll number already exists
  const existingCandidate = this.candidates.find(
    c => c.rollNo.toLowerCase() === candidateData.rollNo.toLowerCase()
  );
  
  if (existingCandidate) {
    throw new Error('A student with this roll number already exists');
  }
  
  this.candidates.push(candidateData);
  return this.save();
};

// Instance method to update a candidate
organizationSchema.methods.updateCandidate = function(candidateId, updateData) {
  const candidate = this.candidates.id(candidateId);
  if (!candidate) {
    throw new Error('Candidate not found');
  }
  
  // Check for duplicate roll number if updating roll number
  if (updateData.rollNo && updateData.rollNo !== candidate.rollNo) {
    const existingCandidate = this.candidates.find(
      c => c._id.toString() !== candidateId && 
           c.rollNo.toLowerCase() === updateData.rollNo.toLowerCase()
    );
    
    if (existingCandidate) {
      throw new Error('A student with this roll number already exists');
    }
  }
  
  Object.assign(candidate, updateData);
  return this.save();
};

// Instance method to remove a candidate
organizationSchema.methods.removeCandidate = function(candidateId) {
  this.candidates.pull(candidateId);
  return this.save();
};

// Static method to find organizations by type
organizationSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true });
};

// Static method to get organizations with candidate count
organizationSchema.statics.getOrganizationsWithStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $addFields: {
        candidatesCount: { $size: '$candidates' },
        branchesCount: { 
          $size: { 
            $setUnion: { 
              $map: { 
                input: '$candidates', 
                as: 'candidate', 
                in: '$$candidate.branch' 
              } 
            } 
          } 
        }
      }
    },
    {
      $project: {
        name: 1,
        type: 1,
        location: 1,
        email: 1,
        phone: 1,
        website: 1,
        establishedYear: 1,
        status: 1,
        candidatesCount: 1,
        branchesCount: 1,
        registrationDate: 1
      }
    }
  ]);
};

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;