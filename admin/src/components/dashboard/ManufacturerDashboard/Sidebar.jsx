import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Building2, TrendingUp, Lightbulb, Package, FileText, 
  BarChart3, Settings, UserCheck, X, Clock, LogOut,
  ChevronRight, Users, Briefcase, Building, Menu
} from 'lucide-react';

// Import your AuthContext
// import { useAuth } from '../contexts/AuthContext';

// Custom CSS for scrollbar
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, rgba(34, 211, 238, 0.3), rgba(168, 85, 247, 0.3));
    border-radius: 2px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, rgba(34, 211, 238, 0.5), rgba(168, 85, 247, 0.5));
  }
  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  .animate-in {
    animation: slideInFromLeft 0.3s ease-out forwards;
  }
  .slide-in-from-left-1 {
    animation-duration: 0.2s;
  }
  .slide-in-from-left-2 {
    animation-duration: 0.3s;
  }
`;

// Sidebar Component with Backend Integration
const Sidebar = ({ isOpen, onClose, activeSection, onSectionChange }) => {
  const navigate = useNavigate();
  // IMPORTANT: Uncomment this and remove the mock when integrating
  // const { user, logout, isAuthenticated } = useAuth();
  
  // Mock for demonstration - REMOVE THIS when integrating
  const mockAuth = {
    user: {
      email: 'admin@furnimart.com',
      adminId: 'ADmin820',
      id: '123'
    },
    logout: () => {
      console.log('Logout called');
      // Add your logout logic here
    },
    isAuthenticated: true
  };
  
  const { user, logout, isAuthenticated } = mockAuth;
  
  const [expandedItems, setExpandedItems] = useState({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'manufacturers', label: 'Manufacturers', icon: Building2 },
    {
      id: 'career', 
      label: 'Career', 
      icon: Clock,
      hasSubItems: true,
      subItems: [
        { id: 'organization', label: 'Recruitment', icon: Building },
        { id: 'jobBoard', label: 'Job Board', icon: Briefcase }
      ]
    },
    { id: 'revenue', label: 'Revenue Analysis', icon: TrendingUp },
    { id: 'innovations', label: 'Innovations List', icon: Lightbulb },
    { id: 'products', label: 'Logistic', icon: Package },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleMenuClick = (item) => {
    if (item.hasSubItems) {
      setExpandedItems(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
      return;
    }

    if (item.route) {
      navigate(item.route);
    } else {
      onSectionChange(item.id);
    }
    
    if (window.innerWidth < 1024) onClose();
  };

  const handleSubItemClick = (parentId, subItem) => {
    onSectionChange(subItem.id);
    if (window.innerWidth < 1024) onClose();
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/admin/login'); // Adjust route as needed
  };

  useEffect(() => {
    const careerSubItems = ['organization', 'individuals', 'jobBoard'];
    if (careerSubItems.includes(activeSection)) {
      setExpandedItems(prev => ({
        ...prev,
        career: true
      }));
    }
  }, [activeSection]);

  // Get display name from email
  const getDisplayName = () => {
    if (!user?.email) return 'Admin User';
    return user.email.split('@')[0];
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customScrollbarStyles }} />
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed top-0 left-0 h-screen w-60 bg-gradient-to-br from-slate-950/95 via-indigo-950/90 to-purple-950/95 
        backdrop-blur-2xl border-r border-gradient-to-b from-cyan-400/20 via-purple-400/10 to-pink-400/20 z-50 flex flex-col
        transform transition-all duration-500 ease-out shadow-2xl shadow-purple-900/50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-cyan-500/5 before:via-transparent before:to-purple-500/5 before:pointer-events-none
      `}>
        <div className="p-5 border-b border-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400/30 via-purple-400/20 to-pink-400/30 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25 hover:shadow-purple-500/25 transition-all duration-300 group">
                <Building2 className="h-4 w-4 text-cyan-300 group-hover:text-purple-300 transition-colors duration-300" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">FurniMart</h1>
                <p className="text-white/50 text-xs font-medium">Admin Portal</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-300 lg:hidden hover:scale-110 active:scale-95"
            >
              <X className="h-4 w-4 text-white/70 hover:text-white transition-colors" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
          <nav className="px-3 space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id || (item.hasSubItems && item.subItems?.some(sub => sub.id === activeSection));
              const isExpanded = expandedItems[item.id];
              
              return (
                <div key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm font-medium
                      transition-all duration-300 ease-out group relative overflow-hidden
                      ${isActive 
                        ? 'bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-pink-500/20 text-white shadow-lg shadow-purple-500/20 border border-cyan-400/30' 
                        : 'text-white/70 hover:bg-gradient-to-r hover:from-white/8 hover:to-white/4 hover:text-white hover:shadow-md hover:shadow-cyan-500/10'
                      }
                      before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent 
                      before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
                    `}
                  >
                    <Icon className={`h-4 w-4 flex-shrink-0 transition-all duration-300 ${
                      isActive ? 'scale-110 text-cyan-300' : 'group-hover:scale-105 group-hover:text-cyan-400'
                    }`} />
                    <span className="flex-1 tracking-wide">{item.label}</span>
                    
                    {item.hasSubItems && (
                      <div className={`transition-all duration-300 ${isExpanded ? 'rotate-90 text-cyan-300' : 'text-white/50'}`}>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                    
                    {isActive && !item.hasSubItems && (
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse shadow-sm shadow-cyan-400/50"></div>
                    )}
                  </button>

                  {item.hasSubItems && isExpanded && (
                    <div className="mt-1 ml-3 space-y-0.5 animate-in slide-in-from-left-2 duration-300">
                      {item.subItems.map((subItem, index) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = activeSection === subItem.id;
                        
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => handleSubItemClick(item.id, subItem)}
                            style={{ animationDelay: `${index * 50}ms` }}
                            className={`
                              w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium
                              transition-all duration-300 group relative overflow-hidden animate-in slide-in-from-left-1
                              ${isSubActive 
                                ? 'bg-gradient-to-r from-cyan-400/15 via-purple-400/10 to-pink-400/15 text-white shadow-md shadow-cyan-400/10 border border-cyan-300/20' 
                                : 'text-white/60 hover:bg-gradient-to-r hover:from-white/5 hover:to-white/3 hover:text-white/90'
                              }
                              before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:bg-gradient-to-b 
                              before:from-cyan-400 before:to-purple-400 before:transition-all before:duration-300
                              ${isSubActive ? 'before:opacity-100' : 'before:opacity-0 hover:before:opacity-60'}
                            `}
                          >
                            <div className={`w-1 h-1 rounded-full flex-shrink-0 transition-all duration-300 ${
                              isSubActive ? 'bg-gradient-to-r from-cyan-400 to-purple-400 shadow-sm shadow-cyan-400/50' : 'bg-white/30'
                            }`}></div>
                            <SubIcon className={`h-3.5 w-3.5 flex-shrink-0 transition-all duration-300 ${
                              isSubActive ? 'scale-110 text-cyan-300' : 'group-hover:scale-105 group-hover:text-cyan-400'
                            }`} />
                            <span className="tracking-wide">{subItem.label}</span>
                            {isSubActive && (
                              <div className="ml-auto w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse shadow-sm shadow-cyan-400/50"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
        
        {/* Admin Profile Section */}
        <div className="p-4 border-t border-gradient-to-r from-cyan-400/10 via-purple-400/10 to-pink-400/10 bg-gradient-to-r from-slate-900/30 to-slate-800/30 backdrop-blur-sm space-y-2">
          {/* Admin Info */}
          <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50 rounded-lg border border-white/5">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 via-purple-500/15 to-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm shadow-cyan-500/20">
              <UserCheck className="h-4 w-4 text-cyan-300 transition-colors duration-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium text-xs truncate tracking-wide">
                {getDisplayName()}
              </p>
              <p className="text-white/50 text-xs truncate">{user?.email || 'admin@company.com'}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-all duration-300 border border-red-500/20 hover:border-red-400/30 hover:shadow-lg hover:shadow-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-cyan-400/20 rounded-xl p-6 max-w-sm w-full shadow-2xl shadow-purple-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center">
                <LogOut className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Confirm Logout</h3>
            </div>
            <p className="text-white/70 text-sm mb-6">
              Are you sure you want to logout? You'll need to login again to access the admin portal.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-all duration-300 border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-red-500/30"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;