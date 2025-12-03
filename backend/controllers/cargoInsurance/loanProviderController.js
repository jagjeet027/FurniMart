import { LoanProvider } from '../../models/cargo/loanProvider.js';

export const getAllLoanProviders = async (req, res) => {
  try {
    const { status, coverage, search, sortBy } = req.query;
    let filter = {};

    if (status && status !== 'all') filter.status = status;
    if (coverage && coverage !== 'all') filter.coverage = coverage;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let query = LoanProvider.find(filter);

    if (sortBy === 'rating') query = query.sort({ rating: -1 });
    else if (sortBy === 'newest') query = query.sort({ createdAt: -1 });
    else query = query.sort({ highlight: -1, rating: -1 });

    const providers = await query.exec();

    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getApprovedLoanProviders = async (req, res) => {
  try {
    const providers = await LoanProvider.find({
      status: 'approved',
      paymentStatus: 'completed',
    }).select('-verificationDocuments').exec();

    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const registerLoanProvider = async (req, res) => {
  try {
    const {
      name, email, phone, website, established, coverage,
      loanProducts, approvalTime, disburseTime, features,
      submitterName, submitterEmail, submitterPhone, submitterDesignation,
      description,
    } = req.body;

    if (!name || !email || !phone || !website || !loanProducts) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const existingProvider = await LoanProvider.findOne({
      $or: [{ email }, { name }],
    });

    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: 'Loan provider already exists',
      });
    }

    const provider = await LoanProvider.create({
      name, email, phone, website, established, coverage,
      loanProducts, approvalTime, disburseTime, features,
      submittedBy: {
        name: submitterName,
        email: submitterEmail,
        phone: submitterPhone,
        designation: submitterDesignation,
      },
      description,
      status: 'pending',
      paymentStatus: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Loan provider registered. Awaiting verification.',
      data: provider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLoanProviderById = async (req, res) => {
  try {
    const provider = await LoanProvider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Loan provider not found',
      });
    }

    provider.views += 1;
    await provider.save();

    res.status(200).json({
      success: true,
      data: provider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateLoanProvider = async (req, res) => {
  try {
    const provider = await LoanProvider.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Loan provider not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Loan provider updated',
      data: provider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteLoanProvider = async (req, res) => {
  try {
    const provider = await LoanProvider.findByIdAndDelete(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Loan provider not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Loan provider deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const trackLoanProviderClick = async (req, res) => {
  try {
    const provider = await LoanProvider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Loan provider not found',
      });
    }

    provider.clicks += 1;
    await provider.save();

    res.status(200).json({
      success: true,
      data: provider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
