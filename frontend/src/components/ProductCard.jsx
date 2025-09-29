import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Share2, Heart, ShoppingCart, Eye, Tag, Zap, TrendingUp, Award, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProductCard = ({ product, updateWishlist, listView = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  
  useEffect(() => {
    checkWishlistStatus();
  }, [product._id]);

  // Listen for wishlist updates
  useEffect(() => {
    const handleWishlistUpdate = (event) => {
      if (event.detail && event.detail.productId === product._id) {
        setIsInWishlist(event.detail.inWishlist);
      } else {
        checkWishlistStatus();
      }
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, [product._id]);

  const checkWishlistStatus = () => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsInWishlist(wishlist.some(item => item._id === product._id));
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      setIsInWishlist(false);
    }
  };
  
  const handleViewClick = () => {
    navigate(`/products/${product._id}`);
  };
  
  const handleWishlistClick = (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      let newWishlist;
      
      if (isInWishlist) {
        newWishlist = wishlist.filter(item => item._id !== product._id);
      } else {
        newWishlist = [...wishlist, {
          _id: product._id,
          name: product.name,
          price: product.price,
          rating: product.rating,
          reviews: product.reviews,
          image: product.image,
          images: product.images
        }];
      }
      
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      setIsInWishlist(!isInWishlist);
      
      if (updateWishlist) {
        updateWishlist(newWishlist);
      }
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { 
          productId: product._id,
          inWishlist: !isInWishlist,
          wishlist: newWishlist
        } 
      }));
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };
  
  const handleShareClick = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/products/${product._id}`;
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        // Show a nice notification instead of alert
        const event = new CustomEvent('showNotification', { 
          detail: { message: 'Product link copied to clipboard!', type: 'success' } 
        });
        window.dispatchEvent(event);
      });
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setAddingToCart(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Add to cart logic here
      const event = new CustomEvent('showNotification', { 
        detail: { message: 'Product added to cart!', type: 'success' } 
      });
      window.dispatchEvent(event);
    } catch (error) {
      const event = new CustomEvent('showNotification', { 
        detail: { message: 'Failed to add to cart!', type: 'error' } 
      });
      window.dispatchEvent(event);
    } finally {
      setAddingToCart(false);
    }
  };

  const nextImage = (e) => {
    e.stopPropagation();
    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const renderRatingStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <motion.div
        key={index}
        whileHover={{ scale: 1.2 }}
        transition={{ duration: 0.1 }}
      >
        <Star 
          className={`w-4 h-4 ${index < (rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      </motion.div>
    ));
  };

  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const currentImage = productImages[currentImageIndex] || product.image;
  const hasMultipleImages = productImages.length > 1;

  // Calculate savings if there's a discount
  const originalPrice = product.discount ? (product.price / (1 - product.discount/100)) : null;
  const savings = originalPrice ? originalPrice - product.price : 0;

  if (listView) {
    return (
      <motion.div 
        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-orange-200"
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        layout
      >
        <div className="flex flex-col sm:flex-row">
          {/* Enhanced Image Section */}
          <div className="relative sm:w-1/3 h-64 sm:h-56">
            <motion.img
              src={currentImage}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
              whileHover={{ scale: 1.05 }}
            />
            
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <motion.div 
                  className="text-gray-400 text-sm"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Loading...
                </motion.div>
              </div>
            )}

            {/* Image Navigation for Multiple Images */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            
            {/* Enhanced Image Indicators */}
            {hasMultipleImages && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {productImages.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                    }`}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            )}

            {/* Enhanced Badges */}
            <div className="absolute top-3 left-3 flex flex-col space-y-2">
              {product.discount && (
                <motion.div 
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {product.discount}% OFF
                </motion.div>
              )}
              {product.isNew && (
                <motion.div 
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  NEW
                </motion.div>
              )}
              {product.isTrending && (
                <motion.div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  TRENDING
                </motion.div>
              )}
            </div>
          </div>

          {/* Enhanced Content Section */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <motion.h3 
                    className="text-xl font-bold text-gray-800 mb-1 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2"
                    whileHover={{ scale: 1.02 }}
                    onClick={handleViewClick}
                  >
                    {product.name}
                  </motion.h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">{product.description}</p>
                  {product.manufacturer && (
                    <p className="text-xs text-gray-500 flex items-center">
                      <Award className="w-3 h-3 mr-1" />
                      by {product.manufacturer}
                    </p>
                  )}
                </div>
                
                {/* Enhanced Price Section */}
                <div className="flex flex-col items-end ml-4">
                  <motion.span 
                    className="text-2xl font-bold text-blue-600"
                    whileHover={{ scale: 1.1 }}
                  >
                    ${product.price}
                  </motion.span>
                  {originalPrice && (
                    <div className="text-right">
                      <span className="text-sm text-gray-500 line-through">
                        ${originalPrice.toFixed(2)}
                      </span>
                      <div className="text-xs text-green-600 font-semibold">
                        Save ${savings.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Rating and Reviews */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex items-center mr-3">
                    {renderRatingStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.reviews || 0} reviews)
                  </span>
                </div>
                
                {/* Quick Stats */}
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  {product.viewCount && (
                    <div className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {product.viewCount}
                    </div>
                  )}
                  {product.soldCount && (
                    <div className="flex items-center">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      {product.soldCount} sold
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Actions */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex space-x-2">
                  <motion.button 
                    onClick={handleWishlistClick}
                    className={`p-2 rounded-full transition-all shadow-md ${
                      isInWishlist 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                  </motion.button>
                  <motion.button 
                    onClick={handleShareClick}
                    className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all shadow-md"
                    title="Share product"
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Share2 className="w-4 h-4" />
                  </motion.button>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="px-3 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 disabled:opacity-50 transition-colors text-sm font-medium flex items-center shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {addingToCart ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                      </motion.div>
                    ) : (
                      <ShoppingCart className="w-4 h-4 mr-1" />
                    )}
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </motion.button>
                  <motion.button
                    onClick={handleViewClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Enhanced Grid View (Default)
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100 hover:border-orange-200"
      onClick={handleViewClick}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <div className="relative">
        <div className="relative h-64 bg-gray-100 overflow-hidden group/image">
          <motion.img
            src={currentImage}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <motion.div 
                className="text-gray-400 text-sm"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Loading...
              </motion.div>
            </div>
          )}

          {/* Mobile-optimized Image Navigation */}
          {hasMultipleImages && (
            <>
              <motion.button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80 backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80 backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </>
          )}
        </div>
        
        {/* Enhanced Action Buttons - Mobile Optimized */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          <AnimatePresence>
            <motion.button 
              onClick={handleWishlistClick}
              className={`p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all ${
                isInWishlist 
                  ? 'bg-red-100/90 text-red-600 hover:bg-red-200/90' 
                  : 'bg-white/90 text-gray-600 hover:bg-white'
              }`}
              title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                rotate: isInWishlist ? [0, -10, 10, 0] : 0
              }}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </motion.button>
          </AnimatePresence>
          
          <motion.button 
            onClick={handleShareClick}
            className="p-2.5 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all backdrop-blur-sm"
            title="Share product"
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </motion.button>
          
          <motion.button 
            onClick={(e) => {
              e.stopPropagation();
              handleViewClick();
            }}
            className="p-2.5 bg-blue-600/90 text-white rounded-full shadow-lg hover:bg-blue-700/90 transition-all backdrop-blur-sm"
            title="Quick view"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Eye className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Enhanced Badges with Animations */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.discount && (
            <motion.div 
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Tag className="w-3 h-3 mr-1" />
              {product.discount}% OFF
            </motion.div>
          )}
          {product.isNew && (
            <motion.div 
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.1 }}
            >
              <Zap className="w-3 h-3 mr-1" />
              NEW
            </motion.div>
          )}
          {product.isTrending && (
            <motion.div 
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.1 }}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              HOT
            </motion.div>
          )}
        </div>

        {/* Enhanced Image Indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {productImages.map((_, index) => (
              <motion.button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all backdrop-blur-sm ${
                  index === currentImageIndex 
                    ? 'bg-white scale-125 shadow-lg' 
                    : 'bg-white/60 hover:bg-white/80'
                }`}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4">
        {/* Enhanced Product Info */}
        <div className="mb-3">
          <motion.h3 
            className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2"
            whileHover={{ scale: 1.02 }}
          >
            {product.name}
          </motion.h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2 leading-relaxed">{product.description}</p>
          {product.manufacturer && (
            <motion.p 
              className="text-xs text-gray-500 flex items-center"
              whileHover={{ x: 2 }}
            >
              <Award className="w-3 h-3 mr-1 text-orange-500" />
              by {product.manufacturer}
            </motion.p>
          )}
        </div>
        
        {/* Enhanced Price and Rating Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <motion.span 
                className="text-xl font-bold text-blue-600"
                whileHover={{ scale: 1.1 }}
              >
                ${product.price}
              </motion.span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {savings > 0 && (
              <motion.div 
                className="text-xs text-green-600 font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Save ${savings.toFixed(2)}
              </motion.div>
            )}
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end mb-1">
              {renderRatingStars(product.rating)}
            </div>
            <div className="flex items-center justify-end space-x-2 text-xs text-gray-600">
              <span>({product.reviews || 0} reviews)</span>
              {product.soldCount && (
                <motion.span 
                  className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  {product.soldCount} sold
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Product Features/Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags.slice(0, 3).map((tag, index) => (
              <motion.span 
                key={index} 
                className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 text-xs rounded-full hover:from-orange-100 hover:to-orange-200 hover:text-orange-700 transition-all cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        )}
        
        {/* Enhanced Action Buttons */}
        <div className="flex space-x-2">
          <motion.button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white rounded-lg transition-all text-sm font-semibold flex items-center justify-center shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            {addingToCart ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Clock className="w-4 h-4" />
                </motion.div>
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            )}
          </motion.button>
          
          <motion.button
            onClick={handleViewClick}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center justify-center shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <Eye className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;