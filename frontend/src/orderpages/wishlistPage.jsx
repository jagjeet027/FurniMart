import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trash2, 
  ShoppingCart, 
  ArrowLeft,
  Star,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const WishlistPage = () => {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch wishlist items from localStorage
    const fetchWishlistItems = () => {
      setLoading(true);
      try {
        const storedWishlist = localStorage.getItem('wishlist');
        if (storedWishlist) {
          setWishlistItems(JSON.parse(storedWishlist));
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistItems();
  }, []);

  // This function updates both the state and localStorage,
  // and also dispatches a custom event to notify other components
  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlistItems.filter(item => item._id !== productId);
    setWishlistItems(updatedWishlist);
    
    // Update localStorage
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    
    // Dispatch a custom event that other components can listen for
    const wishlistUpdateEvent = new CustomEvent('wishlistUpdated', {
      detail: { count: updatedWishlist.length }
    });
    document.dispatchEvent(wishlistUpdateEvent);
  };

  const renderRatingStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star 
        key={index} 
        className={`h-4 w-4 ${index < (rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your wishlist.</p>
          <Link 
            to="/login" 
            className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition inline-block"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">Loading your wishlist...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            My Wishlist <span className="text-orange-500">({wishlistItems.length} items)</span>
          </h1>
          <Link 
            to="/" 
            className="text-orange-500 hover:text-orange-600 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Continue Shopping
          </Link>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start adding items you love to your wishlist!</p>
            <Link 
              to="/" 
              className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition inline-block"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((product) => (
              <div 
                key={product._id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="relative">
                  <Link to={`/products/${product._id}`}>
                    <img 
                      src={product.images?.[0] || product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </Link>
                  <button 
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-2 right-2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>

                <div className="p-4">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-semibold text-lg text-gray-800 mb-1 hover:text-orange-500">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex mb-2">
                    {renderRatingStars(product.rating)}
                    <span className="text-xs text-gray-500 ml-1">
                      ({product.reviews || 0})
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      ${product.price}
                    </span>
                    <Link 
                      to={`/products/${product._id}`}
                      className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-orange-600 transition"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;