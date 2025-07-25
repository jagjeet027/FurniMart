import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { X, Menu } from 'lucide-react';
import {
  HomeIcon, BookOpen, BarChart2, Crown,
  User, Sofa as SofaIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [manufacturerData, setManufacturerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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
        const token = localStorage.getItem('accessToken');
        const response = await api.get(`http://localhost:5000/api/manufacturers/${user._id}`, {
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
    { path: '/furniture', icon: HomeIcon, label: 'Dashboard', badge: null },
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
    {
      path: '/premium',
      icon: Crown,
      label: 'Premium Features',
      badge: 'PRO',
      isPremium: true,
      requiresManufacturer: true
    },
    { path: '/profile', icon: User, label: 'Profile', badge: null },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setSidebarOpen(false);
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
              onClick={() => handleNavigation(item.path)}
              className={`
                flex items-center w-full px-4 py-3 my-1 mx-1 rounded-lg
                transition-all duration-200
                ${location.pathname === item.path ? 'bg-white/20' : ''}
                ${item.isPremium ? 'bg-amber-900/30 my-2 font-bold text-amber-100' : 'text-amber-100 hover:bg-white/10'}
              `}
            >
              <item.icon size={20} className="flex-shrink-0" />
              <span className={`ml-3 text-sm ${item.isPremium ? 'font-bold' : 'font-medium'} whitespace-nowrap transition-opacity duration-200 ${sidebarOpen || !isMobile ? 'opacity-100' : 'opacity-0 w-0'}`}>
                {item.label}
              </span>
              {item.badge && (sidebarOpen || !isMobile) && (
                <span className={`
                  ml-auto px-2 py-1 text-xs rounded-full whitespace-nowrap
                  ${item.isPremium ? 'bg-amber-300 text-amber-900' : 'bg-amber-200 text-amber-800'}
                  transition-opacity duration-200 ${sidebarOpen || !isMobile ? 'opacity-100' : 'opacity-0 w-0'}
                `}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
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
    </>
  );
};

export default Sidebar;