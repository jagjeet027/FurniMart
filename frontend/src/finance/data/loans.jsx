export const loanData = [
  {
    id: "gov-startup-india-1",
    name: "Startup India Seed Fund Scheme",
    lender: "Government of India",
    lenderType: "government",
    category: "startup",
    country: "India",
    interestRate: "0%",
    loanAmount: {
      min: 500000,
      max: 50000000
    },
    repaymentTerm: {
      min: 36,
      max: 84
    },
    processingFee: "0%",
    collateral: false,
    eligibility: {
      minAge: 18,
      maxAge: 65,
      minIncome: 0,
      creditScoreMin: 0,
      organizationType: ["startup"],
      businessAge: 0,
      sector: ["technology", "manufacturing", "services", "agriculture"]
    },
    description: "Government seed funding for early-stage startups with innovative business ideas",
    benefits: ["No interest", "No collateral required", "Mentorship support", "Government backing"],
    documents: ["Business plan", "Incorporation certificate", "Founder details", "Financial projections"],
    applicationUrl: "https://seedfund.startupindia.gov.in/",
    processingTime: "60-90 days",
    features: ["Equity free funding", "Expert mentorship", "Networking opportunities"]
  },
  {
    id: "gov-mudra-1",
    name: "MUDRA Yojana - Shishu",
    lender: "MUDRA (Government)",
    lenderType: "government",
    category: "sme",
    country: "India",
    interestRate: "8.5-12%",
    loanAmount: {
      min: 10000,
      max: 50000
    },
    repaymentTerm: {
      min: 12,
      max: 60
    },
    processingFee: "0%",
    collateral: false,
    eligibility: {
      minAge: 18,
      maxAge: 65,
      minIncome: 100000,
      creditScoreMin: 0,
      organizationType: ["sme", "individual"],
      businessAge: 0,
      sector: ["manufacturing", "trading", "services", "agriculture"]
    },
    description: "Micro-credit for small businesses and entrepreneurs",
    benefits: ["No collateral", "Subsidized interest", "Easy documentation", "Quick approval"],
    documents: ["Aadhaar card", "Business registration", "Bank statements", "Income proof"],
    applicationUrl: "https://www.mudra.org.in/",
    processingTime: "15-30 days",
    features: ["Government guarantee", "Flexible repayment", "Business development support"]
  },
  {
    id: "gov-stand-up-1",
    name: "Stand Up India Scheme",
    lender: "Government of India",
    lenderType: "government",
    category: "startup",
    country: "India",
    interestRate: "9-14%",
    loanAmount: {
      min: 1000000,
      max: 10000000
    },
    repaymentTerm: {
      min: 84,
      max: 120
    },
    processingFee: "0%",
    collateral: true,
    eligibility: {
      minAge: 18,
      maxAge: 65,
      minIncome: 200000,
      creditScoreMin: 650,
      organizationType: ["startup", "sme"],
      businessAge: 0,
      sector: ["manufacturing", "services", "trading"]
    },
    description: "Facilitating bank loans for SC/ST and women entrepreneurs",
    benefits: ["Government guarantee", "Lower interest rates", "Credit guarantee coverage"],
    documents: ["Category certificate", "Project report", "Financial statements", "Collateral documents"],
    applicationUrl: "https://www.standupmitra.in/",
    processingTime: "45-60 days",
    features: ["75% credit guarantee", "Handholding support", "Skill development"]
  },

  // Bank Loans
  {
    id: "bank-sbi-1",
    name: "SBI SME Business Loan",
    lender: "State Bank of India",
    lenderType: "bank",
    category: "sme",
    country: "India",
    interestRate: "11.50-16%",
    loanAmount: {
      min: 500000,
      max: 50000000
    },
    repaymentTerm: {
      min: 12,
      max: 84
    },
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
    benefits: ["Competitive rates", "Flexible repayment", "Nationwide presence"],
    documents: ["Financial statements", "ITR", "Bank statements", "Business registration"],
    applicationUrl: "https://sbi.co.in/business-banking/sme",
    processingTime: "7-15 days",
    features: ["Digital application", "Quick processing", "Relationship manager support"]
  },
  {
    id: "bank-hdfc-1",
    name: "HDFC Business Loan",
    lender: "HDFC Bank",
    lenderType: "bank",
    category: "sme",
    country: "India",
    interestRate: "12-18%",
    loanAmount: {
      min: 1000000,
      max: 75000000
    },
    repaymentTerm: {
      min: 12,
      max: 96
    },
    processingFee: "2%",
    collateral: true,
    eligibility: {
      minAge: 23,
      maxAge: 65,
      minIncome: 1000000,
      creditScoreMin: 750,
      organizationType: ["sme", "startup"],
      businessAge: 24,
      sector: ["manufacturing", "trading", "services", "technology"]
    },
    description: "Customized business loans with digital processing",
    benefits: ["Quick approval", "Flexible tenure", "Competitive rates"],
    documents: ["Audited financials", "ITR", "Bank statements", "Project report"],
    applicationUrl: "https://www.hdfcbank.com/business/borrow/business-loan",
    processingTime: "5-10 days",
    features: ["Online application", "Doorstep service", "Pre-approved offers"]
  },
  {
    id: "bank-icici-1",
    name: "ICICI Bank Startup Loan",
    lender: "ICICI Bank",
    lenderType: "bank",
    category: "startup",
    country: "India",
    interestRate: "13-19%",
    loanAmount: {
      min: 2000000,
      max: 100000000
    },
    repaymentTerm: {
      min: 12,
      max: 84
    },
    processingFee: "1.5%",
    collateral: true,
    eligibility: {
      minAge: 25,
      maxAge: 60,
      minIncome: 1500000,
      creditScoreMin: 720,
      organizationType: ["startup"],
      businessAge: 6,
      sector: ["technology", "healthcare", "fintech", "services"]
    },
    description: "Specialized funding for high-growth startups",
    benefits: ["Startup-focused", "Flexible terms", "Industry expertise"],
    documents: ["Pitch deck", "Financial projections", "Founder profiles", "Market analysis"],
    applicationUrl: "https://www.icicibank.com/business-banking/loans/startup-loan",
    processingTime: "10-20 days",
    features: ["Venture debt options", "Growth capital", "Banking ecosystem"]
  },

  // Private Lenders
  {
    id: "private-lendingkart-1",
    name: "LendingKart Business Loan",
    lender: "LendingKart",
    lenderType: "private",
    category: "sme",
    country: "India",
    interestRate: "16-30%",
    loanAmount: {
      min: 200000,
      max: 10000000
    },
    repaymentTerm: {
      min: 6,
      max: 36
    },
    processingFee: "2-4%",
    collateral: false,
    eligibility: {
      minAge: 21,
      maxAge: 65,
      minIncome: 300000,
      creditScoreMin: 650,
      organizationType: ["sme", "startup"],
      businessAge: 6,
      sector: ["manufacturing", "trading", "services", "technology"]
    },
    description: "Fast, unsecured business loans with minimal documentation",
    benefits: ["Quick approval", "Minimal documentation", "Flexible eligibility"],
    documents: ["Bank statements", "GST returns", "Business proof", "Identity proof"],
    applicationUrl: "https://www.lendingkart.com/",
    processingTime: "24-72 hours",
    features: ["100% digital process", "Same day approval", "Flexible repayment"]
  },
  {
    id: "private-capital-float-1",
    name: "Capital Float Business Line of Credit",
    lender: "Capital Float",
    lenderType: "private",
    category: "sme",
    country: "India",
    interestRate: "18-36%",
    loanAmount: {
      min: 100000,
      max: 5000000
    },
    repaymentTerm: {
      min: 3,
      max: 24
    },
    processingFee: "2%",
    collateral: false,
    eligibility: {
      minAge: 21,
      maxAge: 65,
      minIncome: 200000,
      creditScoreMin: 600,
      organizationType: ["sme", "startup"],
      businessAge: 3,
      sector: ["e-commerce", "services", "manufacturing", "trading"]
    },
    description: "Revolving credit line for working capital needs",
    benefits: ["Pay only for amount used", "Instant access", "Revolving credit"],
    documents: ["Bank statements", "GST certificate", "Business registration"],
    applicationUrl: "https://www.capitalfloat.com/",
    processingTime: "1-3 days",
    features: ["Revolving credit", "Instant disbursement", "Flexible usage"]
  },

  // NGO Specific
  {
    id: "gov-ngo-1",
    name: "NGO Partnership System Grant",
    lender: "Ministry of Rural Development",
    lenderType: "government",
    category: "ngo",
    country: "India",
    interestRate: "0%",
    loanAmount: {
      min: 100000,
      max: 5000000
    },
    repaymentTerm: {
      min: 0,
      max: 0
    },
    processingFee: "0%",
    collateral: false,
    eligibility: {
      minAge: 25,
      maxAge: 70,
      minIncome: 0,
      creditScoreMin: 0,
      organizationType: ["ngo"],
      businessAge: 36,
      sector: ["social", "education", "healthcare", "environment"]
    },
    description: "Government grants for registered NGOs working in rural development",
    benefits: ["Grant (no repayment)", "Government support", "Long-term partnership"],
    documents: ["NGO registration", "Audited accounts", "Project proposal", "Impact assessment"],
    applicationUrl: "https://rural.nic.in/",
    processingTime: "90-120 days",
    features: ["No repayment required", "Capacity building support", "Monitoring assistance"]
  },

  // Education Loans
  {
    id: "bank-sbi-education-1",
    name: "SBI Student Loan Scheme",
    lender: "State Bank of India",
    lenderType: "bank",
    category: "education",
    country: "India",
    interestRate: "9.5-11.5%",
    loanAmount: {
      min: 100000,
      max: 15000000
    },
    repaymentTerm: {
      min: 60,
      max: 180
    },
    processingFee: "0%",
    collateral: false,
    eligibility: {
      minAge: 16,
      maxAge: 35,
      minIncome: 200000,
      creditScoreMin: 650,
      organizationType: ["individual", "institution"],
      businessAge: 0,
      sector: ["education"]
    },
    description: "Education loans for higher studies in India and abroad",
    benefits: ["No processing fee", "Moratorium period", "Tax benefits"],
    documents: ["Admission letter", "Cost estimate", "Academic records", "Income proof"],
    applicationUrl: "https://sbi.co.in/personal-banking/loans/education-loans",
    processingTime: "7-14 days",
    features: ["Comprehensive coverage", "Flexible repayment", "Abroad study support"]
  },

  // Agriculture Loans
  {
    id: "gov-kisan-credit-1",
    name: "Kisan Credit Card Scheme",
    lender: "Government of India",
    lenderType: "government",
    category: "agriculture",
    country: "India",
    interestRate: "4-7%",
    loanAmount: {
      min: 25000,
      max: 3000000
    },
    repaymentTerm: {
      min: 12,
      max: 60
    },
    processingFee: "0%",
    collateral: false,
    eligibility: {
      minAge: 18,
      maxAge: 75,
      minIncome: 50000,
      creditScoreMin: 0,
      organizationType: ["individual", "farmer", "cooperative"],
      businessAge: 0,
      sector: ["agriculture", "allied-activities"]
    },
    description: "Flexible credit facility for farmers' cultivation and other needs",
    benefits: ["Subsidized interest", "Flexible repayment", "Insurance coverage"],
    documents: ["Land records", "Identity proof", "Income certificate", "Bank account details"],
    applicationUrl: "https://pmkisan.gov.in/",
    processingTime: "7-15 days",
    features: ["Crop insurance", "ATM facility", "Flexible withdrawal"]
  },

  // More Private Lenders
  {
    id: "private-indifi-1",
    name: "Indifi Supply Chain Finance",
    lender: "Indifi Technologies",
    lenderType: "private",
    category: "sme",
    country: "India",
    interestRate: "14-24%",
    loanAmount: {
      min: 500000,
      max: 20000000
    },
    repaymentTerm: {
      min: 6,
      max: 24
    },
    processingFee: "1-3%",
    collateral: false,
    eligibility: {
      minAge: 21,
      maxAge: 65,
      minIncome: 500000,
      creditScoreMin: 675,
      organizationType: ["sme"],
      businessAge: 12,
      sector: ["manufacturing", "trading", "distribution"]
    },
    description: "Supply chain financing for B2B businesses",
    benefits: ["Supply chain focus", "Quick disbursement", "Vendor financing"],
    documents: ["GST returns", "Purchase orders", "Vendor agreements", "Financial statements"],
    applicationUrl: "https://www.indifi.com/",
    processingTime: "2-5 days",
    features: ["Invoice discounting", "Vendor financing", "Inventory funding"]
  },
  {
    id: "private-razorpay-1",
    name: "Razorpay Capital Business Loan",
    lender: "Razorpay",
    lenderType: "private",
    category: "startup",
    country: "India",
    interestRate: "15-28%",
    loanAmount: {
      min: 500000,
      max: 25000000
    },
    repaymentTerm: {
      min: 6,
      max: 36
    },
    processingFee: "2%",
    collateral: false,
    eligibility: {
      minAge: 21,
      maxAge: 60,
      minIncome: 600000,
      creditScoreMin: 700,
      organizationType: ["startup", "sme"],
      businessAge: 6,
      sector: ["technology", "e-commerce", "services", "fintech"]
    },
    description: "Revenue-based financing for digital businesses",
    benefits: ["Revenue-based repayment", "No equity dilution", "Quick access"],
    documents: ["Bank statements", "Revenue proof", "Business registration", "Razorpay transaction history"],
    applicationUrl: "https://razorpay.com/capital/",
    processingTime: "48-96 hours",
    features: ["Revenue-based model", "Automated underwriting", "Digital-first approach"]
  },

  // International Schemes
  {
    id: "usa-sba-1",
    name: "SBA 7(a) Loan Program",
    lender: "U.S. Small Business Administration",
    lenderType: "government",
    category: "sme",
    country: "United States",
    interestRate: "5-13%",
    loanAmount: {
      min: 500000,
      max: 500000000
    },
    repaymentTerm: {
      min: 12,
      max: 300
    },
    processingFee: "3%",
    collateral: true,
    eligibility: {
      minAge: 18,
      maxAge: 70,
      minIncome: 500000,
      creditScoreMin: 680,
      organizationType: ["sme", "startup"],
      businessAge: 24,
      sector: ["manufacturing", "retail", "services", "technology"]
    },
    description: "Government-backed loans for small businesses in the United States",
    benefits: ["Government guarantee", "Lower down payments", "Flexible terms"],
    documents: ["Business plan", "Financial statements", "Tax returns", "Personal guarantee"],
    applicationUrl: "https://www.sba.gov/funding-programs/loans",
    processingTime: "30-90 days",
    features: ["85% government guarantee", "Competitive rates", "Flexible use of funds"]
  },
  {
    id: "uk-bounce-1",
    name: "Bounce Back Loan Scheme",
    lender: "HM Treasury (UK Government)",
    lenderType: "government",
    category: "sme",
    country: "United Kingdom",
    interestRate: "2.5%",
    loanAmount: {
      min: 200000,
      max: 5000000
    },
    repaymentTerm: {
      min: 72,
      max: 120
    },
    processingFee: "0%",
    collateral: false,
    eligibility: {
      minAge: 18,
      maxAge: 70,
      minIncome: 100000,
      creditScoreMin: 0,
      organizationType: ["sme", "startup"],
      businessAge: 0,
      sector: ["all"]
    },
    description: "COVID-19 recovery loans for small businesses in the UK",
    benefits: ["100% government guarantee", "No personal guarantee", "12-month payment holiday"],
    documents: ["Bank account details", "Business registration", "Self-certification"],
    applicationUrl: "https://www.british-business-bank.co.uk/ourpartners/coronavirus-business-interruption-loan-schemes/bounce-back-loans/",
    processingTime: "1-5 days",
    features: ["Quick approval", "No fees for first 12 months", "Flexible repayment"]
  },
  {
    id: "singapore-startup-1",
    name: "Startup SG Equity",
    lender: "Enterprise Singapore",
    lenderType: "government",
    category: "startup",
    country: "Singapore",
    interestRate: "0%",
    loanAmount: {
      min: 2500000,
      max: 25000000
    },
    repaymentTerm: {
      min: 0,
      max: 0
    },
    processingFee: "0%",
    collateral: false,
    eligibility: {
      minAge: 21,
      maxAge: 65,
      minIncome: 0,
      creditScoreMin: 0,
      organizationType: ["startup"],
      businessAge: 0,
      sector: ["technology", "biotechnology", "clean-tech", "fintech"]
    },
    description: "Co-investment scheme for innovative startups in Singapore",
    benefits: ["Equity investment", "Government co-investment", "Mentorship support"],
    documents: ["Pitch deck", "Business plan", "Founder profiles", "IP documentation"],
    applicationUrl: "https://www.enterprisesg.gov.sg/financial-assistance/grants/for-local-companies/startup-sg-equity",
    processingTime: "60-120 days",
    features: ["Up to 70% co-investment", "Access to ecosystem", "Follow-on funding support"]
  },
  {
    id: "canada-futurpreneur-1",
    name: "Futurpreneur Canada Startup Loan",
    lender: "Futurpreneur Canada",
    lenderType: "government",
    category: "startup",
    country: "Canada",
    interestRate: "6-9%",
    loanAmount: {
      min: 1000000,
      max: 6000000
    },
    repaymentTerm: {
      min: 60,
      max: 120
    },
    processingFee: "0%",
    collateral: false,
    eligibility: {
      minAge: 18,
      maxAge: 39,
      minIncome: 0,
      creditScoreMin: 650,
      organizationType: ["startup"],
      businessAge: 0,
      sector: ["all"]
    },
    description: "Startup financing and mentorship for young entrepreneurs in Canada",
    benefits: ["Mentorship program", "Flexible repayment", "Business resources"],
    documents: ["Business plan", "Personal credit report", "Cash flow projections"],
    applicationUrl: "https://www.futurpreneur.ca/en/financing/startup-financing/",
    processingTime: "30-60 days",
    features: ["2-year mentorship", "Business resources", "Networking opportunities"]
  },
  {
    id: "germany-kfw-1",
    name: "KfW Entrepreneur Loan",
    lender: "KfW Development Bank",
    lenderType: "government",
    category: "startup",
    country: "Germany",
    interestRate: "1-4%",
    loanAmount: {
      min: 2500000,
      max: 25000000
    },
    repaymentTerm: {
      min: 60,
      max: 240
    },
    processingFee: "0%",
    collateral: true,
    eligibility: {
      minAge: 18,
      maxAge: 65,
      minIncome: 300000,
      creditScoreMin: 700,
      organizationType: ["startup", "sme"],
      businessAge: 0,
      sector: ["manufacturing", "technology", "services", "innovation"]
    },
    description: "Low-interest loans for startups and SMEs in Germany",
    benefits: ["Subsidized interest rates", "Long repayment terms", "Flexible collateral"],
    documents: ["Business plan", "Financial projections", "Founder qualifications", "Market analysis"],
    applicationUrl: "https://www.kfw.de/inlandsfoerderung/Unternehmen/Gr%C3%BCnden-Nachfolgen/",
    processingTime: "45-90 days",
    features: ["Government subsidy", "Advisory services", "Liability relief"]
  }
];

