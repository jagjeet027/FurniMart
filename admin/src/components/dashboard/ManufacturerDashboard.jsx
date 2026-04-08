import React, { useState, useEffect } from 'react';
import { Bell, Building, Users, Briefcase } from 'lucide-react';

// Import all components
import Sidebar from './Sidebar';
import MobileMenuButton from './MobileMenuButton';
import DashboardSection from './DashboardSection';
import InnovationsSection from './InnovationsSection';
import ManufacturersSection from './ManufacturersSection';
import NotificationsPanel from './NotificationsPanel';
import AdminJobDashboard from './career/AdminJobDashboard';
import IdeaDetailsPage from './IdeaPage';
import { mockApi } from '../../services/api';
import OrganizationSection from './career/OrganizationSection';
import CargoDashboard from './cargo_insurance/CargoDashboard';
import FundingSchemes from '../dashboard/finance/FundingSchemes';

const ManufacturerDashboard = () => {
  const [manufacturers, setManufacturers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [manufacturersRes, notificationsRes] = await Promise.all([
        mockApi.get('/manufacturers/all'),
        mockApi.get('/notifications')
      ]);
      
      setManufacturers(manufacturersRes.data.data || []);
      
      const formattedNotifications = (notificationsRes.data.data || []).map(notification => ({
        ...notification,
        id: notification._id,
        time: new Date(notification.createdAt).toLocaleString()
      }));
      setNotifications(formattedNotifications);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, isNew: false } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSectionTitle = (section) => {
    const titles = {
      dashboard: 'Dashboard Overview',
      manufacturers: 'Manufacturers',
      organization: 'Organization',
      individuals: 'Individuals',
      jobBoard: 'Job Board',
      revenue: 'Revenue Analysis',
      innovations: 'Innovations List',
      products: 'Logistic',
      reports: 'Reports',
      analytics: 'Analytics',
      settings: 'Settings'
    };
    return titles[section] || section.replace(/([A-Z])/g, ' $1');
  };

  const renderActiveSection = () => {
    if (loading && !['organization', 'individuals', 'jobBoard'].includes(activeSection)) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
            <p className="text-white/70">Loading {getSectionTitle(activeSection)}...</p>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection manufacturers={manufacturers} />;
      case 'manufacturers':
        return <ManufacturersSection manufacturers={manufacturers} notifications={notifications} />;
      case 'cargo_insurance':
        return <CargoDashboard />;
      case 'innovations':
        return <InnovationsSection />;
      case 'funding':
        return <FundingSchemes />;
      case 'organization':
        return <OrganizationSection />;
      case 'jobBoard':
        return <AdminJobDashboard />;
      
      case 'reports':
        return <IdeaDetailsPage />;
      default:
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center text-white/70 max-w-md">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🚧</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Section Under Development</h3>
              <p className="text-white/50">This section is coming soon! We're working hard to bring you this feature.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Static Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      {/* Main Content Area - Properly spaced from sidebar */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Fixed Header */}
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Title Section */}
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white capitalize tracking-tight">
                  {getSectionTitle(activeSection)}
                </h1>
                <div className="hidden sm:block">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70 font-medium">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
              
              {/* Actions Section */}
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 
                             relative group backdrop-blur-sm border border-white/10"
                  >
                    <Bell className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                    {notifications.some(n => n.isNew) && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 
                                     rounded-full animate-pulse border-2 border-white/30 flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold">
                          {notifications.filter(n => n.isNew).length}
                        </span>
                      </span>
                    )}
                  </button>
                  
                  {/* Notifications Panel */}
                  {showNotifications && (
                    <div className="absolute top-full right-0 mt-3 z-50">
                      <NotificationsPanel 
                        notifications={notifications}
                        onRead={markNotificationRead}
                        onClose={() => setShowNotifications(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 min-h-full">
            <div className="max-w-7xl mx-auto">
              {renderActiveSection()}
            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile Menu Button - Only visible on mobile */}
      <div className="lg:hidden">
        <MobileMenuButton onClick={() => setSidebarOpen(true)} />
      </div>
    </div>
  );  
};

export default ManufacturerDashboard;