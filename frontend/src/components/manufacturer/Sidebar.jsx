import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { X, Menu, AlertCircle } from 'lucide-react';
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
  
  // Idea submission modal state
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [ideaName, setIdeaName] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [ideaCategory, setIdeaCategory] = useState('general');
  const [isSubmittingIdea, setIsSubmittingIdea] = useState(false);
  
  // Chat modal state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Handle window resize to detect mobile/desktop view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Auto-close sidebar on mobile when resizing down
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

  const menuItems = [
  { path: '/', icon: HomeIcon, label: 'Dashboard', badge: null },
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
  // ADD THIS NEW MENU ITEM
  { 
    path: '/new-idea', 
    icon: Lightbulb, 
    label: 'Innovation Hub', 
    badge: 'NEW',
    requiresAuth: true // Available for both users and manufacturers
  },
  { 
    path: '/ideas', 
    icon: AlertCircle, 
    label: 'Idea Submissions', 
    badge: null,
    requiresManufacturer: true 
  },
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
];


  const handleNavigation = (path, item) => {
    console.log('Navigation clicked:', { path, item }); // Debug log
    
    if (item && item.onClick) {
      console.log('Executing onClick handler');
      item.onClick();
    } else {
      console.log('Normal navigation to:', path);
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

  // Handle idea submission - Fixed to match controller
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

      // Use the correct API endpoint matching your controller
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

  const filteredMenuItems = menuItems.filter(item => 
    !item.requiresManufacturer || (user && user.isManufacturer)
  );
  
  const sidebarWidthClass = isMobile
    ? sidebarOpen ? 'w-64' : 'w-0'
    : sidebarOpen ? 'w-64' : 'w-20';

  return (
    <>
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Idea Submission Modal - Fixed to match controller */}
      {showIdeaModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-6">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Submit New Idea</h3>
              <button
                onClick={() => setShowIdeaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleIdeaSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idea Name *
                </label>
                <input
                  type="text"
                  value={ideaName}
                  onChange={(e) => setIdeaName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g: Smart Furniture Design, New Product Concept, etc."
                  required
                  maxLength={200}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={ideaCategory}
                  onChange={(e) => setIdeaCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="technical">Technical Innovation</option>
                  <option value="billing">Business Model</option>
                  <option value="order">Process Improvement</option>
                  <option value="product">Product Design</option>
                  <option value="general">General Suggestion</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idea Details (Optional)
                </label>
                <textarea
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Please describe your idea in detail..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowIdeaModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIdea}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50"
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
        bg-gradient-to-br from-amber-800 via-amber-700 to-amber-600
        transition-all duration-300 ease-in-out
        ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        ${sidebarWidthClass}
        overflow-hidden
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-amber-600/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
              <SofaIcon className="h-6 w-6 text-amber-800" />
            </div>
            <span className={`text-white font-bold text-xl whitespace-nowrap transition-opacity duration-200 ${sidebarOpen || !isMobile ? 'opacity-100' : 'opacity-0'}`}>
              {loading ? 'Loading...' : (user?.isManufacturer ? manufacturerData?.businessName : 'FurniMart')}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin">
          {filteredMenuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path, item)} // ⭐ FIXED: Item parameter pass kiya
              className={`
                flex items-center w-full px-4 py-3 my-1 mx-1 rounded-lg
                transition-all duration-200
                ${location.pathname === item.path ? 'bg-white/20' : ''}
                ${item.isPremium ? 'bg-amber-900/30 my-2 font-bold text-amber-100' : 'text-amber-100 hover:bg-white/10'}
                ${item.isChat ? 'bg-white/10 border border-white/20' : ''}
              `}
            >
              <item.icon size={20} className="flex-shrink-0" />
              <span className={`ml-3 text-sm ${item.isPremium ? 'font-bold' : 'font-medium'} whitespace-nowrap transition-opacity duration-200 ${sidebarOpen || !isMobile ? 'opacity-100' : 'opacity-0 w-0'}`}>
                {item.label}
              </span>
              {item.badge && (sidebarOpen || !isMobile) && (
                <span className={`
                  ml-auto px-2 py-1 text-xs rounded-full whitespace-nowrap
                  ${item.isPremium ? 'bg-amber-300 text-amber-900' : ''}
                  ${item.isChat ? 'bg-blue-200 text-blue-800' : 'bg-amber-200 text-amber-800'}
                  transition-opacity duration-200 ${sidebarOpen || !isMobile ? 'opacity-100' : 'opacity-0 w-0'}
                `}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          {/* Quick Idea Submission Button - Only for manufacturers */}
          {user?.isManufacturer && (
            <button
              onClick={() => setShowIdeaModal(true)}
              className="flex items-center w-full px-4 py-3 my-2 mx-1 rounded-lg text-amber-100 hover:bg-blue-500/20 transition-all duration-200 border border-blue-400/30"
            >
              <AlertCircle size={20} className="flex-shrink-0 text-blue-300" />
              <span className={`ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${sidebarOpen || !isMobile ? 'opacity-100' : 'opacity-0 w-0'}`}>
                Submit Idea
              </span>
            </button>
          )}
        </nav>

        {/* User profile section */}
        <div className="border-t border-amber-600/50 p-4">
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-pulse w-full h-12 bg-amber-600/20 rounded-lg" />
            </div>
          ) : isAuthenticated && user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/10 transition-colors">
                <img
                  src="/api/placeholder/40/40"
                  alt="Profile"
                  className="w-10 h-10 rounded-full ring-2 ring-amber-200 flex-shrink-0"
                />
                {(sidebarOpen || !isMobile) && (
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h4 className="text-white font-medium text-sm truncate">
                      {user.name || user.email}
                    </h4>
                    <p className="text-amber-200 text-xs truncate">
                      {user.isManufacturer ? 'Manufacturer' : 'Customer'}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className={`w-full px-4 py-2 text-sm text-white bg-amber-900/30 rounded-lg hover:bg-amber-900/50 transition-colors ${!sidebarOpen && !isMobile ? 'flex justify-center' : ''}`}
              >
                {(sidebarOpen || !isMobile) ? 'Logout' : <X size={16} />}
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className={`w-full px-4 py-2 text-sm text-white bg-amber-900/30 rounded-lg hover:bg-amber-900/50 transition-colors ${!sidebarOpen && !isMobile ? 'flex justify-center' : ''}`}
            >
              {(sidebarOpen || !isMobile) ? 'Login' : <User size={16} />}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile toggle button */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-700 transition-colors"
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