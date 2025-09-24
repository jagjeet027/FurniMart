import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  FileText,
  User,
  Mail,
  Phone,
  Briefcase,
  Linkedin,
  Globe,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  X,
  Building2,
  MapPin,
  DollarSign,
  GraduationCap,
  Calendar
} from 'lucide-react';

const JobApplicationForm = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  // State for job details
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form state - matching backend structure
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    linkedin: '',
    portfolio: '',
    coverLetter: '',
    // Student details
    university: '',
    degree: '',
    graduationYear: '',
    cgpa: '',
    skills: '',
    address: ''
  });
  
  const [resumeFile, setResumeFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api/careers';

  // Format salary properly
  const formatSalary = (salary) => {
    if (!salary) return 'Competitive';
    if (typeof salary === 'object') {
      const min = salary.min || '';
      const max = salary.max || '';
      const currency = salary.currency || '₹';
      if (min && max) {
        return `${currency}${min} - ${currency}${max} LPA`;
      } else if (min) {
        return `${currency}${min}+ LPA`;
      } else if (max) {
        return `Up to ${currency}${max} LPA`;
      }
    }
    return salary;
  };

  // Fetch job details
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

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId, navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle file drag and drop
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
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        resume: 'Only PDF, DOC, and DOCX files are allowed'
      }));
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        resume: 'File size must be less than 10MB'
      }));
      return;
    }

    setResumeFile(file);
    if (errors.resume) {
      setErrors(prev => ({
        ...prev,
        resume: ''
      }));
    }
  };

  const removeFile = () => {
    setResumeFile(null);
  };

  // Form validation
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
    
    // Student details validation
    if (!formData.university.trim()) newErrors.university = 'University is required';
    if (!formData.degree.trim()) newErrors.degree = 'Degree is required';
    if (!formData.graduationYear.trim()) newErrors.graduationYear = 'Graduation year is required';

    // Validate LinkedIn URL if provided
    if (formData.linkedin && !formData.linkedin.includes('linkedin.com')) {
      newErrors.linkedin = 'Please provide a valid LinkedIn URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const submitFormData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitFormData.append(key, formData[key]);
        }
      });
      
      // Append resume file
      if (resumeFile) {
        submitFormData.append('resume', resumeFile);
      }

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
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          experience: '',
          linkedin: '',
          portfolio: '',
          coverLetter: '',
          university: '',
          degree: '',
          graduationYear: '',
          cgpa: '',
          skills: '',
          address: ''
        });
        setResumeFile(null);
        setErrors({});
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          navigate('/careers');
        }, 3000);
        
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Job Not Found</h2>
          <p className="text-slate-400 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/careers')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/careers')}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Jobs
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Apply for {job.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-slate-300">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{job.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatSalary(job.salary)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Status Messages */}
        {submitStatus && (
          <div className={`mb-8 p-6 rounded-xl border ${
            submitStatus.type === 'success' 
              ? 'bg-green-900/20 border-green-500/30 text-green-300' 
              : 'bg-red-900/20 border-red-500/30 text-red-300'
          }`}>
            <div className="flex items-center gap-3">
              {submitStatus.type === 'success' ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
              <div>
                <p className="font-semibold">{submitStatus.message}</p>
                {submitStatus.applicationId && (
                  <p className="text-sm mt-1 opacity-75">Application ID: {submitStatus.applicationId}</p>
                )}
                {submitStatus.type === 'success' && (
                  <p className="text-sm mt-1 opacity-75">Redirecting to jobs page in 3 seconds...</p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-white placeholder-slate-400 focus:ring-1 transition-colors ${
                    errors.name ? 'border-red-500 focus:border-red-400 focus:ring-red-400' : 'border-slate-600 focus:border-cyan-400 focus:ring-cyan-400'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-white placeholder-slate-400 focus:ring-1 transition-colors ${
                    errors.email ? 'border-red-500 focus:border-red-400 focus:ring-red-400' : 'border-slate-600 focus:border-cyan-400 focus:ring-cyan-400'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-white placeholder-slate-400 focus:ring-1 transition-colors ${
                    errors.phone ? 'border-red-500 focus:border-red-400 focus:ring-red-400' : 'border-slate-600 focus:border-cyan-400 focus:ring-cyan-400'
                  }`}
                  placeholder="+91 9876543210"
                />
                {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Years of Experience *
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-white focus:ring-1 transition-colors appearance-none cursor-pointer ${
                    errors.experience ? 'border-red-500 focus:border-red-400 focus:ring-red-400' : 'border-slate-600 focus:border-cyan-400 focus:ring-cyan-400'
                  }`}
                >
                  <option value="">Select experience level</option>
                  <option value="0-1">0-1 years (Fresher)</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-8">5-8 years</option>
                  <option value="8+">8+ years</option>
                </select>
                {errors.experience && <p className="text-red-400 text-sm mt-1">{errors.experience}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors resize-none"
                  placeholder="Enter your full address"
                />
              </div>
            </div>
          </div>

          {/* Educational Information */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-400" />
              Educational Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  University/Institution *
                </label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-white placeholder-slate-400 focus:ring-1 transition-colors ${
                    errors.university ? 'border-red-500 focus:border-red-400 focus:ring-red-400' : 'border-slate-600 focus:border-cyan-400 focus:ring-cyan-400'
                  }`}
                  placeholder="Enter your university name"
                />
                {errors.university && <p className="text-red-400 text-sm mt-1">{errors.university}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Degree/Course *
                </label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-white placeholder-slate-400 focus:ring-1 transition-colors ${
                    errors.degree ? 'border-red-500 focus:border-red-400 focus:ring-red-400' : 'border-slate-600 focus:border-cyan-400 focus:ring-cyan-400'
                  }`}
                  placeholder="e.g., B.Tech Computer Science"
                />
                {errors.degree && <p className="text-red-400 text-sm mt-1">{errors.degree}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Graduation Year *
                </label>
                <select
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-white focus:ring-1 transition-colors appearance-none cursor-pointer ${
                    errors.graduationYear ? 'border-red-500 focus:border-red-400 focus:ring-red-400' : 'border-slate-600 focus:border-cyan-400 focus:ring-cyan-400'
                  }`}
                >
                  <option value="">Select graduation year</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + 5 - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
                {errors.graduationYear && <p className="text-red-400 text-sm mt-1">{errors.graduationYear}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  CGPA/Percentage
                </label>
                <input
                  type="text"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  placeholder="e.g., 8.5 CGPA or 85%"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Skills & Technologies
                </label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors resize-none"
                  placeholder="List your technical skills, programming languages, frameworks, etc."
                />
              </div>
            </div>
          </div>

          {/* Professional Links */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-blue-400" />
              Professional Links
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-white placeholder-slate-400 focus:ring-1 transition-colors ${
                    errors.linkedin ? 'border-red-500 focus:border-red-400 focus:ring-red-400' : 'border-slate-600 focus:border-cyan-400 focus:ring-cyan-400'
                  }`}
                  placeholder="https://linkedin.com/in/your-profile"
                />
                {errors.linkedin && <p className="text-red-400 text-sm mt-1">{errors.linkedin}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Portfolio/Website
                </label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  placeholder="https://your-portfolio.com"
                />
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-400" />
              Resume Upload *
            </h2>
            
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragActive 
                  ? 'border-cyan-400 bg-cyan-400/10' 
                  : errors.resume 
                  ? 'border-red-500 bg-red-500/10' 
                  : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
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
                  <div className="flex items-center gap-3 text-green-400">
                    <CheckCircle className="w-6 h-6" />
                    <div className="text-left">
                      <p className="font-medium">{resumeFile.name}</p>
                      <p className="text-sm text-slate-400">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-white">Upload your resume</p>
                    <p className="text-slate-400">Drag and drop or click to browse</p>
                    <p className="text-sm text-slate-500 mt-2">PDF, DOC, DOCX up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
            {errors.resume && <p className="text-red-400 text-sm mt-2">{errors.resume}</p>}
          </div>

          {/* Cover Letter */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              Cover Letter *
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tell us why you're interested in this position and what makes you a good fit
              </label>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                rows={8}
                className={`w-full px-4 py-3 bg-slate-900 border rounded-xl text-white placeholder-slate-400 focus:ring-1 transition-colors resize-none ${
                  errors.coverLetter ? 'border-red-500 focus:border-red-400 focus:ring-red-400' : 'border-slate-600 focus:border-cyan-400 focus:ring-cyan-400'
                }`}
                placeholder="Describe your interest in this role, relevant experience, projects you've worked on, and what you can bring to our team..."
              />
              {errors.coverLetter && <p className="text-red-400 text-sm mt-1">{errors.coverLetter}</p>}
              <p className="text-sm text-slate-500 mt-2">Minimum 100 characters recommended</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-8 border border-slate-600 text-center">
            <h3 className="text-xl font-bold text-white mb-4">Ready to Submit Your Application?</h3>
            <p className="text-slate-300 mb-6">
              Please review all your information before submitting. We'll get back to you within 2-3 business days.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => navigate('/careers')}
                className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[200px]"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <CheckCircle className="w-5 h-5" />
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