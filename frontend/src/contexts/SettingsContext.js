import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { api, endpoints } from '../services/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  organization: {
    storeName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    taxNumber: '',
    gstNumber: '',
    hsnCodeDefault: '',
    currency: 'USD',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
    invoiceNumberFormat: 'INV-{YYYY}-{MM}-{SEQ}',
    invoicePrefix: 'INV',
    prescriptionNumberFormat: 'PRX-{YYYY}-{MM}-{SEQ}',
    prescriptionPrefix: 'PRX',
  },
  pos: {
    paymentMethods: {
      cash: { enabled: true, name: 'Cash' },
      card: { enabled: true, name: 'Card' },
      upi: { enabled: false, name: 'UPI' },
      wallet: { enabled: false, name: 'Wallet' },
      insurance: { enabled: false, name: 'Insurance' },
    },
    barcodeScanning: {
      enabled: true,
      autoAddToCart: true,
      scannerType: 'usb',
      soundEnabled: true,
    },
    receipt: {
      printAutomatically: true,
      showCustomerDetails: true,
      showItemDetails: true,
      showPaymentDetails: true,
      showBarcode: false,
      showQrCode: false,
      headerText: 'Thank you for visiting!',
      footerText: 'Please come again!',
      logoSize: 'medium',
      fontSize: 'normal',
      currency: 'USD',
    },
    discount: {
      enabled: true,
      maxDiscountPercentage: 20,
      requireManagerApproval: true,
      approvalThreshold: 10,
      defaultDiscountReason: 'Special Discount',
    },
    terminal: {
      terminalId: 'POS-01',
      counterName: 'Main Counter',
      cashDrawer: { enabled: true, autoOpen: true },
      display: { showCustomerDisplay: true, customerDisplayType: 'lcd' },
    },
  },
  theme: {
    themeMode: 'light',
    colorScheme: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    branding: {
      logo: '',
      favicon: '',
      companyName: 'Pharmacy Management System',
      tagline: 'Your trusted pharmacy partner',
      showLogoInHeader: true,
      showLogoInLogin: true,
      showLogoInReports: true,
    },
    ui: {
      compactMode: false,
      showSidebarIcons: true,
      showSidebarLabels: true,
      sidebarCollapsed: false,
      showBreadcrumbs: true,
      showPageTitles: true,
      showFooter: true,
      animationsEnabled: true,
    },
    print: {
      header: true,
      footer: true,
      logo: true,
      companyName: true,
      date: true,
      pageNumber: true,
      fontSize: 'normal',
      margins: 'normal',
    },
  },
  inventory: {
    reorder: {
      defaultReorderLevel: 20,
      defaultReorderQuantity: 100,
      enableAutoReorder: false,
      autoReorderSuppliers: [],
    },
    expiry: {
      enabled: true,
      alertDaysBefore: 30,
      criticalAlertDaysBefore: 7,
      dailyAlerts: true,
      weeklyAlerts: true,
      alertEmails: ['manager@pharmacy.com'],
    },
    lowStock: {
      enabled: true,
      alertThreshold: 10,
      criticalThreshold: 5,
      dailyAlerts: true,
      weeklyAlerts: true,
      alertEmails: ['manager@pharmacy.com'],
    },
    alternatives: {
      enabled: true,
      autoSuggestAlternatives: true,
      requirePharmacistApproval: true,
      mappingRules: [
        { condition: 'out_of_stock', action: 'suggest_alternatives' },
        { condition: 'higher_price', action: 'suggest_cheaper' },
        { condition: 'same_generic', action: 'suggest_generic' },
      ],
    },
    batchPricing: {
      enabled: false,
      allowDifferentPrices: true,
      defaultPricingMethod: 'fifo',
      priceChangeApproval: true,
    },
    stockMovement: {
      trackAllMovements: true,
      requireReasonForAdjustments: true,
      autoLogSales: true,
      autoLogPurchases: true,
      adjustmentReasons: [
        'Damage', 'Theft', 'Expired', 'Return', 'Correction', 'Transfer',
      ],
    },
  },
  notifications: {
    email: {
      enabled: true,
      smtpServer: '',
      smtpPort: 587,
      username: '',
      password: '',
      useSSL: true,
      senderEmail: 'noreply@pharmacy.com',
      senderName: 'Pharmacy System',
    },
    sms: {
      enabled: false,
      provider: 'twilio',
      apiKey: '',
      apiSecret: '',
      senderId: 'PHARM',
    },
    whatsapp: {
      enabled: false,
      apiKey: '',
      phoneNumber: '',
      businessId: '',
    },
    notifications: {
      lowStock: { email: true, sms: false, whatsapp: false },
      expiryAlert: { email: true, sms: false, whatsapp: false },
      newOrder: { email: true, sms: false, whatsapp: false },
      paymentReceived: { email: true, sms: false, whatsapp: false },
      prescriptionReady: { email: true, sms: true, whatsapp: false },
      appointmentReminder: { email: true, sms: true, whatsapp: false },
      systemUpdates: { email: true, sms: false, whatsapp: false },
    },
    templates: {
      lowStockEmail: {
        subject: 'Low Stock Alert: {medicine_name}',
        body: 'Dear {recipient_name},\n\nThis is to inform you that the following medicine is running low on stock:\n\nMedicine: {medicine_name}\nCurrent Stock: {current_stock}\nReorder Level: {reorder_level}\n\nPlease take appropriate action.\n\nThank you,\nPharmacy Management System',
      },
      expiryAlertEmail: {
        subject: 'Expiry Alert: {medicine_name}',
        body: 'Dear {recipient_name},\n\nThis is to inform you that the following medicine is expiring soon:\n\nMedicine: {medicine_name}\nBatch: {batch_number}\nExpiry Date: {expiry_date}\nDays Until Expiry: {days_until_expiry}\n\nPlease take appropriate action.\n\nThank you,\nPharmacy Management System',
      },
      prescriptionReadySMS: {
        message: 'Dear {patient_name}, your prescription is ready for pickup. Order ID: {order_id}. Thank you!',
      },
      appointmentReminderSMS: {
        message: 'Dear {patient_name}, this is a reminder for your appointment on {appointment_date} at {appointment_time}. Thank you!',
      },
    },
  },
  integrations: {
    paymentGateway: {
      enabled: false,
      provider: 'stripe',
      apiKey: '',
      apiSecret: '',
      webhookSecret: '',
      testMode: true,
    },
    eprescription: {
      enabled: false,
      provider: 'default',
      apiKey: '',
      apiEndpoint: '',
      autoImport: false,
    },
    accounting: {
      enabled: false,
      provider: 'none',
      apiKey: '',
      apiSecret: '',
      companyCode: '',
      syncFrequency: 'daily',
      autoSync: false,
    },
    insurance: {
      enabled: false,
      providers: [
        {
          name: 'Provider A',
          apiKey: '',
          apiEndpoint: '',
          enabled: false,
        },
        {
          name: 'Provider B',
          apiKey: '',
          apiEndpoint: '',
          enabled: false,
        },
      ],
    },
    cloudStorage: {
      enabled: false,
      provider: 'aws',
      accessKey: '',
      secretKey: '',
      bucket: '',
      region: 'us-east-1',
      backupFrequency: 'daily',
    },
    laboratory: {
      enabled: false,
      provider: 'default',
      apiKey: '',
      apiEndpoint: '',
      autoImportResults: false,
    },
    supplierPortal: {
      enabled: false,
      allowOrders: true,
      allowInvoices: true,
      allowInventoryUpdates: false,
    },
  },
  compliance: {
    regulatory: {
      scheduleH: {
        enabled: true,
        requirePrescription: true,
        recordKeeping: true,
        maxSaleQuantity: 30,
        maxDaysSupply: 30,
      },
      scheduleX: {
        enabled: true,
        requirePrescription: true,
        recordKeeping: true,
        maxSaleQuantity: 7,
        maxDaysSupply: 7,
        specialStorage: true,
      },
      ndps: {
        enabled: true,
        requirePrescription: true,
        recordKeeping: true,
        maxSaleQuantity: 14,
        maxDaysSupply: 14,
        specialStorage: true,
      },
    },
    licenses: {
      pharmacyLicense: {
        number: '',
        issuedDate: '',
        expiryDate: '',
        issuingAuthority: '',
        reminderDays: 90,
        documentUrl: '',
      },
      drugLicense: {
        number: '',
        issuedDate: '',
        expiryDate: '',
        issuingAuthority: '',
        reminderDays: 90,
        documentUrl: '',
      },
      gstRegistration: {
        number: '',
        issuedDate: '',
        expiryDate: '',
        issuingAuthority: '',
        reminderDays: 90,
        documentUrl: '',
      },
    },
    audit: {
      enabled: true,
      logLevel: 'info',
      retentionPeriod: 365,
      includeSensitiveData: false,
      emailReports: true,
      reportFrequency: 'monthly',
      reportRecipients: ['manager@pharmacy.com'],
    },
    privacy: {
      gdprCompliant: false,
      dataEncryption: true,
      anonymizePatientData: true,
      consentManagement: true,
      dataRetentionPeriod: 2555,
      autoDeleteExpiredData: false,
    },
    prescription: {
      requireDoctorSignature: true,
      requirePatientConsent: true,
      validateDrugInteractions: true,
      validateAllergies: true,
      validateDosage: true,
      maxRefills: 3,
      refillPeriodDays: 30,
    },
    reporting: {
      generateMonthlyReports: true,
      generateQuarterlyReports: true,
      generateAnnualReports: true,
      reportToAuthorities: false,
      authorityEmail: '',
      includeScheduleDrugs: true,
      includeExpiryData: true,
    },
  },
  backup: {
    automaticBackup: {
      enabled: true,
      frequency: 'daily',
      time: '02:00',
      retentionDays: 30,
      compression: true,
      encryption: true,
    },
    cloudBackup: {
      enabled: false,
      provider: 'aws',
      accessKey: '',
      secretKey: '',
      bucket: '',
      region: 'us-east-1',
      encryption: true,
    },
    localBackup: {
      enabled: true,
      path: '/backups',
      retentionDays: 7,
      compression: true,
    },
    dataExport: {
      formats: ['csv', 'json', 'xml'],
      includeSensitiveData: false,
      includeImages: false,
      dateRange: 'last_month',
      customDateRange: {
        startDate: '',
        endDate: '',
      },
    },
    dataImport: {
      allowImport: true,
      validateBeforeImport: true,
      backupBeforeImport: true,
      mergeStrategy: 'replace',
    },
    dataPrivacy: {
      anonymizePersonalData: true,
      retainPatientData: true,
      patientDataRetentionYears: 7,
      autoDeleteExpiredData: false,
      consentManagement: true,
    },
  },
  users: {
    roles: [
      { id: 1, name: 'admin', description: 'Full system access' },
      { id: 2, name: 'pharmacist', description: 'Can manage prescriptions and inventory' },
      { id: 3, name: 'cashier', description: 'Can process sales and manage billing' },
      { id: 4, name: 'accountant', description: 'Can access financial reports' },
    ],
    permissions: [
      { id: 1, name: 'view_dashboard', description: 'View Dashboard', category: 'General' },
      { id: 2, name: 'view_patients', description: 'View Patients', category: 'Patients' },
      { id: 3, name: 'add_patients', description: 'Add Patients', category: 'Patients' },
      { id: 4, name: 'edit_patients', description: 'Edit Patients', category: 'Patients' },
      { id: 5, name: 'delete_patients', description: 'Delete Patients', category: 'Patients' },
      { id: 6, name: 'view_inventory', description: 'View Inventory', category: 'Inventory' },
      { id: 7, name: 'add_medicines', description: 'Add Medicines', category: 'Inventory' },
      { id: 8, name: 'edit_medicines', description: 'Edit Medicines', category: 'Inventory' },
      { id: 9, name: 'delete_medicines', description: 'Delete Medicines', category: 'Inventory' },
      { id: 10, name: 'view_prescriptions', description: 'View Prescriptions', category: 'Prescriptions' },
      { id: 11, name: 'create_prescriptions', description: 'Create Prescriptions', category: 'Prescriptions' },
      { id: 12, name: 'view_billing', description: 'View Billing', category: 'Billing' },
      { id: 13, name: 'create_invoices', description: 'Create Invoices', category: 'Billing' },
      { id: 14, name: 'process_payments', description: 'Process Payments', category: 'Billing' },
      { id: 15, name: 'view_reports', description: 'View Reports', category: 'Reports' },
      { id: 16, name: 'manage_users', description: 'Manage Users', category: 'Admin' },
      { id: 17, name: 'manage_settings', description: 'Manage Settings', category: 'Admin' },
    ],
  },
  isLoading: false,
  error: null,
};

