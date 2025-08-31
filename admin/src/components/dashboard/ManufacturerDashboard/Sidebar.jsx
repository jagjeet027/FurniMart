import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Home, Building2, TrendingUp, Lightbulb, Package, FileText, 
  BarChart3, Settings, UserCheck, X, ArrowLeft, Clock, AlertCircle, 
  CheckCircle2, XCircle, MessageSquare, Send, Edit3, Trash2, Menu,
  ChevronDown, ChevronRight, Users, Briefcase, Building
} from 'lucide-react';

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

// Mock useAuth hook for demonstration
const useAuth = () => ({
  user: {
    isManufacturer: true,
    name: 'Jagjeet jaiswal',
    email: 'jagjeetjaiwal027@gmail.com'
  }
});

// Sidebar Component
const Sidebar = ({ isOpen, onClose, activeSection, onSectionChange }) => {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState({});

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
      // Toggle expansion for items with sub-items
      setExpandedItems(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
      return;
    }

    if (item.route) {
      // Navigate to specific route
      navigate(item.route);
    } else {
      // Handle normal section change
      onSectionChange(item.id);
    }
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) onClose();
  };

  const handleSubItemClick = (parentId, subItem) => {
    // Set the active section to the sub-item
    onSectionChange(subItem.id);
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) onClose();
  };

  // Auto-expand career section if any of its sub-items are active
  useEffect(() => {
    const careerSubItems = ['organization', 'individuals', 'jobBoard'];
    if (careerSubItems.includes(activeSection)) {
      setExpandedItems(prev => ({
        ...prev,
        career: true
      }));
    }
  }, [activeSection]);

  return (
    <>
      {/* Inject custom styles */}
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

                  {/* Sub-items */}
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
        
        <div className="p-4 border-t border-gradient-to-r from-cyan-400/10 via-purple-400/10 to-pink-400/10 bg-gradient-to-r from-slate-900/30 to-slate-800/30 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50 rounded-lg hover:from-slate-700/60 hover:to-slate-700/40 transition-all duration-300 cursor-pointer group border border-white/5 hover:border-cyan-400/20">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 via-purple-500/15 to-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm shadow-cyan-500/20">
              <UserCheck className="h-4 w-4 text-cyan-300 group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium text-xs truncate tracking-wide">Admin User</p>
              <p className="text-white/50 text-xs truncate">admin@company.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;