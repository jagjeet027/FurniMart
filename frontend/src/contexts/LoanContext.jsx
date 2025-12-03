import React, { createContext, useReducer, useCallback } from 'react';

export const LoanContext = createContext();

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
  error: null
};

const loanReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOANS':
      return {
        ...state,
        loans: action.payload,
        loading: false
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
        filters: initialState.filters
      };
    case 'SAVE_LOAN':
      return {
        ...state,
        savedLoans: [...state.savedLoans, action.payload]
      };
    case 'REMOVE_SAVED_LOAN':
      return {
        ...state,
        savedLoans: state.savedLoans.filter(id => id !== action.payload)
      };
    case 'ADD_TO_COMPARISON':
      if (state.comparisonList.length < 4) {
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
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

export const LoanProvider = ({ children }) => {
  const [state, dispatch] = useReducer(loanReducer, initialState);

  const filterLoans = useCallback(() => {
    let filtered = state.loans;

    // Search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(loan =>
        loan.name.toLowerCase().includes(query) ||
        loan.lender.toLowerCase().includes(query) ||
        loan.description.toLowerCase().includes(query)
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

    // Collateral filter
    if (state.filters.collateralRequired !== '') {
      const requiresCollateral = state.filters.collateralRequired === 'true';
      filtered = filtered.filter(loan => loan.collateral === requiresCollateral);
    }

    dispatch({ type: 'SET_FILTERED_LOANS', payload: filtered });
  }, [state.loans, state.searchQuery, state.filters]);

  React.useEffect(() => {
    filterLoans();
  }, [filterLoans]);

  const value = {
    ...state,
    dispatch,
    filterLoans
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