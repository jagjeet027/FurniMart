import React, { useState } from 'react';
import { X, Building, User, MapPin, DollarSign, FileText, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Loader } from 'lucide-react';
import api from '../../axios/axiosInstance';

const AddOrganizationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    registrationNumber: '',
    establishedYear: new Date().getFullYear(),
    contactPerson: '',
    designation: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    loanTypes: [],
    minLoanAmount: '',
    maxLoanAmount: '',
    interestRateRange: '',
    description: '',
    specialPrograms: '',
    eligibilityCriteria: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const organizationTypes = [
    'Bank',
    'NBFC (Non-Banking Financial Company)',
    'Credit Union',
    'Government Agency',
    'Microfinance Institution',
    'Peer-to-Peer Lending Platform',
    'Fintech Company',
    'Other'
  ];

  const loanTypeOptions = [
    'Personal Loan',
    'Business Loan',
    'Home Loan',
    'Car Loan',
    'Education Loan',
    'Agricultural Loan',
    'Microfinance',
    'Startup Funding',
    'Equipment Financing',
    'Working Capital',
    'Other'
  ];

  const formTabs = [
    { label: 'Organization', icon: Building },
    { label: 'Contact', icon: User },
    { label: 'Address', icon: MapPin },
    { label: 'Loans', icon: DollarSign },
    { label: 'Details', icon: FileText },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLoanTypeChange = (loanType) => {
    setFormData(prev => ({
      ...prev,
      loanTypes: prev.loanTypes.includes(loanType)
        ? prev.loanTypes.filter(type => type !== loanType)
        : [...prev.loanTypes, loanType]
    }));
    if (errors.loanTypes) {
      setErrors(prev => ({ ...prev, loanTypes: '' }));
    }
  };

  const validateTab = (tabIndex) => {
    const newErrors = {};
    
    if (tabIndex === 0) {
      if (!formData.organizationName?.trim()) newErrors.organizationName = 'Organization name is required';
      if (!formData.organizationType) newErrors.organizationType = 'Organization type is required';
    }
    
    if (tabIndex === 1) {
      if (!formData.contactPerson?.trim()) newErrors.contactPerson = 'Contact person is required';
      if (!formData.email?.trim()) {
        newErrors.email = 'Email is required';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
      }
      if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';
    }
    
    if (tabIndex === 2) {
      if (!formData.address?.trim()) newErrors.address = 'Address is required';
      if (!formData.city?.trim()) newErrors.city = 'City is required';
      if (!formData.country?.trim()) newErrors.country = 'Country is required';
    }
    
    if (tabIndex === 3) {
      if (formData.loanTypes.length === 0) newErrors.loanTypes = 'Select at least one loan type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateTab(activeTab)) {
      setActiveTab(prev => Math.min(prev + 1, formTabs.length - 1));
    }
  };

  const handlePrevious = () => {
    setActiveTab(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    // Validate all required tabs
    const allValid = [0, 1, 2, 3].every(tab => validateTab(tab));
    
    if (!allValid) {
      console.log('❌ Validation failed');
      for (let i = 0; i < 4; i++) {
        if (!validateTab(i)) {
          setActiveTab(i);
          break;
        }
      }
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      console.log('📤 Submitting organization to /api/finance/organizations:', formData);
      
      // ✅ CORRECT ENDPOINT: /api/finance/organizations
      const response = await api.post('/finance/organizations', formData);
      
      console.log('✅ Response:', response.data);
      
      if (response.data?.success) {
        console.log('✅ Submission successful');
        setSubmitSuccess(true);
        
        setTimeout(() => {
          setSubmitSuccess(false);
          setActiveTab(0);
          setFormData({
            organizationName: '',
            organizationType: '',
            registrationNumber: '',
            establishedYear: new Date().getFullYear(),
            contactPerson: '',
            designation: '',
            email: '',
            phone: '',
            website: '',
            address: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
            loanTypes: [],
            minLoanAmount: '',
            maxLoanAmount: '',
            interestRateRange: '',
            description: '',
            specialPrograms: '',
            eligibilityCriteria: ''
          });
          setErrors({});
          if (onSuccess) onSuccess();
          onClose();
        }, 2500);
      } else {
        throw new Error(response.data?.message || 'Submission failed');
      }
    } catch (error) {
      console.error('❌ Submission error:', error);
      
      let errorMsg = 'Failed to submit. Please try again.';
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMsg = 'Invalid data. Please check all fields.';
      } else if (error.response?.status === 401) {
        errorMsg = 'Unauthorized. Please login again.';
      } else if (error.response?.status === 500) {
        errorMsg = 'Server error. Please try again later.';
      } else if (error.message === 'Network Error') {
        errorMsg = 'Network error. Please check your connection.';
      } else if (!error.response) {
        errorMsg = 'Unable to connect to server. Please check your internet connection.';
      }
      
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Success!</h2>
          <p className="text-gray-600 text-lg">Your organization has been submitted successfully. We'll review it within 2-3 business days.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5 flex items-center justify-between flex-shrink-0 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <Building className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Add Your Organization</h2>
              <p className="text-blue-100 text-sm">Step {activeTab + 1} of {formTabs.length}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-100 h-2 flex-shrink-0">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-300"
            style={{ width: `${((activeTab + 1) / formTabs.length) * 100}%` }}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 py-3 overflow-x-auto flex-shrink-0">
          <div className="flex gap-2 min-w-max">
            {formTabs.map((tab, idx) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === idx;
              const isCompleted = idx < activeTab;
              
              return (
                <button 
                  key={idx} 
                  onClick={() => setActiveTab(idx)} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    isActive ? 'bg-blue-600 text-white shadow-lg' : 
                    isCompleted ? 'bg-green-100 text-green-700 hover:bg-green-200' : 
                    'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : <TabIcon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Tab 0: Organization */}
            {activeTab === 0 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="organizationName" 
                    value={formData.organizationName} 
                    onChange={handleInputChange} 
                    placeholder="Enter organization name" 
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      errors.organizationName ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none`} 
                  />
                  {errors.organizationName && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.organizationName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Organization Type <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="organizationType" 
                    value={formData.organizationType} 
                    onChange={handleInputChange} 
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      errors.organizationType ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none bg-white`}
                  >
                    <option value="">Select organization type</option>
                    {organizationTypes.map(t => (<option key={t} value={t}>{t}</option>))}
                  </select>
                  {errors.organizationType && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.organizationType}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Registration Number</label>
                    <input 
                      name="registrationNumber" 
                      value={formData.registrationNumber} 
                      onChange={handleInputChange} 
                      placeholder="Registration #" 
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Established Year</label>
                    <input 
                      name="establishedYear" 
                      type="number" 
                      min="1800"
                      max={new Date().getFullYear()}
                      value={formData.establishedYear} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 1: Contact */}
            {activeTab === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="contactPerson" 
                    value={formData.contactPerson} 
                    onChange={handleInputChange} 
                    placeholder="Full name" 
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      errors.contactPerson ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none`} 
                  />
                  {errors.contactPerson && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.contactPerson}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Designation</label>
                  <input 
                    name="designation" 
                    value={formData.designation} 
                    onChange={handleInputChange} 
                    placeholder="Job title" 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    placeholder="email@example.com" 
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none`} 
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    placeholder="+1 234 567 8900" 
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none`} 
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Website</label>
                  <input 
                    name="website" 
                    value={formData.website} 
                    onChange={handleInputChange} 
                    placeholder="https://example.com" 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" 
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Address */}
            {activeTab === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    placeholder="Street address" 
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                      errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none`} 
                  />
                  {errors.address && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input 
                      name="city" 
                      value={formData.city} 
                      onChange={handleInputChange} 
                      placeholder="City" 
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                        errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                      } focus:outline-none`} 
                    />
                    {errors.city && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.city}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">State</label>
                    <input 
                      name="state" 
                      value={formData.state} 
                      onChange={handleInputChange} 
                      placeholder="State" 
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" 
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input 
                      name="country" 
                      value={formData.country} 
                      onChange={handleInputChange} 
                      placeholder="Country" 
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                        errors.country ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                      } focus:outline-none`} 
                    />
                    {errors.country && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.country}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">ZIP Code</label>
                    <input 
                      name="zipCode" 
                      value={formData.zipCode} 
                      onChange={handleInputChange} 
                      placeholder="ZIP" 
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Loans */}
            {activeTab === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-4">
                    Loan Types <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
                    {loanTypeOptions.map((type) => (
                      <label 
                        key={type} 
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.loanTypes.includes(type) ? 'border-blue-500 bg-blue-50' : 
                          'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={formData.loanTypes.includes(type)} 
                          onChange={() => handleLoanTypeChange(type)} 
                          className="w-5 h-5 text-blue-600 rounded" 
                        />
                        <span className="text-sm font-medium text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                  {errors.loanTypes && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.loanTypes}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Min Loan Amount (₹)</label>
                    <input 
                      name="minLoanAmount" 
                      type="number" 
                      value={formData.minLoanAmount} 
                      onChange={handleInputChange} 
                      placeholder="e.g., 10000" 
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Max Loan Amount (₹)</label>
                    <input 
                      name="maxLoanAmount" 
                      type="number" 
                      value={formData.maxLoanAmount} 
                      onChange={handleInputChange} 
                      placeholder="e.g., 1000000" 
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Interest Rate Range</label>
                  <input 
                    name="interestRateRange" 
                    value={formData.interestRateRange} 
                    onChange={handleInputChange} 
                    placeholder="e.g., 8.5% - 15.5%" 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" 
                  />
                </div>
              </div>
            )}

            {/* Tab 4: Details */}
            {activeTab === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    placeholder="Brief description of your organization..." 
                    rows="4" 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none resize-none" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Special Programs</label>
                  <textarea 
                    name="specialPrograms" 
                    value={formData.specialPrograms} 
                    onChange={handleInputChange} 
                    placeholder="Special programs or schemes offered..." 
                    rows="3" 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none resize-none" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Eligibility Criteria</label>
                  <textarea 
                    name="eligibilityCriteria" 
                    value={formData.eligibilityCriteria} 
                    onChange={handleInputChange} 
                    placeholder="Eligibility requirements for borrowers..." 
                    rows="3" 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none resize-none" 
                  />
                </div>
              </div>
            )}

            {submitError && (
              <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 font-medium">{submitError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center gap-4 flex-shrink-0 rounded-b-3xl">
          <button 
            type="button"
            onClick={() => activeTab > 0 ? handlePrevious() : onClose()} 
            className="px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            {activeTab === 0 ? (
              <>
                <X className="w-4 h-4" />
                Close
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4" />
                Previous
              </>
            )}
          </button>

          <div className="flex gap-3">
            {activeTab < formTabs.length - 1 ? (
              <>
                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Skip & Submit'}
                </button>
                <button 
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOrganizationModal;