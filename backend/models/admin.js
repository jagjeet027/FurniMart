import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AdminSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'manufacturer', 'scholar'],
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Additional fields for enhanced admin management
  department: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  importBatch: {
    type: String,
    default: null // To track which import batch this Admin belongs to
  }
}, {
  timestamps: true
});

// Indexes for better performance
AdminSchema.index({ role: 1, isActive: 1 });
AdminSchema.index({ createdAt: -1 });

// Hash password before saving
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
AdminSchema.methods.toJSON = function() {
  const Admin = this.toObject();
  delete Admin.password;
  return Admin;
};

// Static method to validate Admin data before import
AdminSchema.statics.validateImportData = function(AdminData) {
  const errors = [];
  
  if (!AdminData.id || typeof AdminData.id !== 'string') {
    errors.push('ID is required and must be a string');
  }
  
  if (!AdminData.email || typeof AdminData.email !== 'string') {
    errors.push('Email is required and must be a string');
  } else if (!/\S+@\S+\.\S+/.test(AdminData.email)) {
    errors.push('Email format is invalid');
  }
  
  if (!AdminData.password || typeof AdminData.password !== 'string') {
    errors.push('Password is required and must be a string');
  }
  
  if (!AdminData.role || !['admin', 'manufacturer', 'scholar'].includes(AdminData.role)) {
    errors.push('Role must be one of: admin, manufacturer, scholar');
  }
  
  if (!AdminData.name || typeof AdminData.name !== 'string') {
    errors.push('Name is required and must be a string');
  }
  
  return errors;
};

// Static method for bulk import
AdminSchema.statics.bulkImport = async function(AdminsData, importedBy = null) {
  const results = {
    success: [],
    errors: [],
    duplicates: [],
    total: AdminsData.length
  };
  
  const batchId = new mongoose.Types.ObjectId().toString();
  
  for (let i = 0; i < AdminsData.length; i++) {
    const AdminData = AdminsData[i];
    
    try {
      // Validate data
      const validationErrors = this.validateImportData(AdminData);
      if (validationErrors.length > 0) {
        results.errors.push({
          row: i + 1,
          data: AdminData,
          errors: validationErrors
        });
        continue;
      }
      
      // Check for existing Admin
      const existingAdmin = await this.findOne({
        $or: [
          { email: AdminData.email.toLowerCase() },
          { id: AdminData.id }
        ]
      });
      
      if (existingAdmin) {
        results.duplicates.push({
          row: i + 1,
          data: AdminData,
          existing: existingAdmin.toJSON(),
          message: 'Admin already exists with this email or ID'
        });
        continue;
      }
      
      // Create new Admin
      const newAdmin = new this({
        ...AdminData,
        email: AdminData.email.toLowerCase(),
        createdBy: importedBy,
        importBatch: batchId
      });
      
      await newAdmin.save();
      
      results.success.push({
        row: i + 1,
        Admin: newAdmin.toJSON()
      });
      
    } catch (error) {
      results.errors.push({
        row: i + 1,
        data: AdminData,
        errors: [error.message]
      });
    }
  }
  
  return results;
};

// Static method to get Admins by import batch
AdminSchema.statics.getByImportBatch = async function(batchId) {
  return await this.find({ importBatch: batchId }).select('-password');
};

const Admin = mongoose.model('Admin', AdminSchema);
export default Admin;