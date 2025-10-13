import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, FileText, User, Mail, Phone, Briefcase,
  Linkedin, Globe, MessageSquare, CheckCircle, AlertCircle, X,
  Building2, MapPin, DollarSign, GraduationCap, Calendar
} from 'lucide-react';

const JobApplicationForm = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', experience: '', linkedin: '', portfolio: '',
    coverLetter: '', university: '', degree: '', graduationYear: '', cgpa: '',
    skills: '', address: ''
  });
  
  const [resumeFile, setResumeFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api/careers';

  const formatSalary = (salary) => {
    if (!salary) return 'Competitive';
    if (typeof salary === 'object') {
      const min = salary.min || '';
      const max = salary.max || '';
      const currency = salary.currency || '₹';
      if (min && max) return `${currency}${min} - ${currency}${max} LPA`;
      else if (min) return `${currency}${min}+ LPA`;
      else if (max) return `Up to ${currency}${max} LPA`;
    }
    return salary;
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
        if (response.ok) {
          const jobData = await response.json();
          setJob(jobData);
        } else {
          navigate('/careers');
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        navigate('/careers');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) fetchJobDetails();
  }, [jobId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, resume: 'Only PDF, DOC, and DOCX files are allowed' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, resume: 'File size must be less than 10MB' }));
      return;
    }
    setResumeFile(file);
    if (errors.resume) {
      setErrors(prev => ({ ...prev, resume: '' }));
    }
  };

  const removeFile = () => setResumeFile(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.experience.trim()) newErrors.experience = 'Experience is required';
    if (!resumeFile) newErrors.resume = 'Resume is required';
    if (!formData.coverLetter.trim()) newErrors.coverLetter = 'Cover letter is required';
    if (!formData.university.trim()) newErrors.university = 'University is required';
    if (!formData.degree.trim()) newErrors.degree = 'Degree is required';
    if (!formData.graduationYear.trim()) newErrors.graduationYear = 'Graduation year is required';
    if (formData.linkedin && !formData.linkedin.includes('linkedin.com')) {
      newErrors.linkedin = 'Please provide a valid LinkedIn URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const submitFormData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) submitFormData.append(key, formData[key]);
      });
      if (resumeFile) submitFormData.append('resume', resumeFile);

      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        body: submitFormData
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Application submitted successfully! We will contact you soon.',
          applicationId: result.applicationId
        });
        
        setFormData({
          name: '', email: '', phone: '', experience: '', linkedin: '', portfolio: '',
          coverLetter: '', university: '', degree: '', graduationYear: '', cgpa: '',
          skills: '', address: ''
        });
        setResumeFile(null);
        setErrors({});
        
        setTimeout(() => navigate('/careers'), 3000);
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.message || 'Failed to submit application'
        });
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-800 text-sm sm:text-base">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-amber-900 mb-2">Job Not Found</h2>
          <p className="text-amber-700 mb-6 text-sm sm:text-base">The job you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/careers')}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-b-2 border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <button
            onClick={() => navigate('/careers')}
            className="flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Jobs</span>
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-2">Apply for {job.title}</h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-amber-800 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{job.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{formatSalary(job.salary)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {submitStatus && (
          <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl border-2 ${
            submitStatus.type === 'success' 
              ? 'bg-green-50 border-green-300 text-green-800' 
              : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              {submitStatus.type === 'success' ? (
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              )}
              <div>
                <p className="font-semibold text-sm sm:text-base">{submitStatus.message}</p>
                {submitStatus.applicationId && (
                  <p className="text-xs sm:text-sm mt-1 opacity-75">Application ID: {submitStatus.applicationId}</p>
                )}
                {submitStatus.type === 'success' && (
                  <p className="text-xs sm:text-sm mt-1 opacity-75">Redirecting to jobs page in 3 seconds...</p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-amber-200 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-amber-900 mb-4 sm:mb-6 flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-amber-50 border-2 rounded-lg sm:rounded-xl text-amber-900 placeholder-amber-400 focus:ring-2 transition-colors text-sm sm:text-base ${
                    errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-amber-200 focus:border-amber-400 focus:ring-amber-200'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-amber-50 border-2 rounded-lg sm:rounded-xl text-amber-900 placeholder-amber-400 focus:ring-2 transition-colors text-sm sm:text-base ${
                    errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-amber-200 focus:border-amber-400 focus:ring-amber-200'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-amber-50 border-2 rounded-lg sm:rounded-xl text-amber-900 placeholder-amber-400 focus:ring-2 transition-colors text-sm sm:text-base ${
                    errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-amber-200 focus:border-amber-400 focus:ring-amber-200'
                  }`}
                  placeholder="+91 9876543210"
                />
                {errors.phone && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">Years of Experience *</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-amber-50 border-2 rounded-lg sm:rounded-xl text-amber-900 focus:ring-2 transition-colors appearance-none cursor-pointer text-sm sm:text-base ${
                    errors.experience ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-amber-200 focus:border-amber-400 focus:ring-amber-200'
                  }`}
                >
                  <option value="">Select experience level</option>
                  <option value="0-1">0-1 years (Fresher)</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-8">5-8 years</option>
                  <option value="8+">8+ years</option>
                </select>
                {errors.experience && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.experience}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-amber-800 mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-amber-50 border-2 border-amber-200 rounded-lg sm:rounded-xl text-amber-900 placeholder-amber-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-colors resize-none text-sm sm:text-base"
                  placeholder="Enter your full address"
                />
              </div>
            </div>
          </div>

          {/* Educational Information */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-amber-200 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-amber-900 mb-4 sm:mb-6 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
              Educational Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">University/Institution *</label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-amber-50 border-2 rounded-lg sm:rounded-xl text-amber-900 placeholder-amber-400 focus:ring-2 transition-colors text-sm sm:text-base ${
                    errors.university ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-amber-200 focus:border-amber-400 focus:ring-amber-200'
                  }`}
                  placeholder="Enter your university name"
                />
                {errors.university && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.university}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">Degree/Course *</label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-amber-50 border-2 rounded-lg sm:rounded-xl text-amber-900 placeholder-amber-400 focus:ring-2 transition-colors text-sm sm:text-base ${
                    errors.degree ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-amber-200 focus:border-amber-400 focus:ring-amber-200'
                  }`}
                  placeholder="e.g., B.Tech Computer Science"
                />
                {errors.degree && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.degree}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">Graduation Year *</label>
                <select
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-amber-50 border-2 rounded-lg sm:rounded-xl text-amber-900 focus:ring-2 transition-colors appearance-none cursor-pointer text-sm sm:text-base ${
                    errors.graduationYear ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-amber-200 focus:border-amber-400 focus:ring-amber-200'
                  }`}
                >
                  <option value="">Select graduation year</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + 5 - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
                {errors.graduationYear && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.graduationYear}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">CGPA/Percentage</label>
                <input
                  type="text"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-amber-50 border-2 border-amber-200 rounded-lg sm:rounded-xl text-amber-900 placeholder-amber-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-colors text-sm sm:text-base"
                  placeholder="e.g., 8.5 CGPA or 85%"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-amber-800 mb-2">Skills & Technologies</label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-amber-50 border-2 border-amber-200 rounded-lg sm:rounded-xl text-amber-900 placeholder-amber-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-colors resize-none text-sm sm:text-base"
                  placeholder="List your technical skills, programming languages, frameworks, etc."
                />
              </div>
            </div>
          </div>

          {/* Professional Links */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-amber-200 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-amber-900 mb-4 sm:mb-6 flex items-center gap-2">
              <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              Professional Links
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-amber-50 border-2 rounded-lg sm:rounded-xl text-amber-900 placeholder-amber-400 focus:ring-2 transition-colors text-sm sm:text-base ${
                    errors.linkedin ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-amber-200 focus:border-amber-400 focus:ring-amber-200'
                  }`}
                  placeholder="https://linkedin.com/in/your-profile"
                />
                {errors.linkedin && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.linkedin}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">Portfolio/Website</label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-amber-50 border-2 border-amber-200 rounded-lg sm:rounded-xl text-amber-900 placeholder-amber-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-colors text-sm sm:text-base"
                  placeholder="https://your-portfolio.com"
                />
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-amber-200 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-amber-900 mb-4 sm:mb-6 flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              Resume Upload *
            </h2>
            
            <div
              className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center transition-all ${
                dragActive 
                  ? 'border-amber-500 bg-amber-100/50' 
                  : errors.resume 
                  ? 'border-red-400 bg-red-50' 
                  : 'border-amber-300 bg-amber-50/50 hover:border-amber-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {resumeFile ? (
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-3 text-green-600">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-medium text-sm sm:text-base">{resumeFile.name}</p>
                      <p className="text-xs sm:text-sm text-amber-600">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-amber-200 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-medium text-amber-900">Upload your resume</p>
                    <p className="text-amber-700 text-sm sm:text-base">Drag and drop or click to browse</p>
                    <p className="text-xs sm:text-sm text-amber-600 mt-2">PDF, DOC, DOCX up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
            {errors.resume && <p className="text-red-500 text-xs sm:text-sm mt-2">{errors.resume}</p>}
          </div>

          {/* Cover Letter */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-amber-200 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-amber-900 mb-4 sm:mb-6 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
              Cover Letter *
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                Tell us why you're interested in this position
              </label>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                rows={6}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-amber-50 border-2 rounded-lg sm:rounded-xl text-amber-900 placeholder-amber-400 focus:ring-2 transition-colors resize-none text-sm sm:text-base ${
                  errors.coverLetter ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-amber-200 focus:border-amber-400 focus:ring-amber-200'
                }`}
                placeholder="Describe your interest in this role, relevant experience, and what you can bring to our team..."
              />
              {errors.coverLetter && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.coverLetter}</p>}
              <p className="text-xs sm:text-sm text-amber-600 mt-2">Minimum 100 characters recommended</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 border-2 border-amber-300 text-center shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-3">Ready to Submit?</h3>
            <p className="text-amber-800 mb-5 text-sm sm:text-base">
              Please review all information before submitting. We'll get back to you within 2-3 business days.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                type="button"
                onClick={() => navigate('/careers')}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg sm:rounded-xl font-semibold transition-colors text-sm sm:text-base"
                disabled={submitting}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[180px] sm:min-w-[200px] text-sm sm:text-base"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationForm;