import axios from 'axios';

// Determine if running in Electron
const isElectron = !!window.electronAPI;

// Get API URL based on environment
const getApiUrl = () => {
  if (isElectron) {
    // For desktop app, use local backend
    return localStorage.getItem('api_url') || 'http://localhost:8000';
  } else {
    // For web app, use environment variable or default
    return process.env.REACT_APP_API_URL || 'http://localhost:8000';
  }
};

// Create axios instance
const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${getApiUrl()}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token } = response.data;
          localStorage.setItem('token', access_token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API Service functions
export const authService = {
  // Login with username and password
  login: async (username, password) => {
    const response = await api.post('/api/auth/login', {
      username,
      password,
    });
    return response.data;
  },
  
  // Login with PIN
  loginWithPin: async (username, pin) => {
    const response = await api.post('/api/auth/staff-login', {
      username,
      pin,
    });
    return response.data;
  },
  
  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
  
  // Verify token
  verifyToken: async () => {
    const response = await api.get('/api/auth/verify');
    return response.data;
  },
  
  // Logout
  logout: async () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  
  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },
  
  // Get users
  getUsers: async () => {
    const response = await api.get('/api/auth/users');
    return response.data;
  },
  
  // Create user
  createUser: async (user) => {
    const response = await api.post('/api/auth/register', user);
    return response.data;
  },
  
  // Update user
  updateUser: async (id, user) => {
    const response = await api.put(`/api/auth/users/${id}`, user);
    return response.data;
  },
  
  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/api/auth/users/${id}`);
    return response.data;
  },
};

export const dashboardService = {
  // Get dashboard stats
  getStats: async () => {
    const response = await api.get('/api/reports/dashboard-stats');
    return response.data;
  },
  
  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    const response = await api.get(`/api/audit/recent?limit=${limit}`);
    return response.data;
  },
};

export const inventoryService = {
  // Get medicines
  getMedicines: async (params = {}) => {
    const response = await api.get('/api/inventory/medicines', { params });
    return response.data;
  },
  
  // Get medicine by ID
  getMedicine: async (id) => {
    const response = await api.get(`/api/inventory/medicines/${id}`);
    return response.data;
  },
  
  // Create medicine
  createMedicine: async (medicine) => {
    const response = await api.post('/api/inventory/medicines', medicine);
    return response.data;
  },
  
  // Update medicine
  updateMedicine: async (id, medicine) => {
    const response = await api.put(`/api/inventory/medicines/${id}`, medicine);
    return response.data;
  },
  
  // Delete medicine
  deleteMedicine: async (id) => {
    const response = await api.delete(`/api/inventory/medicines/${id}`);
    return response.data;
  },
  
  // Get medicine batches
  getBatches: async (medicineId) => {
    const response = await api.get(`/api/inventory/medicines/${medicineId}/batches`);
    return response.data;
  },
  
  // Create batch
  createBatch: async (batch) => {
    const response = await api.post('/api/inventory/batches', batch);
    return response.data;
  },
  
  // Get suppliers
  getSuppliers: async () => {
    const response = await api.get('/api/inventory/suppliers');
    return response.data;
  },
  
  // Create supplier
  createSupplier: async (supplier) => {
    const response = await api.post('/api/inventory/suppliers', supplier);
    return response.data;
  },
  
  // Get low stock medicines
  getLowStockMedicines: async () => {
    const response = await api.get('/api/inventory/low-stock');
    return response.data;
  },
  
  // Get expiring medicines
  getExpiringMedicines: async () => {
    const response = await api.get('/api/inventory/expiring');
    return response.data;
  },
  
  // Import medicines from CSV
  importMedicines: async (formData) => {
    const response = await api.post('/api/inventory/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Export medicines to CSV
  exportMedicines: async () => {
    const response = await api.get('/api/inventory/export', {
      responseType: 'blob',
    });
    return response.data;
  },
};

export const patientService = {
  // Get patients
  getPatients: async (params = {}) => {
    const response = await api.get('/api/patients', { params });
    return response.data;
  },
  
  // Get patient by ID
  getPatient: async (id) => {
    const response = await api.get(`/api/patients/${id}`);
    return response.data;
  },
  
  // Create patient
  createPatient: async (patient) => {
    const response = await api.post('/api/patients', patient);
    return response.data;
  },
  
  // Update patient
  updatePatient: async (id, patient) => {
    const response = await api.put(`/api/patients/${id}`, patient);
    return response.data;
  },
  
  // Delete patient
  deletePatient: async (id) => {
    const response = await api.delete(`/api/patients/${id}`);
    return response.data;
  },
  
  // Search patients
  searchPatients: async (query) => {
    const response = await api.get(`/api/patients/search?q=${query}`);
    return response.data;
  },
};

export const prescriptionService = {
  // Get prescriptions
  getPrescriptions: async (params = {}) => {
    const response = await api.get('/api/prescriptions', { params });
    return response.data;
  },
  
  // Get prescription by ID
  getPrescription: async (id) => {
    const response = await api.get(`/api/prescriptions/${id}`);
    return response.data;
  },
  
  // Create prescription
  createPrescription: async (prescription) => {
    const response = await api.post('/api/prescriptions', prescription);
    return response.data;
  },
  
  // Update prescription
  updatePrescription: async (id, prescription) => {
    const response = await api.put(`/api/prescriptions/${id}`, prescription);
    return response.data;
  },
  
  // Delete prescription
  deletePrescription: async (id) => {
    const response = await api.delete(`/api/prescriptions/${id}`);
    return response.data;
  },
  
  // Get patient prescriptions
  getPatientPrescriptions: async (patientId) => {
    const response = await api.get(`/api/patients/${patientId}/prescriptions`);
    return response.data;
  },
  
  // Validate prescription
  validatePrescription: async (prescription) => {
    const response = await api.post('/api/prescriptions/validate', prescription);
    return response.data;
  },
  
  // Approve prescription
  approvePrescription: async (id) => {
    const response = await api.post(`/api/prescriptions/${id}/approve`);
    return response.data;
  },
  
  // Fill prescription
  fillPrescription: async (id) => {
    const response = await api.post(`/api/prescriptions/${id}/fill`);
    return response.data;
  },
};

export const posService = {
  // Get cart
  getCart: async () => {
    const response = await api.get('/api/pos/cart');
    return response.data;
  },
  
  // Add item to cart
  addToCart: async (item) => {
    const response = await api.post('/api/pos/cart/add', item);
    return response.data;
  },
  
  // Update cart item
  updateCartItem: async (itemId, quantity) => {
    const response = await api.put(`/api/pos/cart/${itemId}`, { quantity });
    return response.data;
  },
  
  // Remove item from cart
  removeFromCart: async (itemId) => {
    const response = await api.delete(`/api/pos/cart/${itemId}`);
    return response.data;
  },
  
  // Clear cart
  clearCart: async () => {
    const response = await api.delete('/api/pos/cart');
    return response.data;
  },
  
  // Create sale
  createSale: async (sale) => {
    const response = await api.post('/api/pos/sale', sale);
    return response.data;
  },
  
  // Get sales
  getSales: async (params = {}) => {
    const response = await api.get('/api/pos/sales', { params });
    return response.data;
  },
  
  // Get sale by ID
  getSale: async (id) => {
    const response = await api.get(`/api/pos/sales/${id}`);
    return response.data;
  },
  
  // Hold bill
  holdBill: async (bill) => {
    const response = await api.post('/api/pos/hold', bill);
    return response.data;
  },
  
  // Get held bills
  getHeldBills: async () => {
    const response = await api.get('/api/pos/held');
    return response.data;
  },
  
  // Retrieve held bill
  retrieveHeldBill: async (id) => {
    const response = await api.post(`/api/pos/held/${id}/retrieve`);
    return response.data;
  },
  
  // Get available medicines for POS
  getAvailableMedicines: async () => {
    const response = await api.get('/api/pos/medicines');
    return response.data;
  },
  
  // Process refund
  processRefund: async (saleId, refundData) => {
    const response = await api.post(`/api/pos/sales/${saleId}/refund`, refundData);
    return response.data;
  },
};

export const reportsService = {
  // Get dashboard data
  getDashboardData: async () => {
    const response = await api.get('/api/reports/dashboard');
    return response.data;
  },
  
  // Get sales report
  getSalesReport: async (params = {}) => {
    const response = await api.get('/api/reports/sales', { params });
    return response.data;
  },
  
  // Get inventory report
  getInventoryReport: async (params = {}) => {
    const response = await api.get('/api/reports/inventory', { params });
    return response.data;
  },
  
  // Get prescription report
  getPrescriptionReport: async (params = {}) => {
    const response = await api.get('/api/reports/prescriptions', { params });
    return response.data;
  },
  
  // Get patients report
  getPatientsReport: async (params = {}) => {
    const response = await api.get('/api/reports/patients', { params });
    return response.data;
  },
  
  // Get financial report
  getFinancialReport: async (params = {}) => {
    const response = await api.get('/api/reports/financial', { params });
    return response.data;
  },
  
  // Get expiry report
  getExpiryReport: async (params = {}) => {
    const response = await api.get('/api/reports/expiry', { params });
    return response.data;
  },
  
  // Export report
  exportReport: async (params = {}) => {
    const response = await api.get('/api/reports/export', { 
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export const settingsService = {
  // Get all settings
  getAllSettings: async () => {
    const response = await api.get('/api/settings');
    return response.data;
  },
  
  // Get organization settings
  getOrganizationSettings: async () => {
    const response = await api.get('/api/settings/organization');
    return response.data;
  },
  
  // Update organization settings
  updateOrganizationSettings: async (settings) => {
    const response = await api.put('/api/settings/organization', settings);
    return response.data;
  },
  
  // Get POS settings
  getPOSSettings: async () => {
    const response = await api.get('/api/settings/pos');
    return response.data;
  },
  
  // Update POS settings
  updatePOSSettings: async (settings) => {
    const response = await api.put('/api/settings/pos', settings);
    return response.data;
  },
  
  // Get inventory settings
  getInventorySettings: async () => {
    const response = await api.get('/api/settings/inventory');
    return response.data;
  },
  
  // Update inventory settings
  updateInventorySettings: async (settings) => {
    const response = await api.put('/api/settings/inventory', settings);
    return response.data;
  },
  
  // Get notification settings
  getNotificationSettings: async () => {
    const response = await api.get('/api/settings/notifications');
    return response.data;
  },
  
  // Update notification settings
  updateNotificationSettings: async (settings) => {
    const response = await api.put('/api/settings/notifications', settings);
    return response.data;
  },
  
  // Get integration settings
  getIntegrationSettings: async () => {
    const response = await api.get('/api/settings/integrations');
    return response.data;
  },
  
  // Update integration settings
  updateIntegrationSettings: async (settings) => {
    const response = await api.put('/api/settings/integrations', settings);
    return response.data;
  },
  
  // Get security settings
  getSecuritySettings: async () => {
    const response = await api.get('/api/settings/security');
    return response.data;
  },
  
  // Update security settings
  updateSecuritySettings: async (settings) => {
    const response = await api.put('/api/settings/security', settings);
    return response.data;
  },
  
  // Get backup settings
  getBackupSettings: async () => {
    const response = await api.get('/api/settings/backup');
    return response.data;
  },
  
  // Update backup settings
  updateBackupSettings: async (settings) => {
    const response = await api.put('/api/settings/backup', settings);
    return response.data;
  },
  
  // Get theme settings
  getThemeSettings: async () => {
    const response = await api.get('/api/settings/theme');
    return response.data;
  },
  
  // Update theme settings
  updateThemeSettings: async (settings) => {
    const response = await api.put('/api/settings/theme', settings);
    return response.data;
  },
  
  // Create backup
  createBackup: async () => {
    const response = await api.post('/api/settings/backup/create');
    return response.data;
  },
  
  // Restore backup
  restoreBackup: async (formData) => {
    const response = await api.post('/api/settings/backup/restore', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const notificationService = {
  // Get notifications
  getNotifications: async () => {
    const response = await api.get('/api/notifications');
    return response.data;
  },
  
  // Mark notification as read
  markAsRead: async (id) => {
    const response = await api.put(`/api/notifications/${id}/read`);
    return response.data;
  },
  
  // Delete notification
  deleteNotification: async (id) => {
    const response = await api.delete(`/api/notifications/${id}`);
    return response.data;
  },
  
  // Send notification
  sendNotification: async (notification) => {
    const response = await api.post('/api/notifications', notification);
    return response.data;
  },
};

// export const tenantService = {
//   // Get tenants (for super admin)
//   getTenants: async () => {
//     const response = await api.get('/api/tenants');
//     return response.data;
//   },
  
//   // Create tenant
//   createTenant: async (tenant) => {
//     const response = await api.post('/api/tenants', tenant);
//     return response.data;
//   },
  
//   // Get current tenant info
//   getCurrentTenant: async () => {
//     const response = await api.get('/api/tenants/current');
//     return response.data;
//   },
  
//   // Update tenant
//   updateTenant: async (id, tenant) => {
//     const response = await api.put(`/api/tenants/${id}`, tenant);
//     return response.data;
//   },
// };

export const billingService = {
  // Get invoices
  getInvoices: async (params = {}) => {
    const response = await api.get('/api/billing/invoices', { params });
    return response.data;
  },
  
  // Get invoice by ID
  getInvoice: async (id) => {
    const response = await api.get(`/api/billing/invoices/${id}`);
    return response.data;
  },
  
  // Create invoice
  createInvoice: async (invoice) => {
    const response = await api.post('/api/billing/invoices', invoice);
    return response.data;
  },
  
  // Update invoice
  updateInvoice: async (id, invoice) => {
    const response = await api.put(`/api/billing/invoices/${id}`, invoice);
    return response.data;
  },
  
  // Delete invoice
  deleteInvoice: async (id) => {
    const response = await api.delete(`/api/billing/invoices/${id}`);
    return response.data;
  },
  
  // Process payment
  processPayment: async (invoiceId, paymentData) => {
    const response = await api.post(`/api/billing/invoices/${invoiceId}/pay`, paymentData);
    return response.data;
  },
  
  // Download invoice
  downloadInvoice: async (id) => {
    const response = await api.get(`/api/billing/invoices/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  // Get payments
  getPayments: async (params = {}) => {
    const response = await api.get('/api/billing/payments', { params });
    return response.data;
  },
  
  // Create payment
  createPayment: async (payment) => {
    const response = await api.post('/api/billing/payments', payment);
    return response.data;
  },
  
  // Get payment by ID
  getPayment: async (id) => {
    const response = await api.get(`/api/billing/payments/${id}`);
    return response.data;
  },
};

