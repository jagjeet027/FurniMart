import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { X, Menu, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import {
  HomeIcon, BookOpen, BarChart2, Crown,
  User, Sofa as SofaIcon, Lightbulb
} from 'lucide-react';
import { MessageCircle, Minimize2, Maximize2 } from 'lucide-react';
import ManufacturerChat from '../manufacturer/ManufacturerChat';
import { useAuth } from '../../contexts/AuthContext';

const ChatModal = ({ isOpen, onClose, manufacturerId }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[100]" onClick={onClose} />
      
      {/* Modal */}
      <div className={`fixed z-[101] transition-all duration-300 ${
        isFullscreen 
          ? 'inset-0' 
          : isMinimized 
            ? 'bottom-4 right-4 w-80 h-16'
            : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[80vh] max-w-6xl'
      }`}>
        <div className="bg-white rounded-lg shadow-2xl h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">
                  {isMinimized ? 'Chat' : 'Manufacturer Chat Panel'}
                </h3>
                {!isMinimized && (
                  <p className="text-blue-100 text-sm">Manage your conversations</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="flex-1 overflow-hidden">
              <ManufacturerChat manufacturerId={manufacturerId} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [manufacturerData, setManufacturerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [expandedSections, setExpandedSections] = useState({});
  
  // Idea submission modal state
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [ideaName, setIdeaName] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [ideaCategory, setIdeaCategory] = useState('general');
  const [isSubmittingIdea, setIsSubmittingIdea] = useState(false);
  
  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    const fetchManufacturerData = async () => {
      if (!isAuthenticated || !user || !user._id) {
        setLoading(false);
        return;
      }
  
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`http://localhost:5000/api/manufacturers/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        
        setManufacturerData(response.data.data.manufacturer);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching manufacturer data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
  
    fetchManufacturerData();
  }, [isAuthenticated, user]);

  const menuSections = [
    {
      title: 'Main',
      items: [
        { path: '/', icon: HomeIcon, label: 'Dashboard', badge: null },
      ]
    },
    {
      title: 'Business',
      collapsible: true,
      items: [
        { 
          path: '/products', 
          icon: SofaIcon, 
          label: 'Inventory', 
          badge: '15',
          requiresManufacturer: true 
        },
        { 
          path: '/order', 
          icon: BookOpen, 
          label: 'Orders', 
          badge: 'New',
          requiresManufacturer: true 
        },
        { 
          path: '/analytics', 
          icon: BarChart2, 
          label: 'Analytics', 
          badge: null,
          requiresManufacturer: true 
        },
      ]
    },
    {
      title: 'Innovation',
      collapsible: true,
      items: [
        { 
          path: '/new-idea', 
          icon: Lightbulb, 
          label: 'Innovation Hub', 
          badge: 'NEW',
          requiresAuth: true
        },
        { 
          path: '/ideas', 
          icon: AlertCircle, 
          label: 'Idea Submissions', 
          badge: null,
          requiresManufacturer: true 
        },
      ]
    },
    {
      title: 'Account',
      items: [
        {
          path: '/premium',
          icon: Crown,
          label: 'Premium Features',
          badge: 'PRO',
          isPremium: true,
          requiresManufacturer: true
        },
        { path: '/profile', icon: User, label: 'Profile', badge: null },
        { 
          path: '/chat', 
          icon: MessageCircle, 
          label: 'Chat Panel', 
          badge: '3',
          isChat: true,
          onClick: () => setIsChatOpen(true)
        },
      ]
    }
  ];

  const toggleSection = (title) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleNavigation = (path, item) => {
    if (item && item.onClick) {
      item.onClick();
    } else {
      navigate(path);
      if (isMobile) {
        setSidebarOpen(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleIdeaSubmit = async (e) => {
    e.preventDefault();
    if (!ideaName.trim()) {
      alert('Please enter idea name');
      return;
    }

    setIsSubmittingIdea(true);
    try {
      const token = localStorage.getItem('accessToken');
      const ideaData = {
        name: ideaName,
        description: ideaDescription,
        category: ideaCategory,
      };

      await axios.post('http://localhost:5000/api/issues', ideaData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert('Your idea has been submitted successfully!');
      setIdeaName('');
      setIdeaDescription('');
      setIdeaCategory('general');
      setShowIdeaModal(false);
    } catch (error) {
      console.error('Error submitting idea:', error);
      alert(error.response?.data?.message || 'There was a problem submitting your idea. Please try again.');
    } finally {
      setIsSubmittingIdea(false);
    }
  };

  const sidebarWidthClass = isMobile
    ? sidebarOpen ? 'w-64' : 'w-0'
    : sidebarOpen ? 'w-64' : 'w-16';

  return (
    <>
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Idea Submission Modal */}
      {showIdeaModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Submit New Idea</h3>
              </div>
              <button
                onClick={() => setShowIdeaModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleIdeaSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idea Name *
                </label>
                <input
                  type="text"
                  value={ideaName}
                  onChange={(e) => setIdeaName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  placeholder="e.g: Smart Furniture Design"
                  required
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={ideaCategory}
                  onChange={(e) => setIdeaCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                >
                  <option value="technical">Technical Innovation</option>
                  <option value="billing">Business Model</option>
                  <option value="order">Process Improvement</option>
                  <option value="product">Product Design</option>
                  <option value="general">General Suggestion</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idea Details (Optional)
                </label>
                <textarea
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                  placeholder="Please describe your idea in detail..."
                />
                <p className="text-xs text-gray-500 mt-1">{ideaDescription.length}/1000 characters</p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIdeaModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIdea}
                  className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmittingIdea ? 'Submitting...' : 'Submit Idea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col
        bg-gradient-to-br from-amber-900 via-amber-800 to-amber-700
        transition-all duration-300 ease-in-out
        ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        ${sidebarWidthClass}
        overflow-hidden shadow-xl
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-amber-600/30 bg-gradient-to-r from-amber-900/50 to-transparent">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl shadow-lg flex-shrink-0">
              <SofaIcon className="h-5 w-5 text-amber-800" />
            </div>
            <div className={`transition-all duration-200 ${sidebarOpen || !isMobile ? 'opacity-100 w-auto' : 'opacity-0 w-0'} overflow-hidden`}>
              <h1 className="text-white font-bold text-base whitespace-nowrap leading-tight">
                {loading ? 'Loading...' : (user?.isManufacturer ? manufacturerData?.businessName : 'FurniMart')}
              </h1>
              <p className="text-amber-200 text-[10px] whitespace-nowrap">Premium Dashboard</p>
            </div>
          </div>
          {(sidebarOpen || !isMobile) && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-600 scrollbar-track-transparent">
          {menuSections.map((section) => {
            const filteredItems = section.items.filter(item => 
              !item.requiresManufacturer || (user && user.isManufacturer)
            );
            
            if (filteredItems.length === 0) return null;
            
            const isExpanded = section.collapsible ? expandedSections[section.title] !== false : true;
            
            return (
              <div key={section.title} className="mb-1">
                {/* Section Header */}
                {(sidebarOpen || !isMobile) && (
                  <div 
                    className={`px-4 py-2 flex items-center justify-between ${
                      section.collapsible ? 'cursor-pointer hover:bg-white/5' : ''
                    }`}
                    onClick={() => section.collapsible && toggleSection(section.title)}
                  >
                    <span className="text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                      {section.title}
                    </span>
                    {section.collapsible && (
                      isExpanded ? <ChevronDown size={12} className="text-amber-300" /> : <ChevronRight size={12} className="text-amber-300" />
                    )}
                  </div>
                )}
                
                {/* Section Items */}
                {isExpanded && (
                  <div className="space-y-0.5 px-2">
                    {filteredItems.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path, item)}
                        className={`
                          group flex items-center w-full px-3 py-2.5 rounded-lg
                          transition-all duration-200 relative overflow-hidden
                          ${location.pathname === item.path 
                            ? 'bg-white/20 shadow-md' 
                            : 'hover:bg-white/10'}
                          ${item.isPremium ? 'bg-gradient-to-r from-amber-900/40 to-amber-800/40 border border-amber-500/30' : ''}
                          ${item.isChat ? 'bg-blue-500/10 border border-blue-400/20' : ''}
                        `}
                      >
                        <div className={`
                          flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                          ${location.pathname === item.path ? 'bg-white/10' : 'bg-white/5'}
                          ${item.isPremium ? 'bg-amber-500/20' : ''}
                          ${item.isChat ? 'bg-blue-500/20' : ''}
                          transition-all duration-200
                        `}>
                          <item.icon size={16} className={`
                            ${location.pathname === item.path ? 'text-white' : 'text-amber-100'}
                            ${item.isPremium ? 'text-amber-200' : ''}
                            ${item.isChat ? 'text-blue-200' : ''}
                          `} />
                        </div>
                        
                        <span className={`
                          ml-3 text-xs font-medium whitespace-nowrap
                          ${location.pathname === item.path ? 'text-white font-semibold' : 'text-amber-50'}
                          ${item.isPremium ? 'text-amber-100 font-semibold' : ''}
                          transition-all duration-200
                          ${sidebarOpen || !isMobile ? 'opacity-100' : 'opacity-0 w-0'}
                        `}>
                          {item.label}
                        </span>
                        
                        {item.badge && (sidebarOpen || !isMobile) && (
                          <span className={`
                            ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap
                            ${item.isPremium ? 'bg-amber-300 text-amber-900' : ''}
                            ${item.isChat ? 'bg-blue-400 text-blue-900' : 'bg-amber-200 text-amber-800'}
                            transition-all duration-200 shadow-sm
                          `}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick Action Button */}
          {user?.isManufacturer && (sidebarOpen || !isMobile) && (
            <div className="px-2 mt-4">
              <button
                onClick={() => setShowIdeaModal(true)}
                className="flex items-center justify-center w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl group"
              >
                <Lightbulb size={16} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="ml-2 text-xs font-semibold">Submit New Idea</span>
              </button>
            </div>
          )}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-amber-600/30 p-3 bg-gradient-to-t from-amber-900/50 to-transparent">
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-pulse w-full h-14 bg-amber-600/20 rounded-xl" />
            </div>
          ) : isAuthenticated && user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="relative flex-shrink-0">
                  <img
                    src="/api/placeholder/40/40"
                    alt="Profile"
                    className="w-9 h-9 rounded-xl ring-2 ring-amber-300/50 group-hover:ring-amber-300 transition-all"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-amber-900"></div>
                </div>
                {(sidebarOpen || !isMobile) && (
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold text-xs truncate">
                      {user.name || user.email}
                    </h4>
                    <p className="text-amber-200 text-[10px] truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-amber-300 rounded-full"></span>
                      {user.isManufacturer ? 'Manufacturer' : 'Customer'}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className={`
                  w-full px-3 py-2 text-xs font-medium text-white 
                  bg-gradient-to-r from-red-600 to-red-700 
                  rounded-lg hover:from-red-700 hover:to-red-800 
                  transition-all duration-200 shadow-md hover:shadow-lg
                  ${!sidebarOpen && !isMobile ? 'flex justify-center' : ''}
                `}
              >
                {(sidebarOpen || !isMobile) ? 'Logout' : <X size={14} />}
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className={`
                w-full px-3 py-2 text-xs font-medium text-white 
                bg-gradient-to-r from-amber-600 to-amber-700 
                rounded-lg hover:from-amber-700 hover:to-amber-800 
                transition-all duration-200 shadow-md hover:shadow-lg
                ${!sidebarOpen && !isMobile ? 'flex justify-center' : ''}
              `}
            >
              {(sidebarOpen || !isMobile) ? 'Login' : <User size={14} />}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 left-6 z-50 p-4 bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-2xl shadow-2xl hover:shadow-amber-500/50 hover:scale-110 transition-all duration-200"
        >
          <Menu size={24} />
        </button>
      )}
      
      {/* Chat Modal */}
      <ChatModal 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        manufacturerId={user?._id}
      />
    </>
  );
};

export default Sidebar;