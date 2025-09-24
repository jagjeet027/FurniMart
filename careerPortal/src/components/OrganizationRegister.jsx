import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Users,
  Plus,
  X,
  User,
  BookOpen,
  GraduationCap,
  Calendar,
  Award,
  Sparkles,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Globe,
  Star,
  Target,
  Zap,
  Shield,
  ArrowRight,
  ArrowLeft,
  Save,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  CheckSquare,
  Loader
} from 'lucide-react';

// OrganizationService
const OrganizationService = {
  async testConnection() {
    try {
      const response = await fetch('http://localhost:5000/api/organizations/test');
      return response.ok;
    } catch (error) {
      return false;
    }
  },
  
  async register(organizationData, candidates) {
    const formData = new FormData();
    formData.append('organizationData', JSON.stringify(organizationData));
    formData.append('candidates', JSON.stringify(candidates));
    
    if (organizationData.logo) {
      formData.append('logo', organizationData.logo);
    }
    
    const response = await fetch('http://localhost:5000/api/organizations', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Registration failed');
    }
    
    return result;
  },
  
  async parseStudentFile(formData) {
    const response = await fetch('http://localhost:5000/api/organizations/parse-student-file', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to parse file');
    }
    
    return result;
  },
  
  async downloadStudentTemplate() {
    const response = await fetch('http://localhost:5000/api/organizations/student-template');
    if (!response.ok) {
      throw new Error('Failed to download template');
    }
    return response.blob();
  }
};

