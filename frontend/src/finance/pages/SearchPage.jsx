import React, { useEffect, useState } from 'react';
import { Search, Filter, Heart, Plus, ExternalLink, Globe, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock loan data - replace with actual API call
const loanData = [
  {
    id: "gov-startup-india-1",
    name: "Startup India Seed Fund Scheme",
    lender: "Government of India",
    lenderType: "government",
    category: "startup",
    country: "India",
    interestRate: "0%",
    loanAmount: { min: 500000, max: 50000000 },
    processingFee: "0%",
    collateral: false,
    description: "Government seed funding for early-stage startups with innovative business ideas",
    processingTime: "60-90 days",
    applicationUrl: "https://seedfund.startupindia.gov.in/"
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
    processingFee: "0%",
    collateral: false,
    description: "Micro-credit for small businesses and entrepreneurs",
    processingTime: "15-30 days",
    applicationUrl: "https://www.mudra.org.in/"
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
    processingFee: "1%",
    collateral: true,
    description: "Comprehensive business financing solution for SMEs",
    processingTime: "7-15 days",
    applicationUrl: "https://sbi.co.in/business-banking/sme"
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
    processingFee: "2%",
    collateral: true,
    description: "Customized business loans with digital processing",
    processingTime: "5-10 days",
    applicationUrl: "https://www.hdfcbank.com/business/"
  },
  {
    id: "private-lendingkart-1",
    name: "LendingKart Business Loan",
    lender: "LendingKart",
    lenderType: "private",
    category: "sme",
    country: "India",
    interestRate: "16-30%",
    loanAmount: { min: 200000, max: 10000000 },
    processingFee: "2-4%",
    collateral: false,
    description: "Fast, unsecured business loans with minimal documentation",
    processingTime: "24-72 hours",
    applicationUrl: "https://www.lendingkart.com/"
  },
  {
    id: "bank-icici-1",
    name: "ICICI Bank Startup Loan",
    lender: "ICICI Bank",
    lenderType: "bank",
    category: "startup",
    country: "India",
    interestRate: "13-19%",
    loanAmount: { min: 2000000, max: 100000000 },
    processingFee: "1.5%",
    collateral: true,
    description: "Specialized funding for high-growth startups",
    processingTime: "10-20 days",
    applicationUrl: "https://www.icicibank.com/business-banking/loans/startup-loan"
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
    processingFee: "3%",
    collateral: true,
    description: "Government-backed loans for small businesses",
    processingTime: "30-90 days",
    applicationUrl: "https://www.sba.gov/funding-programs/loans"
  },
  {
    id: "gov-kisan-1",
    name: "Kisan Credit Card Scheme",
    lender: "Government of India",
    lenderType: "government",
    category: "agriculture",
    country: "India",
    interestRate: "4-7%",
    loanAmount: { min: 25000, max: 3000000 },
    processingFee: "0%",
    collateral: false,
    description: "Flexible credit facility for farmers' cultivation needs",
    processingTime: "7-15 days",
    applicationUrl: "https://pmkisan.gov.in/"
  }
];

const SearchPage = () => {
  const [filteredLoans, setFilteredLoans] = useState(loanData);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [savedLoans, setSavedLoans] = useState([]);
  const [comparisonList, setComparisonList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState({
    country: '',
    category: '',
    lenderType: '',
    minAmount: '',
    maxAmount: '',
    maxInterestRate: '',
    collateralRequired: ''
  });

  const categories = [
    { id: 'startup', name: 'Startup' },
    { id: 'sme', name: 'SME' },
    { id: 'agriculture', name: 'Agriculture' },
    { id: 'education', name: 'Education' }
  ];

  const lenderTypes = [
    { id: 'government', name: 'Government' },
    { id: 'bank', name: 'Bank' },
    { id: 'private', name: 'Private Lender' }
  ];

  const countries = ['India', 'United States', 'United Kingdom'];

  // ✅ Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery]);

  const applyFilters = () => {
    let filtered = [...loanData];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(loan =>
        loan.name.toLowerCase().includes(query) ||
        loan.lender.toLowerCase().includes(query) ||
        loan.description.toLowerCase().includes(query)
      );
    }

    // Country filter
    if (filters.country) {
      filtered = filtered.filter(loan => loan.country === filters.country);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(loan => loan.category === filters.category);
    }

    // Lender type filter
    if (filters.lenderType) {
      filtered = filtered.filter(loan => loan.lenderType === filters.lenderType);
    }

    // Min amount filter
    if (filters.minAmount) {
      const minAmt = parseInt(filters.minAmount);
      filtered = filtered.filter(loan => loan.loanAmount.max >= minAmt);
    }

    // Max amount filter
    if (filters.maxAmount) {
      const maxAmt = parseInt(filters.maxAmount);
      filtered = filtered.filter(loan => loan.loanAmount.min <= maxAmt);
    }

    // Collateral filter
    if (filters.collateralRequired !== '') {
      const needsCollateral = filters.collateralRequired === 'true';
      filtered = filtered.filter(loan => loan.collateral === needsCollateral);
    }

    setFilteredLoans(filtered);
    console.log('🎯 Filtered:', filtered.length, 'loans');
  };

  const clearFilters = () => {
    setFilters({
      country: '',
      category: '',
      lenderType: '',
      minAmount: '',
      maxAmount: '',
      maxInterestRate: '',
      collateralRequired: ''
    });
    setSearchQuery('');
    setShowFilters(false);
  };

  const formatAmount = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  const handleSaveLoan = (loanId) => {
    setSavedLoans(prev =>
      prev.includes(loanId) ? prev.filter(id => id !== loanId) : [...prev, loanId]
    );
  };

  const handleAddComparison = (loanId) => {
    setComparisonList(prev => {
      if (prev.includes(loanId)) {
        return prev.filter(id => id !== loanId);
      } else if (prev.length < 4) {
        return [...prev, loanId];
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg sticky top-0 z-30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-white mb-2">Find Your Perfect Loan</h1>
          <p className="text-blue-100">Showing {filteredLoans.length} loans</p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search loans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white"
              />
            </div>

            {/* Country Select */}
            <select
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none bg-white font-medium"
            >
              <option value="">All Countries</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Filter Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                showFilters
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border-2 border-gray-200 text-gray-700'
              }`}
            >
              <Filter size={20} />
              More Filters
            </motion.button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                    >
                      <option value="">All</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Lender Type</label>
                    <select
                      value={filters.lenderType}
                      onChange={(e) => setFilters({ ...filters, lenderType: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                    >
                      <option value="">All</option>
                      {lenderTypes.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Min Amount (₹)</label>
                    <input
                      type="number"
                      value={filters.minAmount}
                      onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                      placeholder="100000"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Max Amount (₹)</label>
                    <input
                      type="number"
                      value={filters.maxAmount}
                      onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                      placeholder="50000000"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">Collateral</label>
                    <select
                      value={filters.collateralRequired}
                      onChange={(e) => setFilters({ ...filters, collateralRequired: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                    >
                      <option value="">Any</option>
                      <option value="false">No Collateral</option>
                      <option value="true">Collateral Required</option>
                    </select>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
                >
                  Clear All Filters
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Loan Cards Grid */}
        {filteredLoans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-md p-12 text-center"
          >
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No loans found</h3>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold mt-4"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredLoans.map((loan, idx) => (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col"
              >
                {/* Header */}
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{loan.name}</h3>
                      <p className="text-sm text-gray-600">{loan.lender}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleSaveLoan(loan.id)}
                      className={`p-2 rounded-lg ${
                        savedLoans.includes(loan.id)
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Heart size={18} fill={savedLoans.includes(loan.id) ? 'currentColor' : 'none'} />
                    </motion.button>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {loan.category.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {loan.country}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-grow space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{loan.description}</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 font-medium">Interest</p>
                      <p className="text-lg font-bold text-blue-600">{loan.interestRate}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 font-medium">Processing</p>
                      <p className="text-sm font-bold text-green-600">{loan.processingTime}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-medium mb-1">Amount</p>
                    <p className="text-sm font-bold text-gray-800">
                      {formatAmount(loan.loanAmount.min)} - {formatAmount(loan.loanAmount.max)}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={() => alert('Loan details - ' + loan.name)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400"
                  >
                    Details
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleAddComparison(loan.id)}
                    disabled={!comparisonList.includes(loan.id) && comparisonList.length >= 4}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                      comparisonList.includes(loan.id)
                        ? 'bg-blue-600 text-white'
                        : comparisonList.length >= 4
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Plus size={16} />
                    {comparisonList.includes(loan.id) ? 'Added' : 'Compare'}
                  </motion.button>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    href={loan.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Apply
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Comparison Bar */}
        <AnimatePresence>
          {comparisonList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-blue-600 shadow-2xl"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-gray-800 font-semibold">
                  {comparisonList.length} loans selected
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setComparisonList([])}
                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => alert('Compare loans - ' + comparisonList.length)}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                  >
                    Compare Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchPage;