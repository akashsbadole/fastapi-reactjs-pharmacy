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

// Add request interceptor to include auth token for all API calls
api.interceptors.request.use(
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
    ME: '/api/auth/me',
    CHANGE_PASSWORD: '/api/auth/change-password',
    USERS: '/api/auth/users',
    USER: (id) => `/api/auth/users/${id}`,
    DELETE_USER: (id) => `/api/auth/users/${id}`,
    TOGGLE_USER_STATUS: (id) => `/api/auth/users/${id}/toggle-status`,
    STAFF_LOGIN: '/api/auth/staff-login',
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
    EXPORT_MEDICINES_CSV: '/api/inventory/medicines/export/csv',
    IMPORT_MEDICINES_CSV: '/api/inventory/medicines/import/csv',
    ANALYTICS_SUMMARY: '/api/inventory/analytics/summary',
    ANALYTICS_STOCK_MOVEMENT: '/api/inventory/analytics/stock-movement',
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
    POS_TRANSACTIONS: '/api/billing/pos-transactions',
    HELD_BILLS: '/api/billing/held-bills',
    ALL_TRANSACTIONS: '/api/billing/all-transactions',
  },
  
  // POS endpoints
  POS: {
    MEDICINES_SEARCH: '/api/pos/medicines/search',
    BARCODE_SCAN: '/api/pos/barcode/scan',
    STOCK_ALERTS: '/api/pos/stock/alerts',
    CART_CALCULATE: '/api/pos/cart/calculate',
    QUICK_SALE: '/api/pos/sale/quick',
    PROCESS_SALE: '/api/pos/sale',
    RECEIPT: (id) => `/api/pos/receipt/${id}`,
    CONFIG: '/api/pos/config',
    DAILY_SUMMARY: '/api/pos/summary/daily',
    HOLD_BILL: '/api/pos/hold',
    HOLD_BILL_LIST: '/api/pos/hold/list',
    RELEASE_HOLD_BILL: (id) => `/api/pos/hold/${id}/release`,
    DELETE_HOLD_BILL: (id) => `/api/pos/hold/${id}`,
    PROCESS_REFUND: '/api/pos/refund',
    SEND_DIGITAL_RECEIPT: '/api/pos/send-digital-receipt',
    PRINT_BARCODES: '/api/pos/print-barcodes',
    SYNC_TRANSACTION: '/api/pos/sync-transaction',
    END_SHIFT: '/api/pos/end-shift',
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
    DOWNLOAD: (reportType) => `/api/reports/download/${reportType}`,
  },
  
  // Settings endpoints
  SETTINGS: {
    ORGANIZATION: '/api/settings/organization',
    POS: '/api/settings/pos',
    INVENTORY: '/api/settings/inventory',
    NOTIFICATIONS: '/api/settings/notifications',
    INTEGRATIONS: '/api/settings/integrations',
    COMPLIANCE: '/api/settings/compliance',
    BACKUP: '/api/settings/backup',
    THEME: '/api/settings/theme',
    USERS: '/api/settings/users',
    USERS_LIST: '/api/settings/users/list',
    USERS_CREATE: '/api/settings/users/create',
    USER_UPDATE: (id) => `/api/settings/users/${id}`,
    USER_DELETE: (id) => `/api/settings/users/${id}`,
    USER_RESET_PASSWORD: (id) => `/api/settings/users/${id}/reset-password`,
    USER_TOGGLE_STATUS: (id) => `/api/settings/users/${id}/toggle-status`,
    BACKUP_CREATE: '/api/settings/backup/create',
    BACKUP_HISTORY: '/api/settings/backup/history',
    BACKUP_RESTORE: (id) => `/api/settings/backup/${id}/restore`,
    EXPORT_DATA: '/api/settings/export',
    UPLOAD_DOCUMENT: '/api/settings/upload-document',
    TEST_CONNECTION: (integration) => `/api/settings/test-connection/${integration}`,
    TEST_EMAIL: '/api/settings/test-email',
    TEST_SMS: '/api/settings/test-sms',
  },
};

// Response interceptor for handling common errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          // Try to refresh the token if we haven't already
          if (!originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
              const refreshToken = localStorage.getItem('refreshToken');
              if (refreshToken) {
                const response = await authAPI.post('/api/auth/refresh', {
                  refresh_token: refreshToken
                });
                
                const { access_token } = response.data;
                localStorage.setItem('token', access_token);
                
                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);
              } else {
                // No refresh token available, redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
              }
            } catch (refreshError) {
              // Refresh failed, clear tokens and redirect to login
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
            }
          } else {
            // Already tried to refresh and failed, redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
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
  
  // Download CSV file
  downloadCSV: async (endpoint, filename) => {
    const response = await authAPI.get(endpoint, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  },
  
  // Import CSV file
  importCSV: async (endpoint, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await authAPI.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

export default api;