const OrganizationRegister = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showCandidateList, setShowCandidateList] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [bulkUploadData, setBulkUploadData] = useState([]);
  const [uploadPreview, setUploadPreview] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  
  const [organizationData, setOrganizationData] = useState({
    name: '',
    type: 'College',
    location: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    establishedYear: '',
    accreditation: '',
    logo: null
  });

  const [candidateData, setCandidateData] = useState({
    name: '',
    rollNo: '',
    email: '',
    phone: '',
    branch: '',
    specialization: '',
    year: '',
    cgpa: '',
    skills: [],
    projects: [],
    internships: [],
    achievements: []
  });

  const [candidates, setCandidates] = useState([]);
  const [candidateFilter, setCandidateFilter] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [editingCandidate, setEditingCandidate] = useState(null);

  const organizationTypes = ['College', 'University', 'Technical Institute', 'Training Center', 'Research Institute'];
  const branches = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Electrical', 'Biotechnology', 'Other'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated', 'Post Graduate'];

  // File upload functionality
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload only Excel (.xlsx, .xls) or CSV files');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size should be less than 10MB');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await OrganizationService.parseStudentFile(formData);
      
      if (response.success) {
        setBulkUploadData(response.data);
        setUploadPreview(response.data.slice(0, 5));
        setValidationErrors(response.validationErrors || []);
        setError('');
      } else {
        setError(response.message || 'Failed to parse file');
      }
    } catch (error) {
      console.error('File upload error:', error);
      setError('Failed to parse file. Please check the format and try again.');
    } finally {
      setLoading(false);
    }
  };

  const processBulkUpload = () => {
    if (bulkUploadData.length === 0) {
      setError('No valid data to upload');
      return;
    }

    const validData = bulkUploadData.filter(student => {
      return student.name && student.rollNo && student.branch;
    });

    if (validData.length === 0) {
      setError('No valid students found. Please check required fields: Name, Roll Number, and Branch');
      return;
    }

    const existingRollNumbers = candidates.map(c => c.rollNo.toLowerCase());
    const duplicates = validData.filter(student => 
      existingRollNumbers.includes(student.rollNo.toLowerCase())
    );

    if (duplicates.length > 0) {
      setError(`Found duplicate roll numbers: ${duplicates.map(d => d.rollNo).join(', ')}`);
      return;
    }

    const newCandidates = validData.map(student => ({
      ...student,
      id: Date.now() + Math.random(),
      addedDate: new Date().toISOString(),
      skills: typeof student.skills === 'string' 
        ? student.skills.split(',').map(s => s.trim()).filter(s => s) 
        : student.skills || []
    }));

    setCandidates(prev => [...prev, ...newCandidates]);
    
    setBulkUploadData([]);
    setUploadPreview([]);
    setValidationErrors([]);
    setShowBulkUpload(false);
    setError('');
    
    setTimeout(() => {
      alert(`Successfully added ${newCandidates.length} students!`);
    }, 100);
  };

  const downloadTemplate = async () => {
    try {
      const response = await OrganizationService.downloadStudentTemplate();
      
      const url = URL.createObjectURL(response);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'student-template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Template download error:', error);
      setError('Failed to download template');
    }
  };

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleOrganizationChange = (field, value) => {
    setError('');
    setOrganizationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCandidateChange = (field, value) => {
    setCandidateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Logo file size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setOrganizationData(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  const addSkill = (skill) => {
    if (skill.trim() && !candidateData.skills.includes(skill.trim())) {
      setCandidateData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setCandidateData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const resetCandidateForm = () => {
    setCandidateData({
      name: '',
      rollNo: '',
      email: '',
      phone: '',
      branch: '',
      specialization: '',
      year: '',
      cgpa: '',
      skills: [],
      projects: [],
      internships: [],
      achievements: []
    });
  };

  const addCandidate = () => {
    if (candidateData.name && candidateData.rollNo && candidateData.branch) {
      const newCandidate = {
        ...candidateData,
        id: editingCandidate ? editingCandidate.id : Date.now(),
        addedDate: editingCandidate ? editingCandidate.addedDate : new Date().toISOString()
      };
      
      if (editingCandidate) {
        setCandidates(prev => prev.map(c => c.id === editingCandidate.id ? newCandidate : c));
        setEditingCandidate(null);
      } else {
        if (candidates.some(c => c.rollNo.toLowerCase() === candidateData.rollNo.toLowerCase())) {
          setError('A student with this roll number already exists');
          return;
        }
        setCandidates(prev => [...prev, newCandidate]);
      }
      
      resetCandidateForm();
      setShowAddCandidate(false);
      setError('');
    } else {
      setError('Please fill in required fields: Name, Roll Number, and Branch');
    }
  };

  const editCandidate = (candidate) => {
    setCandidateData(candidate);
    setEditingCandidate(candidate);
    setShowAddCandidate(true);
  };

  const deleteCandidate = (id) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  const exportCandidates = async () => {
    try {
      setLoading(true);
      const csvContent = [
        ['Name', 'Roll No', 'Email', 'Phone', 'Branch', 'Specialization', 'Year', 'CGPA', 'Skills'],
        ...candidates.map(c => [
          c.name,
          c.rollNo,
          c.email || '',
          c.phone || '',
          c.branch,
          c.specialization || '',
          c.year || '',
          c.cgpa || '',
          Array.isArray(c.skills) ? c.skills.join('; ') : ''
        ])
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${organizationData.name || 'students'}-candidates.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to export candidates');
    } finally {
      setLoading(false);
    }
  };

  const submitRegistration = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!organizationData.name || !organizationData.email || !organizationData.phone || !organizationData.location) {
        throw new Error('Please fill in all required organization fields');
      }
      
      if (candidates.length === 0) {
        throw new Error('Please add at least one student before submitting');
      }
      
      console.log('Testing server connection...');
      const isConnected = await OrganizationService.testConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to server. Please ensure the backend server is running on http://localhost:5000');
      }
      
      const result = await OrganizationService.register(organizationData, candidates);
      
      setSuccess(true);
      
      setTimeout(() => {
        setCurrentStep(1);
        setOrganizationData({
          name: '',
          type: 'College',
          location: '',
          email: '',
          phone: '',
          website: '',
          description: '',
          establishedYear: '',
          accreditation: '',
          logo: null
        });
        setCandidates([]);
        setSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateStep1 = () => {
    return organizationData.name && 
           organizationData.email && 
           organizationData.phone && 
           organizationData.location;
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(candidateFilter.toLowerCase()) ||
                         candidate.rollNo.toLowerCase().includes(candidateFilter.toLowerCase());
    const matchesBranch = !selectedBranch || candidate.branch === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  // Error Alert Component
  const ErrorAlert = ({ message, onClose }) => {
    if (!message) return null;
    
    return (
      <div className="fixed top-4 right-4 z-50 max-w-md">
        <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{message}</p>
            <button
              onClick={onClose}
              className="text-red-400 hover:text-red-300 ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-cyan-900 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-center max-w-md mx-auto border border-green-500/30 shadow-2xl shadow-green-500/20">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <Star className="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-4">
            Registration Successful!
          </h2>
          <p className="text-slate-300 mb-4">
            Your organization has been registered successfully with {candidates.length} candidates.
          </p>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
          </div>
          <p className="text-sm text-slate-400">Redirecting you back...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-cyan-900 p-4">
      <ErrorAlert message={error} onClose={() => setError('')} />
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="w-8 h-8 text-cyan-400 animate-pulse" />
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">Organization Portal</span>
            <Building2 className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4">
            Register Your Institution
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Join our network of educational institutions and showcase your talented students to top recruiters.
          </p>
        </div>

        <div className="mt-12 flex items-center justify-center">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 border-transparent text-white shadow-lg shadow-cyan-500/25' 
                    : 'border-slate-600 text-slate-400 bg-slate-800'
                }`}>
                  {currentStep > step ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="font-bold">{step}</span>
                  )}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
                    currentStep > step ? 'bg-gradient-to-r from-cyan-500 to-purple-600' : 'bg-slate-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {currentStep === 1 && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 border border-slate-700 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-500/30 mb-4">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-300 font-semibold">Step 1: Institution Information</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Tell us about your institution</h2>
              <p className="text-slate-400">Provide basic information about your educational institution</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Institution Name *</label>
                  <input
                    type="text"
                    value={organizationData.name}
                    onChange={(e) => handleOrganizationChange('name', e.target.value)}
                    placeholder="Enter institution name"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Institution Type *</label>
                  <select
                    value={organizationData.type}
                    onChange={(e) => handleOrganizationChange('type', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                  >
                    {organizationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={organizationData.location}
                      onChange={(e) => handleOrganizationChange('location', e.target.value)}
                      placeholder="Enter city, state"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={organizationData.email}
                      onChange={(e) => handleOrganizationChange('email', e.target.value)}
                      placeholder="Enter official email"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      value={organizationData.phone}
                      onChange={(e) => handleOrganizationChange('phone', e.target.value)}
                      placeholder="Enter contact number"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="url"
                      value={organizationData.website}
                      onChange={(e) => handleOrganizationChange('website', e.target.value)}
                      placeholder="https://example.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Established Year</label>
                  <input
                    type="number"
                    value={organizationData.establishedYear}
                    onChange={(e) => handleOrganizationChange('establishedYear', e.target.value)}
                    placeholder="YYYY"
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Accreditation</label>
                  <input
                    type="text"
                    value={organizationData.accreditation}
                    onChange={(e) => handleOrganizationChange('accreditation', e.target.value)}
                    placeholder="e.g., NAAC A+, AICTE"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="group">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
                <textarea
                  value={organizationData.description}
                  onChange={(e) => handleOrganizationChange('description', e.target.value)}
                  placeholder="Brief description about your institution..."
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all resize-none"
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="group">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Institution Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
                />
                <p className="text-slate-400 text-sm mt-1">Supported formats: JPG, PNG, GIF, WebP (Max: 5MB)</p>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!validateStep1()}
                className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-1"
              >
                <span>Next Step</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}  
        
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 border border-slate-700 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-4">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-300 font-semibold">Step 2: Candidate Management</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Manage Your Students</h2>
                <p className="text-slate-400">Add students individually or upload Excel/CSV files for bulk registration</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <button
                  onClick={() => setShowAddCandidate(true)}
                  className="group relative p-4 md:p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl hover:border-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                      <Plus className="w-4 md:w-6 h-4 md:h-6 text-white" />
                    </div>
                    <h3 className="text-sm md:text-lg font-semibold text-green-300">Add Student</h3>
                  </div>
                  <p className="text-xs md:text-sm text-slate-400">Add individual student profiles with detailed information</p>
                </button>

                <button
                  onClick={() => setShowBulkUpload(true)}
                  className="group relative p-4 md:p-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl hover:border-orange-400 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                      <FileSpreadsheet className="w-4 md:w-6 h-4 md:h-6 text-white" />
                    </div>
                    <h3 className="text-sm md:text-lg font-semibold text-orange-300">Bulk Upload</h3>
                  </div>
                  <p className="text-xs md:text-sm text-slate-400">Upload Excel or CSV files with student data</p>
                </button>

                <button
                  onClick={() => setShowCandidateList(!showCandidateList)}
                  className="group relative p-4 md:p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                      <Eye className="w-4 md:w-6 h-4 md:h-6 text-white" />
                    </div>
                    <h3 className="text-sm md:text-lg font-semibold text-blue-300">View Students ({candidates.length})</h3>
                  </div>
                  <p className="text-xs md:text-sm text-slate-400">View and manage all registered student profiles</p>
                </button>

                <button
                  onClick={exportCandidates}
                  disabled={candidates.length === 0 || loading}
                  className="group relative p-4 md:p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl hover:border-purple-400 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                      <Download className="w-4 md:w-6 h-4 md:h-6 text-white" />
                    </div>
                    <h3 className="text-sm md:text-lg font-semibold text-purple-300">Export Data</h3>
                  </div>
                  <p className="text-xs md:text-sm text-slate-400">Download student data as CSV file</p>
                </button>
              </div>

              {/* Candidates Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-4 rounded-xl border border-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Total Students</p>
                      <p className="text-white text-xl font-bold">{candidates.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-4 rounded-xl border border-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Graduates</p>
                      <p className="text-white text-xl font-bold">{candidates.filter(c => c.year === 'Graduated').length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-4 rounded-xl border border-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Branches</p>
                      <p className="text-white text-xl font-bold">{new Set(candidates.map(c => c.branch)).size}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-4 rounded-xl border border-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Avg CGPA</p>
                      <p className="text-white text-xl font-bold">
                        {candidates.length > 0 
                          ? (candidates.reduce((sum, c) => sum + (parseFloat(c.cgpa) || 0), 0) / candidates.length).toFixed(1)
                          : '0.0'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="group flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-600 hover:text-white transition-all border border-slate-600"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span>Previous</span>
                </button>
                
                <button
                  onClick={() => setCurrentStep(3)}
                  className="group flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-cyan-600 hover:to-purple-700 hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-1"
                >
                  <span>Review & Submit</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Add Candidate Modal */}
            {showAddCandidate && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"> 
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                      {editingCandidate ? 'Edit Student' : 'Add New Student'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddCandidate(false);
                        resetCandidateForm();
                        setEditingCandidate(null);
                      }}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                  
                  <div className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name *</label>
                        <input
                          type="text"
                          value={candidateData.name}
                          onChange={(e) => handleCandidateChange('name', e.target.value)}
                          placeholder="Enter full name"
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                        />
                      </div>
                      
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Roll Number *</label>
                        <input  
                          type="text"   
                          value={candidateData.rollNo}
                          onChange={(e) => handleCandidateChange('rollNo', e.target.value)}
                          placeholder="Enter roll number"
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                        <input  
                          type="email"   
                          value={candidateData.email}
                          onChange={(e) => handleCandidateChange('email', e.target.value)}
                          placeholder="Enter email address"
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                        />
                      </div>
                      
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Phone Number</label>
                        <input  
                          type="tel"   
                          value={candidateData.phone}
                          onChange={(e) => handleCandidateChange('phone', e.target.value)}
                          placeholder="Enter phone number"
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Branch *</label>
                        <select
                          value={candidateData.branch}
                          onChange={(e) => handleCandidateChange('branch', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                        >
                          <option value="">Select branch</option>
                          {branches.map(branch => (   
                            <option key={branch} value={branch}>{branch}</option>
                          ))}
                        </select> 
                      </div>
                      
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Specialization</label>
                        <input
                          type="text"
                          value={candidateData.specialization}
                          onChange={(e) => handleCandidateChange('specialization', e.target.value)}
                          placeholder="Enter specialization (if any)"
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Year</label>
                        <select
                          value={candidateData.year}
                          onChange={(e) => handleCandidateChange('year', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                        >
                          <option value="">Select year</option>
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-300 mb-2">CGPA</label>
                        <input
                          type="number"
                          value={candidateData.cgpa}
                          onChange={(e) => handleCandidateChange('cgpa', e.target.value)}
                          placeholder="Enter CGPA (0.0 - 10.0)"
                          min="0"
                          max="10"
                          step="0.01"
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="group"> 
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Skills</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {candidateData.skills.map((skill, index) => (
                          <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm rounded-full">
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Type a skill and press Enter"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkill(newSkill);
                            }
                          }}
                          className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        />
                        <button
                          onClick={() => addSkill(newSkill)}
                          disabled={!newSkill.trim()}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
                      <button
                        onClick={() => {
                          setShowAddCandidate(false);
                          resetCandidateForm();
                          setEditingCandidate(null);
                        }}
                        className="px-6 py-3 bg-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-600 hover:text-white transition-all border border-slate-600"
                      > 
                        Cancel
                      </button>
                      <button 
                        onClick={addCandidate}
                        disabled={!candidateData.name || !candidateData.rollNo || !candidateData.branch}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {editingCandidate ? 'Update Student' : 'Add Student'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Bulk Upload Modal */}
            {showBulkUpload && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-white">Bulk Upload Students</h3>
                    <button
                      onClick={() => {
                        setShowBulkUpload(false);
                        setBulkUploadData([]);
                        setUploadPreview([]);
                        setValidationErrors([]);
                      }}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  {/* Upload Instructions */}
                  <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                        <FileSpreadsheet className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-blue-300 mb-2">Upload Instructions</h4>
                        <ul className="text-slate-300 text-sm space-y-1">
                          <li>• Download the template file first to see the required format</li>
                          <li>• Supported formats: Excel (.xlsx, .xls) and CSV (.csv)</li>
                          <li>• Required fields: Name, Roll Number, Branch</li>
                          <li>• Optional fields: Email, Phone, Specialization, Year, CGPA, Skills</li>
                          <li>• Skills should be separated by commas (e.g., "Java, Python, React")</li>
                          <li>• Maximum file size: 10MB</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Download Template and File Upload */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Step 1: Download Template</label>
                      <button
                        onClick={downloadTemplate}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
                      >
                        <Download className="w-5 h-5" />
                        Download Excel Template
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Step 2: Upload Your File</label>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                      />
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {loading && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                      <p className="text-slate-300">Processing file...</p>
                    </div>
                  )}

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-4 mb-6">
                      <h4 className="text-red-300 font-semibold mb-2">Validation Errors:</h4>
                      <div className="max-h-32 overflow-y-auto">
                        <ul className="text-red-200 text-sm space-y-1">
                          {validationErrors.slice(0, 10).map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                          {validationErrors.length > 10 && (
                            <li className="text-red-400">...and {validationErrors.length - 10} more errors</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Preview Data */}
                  {uploadPreview.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-white mb-4">
                        Data Preview ({bulkUploadData.length} students found)
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full bg-slate-700 rounded-xl overflow-hidden">
                          <thead className="bg-slate-600">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Name</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Roll No</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Branch</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Year</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">CGPA</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Skills</th>
                            </tr>
                          </thead>
                          <tbody>
                            {uploadPreview.map((student, index) => (
                              <tr key={index} className="border-t border-slate-600">
                                <td className="px-4 py-3 text-sm text-white">{student.name || '-'}</td>
                                <td className="px-4 py-3 text-sm text-white">{student.rollNo || '-'}</td>
                                <td className="px-4 py-3 text-sm text-white">{student.branch || '-'}</td>
                                <td className="px-4 py-3 text-sm text-white">{student.year || '-'}</td>
                                <td className="px-4 py-3 text-sm text-white">{student.cgpa || '-'}</td>
                                <td className="px-4 py-3 text-sm text-white">
                                  {Array.isArray(student.skills) 
                                    ? student.skills.slice(0, 2).join(', ') + (student.skills.length > 2 ? '...' : '')
                                    : (typeof student.skills === 'string' 
                                        ? student.skills.substring(0, 30) + (student.skills.length > 30 ? '...' : '')
                                        : '-')
                                  }
                                </td>
                              </tr>
                            ))}
                            {bulkUploadData.length > 5 && (
                              <tr className="border-t border-slate-600">
                                <td colSpan="6" className="px-4 py-3 text-center text-sm text-slate-400">
                                  ...and {bulkUploadData.length - 5} more students
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <button
                      onClick={() => {
                        setShowBulkUpload(false);
                        setBulkUploadData([]);
                        setUploadPreview([]);
                        setValidationErrors([]);
                      }}
                      className="px-6 py-3 bg-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-600 hover:text-white transition-all border border-slate-600"
                    >
                      Cancel
                    </button>
                    {bulkUploadData.length > 0 && (
                      <button
                        onClick={processBulkUpload}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-orange-600 hover:to-red-700"
                      >
                        Import {bulkUploadData.length} Students
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Candidate List Modal */}  
            {showCandidateList && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
                  <div className="flex items-center justify-between mb-6">  
                    <h3 className="text-xl md:text-2xl font-bold text-white">Registered Students ({candidates.length})</h3>
                    <button
                      onClick={() => setShowCandidateList(false)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  {/* Search and Filter */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="md:col-span-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={candidateFilter}
                          onChange={(e) => setCandidateFilter(e.target.value)}
                          placeholder="Search by name or roll number..."
                          className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      >
                        <option value="">All Branches</option>
                        {branches.map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {candidates.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-slate-300 mb-2">No Students Added Yet</h4>
                      <p className="text-slate-400 mb-6">Start by adding students individually or uploading a CSV/Excel file.</p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={() => {
                            setShowCandidateList(false);
                            setShowAddCandidate(true);
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-green-600 hover:to-emerald-700"
                        >
                          Add First Student
                        </button>
                        <button
                          onClick={() => {
                            setShowCandidateList(false);
                            setShowBulkUpload(true);
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-orange-600 hover:to-red-700"
                        >
                          Bulk Upload
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full bg-slate-700 rounded-xl overflow-hidden">
                        <thead className="bg-slate-600">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Roll No</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Branch</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Year</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">CGPA</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Skills</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCandidates.map((candidate, index) => ( 
                            <tr key={candidate.id} className="border-t border-slate-600 hover:bg-slate-600/50 transition-colors">
                              <td className="px-4 py-3 text-sm text-white font-medium">{candidate.name}</td>
                              <td className="px-4 py-3 text-sm text-white">{candidate.rollNo}</td>
                              <td className="px-4 py-3 text-sm text-white">{candidate.branch}</td>
                              <td className="px-4 py-3 text-sm text-white">{candidate.year || '-'}</td>
                              <td className="px-4 py-3 text-sm text-white">
                                {candidate.cgpa ? (
                                  <span className="px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg text-green-300">
                                    {candidate.cgpa}
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-white max-w-xs">
                                <div className="flex flex-wrap gap-1">
                                  {Array.isArray(candidate.skills) && candidate.skills.length > 0
                                    ? candidate.skills.slice(0, 3).map((skill, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg text-cyan-300 text-xs">
                                          {skill}
                                        </span>
                                      ))
                                    : <span className="text-slate-400">-</span>
                                  }
                                  {Array.isArray(candidate.skills) && candidate.skills.length > 3 && (
                                    <span className="text-slate-400 text-xs">+{candidate.skills.length - 3}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => editCandidate(candidate)}
                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                                    title="Edit Student"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm('Are you sure you want to delete this student?')) {
                                        deleteCandidate(candidate.id);
                                      }
                                    }}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                                    title="Delete Student"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {filteredCandidates.length === 0 && candidateFilter && (
                        <div className="text-center py-8">
                          <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                          <p className="text-slate-400">No students found matching "{candidateFilter}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review and Submit */}
        {currentStep === 3 && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 border border-slate-700 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full border border-pink-500/30 mb-4">
                <CheckSquare className="w-5 h-5 text-pink-400" />
                <span className="text-pink-300 font-semibold">Step 3: Review & Submit</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Review Your Registration</h2>
              <p className="text-slate-400">Please review all information before submitting your registration</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Organization Summary */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 border border-slate-600">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Organization Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm">Institution Name</p>
                    <p className="text-white font-semibold">{organizationData.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Type</p>
                    <p className="text-white">{organizationData.type}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Location</p>
                    <p className="text-white">{organizationData.location || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Email</p>
                    <p className="text-white">{organizationData.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Phone</p>
                    <p className="text-white">{organizationData.phone || 'Not provided'}</p>
                  </div>
                  {organizationData.website && (
                    <div>
                      <p className="text-slate-400 text-sm">Website</p>
                      <p className="text-cyan-400 hover:text-cyan-300 transition-colors">
                        <a href={organizationData.website} target="_blank" rel="noopener noreferrer">
                          {organizationData.website}
                        </a>
                      </p>
                    </div>
                  )}
                  {organizationData.establishedYear && (
                    <div>
                      <p className="text-slate-400 text-sm">Established</p>
                      <p className="text-white">{organizationData.establishedYear}</p>
                    </div>
                  )}
                  {organizationData.accreditation && (
                    <div>
                      <p className="text-slate-400 text-sm">Accreditation</p>
                      <p className="text-white">{organizationData.accreditation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Students Summary */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 border border-slate-600">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Students Summary</h3>
                  </div>
                  <button
                    onClick={() => setShowCandidateList(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold text-sm hover:from-blue-600 hover:to-cyan-700 transition-all"
                  >
                    View All
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-600/50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-white">{candidates.length}</p>
                    <p className="text-slate-300 text-sm">Total Students</p>
                  </div>
                  <div className="bg-slate-600/50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-white">{new Set(candidates.map(c => c.branch)).size}</p>
                    <p className="text-slate-300 text-sm">Branches</p>
                  </div>
                </div>

                {/* Branch Distribution */}
                {candidates.length > 0 && (
                  <div>
                    <p className="text-slate-300 font-semibold mb-3">Branch Distribution</p>
                    <div className="space-y-2">
                      {Object.entries(
                        candidates.reduce((acc, candidate) => {
                          acc[candidate.branch] = (acc[candidate.branch] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([branch, count]) => (
                        <div key={branch} className="flex items-center justify-between">
                          <span className="text-slate-300 text-sm">{branch}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-600 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full"
                                style={{width: `${(count / candidates.length) * 100}%`}}
                              />
                            </div>
                            <span className="text-white font-semibold text-sm w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Warning if no students */}
            {candidates.length === 0 && (
              <div className="mt-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-300 font-semibold">No Students Added</p>
                    <p className="text-yellow-200 text-sm">Please add at least one student before submitting your registration.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
              <button
                onClick={() => setCurrentStep(2)}
                className="group flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-600 hover:text-white transition-all border border-slate-600"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Previous</span>
              </button>
              
              <button
                onClick={submitRegistration}
                disabled={loading || candidates.length === 0}
                className="group flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-1"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Submit Registration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};  

export default OrganizationRegister;