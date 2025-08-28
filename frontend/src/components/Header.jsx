import React, { useState, useEffect } from 'react';
import {
  LogOut,
  User,
  Menu,
  X,
  Heart,
  ShoppingCart,
  Settings,
  MessageCircle,
  Home,
  Clipboard,
  Shield,
  HelpCircle,
  BookOpen,
  FileText,
  Bell,
  Factory,
  Grid,
  ChevronRight,
  Edit
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
    link: '/orders'
  },
  {
    icon: <Clipboard className="h-5 w-5 text-blue-600" />,
    text: 'My Quotes',
    link: '/quotes'
  },
  {
    icon: <MessageCircle className="h-5 w-5 text-violet-600" />,
    text: 'Chat History',
    link: '/chat-history'
  },
  {
    icon: <Heart className="h-5 w-5 text-rose-600" />,
    text: 'My Wishlist',
    link: '/wishlist'
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
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl z-50 border">
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

          <div className="py-1 max-h-80 overflow-y-auto">
            {filteredMenuSections.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.text}</span>
              </Link>
            ))}
          </div>

          <div className="border-t py-1">
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
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
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl z-50 border">
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

// Wishlist button component with tooltip
const WishlistButton = ({ wishlistCount, isAnimating }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative" 
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Link 
        to="/wishlist" 
        className="p-2 relative hover:bg-orange-100 rounded-full transition-colors duration-200 flex items-center justify-center"
        aria-label="My Wishlist"
      >
        <Heart className={`h-6 w-6 text-rose-600 ${isAnimating ? 'animate-pulse scale-110' : ''}`} />
        {wishlistCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {wishlistCount}
          </span>
        )}
      </Link>
      
      {showTooltip && (
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
          My Wishlist
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
        </div>
      )}
    </div>
  );
};

// Mobile Profile Page Component
const MobileProfilePage = ({ isOpen, onClose, user, handleLogout }) => {
  const navigate = useNavigate();
  const filteredMenuSections = menuSections.filter(item => {
    if (user?.isManufacturer) {
      return !item.hideForManufacturer;
    }
    return !item.showOnlyForManufacturer;
  });

  const handleNavigation = (link) => {
    navigate(link);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 md:hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Profile</h1>
          <button onClick={onClose} className="p-2 hover:bg-orange-700 rounded-full">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* User Info */}
        <div className="mt-4 flex items-center">
          <div className="p-3 bg-white bg-opacity-20 rounded-full">
            <User className="h-8 w-8" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-semibold">{user?.name || 'Guest'}</h2>
            <p className="text-orange-100 text-sm">{user?.email || 'No email'}</p>
            {user?.isManufacturer && (
              <span className="inline-block px-3 py-1 mt-2 text-xs font-medium text-emerald-700 bg-white rounded-full">
                Manufacturer
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleNavigation('/profile')}
              className="flex items-center justify-center p-4 bg-orange-50 rounded-lg border border-orange-200"
            >
              <Edit className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Edit Profile</span>
            </button>
            
            {user?.isManufacturer && (
              <button 
                onClick={() => handleNavigation('/manufacturer/dashboard')}
                className="flex items-center justify-center p-4 bg-emerald-50 rounded-lg border border-emerald-200"
              >
                <Factory className="h-5 w-5 text-emerald-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Dashboard</span>
              </button>
            )}
            
            {!user?.isManufacturer && (
              <button 
                onClick={() => handleNavigation('/manufacturer/register')}
                className="flex items-center justify-center p-4 bg-purple-50 rounded-lg border border-purple-200"
              >
                <Factory className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Become Seller</span>
              </button>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Menu</h3>
          <div className="space-y-1">
            {filteredMenuSections.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(item.link)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center">
                  {item.icon}
                  <span className="ml-3 text-gray-700 font-medium">{item.text}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-4 border-t">
          <button
            onClick={() => {
              handleLogout();
              onClose();
            }}
            className="w-full flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5 mr-2" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Mobile footer navigation component
const MobileFooter = ({ isAuthenticated, wishlistCount, isWishlistAnimating, onProfileClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="grid grid-cols-5 h-16">
        <Link to="/" className="flex flex-col items-center justify-center text-gray-600 hover:text-orange-600">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link to="/categories" className="flex flex-col items-center justify-center text-gray-600 hover:text-orange-600">
          <Grid className="h-6 w-6" />
          <span className="text-xs mt-1">Categories</span>
        </Link>
        {isAuthenticated ? (
          <>
            <Link to="/wishlist" className="flex flex-col items-center justify-center text-gray-600 hover:text-orange-600 relative">
              <Heart className={`h-6 w-6 text-rose-600 ${isWishlistAnimating ? 'animate-pulse scale-110' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-1/4 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
              <span className="text-xs mt-1">Wishlist</span>
            </Link>
            <Link to="/chat-history" className="flex flex-col items-center justify-center text-gray-600 hover:text-orange-600">
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs mt-1">Chat</span>
            </Link>
            <button onClick={onProfileClick} className="flex flex-col items-center justify-center text-gray-600 hover:text-orange-600">
              <User className="h-6 w-6" />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="flex flex-col items-center justify-center text-gray-600 hover:text-orange-600">
              <ShoppingCart className="h-6 w-6" />
              <span className="text-xs mt-1">Login</span>
            </Link>
            <Link to="/signup" className="flex flex-col items-center justify-center text-gray-600 hover:text-orange-600">
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

// Create a context for wishlist management
const WishlistContext = React.createContext();

// Export the provider for use in your app
export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistAnimation, setWishlistAnimation] = useState(false);

  useEffect(() => {
    // Load wishlist from localStorage on mount
    try {
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        setWishlistItems(JSON.parse(storedWishlist));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  }, []);

  const addToWishlist = (product) => {
    setWishlistItems(prev => {
      const updated = [...prev, product];
      localStorage.setItem('wishlist', JSON.stringify(updated));
      return updated;
    });
    
    // Trigger animation
    setWishlistAnimation(true);
    setTimeout(() => setWishlistAnimation(false), 1000);
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prev => {
      const updated = prev.filter(item => item.id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleWishlist = (product) => {
    const isInWishlist = wishlistItems.some(item => item.id === product.id);
    
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider 
      value={{ 
        wishlistItems, 
        wishlistCount: wishlistItems.length,
        wishlistAnimation,
        addToWishlist, 
        removeFromWishlist,
        toggleWishlist,
        isInWishlist: (productId) => wishlistItems.some(item => item.id === productId)
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook to use the wishlist context
export const useWishlist = () => {
  const context = React.useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(2); // Example cart count
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistAnimation, setWishlistAnimation] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Enhanced useEffect to load wishlist items and listen for changes
  useEffect(() => {
    const getWishlistCount = () => {
      try {
        const storedWishlist = localStorage.getItem('wishlist');
        if (storedWishlist) {
          const wishlistItems = JSON.parse(storedWishlist);
          setWishlistCount(wishlistItems.length);
        } else {
          setWishlistCount(0);
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
        setWishlistCount(0);
      }
    };

    getWishlistCount();

    // FIX: Use both storage events and a global custom event for wishlist updates
    window.addEventListener('storage', getWishlistCount);
    
    // Create a more robust custom event listener for wishlist updates
    const handleWishlistUpdate = (e) => {
      getWishlistCount();
      // If item was added, trigger animation
      if (e.detail?.action === 'add') {
        setWishlistAnimation(true);
        setTimeout(() => setWishlistAnimation(false), 1000);
      }
    };
    
    // Listen for our custom event
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    // Create a MutationObserver to watch for changes in localStorage
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      // Call original implementation
      originalSetItem.apply(this, arguments);
      
      // If wishlist is being updated, dispatch our custom event
      if (key === 'wishlist') {
        const event = new CustomEvent('wishlistUpdated', { 
          detail: { action: 'update', value: JSON.parse(value) } 
        });
        window.dispatchEvent(event);
      }
    };

    return () => {
      window.removeEventListener('storage', getWishlistCount);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      // Restore original localStorage function
      localStorage.setItem = originalSetItem;
    };
  }, []);

  // Early return for manufacturer routes
  if (location.pathname.startsWith('/manufacturer') && user?.isManufacturer) {
    return null;
  }

  return (
    <>
      <header className="bg-gradient-to-r from-white to-orange-50 shadow-sm sticky top-0 z-40 w-full border-b border-orange-100">
        <div className="w-full px-4 py-3">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between">
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text"
            >
              FurniMart
            </Link>
            <div className="flex items-center space-x-2">
              {isAuthenticated && (
                <>
                  <Link to="/wishlist" className="relative p-2 hover:bg-orange-100 rounded-full">
                    <Heart 
                      className={`h-6 w-6 text-rose-600 ${wishlistAnimation ? 'animate-pulse scale-110' : ''}`} 
                    />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/cart" className="relative p-2 hover:bg-orange-100 rounded-full">
                    <ShoppingCart className="h-6 w-6 text-orange-600" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="hover:bg-orange-100 p-2 rounded-full transition-colors duration-200"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute left-0 right-0 top-full bg-white shadow-lg z-50 border-t">
              <div className="p-4 space-y-3">
                {isAuthenticated && !user?.isManufacturer && (
                  <Link
                    to="/manufacturer/register"
                    className="block w-full text-center px-4 py-3 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Become a Manufacturer
                  </Link>
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
                <>
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
                </>
              ) : (
                <ProfileMenu user={user} handleLogout={handleLogout} />
              )}
            </div>
          </div>
          )}

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text"
            > 

              FurniMart
            </Link>
            <div className="flex items-center space-x-6"> 
              {isAuthenticated && (
                <>
                  <WishlistButton 
                    wishlistCount={wishlistCount}
                    isAnimating={wishlistAnimation}
                  />
                  <Link to="/cart" className="relative p-2 hover:bg-orange-100 rounded-full">
                    <ShoppingCart className="h-6 w-6 text-orange-600" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                  <NotificationsDropdown />
                  <ProfileMenu user={user} handleLogout={handleLogout} />
                </>
              )}
              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"  
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    SignUp
                  </Link> 
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Profile Page */}
      <MobileProfilePage 
        isOpen={mobileProfileOpen}
        onClose={() => setMobileProfileOpen(false)}
        user={user}
        handleLogout={handleLogout}
      />
      
      {/* Mobile Footer Navigation */}
      <MobileFooter 
        isAuthenticated={isAuthenticated} 
        wishlistCount={wishlistCount} 
        isWishlistAnimating={wishlistAnimation}
        onProfileClick={() => setMobileProfileOpen(true)}
      />
      
    </>
  );
};

export default Header;