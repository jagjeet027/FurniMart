// import { API_BASE_URL, ROUTES, DEMO_CREDENTIALS, ERROR_MESSAGES } from '../utils/constants';

// class ApiService {
//   constructor() {
//     this.baseURL = API_BASE_URL;
//     this.timeout = 10000; // 10 seconds timeout
//   }

//   async request(endpoint, options = {}) {
//     const url = `${this.baseURL}${endpoint}`;
//     const config = {
//       timeout: this.timeout,
//       headers: {
//         'Content-Type': 'application/json',
//         ...options.headers,
//       },
//       ...options,
//     };

//     try {
//       // Add timeout to fetch request
//       const timeoutPromise = new Promise((_, reject) =>
//         setTimeout(() => reject(new Error('Request timeout')), this.timeout)
//       );

//       const fetchPromise = fetch(url, config);
//       const response = await Promise.race([fetchPromise, timeoutPromise]);
      
//       // Check if response is ok
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.error('API Request failed:', error);
      
//       // Check if it's a network error
//       if (error.name === 'TypeError' && error.message.includes('fetch')) {
//         throw new Error('Network connection failed. Please check your internet connection.');
//       }
      
//       throw error;
//     }
//   }

//   // Auth Methods
//   async login(email, password) {
//     try {
//       const response = await this.request(ROUTES.LOGIN, {
//         method: 'POST',
//         body: JSON.stringify({ email, password }),
//       });

//       return response;
//     } catch (error) {
//       // Fallback for demo purposes - always provide demo login option
//       console.log('API login failed, checking demo credentials...');
      
//       if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
//         return {
//           success: true,
//           token: 'demo-jwt-token-12345',
//           user: {
//             id: 1,
//             email: DEMO_CREDENTIALS.email,
//             name: 'Admin User',
//             role: 'admin',
//             avatar: null,
//           },
//         };
//       }
      
//       // If network error, still allow demo login for development
//       if (error.message.includes('Network connection failed')) {
//         console.log('Network error detected, enabling demo mode');
//         return {
//           success: true,
//           token: 'demo-jwt-token-offline',
//           user: {
//             id: 1,
//             email: email,
//             name: 'Demo User',
//             role: 'admin',
//             avatar: null,
//           },
//         };
//       }
      
//       throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
//     }
//   }

//   async verifyToken(token) {
//     try {
//       const response = await this.request(ROUTES.VERIFY, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       return response;
//     } catch (error) {
//       // Fallback for demo tokens
//       if (token === 'demo-jwt-token-12345' || token === 'demo-jwt-token-offline') {
//         return {
//           success: true,
//           user: {
//             id: 1,
//             email: DEMO_CREDENTIALS.email,
//             name: 'Admin User',
//             role: 'admin',
//             avatar: null,
//           },
//         };
//       }
      
//       // If network error, don't immediately fail
//       if (error.message.includes('Network connection failed')) {
//         console.log('Network error during token verification');
//         return {
//           success: false,
//           error: 'Network connection failed'
//         };
//       }
      
//       throw new Error(ERROR_MESSAGES.TOKEN_EXPIRED);
//     }
//   }

//   async logout(token) {
//     try {
//       await this.request(ROUTES.LOGOUT, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       return { success: true };
//     } catch (error) {
//       console.warn('Logout API call failed, proceeding with local logout');
//       return { success: true };
//     }
//   }

//   // Dashboard Methods
//   async getDashboardStats(token) {
//     try {
//       const response = await this.request(ROUTES.DASHBOARD_STATS, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       return response;
//     } catch (error) {
//       // Fallback demo data
//       console.log('Using demo dashboard stats due to API error');
//       return {
//         success: true,
//         data: {
//           totalUsers: 1234,
//           activeSessions: 89,
//           revenue: '$12,345',
//           systemStatus: 'Healthy',
//         },
//       };
//     }
//   }

//   async getDashboardActivities(token) {
//     try {
//       const response = await this.request(ROUTES.DASHBOARD_ACTIVITIES, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       return response;
//     } catch (error) {
//       // Fallback demo data
//       console.log('Using demo activities due to API error');
//       return {
//         success: true,
//         data: [
//           {
//             id: 1,
//             type: 'user_registered',
//             message: 'New user registered successfully',
//             timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
//           },
//           {
//             id: 2,
//             type: 'login',
//             message: 'Admin user logged in',
//             timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
//           },
//           {
//             id: 3,
//             type: 'security',
//             message: 'Security scan completed',
//             timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
//           },
//           {
//             id: 4,
//             type: 'system',
//             message: 'System backup completed',
//             timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
//           },
//         ],
//       };
//     }
//   }

//   // Manufacturer Methods - Add these new methods
//   async getManufacturers(token = null) {
//     try {
//       const headers = {};
//       if (token) {
//         headers.Authorization = `Bearer ${token}`;
//       }

//       const response = await this.request('/manufacturers/all', {
//         headers,
//       });

//       return response;
//     } catch (error) {
//       // Fallback demo data for manufacturers
//       console.log('Using demo manufacturers due to API error');
//       return {
//         success: true,
//         data: [
//           {
//             id: 1,
//             name: 'TechCorp Industries',
//             email: 'contact@techcorp.com',
//             phone: '+1-555-0123',
//             address: '123 Technology Street, Silicon Valley, CA',
//             status: 'active',
//             products: 45,
//             joinedDate: '2023-01-15',
//           },
//           {
//             id: 2,
//             name: 'Global Manufacturing Ltd',
//             email: 'info@globalmanuf.com',
//             phone: '+1-555-0456',
//             address: '456 Industrial Ave, Detroit, MI',
//             status: 'active',
//             products: 78,
//             joinedDate: '2023-03-20',
//           },
//           {
//             id: 3,
//             name: 'Innovation Systems',
//             email: 'hello@innovation.com',
//             phone: '+1-555-0789',
//             address: '789 Innovation Blvd, Austin, TX',
//             status: 'pending',
//             products: 23,
//             joinedDate: '2023-08-10',
//           },
//         ],
//       };
//     }
//   }

//   // Generic GET method for any endpoint
//   async get(endpoint, token = null) {
//     try {
//       const headers = {};
//       if (token) {
//         headers.Authorization = `Bearer ${token}`;
//       }

//       return await this.request(endpoint, { headers });
//     } catch (error) {
//       console.error(`GET request to ${endpoint} failed:`, error);
//       throw error;
//     }
//   }

//   // Generic POST method
//   async post(endpoint, data, token = null) {
//     try {
//       const headers = {};
//       if (token) {
//         headers.Authorization = `Bearer ${token}`;
//       }

//       return await this.request(endpoint, {
//         method: 'POST',
//         headers,
//         body: JSON.stringify(data),
//       });
//     } catch (error) {
//       console.error(`POST request to ${endpoint} failed:`, error);
//       throw error;
//     }
//   }
// }

// // Create and export a singleton instance
// const apiService = new ApiService();
// export default apiService;


// API configuration and mock data
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock API functions for demonstration
const mockApi = {
  get: (url, config = {}) => {
    // Mock data for demonstration
    const mockManufacturers = [
      {
        _id: '1',
        businessName: 'Tech Manufacturing Co.',
        registrationNumber: 'REG001',
        status: 'approved',
        businessType: 'Electronics',
        revenue: 150000,
        email: 'contact@techmanufacturing.com',
        contact: { email: 'contact@techmanufacturing.com', contactPerson: 'John Doe', phone: '+1234567890' },
        address: { country: 'USA', city: 'New York', state: 'NY' },
        createdAt: '2024-01-15T00:00:00Z',
        documents: {
          businessLicense: { uploadDate: '2024-01-10T00:00:00Z' },
          taxCertificate: { uploadDate: '2024-01-12T00:00:00Z' }
        }
      },
      {
        _id: '2',
        businessName: 'Green Industries Ltd.',
        registrationNumber: 'REG002',
        status: 'pending',
        businessType: 'Renewable Energy',
        revenue: 200000,
        email: 'info@greenindustries.com',
        contact: { email: 'info@greenindustries.com', contactPerson: 'Jane Smith', phone: '+1234567891' },
        address: { country: 'Canada', city: 'Toronto', state: 'ON' },
        createdAt: '2024-02-10T00:00:00Z',
        documents: {
          businessLicense: { uploadDate: '2024-02-05T00:00:00Z' }
        }
      },
      {
        _id: '3',
        businessName: 'Smart Factory Inc.',
        registrationNumber: 'REG003',
        status: 'approved',
        businessType: 'IoT Solutions',
        revenue: 300000,
        email: 'contact@smartfactory.com',
        contact: { email: 'contact@smartfactory.com', contactPerson: 'Mike Johnson', phone: '+1234567892' },
        address: { country: 'UK', city: 'London', state: 'London' },
        createdAt: '2024-03-05T00:00:00Z'
      }
    ];

    const mockNotifications = [
      { _id: '1', message: 'New manufacturer registration pending approval', isNew: true, createdAt: new Date() },
      { _id: '2', message: 'Monthly report generated successfully', isNew: false, createdAt: new Date() },
      { _id: '3', message: 'Revenue milestone achieved', isNew: true, createdAt: new Date() }
    ];

    return Promise.resolve({
      data: {
        success: true,
        data: url.includes('manufacturers') ? mockManufacturers : mockNotifications
      }
    });
  },
  patch: () => Promise.resolve({ data: { success: true } })
};

export { api, mockApi };