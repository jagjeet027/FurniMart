import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import api from '../../axios/axiosInstance'; // Use the configured api instance

// AlreadySubmittedPopup component
const AlreadySubmittedPopup = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className="bg-blue-950 p-8 rounded-lg max-w-md mx-4 border border-blue-800"
    >
      <div className="text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-blue-400 mb-4">Already Submitted</h3>
        <p className="text-blue-100 mb-6">
          You have already submitted your manufacturer registration. Please wait for admin approval.
        </p>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
        >
          Got it
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const ManufacturerRegistration = () => {
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [businessTypes] = useState([
    'corporation',
    'llc',
    'partnership',
    'sole_proprietorship'
  ]);

  // New states for submission status checking
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showAlreadySubmittedPopup, setShowAlreadySubmittedPopup] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    yearEstablished: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    contactPerson: '',
    email: '',
    phone: '',
  });

  const [files, setFiles] = useState({
    businessLicense: null,
    taxCertificate: null,
    qualityCertifications: []
  });

  useEffect(() => {
    if (user?.isManufacturer) {
      setSuccessMessage('You are already registered as a manufacturer!');
      const timer = setTimeout(() => {
        navigate('/manufacturer/dashboard/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // Check if user has already submitted registration
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      try {
        const response = await api.get('/manufacturers/me');
        if (response.data.success) {
          setHasSubmitted(true);
          setShowAlreadySubmittedPopup(true);
        }
      } catch (error) {
        // If 404, user hasn't submitted yet - this is normal
        if (error.response?.status !== 404) {
          console.error('Error checking submission status:', error);
        }
      }
    };

    if (user && !user.isManufacturer) {
      checkSubmissionStatus();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    
    if (name === 'qualityCertifications') {
      setFiles(prev => ({
        ...prev,
        [name]: [...prev[name], ...fileList]
      }));
    } else {
      setFiles(prev => ({
        ...prev,
        [name]: fileList[0]
      }));
    }
  };

  const removeQualityCertification = (index) => {
    setFiles(prev => ({
      ...prev,
      qualityCertifications: prev.qualityCertifications.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    for (const key in formData) {
      if (!formData[key]) {
        setErrorMessage(`Please fill in the ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
        return false;
      }
    }
    if (!files.businessLicense || !files.taxCertificate) {
      setErrorMessage('Please upload all required documents');
      return false;
    }
    const currentYear = new Date().getFullYear();
    const year = parseInt(formData.yearEstablished);
    if (year < 1800 || year > currentYear) {
      setErrorMessage(`Year must be between 1800 and ${currentYear}`);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      setErrorMessage('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Check if already submitted before proceeding
    if (hasSubmitted) {
      setShowAlreadySubmittedPopup(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Append form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      // Append files
      if (files.businessLicense) {
        formDataToSend.append('businessLicense', files.businessLicense);
      }
      
      if (files.taxCertificate) {
        formDataToSend.append('taxCertificate', files.taxCertificate);
      }
      
      files.qualityCertifications.forEach(file => {
        formDataToSend.append('qualityCertifications', file);
      });

      const response = await api.post('/manufacturers/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccessMessage('Registration submitted successfully! Redirecting...');
        setHasSubmitted(true);
        await refreshUserData(); 
        
        // Redirect to home page after successful submission
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('An error occurred during registration. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.isManufacturer) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-r from-blue-900 to-indigo-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-blue-900/80 p-10 rounded-lg text-center max-w-lg backdrop-blur-sm border border-blue-800/50 shadow-xl"
        >
          <h2 className="text-3xl font-bold text-blue-400 mb-4">You're already registered!</h2>
          <p className="text-blue-100 mb-6">{successMessage}</p>
          <div className="text-blue-300 italic">Redirecting to dashboard...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 min-h-screen bg-gradient-to-r from-blue-900 to-indigo-900 text-blue-50 font-sans">
      {/* Already Submitted Popup */}
      {showAlreadySubmittedPopup && (
        <AlreadySubmittedPopup 
          onClose={() => {
            setShowAlreadySubmittedPopup(false);
            navigate('/');
          }} 
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto bg-blue-950/80 backdrop-blur-sm rounded-xl p-6 lg:p-8 shadow-2xl border border-blue-800/30"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-blue-400">Manufacturer Registration</h1>
        
        {errorMessage && (
          <div className="bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-900/30 border-l-4 border-green-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Business Information Section */}
          <div className="bg-blue-900/40 p-6 rounded-lg relative overflow-hidden">
            <div className="absolute left-0 top-0 w-1 h-full bg-blue-400"></div>
            
            <h2 className="text-xl font-semibold mb-6 text-blue-400 pb-2 border-b border-blue-800/50 relative">
              Business Information
            </h2>
            
            <div className="mb-5">
              <label htmlFor="businessName" className="block mb-2 font-medium">Business Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full p-3 bg-blue-950 border border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
              <div className="relative">
                <label htmlFor="businessType" className="block mb-2 font-medium">Business Type <span className="text-red-400">*</span></label>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full p-3 bg-blue-950 border border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none"
                  required
                >
                  <option value="">Select Business Type</option>
                  {businessTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 top-8 flex items-center px-2 text-blue-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              <div>
                <label htmlFor="yearEstablished" className="block mb-2 font-medium">Year Established <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  id="yearEstablished"
                  name="yearEstablished"
                  value={formData.yearEstablished}
                  onChange={handleChange}
                  min="1800"
                  max={new Date().getFullYear()}
                  className="w-full p-3 bg-blue-950 border border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Address Section */}
          <div className="bg-blue-900/40 p-6 rounded-lg relative overflow-hidden">
            <div className="absolute left-0 top-0 w-1 h-full bg-blue-400"></div>
            
            <h2 className="text-xl font-semibold mb-6 text-blue-400 pb-2 border-b border-blue-800/50">
              Business Address
            </h2>
            
            <div className="mb-5">
              <label htmlFor="streetAddress" className="block mb-2 font-medium">Street Address <span className="text-red-400">*</span></label>
              <input
                type="text"
                id="streetAddress"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                className="w-full p-3 bg-blue-950 border border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
              <div>
                <label htmlFor="city" className="block mb-2 font-medium">City <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-3 bg-blue-950 border border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block mb-2 font-medium">State/Province <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full p-3 bg-blue-950 border border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="postalCode" className="block mb-2 font-medium">Postal Code <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full p-3 bg-blue-950 border border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="country" className="block mb-2 font-medium">Country <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full p-3 bg-blue-950 border border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Contact Information Section */}
          <div className="bg-blue-900/40 p-6 rounded-lg relative overflow-hidden">
            <div className="absolute left-0 top-0 w-1 h-full bg-blue-400"></div>
            
            <h2 className="text-xl font-semibold mb-6 text-blue-400 pb-2 border-b border-blue-800/50">
              Contact Information
            </h2>
            
            <div className="mb-5">
              <label htmlFor="contactPerson" className="block mb-2 font-medium">Contact Person <span className="text-red-400">*</span></label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className="w-full p-3 bg-blue-950 border border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block mb-2 font-medium">Email Address <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 bg-blue-950 border border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block mb-2 font-medium">Phone Number <span className="text-red-400">*</span></label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (123) 456-7890"
                  className="w-full p-3 bg-blue-950 border border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Document Uploads Section */}
          <div className="bg-blue-900/40 p-6 rounded-lg relative overflow-hidden">
            <div className="absolute left-0 top-0 w-1 h-full bg-blue-400"></div>
            
            <h2 className="text-xl font-semibold mb-6 text-blue-400 pb-2 border-b border-blue-800/50">
              Required Documents
            </h2>
            
            <div className="mb-6">
              <label htmlFor="businessLicense" className="block mb-2 font-medium">Business License <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type="file"
                  id="businessLicense"
                  name="businessLicense"
                  onChange={handleFileChange}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                  required
                />
                <div className="bg-blue-800 text-blue-100 py-3 px-4 rounded-md inline-flex items-center cursor-pointer">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Select File
                </div>
                {files.businessLicense && (
                  <span className="ml-3 text-sm text-blue-300">{files.businessLicense.name}</span>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="taxCertificate" className="block mb-2 font-medium">Tax Certificate <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type="file"
                  id="taxCertificate"
                  name="taxCertificate"
                  onChange={handleFileChange}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                  required
                />
                <div className="bg-blue-800 text-blue-100 py-3 px-4 rounded-md inline-flex items-center cursor-pointer">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Select File
                </div>
                {files.taxCertificate && (
                  <span className="ml-3 text-sm text-blue-300">{files.taxCertificate.name}</span>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="qualityCertifications" className="block mb-2 font-medium">
                Quality Certifications (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="qualityCertifications"
                  name="qualityCertifications"
                  onChange={handleFileChange}
                  multiple
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                />
                <div className="bg-blue-800 text-blue-100 py-3 px-4 rounded-md inline-flex items-center cursor-pointer">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Select Files
                </div>
              </div>
              
              {files.qualityCertifications.length > 0 && (
                <div className="mt-4 bg-blue-950/50 p-4 rounded-md">
                  <p className="text-blue-400 font-medium mb-2">Uploaded files:</p>
                  <ul className="space-y-2">
                    {files.qualityCertifications.map((file, index) => (
                      <li key={index} className="flex justify-between items-center py-2 border-b border-blue-800/30 last:border-0">
                        <span className="text-sm">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeQualityCertification(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="text-center mt-8">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`
                px-10 py-3 rounded-full font-semibold text-lg relative overflow-hidden
                ${isSubmitting 
                  ? 'bg-blue-700 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-blue-500/50 transition-all'
                }
              `}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                'Register as Manufacturer'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ManufacturerRegistration;