// ==================== src/utils/networkUtils.js ====================

import { ERROR_MESSAGES, NETWORK_CONFIG } from './constants';

// Check if the user is online
export const isOnline = () => {
  return navigator.onLine;
};

// Add network status listeners
export const addNetworkListeners = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

// Retry mechanism for failed requests
export const retryRequest = async (requestFn, maxAttempts = NETWORK_CONFIG.RETRY_ATTEMPTS) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await requestFn();
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.status === 401 || error.status === 403 || error.status === 404) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxAttempts) {
        await new Promise(resolve => 
          setTimeout(resolve, NETWORK_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1))
        );
      }
    }
  }

  throw lastError;
};

// Enhanced fetch with timeout and retry
export const enhancedFetch = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NETWORK_CONFIG.REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
};

// Error classification and handling
export const classifyError = (error) => {
  if (!error) {
    return {
      type: 'unknown',
      message: ERROR_MESSAGES.GENERIC_ERROR,
      shouldRetry: false,
    };
  }

  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: ERROR_MESSAGES.NETWORK_ERROR,
      shouldRetry: true,
    };
  }

  // Timeout errors
  if (error.message.includes('timeout') || error.name === 'AbortError') {
    return {
      type: 'timeout',
      message: 'Request timed out. Please try again.',
      shouldRetry: true,
    };
  }

  // HTTP errors
  if (error.status) {
    switch (error.status) {
      case 400:
        return {
          type: 'validation',
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          shouldRetry: false,
        };
      case 401:
        return {
          type: 'authentication',
          message: ERROR_MESSAGES.TOKEN_EXPIRED,
          shouldRetry: false,
        };
      case 403:
        return {
          type: 'authorization',
          message: ERROR_MESSAGES.UNAUTHORIZED,
          shouldRetry: false,
        };
      case 404:
        return {
          type: 'not_found',
          message: 'Resource not found.',
          shouldRetry: false,
        };
      case 500:
        return {
          type: 'server',
          message: ERROR_MESSAGES.SERVER_ERROR,
          shouldRetry: true,
        };
      default:
        return {
          type: 'http',
          message: error.message || ERROR_MESSAGES.GENERIC_ERROR,
          shouldRetry: error.status >= 500,
        };
    }
  }

  return {
    type: 'generic',
    message: error.message || ERROR_MESSAGES.GENERIC_ERROR,
    shouldRetry: false,
  };
};

// Create a request queue for offline scenarios
class RequestQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  add(request) {
    this.queue.push(request);
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing || !isOnline()) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0 && isOnline()) {
      const request = this.queue.shift();
      try {
        await request();
      } catch (error) {
        console.error('Failed to process queued request:', error);
        // Optionally re-queue the request
        if (classifyError(error).shouldRetry) {
          this.queue.unshift(request);
          break;
        }
      }
    }

    this.isProcessing = false;
  }

  clear() {
    this.queue = [];
  }
}

export const requestQueue = new RequestQueue();

// Network status hook for React components
export const useNetworkStatus = () => {
  const [isOnlineState, setIsOnlineState] = React.useState(isOnline());

  React.useEffect(() => {
    const handleOnline = () => setIsOnlineState(true);
    const handleOffline = () => setIsOnlineState(false);

    const cleanup = addNetworkListeners(handleOnline, handleOffline);
    return cleanup;
  }, []);

  return isOnlineState;
};

// Cache management for offline scenarios
class SimpleCache {
  constructor(maxAge = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.maxAge = maxAge;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

export const apiCache = new SimpleCache();

// Utility to handle API responses consistently
export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response.json();
};

// Create a wrapped fetch function with all enhancements
export const safeFetch = async (url, options = {}) => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  // Check cache first for GET requests
  if (!options.method || options.method === 'GET') {
    const cachedResponse = apiCache.get(cacheKey);
    if (cachedResponse && isOnline()) {
      return cachedResponse;
    }
  }

  try {
    const response = await retryRequest(async () => {
      const fetchResponse = await enhancedFetch(url, options);
      return handleApiResponse(fetchResponse);
    });

    // Cache successful GET responses
    if (!options.method || options.method === 'GET') {
      apiCache.set(cacheKey, response);
    }

    return response;
  } catch (error) {
    const errorInfo = classifyError(error);
    console.error('API request failed:', {
      url,
      error: errorInfo,
      originalError: error,
    });

    // Return cached data if available and it's a network error
    if (errorInfo.type === 'network' && (!options.method || options.method === 'GET')) {
      const cachedResponse = apiCache.get(cacheKey);
      if (cachedResponse) {
        console.log('Returning cached data due to network error');
        return cachedResponse;
      }
    }

    throw error;
  }
};

export default {
  isOnline,
  addNetworkListeners,
  retryRequest,
  enhancedFetch,
  classifyError,
  requestQueue,
  apiCache,
  handleApiResponse,
  safeFetch,
};