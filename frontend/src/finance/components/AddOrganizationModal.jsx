import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building, Mail, Phone, Globe, MapPin, DollarSign, FileText, User, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';

const AddOrganizationModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    registrationNumber: '',
    establishedYear: '',
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
    eligibilityCriteria: '',
    license: null,
    certificate: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
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
    { label: 'Documents', icon: Briefcase }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
    if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name required';
    if (!formData.organizationType) newErrors.organizationType = 'Organization type required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person required';
    if (!formData.email.trim()) newErrors.email = 'Email required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone required';
    if (!formData.address.trim()) newErrors.address = 'Address required';
    if (!formData.city.trim()) newErrors.city = 'City required';
    if (!formData.country.trim()) newErrors.country = 'Country required';
    if (formData.loanTypes.length === 0) newErrors.loanTypes = 'Select at least one loan type';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
        setFormData({
          organizationName: '', organizationType: '', registrationNumber: '', establishedYear: '',
          contactPerson: '', designation: '', email: '', phone: '', website: '',
          address: '', city: '', state: '', country: '', zipCode: '',
          loanTypes: [], minLoanAmount: '', maxLoanAmount: '', interestRateRange: '',
          description: '', specialPrograms: '', eligibilityCriteria: '', license: null, certificate: null
        });
        setActiveTab(0);
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'Failed to submit. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-3xl p-12 max-w-md w-full mx-4 text-center shadow-2xl"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.6 }}
            className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
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
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50 to-white shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
            >
              <Building className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">Add Your Organization</h2>
              <p className="text-blue-100 text-sm">Step {activeTab + 1} of {formTabs.length}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white px-8 py-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {formTabs.map((tab, idx) => {
              const TabIcon = tab.icon;
              return (
                <motion.button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === idx
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TabIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <AnimatePresence mode="wait">
              {/* Tab 0: Organization */}
              {activeTab === 0 && (
                <motion.div key="org" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Organization Name *</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      placeholder="Enter your organization name"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                        errors.organizationName ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                      }`}
                    />
                    {errors.organizationName && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.organizationName}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Organization Type *</label>
                    <motion.select
                      whileFocus={{ scale: 1.01 }}
                      name="organizationType"
                      value={formData.organizationType}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                        errors.organizationType ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                      }`}
                    >
                      <option value="">Select organization type</option>
                      {organizationTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </motion.select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Registration Number</label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        placeholder="License registration number"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Established Year</label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        name="establishedYear"
                        type="number"
                        value={formData.establishedYear}
                        onChange={handleInputChange}
                        placeholder="YYYY"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 1: Contact */}
              {activeTab === 1 && (
                <motion.div key="contact" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Contact Person *</label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleInputChange}
                        placeholder="Full name"
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                          errors.contactPerson ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Designation</label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        name="designation"
                        value={formData.designation}
                        onChange={handleInputChange}
                        placeholder="Job title"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="contact@company.com"
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                          errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                          errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://www.example.com"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Address */}
              {activeTab === 2 && (
                <motion.div key="address" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Street Address *</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                        errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                      }`}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">City *</label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                          errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">State/Province</label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Country *</label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="Country"
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${
                          errors.country ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">ZIP/Postal Code</label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="ZIP code"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Loans */}
              {activeTab === 3 && (
                <motion.div key="loans" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-4">Loan Types Offered *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {loanTypeOptions.map((type, idx) => (
                        <motion.label
                          key={type}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={formData.loanTypes.includes(type)}
                            onChange={() => handleLoanTypeChange(type)}
                            className="w-5 h-5 rounded text-blue-600"
                          />
                          <span className="text-sm font-medium text-gray-700">{type}</span>
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Minimum Loan Amount</label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        name="minLoanAmount"
                        type="number"
                        value={formData.minLoanAmount}
                        onChange={handleInputChange}
                        placeholder="10000"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Maximum Loan Amount</label>
                      <motion.input
                        whileFocus={{ scale: 1.01 }}
                        name="maxLoanAmount"
                        type="number"
                        value={formData.maxLoanAmount}
                        onChange={handleInputChange}
                        placeholder="5000000"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Interest Rate Range</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      name="interestRateRange"
                      value={formData.interestRateRange}
                      onChange={handleInputChange}
                      placeholder="8.5% - 15.5%"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </motion.div>
              )}

              {/* Tab 4: Details */}
              {activeTab === 4 && (
                <motion.div key="details" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Organization Description</label>
                    <motion.textarea
                      whileFocus={{ scale: 1.01 }}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of your organization"
                      rows="4"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Special Programs</label>
                    <motion.textarea
                      whileFocus={{ scale: 1.01 }}
                      name="specialPrograms"
                      value={formData.specialPrograms}
                      onChange={handleInputChange}
                      placeholder="Any special loan programs or offers"
                      rows="3"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Eligibility Criteria</label>
                    <motion.textarea
                      whileFocus={{ scale: 1.01 }}
                      name="eligibilityCriteria"
                      value={formData.eligibilityCriteria}
                      onChange={handleInputChange}
                      placeholder="General eligibility requirements"
                      rows="3"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* Tab 5: Documents */}
              {activeTab === 5 && (
                <motion.div key="docs" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">License Document</label>
                    <motion.div whileHover={{ scale: 1.02 }} className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition-all">
                      <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <input
                        type="file"
                        name="license"
                        onChange={handleInputChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        id="license-upload"
                      />
                      <label htmlFor="license-upload" className="cursor-pointer">
                        <p className="text-sm font-medium text-gray-900">Click to upload license</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                      </label>
                    </motion.div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Certificate</label>
                    <motion.div whileHover={{ scale: 1.02 }} className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500 transition-all">
                      <Briefcase className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <input
                        type="file"
                        name="certificate"
                        onChange={handleInputChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        id="cert-upload"
                      />
                      <label htmlFor="cert-upload" className="cursor-pointer">
                        <p className="text-sm font-medium text-gray-900">Click to upload certificate</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                      </label>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-50 border-2 border-red-200 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700 font-medium">{errors.submit}</p>
              </motion.div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-8 py-4 flex justify-between gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => activeTab > 0 ? setActiveTab(activeTab - 1) : onClose()}
            className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
          >
            {activeTab === 0 ? 'Close' : 'Previous'}
          </motion.button>

          <div className="flex gap-4">
            {activeTab < formTabs.length - 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(activeTab + 1)}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
              >
                Next
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Submitting...' : activeTab === formTabs.length - 1 ? 'Submit' : 'Skip'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddOrganizationModal;