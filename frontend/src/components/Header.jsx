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
  Edit,
  Search,
  Loader2,
  Lightbulb
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import api from '../axios/axiosInstance';

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

// Search Component
const SearchComponent = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        const categoriesData = Array.isArray(response.data) ? response.data : (response.data.categories || []);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      
      // Check if the search query matches any category name
      const matchedCategory = categories.find(
        cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (matchedCategory) {
        navigate(`/categories/${matchedCategory._id || matchedCategory.id}/products`);
        setSearchQuery('');
        setIsExpanded(false);
        return;
      }
      
      // Search for products
      const response = await api.get(`/products?search=${encodeURIComponent(searchQuery)}`);
      const products = Array.isArray(response.data) ? response.data : (response.data.products || []);
      
      if (products.length > 0) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}&no-results=true`);
      }
      
      setSearchQuery('');
      setIsExpanded(false);
      
    } catch (err) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&no-results=true`);
      setSearchQuery('');
      setIsExpanded(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Mobile search overlay
  if (isExpanded) {
    return (
      <div className="fixed inset-0 bg-white z-50 md:relative md:bg-transparent md:inset-auto">
        <div className="p-4 md:p-0">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <button
              onClick={() => setIsExpanded(false)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search furniture, designs, collections" 
                  className="w-full p-3 pr-12 rounded-full bg-gray-100 md:bg-white md:shadow-md placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 border border-gray-200"
                  autoFocus
                />
                <button 
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-full text-white disabled:opacity-50"
                >
                  {isSearching ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Search size={20} />
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* Popular searches on mobile */}
          <div className="md:hidden">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-orange-50">
                Modern Sofa
              </button>
              <button className="px-3 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-orange-50">
                Dining Set
              </button>
              <button className="px-3 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-orange-50">
                King Bed
              </button>
              <button className="px-3 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-orange-50">
                Office Chair
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-md md:max-w-lg mx-4">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Search furniture..." 
            className="w-full p-2 md:p-3 pr-12 rounded-full bg-gray-100 md:bg-white md:shadow-md placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 border border-gray-200"
          />
          <button 
            type="submit"
            disabled={isSearching || !searchQuery.trim()} 
            className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-orange-600 p-1.5 md:p-2 rounded-full text-white disabled:opacity-50"
          >
            {isSearching ? (
              <Loader2 size={16} className="md:w-5 md:h-5 animate-spin" />
            ) : (
              <Search size={16} className="md:w-5 md:h-5" />
            )}
          </button>
        </div>
      </form>
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
const MobileFooter = ({ isAuthenticated, onProfileClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="grid grid-cols-3 h-16">
        <Link to="/" className="flex flex-col items-center justify-center text-gray-600 hover:text-orange-600">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link to="/categories" className="flex flex-col items-center justify-center text-gray-600 hover:text-orange-600">
          <Grid className="h-6 w-6" />
          <span className="text-xs mt-1">Categories</span>
        </Link>
        {isAuthenticated ? (
          <button onClick={onProfileClick} className="flex flex-col items-center justify-center text-gray-600 hover:text-orange-600">
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        ) : (
          <Link to="/login" className="flex flex-col items-center justify-center text-gray-600 hover:text-orange-600">
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Login</span>
          </Link>
        )}
      </div>
    </div>
  );
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
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

    window.addEventListener('storage', getWishlistCount);
    
    const handleWishlistUpdate = (e) => {
      getWishlistCount();
      if (e.detail?.action === 'add') {
        setWishlistAnimation(true);
        setTimeout(() => setWishlistAnimation(false), 1000);
      }
    };
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, arguments);
      
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
              className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text"
            >
              FurniMart
            </Link>
            <SearchComponent isAuthenticated={isAuthenticated} />
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text"
            > 
              FurniMart
            </Link>
            
            <SearchComponent isAuthenticated={isAuthenticated} />
            
            <div className="flex items-center space-x-4"> 
              {/* Submit New Idea Button */}
              <Link
                to="/new-idea"
                className="px-4 py-2 text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <Lightbulb className="h-4 w-4" />
                <span className="text-sm">Submit New Idea</span>
              </Link>

              {isAuthenticated && user?.isManufacturer && (
                <Link
                  to="/manufacturer/dashboard"
                  className="px-4 py-2 text-white bg-emerald-600 rounded-xl shadow-md hover:bg-emerald-700 hover:scale-105 transition-all duration-300"
                >
                  Dashboard
                </Link>
              )}
              
              {isAuthenticated && !user?.isManufacturer && (
                <Link
                  to="/manufacturer/register"
                  className="px-4 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Become a Manufacturer
                </Link>
              )}
              
              {isAuthenticated && (
                <>
                  <Link to="/wishlist" className="relative p-2 hover:bg-orange-100 rounded-full transition-colors duration-200">
                    <Heart className={`h-6 w-6 text-rose-600 ${wishlistAnimation ? 'animate-pulse scale-110' : ''}`} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/cart" className="relative p-2 hover:bg-orange-100 rounded-full">
                    <ShoppingCart className="h-6 w-6 text-orange-600" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
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
                    Sign Up
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
        onProfileClick={() => setMobileProfileOpen(true)}
      />
      
    </>
  );
};

export default Header;