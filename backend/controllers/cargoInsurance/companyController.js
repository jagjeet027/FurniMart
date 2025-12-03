// controllers/cargo/companyController.js
import { Company } from '../../models/cargo/Company.js';
import { Payment } from '../../models/cargo/Payment.js';
import { User } from '../../models/Users.js';

// Get all companies with filters
export const getAllCompanies = async (req, res) => {
  try {
    const { status, coverage, cargoType, shipmentType, search, sortBy } = req.query;
    let filter = {};

    if (status && status !== 'all') filter.status = status;
    if (coverage && coverage !== 'all') filter.coverage = coverage;
    if (cargoType) filter.cargoTypes = { $in: [cargoType] };
    if (shipmentType) filter.shipmentTypes = { $in: [shipmentType] };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let query = Company.find(filter);

    if (sortBy === 'rating') query = query.sort({ rating: -1 });
    else if (sortBy === 'newest') query = query.sort({ createdAt: -1 });
    else query = query.sort({ highlight: -1, rating: -1 });

    const companies = await query.exec();

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get approved companies for search
export const getApprovedCompanies = async (req, res) => {
  try {
    const companies = await Company.find({
      status: 'approved',
      paymentStatus: 'completed',
    })
      .select('-verificationDocuments')
      .exec();

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Register new company
export const registerCompany = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      website,
      established,
      coverage,
      maxCoverageAmount,
      maxCoverageCurrency,
      routes,
      shipmentTypes,
      cargoTypes,
      submitterName,
      submitterEmail,
      submitterPhone,
      submitterDesignation,
      description,
    } = req.body;

    console.log('📥 [REGISTER COMPANY] Request received:', {
      name,
      email,
      maxCoverageAmount,
      maxCoverageCurrency
    });

    // Validate required fields
    if (!name || !email || !phone || !website || !maxCoverageAmount) {
      console.error('❌ [REGISTER COMPANY] Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, website, maxCoverageAmount',
      });
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({
      $or: [{ email }, { name }],
    });

    if (existingCompany) {
      console.error('❌ [REGISTER COMPANY] Company already exists');
      return res.status(400).json({
        success: false,
        message: 'Company with this email or name already exists',
      });
    }

    // ✅ FIX: Send both individual fields and maxCoverage object
    const companyData = {
      name,
      email,
      phone,
      website,
      established: established || new Date().getFullYear(),
      coverage: coverage || 'Global',
      // ✅ Individual fields (required by model)
      maxCoverageAmount: parseFloat(maxCoverageAmount),
      maxCoverageCurrency: maxCoverageCurrency || 'USD',
      // ✅ Object format (for backward compatibility)
      maxCoverage: {
        amount: parseFloat(maxCoverageAmount),
        currency: maxCoverageCurrency || 'USD',
      },
      routes: routes || [],
      shipmentTypes: shipmentTypes || [],
      cargoTypes: cargoTypes || [],
      submitterName,
      submitterEmail,
      submitterPhone,
      submitterDesignation,
      description: description || '',
      status: 'pending',
      paymentStatus: 'pending',
    };

    console.log('📤 [REGISTER COMPANY] Creating company with data:', companyData);

    // Create new company
    const company = await Company.create(companyData);

    console.log('✅ [REGISTER COMPANY] Company created successfully:', company._id);

    res.status(201).json({
      success: true,
      message: 'Company registered successfully. Awaiting payment verification.',
      data: company,
    });
  } catch (error) {
    console.error('❌ [REGISTER COMPANY] Error:', {
      message: error.message,
      errors: error.errors,
      stack: error.stack
    });

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages}`,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to register company',
    });
  }
};

// Get company by ID
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Increment views
    company.views += 1;
    await company.save();

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update company
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If updating coverage amount, update both fields
    if (updateData.maxCoverageAmount) {
      updateData.maxCoverageCurrency = updateData.maxCoverageCurrency || 'USD';
      updateData.maxCoverage = {
        amount: updateData.maxCoverageAmount,
        currency: updateData.maxCoverageCurrency,
      };
    }

    const company = await Company.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete company
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Track company click
export const trackCompanyClick = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    company.clicks += 1;
    await company.save();

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};