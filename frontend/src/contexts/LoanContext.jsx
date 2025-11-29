import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loanData } from '../finance/data/loans';

const LoanContext = createContext();

const initialState = {
  loans: loanData,
  filteredLoans: loanData,
  selectedLoans: [],
  searchQuery: '',
  filters: {
    category: '',
    lenderType: '',
    minAmount: '',
    maxAmount: '',
    maxInterestRate: '',
    collateralRequired: '',
    sector: '',
    country: ''
  },
  userProfile: {
    age: '',
    income: '',
    creditScore: '',
    organizationType: '',
    businessAge: '',
    sector: ''
  },
  savedLoans: JSON.parse(localStorage.getItem('savedLoans') || '[]'),
  comparisonList: JSON.parse(localStorage.getItem('comparisonList') || '[]')
};

function loanReducer(state, action) {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case 'SET_FILTERED_LOANS':
      return { ...state, filteredLoans: action.payload };
    
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: { ...state.userProfile, ...action.payload } };
    
    case 'ADD_TO_COMPARISON':
      const newComparisonList = [...state.comparisonList, action.payload];
      localStorage.setItem('comparisonList', JSON.stringify(newComparisonList));
      return { ...state, comparisonList: newComparisonList };
    
    case 'REMOVE_FROM_COMPARISON':
      const updatedComparisonList = state.comparisonList.filter(id => id !== action.payload);
      localStorage.setItem('comparisonList', JSON.stringify(updatedComparisonList));
      return { ...state, comparisonList: updatedComparisonList };
    
    case 'CLEAR_COMPARISON':
      localStorage.setItem('comparisonList', JSON.stringify([]));
      return { ...state, comparisonList: [] };
    
    case 'SAVE_LOAN':
      const newSavedLoans = [...state.savedLoans, action.payload];
      localStorage.setItem('savedLoans', JSON.stringify(newSavedLoans));
      return { ...state, savedLoans: newSavedLoans };
    
    case 'REMOVE_SAVED_LOAN':
      const updatedSavedLoans = state.savedLoans.filter(id => id !== action.payload);
      localStorage.setItem('savedLoans', JSON.stringify(updatedSavedLoans));
      return { ...state, savedLoans: updatedSavedLoans };
    
    case 'RESET_FILTERS':
      return { 
        ...state, 
        filters: initialState.filters,
        searchQuery: '',
        filteredLoans: state.loans
      };
    
    default:
      return state;
  }
}

export const LoanProvider = ({ children }) => {
  const [state, dispatch] = useReducer(loanReducer, initialState);

  const applyFilters = () => {
    let filtered = [...state.loans];

    // Search query filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(loan =>
        loan.name.toLowerCase().includes(query) ||
        loan.lender.toLowerCase().includes(query) ||
        loan.description.toLowerCase().includes(query) ||
        loan.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (state.filters.category) {
      filtered = filtered.filter(loan => loan.category === state.filters.category);
    }

    // Lender type filter
    if (state.filters.lenderType) {
      filtered = filtered.filter(loan => loan.lenderType === state.filters.lenderType);
    }

    // Amount range filter
    if (state.filters.minAmount) {
      filtered = filtered.filter(loan => loan.loanAmount.max >= parseInt(state.filters.minAmount));
    }
    if (state.filters.maxAmount) {
      filtered = filtered.filter(loan => loan.loanAmount.min <= parseInt(state.filters.maxAmount));
    }

    // Interest rate filter
    if (state.filters.maxInterestRate) {
      filtered = filtered.filter(loan => {
        const rate = parseFloat(loan.interestRate.split('-')[0]);
        return rate <= parseFloat(state.filters.maxInterestRate);
      });
    }

    // Collateral filter
    if (state.filters.collateralRequired !== '') {
      const requiresCollateral = state.filters.collateralRequired === 'true';
      filtered = filtered.filter(loan => loan.collateral === requiresCollateral);
    }

    // Sector filter
    if (state.filters.sector) {
      filtered = filtered.filter(loan => 
        loan.eligibility.sector.includes(state.filters.sector)
      );
    }

    // Country filter
    if (state.filters.country) {
      filtered = filtered.filter(loan => loan.country === state.filters.country);
    }

    dispatch({ type: 'SET_FILTERED_LOANS', payload: filtered });
  };

  useEffect(() => {
    applyFilters();
  }, [state.searchQuery, state.filters]);

  const value = {
    ...state,
    dispatch,
    applyFilters
  };

  return <LoanContext.Provider value={value}>{children}</LoanContext.Provider>;
};

export const useLoan = () => {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error('useLoan must be used within a LoanProvider');
  }
  return context;
};
