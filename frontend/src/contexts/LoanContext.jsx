// frontend/src/contexts/LoanContext.jsx
import React, { createContext, useReducer, useCallback, useEffect } from 'react';
import axios from 'axios';

export const LoanContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const initialState = {
  loans: [],
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

  // Fetch loans from backend on mount
  useEffect(() => {
    fetchLoans();
    fetchStats();
  }, []);

  // Filter loans whenever loans, search query, or filters change
  useEffect(() => {
    filterLoans();
  }, [state.loans, state.searchQuery, state.filters]);

  const fetchLoans = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get(`${API_BASE_URL}/loans`, {
        params: {
          limit: 1000
        }
      });
      
      if (response.data && response.data.data) {
        dispatch({ type: 'SET_LOANS', payload: response.data.data });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Failed to fetch loans' 
      });
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/stats`);
      if (response.data && response.data.data) {
        dispatch({ type: 'SET_STATS', payload: response.data.data });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const filterLoans = useCallback(() => {
    let filtered = [...state.loans];

    // Search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(loan =>
        loan.name.toLowerCase().includes(query) ||
        loan.lender.toLowerCase().includes(query) ||
        loan.description.toLowerCase().includes(query) ||
        loan.country.toLowerCase().includes(query)
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
      filtered = filtered.filter(loan => loan.loanAmount.max >= minAmount);
    }

    // Max amount filter
    if (state.filters.maxAmount) {
      const maxAmount = parseFloat(state.filters.maxAmount);
      filtered = filtered.filter(loan => loan.loanAmount.min <= maxAmount);
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
        const rate = parseFloat(loan.interestRate.split('-')[0]);
        return rate <= maxRate;
      });
    }

    dispatch({ type: 'SET_FILTERED_LOANS', payload: filtered });
  }, [state.loans, state.searchQuery, state.filters]);

  const trackLoanApplication = useCallback(async (loan) => {
    try {
      const sessionId = sessionStorage.getItem('sessionId') || 
                       `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      if (!sessionStorage.getItem('sessionId')) {
        sessionStorage.setItem('sessionId', sessionId);
      }

      await axios.post(`${API_BASE_URL}/track-application`, {
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

      // Refresh stats after tracking
      fetchStats();
    } catch (error) {
      console.error('Error tracking application:', error);
    }
  }, [fetchStats]);

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