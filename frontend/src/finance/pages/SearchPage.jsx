// frontend/src/finance/pages/SearchPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, X, Plus, Heart, ExternalLink, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../axios/axiosInstance';
import { useLoan } from '../../contexts/LoanContext';
import { categories, lenderTypes, getUniqueCountries } from '../data/loans';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [countries, setCountries] = useState([]);
  const countryDropdownRef = useRef(null);
  
  const {
    filteredLoans,
    searchQuery,
    filters,
    dispatch,
    comparisonList,
    savedLoans,
    loading,
    fetchLoans
  } = useLoan();

  // ✅ FETCH COUNTRIES ON MOUNT
  useEffect(() => {
    fetchCountries();
  }, []);

  // ✅ APPLY CATEGORY/LENDER FROM URL PARAMS
  useEffect(() => {
    const category = searchParams.get('category');
    const lenderType = searchParams.get('lenderType');
    
    if (category) {
      console.log('📍 Setting category from URL:', category);
      dispatch({ type: 'SET_FILTERS', payload: { category } });
    }
    if (lenderType) {
      console.log('📍 Setting lender type from URL:', lenderType);
      dispatch({ type: 'SET_FILTERS', payload: { lenderType } });
    }
  }, [searchParams, dispatch]);

  // ✅ CLOSE DROPDOWNS ON CLICK OUTSIDE
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

  // ✅ FETCH COUNTRIES FROM BACKEND
  const fetchCountries = async () => {
    try {
      console.log('📡 Fetching countries from backend...');
      const response = await api.get('/countries');
      
      if (response.data?.data) {
        console.log('✅ Countries fetched:', response.data.data);
        setCountries(response.data.data);
      } else {
        // Fallback to mock countries
        setCountries(getUniqueCountries());
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch countries, using mock:', error.message);
      setCountries(getUniqueCountries());
    }
  };

  // ✅ SEARCH HANDLER
  const handleSearchChange = (e) => {
    const query = e.target.value;
    console.log('🔍 Searching for:', query);
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  // ✅ FILTER CHANGE HANDLER
  const handleFilterChange = (filterName, value) => {
    console.log(`🔧 Filter changed - ${filterName}:`, value);
    dispatch({ type: 'SET_FILTERS', payload: { [filterName]: value } });
  };

  // ✅ CLEAR ALL FILTERS
  const clearFilters = () => {
    console.log('🧹 Clearing all filters');
    dispatch({ type: 'RESET_FILTERS' });
    setShowFilterPanel(false);
  };

  // ✅ COMPARISON HANDLERS
  const addToComparison = (loanId) => {
    if (comparisonList.length < 4 && !comparisonList.includes(loanId)) {
      console.log('➕ Added to comparison:', loanId);
      dispatch({ type: 'ADD_TO_COMPARISON', payload: loanId });
    }
  };

  const removeFromComparison = (loanId) => {
    console.log('➖ Removed from comparison:', loanId);
    dispatch({ type: 'REMOVE_FROM_COMPARISON', payload: loanId });
  };

  // ✅ SAVE LOAN HANDLER
  const toggleSaveLoan = (loanId) => {
    if (savedLoans.includes(loanId)) {
      console.log('💔 Unsaved loan:', loanId);
      dispatch({ type: 'REMOVE_SAVED_LOAN', payload: loanId });
    } else {
      console.log('❤️ Saved loan:', loanId);
      dispatch({ type: 'SAVE_LOAN', payload: loanId });
    }
  };

  // ✅ FORMAT AMOUNT
  const formatAmount = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  // ✅ TRACK APPLICATION
  const handleApplyClick = async (loan, e) => {
    console.log('📤 User clicked apply for:', loan.name);
    // Application tracking happens in context
  };

  const handleCountrySelect = (country) => {
    console.log('🌍 Selected country:', country);
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

  // ✅ RENDER
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
              />
            </div>

            {/* Country Button */}
            <motion.button 
              onClick={toggleCountryDropdown}
              className={`px-4 py-3 rounded-lg border-2 font-medium flex items-center gap-2 whitespace-nowrap transition-all ${
                showCountryDropdown
                  ? 'bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              <Globe size={18} />
              <span className="hidden sm:inline">{getSelectedCountryLabel()}</span>
              <motion.div
                animate={{ rotate: showCountryDropdown ? 180 : 0 }}
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
                    >
                      <span className="text-xl">🌍</span>
                      <span>All Countries</span>
                    </motion.button>
                    {countries.map(country => (
                      <motion.button
                        key={country}
                        onClick={() => handleCountrySelect(country)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          filters.country === country
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{country}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilterPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {[
                      { label: 'Category', name: 'category', type: 'select', options: categories },
                      { label: 'Lender Type', name: 'lenderType', type: 'select', options: lenderTypes },
                      { label: 'Min Amount (₹)', name: 'minAmount', type: 'number' },
                      { label: 'Max Amount (₹)', name: 'maxAmount', type: 'number' },
                      { label: 'Max Interest (%)', name: 'maxInterestRate', type: 'number' },
                      { label: 'Collateral', name: 'collateralRequired', type: 'collateral' }
                    ].map((filter) => (
                      <div key={filter.name} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{filter.label}</label>
                        {filter.type === 'select' ? (
                          <select
                            value={filters[filter.name]}
                            onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                          >
                            <option value="">Any</option>
                            <option value="false">No Collateral</option>
                            <option value="true">Collateral Required</option>
                          </select>
                        ) : (
                          <input
                            type={filter.type}
                            value={filters[filter.name]}
                            onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <motion.button 
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
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
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <Search size={48} className="text-blue-400" />
              </div>
              <p className="text-gray-600 mt-4 font-semibold">Loading loans...</p>
            </div>
          ) : filteredLoans.length === 0 ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-md border border-gray-100"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Filter size={48} className="text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No loans found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
              <motion.button 
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
              >
                Clear All Filters
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredLoans.map((loan) => (
                <motion.div
                  key={loan.id}
                  whileHover={{ y: -8 }}
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
                        >
                          <Plus size={18} />
                        </motion.button>
                      </div>
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
                        <p className="text-xs text-gray-600 font-medium">Processing</p>
                        <p className="text-lg font-bold text-indigo-600">{loan.processingTime}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{loan.description}</p>
                  </div>

                  {/* Loan Footer */}
                  <div className="p-5 border-t border-gray-100 flex gap-3">
                    <Link 
                      to={`/loan/${loan.id}`} 
                      className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-all text-center"
                    >
                      Details
                    </Link>
                    <motion.a
                      href={loan.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleApplyClick(loan, e)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Apply
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
              className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-600 shadow-2xl"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-800 font-semibold">
                    {comparisonList.length} loan(s) selected
                  </span>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => dispatch({ type: 'CLEAR_COMPARISON' })}
                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-all"
                  >
                    Clear
                  </motion.button>
                  <Link
                    to="/compare"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
                  >
                    Compare
                  </Link>
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