// frontend/src/contexts/LoanContext.jsx
import React, { createContext, useReducer, useCallback, useEffect } from 'react';
import api from '../axios/axiosInstance';
import { loanData } from '../finance/data/loans'; // ✅ CORRECT IMPORT PATH

export const LoanContext = createContext();

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL + '/api';

const initialState = {
  loans: [], // Start with empty array, will be populated with fallback data
  filteredLoans: [],
  searchQuery: '',
  filters: {
    country: '',
    category: '',
    lenderType: '',
    minAmount: '',
    maxAmount: '',
    collateralRequired: '',
    maxInterestRate: ''
  },
  savedLoans: [],
  comparisonList: [],
  loading: false,
  error: null,
  stats: null
};

const loanReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_LOANS':
      return {
        ...state,
        loans: action.payload,
        loading: false,
        error: null
      };
    
    case 'SET_FILTERED_LOANS':
      return {
        ...state,
        filteredLoans: action.payload
      };
    
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialState.filters,
        searchQuery: ''
      };
    
    case 'SAVE_LOAN':
      if (!state.savedLoans.includes(action.payload)) {
        return {
          ...state,
          savedLoans: [...state.savedLoans, action.payload]
        };
      }
      return state;
    
    case 'REMOVE_SAVED_LOAN':
      return {
        ...state,
        savedLoans: state.savedLoans.filter(id => id !== action.payload)
      };
    
    case 'ADD_TO_COMPARISON':
      if (state.comparisonList.length < 4 && !state.comparisonList.includes(action.payload)) {
        return {
          ...state,
          comparisonList: [...state.comparisonList, action.payload]
        };
      }
      return state;
    
    case 'REMOVE_FROM_COMPARISON':
      return {
        ...state,
        comparisonList: state.comparisonList.filter(id => id !== action.payload)
      };
    
    case 'CLEAR_COMPARISON':
      return {
        ...state,
        comparisonList: []
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload
      };
    
    default:
      return state;
  }
};

export const LoanProvider = ({ children }) => {
  const [state, dispatch] = useReducer(loanReducer, initialState);

  // ✅ FETCH LOANS FROM BACKEND (WITH FALLBACK TO MOCK DATA)
  const fetchLoans = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Build query params
      const params = {};
      if (state.filters.country) params.country = state.filters.country;
      if (state.filters.category) params.category = state.filters.category;
      if (state.filters.lenderType) params.lenderType = state.filters.lenderType;
      if (state.filters.minAmount) params.minAmount = state.filters.minAmount;
      if (state.filters.maxAmount) params.maxAmount = state.filters.maxAmount;
      if (state.filters.collateralRequired) params.collateralRequired = state.filters.collateralRequired;
      params.limit = 1000;

      console.log('📡 Fetching loans from backend...');
      const response = await api.get('/loans', { params });
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('✅ Loans fetched successfully from backend:', response.data.data.length);
        dispatch({ type: 'SET_LOANS', payload: response.data.data });
      } else {
        throw new Error('Invalid response format from backend');
      }
    } catch (error) {
      console.warn('⚠️ Backend fetch failed, using mock data:', error.message);
      // ✅ FALLBACK TO MOCK DATA - THIS IS THE KEY FIX
      console.log('📦 Loading mock loan data, count:', loanData.length);
      dispatch({ type: 'SET_LOANS', payload: loanData });
    }
  }, [state.filters]);

  // ✅ FETCH STATS FROM BACKEND
  const fetchStats = useCallback(async () => {
    try {
      console.log('📡 Fetching stats from backend...');
      const response = await api.get('/analytics/stats');
      
      if (response.data && response.data.data) {
        console.log('✅ Stats fetched successfully');
        dispatch({ type: 'SET_STATS', payload: response.data.data });
      }
    } catch (error) {
      console.warn('⚠️ Stats fetch failed:', error.message);
      // Stats failure is not critical
    }
  }, []);

  // ✅ TRACK LOAN APPLICATION
  const trackLoanApplication = useCallback(async (loan) => {
    try {
      const sessionId = sessionStorage.getItem('sessionId') || 
                       `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      if (!sessionStorage.getItem('sessionId')) {
        sessionStorage.setItem('sessionId', sessionId);
      }

      console.log('📡 Tracking loan application...');
      await api.post('/track-application', {
        loanId: loan.id,
        loanName: loan.name,
        lender: loan.lender,
        country: loan.country,
        category: loan.category,
        lenderType: loan.lenderType,
        applicationUrl: loan.applicationUrl
      }, {
        headers: {
          'x-session-id': sessionId
        }
      });

      console.log('✅ Application tracked');
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('❌ Error tracking application:', error);
    }
  }, [fetchStats]);

  // ✅ FETCH ON MOUNT
  useEffect(() => {
    console.log('🚀 LoanProvider mounted - fetching initial data...');
    fetchLoans();
    fetchStats();
  }, []);

  // ✅ FILTER LOANS WHENEVER LOANS, SEARCH QUERY, OR FILTERS CHANGE
  useEffect(() => {
    filterLoans();
  }, [state.loans, state.searchQuery, state.filters]);

  // ✅ FILTER LOGIC
  const filterLoans = useCallback(() => {
    let filtered = [...state.loans];

    // Search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(loan =>
        loan.name.toLowerCase().includes(query) ||
        loan.lender.toLowerCase().includes(query) ||
        (loan.description && loan.description.toLowerCase().includes(query)) ||
        (loan.country && loan.country.toLowerCase().includes(query))
      );
    }

    // Country filter
    if (state.filters.country) {
      filtered = filtered.filter(loan => loan.country === state.filters.country);
    }

    // Category filter
    if (state.filters.category) {
      filtered = filtered.filter(loan => loan.category === state.filters.category);
    }

    // Lender type filter
    if (state.filters.lenderType) {
      filtered = filtered.filter(loan => loan.lenderType === state.filters.lenderType);
    }

    // Min amount filter
    if (state.filters.minAmount) {
      const minAmount = parseFloat(state.filters.minAmount);
      filtered = filtered.filter(loan => loan.loanAmount && loan.loanAmount.max >= minAmount);
    }

    // Max amount filter
    if (state.filters.maxAmount) {
      const maxAmount = parseFloat(state.filters.maxAmount);
      filtered = filtered.filter(loan => loan.loanAmount && loan.loanAmount.min <= maxAmount);
    }

    // Collateral filter
    if (state.filters.collateralRequired !== '') {
      const requiresCollateral = state.filters.collateralRequired === 'true';
      filtered = filtered.filter(loan => loan.collateral === requiresCollateral);
    }

    // Interest rate filter
    if (state.filters.maxInterestRate) {
      const maxRate = parseFloat(state.filters.maxInterestRate);
      filtered = filtered.filter(loan => {
        if (loan.interestRate === '0%') return true;
        const rate = parseFloat(loan.interestRate.split('-')[0]);
        return rate <= maxRate;
      });
    }

    console.log('🔍 Filtered loans count:', filtered.length);
    dispatch({ type: 'SET_FILTERED_LOANS', payload: filtered });
  }, [state.loans, state.searchQuery, state.filters]);

  const value = {
    ...state,
    dispatch,
    filterLoans,
    fetchLoans,
    fetchStats,
    trackLoanApplication
  };

  return (
    <LoanContext.Provider value={value}>
      {children}
    </LoanContext.Provider>
  );
};

export const useLoan = () => {
  const context = React.useContext(LoanContext);
  if (!context) {
    throw new Error('useLoan must be used within LoanProvider');
  }
  return context;
};