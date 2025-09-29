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
  ShieldCheck,
  Truck,
  Gift,
  Tag,
  ArrowRight,
  Loader2,
  Star,
  Users,
  Award,
  TrendingUp,
  Eye,
  ChevronRight,
  Heart,
  ShoppingCart,
  Clock,
  ThumbsUp,
  MessageCircle,
  MapPin,
  Grid,
  Package,
  ChevronLeft,
  Search
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
    title: 'Luxury Bedroom Collection', 
    subtitle: 'Rest in elegance',
    description: 'Discover our premium bedroom furniture for the ultimate comfort experience.',
    buttonText: 'Shop Bedroom'
  },
  { 
    id: 5, 
    image: './src/assets/furni2.jpg', 
    title: 'Outdoor Living Space', 
    subtitle: 'Embrace nature in style',
    description: 'Create your perfect outdoor oasis with our weather-resistant furniture.',
    buttonText: 'Explore Outdoor'
  },
  { 
    id: 6, 
    image: './src/assets/furni3.jpg', 
    title: 'Smart Storage Solutions', 
    subtitle: 'Organize beautifully',
    description: 'Maximize your space with our intelligent storage and organization furniture.',
    buttonText: 'Find Storage'
  }
];

// New Sliding Categories Component
const SlidingCategoriesSection = ({ categories, handleCategoryClick, loading }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  
  const itemsPerSlide = 6; // Show 6 categories per slide

  useEffect(() => {
    if (!searchTerm) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
    setCurrentSlide(0); // Reset to first slide when filtering
  }, [categories, searchTerm]);

  const totalSlides = Math.ceil(filteredCategories.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentCategories = () => {
    const start = currentSlide * itemsPerSlide;
    const end = start + itemsPerSlide;
    return filteredCategories.slice(start, end);
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Explore Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="h-32 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredCategories.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Explore Categories</h2>
        <div className="text-center p-8 bg-gray-50 rounded-xl">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchTerm ? 'No categories found matching your search' : 'No categories available right now'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">Explore Categories</h2>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Categories Slider */}
      <div className="relative">
        {/* Navigation Buttons */}
        {totalSlides > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:bg-orange-50"
              style={{ left: '-20px' }}
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:bg-orange-50"
              style={{ right: '-20px' }}
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </>
        )}

        {/* Categories Grid */}
        <div className="overflow-hidden px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              {getCurrentCategories().map((category) => {
                const IconComponent = categoryIcons[category.name] || categoryIcons.default;
                
                return (
                  <motion.div
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                  >
                    {/* Category Image/Icon */}
                    <div className="relative h-32 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                      {category.sampleImages && category.sampleImages.length > 0 ? (
                        <div className="relative w-full h-full">
                          <img
                            src={category.sampleImages[0]}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          {/* Fallback icon (hidden by default) */}
                          <div className="absolute inset-0 hidden items-center justify-center">
                            <IconComponent className="h-12 w-12 text-orange-600" />
                          </div>
                        </div>
                      ) : (
                        <IconComponent className="h-12 w-12 text-orange-600 group-hover:scale-110 transition-transform duration-300" />
                      )}
                      
                      {/* Product Count Badge */}
                      <div className="absolute top-2 right-2 bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {category.productCount || 0}
                      </div>
                    </div>

                    {/* Category Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-1 text-center group-hover:text-orange-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-500 text-center">
                        {category.productCount || 0} {category.productCount === 1 ? 'item' : 'items'}
                      </p>
                      
                      {/* Latest Products Preview */}
                      {category.latestProducts && category.latestProducts.length > 0 && (
                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="text-xs text-gray-500 mb-1">Latest:</div>
                          <div className="space-y-1">
                            {category.latestProducts.slice(0, 2).map((product, idx) => (
                              <div key={idx} className="text-xs text-gray-600 truncate">
                                • {product.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* View More Indicator */}
                      <div className="mt-2 flex items-center justify-center text-xs text-orange-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Explore
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide Indicators */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {[...Array(totalSlides)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-orange-600 scale-110' 
                    : 'bg-gray-300 hover:bg-orange-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* View All Categories Button */}
        <div className="text-center mt-6">
          <button 
            onClick={() => navigate('/categories')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center mx-auto"
          >
            <Grid className="h-5 w-5 mr-2" />
            View All Categories
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Statistics Component - Backend Data
const StatisticsSection = () => {
  const [stats, setStats] = useState({
    customers: '50K+',
    products: '10K+',
    brands: '500+',
    satisfaction: '98%'
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await api.get('/statistics/dashboard');
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching statistics:', err);
      }
    };

    fetchStatistics();
  }, []);

  const statsData = [
    { icon: Users, value: stats.customers, label: "Happy Customers" },
    { icon: Sofa, value: stats.products, label: "Products Available" },
    { icon: Award, value: stats.brands, label: "Trusted Brands" },
    { icon: TrendingUp, value: stats.satisfaction, label: "Satisfaction Rate" }
  ];

  return (
    <div className="mb-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
      <h2 className="text-2xl font-bold text-center mb-6">Why Choose FurniMart?</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <stat.icon className="h-8 w-8" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-orange-100 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Recent Reviews Component
const RecentReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        const response = await api.get('/reviews/recent?limit=3');
        const reviewsData = Array.isArray(response.data) ? response.data : 
                          (response.data.reviews || []);
        setReviews(reviewsData);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentReviews();
  }, []);

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">What Our Customers Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <motion.div 
            key={review._id || index} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <p className="text-gray-600 mb-4 italic">"{review.comment || review.text}"</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold">
                    {(review.user?.name || review.userName || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-gray-800">{review.user?.name || review.userName}</p>
                  <p className="text-sm text-gray-500">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
              </div>
              <ThumbsUp className="h-4 w-4 text-gray-400" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Blog/News Section
const BlogSection = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await api.get('/blog/recent?limit=3');
        const postsData = Array.isArray(response.data) ? response.data : 
                         (response.data.posts || []);
        setBlogPosts(postsData);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  if (loading || blogPosts.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Latest from Our Blog</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogPosts.map((post, index) => (
          <motion.div 
            key={post._id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden group cursor-pointer"
          >
            <div className="relative">
              <img 
                src={post.image || `https://images.unsplash.com/photo-${1586023492125 + index}?auto=format&fit=crop&w=400&h=200`}
                alt={post.title}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
                {post.category || 'Design Tips'}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{post.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {post.readTime || '5 min read'}
                </div>
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {post.comments || 0}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const FurnitureMarketplace = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        // Fetch product details for each category
        const categoriesWithDetails = await Promise.all(
          categoriesData.map(async (category) => {
            try {
              let products = [];
              const productEndpoints = [
                `/products/category/${category._id}`,
                `/products?category=${category._id}`,
                `/category/${category._id}/products`,
                `/products`
              ];

              for (const prodEndpoint of productEndpoints) {
                try {
                  const productsResponse = await api.get(prodEndpoint);
                  let fetchedProducts = productsResponse.data.products || productsResponse.data || [];
                  
                  if (prodEndpoint === '/products' && Array.isArray(fetchedProducts)) {
                    fetchedProducts = fetchedProducts.filter(product => 
                      product.category === category._id || 
                      product.categoryId === category._id ||
                      product.category?._id === category._id
                    );
                  }
                  
                  products = Array.isArray(fetchedProducts) ? fetchedProducts : [];
                  break;
                } catch (prodErr) {
                  continue;
                }
              }
              
              return {
                name: category.name,
                icon: categoryIcons[category.name] || categoryIcons.default,
                group: category.parentCategory ? category.parentCategory.name : 'Other',
                description: category.description || '',
                id: category._id || category.id,
                productCount: products.length,
                sampleImages: products.slice(0, 4).map(p => p.images?.[0] || p.image).filter(Boolean),
                latestProducts: products.slice(0, 3)
              };
            } catch (err) {
              return {
                name: category.name,
                icon: categoryIcons[category.name] || categoryIcons.default,
                group: category.parentCategory ? category.parentCategory.name : 'Other',
                description: category.description || '',
                id: category._id || category.id,
                productCount: 0,
                sampleImages: [],
                latestProducts: []
              };
            }
          })
        );
        
        setCategories(categoriesWithDetails);
        setError(null);
      } catch (err) {
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

  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}/products`);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const renderStaticSidebar = () => {
    if (loading) {
      return (
        <div className="h-96 overflow-y-auto">
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-3 animate-pulse">
                <div className="w-6 h-6 bg-gray-200 rounded mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-4 text-red-600">
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-xs text-orange-500 hover:text-orange-600"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!categories || categories.length === 0) {
      return (
        <div className="text-center p-6 bg-orange-50 rounded-lg">
          <Sofa size={24} className="mx-auto mb-3 text-orange-300" />
          <p className="text-sm text-gray-600 mb-1">No categories available</p>
          <p className="text-xs text-gray-500">Check back soon!</p>
        </div>
      );
    }

    return (
      <div className="h-96 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-2">
          {categories.slice(0, 8).map((category) => (
            <motion.div 
              key={category.id} 
              onClick={() => handleCategoryClick(category.id)}
              whileHover={{ x: 5 }}
              className="bg-white rounded-lg p-3 text-center hover:bg-orange-50 hover:shadow-md transition-all cursor-pointer border border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <category.icon size={20} className="text-orange-500" />
                </div>
                <div className="flex-grow text-left">
                  <h4 className="text-sm font-medium text-gray-800">{category.name}</h4>
                  <p className="text-xs text-gray-500">{category.productCount || 0} products</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-gray-50 min-h-screen">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fb923c;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f97316;
        }
      `}</style>
      
      <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Sofa size={24} className="text-orange-500" />
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text">
              FurniMart
            </h1>
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
          {/* Static Sidebar */}
          <div className="hidden md:block md:col-span-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg sticky top-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <Grid className="h-5 w-5 mr-2 text-orange-500" />
                Product Categories
              </h3>
              {renderStaticSidebar()}
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-9">
            {/* Hero Slider */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={slides[currentSlide].id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
                className="relative rounded-3xl overflow-hidden h-[300px] md:h-[450px] shadow-2xl mb-8"
              >
                <img 
                  src={slides[currentSlide].image} 
                  alt={slides[currentSlide].title} 
                  className="absolute inset-0 w-full h-full object-cover filter brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-transparent"></div>
                
                <div className="relative z-10 p-6 md:p-10 text-white h-full flex flex-col justify-end">
                  <motion.h2 
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl md:text-4xl font-bold mb-2 md:mb-3"
                  >
                    {slides[currentSlide].title}
                  </motion.h2>
                  <motion.p 
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg md:text-xl mb-2 md:mb-3"
                  >
                    {slides[currentSlide].subtitle}
                  </motion.p>
                  <motion.p 
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="hidden md:block text-sm md:text-base mb-4 max-w-xl"
                  >
                    {slides[currentSlide].description}
                  </motion.p>
                  
                  <motion.div 
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex space-x-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-semibold flex items-center shadow-lg"
                    >
                      {slides[currentSlide].buttonText}
                      <ArrowRight className="ml-2" size={18} />
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* New Sliding Categories Section */}
            <SlidingCategoriesSection 
              categories={categories} 
              handleCategoryClick={handleCategoryClick} 
              loading={loading} 
            />

            {/* Statistics Section */}
            <StatisticsSection />

            {/* Recent Reviews */}
            <RecentReviews />

            {/* Blog Section */}
            <BlogSection />

            {/* Special Offers Banner */}
            <div className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Special Summer Sale!</h2>
              <p className="text-purple-100 mb-4">Up to 50% off on selected furniture items</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-colors"
              >
                Shop Now
              </motion.button>
            </div>

            {/* Newsletter Signup */}
            <div className="mb-8 bg-gray-100 rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Stay Updated</h3>
              <p className="text-gray-600 mb-4">Get the latest furniture trends and exclusive offers</p>
              <div className="flex flex-col md:flex-row gap-3 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button className="px-6 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl hover:bg-orange-50 transition-all flex flex-col items-center shadow-lg"
          >
            <div className="p-3 bg-indigo-100 rounded-full mb-4">
              <ShieldCheck size={28} className="text-indigo-600" />
            </div>
            <h4 className="text-sm md:text-base text-gray-800 font-semibold mb-1">Guaranteed Quality</h4>
            <p className="text-xs text-gray-500">Premium materials & craftsmanship</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl hover:bg-orange-50 transition-all flex flex-col items-center shadow-lg"
          >
            <div className="p-3 bg-amber-100 rounded-full mb-4">
              <Truck size={28} className="text-amber-600" />
            </div>
            <h4 className="text-sm md:text-base text-gray-800 font-semibold mb-1">Free Shipping</h4>
            <p className="text-xs text-gray-500">On orders over $500</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl hover:bg-orange-50 transition-all flex flex-col items-center shadow-lg"
          >
            <div className="p-3 bg-rose-100 rounded-full mb-4">
              <Gift size={28} className="text-rose-600" />
            </div>
            <h4 className="text-sm md:text-base text-gray-800 font-semibold mb-1">Special Offers</h4>
            <p className="text-xs text-gray-500">Exclusive deals & discounts</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl hover:bg-orange-50 transition-all flex flex-col items-center shadow-lg"
          >
            <div className="p-3 bg-emerald-100 rounded-full mb-4">
              <Tag size={28} className="text-emerald-600" />
            </div>
            <h4 className="text-sm md:text-base text-gray-800 font-semibold mb-1">Best Prices</h4>
            <p className="text-xs text-gray-500">Competitive pricing guaranteed</p>
          </motion.div>
        </div>
      </div>

      {/* Mobile Categories Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          className="fixed inset-0 bg-white z-50 overflow-y-auto md:hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Categories</h2>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:bg-orange-100 p-2 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-3">
              {categories.map((category) => (
                <motion.div 
                  key={category.id} 
                  onClick={() => handleCategoryClick(category.id)}
                  whileHover={{ x: 5 }}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-orange-50 transition-all cursor-pointer border"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <category.icon size={24} className="text-orange-500" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-gray-800">{category.name}</h4>
                      <p className="text-sm text-gray-500">{category.productCount || 0} products</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8">
              <button 
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl shadow-md font-semibold"
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