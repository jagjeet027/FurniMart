// controllers/cargo/cargoAdminController.js
import { Company } from '../../models/cargo/Company.js';
import { Shipment } from '../../models/cargo/Shipment.js';
import { Quote } from '../../models/cargo/Quote.js';
import { Payment } from '../../models/cargo/Payment.js';
import Admin from '../../models/admin.js';
import { LoanProvider } from '../../models/cargo/loanProvider.js';
// ========== DASHBOARD STATISTICS ==========
export const getDashboardStats = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const approvedCompanies = await Company.countDocuments({
      status: 'approved',
    });
    const pendingCompanies = await Company.countDocuments({
      status: 'pending',
      paymentStatus: 'completed',
    });
    const rejectedCompanies = await Company.countDocuments({
      status: 'rejected',
    });

    const completedPayments = await Payment.find({
      status: 'completed',
    });
    const totalRevenue = completedPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    const totalClicks = await Company.aggregate([
      { $group: { _id: null, totalClicks: { $sum: '$clicks' } } },
    ]);

    const totalViews = await Company.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } },
    ]);

    const totalQuotes = await Company.aggregate([
      { $group: { _id: null, totalQuotes: { $sum: '$quotesGenerated' } } },
    ]);

    const recentSubmissions = await Company.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email status paymentStatus createdAt views clicks');

    res.status(200).json({
      success: true,
      data: {
        totalCompanies,
        approvedCompanies,
        pendingCompanies,
        rejectedCompanies,
        totalRevenue,
        totalClicks: totalClicks[0]?.totalClicks || 0,
        totalViews: totalViews[0]?.totalViews || 0,
        totalQuotes: totalQuotes[0]?.totalQuotes || 0,
        recentSubmissions,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== PENDING COMPANIES MANAGEMENT ==========
export const getPendingCompanies = async (req, res) => {
  try {
    const { search, sortBy } = req.query;
    let filter = {
      status: 'pending',
      paymentStatus: 'completed',
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'submittedBy.name': { $regex: search, $options: 'i' } },
      ];
    }

    let query = Company.find(filter);

    if (sortBy === 'newest') {
      query = query.sort({ createdAt: -1 });
    } else if (sortBy === 'oldest') {
      query = query.sort({ createdAt: 1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const companies = await query.exec();

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    console.error('Pending companies error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== ALL COMPANIES VIEW ==========
export const getAllCompaniesAdmin = async (req, res) => {
  try {
    const { status, paymentStatus, search, sortBy, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (status && status !== 'all') filter.status = status;
    if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'submittedBy.email': { $regex: search, $options: 'i' } },
      ];
    }

    let query = Company.find(filter);

    if (sortBy === 'newest') query = query.sort({ createdAt: -1 });
    else if (sortBy === 'oldest') query = query.sort({ createdAt: 1 });
    else if (sortBy === 'rating') query = query.sort({ rating: -1 });
    else query = query.sort({ createdAt: -1 });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const companies = await query.skip(skip).limit(parseInt(limit)).exec();
    const total = await Company.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: companies.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: companies,
    });
  } catch (error) {
    console.error('All companies error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== COMPANY APPROVAL ==========
export const approveCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        isVerified: true,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    console.log(`✅ Company approved: ${company.name}`);

    res.status(200).json({
      success: true,
      message: 'Company approved successfully',
      data: company,
    });
  } catch (error) {
    console.error('Approve company error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== COMPANY REJECTION ==========
export const rejectCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const company = await Company.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    console.log(`❌ Company rejected: ${company.name}`);

    res.status(200).json({
      success: true,
      message: 'Company rejected successfully',
      data: company,
    });
  } catch (error) {
    console.error('Reject company error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== COMPANY DELETION ==========
export const deleteCompanyAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findByIdAndDelete(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    console.log(`🗑️ Company deleted: ${company.name}`);

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== COMPANY DETAILS ==========
export const getCompanyDetailsAdmin = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error('Get company details error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== ANALYTICS ==========
export const getAnalytics = async (req, res) => {
  try {
    const topCompanies = await Company.find({ status: 'approved' })
      .sort({ clicks: -1 })
      .limit(5)
      .select('name clicks views quotesGenerated rating');

    const companyStatuses = await Company.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const revenueByMonth = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const totalShipments = await Shipment.countDocuments();
    const totalQuotes = await Quote.countDocuments();

    const shipmentsByMode = await Shipment.aggregate([
      {
        $group: {
          _id: '$transportMode',
          count: { $sum: 1 },
        },
      },
    ]);

    const cargoTypeDistribution = await Shipment.aggregate([
      {
        $group: {
          _id: '$cargoType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        topCompanies,
        companyStatuses,
        revenueByMonth,
        totalShipments,
        totalQuotes,
        shipmentsByMode,
        cargoTypeDistribution,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== PAYMENT MANAGEMENT ==========
export const getAllPayments = async (req, res) => {
  try {
    const { status, paymentMethod, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find(filter)
      .populate('companyId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: payments,
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== SHIPMENTS VIEW ==========
export const getAllShipments = async (req, res) => {
  try {
    const { status, cargoType, transportMode, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (cargoType) filter.cargoType = cargoType;
    if (transportMode) filter.transportMode = transportMode;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const shipments = await Shipment.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Shipment.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: shipments.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: shipments,
    });
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== QUOTES VIEW ==========
export const getAllQuotes = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const quotes = await Quote.find(filter)
      .populate('shipmentId', 'cargoType transportMode departureLocation arrivalLocation')
      .populate('companyId', 'name email')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Quote.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: quotes.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: quotes,
    });
  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== SYSTEM SETTINGS ==========
export const getSystemSettings = async (req, res) => {
  try {
    const settings = {
      listingFee: 15000,
      currency: 'INR',
      platformName: 'SurakshitSafar',
      supportEmail: 'support@surakshitsafar.com',
      maxCoverageLimit: 500000000,
    };

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== UPDATE SYSTEM SETTINGS ==========
export const updateSystemSettings = async (req, res) => {
  try {
    const { listingFee, platformName, supportEmail } = req.body;

    // Here you would typically update settings from a database
    // For now, we'll just return success
    const updatedSettings = {
      listingFee: listingFee || 15000,
      platformName: platformName || 'SurakshitSafar',
      supportEmail: supportEmail || 'support@surakshitsafar.com',
    };

    console.log('✅ Settings updated:', updatedSettings);

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== BULK OPERATIONS ==========
export const bulkApproveCompanies = async (req, res) => {
  try {
    const { companyIds } = req.body;

    if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Company IDs array is required',
      });
    }

    const result = await Company.updateMany(
      { _id: { $in: companyIds } },
      { status: 'approved', isVerified: true }
    );

    console.log(`✅ Bulk approved ${result.modifiedCount} companies`);

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} companies approved successfully`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error('Bulk approve error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========== EXPORT DATA ==========
export const exportCompaniesData = async (req, res) => {
  try {
    const companies = await Company.find({}).select(
      'name email phone coverage status paymentStatus views clicks quotesGenerated createdAt'
    );

    // Convert to CSV format
    const csvHeader = 'Name,Email,Phone,Coverage,Status,Payment Status,Views,Clicks,Quotes,Created Date\n';
    const csvData = companies
      .map(
        (c) =>
          `"${c.name}","${c.email}","${c.phone}","${c.coverage}","${c.status}","${c.paymentStatus}",${c.views},${c.clicks},${c.quotesGenerated},"${c.createdAt.toISOString()}"`
      )
      .join('\n');

    const csv = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="companies_data.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPendingLoanProviders = async (req, res) => {
  try {
    const { search, sortBy } = req.query;
    let filter = {
      status: 'pending',
      paymentStatus: 'completed',
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    let query = LoanProvider.find(filter);

    if (sortBy === 'newest') {
      query = query.sort({ createdAt: -1 });
    } else if (sortBy === 'oldest') {
      query = query.sort({ createdAt: 1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const providers = await query.exec();

    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    console.error('Pending loan providers error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllLoanProvidersAdmin = async (req, res) => {
  try {
    const { status, paymentStatus, search, sortBy, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (status && status !== 'all') filter.status = status;
    if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    let query = LoanProvider.find(filter);

    if (sortBy === 'newest') query = query.sort({ createdAt: -1 });
    else if (sortBy === 'oldest') query = query.sort({ createdAt: 1 });
    else if (sortBy === 'rating') query = query.sort({ rating: -1 });
    else query = query.sort({ createdAt: -1 });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const providers = await query.skip(skip).limit(parseInt(limit)).exec();
    const total = await LoanProvider.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: providers.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: providers,
    });
  } catch (error) {
    console.error('All loan providers error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLoanProviderDetailsAdmin = async (req, res) => {
  try {
    const provider = await LoanProvider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Loan provider not found',
      });
    }

    res.status(200).json({
      success: true,
      data: provider,
    });
  } catch (error) {
    console.error('Get loan provider details error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const approveLoanProvider = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await LoanProvider.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        isVerified: true,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Loan provider not found',
      });
    }

    console.log(`✅ Loan provider approved: ${provider.name}`);

    res.status(200).json({
      success: true,
      message: 'Loan provider approved successfully',
      data: provider,
    });
  } catch (error) {
    console.error('Approve loan provider error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectLoanProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const provider = await LoanProvider.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Loan provider not found',
      });
    }

    console.log(`❌ Loan provider rejected: ${provider.name}`);

    res.status(200).json({
      success: true,
      message: 'Loan provider rejected successfully',
      data: provider,
    });
  } catch (error) {
    console.error('Reject loan provider error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteLoanProviderAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await LoanProvider.findByIdAndDelete(id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Loan provider not found',
      });
    }

    console.log(`🗑️ Loan provider deleted: ${provider.name}`);

    res.status(200).json({
      success: true,
      message: 'Loan provider deleted successfully',
    });
  } catch (error) {
    console.error('Delete loan provider error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};