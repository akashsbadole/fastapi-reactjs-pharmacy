import axios from 'axios';

// Create base API instance
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Create auth API instance (for login/register endpoints)
export const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor to include auth token
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API endpoints
export const endpoints = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    // ME: '/api/auth/me',
    CHANGE_PASSWORD: '/api/auth/change-password',
    USERS: '/api/auth/users',
  },
  
  // Patient endpoints
  PATIENTS: {
    LIST: '/api/patients',
    CREATE: '/api/patients',
    GET: (id) => `/api/patients/${id}`,
    UPDATE: (id) => `/api/patients/${id}`,
    SEARCH: '/api/patients/search',
    SUMMARY: (id) => `/api/patients/${id}/summary`,
    PRESCRIPTIONS: (id) => `/api/patients/${id}/prescriptions`,
  },
  
  // Inventory endpoints
  INVENTORY: {
    MEDICINES: '/api/inventory/medicines',
    MEDICINE: (id) => `/api/inventory/medicines/${id}`,
    BATCHES: '/api/inventory/batches',
    BATCH: (id) => `/api/inventory/batches/${id}`,
    SUPPLIERS: '/api/inventory/suppliers',
    SUPPLIER: (id) => `/api/inventory/suppliers/${id}`,
    STOCK_MOVEMENT: (id) => `/api/inventory/batches/${id}/stock-movement`,
    LOW_STOCK_ALERTS: '/api/inventory/alerts/low-stock',
    EXPIRING_SOON: '/api/inventory/alerts/expiring-soon',
  },
  
  // Prescription endpoints
  PRESCRIPTIONS: {
    LIST: '/api/prescriptions',
    CREATE: '/api/prescriptions',
    GET: (id) => `/api/prescriptions/${id}`,
    UPDATE: (id) => `/api/prescriptions/${id}`,
    UPLOAD: '/api/prescriptions/upload',
    VALIDATE: (id) => `/api/prescriptions/${id}/validate`,
    FILL: '/api/prescriptions/fill',
    SEARCH: '/api/prescriptions/search',
  },
  
  // Billing endpoints
  BILLING: {
    INVOICES: '/api/billing/invoices',
    INVOICE: (id) => `/api/billing/invoices/${id}`,
    PAYMENTS: (id) => `/api/billing/invoices/${id}/payments`,
    REFUND: (id) => `/api/billing/invoices/${id}/refund`,
    SALES_REPORT: '/api/billing/sales-report',
    CALCULATE_TAX: '/api/billing/calculate-tax',
  },
  
  // Reports endpoints
  REPORTS: {
    DASHBOARD_STATS: '/api/reports/dashboard/stats',
    SALES: '/api/reports/sales',
    INVENTORY: '/api/reports/inventory',
    PRESCRIPTIONS: '/api/reports/prescriptions',
    PATIENTS: '/api/reports/patients',
    FINANCIAL: '/api/reports/financial',
    SUPPLIERS: '/api/reports/suppliers',
    AUDIT_LOGS: '/api/reports/audit-logs',
    GENERATE: '/api/reports/generate',
  },
};

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          // This will be handled by the AuthContext interceptor
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', data.detail);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', data.detail);
          break;
        case 422:
          // Validation error
          console.error('Validation error:', data.detail);
          break;
        case 500:
          // Server error
          console.error('Server error:', data.detail);
          break;
        default:
          console.error('API error:', data.detail || 'Unknown error');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper functions for common API operations
export const apiHelpers = {
  // Get paginated data
  getPaginated: async (endpoint, params = {}) => {
    const response = await api.get(endpoint, { params });
    return response.data;
  },
  
  // Create resource
  create: async (endpoint, data) => {
    const response = await api.post(endpoint, data);
    return response.data;
  },
  
  // Get single resource
  get: async (endpoint) => {
    const response = await api.get(endpoint);
    return response.data;
  },
  
  // Update resource
  update: async (endpoint, data) => {
    const response = await api.put(endpoint, data);
    return response.data;
  },
  
  // Delete resource
  delete: async (endpoint) => {
    const response = await api.delete(endpoint);
    return response.data;
  },
  
  // Upload file
  uploadFile: async (endpoint, file, additionalData = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional data to form data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });
    
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

export default api;