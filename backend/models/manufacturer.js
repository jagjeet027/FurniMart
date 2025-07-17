import mongoose from 'mongoose';
import validator from 'validator';

const manufacturerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Making it optional since it's not being set in your current flow
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    minlength: [2, 'Business name must be at least 2 characters'],
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },

  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    enum: {
      values: ['corporation', 'llc', 'partnership', 'sole_proprietorship'],
      message: '{VALUE} is not a valid business type'
    }
  },
  yearEstablished: {
    type: Number,
    required: [true, 'Year established is required'],
    min: [1800, 'Year must be after 1800'],
    max: [new Date().getFullYear(), 'Year cannot be in the future']
  },
  address: {
    streetAddress: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
      validate: {
        validator: function(v) {
          return /^[0-9A-Z-]{3,10}$/i.test(v);
        },
        message: 'Please provide a valid postal code'
      }
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    }
  },
  contact: {
    contactPerson: {
      type: String,
      required: [true, 'Contact person is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return validator.isEmail(v);
        },
        message: 'Please provide a valid email address'
      }
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function(v) {
          return /^\+?[\d\s-]{10,}$/.test(v);
        },
        message: 'Please provide a valid phone number'
      }
    }
  },
  documents: {
    businessLicense: {
      filename: {
        type: String,
        required: [true, 'Business license filename is required']
      },
      path: {
        type: String,
        required: [true, 'Business license path is required']
      },
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    taxCertificate: {
      filename: {
        type: String,
        required: [true, 'Tax certificate filename is required']
      },
      path: {
        type: String,
        required: [true, 'Tax certificate path is required']
      },
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    qualityCertifications: [{
      filename: {
        type: String,
        required: [true, 'Quality certification filename is required']
      },
      path: {
        type: String,
        required: [true, 'Quality certification path is required']
      },
      certificationType: {
        type: String,
        required: [true, 'Certification type is required']
      },
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }]
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

manufacturerSchema.index({ userId: 1 }, { unique: false });

// Your existing virtuals and middleware
manufacturerSchema.virtual('fullAddress').get(function() {
  return `${this.address.streetAddress}, ${this.address.city}, ${this.address.state} ${this.address.postalCode}, ${this.address.country}`;
});

manufacturerSchema.pre('save', async function(next) {
  if (!this.isModified()) return next();

  if (!this.documents.businessLicense?.path || !this.documents.taxCertificate?.path) {
    throw new Error('Required documents are missing');
  }

  next();
});

const Manufacturer = mongoose.models.Manufacturer || mongoose.model('Manufacturer', manufacturerSchema);


export  {Manufacturer};