
import React, { useState, useEffect } from 'react';
import { Star, Share2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, updateWishlist }) => {
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  // Check if product is in wishlist when component mounts
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsInWishlist(wishlist.some(item => item._id === product._id));
  }, [product._id]);
  
  const handleViewClick = () => {
    window.open(`/products/${product._id}`, '_blank');
  };
  
  const handleWishlistClick = (e) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    // Get current wishlist from localStorage
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    let newWishlist;
    if (isInWishlist) {
      // Remove from wishlist
      newWishlist = wishlist.filter(item => item._id !== product._id);
    } else {
      // Add to wishlist
      newWishlist = [...wishlist, product];
    }
    
    // Update localStorage
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    
    // Update state
    setIsInWishlist(!isInWishlist);
    
    // If parent component provided updateWishlist function, call it
    if (updateWishlist) {
      updateWishlist(newWishlist);
    }
  };
  
  const handleShareClick = (e) => {
    e.stopPropagation();
    // Share functionality - for example, copy product URL to clipboard
    const url = `${window.location.origin}/products/${product._id}`;
    navigator.clipboard.writeText(url);
    alert('Product link copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img
          src={product.images?.[0] || product.image}
          alt={product.name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            className={`p-2 ${isInWishlist ? 'bg-red-100' : 'bg-white/90'} rounded-full hover:bg-white transition-colors`}
            onClick={handleWishlistClick}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart 
              className={`w-5 h-5 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
            />
          </button>
          <button 
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            onClick={handleShareClick}
            aria-label="Share product"
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {product.discount && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-md text-sm">
            {product.discount}% OFF
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
          <span className="text-lg font-bold text-orange-600">${product.price}</span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="flex items-center mr-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < (product.rating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({product.reviews || 0} reviews)</span>
          </div>
          <span className="text-sm text-gray-500">{product.manufacturer}</span>
        </div>
        
        <button
          onClick={handleViewClick}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProductCard;