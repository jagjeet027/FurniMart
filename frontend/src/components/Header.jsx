import React, { useState, useEffect } from 'react';
import {
  LogOut,
  User,
  Menu,
  X,
  Search,
  Heart,
  ShoppingCart,
  Settings,
  MessageCircle,
  Layout,
  Home,
  Clipboard,
  Shield,
  HelpCircle,
  BookOpen,
  FileText,
  Bell,
  Factory,
  Grid
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Updated menu sections with conditional rendering
const menuSections = [
  {
    icon: <User className="h-5 w-5 text-indigo-600" />,
    text: 'Profile',
    link: '/profile'
  },
  {
    icon: <Factory className="h-5 w-5 text-emerald-600" />,
    text: 'Manufacturer Dashboard',
    link: '/manufacturer/dashboard',
    showOnlyForManufacturer: true
  },
  {
    icon: <ShoppingCart className="h-5 w-5 text-amber-600" />,
    text: 'Orders',
    link: '/order-tracking'
  },
  {
    icon: <Clipboard className="h-5 w-5 text-blue-600" />,
    text: 'My Quotes',
    link: '/faqsection'
  },
  {
    icon: <MessageCircle className="h-5 w-5 text-violet-600" />,
    text: 'Chat History',
    link: '/chat-history'
  },
  {
    icon: <HelpCircle className="h-5 w-5 text-teal-600" />,
    text: 'Support',
    link: '/chatsupport'
  },
  {
    icon: <BookOpen className="h-5 w-5 text-orange-600" />,
    text: 'User Guide',
    link: '/user-guide'
  },
  {
    icon: <Settings className="h-5 w-5 text-gray-600" />,
    text: 'Settings',
    link: '/settings'
  },
  {
    icon: <Shield className="h-5 w-5 text-green-600" />,
    text: 'Policies',
    link: '/policies'
  },
  {
    icon: <FileText className="h-5 w-5 text-slate-600" />,
    text: 'Terms & Conditions',
    link: '/terms'
  }
];

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative flex items-center w-full max-w-md">
      <input
        type="text"
        placeholder="Search furniture..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${
          isFocused ? 'shadow-lg' : ''
        }`}
      />
      <Search className={`absolute right-4 ${
        isFocused ? 'text-orange-500' : 'text-gray-500'
      } transition-colors duration-300`} />
    </div>
  );
};

const ProfileMenu = ({ user, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const filteredMenuSections = menuSections.filter(item => {
    if (user?.isManufacturer) {
      return !item.hideForManufacturer;
    }
    return !item.showOnlyForManufacturer;
  });

  // Close the menu when clicking outside
  useEffect(() => {
    const closeMenu = (e) => {
      setIsOpen(false);
    };
    
    if (isOpen) {
      document.addEventListener('click', closeMenu);
    }
    
    return () => {
      document.removeEventListener('click', closeMenu);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 bg-orange-100 rounded-full hover:bg-orange-200 transition-colors duration-200"
      >
        <User className="h-6 w-6 text-orange-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl z-50">
          <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-xl">
            <div className="flex items-center">
              <div className="p-2 bg-orange-200 rounded-full">
                <User className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-800">{user?.name || 'Guest'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'No email'}</p>
                {user?.isManufacturer && (
                  <span className="inline-block px-2 py-1 mt-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full">
                    Manufacturer
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="py-2 max-h-80 overflow-y-auto">
            <div className="grid grid-cols-1 gap-1">
              {filteredMenuSections.map((item, index) => (
                <Link
                  key={index}
                  to={item.link}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.text}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t py-1">
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5 text-red-500" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Notifications dropdown component
const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  
  const notifications = [
    { id: 1, text: "Your order has been shipped!", time: "2 hours ago", isRead: false },
    { id: 2, text: "New furniture collection available!", time: "Yesterday", isRead: false },
    { id: 3, text: "Your quote has been accepted", time: "2 days ago", isRead: true }
  ];
  
  const markAllAsRead = (e) => {
    e.stopPropagation();
    setNotificationCount(0);
  };
  
  // Close the dropdown when clicking outside
  useEffect(() => {
    const closeDropdown = () => {
      setIsOpen(false);
    };
    
    if (isOpen) {
      document.addEventListener('click', closeDropdown);
    }
    
    return () => {
      document.removeEventListener('click', closeDropdown);
    };
  }, [isOpen]);
  
  return (
    <div className="relative">
      <button   
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 relative hover:bg-orange-100 rounded-full transition-colors duration-200"
      >
        <Bell className="h-6 w-6 text-gray-700" />
        {notificationCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl z-50">
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-xl">
            <h3 className="font-medium">Notifications</h3>
            <button 
              onClick={markAllAsRead}
              className="text-xs text-orange-600 hover:text-orange-800"
            >
              Mark all as read
            </button>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div key={notification.id} className={`px-4 py-3 border-b border-gray-100 ${!notification.isRead ? 'bg-orange-50' : ''}`}>
                  <p className="text-sm">{notification.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500">
                No new notifications
              </div>
            )}
          </div>
          
          <Link
            to="/notifications"
            className="block w-full text-center py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-b-xl"
            onClick={() => setIsOpen(false)}
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

// Mobile footer navigation component
const MobileFooter = ({ isAuthenticated }) => {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40 safe-area-inset-bottom">
      <div className="grid grid-cols-5 h-16">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center transition-colors duration-200 ${
            location.pathname === '/' ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
          }`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link 
          to="/categories" 
          className={`flex flex-col items-center justify-center transition-colors duration-200 ${
            location.pathname === '/categories' ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
          }`}
        >
          <Grid className="h-6 w-6" />
          <span className="text-xs mt-1">Categories</span>
        </Link>
        {isAuthenticated ? (
          <>
            <Link 
              to="/order-tracking" 
              className={`flex flex-col items-center justify-center transition-colors duration-200 ${
                location.pathname === '/order-tracking' ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="text-xs mt-1">Orders</span>
            </Link>
            <Link 
              to="/chat" 
              className={`flex flex-col items-center justify-center transition-colors duration-200 ${
                location.pathname === '/chat' ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs mt-1">Chat</span>
            </Link>
            <Link 
              to="/profile" 
              className={`flex flex-col items-center justify-center transition-colors duration-200 ${
                location.pathname === '/profile' ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              <User className="h-6 w-6" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className={`flex flex-col items-center justify-center transition-colors duration-200 ${
                location.pathname === '/login' ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="text-xs mt-1">Login</span>
            </Link>
            <Link 
              to="/signup" 
              className={`flex flex-col items-center justify-center transition-colors duration-200 ${
                location.pathname === '/signup' ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              <User className="h-6 w-6" />
              <span className="text-xs mt-1">Sign Up</span>
            </Link>
            <div className="flex flex-col items-center justify-center text-gray-600">
              <HelpCircle className="h-6 w-6" />
              <span className="text-xs mt-1">Help</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(2); // Example cart count

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Early return for manufacturer routes
  if (location.pathname.startsWith('/manufacturer') && user?.isManufacturer) {
    return null;
  }

  return (
    <>
      <header className="bg-gradient-to-r from-white to-orange-50 shadow-md sticky top-0 z-40 w-full">
        <div className="w-full px-4 py-3">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between">
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text"
            >
              FurniMart
            </Link>
            <div className="flex items-center space-x-3">
              {isAuthenticated && (
                <Link to="/cart" className="relative p-2">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              )}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="hover:bg-orange-100 p-2 rounded-full transition-colors duration-200"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute left-0 right-0 top-full bg-white shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-4 space-y-4">
                <div className="w-full">
                  <SearchBar />
                </div>
                {isAuthenticated && !user?.isManufacturer && (
                  <Link
                    to="/manufacturer/register"
                    className="block w-full text-center px-5 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Become a Manufacturer
                  </Link>
                )}
                {isAuthenticated && user?.isManufacturer && (
                  <Link
                    to="/manufacturer/dashboard"
                    className="block w-full text-center px-5 py-2 text-white bg-emerald-600 rounded-xl shadow-md hover:bg-emerald-700 transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                {!isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block w-full text-center px-5 py-2 text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block w-full text-center px-5 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      SignUp
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Desktop Header */}
          <div className="hidden md:grid md:grid-cols-3 md:items-center md:gap-4">
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text hover:scale-105 transition-transform duration-300"
            >
              FurniMart
            </Link>
            <div className="justify-self-center">
              <SearchBar />
            </div>
            <div className="justify-self-end flex gap-3 items-center">
              {isAuthenticated && (
                <>
                  <Link 
                    to="/wishlist" 
                    className="p-2 hover:bg-orange-100 rounded-full transition-colors duration-200"
                  >
                    <Heart className="h-6 w-6 text-rose-600" />
                  </Link>
                  <Link 
                    to="/cart" 
                    className="p-2 relative hover:bg-orange-100 rounded-full transition-colors duration-200"
                  >
                    <ShoppingCart className="h-6 w-6 text-orange-600" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                  <NotificationsDropdown />
                </>
              )}
              
              {isAuthenticated && user?.isManufacturer ? (
                <Link
                  to="/manufacturer/dashboard"
                  className="px-4 py-2 text-white bg-emerald-600 rounded-xl shadow-md hover:bg-emerald-700 hover:scale-105 transition-all duration-300"
                >
                  Dashboard
                </Link>
              ) : isAuthenticated && !user?.isManufacturer && (
                <Link
                  to="/manufacturer/register"
                  className="px-4 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Become a Manufacturer
                </Link>
              )}
              {!isAuthenticated ? (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    SignUp
                  </Link>
                </div>
              ) : (
                <ProfileMenu user={user} handleLogout={handleLogout} />
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Footer Navigation */}
      <MobileFooter isAuthenticated={isAuthenticated} />
    </>
  );
};

export default Header;