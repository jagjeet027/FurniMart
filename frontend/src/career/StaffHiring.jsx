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
  ArrowRight,
  Menu
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
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

  const API_BASE_URL = 'http://localhost:5000/api/careers' || import.meta.env.VITE_API_URL || 'https://furnimart-careerspage-com.onrender.com/api/careers';

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

      .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      button {
        position: relative;
        z-index: 10;
      }

      @media (max-width: 640px) {
        .mobile-filter-slide {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 50;
          background: rgba(0, 0, 0, 0.8);
        }
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

  const handleViewJob = (job, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleCloseModal = () => {
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
    setShowMobileFilters(false);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      'Urgent': 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-500/25',
      'Hot': 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/25',
      'New': 'bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-green-500/25',
      'High': 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-lg shadow-amber-500/25'
    };
    
    if (urgency && urgencyStyles[urgency]) {
      return (
        <div className={`relative px-2 py-1 text-xs font-bold rounded-full border ${urgencyStyles[urgency]} animate-pulse`}>
          <Zap className="w-3 h-3 inline mr-1" />
          {urgency}
        </div>
      );
    }
    return null;
  };

  // Job Card Component - Fully Responsive
  const JobCard = ({ job, index }) => (
    <div className={`group relative bg-gradient-to-br from-amber-50 to-orange-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-amber-200 hover:border-amber-400 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/20 animate-fade-in-up`}
        style={{ animationDelay: `${index * 100}ms` }}>
      
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur transition-opacity duration-500 -z-10"></div>
      
      {/* Content - Stacked on mobile, linear on desktop */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
        {/* Left side - Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-amber-900 group-hover:text-orange-700 transition-colors break-words flex-1 min-w-0">
              {job.title}
            </h3>
            {getUrgencyBadge(job.urgency)}
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-amber-700 mb-2 sm:mb-3 flex-wrap">
            <div className="flex items-center gap-1 hover:text-orange-600 transition-colors">
              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{job.department}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-orange-600 transition-colors">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-orange-600 transition-colors">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{job.type || job.jobType}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-green-600 transition-colors font-semibold">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{formatSalary(job.salary)}</span>
            </div>
          </div>

          <p className="text-amber-800 text-xs sm:text-sm line-clamp-2 group-hover:text-amber-900 transition-colors mb-2 sm:mb-3">
            {job.description}
          </p>

          {/* Tags and metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 text-xs text-amber-600 flex-wrap">
              {(job.postedDate || job.createdAt) && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">{new Date(job.postedDate || job.createdAt).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                <User className="w-3 h-3 flex-shrink-0" />
                <span className="whitespace-nowrap">{job.experience || job.experienceLevel}</span>
              </div>
              {job.applicationsCount && (
                <div className="flex items-center gap-1 hover:text-orange-600 transition-colors">
                  <Users className="w-3 h-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">{job.applicationsCount} Applied</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {job.tags.slice(0, 2).map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-amber-100 text-orange-700 text-xs rounded-full border border-amber-300 hover:border-orange-400 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
                {job.tags.length > 2 && (
                  <span className="text-xs text-amber-600">+{job.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Action Button */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          <button
            type="button"
            onClick={(e) => handleViewJob(job, e)}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 hover:from-amber-700 hover:to-orange-700 hover:shadow-lg hover:shadow-amber-500/25 transform hover:-translate-y-1"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ icon, title, value, gradient, delay = 0 }) => (
    <div className={`bg-gradient-to-br from-amber-50 to-orange-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-amber-200 hover:border-amber-400 transition-all duration-500 group animate-fade-in-up`}
        style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-amber-700 text-xs sm:text-sm">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-900">{value || 0}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-800 via-orange-700 to-amber-900">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-orange-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-amber-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-300 animate-pulse" />
              <span className="text-amber-200 text-xs sm:text-sm font-semibold uppercase tracking-wider">FurniMart Careers</span>
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-300 animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-200 to-amber-300 animate-fade-in px-4">
              Build Your Career
            </h1>
            <p className="mt-4 sm:mt-6 max-w-2xl mx-auto text-sm sm:text-base lg:text-xl text-amber-100 animate-fade-in-up px-4" style={{ animationDelay: '500ms' }}>
              Join FurniMart and discover {totalJobs || 'amazing'} opportunities across innovative departments.
            </p>
          </div>

          {/* Registration Cards */}
          <div className="mt-8 sm:mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* Individual Registration */}
            <div className="group relative animate-fade-in-up" style={{ animationDelay: '800ms' }}>
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 rounded-xl sm:rounded-2xl blur-xl opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <div className="relative bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 border-2 border-amber-300 group-hover:border-amber-500 transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-t-xl sm:rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4 sm:mb-6">
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl sm:rounded-2xl shadow-2xl shadow-amber-500/25 group-hover:shadow-amber-500/50 transition-all duration-300">
                      <User className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                      <Star className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-amber-900 mb-2 sm:mb-3 group-hover:text-orange-800 transition-colors">
                    Join as Individual
                  </h3>
                  <p className="text-amber-800 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                    Perfect for job seekers looking to discover their next career opportunity at FurniMart.
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6 sm:mb-8 justify-center">
                    <span className="px-2 sm:px-3 py-1 bg-amber-200 text-amber-800 text-xs rounded-full border border-amber-300">Resume Upload</span>
                    <span className="px-2 sm:px-3 py-1 bg-orange-200 text-orange-800 text-xs rounded-full border border-orange-300">Job Alerts</span>
                    <span className="px-2 sm:px-3 py-1 bg-amber-200 text-amber-800 text-xs rounded-full border border-amber-300">Career Growth</span>
                  </div>
                  
                  <button 
                    onClick={handleIndividualRegister}
                    className="group/btn relative w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 hover:from-amber-700 hover:to-orange-700 hover:shadow-2xl hover:shadow-amber-500/25 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>Get Started Now</span>
                      <Rocket className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Organization Registration */}
            <div className="group relative animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-xl sm:rounded-2xl blur-xl opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt-reverse"></div>
              <div className="relative bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 border-2 border-orange-300 group-hover:border-orange-500 transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-600 rounded-t-xl sm:rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4 sm:mb-6">
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl sm:rounded-2xl shadow-2xl shadow-orange-500/25 group-hover:shadow-orange-500/50 transition-all duration-300">
                      <Building2 className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
                      <Award className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-amber-900 mb-2 sm:mb-3 group-hover:text-orange-800 transition-colors">
                    Register Organization
                  </h3>
                  <p className="text-amber-800 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                    For companies looking to hire top talent from colleges and universities.
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6 sm:mb-8 justify-center">
                    <span className="px-2 sm:px-3 py-1 bg-orange-200 text-orange-800 text-xs rounded-full border border-orange-300">Talent Pool</span>
                    <span className="px-2 sm:px-3 py-1 bg-amber-200 text-amber-800 text-xs rounded-full border border-amber-300">Bulk Hiring</span>
                    <span className="px-2 sm:px-3 py-1 bg-orange-200 text-orange-800 text-xs rounded-full border border-orange-300">Analytics</span>
                  </div>
                  
                  <button 
                    onClick={handleOrganizationRegister}
                    className="group/btn relative w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 hover:from-orange-700 hover:to-amber-700 hover:shadow-2xl hover:shadow-orange-500/25 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>Start Hiring</span>
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      {stats && (
        <div className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-amber-100 to-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-900 mb-2 sm:mb-4">Our Impact</h2>
              <p className="text-amber-700 text-sm sm:text-base lg:text-lg">Real numbers that showcase our growing community</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard
                icon={<Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                title="Active Jobs"
                value={stats.totalJobs}
                gradient="from-amber-600 to-orange-600"
                delay={0}
              />
              <StatCard
                icon={<Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                title="Total Applications"
                value={stats.totalApplications}
                gradient="from-orange-600 to-amber-600"
                delay={200}
              />
              <StatCard
                icon={<Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                title="Departments"
                value={stats.totalDepartments}
                gradient="from-amber-700 to-orange-700"
                delay={400}
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                title="Success Rate"
                value={stats.successRate ? `${stats.successRate}%` : '95%'}
                gradient="from-orange-700 to-red-600"
                delay={600}
              />
            </div>
          </div>
        </div>
      )}

      {/* Job Search and Filter Section */}
      <div className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-900 mb-2 sm:mb-4">Explore Opportunities</h2>
            <p className="text-amber-700 text-sm sm:text-base lg:text-lg">Find the perfect role that matches your skills</p>
          </div>

          {/* Search and Filters - Mobile & Desktop */}
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-8 sm:mb-12 border-2 border-amber-300">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-between px-4 py-3 bg-amber-200 text-amber-900 rounded-lg font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  <span className="text-sm">Filters</span>
                </div>
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop Filters & Mobile Expanded Filters */}
            <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {/* Search Input */}
                <div className="lg:col-span-2 relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base bg-white border-2 border-amber-300 rounded-lg sm:rounded-xl text-amber-900 placeholder-amber-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-400 transition-colors"
                  />
                </div>

                {/* Department Filter */}
                <div className="relative">
                  <Building2 className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-amber-700 pointer-events-none" />
                  <select
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base bg-white border-2 border-amber-300 rounded-lg sm:rounded-xl text-amber-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-400 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div className="relative">
                  <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-amber-700 pointer-events-none" />
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base bg-white border-2 border-amber-300 rounded-lg sm:rounded-xl text-amber-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-400 transition-colors appearance-none cursor-pointer"
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
                  <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-amber-700 pointer-events-none" />
                  <select
                    value={filters.experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base bg-white border-2 border-amber-300 rounded-lg sm:rounded-xl text-amber-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-400 transition-colors appearance-none cursor-pointer"
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
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-amber-800">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Showing {jobs.length} of {totalJobs} jobs
                    {filters.search && ` for "${filters.search}"`}
                  </span>
                </div>
                {(filters.search || filters.department || filters.location || filters.experience) && (
                  <button
                    onClick={() => {
                      setFilters({
                        search: '',
                        department: '',
                        location: '',
                        experience: '',
                        page: 1,
                        limit: 6
                      });
                      setShowMobileFilters(false);
                    }}
                    className="text-orange-600 hover:text-orange-700 transition-colors font-semibold whitespace-nowrap"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="space-y-4 sm:space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12 sm:py-20">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-amber-300 border-t-orange-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12 sm:py-20">
                <div className="bg-red-100 border-2 border-red-300 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md mx-auto">
                  <div className="text-red-600 mb-4">
                    <X className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-red-900 mb-2">Error Loading Jobs</h3>
                  <p className="text-sm sm:text-base text-red-700 mb-4">{error}</p>
                  <button
                    onClick={fetchJobs}
                    className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg sm:rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 sm:py-20">
                <div className="bg-amber-100 border-2 border-amber-300 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md mx-auto">
                  <div className="text-amber-700 mb-4">
                    <Search className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-2">No Jobs Found</h3>
                  <p className="text-sm sm:text-base text-amber-800 mb-4">
                    Try adjusting your search criteria
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
                    className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-300"
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
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2 mt-8 sm:mt-12">
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page <= 1}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm bg-amber-200 border-2 border-amber-300 rounded-lg text-amber-900 hover:border-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <div className="flex gap-2 overflow-x-auto max-w-full px-2">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const page = i + 1;
                        const isActive = page === filters.page;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 sm:px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                              isActive
                                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                                : 'bg-amber-200 border-2 border-amber-300 text-amber-900 hover:border-orange-500'
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
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm bg-amber-200 border-2 border-amber-300 rounded-lg text-amber-900 hover:border-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Next</span>
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