export const reportService = {
  // Get sales report (legacy)
  getSalesReport: async (params = {}) => {
    const response = await api.get('/api/reports/sales', { params });
    return response.data;
  },
  
  // Get inventory report (legacy)
  getInventoryReport: async (params = {}) => {
    const response = await api.get('/api/reports/inventory', { params });
    return response.data;
  },
  
  // Get financial report (legacy)
  getFinancialReport: async (params = {}) => {
    const response = await api.get('/api/reports/financial', { params });
    return response.data;
  },
  
  // Get patient report (legacy)
  getPatientReport: async (params = {}) => {
    const response = await api.get('/api/reports/patients', { params });
    return response.data;
  },
  
  // Export report (legacy)
  exportReport: async (params = {}) => {
    const response = await api.get(`/api/reports/${params.type}/export`, { 
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export const supportService = {
  // Get tickets
  getTickets: async (params = {}) => {
    const response = await api.get('/api/support/tickets', { params });
    return response.data;
  },
  
  // Get ticket by ID
  getTicket: async (id) => {
    const response = await api.get(`/api/support/tickets/${id}`);
    return response.data;
  },
  
  // Create ticket
  createTicket: async (ticket) => {
    const response = await api.post('/api/support/tickets', ticket);
    return response.data;
  },
  
  // Update ticket
  updateTicket: async (id, ticket) => {
    const response = await api.put(`/api/support/tickets/${id}`, ticket);
    return response.data;
  },
  
  // Delete ticket
  deleteTicket: async (id) => {
    const response = await api.delete(`/api/support/tickets/${id}`);
    return response.data;
  },
  
  // Get knowledge base articles
  getKnowledgeBase: async () => {
    const response = await api.get('/api/support/knowledge-base');
    return response.data;
  },
  
  // Get knowledge base article by ID
  getArticle: async (id) => {
    const response = await api.get(`/api/support/knowledge-base/${id}`);
    return response.data;
  },
  
  // Search knowledge base
  searchKnowledgeBase: async (query) => {
    const response = await api.get(`/api/support/knowledge-base/search?q=${query}`);
    return response.data;
  },
  
  // Get support contacts
  getSupportContacts: async () => {
    const response = await api.get('/api/support/contacts');
    return response.data;
  },
};

export default api;