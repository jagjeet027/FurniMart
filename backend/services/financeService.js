// backend/services/financeService.js - FIXED VERSION
import Loan from '../models/finance/loan.js';
import LoanApplication from '../models/finance/LoanApplication.js';
import Organization from '../models/finance/financeOrganization.js';

export class FinanceService {
  // ===== LOAN MANAGEMENT =====
  
  async getAllLoans(filters = {}) {
    try {
      const query = {};
      
      if (filters.country) query.country = filters.country;
      if (filters.category) query.category = filters.category;
      if (filters.lenderType) query.lenderType = filters.lenderType;
      if (filters.minAmount || filters.maxAmount) {
        query.loanAmount = {};
        if (filters.minAmount) query.loanAmount.$gte = filters.minAmount;
        if (filters.maxAmount) query.loanAmount.$lte = filters.maxAmount;
      }
      if (filters.collateralRequired !== undefined) {
        query.collateral = filters.collateralRequired === 'true' || filters.collateralRequired === true;
      }
      
      const loans = await Loan.find(query)
        .sort({ applicationCount: -1, createdAt: -1 })
        .limit(filters.limit || 100)
        .lean();
      
      return {
        success: true,
        count: loans.length,
        data: loans
      };
    } catch (error) {
      console.error('❌ Error fetching loans:', error);
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }

  async searchLoans(searchTerm, filters = {}) {
    try {
      const query = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { lender: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ]
      };
      
      if (filters.country) query.country = filters.country;
      if (filters.category) query.category = filters.category;
      if (filters.lenderType) query.lenderType = filters.lenderType;
      
      const loans = await Loan.find(query)
        .sort({ applicationCount: -1 })
        .limit(50)
        .lean();
      
      return {
        success: true,
        count: loans.length,
        data: loans
      };
    } catch (error) {
      console.error('❌ Error searching loans:', error);
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }

  async getLoanById(loanId) {
    try {
      const loan = await Loan.findOne({ id: loanId }).lean();
      
      if (!loan) {
        return { success: false, message: 'Loan not found', data: null };
      }
      
      return { success: true, data: loan };
    } catch (error) {
      console.error('❌ Error fetching loan:', error);
      return { success: false, message: error.message, data: null };
    }
  }

  async getLoansbyCountry(country) {
    try {
      const loans = await Loan.find({ country })
        .sort({ applicationCount: -1 })
        .lean();
      
      return {
        success: true,
        count: loans.length,
        data: loans
      };
    } catch (error) {
      console.error('❌ Error fetching loans by country:', error);
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }

  async getUniqueCountries() {
    try {
      const countries = await Loan.distinct('country');
      return {
        success: true,
        data: countries.sort()
      };
    } catch (error) {
      console.error('❌ Error fetching countries:', error);
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }

  // ===== APPLICATION TRACKING =====
  
  async trackLoanApplication(applicationData) {
    try {
      const application = new LoanApplication({
        loanId: applicationData.loanId,
        loanName: applicationData.loanName,
        lender: applicationData.lender,
        country: applicationData.country,
        category: applicationData.category,
        lenderType: applicationData.lenderType,
        applicationUrl: applicationData.applicationUrl,
        sessionId: applicationData.sessionId,
        userIp: applicationData.userIp,
        userAgent: applicationData.userAgent,
        referrer: applicationData.referrer,
        status: 'clicked'
      });
      
      await application.save();
      
      // Increment application count on Loan
      await Loan.updateOne(
        { id: applicationData.loanId },
        { $inc: { applicationCount: 1 } }
      );
      
      return {
        success: true,
        message: 'Application tracked successfully',
        data: application
      };
    } catch (error) {
      console.error('❌ Error tracking application:', error);
      return { success: false, message: error.message };
    }
  }

  async getApplicationStats() {
    try {
      const stats = await LoanApplication.getStats();
      
      return {
        success: true,
        data: {
          total: stats.total,
          byCountry: stats.byCountry,
          byCategory: stats.byCategory,
          byLenderType: stats.byLenderType
        }
      };
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      return {
        success: false,
        message: error.message,
        data: {}
      };
    }
  }

  async getPopularLoans(limit = 10) {
    try {
      const loans = await LoanApplication.getPopularLoans(limit);
      
      return {
        success: true,
        data: loans
      };
    } catch (error) {
      console.error('❌ Error fetching popular loans:', error);
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }

  async getApplicationAnalytics(limit = 50, skip = 0) {
    try {
      const applications = await LoanApplication.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
      
      const total = await LoanApplication.countDocuments();
      
      return {
        success: true,
        data: applications,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + limit < total
        }
      };
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      return {
        success: false,
        message: error.message,
        data: [],
        pagination: {}
      };
    }
  }

  // ===== ORGANIZATION MANAGEMENT =====
  
  // ✅ FIXED: Submit organization
  async submitOrganization(organizationData) {
    try {
      console.log('💾 Saving organization to database:', organizationData.organizationName);
      
      const organization = new Organization({
        organizationName: organizationData.organizationName,
        organizationType: organizationData.organizationType,
        registrationNumber: organizationData.registrationNumber,
        establishedYear: organizationData.establishedYear,
        contactPerson: organizationData.contactPerson,
        designation: organizationData.designation,
        email: organizationData.email,
        phone: organizationData.phone,
        website: organizationData.website,
        address: {
          street: organizationData.address,
          city: organizationData.city,
          state: organizationData.state,
          country: organizationData.country,
          zipCode: organizationData.zipCode
        },
        loanTypes: organizationData.loanTypes,
        minLoanAmount: organizationData.minLoanAmount,
        maxLoanAmount: organizationData.maxLoanAmount,
        interestRateRange: organizationData.interestRateRange,
        description: organizationData.description,
        specialPrograms: organizationData.specialPrograms,
        eligibilityCriteria: organizationData.eligibilityCriteria,
        ipAddress: organizationData.ipAddress,
        userAgent: organizationData.userAgent,
        status: 'pending'
      });
      
      const savedOrg = await organization.save();
      console.log('✅ Organization saved successfully:', savedOrg._id);
      
      return {
        success: true,
        message: 'Organization submitted successfully',
        data: { 
          id: savedOrg._id,
          organizationName: savedOrg.organizationName,
          status: savedOrg.status
        }
      };
    } catch (error) {
      console.error('❌ Error submitting organization:', error);
      return {
        success: false,
        message: error.message,
        errors: error.errors
      };
    }
  }

  // ✅ Get organizations with filters
  async getOrganizations(filters = {}) {
    try {
      const query = {};
      
      if (filters.status) query.status = filters.status;
      if (filters.organizationType) query.organizationType = filters.organizationType;
      
      console.log('🔍 Fetching organizations with filters:', filters);
      
      const organizations = await Organization.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 100)
        .skip(filters.skip || 0)
        .select('-ipAddress -userAgent')
        .lean();
      
      const total = await Organization.countDocuments(query);
      
      console.log('✅ Found organizations:', organizations.length);
      
      return {
        success: true,
        data: organizations,
        pagination: {
          total,
          limit: filters.limit || 100,
          skip: filters.skip || 0
        }
      };
    } catch (error) {
      console.error('❌ Error fetching organizations:', error);
      return {
        success: false,
        message: error.message,
        data: [],
        pagination: {}
      };
    }
  }

  // ✅ Get single organization
  async getOrganizationById(organizationId) {
    try {
      const organization = await Organization.findById(organizationId);
      
      if (!organization) {
        return { success: false, message: 'Organization not found', data: null };
      }
      
      return { success: true, data: organization };
    } catch (error) {
      console.error('❌ Error fetching organization:', error);
      return { success: false, message: error.message, data: null };
    }
  }

  // ✅ Review organization (ADMIN)
  async reviewOrganization(organizationId, reviewData) {
    try {
      console.log('📝 Reviewing organization:', organizationId, 'Status:', reviewData.status);
      
      const organization = await Organization.findById(organizationId);
      
      if (!organization) {
        return { success: false, message: 'Organization not found' };
      }
      
      if (reviewData.status === 'approved') {
        await organization.approve(reviewData.reviewerName, reviewData.reviewNotes);
      } else if (reviewData.status === 'rejected') {
        await organization.reject(reviewData.reviewerName, reviewData.reviewNotes);
      }
      
      console.log('✅ Organization reviewed successfully');
      
      return {
        success: true,
        message: `Organization ${reviewData.status} successfully`,
        data: organization
      };
    } catch (error) {
      console.error('❌ Error reviewing organization:', error);
      return { success: false, message: error.message };
    }
  }

  // ✅ Get organization stats
  async getOrganizationStats() {
    try {
      const stats = await Organization.getStats();
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('❌ Error fetching organization stats:', error);
      return {
        success: false,
        message: error.message,
        data: {}
      };
    }
  }

  // ===== ADMIN FUNCTIONS =====
  
  async addLoan(loanData) {
    try {
      const loan = new Loan({
        id: loanData.id || `loan-${Date.now()}`,
        name: loanData.name,
        lender: loanData.lender,
        lenderType: loanData.lenderType,
        category: loanData.category,
        country: loanData.country,
        interestRate: loanData.interestRate,
        loanAmount: {
          min: loanData.loanAmount?.min || 0,
          max: loanData.loanAmount?.max || 0
        },
        repaymentTerm: {
          min: loanData.repaymentTerm?.min || 0,
          max: loanData.repaymentTerm?.max || 0
        },
        processingFee: loanData.processingFee || '0%',
        collateral: loanData.collateral || false,
        description: loanData.description,
        benefits: loanData.benefits || [],
        documents: loanData.documents || [],
        features: loanData.features || [],
        eligibility: loanData.eligibility || {},
        applicationUrl: loanData.applicationUrl,
        processingTime: loanData.processingTime
      });
      
      await loan.save();
      
      return {
        success: true,
        message: 'Loan added successfully',
        data: loan
      };
    } catch (error) {
      console.error('❌ Error adding loan:', error);
      return { success: false, message: error.message };
    }
  }

  async updateLoan(loanId, loanData) {
    try {
      const loan = await Loan.findByIdAndUpdate(
        loanId,
        { $set: loanData },
        { new: true, runValidators: true }
      );
      
      if (!loan) {
        return { success: false, message: 'Loan not found' };
      }
      
      return {
        success: true,
        message: 'Loan updated successfully',
        data: loan
      };
    } catch (error) {
      console.error('❌ Error updating loan:', error);
      return { success: false, message: error.message };
    }
  }

  async deleteLoan(loanId) {
    try {
      const loan = await Loan.findByIdAndDelete(loanId);
      
      if (!loan) {
        return { success: false, message: 'Loan not found' };
      }
      
      return {
        success: true,
        message: 'Loan deleted successfully'
      };
    } catch (error) {
      console.error('❌ Error deleting loan:', error);
      return { success: false, message: error.message };
    }
  }
}

export default new FinanceService();