import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sofa, 
  Lamp, 
  Bed, 
  Briefcase, 
  Trees, 
  Menu,
  X,
  Search,
  ShieldCheck,
  Truck,
  Gift,
  Tag,
  ArrowRight,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import api from './axios/axiosInstance';
import { useNavigate } from 'react-router-dom';

// Map category names to icons
const categoryIcons = {
  'Sofas': Sofa,
  'Dining Tables': Lamp,
  'Beds': Bed,
  'Office Desks': Briefcase,
  'Patio Sets': Trees,
  'Armchairs': Sofa,
  'Wardrobes': Bed,
  'Office Chairs': Briefcase,
  'default': Sofa
};

const slides = [
   { 
    id: 1, 
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&h=600', 
    title: 'Modern Living Room Sets', 
    subtitle: 'Comfort meets style',
    description: 'Transform your living space with our curated collection of modern furniture.',
    buttonText: 'Explore Collection'
  },
  { 
    id: 2, 
    image: 'https://images.unsplash.com/photo-1549497538-303791108f95?auto=format&fit=crop&w=1200&h=600', 
    title: 'Elegant Dining Collections', 
    subtitle: 'Dine in unparalleled luxury',
    description: 'Elevate your dining experience with our sophisticated furniture sets.',
    buttonText: 'Shop Dining'
  },
  { 
    id: 3, 
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&h=600', 
    title: 'Home Office Essentials', 
    subtitle: 'Productivity meets comfort',
    description: 'Create the perfect workspace with our ergonomic and stylish office furniture.',
    buttonText: 'Design Workspace'
  },
  { 
    id: 4, 
    image: './src/assets/furniture1.jpg', 
    title: 'Modern Living Room Sets', 
    subtitle: 'Comfort meets style',
    description: 'Transform your living space with our curated collection of modern furniture.',
    buttonText: 'Explore Collection'
  },
  { 
    id: 5, 
    image: './src/assets/furni2.jpg', 
    title: 'Elegant Dining Collections', 
    subtitle: 'Dine in unparalleled luxury',
    description: 'Elevate your dining experience with our sophisticated furniture sets.',
    buttonText: 'Shop Dining'
  },
  { 
    id: 6, 
    image: './src/assets/furni3.jpg', 
    title: 'Home Office Essentials', 
    subtitle: 'Productivity meets comfort',
    description: 'Create the perfect workspace with our ergonomic and stylish office furniture.',
    buttonText: 'Design Workspace'
  }
];

// No Results Found Component
const NoResultsFound = ({ searchQuery, suggestedCategories, handleCategoryClick, resetSearch }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg text-center"
    >
      <div className="mb-4 bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
        <AlertTriangle size={32} className="text-orange-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        No results found for "{searchQuery}"
      </h3>
      
      <p className="text-gray-600 mb-6">
        We couldn't find any products matching your search. Please try a different search term or browse our categories below.
      </p>
      
      <div className="mb-2 text-left">
        <h4 className="text-sm font-medium text-gray-500 mb-3">SUGGESTED CATEGORIES</h4>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {suggestedCategories.map((category) => (
          <div 
            key={category.id} 
            onClick={() => handleCategoryClick(category.id)}
            className="bg-orange-50 rounded-lg p-3 text-center hover:bg-orange-100 transition cursor-pointer"
          >
            <category.icon size={24} className="mx-auto mb-2 text-orange-500" />
            <div>
              <h4 className="text-sm font-medium text-gray-800">{category.name}</h4>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 mt-8 p-4 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Popular Searches</h4>
        <div className="flex flex-wrap gap-2 justify-center">
          <button className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-orange-50">
            Modern Sofa
          </button>
          <button className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-orange-50">
            Dining Set
          </button>
          <button className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-orange-50">
            King Bed
          </button>
          <button className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-orange-50">
            Office Chair
          </button>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          onClick={resetSearch}
          className="text-orange-500 hover:text-orange-600 text-sm font-medium"
        >
          Return to Homepage
        </button>
      </div>
    </motion.div>
  );
};

const FurnitureMarketplace = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const [suggestedCategories, setSuggestedCategories] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get('/categories');
        
        const categoriesData = Array.isArray(response.data) ? response.data : 
                             (response.data.categories || []);
        
        const transformedCategories = categoriesData.map(cat => ({
          name: cat.name,
          icon: categoryIcons[cat.name] || categoryIcons.default,
          group: cat.parentCategory ? cat.parentCategory.name : 'Other',
          description: cat.description || '',
          id: cat._id || cat.id
        }));
        
        setCategories(transformedCategories);
        setError(null);
      } catch (err) {
        console.error('Error details:', err.response || err);
        setError(
          err.response?.data?.message || 
          'Failed to load categories. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };
  
    fetchCategories();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      setShowNoResults(false); // Reset no results state
      
      // First check if the search query matches any category name
      const matchedCategory = categories.find(
        cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (matchedCategory) {
        // If we found a matching category, navigate to that category
        navigate(`/category/${matchedCategory.id}`);
        setSearchQuery('');
        return;
      }
      
      // Otherwise search for products
      const response = await api.get(`/products?search=${encodeURIComponent(searchQuery)}`);
      
      const products = Array.isArray(response.data) ? response.data : 
                      (response.data.products || []);
      
      setSearchResults(products);
      
      // If products found, navigate to search results page
      if (products.length > 0) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      } else {
        // Handle no results - show suggested categories
        // Get random 4 categories to suggest
        const suggestedCats = [...categories]
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
        
        setSuggestedCategories(suggestedCats);
        setShowNoResults(true); // Show the NoResultsFound component instead of navigating
      }
      
    } catch (err) {
      console.error('Search error:', err);
      setShowNoResults(true); // Also show NoResultsFound component on error
      // Show random categories as suggestions in case of error too
      const suggestedCats = [...categories]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      setSuggestedCategories(suggestedCats);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    // Reset search state when navigating to a category
    setShowNoResults(false);
    setSearchQuery('');
  };

  const resetSearch = () => {
    setShowNoResults(false);
    setSearchQuery('');
  };

  const renderCategories = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-4 text-red-600">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-orange-500 hover:text-orange-600"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!categories || categories.length === 0) {
      return (
        <div className="text-center p-6 bg-orange-50 rounded-lg">
          <Sofa size={32} className="mx-auto mb-3 text-orange-300" />
          <p className="text-gray-600 mb-2">No categories available yet</p>
          <p className="text-sm text-gray-500">Check back soon for our product categories!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <div 
            key={category.id} 
            onClick={() => handleCategoryClick(category.id)}
            className="bg-white rounded-lg p-3 text-center hover:bg-orange-50 transition cursor-pointer shadow-sm"
          >
            <category.icon size={24} className="mx-auto mb-2 text-orange-500" />
            <div>
              <h4 className="text-sm font-medium text-gray-800">{category.name}</h4>
              <p className="text-xs text-gray-500">{category.group}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-gray-50">
      <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Sofa size={24} className="text-orange-500" />
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text">FurniMart</h1>
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hover:bg-orange-100 p-2 rounded-full transition"
            >
              {mobileMenuOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="hidden md:block md:col-span-3 bg-white/80 rounded-xl p-4 shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
              Product Categories
            </h3>
            {renderCategories()}
          </div>

          <div className="md:col-span-9">
            <div className="relative mb-6">
              <form onSubmit={handleSearch}>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search furniture, designs, collections" 
                  className="w-full p-3 rounded-full bg-white shadow-md placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 border border-gray-200"
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
              </form>
            </div>
            
            {showNoResults ? (
              <NoResultsFound 
                searchQuery={searchQuery}
                suggestedCategories={suggestedCategories}
                handleCategoryClick={handleCategoryClick}
                resetSearch={resetSearch}
              />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={slides[currentSlide].id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="relative rounded-3xl overflow-hidden h-[300px] md:h-[450px] shadow-xl"
                >
                  <img 
                    src={slides[currentSlide].image} 
                    alt={slides[currentSlide].title} 
                    className="absolute inset-0 w-full h-full object-cover filter brightness-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-transparent"></div>
                  
                  <div className="relative z-10 p-6 md:p-10 text-white h-full flex flex-col justify-end">
                    <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3">{slides[currentSlide].title}</h2>
                    <p className="text-lg md:text-xl mb-2 md:mb-3">{slides[currentSlide].subtitle}</p>
                    <p className="hidden md:block text-sm md:text-base mb-4 max-w-xl">{slides[currentSlide].description}</p>
                    
                    <div className="flex space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-semibold flex items-center shadow-lg"
                      >
                        {slides[currentSlide].buttonText}
                        <ArrowRight className="ml-2" size={18} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
          <div className="bg-white p-4 rounded-xl hover:bg-orange-50 transition flex flex-col items-center shadow-md">
            <ShieldCheck size={28} className="mb-2 text-indigo-600" />
            <h4 className="text-sm md:text-base text-gray-800">Guaranteed Quality</h4>
          </div>
          <div className="bg-white p-4 rounded-xl hover:bg-orange-50 transition flex flex-col items-center shadow-md">
            <Truck size={28} className="mb-2 text-amber-600" />
            <h4 className="text-sm md:text-base text-gray-800">Free Shipping</h4>
          </div>
          <div className="bg-white p-4 rounded-xl hover:bg-orange-50 transition flex flex-col items-center shadow-md">
            <Gift size={28} className="mb-2 text-rose-600" />
            <h4 className="text-sm md:text-base text-gray-800">Special Offers</h4>
          </div>
          <div className="bg-white p-4 rounded-xl hover:bg-orange-50 transition flex flex-col items-center shadow-md">
            <Tag size={28} className="mb-2 text-emerald-600" />
            <h4 className="text-sm md:text-base text-gray-800">Best Prices</h4>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-white z-50 overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Product Categories</h2>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:bg-orange-100 p-2 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            {renderCategories()}
            <div className="mt-6">
              <button 
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl shadow-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Close Menu
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FurnitureMarketplace;