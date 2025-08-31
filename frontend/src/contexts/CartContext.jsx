// Enhanced Cart Hook for centralized cart management (In-Memory Storage)
import { useState, useEffect, createContext, useContext } from 'react';

// Create Cart Context
const CartContext = createContext();

// In-memory storage solution (instead of localStorage)
const createMemoryStorage = () => {
  if (!window._appStorage) {
    window._appStorage = {};
  }
  return window._appStorage;
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(new Map());
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  // Load cart from memory storage on mount
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Update cart count and total when cartItems changes
  useEffect(() => {
    const count = Array.from(cartItems.values()).reduce((sum, qty) => sum + qty, 0);
    setCartCount(count);
    calculateCartTotal();
  }, [cartItems]);

  const loadCartFromStorage = () => {
    try {
      const storage = createMemoryStorage();
      const storedCart = storage.cart;
      
      if (storedCart) {
        const cartMap = new Map();
        
        if (Array.isArray(storedCart)) {
          storedCart.forEach(item => {
            if (typeof item === 'string') {
              cartMap.set(item, 1);
            } else if (item.productId) {
              cartMap.set(item.productId, item.quantity || 1);
            }
          });
        }
        setCartItems(cartMap);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
  };

  const updateCartInStorage = (newCartItems) => {
    const cartData = Array.from(newCartItems.entries()).map(([productId, quantity]) => ({
      productId,
      quantity
    }));
    
    try {
      const storage = createMemoryStorage();
      storage.cart = cartData;
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
    
    // Dispatch custom event for cart updates
    window.dispatchEvent(new CustomEvent('cartUpdated', { 
      detail: { 
        cart: cartData, 
        count: cartData.reduce((sum, item) => sum + item.quantity, 0),
        total: cartTotal
      } 
    }));
  };

  const calculateCartTotal = async () => {
    // This would typically fetch product details to calculate total
    // For now, using a placeholder calculation
    let total = 0;
    
    try {
      // You can implement actual price calculation here by fetching product data
      // For example:
      // for (const [productId, quantity] of cartItems) {
      //   const product = await fetchProductById(productId);
      //   total += (product.price || 0) * quantity;
      // }
      
      // Placeholder calculation - you can replace this with real product prices
      total = Array.from(cartItems.entries()).reduce((sum, [productId, quantity]) => {
        // Using a default price of $50 per item as placeholder
        const defaultPrice = 50;
        return sum + (defaultPrice * quantity);
      }, 0);
      
    } catch (error) {
      console.error('Error calculating cart total:', error);
    }
    
    setCartTotal(total);
  };

  const addToCart = (productId, quantity = 1) => {
    const newCartItems = new Map(cartItems);
    const currentQuantity = newCartItems.get(productId) || 0;
    newCartItems.set(productId, currentQuantity + quantity);
    
    setCartItems(newCartItems);
    updateCartInStorage(newCartItems);
    
    // Show notification or toast
    window.dispatchEvent(new CustomEvent('showNotification', {
      detail: { message: 'Item added to cart!', type: 'success' }
    }));
  };

  const updateCartQuantity = (productId, quantity) => {
    const newCartItems = new Map(cartItems);
    
    if (quantity <= 0) {
      newCartItems.delete(productId);
    } else {
      newCartItems.set(productId, quantity);
    }
    
    setCartItems(newCartItems);
    updateCartInStorage(newCartItems);
  };

  const removeFromCart = (productId) => {
    const newCartItems = new Map(cartItems);
    newCartItems.delete(productId);
    
    setCartItems(newCartItems);
    updateCartInStorage(newCartItems);
    
    window.dispatchEvent(new CustomEvent('showNotification', {
      detail: { message: 'Item removed from cart', type: 'info' }
    }));
  };

  const clearCart = () => {
    const newCartItems = new Map();
    setCartItems(newCartItems);
    
    try {
      const storage = createMemoryStorage();
      delete storage.cart;
    } catch (error) {
      console.error('Error clearing cart from storage:', error);
    }
    
    updateCartInStorage(newCartItems);
  };

  const getCartItemQuantity = (productId) => {
    return cartItems.get(productId) || 0;
  };

  const isInCart = (productId) => {
    return cartItems.has(productId);
  };

  const getTotalItems = () => {
    return cartCount;
  };

  const getCartItems = () => {
    return Array.from(cartItems.entries()).map(([productId, quantity]) => ({
      productId,
      quantity
    }));
  };

  const getCartValue = () => {
    return {
      items: getCartItems(),
      count: cartCount,
      total: cartTotal
    };
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      getCartItemQuantity,
      isInCart,
      getTotalItems,
      getCartItems,
      getCartValue,
      loadCartFromStorage
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