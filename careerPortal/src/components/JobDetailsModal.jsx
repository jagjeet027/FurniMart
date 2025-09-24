import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  User,
  Calendar,
  Users,
  Briefcase,
  CheckCircle,
  ArrowRight,
  Zap,
  Star,
  Award,
  Target
} from 'lucide-react';

const JobDetailsModal = ({ job, isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleApplyNow = () => {
    onClose(); // Close the modal first
    navigate(`/jobs/${job._id}/apply`); // Navigate to application form
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
        <div className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border ${urgencyStyles[urgency]} animate-pulse`}>
          <Zap className="w-3 h-3 mr-1" />
          {urgency}
        </div>
      );
    }
    return null;
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Add custom CSS styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #1e293b;
        border-radius: 4px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #475569;
        border-radius: 4px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #64748b;
      }

      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes scale-in {
        from { 
          opacity: 0; 
          transform: scale(0.95); 
        }
        to { 
          opacity: 1; 
          transform: scale(1); 
        }
      }
      
      .animate-fade-in {
        animation: fade-in 0.2s ease-out;
      }
      
      .animate-scale-in {
        animation: scale-in 0.3s ease-out;
      }
    `;
    
    document.head.appendChild(styleElement);

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  if (!isOpen || !job) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] mx-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl animate-scale-in overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all duration-300 backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh] custom-scrollbar">
          {/* Header Section */}
          <div className="relative p-8 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border-b border-slate-700">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-cyan-500 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-purple-500 rounded-full blur-2xl"></div>
            </div>

            <div className="relative">
              {/* Job Title and Apply Button Row */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h1 className="text-3xl font-bold text-white">{job.title}</h1>
                    {getUrgencyBadge(job.urgency)}
                  </div>
                  
                  {/* Company/Department Info */}
                  <div className="flex flex-wrap items-center gap-6 text-slate-300">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-cyan-400" />
                      <span className="font-medium">{job.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-400" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                      <span>{job.type || job.jobType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-yellow-400" />
                      <span className="font-semibold text-green-400">{formatSalary(job.salary)}</span>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="ml-8">
                  <button
                    onClick={handleApplyNow}
                    className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:from-cyan-600 hover:to-blue-700 hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-3">
                      <span>Apply Now</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Job Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                {(job.postedDate || job.createdAt) && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Posted {new Date(job.postedDate || job.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{job.experience || job.experienceLevel}</span>
                </div>
                {job.applicationsCount !== undefined && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{job.applicationsCount} Applied</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Job Description */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-cyan-400" />
                  Job Description
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 leading-relaxed text-lg">
                    {job.description}
                  </p>
                </div>
              </div>

              {/* Two Column Layout for Requirements and Responsibilities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      Requirements
                    </h2>
                    <ul className="space-y-3">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-3 text-slate-300">
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Responsibilities */}
                {job.responsibilities && job.responsibilities.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      Key Responsibilities
                    </h2>
                    <ul className="space-y-3">
                      {job.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start gap-3 text-slate-300">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Benefits & Perks
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {job.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-yellow-400/50 transition-colors">
                        <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        <span className="text-slate-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills/Tags */}
              {job.tags && job.tags.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Skills & Technologies</h2>
                  <div className="flex flex-wrap gap-3">
                    {job.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-cyan-300 rounded-full border border-slate-600 hover:border-cyan-400 transition-colors text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Apply Section */}
              <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 p-8 rounded-2xl border border-cyan-500/30 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Interested in this position?</h3>
                <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                  Take the next step in your career journey. Submit your application and join our growing team.
                </p>
                
                <button
                  onClick={handleApplyNow}
                  className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:from-cyan-600 hover:to-blue-700 hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-1"
                >
                  <span>Submit Application</span>
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;