// Utility functions for loan data
export const getLoansByCategory = (category) => {
  return loanData.filter(loan => loan.category === category);
};

export const getLoansByLenderType = (type) => {
  return loanData.filter(loan => loan.lenderType === type);
};

export const searchLoans = (query) => {
  const searchTerm = query.toLowerCase();
  return loanData.filter(loan => 
    loan.name.toLowerCase().includes(searchTerm) ||
    loan.lender.toLowerCase().includes(searchTerm) ||
    loan.description.toLowerCase().includes(searchTerm) ||
    loan.category.toLowerCase().includes(searchTerm)
  );
};

export const filterLoansByEligibility = (userProfile) => {
  return loanData.filter(loan => {
    const { eligibility } = loan;
    
    // Age check
    if (userProfile.age < eligibility.minAge || userProfile.age > eligibility.maxAge) {
      return false;
    }
    
    // Income check
    if (userProfile.income < eligibility.minIncome) {
      return false;
    }
    
    // Credit score check
    if (userProfile.creditScore < eligibility.creditScoreMin) {
      return false;
    }
    
    // Organization type check
    if (!eligibility.organizationType.includes(userProfile.organizationType)) {
      return false;
    }
    
    // Business age check (in months)
    if (userProfile.businessAge < eligibility.businessAge) {
      return false;
    }
    
    // Sector check
    if (!eligibility.sector.includes(userProfile.sector)) {
      return false;
    }
    
    return true;
  });
};

export const categories = [
  { id: 'startup', name: 'Startup', description: 'Funding for new businesses and innovative ventures' },
  { id: 'sme', name: 'SME', description: 'Loans for small and medium enterprises' },
  { id: 'ngo', name: 'NGO', description: 'Grants and funding for non-profit organizations' },
  { id: 'education', name: 'Education', description: 'Educational loans for institutions and individuals' },
  { id: 'agriculture', name: 'Agriculture', description: 'Loans for farmers and agricultural businesses' }
];

export const lenderTypes = [
  { id: 'government', name: 'Government Schemes', description: 'Government-backed loans and grants' },
  { id: 'bank', name: 'Banks', description: 'Traditional bank loans and credit facilities' },
  { id: 'private', name: 'Private Lenders', description: 'Private financial institutions and fintech companies' }
];

export const getUniqueCountries = () => {
  const countries = [...new Set(loanData.map(loan => loan.country))];
  return countries.sort();
};

export const getLoansByCountry = (country) => {
  return loanData.filter(loan => loan.country === country);
};
