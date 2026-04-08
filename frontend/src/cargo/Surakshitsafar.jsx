import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Globe, Plus, Building, Truck, Train, Ship, Plane, MapPin, ExternalLink,
  Star, Phone, Mail, X, Shield, CheckCircle, ArrowRight,
  Package, TrendingUp, DollarSign, Clock, Route, AlertCircle, Eye,
  Zap, ArrowUpRight, ArrowLeft, User, Loader
} from 'lucide-react';
import { cargoAPI } from '../services/cargoApi.js';
import { loadRazorpay } from '../utils/razorpayLoader.js';

const countryPortData = {
  "India": ["Mumbai (JNPT)", "Chennai", "Kolkata", "Mundra", "Cochin", "Visakhapatnam", "Kandla", "Tuticorin", "Hazira", "Pipavav"],
  "Singapore": ["Singapore Port", "Jurong Port"],
  "UAE": ["Jebel Ali (Dubai)", "Port Khalifa (Abu Dhabi)", "Port Rashid"],
  "USA": ["Los Angeles", "New York", "Long Beach", "Houston", "Savannah", "Seattle", "Oakland", "Norfolk"],
  "Germany": ["Hamburg", "Bremerhaven", "Wilhelmshaven"],
  "China": ["Shanghai", "Shenzhen", "Ningbo", "Qingdao", "Hong Kong", "Guangzhou", "Tianjin", "Dalian"],
  "UK": ["Felixstowe", "Southampton", "Liverpool", "London Gateway"],
  "Netherlands": ["Rotterdam", "Amsterdam"],
  "Saudi Arabia": ["Jeddah", "Dammam", "Jubail"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Fremantle"],
  "Japan": ["Tokyo", "Yokohama", "Osaka", "Kobe"],
  "South Korea": ["Busan", "Incheon", "Ulsan"],
  "Malaysia": ["Port Klang", "Penang", "Johor"],
  "Thailand": ["Laem Chabang", "Bangkok"],
  "France": ["Le Havre", "Marseille"],
  "Spain": ["Valencia", "Barcelona", "Algeciras"],
  "Italy": ["Genoa", "Naples", "La Spezia"],
  "Brazil": ["Santos", "Rio de Janeiro"],
  "South Africa": ["Durban", "Cape Town"],
  "Canada": ["Vancouver", "Montreal", "Halifax"]
};

const cargoTypes = [
  "Electronics", "Textiles", "Machinery", "Chemicals", "Automotive",
  "Food Products", "Pharmaceuticals", "Oil & Gas", "Raw Materials",
  "Mining Equipment", "Agricultural Products", "Bulk Commodities",
  "Perishables", "Hazardous Materials", "Consumer Goods"
];

const shipmentTypes = [
  { value: "Road", icon: Truck, color: "text-blue-600" },
  { value: "Rail", icon: Train, color: "text-green-600" },
  { value: "Ship", icon: Ship, color: "text-cyan-600" },
  { value: "Air", icon: Plane, color: "text-purple-600" }
];

function SurakshitSafar() {
  // ========== STATE MANAGEMENT ==========
  const [departureCountry, setDepartureCountry] = useState("");
  const [arrivalCountry, setArrivalCountry] = useState("");
  const [departurePort, setDeparturePort] = useState("");
  const [arrivalPort, setArrivalPort] = useState("");
  const [showDeparturePorts, setShowDeparturePorts] = useState(false);
  const [showArrivalPorts, setShowArrivalPorts] = useState(false);
  const [selectedCargoType, setSelectedCargoType] = useState("");
  const [selectedShipmentType, setSelectedShipmentType] = useState("");
  const [companies, setCompanies] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLoanProviders, setShowLoanProviders] = useState(false);

  // Form state
  const initialFormState = {
    name: "", website: "", contact: "", email: "", description: "",
    established: "", routes: [], cargoTypes: [],
    shipmentTypes: [], coverage: "Global", maxCoverageAmount: "",
    maxCoverageCurrency: "USD", submitterName: "", submitterEmail: "",
    submitterPhone: "", submitterDesignation: ""
  };

  const [companyForm, setCompanyForm] = useState(initialFormState);
  const [currentRoute, setCurrentRoute] = useState("");
  const [formStep, setFormStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

// Razorpay initialization
useEffect(() => {
  console.log('🚀 SurakshitSafar component mounted');
  console.log('🔄 Initializing Razorpay SDK...');
  
  loadRazorpay()
    .then(() => {
      console.log('✅ Razorpay SDK initialized successfully');
    })
    .catch(err => {
      console.warn('⚠️ Razorpay initialization warning:', err.message);
    });
}, []);

  // ========== USEEFFECT HOOKS ==========
  useEffect(() => {
    if (departureCountry) setShowDeparturePorts(true);
  }, [departureCountry]);

  useEffect(() => {
    if (arrivalCountry) setShowArrivalPorts(true);
  }, [arrivalCountry]);

  useEffect(() => {
    if (!showAddCompanyForm) {
      setCompanyForm(initialFormState);
      setFormStep(1);
      setFormErrors({});
    }
  }, [showAddCompanyForm]);

  // ========== API CALLS ==========
  const handleSearch = async () => {
    if (!departurePort || !arrivalPort || !selectedCargoType || !selectedShipmentType) {
      alert("Please select all fields: Departure Port, Arrival Port, Cargo Type, and Transport Mode");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await cargoAPI.companies.getApproved();
      
      const filteredCompanies = response.data.data.filter(company => 
        company.cargoTypes.includes(selectedCargoType) &&
        company.shipmentTypes.includes(selectedShipmentType)
      );

      if (filteredCompanies.length === 0) {
        setError("No insurance providers available for your selected criteria. Please try different options.");
      }

      setCompanies(filteredCompanies);
      setShowResults(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch companies. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowLoanProviders = () => {
  setShowLoanProviders(!showLoanProviders);
  setCompanies([]);
  setShowResults(false);
  setDepartureCountry("");
  setArrivalCountry("");
  setDeparturePort("");
  setArrivalPort("");
  setSelectedCargoType("");
  setSelectedShipmentType("");
}; 

  const handleNewSearch = () => {
    setShowResults(false);
    setCompanies([]);
    setDepartureCountry("");
    setArrivalCountry("");
    setDeparturePort("");
    setArrivalPort("");
    setSelectedCargoType("");
    setSelectedShipmentType("");
    setShowDeparturePorts(false);
    setShowArrivalPorts(false);
    setError(null);
  };

  const handleCompanyClick = async (companyId) => {
    try {
      await cargoAPI.companies.trackClick(companyId);
    } catch (err) {
      console.error('Error tracking click:', err);
    }
  };

  // ========== FORM HANDLERS ==========
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCompanyForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleMultiSelectChange = (e, field) => {
    const { value, checked } = e.target;
    setCompanyForm(prev => {
      const currentValues = prev[field];
      const newValues = checked
        ? [...currentValues, value]
        : currentValues.filter(item => item !== value);
      return { ...prev, [field]: newValues };
    });
  };

  const handleAddRoute = () => {
    if (currentRoute && !companyForm.routes.includes(currentRoute)) {
      setCompanyForm(prev => ({ ...prev, routes: [...prev.routes, currentRoute] }));
      setCurrentRoute("");
    }
  };

  const handleRemoveRoute = (routeToRemove) => {
    setCompanyForm(prev => ({ 
      ...prev, 
      routes: prev.routes.filter(route => route !== routeToRemove) 
    }));
  };

  // ========== VALIDATION ==========
  const validateStep = (step) => {
    const errors = {};
    const { name, email, website, contact, maxCoverageAmount, routes, cargoTypes, shipmentTypes, submitterName, submitterEmail, submitterPhone } = companyForm;

    if (step === 1) {
      if (!name.trim()) errors.name = "Legal company name is required.";
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "A valid official email is required.";
      if (!website.trim() || !/^https?:\/\/.+/.test(website)) errors.website = "A valid website URL is required.";
      if (!contact.trim() || contact.length < 10) errors.contact = "A valid contact number is required.";
      if (!maxCoverageAmount) errors.maxCoverageAmount = "Max coverage amount is required.";
    }

    if (step === 2) {
      if (routes.length === 0) errors.routes = "Please add at least one popular route.";
      if (shipmentTypes.length === 0) errors.shipmentTypes = "Please select at least one shipment method.";
      if (cargoTypes.length === 0) errors.cargoTypes = "Please select at least one cargo type.";
    }
    
    if (step === 3) {
      if (!submitterName.trim()) errors.submitterName = "Submitter's name is required.";
      if (!submitterEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail)) errors.submitterEmail = "A valid email is required.";
      if (!submitterPhone.trim() || submitterPhone.length < 10) errors.submitterPhone = "A valid phone is required.";
    }

    return errors;
  };

  const handleNextStep = () => {
    const errors = validateStep(formStep);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
    } else {
      setFormErrors({});
      setFormStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setFormStep(prev => prev - 1);
  };
const handleAddCompany = async (e) => {
  e.preventDefault();
  const finalErrors = validateStep(3);
  if (Object.keys(finalErrors).length > 0) {
    setFormErrors(finalErrors);
    return;
  }
  
  setIsSubmitting(true);

  try {
    console.log('📋 Step 1: Registering company...');
    
    // Step 1: Register company
    const companyResponse = await cargoAPI.companies.register({
      name: companyForm.name,
      email: companyForm.email,
      phone: companyForm.contact,
      website: companyForm.website,
      established: companyForm.established,
      coverage: companyForm.coverage,
      maxCoverageAmount: companyForm.maxCoverageAmount,
      maxCoverageCurrency: companyForm.maxCoverageCurrency,
      routes: companyForm.routes,
      shipmentTypes: companyForm.shipmentTypes,
      cargoTypes: companyForm.cargoTypes,
      submitterName: companyForm.submitterName,
      submitterEmail: companyForm.submitterEmail,
      submitterPhone: companyForm.submitterPhone,
      submitterDesignation: companyForm.submitterDesignation,
      description: companyForm.description,
    });

    console.log('✅ Company registered:', companyResponse.data.data._id);
    const companyId = companyResponse.data.data._id;

    console.log('💳 Step 2: Creating payment order...');
    
    // Step 2: Create payment order
    const orderResponse = await cargoAPI.payments.createOrder(companyId, 'insurance');
    
    console.log('✅ Order created:', orderResponse.data.data.orderId);

    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      console.error('❌ Razorpay SDK not available');
      alert('❌ Payment system is not loaded. Please:\n\n1. Refresh the page\n2. Check your internet connection\n3. Disable ad blockers\n4. Try again');
      setIsSubmitting(false);
      return;
    }

    console.log('🎯 Step 3: Opening Razorpay checkout...');

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderResponse.data.data.amount,
      currency: orderResponse.data.data.currency,
      name: companyForm.name,
      description: 'Insurance Company Listing Fee - ₹15,000',
      order_id: orderResponse.data.data.orderId,
      
      // ✅ FIXED: Payment success handler
      handler: async (response) => {
        try {
          console.log('🔄 Step 4: Verifying payment...');
          console.log('Razorpay response keys:', Object.keys(response));
          console.log('Payment ID:', response.razorpay_payment_id);
          console.log('Order ID:', response.razorpay_order_id);
          
          // ✅ FIX: Send with exact Razorpay field names
          const verifyData = {
            companyId: companyId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            type: 'insurance'
          };

          console.log('📤 Verification data keys:', Object.keys(verifyData));

          const verifyResponse = await cargoAPI.payments.verifyPayment(verifyData);

          console.log('✅ Payment verified:', verifyResponse.data);
          
          if (verifyResponse.data.success) {
            alert('✅ Company registered successfully!\n\nYour application is awaiting admin approval.\n\nYou will receive an email update shortly.');
            
            // Reset form
            setShowAddCompanyForm(false);
            setCompanyForm(initialFormState);
            setFormStep(1);
            setFormErrors({});
          }
          
        } catch (err) {
          console.error('❌ Verification error:', err);
          console.error('Error data:', err.response?.data);
          console.error('Error status:', err.response?.status);
          
          alert('❌ Payment verification failed:\n\n' + (err.response?.data?.message || err.message || 'Unknown error'));
        } finally {
          setIsSubmitting(false);
        }
      },
      
      // Payment error handler
      onError: (err) => {
        console.error('❌ Payment failed:', err);
        setIsSubmitting(false);
        alert('❌ Payment failed:\n\n' + (err.description || 'Unknown error. Please try again.'));
      },
      
      prefill: {
        name: companyForm.submitterName,
        email: companyForm.submitterEmail,
        contact: companyForm.submitterPhone,
      },
      theme: { 
        color: "#3B82F6" 
      },
      retry: { 
        enabled: true, 
        max: 3 
      }
    };

    console.log('📊 Opening Razorpay checkout with order:', options.order_id);

    // Open Razorpay checkout
    const razorpayWindow = new window.Razorpay(options);
    razorpayWindow.open();
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    setIsSubmitting(false);
    
    const errorMsg = error.response?.data?.message || error.message || 'Registration failed';
    alert(`❌ Registration failed:\n\n${errorMsg}\n\nPlease try again.`);
  }
};
const handleSearchLoanProviders = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await cargoAPI.loanProviders.getApproved();
    
    setCompanies(response.data.data);
    setShowResults(true);
    setShowLoanProviders(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to fetch loan providers');
    console.error('Search error:', err);
  } finally {
    setLoading(false);
  }
};

const LoanProviderCard = ({ provider, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.02, y: -5 }}
    onClick={() => handleCompanyClick(provider._id)}
    className="rounded-xl shadow-2xl border-2 overflow-hidden cursor-pointer transition-all bg-gray-900 border-gray-700 hover:border-green-500"
  >
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
      <div className="flex items-center space-x-3">
        <DollarSign className="h-7 w-7 text-white" />
        <div>
          <h3 className="font-bold text-xl text-white">{provider.name}</h3>
          <div className="flex items-center space-x-2 text-white/90">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{provider.approvalTime} Approval</span>
          </div>
        </div>
      </div>
    </div>

    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < Math.floor(provider.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
            />
          ))}
          <span className="text-sm text-gray-300 ml-2">{(provider.rating || 0).toFixed(1)}/5</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="h-4 w-4 text-green-400" />
            <span className="text-xs text-gray-400">Approval Rate</span>
          </div>
          <p className="text-sm font-bold text-white">{provider.approvalRate}%</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-gray-400">Disburse</span>
          </div>
          <p className="text-sm font-bold text-white">{provider.disburseTime}</p>
        </div>
      </div>

      <div className="bg-gray-800 p-3 rounded-lg">
        <p className="text-sm text-gray-300 line-clamp-2">{provider.description || 'Quick loan provider'}</p>
      </div>

      <div className="space-y-2">
        {provider.loanProducts?.slice(0, 2).map((product, idx) => (
          <div key={idx} className="text-xs bg-gray-700 p-2 rounded">
            <p className="font-medium text-white">{product.name}</p>
            <p className="text-gray-300">₹{product.minAmount/100000}L - ₹{product.maxAmount/100000}L @ {product.interestRate}%</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            window.open(provider.website, '_blank');
          }}
          className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
        >
          <ExternalLink className="h-4 w-4 inline mr-1" />
          Visit
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCompany(provider);
          }}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-bold"
        >
          Apply Now
        </motion.button>
      </div>
    </div>
  </motion.div>
);


  const PortSelector = ({ label, country, setCountry, selectedPort, setSelectedPort, showPorts, setShowPorts }) => (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-300">{label}</label>
      <select
        value={country}
        onChange={(e) => {
          setCountry(e.target.value);
          setSelectedPort("");
          setShowPorts(true);
        }}
        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
      >
        <option value="">Select Country</option>
        {Object.keys(countryPortData).sort().map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <AnimatePresence>
        {country && showPorts && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <p className="text-xs text-gray-400 mb-3">Popular Ports in {country}:</p>
              <div className="flex flex-wrap gap-2">
                {countryPortData[country].map(port => (
                  <motion.button
                    key={port}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedPort(port)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedPort === port
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {port}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const CompanyCard = ({ company, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={() => handleCompanyClick(company._id)}
      className={`rounded-xl shadow-2xl border-2 overflow-hidden cursor-pointer transition-all ${
        company.highlight 
          ? 'bg-gradient-to-br from-green-900 to-green-800 border-green-500 ring-2 ring-green-400' 
          : 'bg-gray-900 border-gray-700 hover:border-blue-500'
      }`}
    >
      {company.highlight && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center py-2 px-4 font-bold text-sm">
          ⭐ TOP PROVIDER ⭐
        </div>
      )}
      
      <div className={`p-6 ${company.highlight ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
        <div className="flex items-center space-x-3">
          <Shield className="h-7 w-7 text-white" />
          <div>
            <h3 className="font-bold text-xl text-white">{company.name}</h3>
            <div className="flex items-center space-x-2 text-white/90">
              <Globe className="h-4 w-4" />
              <span className="text-sm">{company.coverage}</span>
              {company.isVerified && <CheckCircle className="h-4 w-4 text-green-300" />}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(company.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
              />
            ))}
            <span className="text-sm text-gray-300 ml-2">{(company.rating || 0).toFixed(1)}/5</span>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
            {company.serviceTier}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-xs text-gray-400">Max Coverage</span>
            </div>
            <p className="text-sm font-bold text-white">${company.maxCoverage?.amount}M</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-gray-400">Claims</span>
            </div>
            <p className="text-sm font-bold text-white">{company.claimSettlementRate}%</p>
          </div>
        </div>

        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-sm text-gray-300 line-clamp-2">{company.description || 'Premium cargo insurance coverage'}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              window.open(company.website, '_blank');
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Visit</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCompany(company);
            }}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center space-x-2"
          >
            <span>Get Quote</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  // ========== MAIN RENDER ==========
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => handleNewSearch()}
            >
              <Shield className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SurakshitSafar
              </span>
            </motion.div>
            
            <div className="flex items-center space-x-8">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                onClick={() => handleNewSearch()}
                className={`font-medium transition-colors ${!showResults ? "text-blue-400" : "text-gray-300 hover:text-white"}`}
              >
                Home
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowAddCompanyForm(true)}
                className="text-gray-300 hover:text-white font-medium"
              >
                List Company
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {!showResults && (
        <section className="bg-gradient-to-br from-gray-900 via-blue-900/30 to-purple-900/30 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Secure Your Cargo Journey
              </h1>
              <p className="text-xl text-gray-300">
                Find premium insurance coverage for shipments worldwide
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <PortSelector
                  label="Departure Location"
                  country={departureCountry}
                  setCountry={setDepartureCountry}
                  selectedPort={departurePort}
                  setSelectedPort={setDeparturePort}
                  showPorts={showDeparturePorts}
                  setShowPorts={setShowDeparturePorts}
                />
                <PortSelector
                  label="Arrival Location"
                  country={arrivalCountry}
                  setCountry={setArrivalCountry}
                  selectedPort={arrivalPort}
                  setSelectedPort={setArrivalPort}
                  showPorts={showArrivalPorts}
                  setShowPorts={setShowArrivalPorts}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Cargo Type</label>
                  <select
                    value={selectedCargoType}
                    onChange={(e) => setSelectedCargoType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Cargo Type</option>
                    {cargoTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Transport Mode</label>
                  <select
                    value={selectedShipmentType}
                    onChange={(e) => setSelectedShipmentType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Transport</option>
                    {shipmentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.value}</option>
                    ))}
                  </select>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Search Insurance Providers</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Results Section */}
      <AnimatePresence>
        {showResults && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto px-4 py-12"
          >
            <motion.div className="mb-8">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Available Insurance Providers</h2>
                  <p className="text-gray-400">
                    Route: <span className="text-white font-semibold">{departurePort} → {arrivalPort}</span> | 
                    Cargo: <span className="text-white font-semibold">{selectedCargoType}</span> | 
                    Mode: <span className="text-white font-semibold">{selectedShipmentType}</span>
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleNewSearch}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>New Search</span>
                </motion.button>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-600/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2"
              >
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </motion.div>
            )}

            {companies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {companies.map((company, index) => (
                  <CompanyCard key={company._id} company={company} index={index} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-2">No Providers Found</h3>
                <p className="text-gray-400">Try different selection criteria or contact us for assistance.</p>
              </div>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl p-8 border border-green-700/50">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Don't see your company listed?
                </h3>
                <p className="text-gray-300 mb-6">
                  Join our platform and connect with thousands of cargo owners worldwide
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddCompanyForm(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 mx-auto"
                >
                  <Plus className="h-6 w-6" />
                  <span>Add Your Company Now</span>
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Company Form Modal */}
      <AnimatePresence>
        {showAddCompanyForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowAddCompanyForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[95vh] border border-gray-700 flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">List Your Insurance Company</h3>
                  <p className="text-sm text-gray-400 mt-2">One-time listing fee: ₹15,000. Complete all steps to get listed.</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  onClick={() => setShowAddCompanyForm(false)} 
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              <form onSubmit={handleAddCompany} className="flex-grow overflow-y-auto">
                <div className="p-6">
                  {/* Progress Bar */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center flex-1">
                      {[1, 2, 3].map((step) => (
                        <React.Fragment key={step}>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                              formStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                            }`}
                          >
                            {step}
                          </div>
                          {step < 3 && (
                            <div
                              className={`flex-1 h-1 mx-2 transition-all ${
                                formStep > step ? 'bg-blue-600' : 'bg-gray-700'
                              }`}
                            ></div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    <span className="text-sm text-gray-400 ml-4">Step {formStep} of 3</span>
                  </div>

                  <AnimatePresence mode="wait">
                    {/* Step 1: Company Information */}
                    {formStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-2 bg-blue-600 rounded-lg"><Building className="h-5 w-5 text-white" /></div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">Company Information</h4>
                            <p className="text-sm text-gray-400">Basic details about your insurance company</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Legal Company Name <span className="text-red-400">*</span></label>
                            <input
                              name="name"
                              type="text"
                              placeholder="e.g., Global Shield Insurance Ltd."
                              value={companyForm.name}
                              onChange={handleFormChange}
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                            />
                            {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Official Email <span className="text-red-400">*</span></label>
                            <input
                              name="email"
                              type="email"
                              placeholder="contact@company.com"
                              value={companyForm.email}
                              onChange={handleFormChange}
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                            />
                            {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Company Website <span className="text-red-400">*</span></label>
                            <input
                              name="website"
                              type="url"
                              placeholder="https://www.company.com"
                              value={companyForm.website}
                              onChange={handleFormChange}
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                            />
                            {formErrors.website && <p className="text-red-400 text-xs mt-1">{formErrors.website}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Contact Number <span className="text-red-400">*</span></label>
                            <input
                              name="contact"
                              type="tel"
                              placeholder="+91-XXXXXXXXXX"
                              value={companyForm.contact}
                              onChange={handleFormChange}
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                            />
                            {formErrors.contact && <p className="text-red-400 text-xs mt-1">{formErrors.contact}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Year Established</label>
                            <input
                              name="established"
                              type="number"
                              min="1900"
                              max={new Date().getFullYear()}
                              placeholder="YYYY"
                              value={companyForm.established}
                              onChange={handleFormChange}
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Coverage Area</label>
                            <select
                              name="coverage"
                              value={companyForm.coverage}
                              onChange={handleFormChange}
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="Global">Global</option>
                              <option value="Asia-Pacific">Asia-Pacific</option>
                              <option value="Europe">Europe</option>
                              <option value="Americas">Americas</option>
                              <option value="India-Specific">India-Specific</option>
                            </select>
                          </div>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Coverage Limit <span className="text-red-400">*</span></label>
                          <div className="flex gap-3">
                            <input
                              name="maxCoverageAmount"
                              type="number"
                              min="1"
                              step="0.1"
                              placeholder="50"
                              value={companyForm.maxCoverageAmount}
                              onChange={handleFormChange}
                              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                            />
                            <select
                              name="maxCoverageCurrency"
                              value={companyForm.maxCoverageCurrency}
                              onChange={handleFormChange}
                              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white w-32"
                            >
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="INR">INR</option>
                            </select>
                          </div>
                          {formErrors.maxCoverageAmount && <p className="text-red-400 text-xs mt-1">{formErrors.maxCoverageAmount}</p>}
                          <p className="text-xs text-gray-500 mt-2">Enter amount in millions (e.g., 50 for $50M)</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Service Details */}
                    {formStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-2 bg-purple-600 rounded-lg"><Zap className="h-5 w-5 text-white" /></div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">Service Details</h4>
                            <p className="text-sm text-gray-400">Specify services your company offers</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {/* Cargo Types */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Cargo Types <span className="text-red-400">*</span></label>
                            <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-gray-900 rounded-md border border-gray-700">
                              {cargoTypes.map(type => (
                                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    value={type}
                                    checked={companyForm.cargoTypes.includes(type)}
                                    onChange={(e) => handleMultiSelectChange(e, 'cargoTypes')}
                                    className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-blue-500"
                                  />
                                  <span className="text-sm text-gray-300">{type}</span>
                                </label>
                              ))}
                            </div>
                            {formErrors.cargoTypes && <p className="text-red-400 text-xs mt-1">{formErrors.cargoTypes}</p>}
                          </div>

                          {/* Shipment Methods */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Shipment Methods <span className="text-red-400">*</span></label>
                            <div className="space-y-2 p-3 bg-gray-900 rounded-md border border-gray-700">
                              {shipmentTypes.map(type => (
                                <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    value={type.value}
                                    checked={companyForm.shipmentTypes.includes(type.value)}
                                    onChange={(e) => handleMultiSelectChange(e, 'shipmentTypes')}
                                    className="h-4 w-4 bg-gray-700 border-gray-600 rounded text-blue-500"
                                  />
                                  <type.icon className={`h-4 w-4 ${type.color}`} />
                                  <span className="text-sm text-gray-300">{type.value}</span>
                                </label>
                              ))}
                            </div>
                            {formErrors.shipmentTypes && <p className="text-red-400 text-xs mt-1">{formErrors.shipmentTypes}</p>}
                          </div>

                          {/* Popular Routes */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Popular Routes <span className="text-red-400">*</span></label>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                placeholder="e.g., Mumbai-Dubai"
                                value={currentRoute}
                                onChange={(e) => setCurrentRoute(e.target.value)}
                                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg flex-grow text-white text-sm"
                              />
                              <button
                                type="button"
                                onClick={handleAddRoute}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium"
                              >
                                Add
                              </button>
                            </div>
                            <div className="space-y-1 max-h-36 overflow-y-auto p-2 bg-gray-900 rounded-md border border-gray-700">
                              {companyForm.routes.map(route => (
                                <div key={route} className="flex items-center justify-between bg-gray-700 px-3 py-1 rounded text-sm">
                                  <span className="text-gray-300">{route}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRoute(route)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            {formErrors.routes && <p className="text-red-400 text-xs mt-1">{formErrors.routes}</p>}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Company Description</label>
                          <textarea
                            name="description"
                            placeholder="Tell us about your company and services..."
                            value={companyForm.description}
                            onChange={handleFormChange}
                            rows="4"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Submitter Information */}
                    {formStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="p-2 bg-green-600 rounded-lg"><User className="h-5 w-5 text-white" /></div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">Submitter Information</h4>
                            <p className="text-sm text-gray-400">Contact person details for verification</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Your Full Name <span className="text-red-400">*</span></label>
                            <input
                              name="submitterName"
                              type="text"
                              placeholder="e.g., Jane Doe"
                              value={companyForm.submitterName}
                              onChange={handleFormChange}
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                            />
                            {formErrors.submitterName && <p className="text-red-400 text-xs mt-1">{formErrors.submitterName}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Your Email <span className="text-red-400">*</span></label>
                            <input
                              name="submitterEmail"
                              type="email"
                              placeholder="your.email@company.com"
                              value={companyForm.submitterEmail}
                              onChange={handleFormChange}
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                            />
                            {formErrors.submitterEmail && <p className="text-red-400 text-xs mt-1">{formErrors.submitterEmail}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Your Phone <span className="text-red-400">*</span></label>
                            <input
                              name="submitterPhone"
                              type="tel"
                              placeholder="+91-XXXXXXXXXX"
                              value={companyForm.submitterPhone}
                              onChange={handleFormChange}
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                            />
                            {formErrors.submitterPhone && <p className="text-red-400 text-xs mt-1">{formErrors.submitterPhone}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Your Designation</label>
                            <input
                              name="submitterDesignation"
                              type="text"
                              placeholder="e.g., Marketing Manager"
                              value={companyForm.submitterDesignation}
                              onChange={handleFormChange}
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-blue-500/50 text-center">
                          <h3 className="text-lg font-semibold text-white">Final Step</h3>
                          <p className="text-gray-400 mt-2">
                            By clicking 'Submit & Pay', you agree to our terms. Your company will be added for admin review.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Form Footer */}
                <div className="p-6 border-t border-gray-700 mt-auto bg-gray-800 flex justify-between">
                  {formStep > 1 && (
                    <motion.button
                      type="button"
                      onClick={handlePrevStep}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      <span>Back</span>
                    </motion.button>
                  )}
                  <div className="flex-1"></div>
                  {formStep < 3 ? (
                    <motion.button
                      type="button"
                      onClick={handleNextStep}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-5 w-5" />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.05 }}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-bold disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-5 w-5" />
                          <span>Submit & Pay ₹15,000</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Company Details Modal */}
      <AnimatePresence>
        {selectedCompany && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setSelectedCompany(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 my-8"
            >
              <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Company Details & Quote</h3>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setSelectedCompany(null)} 
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Company Name</label>
                    <p className="text-white font-semibold">{selectedCompany.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Coverage</label>
                    <p className="text-white">{selectedCompany.coverage}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Website</label>
                    <a 
                      href={selectedCompany.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-400 hover:text-blue-300 break-all text-sm flex items-center space-x-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Visit</span>
                    </a>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Contact</label>
                    <p className="text-white">{selectedCompany.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <p className="text-white text-sm">{selectedCompany.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Established</label>
                    <p className="text-white">{selectedCompany.established || 'N/A'}</p>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Services Offered</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-2">Shipment Types:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCompany.shipmentTypes?.map(type => (
                          <span key={type} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-2">Max Coverage:</p>
                      <p className="text-white font-semibold">
                        ${selectedCompany.maxCoverage?.amount}M {selectedCompany.maxCoverage?.currency}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">Cargo Types:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.cargoTypes?.map(type => (
                      <span key={type} className="bg-gray-700 text-gray-300 px-3 py-1 rounded text-sm">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedCompany.description && (
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-300">{selectedCompany.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-900 rounded-lg">
                  <div>
                    <span className="text-gray-400 text-sm">Rating</span>
                    <p className="text-white font-bold text-lg">{(selectedCompany.rating || 0).toFixed(1)}/5</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Claims Settlement</span>
                    <p className="text-white font-bold text-lg">{selectedCompany.claimSettlementRate}%</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-700 flex space-x-3">
                <motion.a
                  href={`mailto:${selectedCompany.email}`}
                  whileHover={{ scale: 1.02 }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium text-center transition-colors"
                >
                  Contact Company
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedCompany(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-blue-500" />
                <span className="text-lg font-bold text-white">SurakshitSafar</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting cargo owners with trusted insurance providers worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => handleNewSearch()} 
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowAddCompanyForm(true)} 
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    List Company
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">support@surakshitsafar.com</p>
              <p className="text-gray-400 text-sm">+91 (0) 555-1234</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} SurakshitSafar. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
}

export default SurakshitSafar;