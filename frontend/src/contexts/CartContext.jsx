// Enhanced Cart Hook for centralized cart management (Persistent Storage)
import { useState, useEffect, createContext, useContext } from 'react';

// Create Cart Context
const CartContext = createContext();

// Enhanced storage solution with fallback
const createStorage = () => {
  // Try to use localStorage first, fallback to memory storage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return {
        getItem: (key) => {
          try {
            return window.localStorage.getItem(key);
          } catch (e) {
            console.warn('localStorage getItem failed:', e);
            return window._appStorage?.[key] || null;
          }
        },
        setItem: (key, value) => {
          try {
            window.localStorage.setItem(key, value);
            // Also backup to memory
            if (!window._appStorage) window._appStorage = {};
            window._appStorage[key] = value;
          } catch (e) {
            console.warn('localStorage setItem failed, using memory storage:', e);
            if (!window._appStorage) window._appStorage = {};
            window._appStorage[key] = value;
          }
        },
        removeItem: (key) => {
          try {
            window.localStorage.removeItem(key);
            if (window._appStorage) delete window._appStorage[key];
          } catch (e) {
            console.warn('localStorage removeItem failed:', e);
            if (window._appStorage) delete window._appStorage[key];
          }
        }
      };
    }
  } catch (e) {
    console.warn('localStorage not available, using memory storage:', e);
  }
  
  // Fallback to memory storage
  if (!window._appStorage) window._appStorage = {};
  return {
    getItem: (key) => window._appStorage[key] || null,
    setItem: (key, value) => { window._appStorage[key] = value; },
    removeItem: (key) => { delete window._appStorage[key]; }
  };
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(new Map());
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const storage = createStorage();

  // Load cart from storage on mount
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Update cart count and total when cartItems changes
  useEffect(() => {
    if (!isLoading) {
      const count = Array.from(cartItems.values()).reduce((sum, qty) => sum + qty, 0);
      setCartCount(count);
      calculateCartTotal();
    }
  }, [cartItems, isLoading]);

  const loadCartFromStorage = () => {
    try {
      setIsLoading(true);
      const storedCart = storage.getItem('shoppingCart');
      
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        const cartMap = new Map();
        
        if (Array.isArray(parsedCart)) {
          parsedCart.forEach(item => {
            if (typeof item === 'string') {
              cartMap.set(item, 1);
            } else if (item.productId && item.quantity) {
              cartMap.set(item.productId, parseInt(item.quantity) || 1);
            }
          });
        } else if (typeof parsedCart === 'object') {
          // Handle object format
          Object.entries(parsedCart).forEach(([productId, quantity]) => {
            cartMap.set(productId, parseInt(quantity) || 1);
          });
        }
        
        setCartItems(cartMap);
        console.log('Cart loaded from storage:', cartMap);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      // Initialize empty cart on error
      setCartItems(new Map());
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartInStorage = (newCartItems) => {
    try {
      const cartData = Array.from(newCartItems.entries()).map(([productId, quantity]) => ({
        productId: String(productId),
        quantity: parseInt(quantity) || 1,
        addedAt: new Date().toISOString()
      }));
      
      storage.setItem('shoppingCart', JSON.stringify(cartData));
      
      // Dispatch custom event for cart updates
      const cartEvent = new CustomEvent('cartUpdated', { 
        detail: { 
          cart: cartData, 
          count: cartData.reduce((sum, item) => sum + item.quantity, 0),
          total: cartTotal,
          timestamp: new Date().toISOString()
        } 
      });
      
      window.dispatchEvent(cartEvent);
      
      console.log('Cart updated in storage:', cartData);
      
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  const calculateCartTotal = async () => {
    let total = 0;
    
    try {
      
      const cartArray = Array.from(cartItems.entries());
      
      if (cartArray.length > 0) {
        // You can replace this with actual product price fetching
        for (const [productId, quantity] of cartArray) {
          try {
           
            const defaultPrice = 99; 
            total += defaultPrice * quantity;
            
          } catch (productError) {
            console.warn(`Error fetching price for product ${productId}:`, productError);
            // Use fallback price if API fails
            total += 99 * quantity;
          }
        }
      }
      
    } catch (error) {
      console.error('Error calculating cart total:', error);
    }
    
    setCartTotal(total);
  };

  const addToCart = (productId, quantity = 1) => {
    try {
      const newCartItems = new Map(cartItems);
      const currentQuantity = newCartItems.get(String(productId)) || 0;
      const newQuantity = currentQuantity + parseInt(quantity);
      
      newCartItems.set(String(productId), newQuantity);
      
      setCartItems(newCartItems);
      updateCartInStorage(newCartItems);
      
      // Show success notification
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { 
          message: `Added ${quantity} item${quantity > 1 ? 's' : ''} to cart!`, 
          type: 'success' 
        }
      }));
      
      console.log(`Added ${quantity} of product ${productId} to cart`);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: 'Failed to add item to cart', type: 'error' }
      }));
    }
  };

  const updateCartQuantity = (productId, quantity) => {
    try {
      const newCartItems = new Map(cartItems);
      const newQuantity = parseInt(quantity);
      
      if (newQuantity <= 0) {
        newCartItems.delete(String(productId));
      } else {
        newCartItems.set(String(productId), newQuantity);
      }
      
      setCartItems(newCartItems);
      updateCartInStorage(newCartItems);
      
      console.log(`Updated product ${productId} quantity to ${newQuantity}`);
      
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const removeFromCart = (productId) => {
    try {
      const newCartItems = new Map(cartItems);
      newCartItems.delete(String(productId));
      
      setCartItems(newCartItems);
      updateCartInStorage(newCartItems);
      
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: 'Item removed from cart', type: 'info' }
      }));
      
      console.log(`Removed product ${productId} from cart`);
      
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = () => {
    try {
      const newCartItems = new Map();
      setCartItems(newCartItems);
      
      storage.removeItem('shoppingCart');
      
      window.dispatchEvent(new CustomEvent('cartUpdated', {
        detail: { cart: [], count: 0, total: 0 }
      }));
      
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: 'Cart cleared successfully', type: 'info' }
      }));
      
      console.log('Cart cleared');
      
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getCartItemQuantity = (productId) => {
    return cartItems.get(String(productId)) || 0;
  };

  const isInCart = (productId) => {
    return cartItems.has(String(productId));
  };

  const getTotalItems = () => {
    return cartCount;
  };

  const getCartItems = () => {
    return Array.from(cartItems.entries()).map(([productId, quantity]) => ({
      productId: String(productId),
      quantity: parseInt(quantity) || 1
    }));
  };

  const getCartValue = () => {
    return {
      items: getCartItems(),
      count: cartCount,
      total: cartTotal,
      isLoading
    };
  };

  // Debug function to check cart state
  const debugCart = () => {
    console.log('Current cart state:', {
      cartItems: Array.from(cartItems.entries()),
      cartCount,
      cartTotal,
      isLoading
    });
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      isLoading,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      getCartItemQuantity,
      isInCart,
      getTotalItems,
      getCartItems,
      getCartValue,
      loadCartFromStorage,
      debugCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Utility function to initialize cart from outside components
export const initializeCart = () => {
  const storage = createStorage();
  const storedCart = storage.getItem('shoppingCart');
  
  if (storedCart) {
    try {
      return JSON.parse(storedCart);
    } catch (error) {
      console.error('Error parsing stored cart:', error);
      return [];
    }
  }
  
  return [];
};