// Action types
const SETTINGS_ACTIONS = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  UPDATE_ORGANIZATION_SETTINGS: 'UPDATE_ORGANIZATION_SETTINGS',
  UPDATE_POS_SETTINGS: 'UPDATE_POS_SETTINGS',
  UPDATE_THEME_SETTINGS: 'UPDATE_THEME_SETTINGS',
  UPDATE_USER_ROLES_SETTINGS: 'UPDATE_USER_ROLES_SETTINGS',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
};

// Reducer
const settingsReducer = (state, action) => {
  switch (action.type) {
    case SETTINGS_ACTIONS.FETCH_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case SETTINGS_ACTIONS.FETCH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        ...action.payload,
        error: null,
      };
    case SETTINGS_ACTIONS.FETCH_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case SETTINGS_ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        [action.category]: {
          ...state[action.category],
          ...action.payload,
        },
      };
    case SETTINGS_ACTIONS.UPDATE_ORGANIZATION_SETTINGS:
      return {
        ...state,
        organization: {
          ...state.organization,
          ...action.payload,
        },
        // Update related theme settings when store name changes
        theme: {
          ...state.theme,
          branding: {
            ...state.theme.branding,
            companyName: action.payload.storeName || state.theme.branding.companyName,
            logo: action.payload.logo || state.theme.branding.logo,
          },
        },
      };
    case SETTINGS_ACTIONS.UPDATE_POS_SETTINGS:
      return {
        ...state,
        pos: {
          ...state.pos,
          ...action.payload,
        },
      };
    case SETTINGS_ACTIONS.UPDATE_THEME_SETTINGS:
      return {
        ...state,
        theme: {
          ...state.theme,
          ...action.payload,
        },
      };
    case SETTINGS_ACTIONS.UPDATE_USER_ROLES_SETTINGS:
      return {
        ...state,
        users: {
          ...state.users,
          ...action.payload,
        },
      };
    case SETTINGS_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const SettingsContext = createContext();

// Provider component
export const SettingsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  // Fetch settings from API
  const fetchSettings = async (category = null) => {
    dispatch({ type: SETTINGS_ACTIONS.FETCH_START });
    
    try {
      if (category) {
        // Fetch specific category
        const endpoint = {
          organization: endpoints.SETTINGS.ORGANIZATION,
          pos: endpoints.SETTINGS.POS,
          theme: endpoints.SETTINGS.THEME,
          inventory: endpoints.SETTINGS.INVENTORY,
          notifications: endpoints.SETTINGS.NOTIFICATIONS,
          integrations: endpoints.SETTINGS.INTEGRATIONS,
          compliance: endpoints.SETTINGS.COMPLIANCE,
          backup: endpoints.SETTINGS.BACKUP,
          users: endpoints.SETTINGS.USERS,
        }[category];
        
        if (!endpoint) {
          throw new Error(`Unknown settings category: ${category}`);
        }
        
        const response = await api.get(endpoint);
        dispatch({
          type: SETTINGS_ACTIONS.FETCH_SUCCESS,
          payload: { [category]: response.data },
        });
      } else {
        // Fetch all settings categories
        const [organization, pos, theme, inventory, notifications, integrations, compliance, backup, users] = await Promise.all([
          api.get(endpoints.SETTINGS.ORGANIZATION),
          api.get(endpoints.SETTINGS.POS),
          api.get(endpoints.SETTINGS.THEME),
          api.get(endpoints.SETTINGS.INVENTORY),
          api.get(endpoints.SETTINGS.NOTIFICATIONS),
          api.get(endpoints.SETTINGS.INTEGRATIONS),
          api.get(endpoints.SETTINGS.COMPLIANCE),
          api.get(endpoints.SETTINGS.BACKUP),
          api.get(endpoints.SETTINGS.USERS),
        ]);
        
        dispatch({
          type: SETTINGS_ACTIONS.FETCH_SUCCESS,
          payload: {
            organization: organization.data,
            pos: pos.data,
            theme: theme.data,
            inventory: inventory.data,
            notifications: notifications.data,
            integrations: integrations.data,
            compliance: compliance.data,
            backup: backup.data,
            users: users.data,
          },
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch settings';
      dispatch({
        type: SETTINGS_ACTIONS.FETCH_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      console.error(`Error fetching ${category || 'all'} settings:`, error);
    }
  };

  // Update settings
  const updateSettings = async (category, settingsData) => {
    dispatch({ type: SETTINGS_ACTIONS.FETCH_START });
    
    try {
      const endpoint = {
        organization: endpoints.SETTINGS.ORGANIZATION,
        pos: endpoints.SETTINGS.POS,
        theme: endpoints.SETTINGS.THEME,
        inventory: endpoints.SETTINGS.INVENTORY,
        notifications: endpoints.SETTINGS.NOTIFICATIONS,
        integrations: endpoints.SETTINGS.INTEGRATIONS,
        compliance: endpoints.SETTINGS.COMPLIANCE,
        backup: endpoints.SETTINGS.BACKUP,
        users: endpoints.SETTINGS.USERS,
      }[category];
      
      if (!endpoint) {
        throw new Error(`Unknown settings category: ${category}`);
      }
      
      await api.put(endpoint, settingsData);
      
      // Update local state
      const actionType = {
        organization: SETTINGS_ACTIONS.UPDATE_ORGANIZATION_SETTINGS,
        pos: SETTINGS_ACTIONS.UPDATE_POS_SETTINGS,
        theme: SETTINGS_ACTIONS.UPDATE_THEME_SETTINGS,
        users: SETTINGS_ACTIONS.UPDATE_USER_ROLES_SETTINGS,
      }[category];
      
      if (actionType) {
        dispatch({
          type: actionType,
          payload: settingsData,
        });
      } else {
        // For other categories, use generic update
        dispatch({
          type: SETTINGS_ACTIONS.UPDATE_SETTINGS,
          category,
          payload: settingsData,
        });
      }
      
      toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} settings updated successfully`);
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to update settings';
      dispatch({
        type: SETTINGS_ACTIONS.FETCH_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      console.error(`Error updating ${category} settings:`, error);
      return false;
    }
  };

  // Update organization settings specifically
  const updateOrganizationSettings = async (settingsData) => {
    const success = await updateSettings('organization', settingsData);
    
    // If organization settings were successfully updated and contain store name or logo,
    // also update the related theme settings
    if (success && (settingsData.storeName || settingsData.logo)) {
      const themeUpdates = {};
      if (settingsData.storeName) {
        themeUpdates.companyName = settingsData.storeName;
      }
      if (settingsData.logo) {
        themeUpdates.logo = settingsData.logo;
      }
      
      // Update theme branding settings
      await updateThemeSettings({
        ...state.theme,
        branding: {
          ...state.theme.branding,
          ...themeUpdates
        }
      });
    }
    
    // If currency was updated, also update POS settings
    if (success && settingsData.currency) {
      await updatePOSSettings({
        ...state.pos,
        receipt: {
          ...state.pos.receipt,
          currency: settingsData.currency
        }
      });
      
      // Trigger a custom event to notify components that currency has changed
      window.dispatchEvent(new CustomEvent('currencyChanged', {
        detail: { currency: settingsData.currency }
      }));
    }
    
    return success;
  };

  // Update POS settings specifically
  const updatePOSSettings = async (settingsData) => {
    return await updateSettings('pos', settingsData);
  };

  // Update theme settings specifically
  const updateThemeSettings = async (settingsData) => {
    return await updateSettings('theme', settingsData);
  };

  // Update inventory settings specifically
  const updateInventorySettings = async (settingsData) => {
    return await updateSettings('inventory', settingsData);
  };

  // Update notification settings specifically
  const updateNotificationSettings = async (settingsData) => {
    return await updateSettings('notifications', settingsData);
  };

  // Update integration settings specifically
  const updateIntegrationSettings = async (settingsData) => {
    return await updateSettings('integrations', settingsData);
  };

  // Update compliance settings specifically
  const updateComplianceSettings = async (settingsData) => {
    return await updateSettings('compliance', settingsData);
  };

  // Update backup settings specifically
  const updateBackupSettings = async (settingsData) => {
    return await updateSettings('backup', settingsData);
  };

  // Update user roles settings specifically
  const updateUserRolesSettings = async (settingsData) => {
    return await updateSettings('users', settingsData);
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: SETTINGS_ACTIONS.CLEAR_ERRORS });
  };

  // Initialize settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const value = {
    ...state,
    fetchSettings,
    updateSettings,
    updateOrganizationSettings,
    updatePOSSettings,
    updateThemeSettings,
    updateInventorySettings,
    updateNotificationSettings,
    updateIntegrationSettings,
    updateComplianceSettings,
    updateBackupSettings,
    updateUserRolesSettings,
    clearErrors,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;