  import React, { useState, useEffect } from "react";
  import { useNavigate } from 'react-router-dom';
  import { 
    Search, 
    Filter, 
    Building2, 
    MapPin, 
    Clock, 
    DollarSign, 
    User, 
    Users, 
    Briefcase,
    TrendingUp,
    Zap,
    Star,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Target,
    Award,
    Rocket,
    Eye,
    X,
    ArrowRight
  } from "lucide-react";
import JobDetailsModal from "./JobDetailsModal";
  
  const ModernStaffHiring = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showJobModal, setShowJobModal] = useState(false);
    const [filters, setFilters] = useState({
      search: '',
      department: '',
      location: '',
      experience: '',
      page: 1,
      limit: 6
    });
    const [totalJobs, setTotalJobs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const API_BASE_URL = 'http://localhost:5000/api/careers';

    // Add CSS styles programmatically
    useEffect(() => {
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes scale-in {
          from { 
            opacity: 0; 
            transform: scale(0.9); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        
        @keyframes tilt {
          0%, 50%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(0.5deg); }
          75% { transform: rotate(-0.5deg); }
        }
        
        @keyframes tilt-reverse {
          0%, 50%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-0.5deg); }
          75% { transform: rotate(0.5deg); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        .animate-tilt {
          animation: tilt 10s ease-in-out infinite;
        }
        
        .animate-tilt-reverse {
          animation: tilt-reverse 10s ease-in-out infinite;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .debug-clickable {
          position: relative !important;
          z-index: 999 !important;
          pointer-events: auto !important;
          cursor: pointer !important;
        }

        .pointer-events-none {
          pointer-events: none !important;
        }

        button {
          position: relative;
          z-index: 10;
        }
      `;
      
      document.head.appendChild(styleElement);

      return () => {
        if (document.head.contains(styleElement)) {
          document.head.removeChild(styleElement);
        }
      };
    }, []);

    // Navigation handlers
    const handleIndividualRegister = () => {
      navigate('/register/individual-applicant');
    };

    const handleOrganizationRegister = () => {
      navigate('/register/organization-applicant');
    };

    const handleApplyNow = () => {
      navigate('/register/individual-applicant');
    };

    // Fixed view job handler with better debugging
    const handleViewJob = (job, event) => {
      
      // Prevent event propagation
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      setSelectedJob(job);
      setShowJobModal(true);
    };

    const handleCloseModal = () => {
      console.log('Closing modal');
      setShowJobModal(false);
      setSelectedJob(null);
    };

    // Fetch jobs from backend
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.department) queryParams.append('department', filters.department);
        if (filters.location) queryParams.append('location', filters.location);
        if (filters.experience) queryParams.append('experience', filters.experience);
        queryParams.append('page', filters.page);
        queryParams.append('limit', filters.limit);

        const response = await fetch(`${API_BASE_URL}/jobs?${queryParams}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch jobs: ${response.status}`);
        }
        
        const data = await response.json();
        setJobs(data.jobs || []);
        setTotalJobs(data.totalJobs || 0);
        setTotalPages(data.totalPages || 0);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching jobs:', err);
        // Set empty state on error
        setJobs([]);
        setTotalJobs(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    // Fetch departments for filter
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/departments`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setDepartments(data || []);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
        setDepartments([]);
      }
    };

    // Fetch job statistics
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/jobs/stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setStats(null);
      }
    };

    useEffect(() => {
      fetchJobs();
    }, [filters]);

    useEffect(() => {
      fetchDepartments();
      fetchStats();
    }, []);

    const handleFilterChange = (key, value) => {
      setFilters(prev => ({
        ...prev,
        [key]: value,
        page: 1
      }));
    };

    const handlePageChange = (newPage) => {
      setFilters(prev => ({
        ...prev,
        page: newPage
      }));
    };

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

    const getUrgencyBadge = (urgency) => {
      const urgencyStyles = {
        'Urgent': 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25',
        'Hot': 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-500/25',
        'New': 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25',
        'High': 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25'
      };
      
      if (urgency && urgencyStyles[urgency]) {
        return (
          <div className={`relative px-3 py-1 text-xs font-bold rounded-full border ${urgencyStyles[urgency]} animate-pulse`}>
            <Zap className="w-3 h-3 inline mr-1" />
            {urgency}
          </div>
        );
      }
      return null;
    };

    // Updated Job Card Component with fixed button
    const JobCard = ({ job, index }) => (
      <div className={`group relative bg-gradient-to-r from-slate-800 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 hover:border-cyan-400 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10 animate-fade-in-up`}
          style={{ animationDelay: `${index * 100}ms` }}>
        
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/10 to-purple-500/10 opacity-0 group-hover:opacity-100 blur transition-opacity duration-500 -z-10"></div>
        
        {/* Content in linear layout */}
        <div className="flex items-center justify-between gap-6">
          {/* Left side - Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                {job.title}
              </h3>
              {getUrgencyBadge(job.urgency)}
            </div>
            
            <div className="flex items-center gap-6 text-sm text-slate-400 mb-3 flex-wrap">
              <div className="flex items-center gap-1 hover:text-cyan-300 transition-colors">
                <Building2 className="w-4 h-4" />
                <span>{job.department}</span>
              </div>
              <div className="flex items-center gap-1 hover:text-cyan-300 transition-colors">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1 hover:text-cyan-300 transition-colors">
                <Clock className="w-4 h-4" />
                <span>{job.type || job.jobType}</span>
              </div>
              <div className="flex items-center gap-1 hover:text-green-300 transition-colors">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">{formatSalary(job.salary)}</span>
              </div>
            </div>

            <p className="text-slate-300 text-sm line-clamp-2 group-hover:text-slate-200 transition-colors mb-3">
              {job.description}
            </p>

            {/* Tags and metadata in one line */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                {(job.postedDate || job.createdAt) && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Posted {new Date(job.postedDate || job.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 hover:text-cyan-300 transition-colors">
                  <User className="w-3 h-3" />
                  <span>{job.experience || job.experienceLevel}</span>
                </div>
                {job.applicationsCount && (
                  <div className="flex items-center gap-1 hover:text-purple-300 transition-colors">
                    <Users className="w-3 h-3" />
                    <span>{job.applicationsCount} Applied</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {job.tags && job.tags.length > 0 && (
                <div className="flex gap-2">
                  {job.tags.slice(0, 2).map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-slate-700 text-cyan-300 text-xs rounded-full border border-slate-600 hover:border-cyan-400 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                  {job.tags.length > 2 && (
                    <span className="text-xs text-slate-500">+{job.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right side - Action Button - Fixed with higher z-index and pointer events */}
          <div className="flex-shrink-0 relative z-10">
            <button
              type="button"
              onClick={(e) => handleViewJob(job, e)}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-cyan-600 hover:to-blue-700 hover:shadow-lg hover:shadow-cyan-500/25 transform hover:-translate-y-1 cursor-pointer relative z-20 pointer-events-auto"
              style={{ pointerEvents: 'auto' }}
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
          </div>
        </div>

        {/* Hover glow effect - ensure it doesn't interfere with button clicks */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>
    );

    const StatCard = ({ icon, title, value, gradient, delay = 0 }) => (
      <div className={`bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 hover:border-cyan-400 transition-all duration-500 group animate-fade-in-up`}
          style={{ animationDelay: `${delay}ms` }}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
            {icon}
          </div>
          <div>
            <p className="text-slate-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white">{value || 0}</p>
          </div>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-cyan-900">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
                <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">Career Portal</span>
                <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-fade-in">
                Shape Your Future
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-300 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                Discover {totalJobs || 'amazing'} opportunities across cutting-edge departments and join our mission to innovate.
              </p>
            </div>

            {/* Registration Cards */}
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Individual Registration */}
              <div className="group relative animate-fade-in-up" style={{ animationDelay: '800ms' }}>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 group-hover:border-cyan-400 transition-all duration-500">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl shadow-2xl shadow-cyan-500/25 group-hover:shadow-cyan-500/50 transition-all duration-300">
                        <User className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                      Join as Individual
                    </h3>
                    <p className="text-slate-300 mb-6 leading-relaxed">
                      Perfect for job seekers, freelancers, and professionals looking to discover their next career opportunity in innovative companies.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                      <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full border border-cyan-500/30">Resume Upload</span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">Job Alerts</span>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">Career Growth</span>
                    </div>
                    
                    <button 
                      onClick={handleIndividualRegister}
                      className="group/btn relative w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-cyan-600 hover:to-blue-700 hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>Get Started Now</span>
                        <Rocket className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Organization Registration */}
              <div className="group relative animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl blur-xl opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt-reverse"></div>
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 group-hover:border-purple-400 transition-all duration-500">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-2xl shadow-purple-500/25 group-hover:shadow-purple-500/50 transition-all duration-300">
                        <Building2 className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
                        <Award className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                      Register Organization
                    </h3>
                    <p className="text-slate-300 mb-6 leading-relaxed">
                      For companies, startups, and organizations looking to hire top talent and build exceptional teams from colleges and Universities.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">Talent Pool</span>
                      <span className="px-3 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full border border-pink-500/30">Bulk Hiring</span>
                      <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">Analytics</span>
                    </div>
                    
                    <button 
                      onClick={handleOrganizationRegister}
                      className="group/btn relative w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-purple-600 hover:to-pink-700 hover:shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>Start Hiring</span>
                        <Target className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        {stats && (
          <div className="relative py-20 bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">Our Impact</h2>
                <p className="text-slate-400 text-lg">Real numbers that showcase our growing community</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={<Briefcase className="w-6 h-6 text-white" />}
                  title="Active Jobs"
                  value={stats.totalJobs}
                  gradient="from-cyan-500 to-blue-600"
                  delay={0}
                />
                <StatCard
                  icon={<Users className="w-6 h-6 text-white" />}
                  title="Total Applications"
                  value={stats.totalApplications}
                  gradient="from-purple-500 to-pink-600"
                  delay={200}
                />
                <StatCard
                  icon={<Building2 className="w-6 h-6 text-white" />}
                  title="Departments"
                  value={stats.totalDepartments}
                  gradient="from-green-500 to-emerald-600"
                  delay={400}
                />
                <StatCard
                  icon={<TrendingUp className="w-6 h-6 text-white" />}
                  title="Success Rate"
                  value={stats.successRate ? `${stats.successRate}%` : '95%'}
                  gradient="from-orange-500 to-red-600"
                  delay={600}
                />
              </div>
            </div>
          </div>
        )}

        {/* Job Search and Filter Section */}
        <div className="relative py-20 bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Explore Opportunities</h2>
              <p className="text-slate-400 text-lg">Find the perfect role that matches your skills and aspirations</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 mb-12 border border-slate-600">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search Input */}
                <div className="lg:col-span-2 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search jobs, skills, companies..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>

                {/* Department Filter */}
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">All Locations</option>
                    <option value="Remote">Remote</option>
                    <option value="New York">New York</option>
                    <option value="San Francisco">San Francisco</option>
                    <option value="London">London</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Experience Filter */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={filters.experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">All Levels</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Executive">Executive</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              {/* Results Summary */}
              <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>
                    Showing {jobs.length} of {totalJobs} jobs
                    {filters.search && ` for "${filters.search}"`}
                  </span>
                </div>
                {(filters.search || filters.department || filters.location || filters.experience) && (
                  <button
                    onClick={() => setFilters({
                      search: '',
                      department: '',
                      location: '',
                      experience: '',
                      page: 1,
                      limit: 6
                    })}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Job Listings */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto">
                    <div className="text-red-400 mb-4">
                      <X className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Error Loading Jobs</h3>
                    <p className="text-red-300 mb-4">{error}</p>
                    <button
                      onClick={fetchJobs}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 max-w-md mx-auto">
                    <div className="text-slate-400 mb-4">
                      <Search className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Jobs Found</h3>
                    <p className="text-slate-400 mb-4">
                      Try adjusting your search criteria or explore different categories
                    </p>
                    <button
                      onClick={() => setFilters({
                        search: '',
                        department: '',
                        location: '',
                        experience: '',
                        page: 1,
                        limit: 6
                      })}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
                    >
                      View All Jobs
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {jobs.map((job, index) => (
                    <JobCard key={job._id || job.id || index} job={job} index={index} />
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      <button
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page <= 1}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white hover:border-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>

                      <div className="flex gap-2">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          const page = i + 1;
                          const isActive = page === filters.page;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                                isActive
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                                  : 'bg-slate-800 border border-slate-600 text-white hover:border-cyan-400'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page >= totalPages}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white hover:border-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Job Details Modal */}
        <JobDetailsModal 
          job={selectedJob} 
          isOpen={showJobModal} 
          onClose={handleCloseModal} 
        />
      </div>
    );
  };

  export default ModernStaffHiring;