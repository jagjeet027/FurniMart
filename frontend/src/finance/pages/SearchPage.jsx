import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, X, Plus, Heart, ExternalLink, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoan } from '../../contexts/LoanContext';
import { categories, lenderTypes, getUniqueCountries } from '../data/loans';
import { trackLoanApplication } from '../services/apiService';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const countryDropdownRef = useRef(null);
  const {
    filteredLoans,
    searchQuery,
    filters,
    dispatch,
    comparisonList,
    savedLoans
  } = useLoan();

  useEffect(() => {
    const category = searchParams.get('category');
    const lenderType = searchParams.get('lenderType');
    
    if (category) {
      dispatch({ type: 'SET_FILTERS', payload: { category } });
    }
    if (lenderType) {
      dispatch({ type: 'SET_FILTERS', payload: { lenderType } });
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
        setShowFilterPanel(false);
      }
    };

    if (showCountryDropdown || showFilterPanel) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showCountryDropdown, showFilterPanel]);

  const handleSearchChange = (e) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value });
  };

  const handleFilterChange = (filterName, value) => {
    dispatch({ type: 'SET_FILTERS', payload: { [filterName]: value } });
  };

  const clearFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  const addToComparison = (loanId) => {
    if (comparisonList.length < 4 && !comparisonList.includes(loanId)) {
      dispatch({ type: 'ADD_TO_COMPARISON', payload: loanId });
    }
  };

  const removeFromComparison = (loanId) => {
    dispatch({ type: 'REMOVE_FROM_COMPARISON', payload: loanId });
  };

  const toggleSaveLoan = (loanId) => {
    if (savedLoans.includes(loanId)) {
      dispatch({ type: 'REMOVE_SAVED_LOAN', payload: loanId });
    } else {
      dispatch({ type: 'SAVE_LOAN', payload: loanId });
    }
  };

  const formatAmount = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  const handleApplyClick = async (loan, e) => {
    await trackLoanApplication(loan);
  };

  const handleCountrySelect = (country) => {
    handleFilterChange('country', country);
    setShowCountryDropdown(false);
  };

  const toggleCountryDropdown = () => {
    setShowCountryDropdown(!showCountryDropdown);
    setShowFilterPanel(false);
  };

  const toggleFilterPanel = () => {
    setShowFilterPanel(!showFilterPanel);
    setShowCountryDropdown(false);
  };

  const getSelectedCountryLabel = () => {
    return filters.country || 'All Countries';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-3">
            Find Your Perfect Loan
          </h1>
          <p className="text-lg text-gray-600">
            Search and filter through <span className="font-semibold text-blue-600">{filteredLoans.length}</span> loan options
          </p>
        </motion.div>

        {/* Search Controls */}
        <motion.div 
          className="space-y-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Main Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3" ref={countryDropdownRef}>
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={20} />
              </div>
              <motion.input
                type="text"
                placeholder="Search loans by name, lender, or description..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white shadow-sm hover:shadow-md transition-shadow text-gray-700 placeholder-gray-500"
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>

            {/* Country Globe Button */}
            <motion.button 
              onClick={toggleCountryDropdown}
              className={`px-4 py-3 rounded-lg border-2 font-medium flex items-center gap-2 whitespace-nowrap transition-all ${
                showCountryDropdown
                  ? 'bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Select Country"
            >
              <Globe size={18} />
              <span className="hidden sm:inline">{getSelectedCountryLabel()}</span>
              <motion.div
                animate={{ rotate: showCountryDropdown ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={16} />
              </motion.div>
            </motion.button>

            {/* Filter Button */}
            <motion.button 
              onClick={toggleFilterPanel}
              className={`px-4 py-3 rounded-lg border-2 font-medium flex items-center gap-2 whitespace-nowrap transition-all ${
                showFilterPanel
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Filters"
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filters</span>
            </motion.button>

            {/* Country Dropdown */}
            <AnimatePresence>
              {showCountryDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 sm:left-auto sm:w-80 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-4"
                >
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <Globe size={18} className="text-blue-600" />
                    <span className="font-semibold text-gray-800">Select Country</span>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    <motion.button
                      onClick={() => handleCountrySelect('')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        !filters.country
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <span className="text-xl">🌍</span>
                      <span>All Countries</span>
                    </motion.button>
                    {getUniqueCountries().map(country => (
                      <motion.button
                        key={country}
                        onClick={() => handleCountrySelect(country)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          filters.country === country
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        whileHover={{ x: 4 }}
                      >
                        <span className="text-xl">
                          {country === 'India' ? '🇮🇳' :
                           country === 'United States' ? '🇺🇸' :
                           country === 'United Kingdom' ? '🇬🇧' :
                           country === 'Canada' ? '🇨🇦' :
                           country === 'Germany' ? '🇩🇪' :
                           country === 'Singapore' ? '🇸🇬' : '🏴'}
                        </span>
                        <span>{country}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Collapsible Filter Panel */}
          <AnimatePresence>
            {showFilterPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Filter size={18} className="text-indigo-600" />
                      <span className="font-semibold text-gray-800">Filter Options</span>
                    </div>
                    <motion.button 
                      onClick={() => setShowFilterPanel(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={18} className="text-gray-500" />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {[
                      { label: 'Category', name: 'category', type: 'select', options: categories },
                      { label: 'Lender Type', name: 'lenderType', type: 'select', options: lenderTypes },
                      { label: 'Min Amount (₹)', name: 'minAmount', type: 'number', placeholder: 'e.g., 100000' },
                      { label: 'Max Amount (₹)', name: 'maxAmount', type: 'number', placeholder: 'e.g., 5000000' },
                      { label: 'Max Interest Rate (%)', name: 'maxInterestRate', type: 'number', placeholder: 'e.g., 15' },
                      { label: 'Collateral', name: 'collateralRequired', type: 'collateral' }
                    ].map((filter, idx) => (
                      <motion.div 
                        key={filter.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="space-y-2"
                      >
                        <label className="block text-sm font-medium text-gray-700">{filter.label}</label>
                        {filter.type === 'select' ? (
                          <select
                            value={filters[filter.name]}
                            onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white text-gray-700 transition-all"
                          >
                            <option value="">{filter.name === 'category' ? 'All Categories' : 'All Lenders'}</option>
                            {filter.options.map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.name}</option>
                            ))}
                          </select>
                        ) : filter.type === 'collateral' ? (
                          <select
                            value={filters.collateralRequired}
                            onChange={(e) => handleFilterChange('collateralRequired', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white text-gray-700 transition-all"
                          >
                            <option value="">Any</option>
                            <option value="false">No Collateral Required</option>
                            <option value="true">Collateral Required</option>
                          </select>
                        ) : (
                          <input
                            type={filter.type}
                            placeholder={filter.placeholder}
                            value={filters[filter.name]}
                            onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-700 transition-all"
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <motion.button 
                    onClick={clearFilters} 
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X size={16} />
                    Clear All Filters
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results */}
        <div className="mb-8">
          {filteredLoans.length === 0 ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-md border border-gray-100"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Filter size={48} className="text-gray-300 mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No loans found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
              <motion.button 
                onClick={clearFilters} 
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear All Filters
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {filteredLoans.map((loan, idx) => (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col hover:border-blue-200 transition-colors"
                >
                  {/* Loan Header */}
                  <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{loan.name}</h3>
                        <p className="text-sm text-gray-600">{loan.lender}</p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => toggleSaveLoan(loan.id)}
                          className={`p-2 rounded-lg transition-all ${
                            savedLoans.includes(loan.id)
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title={savedLoans.includes(loan.id) ? 'Remove from saved' : 'Save loan'}
                        >
                          <Heart size={18} fill={savedLoans.includes(loan.id) ? 'currentColor' : 'none'} />
                        </motion.button>
                        <motion.button
                          onClick={() => 
                            comparisonList.includes(loan.id) 
                              ? removeFromComparison(loan.id)
                              : addToComparison(loan.id)
                          }
                          disabled={!comparisonList.includes(loan.id) && comparisonList.length >= 4}
                          className={`p-2 rounded-lg transition-all ${
                            comparisonList.includes(loan.id)
                              ? 'bg-blue-100 text-blue-600'
                              : comparisonList.length >= 4
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          whileHover={comparisonList.length < 4 || comparisonList.includes(loan.id) ? { scale: 1.1 } : {}}
                          whileTap={comparisonList.length < 4 || comparisonList.includes(loan.id) ? { scale: 0.9 } : {}}
                          title={
                            comparisonList.includes(loan.id) 
                              ? 'Remove from comparison' 
                              : comparisonList.length >= 4 
                                ? 'Maximum 4 loans can be compared'
                                : 'Add to comparison'
                          }
                        >
                          <Plus size={18} />
                        </motion.button>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {loan.lenderType.charAt(0).toUpperCase() + loan.lenderType.slice(1)}
                      </span>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                        {loan.category.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                        {loan.country}
                      </span>
                    </div>
                  </div>

                  {/* Loan Details */}
                  <div className="p-5 flex-grow space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 font-medium">Interest Rate</p>
                        <p className="text-lg font-bold text-blue-600">{loan.interestRate}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 font-medium">Processing Time</p>
                        <p className="text-lg font-bold text-indigo-600">{loan.processingTime}</p>
                      </div>
                      <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 font-medium mb-1">Amount Range</p>
                        <p className="text-sm font-bold text-gray-800">
                          {formatAmount(loan.loanAmount.min)} - {formatAmount(loan.loanAmount.max)}
                        </p>
                      </div>
                      <div className="col-span-2 bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 font-medium mb-1">Collateral</p>
                        <p className={`text-sm font-bold ${loan.collateral ? 'text-red-600' : 'text-green-600'}`}>
                          {loan.collateral ? '✓ Required' : '✓ Not Required'}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 line-clamp-2">{loan.description}</p>

                    <div>
                      <h4 className="text-sm font-bold text-gray-800 mb-2">Key Benefits:</h4>
                      <ul className="space-y-1">
                        {loan.benefits.slice(0, 3).map((benefit, index) => (
                          <li key={index} className="text-xs text-gray-600 flex gap-2">
                            <span className="text-blue-500 font-bold">•</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Loan Footer */}
                  <div className="p-5 border-t border-gray-100 flex gap-3">
                    <Link 
                      to={`/loan/${loan.id}`} 
                      className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-all text-center"
                    >
                      View Details
                    </Link>
                    <motion.a
                      href={loan.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleApplyClick(loan, e)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ExternalLink size={16} />
                      Apply Now
                    </motion.a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Comparison Bar */}
        <AnimatePresence>
          {comparisonList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-600 shadow-2xl"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-3 h-3 bg-blue-600 rounded-full"
                  />
                  <span className="text-gray-800 font-semibold">
                    {comparisonList.length} loan{comparisonList.length > 1 ? 's' : ''} selected for comparison
                  </span>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => dispatch({ type: 'CLEAR_COMPARISON' })}
                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear All
                  </motion.button>
                  <motion.button
                    as={Link}
                    to="/compare"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Compare Selected
                  </motion.button>
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