import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Home, Building2, TrendingUp, Lightbulb, Package, FileText, 
  BarChart3, Settings, UserCheck, X, ArrowLeft, Clock, AlertCircle, 
  CheckCircle2, XCircle, MessageSquare, Send, Edit3, Trash2, Menu
} from 'lucide-react';

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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'manufacturers', label: 'Manufacturers', icon: Building2 },
    { id: 'revenue', label: 'Revenue Analysis', icon: TrendingUp },
    { id: 'innovations', label: 'Innovations List', icon: Lightbulb },
    { id: 'products', label: 'Logistic', icon: Package },
    { id: 'reports', label: 'Reports', icon: FileText, route: '/issues' }, // Added route property
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleMenuClick = (item) => {
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

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-indigo-900/95 to-purple-900/95 
        backdrop-blur-xl border-r border-white/10 z-50 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">FurniMart</h1>
                <p className="text-white/60 text-xs">Admin Panel</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left 
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-white/20 text-white shadow-lg border border-white/20' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 transition-transform ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium text-sm truncate">Admin User</p>
              <p className="text-white/60 text-xs truncate">admin@company.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;