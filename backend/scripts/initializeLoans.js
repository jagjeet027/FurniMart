// backend/scripts/initializeLoans.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Loan from '../models/finance/loan.js';

dotenv.config();

const defaultLoans = [
  {
    id: "gov-startup-india-1",
    name: "Startup India Seed Fund Scheme",
    lender: "Government of India",
    lenderType: "government",
    category: "startup",
    country: "India",
    interestRate: "0%",
    loanAmount: { min: 500000, max: 50000000 },
    repaymentTerm: { min: 36, max: 84 },
    processingFee: "0%",
    collateral: false,
    eligibility: {
      minAge: 18,
      maxAge: 65,
      minIncome: 0,
      creditScoreMin: 0,
      organizationType: ["startup"],
      businessAge: 0,
      sector: ["technology", "manufacturing", "services"]
    },
    description: "Government seed funding for early-stage startups with innovative business ideas",
    benefits: ["No interest", "No collateral required", "Mentorship support"],
    documents: ["Business plan", "Incorporation certificate"],
    applicationUrl: "https://seedfund.startupindia.gov.in/",
    processingTime: "60-90 days",
    features: ["Equity free funding", "Expert mentorship"]
  },
  {
    id: "gov-mudra-1",
    name: "MUDRA Yojana - Shishu",
    lender: "MUDRA (Government)",
    lenderType: "government",
    category: "sme",
    country: "India",
    interestRate: "8.5-12%",
    loanAmount: { min: 10000, max: 50000 },
    repaymentTerm: { min: 12, max: 60 },
    processingFee: "0%",
    collateral: false,
    eligibility: {
      minAge: 18,
      maxAge: 65,
      minIncome: 100000,
      creditScoreMin: 0,
      organizationType: ["sme", "individual"],
      businessAge: 0,
      sector: ["manufacturing", "trading", "services"]
    },
    description: "Micro-credit for small businesses and entrepreneurs",
    benefits: ["No collateral", "Subsidized interest", "Easy documentation"],
    documents: ["Aadhaar card", "Business registration"],
    applicationUrl: "https://www.mudra.org.in/",
    processingTime: "15-30 days",
    features: ["Government guarantee", "Flexible repayment"]
  },
  {
    id: "bank-sbi-1",
    name: "SBI SME Business Loan",
    lender: "State Bank of India",
    lenderType: "bank",
    category: "sme",
    country: "India",
    interestRate: "11.50-16%",
    loanAmount: { min: 500000, max: 50000000 },
    repaymentTerm: { min: 12, max: 84 },
    processingFee: "1%",
    collateral: true,
    eligibility: {
      minAge: 21,
      maxAge: 65,
      minIncome: 500000,
      creditScoreMin: 700,
      organizationType: ["sme", "startup"],
      businessAge: 12,
      sector: ["manufacturing", "trading", "services"]
    },
    description: "Comprehensive business financing solution for SMEs",
    benefits: ["Competitive rates", "Flexible repayment"],
    documents: ["Financial statements", "ITR"],
    applicationUrl: "https://sbi.co.in/business-banking/sme",
    processingTime: "7-15 days",
    features: ["Digital application", "Quick processing"]
  },
  {
    id: "bank-hdfc-1",
    name: "HDFC Business Loan",
    lender: "HDFC Bank",
    lenderType: "bank",
    category: "sme",
    country: "India",
    interestRate: "12-18%",
    loanAmount: { min: 1000000, max: 75000000 },
    repaymentTerm: { min: 12, max: 96 },
    processingFee: "2%",
    collateral: true,
    eligibility: {
      minAge: 23,
      maxAge: 65,
      minIncome: 1000000,
      creditScoreMin: 750,
      organizationType: ["sme", "startup"],
      businessAge: 24,
      sector: ["manufacturing", "trading", "services"]
    },
    description: "Customized business loans with digital processing",
    benefits: ["Quick approval", "Flexible tenure"],
    documents: ["Audited financials", "ITR"],
    applicationUrl: "https://www.hdfcbank.com/business/",
    processingTime: "5-10 days",
    features: ["Online application", "Doorstep service"]
  },
  {
    id: "usa-sba-1",
    name: "SBA 7(a) Loan Program",
    lender: "U.S. Small Business Administration",
    lenderType: "government",
    category: "sme",
    country: "United States",
    interestRate: "5-13%",
    loanAmount: { min: 500000, max: 500000000 },
    repaymentTerm: { min: 12, max: 300 },
    processingFee: "3%",
    collateral: true,
    eligibility: {
      minAge: 18,
      maxAge: 70,
      minIncome: 500000,
      creditScoreMin: 680,
      organizationType: ["sme", "startup"],
      businessAge: 24,
      sector: ["manufacturing", "retail", "services"]
    },
    description: "Government-backed loans for small businesses in the United States",
    benefits: ["Government guarantee", "Lower down payments"],
    documents: ["Business plan", "Financial statements"],
    applicationUrl: "https://www.sba.gov/funding-programs/loans",
    processingTime: "30-90 days",
    features: ["85% government guarantee", "Competitive rates"]
  }
];

const initializeDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-app';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB');

    // Clear existing loans (optional - comment out to keep existing data)
    // await Loan.deleteMany({});
    // console.log('✓ Cleared existing loans');

    // Check which loans already exist
    const existingLoans = await Loan.find({ id: { $in: defaultLoans.map(l => l.id) } });
    const existingIds = new Set(existingLoans.map(l => l.id));

    // Filter loans to insert (only new ones)
    const loansToInsert = defaultLoans.filter(loan => !existingIds.has(loan.id));

    if (loansToInsert.length > 0) {
      await Loan.insertMany(loansToInsert);
      console.log(`✓ Inserted ${loansToInsert.length} new loans`);
    } else {
      console.log('✓ All loans already exist in database');
    }

    // Create indexes
    await Loan.collection.createIndex({ country: 1, category: 1 });
    await Loan.collection.createIndex({ lenderType: 1, applicationCount: -1 });
    await Loan.collection.createIndex({ createdAt: -1 });
    console.log('✓ Created indexes');

    const totalLoans = await Loan.countDocuments();
    console.log(`✓ Database initialized with ${totalLoans} total loans`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Error initializing database:', error);
    process.exit(1);
  }
};

initializeDatabase();