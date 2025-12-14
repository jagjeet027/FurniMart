import React, { useState } from 'react';
import { X, Building, Mail, Phone, Globe, MapPin, DollarSign, FileText, User, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitOrganization } from '../services/apiService';

const AddOrganizationModal = ({ isOpen, onClose }) => {
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
    'Personal Loan', 'Business Loan', 'Home Loan', 'Car Loan',
    'Education Loan', 'Agricultural Loan', 'Microfinance', 'Startup Funding',
    'Equipment Financing', 'Working Capital', 'Other'
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
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.organizationName?.trim()) newErrors.organizationName = 'Required';
    if (!formData.organizationType) newErrors.organizationType = 'Required';
    if (!formData.contactPerson?.trim()) newErrors.contactPerson = 'Required';
    if (!formData.email?.trim()) newErrors.email = 'Required';
    if (!formData.phone?.trim()) newErrors.phone = 'Required';
    if (!formData.address?.trim()) newErrors.address = 'Required';
    if (!formData.city?.trim()) newErrors.city = 'Required';
    if (!formData.country?.trim()) newErrors.country = 'Required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    
    if (formData.loanTypes.length === 0) newErrors.loanTypes = 'Select at least one';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('❌ Validation failed');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      console.log('📤 Submitting organization:', formData);
      const result = await submitOrganization(formData);
      
      if (result.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
          setActiveTab(0);
        }, 2000);
      } else {
        setSubmitError(result.message || 'Submission failed');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setSubmitError(error.response?.data?.message || error.message || 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95 }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20 }
  };

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div variants={modalVariants} initial="hidden" animate="visible" className="bg-white rounded-3xl p-12 max-w-md w-full mx-4 text-center shadow-2xl">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.6 }} className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Success!</h2>
          <p className="text-gray-600">Your organization has been submitted successfully. We'll review it within 2-3 business days.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div variants={modalVariants} initial="hidden" animate="visible" className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 flex items-center justify-between">
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

        {/* Tabs */}
        <div className="border-b border-gray-200 px-8 py-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {formTabs.map((tab, idx) => {
              const TabIcon = tab.icon;
              return (
                <button key={idx} onClick={() => setActiveTab(idx)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <TabIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div key="org" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Organization Name *</label>
                    <input name="organizationName" value={formData.organizationName} onChange={handleInputChange} placeholder="Enter organization name" className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.organizationName ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'} focus:outline-none`} />
                    {errors.organizationName && <p className="text-red-600 text-sm mt-2">{errors.organizationName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Organization Type *</label>
                    <select name="organizationType" value={formData.organizationType} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.organizationType ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'} focus:outline-none`}>
                      <option value="">Select type</option>
                      {organizationTypes.map(t => (<option key={t} value={t}>{t}</option>))}
                    </select>
                    {errors.organizationType && <p className="text-red-600 text-sm mt-2">{errors.organizationType}</p>}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} placeholder="Registration #" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" />
                    <input name="establishedYear" type="number" value={formData.establishedYear} onChange={handleInputChange} placeholder="Year" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" />
                  </div>
                </motion.div>
              )}

              {activeTab === 1 && (
                <motion.div key="contact" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <input name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} placeholder="Contact Person *" className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.contactPerson ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'} focus:outline-none`} />
                  <input name="designation" value={formData.designation} onChange={handleInputChange} placeholder="Designation" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" />
                  <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email *" className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'} focus:outline-none`} />
                  <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone *" className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'} focus:outline-none`} />
                  <input name="website" value={formData.website} onChange={handleInputChange} placeholder="Website" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" />
                </motion.div>
              )}

              {activeTab === 2 && (
                <motion.div key="address" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <input name="address" value={formData.address} onChange={handleInputChange} placeholder="Street Address *" className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'} focus:outline-none`} />
                  <div className="grid md:grid-cols-2 gap-4">
                    <input name="city" value={formData.city} onChange={handleInputChange} placeholder="City *" className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'} focus:outline-none`} />
                    <input name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input name="country" value={formData.country} onChange={handleInputChange} placeholder="Country *" className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.country ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'} focus:outline-none`} />
                    <input name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="ZIP Code" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" />
                  </div>
                </motion.div>
              )}

              {activeTab === 3 && (
                <motion.div key="loans" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-4">Loan Types *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {loanTypeOptions.map((type) => (
                        <label key={type} className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-500">
                          <input type="checkbox" checked={formData.loanTypes.includes(type)} onChange={() => handleLoanTypeChange(type)} className="w-5 h-5" />
                          <span className="text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                    {errors.loanTypes && <p className="text-red-600 text-sm mt-2">{errors.loanTypes}</p>}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input name="minLoanAmount" type="number" value={formData.minLoanAmount} onChange={handleInputChange} placeholder="Min Amount" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" />
                    <input name="maxLoanAmount" type="number" value={formData.maxLoanAmount} onChange={handleInputChange} placeholder="Max Amount" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" />
                  </div>
                  <input name="interestRateRange" value={formData.interestRateRange} onChange={handleInputChange} placeholder="e.g., 8.5% - 15.5%" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none" />
                </motion.div>
              )}

              {activeTab === 4 && (
                <motion.div key="details" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Organization description" rows="4" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none resize-none" />
                  <textarea name="specialPrograms" value={formData.specialPrograms} onChange={handleInputChange} placeholder="Special programs or offers" rows="3" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none resize-none" />
                  <textarea name="eligibilityCriteria" value={formData.eligibilityCriteria} onChange={handleInputChange} placeholder="Eligibility criteria" rows="3" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none resize-none" />
                </motion.div>
              )}
            </AnimatePresence>

            {submitError && (
              <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{submitError}</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-8 py-4 flex justify-between gap-4 bg-gray-50">
          <button onClick={() => activeTab > 0 ? setActiveTab(activeTab - 1) : onClose()} className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100">
            {activeTab === 0 ? 'Close' : 'Previous'}
          </button>
          <div className="flex gap-4">
            {activeTab < formTabs.length - 1 && (
              <button onClick={() => setActiveTab(activeTab + 1)} className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300">
                Next
              </button>
            )}
            <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : activeTab === formTabs.length - 1 ? 'Submit' : 'Skip'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddOrganizationModal;