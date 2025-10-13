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
    onClose();
    navigate(`/jobs/${job._id}/apply`);
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
      'Urgent': 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md',
      'Hot': 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md',
      'New': 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md',
      'High': 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-md'
    };
    
    if (urgency && urgencyStyles[urgency]) {
      return (
        <div className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full ${urgencyStyles[urgency]} animate-pulse`}>
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

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #fef3e2;
        border-radius: 3px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #d4a373;
        border-radius: 3px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #c08552;
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl max-h-[95vh] bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 rounded-xl sm:rounded-2xl border-2 border-amber-200 shadow-2xl animate-scale-in overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 bg-white/90 hover:bg-amber-100 text-amber-800 hover:text-amber-900 rounded-full transition-all duration-300 shadow-md"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[95vh] custom-scrollbar">
          {/* Header Section */}
          <div className="relative p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-amber-100 to-orange-100 border-b-2 border-amber-200">
            <div className="relative">
              {/* Job Title and Apply Button Row */}
              <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-4">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-900">{job.title}</h1>
                    {getUrgencyBadge(job.urgency)}
                  </div>
                  
                  {/* Company/Department Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 sm:gap-4 text-amber-800 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span className="font-medium truncate">{job.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{job.type || job.jobType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="font-semibold text-green-700 truncate">{formatSalary(job.salary)}</span>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="w-full lg:w-auto lg:ml-4">
                  <button
                    onClick={handleApplyNow}
                    className="group relative w-full lg:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-300 hover:from-amber-600 hover:to-orange-700 hover:shadow-xl hover:shadow-amber-500/30 transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>Apply Now</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Job Meta Info */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-amber-700">
                {(job.postedDate || job.createdAt) && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Posted {new Date(job.postedDate || job.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{job.experience || job.experienceLevel}</span>
                </div>
                {job.applicationsCount !== undefined && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{job.applicationsCount} Applied</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Job Description */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  Job Description
                </h2>
                <p className="text-amber-800 leading-relaxed text-sm sm:text-base">
                  {job.description}
                </p>
              </div>

              {/* Two Column Layout for Requirements and Responsibilities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      Requirements
                    </h2>
                    <ul className="space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-amber-800 text-sm">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Responsibilities */}
                {job.responsibilities && job.responsibilities.length > 0 && (
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                      Key Responsibilities
                    </h2>
                    <ul className="space-y-2">
                      {job.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start gap-2 text-amber-800 text-sm">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
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
                  <h2 className="text-base sm:text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                    Benefits & Perks
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {job.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-amber-200 hover:border-yellow-400 transition-colors">
                        <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <span className="text-amber-800 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills/Tags */}
              {job.tags && job.tags.length > 0 && (
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-amber-900 mb-4">Skills & Technologies</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full border border-amber-300 hover:border-amber-400 transition-colors text-xs sm:text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Apply Section */}
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-amber-300 text-center">
                <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-3">Interested in this position?</h3>
                <p className="text-amber-800 mb-5 text-sm sm:text-base max-w-2xl mx-auto">
                  Take the next step in your career journey. Submit your application today.
                </p>
                
                <button
                  onClick={handleApplyNow}
                  className="inline-flex items-center gap-2 px-8 py-3 sm:px-10 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-300 hover:from-amber-600 hover:to-orange-700 hover:shadow-xl hover:shadow-amber-500/30 transform hover:-translate-y-0.5"
                >
                  <span>Submit Application</span>
                  <ArrowRight className="w-5 h-5" />
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