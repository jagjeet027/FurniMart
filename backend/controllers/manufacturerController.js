import { Manufacturer } from '../models/manufacturer.js';
import { User } from '../models/Users.js';
import { sendStatusEmail } from '../services/emailService.js';
import { createManufacturerNotification } from '../utils/notificationHelper.js';
import fs from 'fs';

// @access  Private
export const getMyManufacturer = async (req, res) => {
  try {
    console.log('=== GET MY MANUFACTURER INFO ===');
    console.log('User ID:', req.userId);

    const manufacturer = await Manufacturer.findOne({ userId: req.userId }).lean();
    
    if (!manufacturer) {
      console.log('❌ Manufacturer profile not found');
      return res.status(404).json({
        success: false,
        message: 'Manufacturer profile not found'
      });
    }

    console.log('✅ Found manufacturer:', manufacturer.businessName);

    res.json({
      success: true,
      data: manufacturer
    });
  } catch (error) {
    console.error('❌ Get manufacturer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const registerManufacturer = async (req, res) => {
  try {
    const {
      businessName,
      businessType,
      yearEstablished,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      contactPerson,
      email,
      phone
    } = req.body;

    console.log('=== MANUFACTURER REGISTRATION ATTEMPT ===');
    console.log('User ID:', req.userId);
    console.log('User Email:', req.user?.email);

    // Validate required fields
    if (!businessName || !businessType || !yearEstablished || !streetAddress || 
        !city || !state || !postalCode || !country || !contactPerson || !email || !phone) {
      console.log('❌ Missing required fields');
      cleanupFiles(req.files);
      
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if required files are uploaded
    if (!req.files?.businessLicense || !req.files?.taxCertificate) {
      console.log('❌ Missing required files');
      cleanupFiles(req.files);
      
      return res.status(400).json({
        success: false,
        message: 'Business license and tax certificate are required'
      });
    }

    // Check if user is already a manufacturer (approved)
    const user = await User.findById(req.userId);
    if (user && user.isManufacturer) {
      console.log('❌ User already approved as manufacturer');
      cleanupFiles(req.files);
      
      return res.status(400).json({
        success: false,
        message: 'You are already registered as a manufacturer'
      });
    }

    // CRITICAL: Check if THIS user already has a pending/submitted registration
    const existingManufacturer = await Manufacturer.findOne({ userId: req.userId });
    if (existingManufacturer) {
      console.log('❌ User already has a manufacturer registration:', existingManufacturer.status);
      console.log('   Existing Manufacturer ID:', existingManufacturer._id);
      console.log('   Existing Business Name:', existingManufacturer.businessName);
      cleanupFiles(req.files);
      
      return res.status(400).json({
        success: false,
        message: `You have already submitted a manufacturer registration. Current status: ${existingManufacturer.status}`,
        existingRegistration: {
          id: existingManufacturer._id,
          businessName: existingManufacturer.businessName,
          status: existingManufacturer.status,
          submittedOn: existingManufacturer.createdAt
        }
      });
    }

    // Prepare documents data
    const documents = {
      businessLicense: {
        filename: req.files.businessLicense[0].originalname,
        path: req.files.businessLicense[0].path,
        uploadDate: new Date()
      },
      taxCertificate: {
        filename: req.files.taxCertificate[0].originalname,
        path: req.files.taxCertificate[0].path,
        uploadDate: new Date()
      },
      qualityCertifications: []
    };

    // Handle quality certifications if provided
    if (req.files.qualityCertifications) {
      documents.qualityCertifications = req.files.qualityCertifications.map(file => ({
        filename: file.originalname,
        path: file.path,
        certificationType: 'General',
        uploadDate: new Date()
      }));
    }

    // Create manufacturer record
    const manufacturer = new Manufacturer({
      userId: req.userId,
      businessName,
      businessType,
      yearEstablished: parseInt(yearEstablished),
      address: {
        streetAddress,
        city,
        state,
        postalCode,
        country
      },
      contact: {
        contactPerson,
        email,
        phone
      },
      documents,
      status: 'pending'
    });

    console.log('Attempting to save manufacturer...');
    await manufacturer.save();
    console.log('✅ Manufacturer saved successfully');

    // Create notification for admin
    try {
      await createManufacturerNotification('new_registration', manufacturer);
    } catch (notifError) {
      console.error('❌ Error creating notification:', notifError);
    }

    console.log('✅ Manufacturer registered successfully:', manufacturer._id);

    res.status(201).json({
      success: true,
      message: 'Manufacturer registration submitted successfully. Please wait for admin approval.',
      data: {
        manufacturerId: manufacturer._id,
        status: manufacturer.status,
        businessName: manufacturer.businessName
      }
    });

  } catch (error) {
    console.error('❌ Manufacturer registration error:', error);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    cleanupFiles(req.files);
    
    // Handle MongoDB duplicate key error (E11000)
    if (error.code === 11000) {
      console.error('❌ DUPLICATE KEY ERROR - This should not happen!');
      console.error('   Duplicate field:', error.keyPattern);
      console.error('   Duplicate value:', error.keyValue);
      
      return res.status(400).json({
        success: false,
        message: 'A manufacturer registration with this information already exists. If you believe this is an error, please contact support.',
        debug: process.env.NODE_ENV === 'development' ? {
          field: error.keyPattern,
          value: error.keyValue
        } : undefined
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during manufacturer registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// @access  Admin
export const getAllManufacturers = async (req, res) => {
  try {
    const manufacturers = await Manufacturer.find({})
      .populate('userId', 'email name')
      .sort({ createdAt: -1 })
      .lean();


    res.json({
      success: true,
      data: manufacturers,
      count: manufacturers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
export const getManufacturerById = async (req, res) => {
  try {
    const { id } = req.params;    
    const manufacturer = await Manufacturer.findById(id)
      .populate('userId', 'email name')
      .lean();

    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer not found'
      });
    }

    // Check if user has permission to view this manufacturer
    if (manufacturer.userId._id.toString() !== req.userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    console.log('✅ Found manufacturer:', manufacturer.businessName);

    res.json({
      success: true,
      data: manufacturer
    });
  } catch (error) {
    console.error('❌ Get manufacturer by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update manufacturer status
// @route   PATCH /api/manufacturers/:id/status
// @access  Admin
export const updateManufacturerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('=== UPDATE MANUFACTURER STATUS ===');
    console.log('Manufacturer ID:', id);
    console.log('New Status:', status);
    console.log('Admin:', req.admin.email);

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
    }

    // Find manufacturer to get userId and contact info
    const manufacturer = await Manufacturer.findById(id).populate('userId', 'email name');
    if (!manufacturer) {
      console.log('❌ Manufacturer not found');
      return res.status(404).json({
        success: false,
        message: 'Manufacturer not found'
      });
    }

    // Store previous status for notification
    const previousStatus = manufacturer.status;

    // Update manufacturer status
    manufacturer.status = status;
    await manufacturer.save();

    // Update user's isManufacturer status
    if (status === 'approved') {
      await User.findByIdAndUpdate(manufacturer.userId._id, { 
        isManufacturer: true,
        role: 'manufacturer'
      });
      console.log('✅ User updated to manufacturer');
    } else if (status === 'rejected') {
      await User.findByIdAndUpdate(manufacturer.userId._id, { 
        isManufacturer: false,
        role: 'user'
      });
      console.log('✅ User manufacturer status revoked');
    }

    // Send email notification
    try {
      await sendStatusEmail(manufacturer.contact.email, status, manufacturer._id);
      console.log('✅ Status email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send status email:', emailError);
    }

    // Create notification for status change
    if (previousStatus !== status) {
      try {
        await createManufacturerNotification(status, manufacturer, req.admin._id);
      } catch (notifError) {
        console.error('❌ Error creating notification:', notifError);
      }
    }

    console.log('✅ Status updated successfully');

    res.json({
      success: true,
      message: `Manufacturer status updated to ${status}`,
      data: {
        id: manufacturer._id,
        businessName: manufacturer.businessName,
        status: manufacturer.status,
        userId: manufacturer.userId._id,
        userEmail: manufacturer.contact.email
      }
    });

  } catch (error) {
    console.error('❌ Error updating manufacturer status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete manufacturer
// @route   DELETE /api/manufacturers/:id
// @access  Admin
export const deleteManufacturer = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('=== DELETE MANUFACTURER ===');
    console.log('Manufacturer ID:', id);
    console.log('Admin:', req.admin.email);

    // Find manufacturer to get file paths and userId
    const manufacturer = await Manufacturer.findById(id);
    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer not found'
      });
    }

    // Delete associated files
    const filesToDelete = [];
    
    if (manufacturer.documents.businessLicense?.path) {
      filesToDelete.push(manufacturer.documents.businessLicense.path);
    }
    
    if (manufacturer.documents.taxCertificate?.path) {
      filesToDelete.push(manufacturer.documents.taxCertificate.path);
    }
    
    if (manufacturer.documents.qualityCertifications) {
      manufacturer.documents.qualityCertifications.forEach(cert => {
        if (cert.path) filesToDelete.push(cert.path);
      });
    }

    // Delete files from filesystem
    filesToDelete.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ Deleted file: ${filePath}`);
        }
      } catch (error) {
        console.error(`❌ Error deleting file ${filePath}:`, error);
      }
    });

    // Delete manufacturer record
    await Manufacturer.findByIdAndDelete(id);

    // Update user's isManufacturer status to false
    await User.findByIdAndUpdate(manufacturer.userId, { 
      isManufacturer: false,
      role: 'user'
    });

    console.log('✅ Manufacturer deleted successfully');

    res.json({
      success: true,
      message: 'Manufacturer deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting manufacturer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting manufacturer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
