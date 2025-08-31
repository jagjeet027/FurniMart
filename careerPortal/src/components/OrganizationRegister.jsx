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
  AlertCircle
} from 'lucide-react';
import OrganizationService from '../services/OrganizationService';

const OrganizationRegister = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showCandidateList, setShowCandidateList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [newSkill, setNewSkill] = useState('');
  
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

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleOrganizationChange = (field, value) => {
    setError(''); // Clear any existing errors
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
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Logo file size should be less than 5MB');
        return;
      }
      
      // Validate file type
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

  const addCandidate = () => {
    if (candidateData.name && candidateData.rollNo && candidateData.branch) {
      const newCandidate = {
        ...candidateData,
        id: Date.now(),
        addedDate: new Date().toISOString()
      };
      
      if (editingCandidate) {
        setCandidates(prev => prev.map(c => c.id === editingCandidate.id ? newCandidate : c));
        setEditingCandidate(null);
      } else {
        // Check for duplicate roll numbers
        if (candidates.some(c => c.rollNo.toLowerCase() === candidateData.rollNo.toLowerCase())) {
          setError('A student with this roll number already exists');
          return;
        }
        setCandidates(prev => [...prev, newCandidate]);
      }
      
      // Reset form
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
        ['Name', 'Roll No', 'Email', 'Phone', 'Branch', 'Year', 'CGPA', 'Skills'],
        ...candidates.map(c => [
          c.name,
          c.rollNo,
          c.email,
          c.phone,
          c.branch,
          c.year,
          c.cgpa,
          c.skills.join('; ')
        ])
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
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
      // Validate required fields
      if (!organizationData.name || !organizationData.email || !organizationData.phone || !organizationData.location) {
        throw new Error('Please fill in all required organization fields');
      }
      
      if (candidates.length === 0) {
        throw new Error('Please add at least one student before submitting');
      }
      
      // Test connection first
      console.log('Testing server connection...');
      const isConnected = await OrganizationService.testConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to server. Please ensure the backend server is running on http://localhost:5000');
      }
      
      // Submit to backend
      const result = await OrganizationService.register(organizationData, candidates);
      
      setSuccess(true);
      
      // Reset form after showing success for 3 seconds
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

        {/* Progress Steps */}
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
        {/* Step 1: Organization Details */}
        {currentStep === 1 && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-500/30 mb-4">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-300 font-semibold">Step 1: Institution Information</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Tell us about your institution</h2>
              <p className="text-slate-400">Provide basic information about your educational institution</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Institution Name *</label>
                  <input
                    type="text"
                    value={organizationData.name}
                    onChange={(e) => handleOrganizationChange('name', e.target.value)}
                    placeholder="Enter institution name"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all group-hover:border-slate-500"
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
                      placeholder="City, State, Country"
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
                      placeholder="admin@institution.edu"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Institution Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
                  />
                  <p className="text-xs text-slate-400 mt-1">Max size: 5MB. Formats: JPG, PNG, GIF</p>
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
                      placeholder="+1 (555) 123-4567"
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
                      placeholder="https://www.institution.edu"
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
                    placeholder="1985"
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
                    placeholder="NAAC A+, NBA, etc."
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Institution Description</label>
              <textarea
                value={organizationData.description}
                onChange={(e) => handleOrganizationChange('description', e.target.value)}
                placeholder="Brief description about your institution, its mission, vision, and key achievements..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all resize-none"
              />
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

        {/* Step 2: Add Candidates */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-4">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-300 font-semibold">Step 2: Candidate Management</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Manage Your Students</h2>
                <p className="text-slate-400">Add and manage student profiles for recruitment opportunities</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <button
                  onClick={() => setShowAddCandidate(true)}
                  className="group relative p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl hover:border-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-300">Add Student</h3>
                  </div>
                  <p className="text-sm text-slate-400">Add individual student profiles with detailed information</p>
                </button>

                <button
                  onClick={() => setShowCandidateList(!showCandidateList)}
                  className="group relative p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-300">View Students ({candidates.length})</h3>
                  </div>
                  <p className="text-sm text-slate-400">View and manage all registered student profiles</p>
                </button>

                <button
                  onClick={exportCandidates}
                  disabled={candidates.length === 0 || loading}
                  className="group relative p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl hover:border-purple-400 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-purple-300">Export Data</h3>
                  </div>
                  <p className="text-sm text-slate-400">Download student data as CSV file</p>
                </button>
              </div>

              {/* Candidates Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="group flex items-center gap-2 px-6 py-3 bg-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-600 hover:text-white transition-all border border-slate-600"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span>Previous</span>
                </button>
                
                <button
                  onClick={() => setCurrentStep(3)}
                  className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-cyan-600 hover:to-purple-700 hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-1"
                >
                  <span>Review & Submit</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Candidate List Modal/View */}
            {showCandidateList && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Student Directory</h3>
                  <button
                    onClick={() => setShowCandidateList(false)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={candidateFilter}
                      onChange={(e) => setCandidateFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  >
                    <option value="">All Branches</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button 
                      onClick={exportCandidates}
                      disabled={candidates.length === 0 || loading}
                      className="flex items-center gap-2 px-4 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>

                {/* Student Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCandidates.map((candidate) => (
                    <div key={candidate.id} className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-xl border border-slate-600 hover:border-cyan-400 transition-all duration-300 group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{candidate.name}</h4>
                            <p className="text-sm text-slate-400">{candidate.rollNo}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editCandidate(candidate)}
                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-slate-400 hover:text-white" />
                          </button>
                          <button
                            onClick={() => deleteCandidate(candidate.id)}
                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-300">{candidate.branch}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-300">{candidate.year}</span>
                        </div>
                        {candidate.cgpa && (
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-slate-300">CGPA: {candidate.cgpa}</span>
                          </div>
                        )}
                        {candidate.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-300 truncate">{candidate.email}</span>
                          </div>
                        )}
                      </div>
                      {candidate.skills.length > 0 && (
                        <div className="mt-4">
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 3).map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-slate-600 rounded-md text-xs text-slate-300">
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 3 && (
                              <span className="px-2 py-1 bg-slate-600 rounded-md text-xs text-slate-400">
                                +{candidate.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredCandidates.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">No students found</h3>
                    <p className="text-slate-500">Try adjusting your search or add some students</p>
                  </div>
                )}
              </div>
            )}

            {/* Add Candidate Modal */}
            {showAddCandidate && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">
                      {editingCandidate ? 'Edit Student' : 'Add New Student'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddCandidate(false);
                        setEditingCandidate(null);
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
                      }}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Student Name *</label>
                        <input
                          type="text"
                          value={candidateData.name}
                          onChange={(e) => handleCandidateChange('name', e.target.value)}
                          placeholder="Enter student name"
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Roll Number *</label>
                        <input
                          type="text"
                          value={candidateData.rollNo}
                          onChange={(e) => handleCandidateChange('rollNo', e.target.value)}
                          placeholder="Enter roll number"
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={candidateData.email}
                          onChange={(e) => handleCandidateChange('email', e.target.value)}
                          placeholder="student@email.com"
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={candidateData.phone}
                          onChange={(e) => handleCandidateChange('phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Branch *</label>
                        <select
                          value={candidateData.branch}
                          onChange={(e) => handleCandidateChange('branch', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        >
                          <option value="">Select Branch</option>
                          {branches.map(branch => (
                            <option key={branch} value={branch}>{branch}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Specialization</label>
                        <input
                          type="text"
                          value={candidateData.specialization}
                          onChange={(e) => handleCandidateChange('specialization', e.target.value)}
                          placeholder="e.g., Machine Learning, Web Development"
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Year</label>
                        <select
                          value={candidateData.year}
                          onChange={(e) => handleCandidateChange('year', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        >
                          <option value="">Select Year</option>
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">CGPA</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={candidateData.cgpa}
                          onChange={(e) => handleCandidateChange('cgpa', e.target.value)}
                          placeholder="9.5"
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="mt-8">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Skills</label>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill..."
                        className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addSkill(newSkill);
                          }
                        }}
                      />
                      <button
                        onClick={() => addSkill(newSkill)}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {candidateData.skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-1 bg-slate-600 rounded-lg">
                          <span className="text-sm text-white">{skill}</span>
                          <button
                            onClick={() => removeSkill(skill)}
                            className="text-slate-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 mt-8">
                    <button
                      onClick={() => {
                        setShowAddCandidate(false);
                        setEditingCandidate(null);
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
                      }}
                      className="px-6 py-3 bg-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-600 hover:text-white transition-all border border-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addCandidate}
                      disabled={!candidateData.name || !candidateData.rollNo || !candidateData.branch}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editingCandidate ? 'Update Student' : 'Add Student'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30 mb-4">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-semibold">Step 3: Review & Submit</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Review Your Information</h2>
              <p className="text-slate-400">Please review all details before submitting your registration</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Organization Summary */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-xl border border-slate-600">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Institution Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm">Name</p>
                    <p className="text-white font-semibold">{organizationData.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Type</p>
                    <p className="text-white">{organizationData.type}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Location</p>
                    <p className="text-white">{organizationData.location}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Contact</p>
                    <p className="text-white">{organizationData.email}</p>
                    <p className="text-slate-300">{organizationData.phone}</p>
                  </div>
                  {organizationData.website && (
                    <div>
                      <p className="text-slate-400 text-sm">Website</p>
                      <p className="text-cyan-400">{organizationData.website}</p>
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
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-xl border border-slate-600">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Students Summary</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-slate-600 rounded-lg">
                    <p className="text-2xl font-bold text-cyan-400">{candidates.length}</p>
                    <p className="text-slate-300 text-sm">Total Students</p>
                  </div>
                  <div className="text-center p-4 bg-slate-600 rounded-lg">
                    <p className="text-2xl font-bold text-green-400">{new Set(candidates.map(c => c.branch)).size}</p>
                    <p className="text-slate-300 text-sm">Branches</p>
                  </div>
                </div>

                {/* Branch Distribution */}
                <div>
                  <p className="text-slate-400 text-sm mb-3">Branch Distribution</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {[...new Set(candidates.map(c => c.branch))].filter(branch => branch).map(branch => {
                      const count = candidates.filter(c => c.branch === branch).length;
                      return (
                        <div key={branch} className="flex justify-between items-center">
                          <span className="text-slate-300 text-sm">{branch}</span>
                          <span className="text-white font-semibold">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {organizationData.description && (
              <div className="mt-8 bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-xl border border-slate-600">
                <h3 className="text-lg font-semibold text-white mb-3">Institution Description</h3>
                <p className="text-slate-300 leading-relaxed">{organizationData.description}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(2)}
                className="group flex items-center gap-2 px-6 py-3 bg-slate-700 text-slate-300 rounded-xl font-semibold hover:bg-slate-600 hover:text-white transition-all border border-slate-600"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span>Previous</span>
              </button>
              
              <button
                onClick={submitRegistration}
                disabled={loading || candidates.length === 0}
                className="group relative flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-1 overflow-hidden"
              >
                {loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                )}
                <Save className="w-5 h-5" />
                <span>{loading ? 'Submitting...' : 'Submit Registration'}</span>
              </button>
            </div>

            {/* Warning for no candidates */}
            {candidates.length === 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-yellow-400" />
                  <p className="text-yellow-300 font-medium">
                    Please add at least one student before submitting your registration.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationRegister;