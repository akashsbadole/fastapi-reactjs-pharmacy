import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Grid,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Paper,
  InputAdornment,
  Avatar
} from '@mui/material';
import {
  Save as SaveIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  PointOfSale as POSIcon,
  Inventory as InventoryIcon,
  Notifications as NotificationsIcon,
  Integration as IntegrationIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Palette as PaletteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { settingsService, authService } from '../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Settings() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showPassword, setShowPassword] = useState(false);
  
  // Organization settings
  const [organizationSettings, setOrganizationSettings] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    tax_number: '',
    license_number: '',
    logo: '',
    currency: 'USD',
    timezone: 'UTC',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    invoice_prefix: 'INV',
    prescription_prefix: 'PR'
  });
  
  // User & Roles settings
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'CASHIER',
    is_active: true
  });
  
  // POS settings
  const [posSettings, setPosSettings] = useState({
    default_payment_method: 'CASH',
    enable_barcode_scanning: true,
    auto_print_receipt: true,
    receipt_header: '',
    receipt_footer: '',
    default_discount: 0,
    tax_rate: 8,
    allow_negative_stock: false,
    show_customer_details: true
  });
  
  // Inventory settings
  const [inventorySettings, setInventorySettings] = useState({
    reorder_level: 10,
    expiry_alert_days: 30,
    low_stock_alert: true,
    expiry_alert: true,
    auto_batch_creation: false,
    track_serial_numbers: false,
    default_supplier: '',
    storage_conditions: false
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    low_stock_email: true,
    expiry_email: true,
    prescription_email: true,
    email_gateway: '',
    sms_gateway: '',
    email_templates: {
      low_stock: '',
      expiry: '',
      prescription: ''
    }
  });
  
  // Integration settings
  const [integrationSettings, setIntegrationSettings] = useState({
    accounting_software: '',
    payment_gateway: '',
    insurance_provider: '',
    e_prescription: '',
    api_keys: {}
  });
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    password_min_length: 8,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_special_chars: true,
    session_timeout: 30,
    two_factor_auth: false,
    audit_logging: true
  });
  
  // Backup settings
  const [backupSettings, setBackupSettings] = useState({
    auto_backup: true,
    backup_frequency: 'daily',
    backup_location: 'local',
    cloud_backup: false,
    cloud_provider: '',
    retention_days: 30
  });
  
  // Theme settings
  const [themeSettings, setThemeSettings] = useState({
    theme_mode: 'light',
    primary_color: '#1976d2',
    secondary_color: '#dc004e',
    font_size: 'medium',
    compact_mode: false
  });

  useEffect(() => {
    fetchAllSettings();
    fetchUsers();
    
    // Set up network status monitoring
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    if (window.electronAPI) {
      window.electronAPI.onOnline(handleOnline);
      window.electronAPI.onOffline(handleOffline);
    } else {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
    
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('online');
        window.electronAPI.removeAllListeners('offline');
      } else {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  const fetchAllSettings = async () => {
    try {
      if (!isOnline) {
        // Load cached settings if offline
        const cachedSettings = localStorage.getItem('app_settings');
        if (cachedSettings) {
          const settings = JSON.parse(cachedSettings);
          setOrganizationSettings(settings.organization || organizationSettings);
          setPosSettings(settings.pos || posSettings);
          setInventorySettings(settings.inventory || inventorySettings);
          setNotificationSettings(settings.notifications || notificationSettings);
          setIntegrationSettings(settings.integrations || integrationSettings);
          setSecuritySettings(settings.security || securitySettings);
          setBackupSettings(settings.backup || backupSettings);
          setThemeSettings(settings.theme || themeSettings);
        }
        return;
      }
      
      const settings = await settingsService.getAllSettings();
      
      setOrganizationSettings(settings.organization || organizationSettings);
      setPosSettings(settings.pos || posSettings);
      setInventorySettings(settings.inventory || inventorySettings);
      setNotificationSettings(settings.notifications || notificationSettings);
      setIntegrationSettings(settings.integrations || integrationSettings);
      setSecuritySettings(settings.security || securitySettings);
      setBackupSettings(settings.backup || backupSettings);
      setThemeSettings(settings.theme || themeSettings);
      
      // Cache settings
      localStorage.setItem('app_settings', JSON.stringify(settings));
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    }
  };

  const fetchUsers = async () => {
    try {
      if (!isOnline) return;
      
      const data = await authService.getUsers();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSaveOrganizationSettings = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot save settings while offline');
        setLoading(false);
        return;
      }
      
      await settingsService.updateOrganizationSettings(organizationSettings);
      setSuccess('Organization settings saved successfully');
    } catch (err) {
      console.error('Error saving organization settings:', err);
      setError('Failed to save organization settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePOSSettings = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot save settings while offline');
        setLoading(false);
        return;
      }
      
      await settingsService.updatePOSSettings(posSettings);
      setSuccess('POS settings saved successfully');
    } catch (err) {
      console.error('Error saving POS settings:', err);
      setError('Failed to save POS settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInventorySettings = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot save settings while offline');
        setLoading(false);
        return;
      }
      
      await settingsService.updateInventorySettings(inventorySettings);
      setSuccess('Inventory settings saved successfully');
    } catch (err) {
      console.error('Error saving inventory settings:', err);
      setError('Failed to save inventory settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot save settings while offline');
        setLoading(false);
        return;
      }
      
      await settingsService.updateNotificationSettings(notificationSettings);
      setSuccess('Notification settings saved successfully');
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setError('Failed to save notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIntegrationSettings = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot save settings while offline');
        setLoading(false);
        return;
      }
      
      await settingsService.updateIntegrationSettings(integrationSettings);
      setSuccess('Integration settings saved successfully');
    } catch (err) {
      console.error('Error saving integration settings:', err);
      setError('Failed to save integration settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecuritySettings = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot save settings while offline');
        setLoading(false);
        return;
      }
      
      await settingsService.updateSecuritySettings(securitySettings);
      setSuccess('Security settings saved successfully');
    } catch (err) {
      console.error('Error saving security settings:', err);
      setError('Failed to save security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBackupSettings = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot save settings while offline');
        setLoading(false);
        return;
      }
      
      await settingsService.updateBackupSettings(backupSettings);
      setSuccess('Backup settings saved successfully');
    } catch (err) {
      console.error('Error saving backup settings:', err);
      setError('Failed to save backup settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveThemeSettings = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        // Apply theme locally if offline
        if (window.electronAPI) {
          window.electronAPI.setTheme(themeSettings);
        }
        localStorage.setItem('theme_settings', JSON.stringify(themeSettings));
        setSuccess('Theme settings applied locally');
        setLoading(false);
        return;
      }
      
      await settingsService.updateThemeSettings(themeSettings);
      
      // Apply theme
      if (window.electronAPI) {
        window.electronAPI.setTheme(themeSettings);
      }
      
      setSuccess('Theme settings saved successfully');
    } catch (err) {
      console.error('Error saving theme settings:', err);
      setError('Failed to save theme settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot create user while offline');
        setLoading(false);
        return;
      }
      
      await authService.createUser(userForm);
      setSuccess('User created successfully');
      setUserDialogOpen(false);
      setUserForm({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'CASHIER',
        is_active: true
      });
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot update user while offline');
        setLoading(false);
        return;
      }
      
      await authService.updateUser(editingUser.id, userForm);
      setSuccess('User updated successfully');
      setUserDialogOpen(false);
      setEditingUser(null);
      setUserForm({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'CASHIER',
        is_active: true
      });
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot delete user while offline');
        setLoading(false);
        return;
      }
      
      await authService.deleteUser(userId);
      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active
    });
    setUserDialogOpen(true);
  };

  const handleBackupNow = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot create backup while offline');
        setLoading(false);
        return;
      }
      
      await settingsService.createBackup();
      setSuccess('Backup created successfully');
    } catch (err) {
      console.error('Error creating backup:', err);
      setError('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot restore backup while offline');
        setLoading(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('backup_file', file);
      
      await settingsService.restoreBackup(formData);
      setSuccess('Backup restored successfully');
      fetchAllSettings();
    } catch (err) {
      console.error('Error restoring backup:', err);
      setError('Failed to restore backup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Settings
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchAllSettings}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      
      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You are currently offline. Settings will be saved locally.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<BusinessIcon />} label="Organization" />
          <Tab icon={<PeopleIcon />} label="Users & Roles" />
          <Tab icon={<POSIcon />} label="POS" />
          <Tab icon={<InventoryIcon />} label="Inventory" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<IntegrationIcon />} label="Integrations" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<BackupIcon />} label="Backup" />
          <Tab icon={<PaletteIcon />} label="Theme" />
        </Tabs>
      </Box>
      
      {/* Organization Settings */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Organization Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pharmacy Name"
                  value={organizationSettings.name}
                  onChange={(e) => setOrganizationSettings({...organizationSettings, name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={organizationSettings.phone}
                  onChange={(e) => setOrganizationSettings({...organizationSettings, phone: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={organizationSettings.email}
                  onChange={(e) => setOrganizationSettings({...organizationSettings, email: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={organizationSettings.website}
                  onChange={(e) => setOrganizationSettings({...organizationSettings, website: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={organizationSettings.address}
                  onChange={(e) => setOrganizationSettings({...organizationSettings, address: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax Number"
                  value={organizationSettings.tax_number}
                  onChange={(e) => setOrganizationSettings({...organizationSettings, tax_number: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="License Number"
                  value={organizationSettings.license_number}
                  onChange={(e) => setOrganizationSettings({...organizationSettings, license_number: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={organizationSettings.currency}
                    onChange={(e) => setOrganizationSettings({...organizationSettings, currency: e.target.value})}
                    label="Currency"
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                    <MenuItem value="INR">INR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={organizationSettings.timezone}
                    onChange={(e) => setOrganizationSettings({...organizationSettings, timezone: e.target.value})}
                    label="Timezone"
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="EST">EST</MenuItem>
                    <MenuItem value="PST">PST</MenuItem>
                    <MenuItem value="IST">IST</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={organizationSettings.date_format}
                    onChange={(e) => setOrganizationSettings({...organizationSettings, date_format: e.target.value})}
                    label="Date Format"
                  >
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Time Format</InputLabel>
                  <Select
                    value={organizationSettings.time_format}
                    onChange={(e) => setOrganizationSettings({...organizationSettings, time_format: e.target.value})}
                    label="Time Format"
                  >
                    <MenuItem value="12h">12-hour</MenuItem>
                    <MenuItem value="24h">24-hour</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box mt={3}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveOrganizationSettings}
                disabled={loading}
              >
                Save Organization Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Users & Roles Settings */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Users & Roles
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingUser(null);
                  setUserForm({
                    username: '',
                    email: '',
                    first_name: '',
                    last_name: '',
                    phone: '',
                    role: 'CASHIER',
                    is_active: true
                  });
                  setUserDialogOpen(true);
                }}
                disabled={!isOnline}
              >
                Add User
              </Button>
            </Box>
            
            <List>
              {users.map((user) => (
                <ListItem key={user.id} divider>
                  <Avatar sx={{ mr: 2 }}>
                    {user.first_name?.[0] || user.username?.[0]}
                  </Avatar>
                  <ListItemText
                    primary={`${user.first_name} ${user.last_name} (${user.username})`}
                    secondary={
                      <Box>
                        <Typography variant="body2">{user.email}</Typography>
                        <Chip
                          label={user.role}
                          size="small"
                          color={user.is_active ? 'success' : 'default'}
                          sx={{ mr: 1 }}
                        />
                        {user.is_active ? (
                          <Chip label="Active" size="small" color="success" />
                        ) : (
                          <Chip label="Inactive" size="small" color="error" />
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleEditUser(user)}
                      disabled={!isOnline}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={!isOnline}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* POS Settings */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              POS Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Default Payment Method</InputLabel>
                  <Select
                    value={posSettings.default_payment_method}
                    onChange={(e) => setPosSettings({...posSettings, default_payment_method: e.target.value})}
                    label="Default Payment Method"
                  >
                    <MenuItem value="CASH">Cash</MenuItem>
                    <MenuItem value="CARD">Card</MenuItem>
                    <MenuItem value="INSURANCE">Insurance</MenuItem>
                    <MenuItem value="ONLINE">Online</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Default Discount (%)"
                  type="number"
                  value={posSettings.default_discount}
                  onChange={(e) => setPosSettings({...posSettings, default_discount: parseFloat(e.target.value) || 0})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax Rate (%)"
                  type="number"
                  value={posSettings.tax_rate}
                  onChange={(e) => setPosSettings({...posSettings, tax_rate: parseFloat(e.target.value) || 0})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Receipt Header"
                  multiline
                  rows={2}
                  value={posSettings.receipt_header}
                  onChange={(e) => setPosSettings({...posSettings, receipt_header: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Receipt Footer"
                  multiline
                  rows={2}
                  value={posSettings.receipt_footer}
                  onChange={(e) => setPosSettings({...posSettings, receipt_footer: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={posSettings.enable_barcode_scanning}
                      onChange={(e) => setPosSettings({...posSettings, enable_barcode_scanning: e.target.checked})}
                    />
                  }
                  label="Enable Barcode Scanning"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={posSettings.auto_print_receipt}
                      onChange={(e) => setPosSettings({...posSettings, auto_print_receipt: e.target.checked})}
                    />
                  }
                  label="Auto Print Receipt"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={posSettings.allow_negative_stock}
                      onChange={(e) => setPosSettings({...posSettings, allow_negative_stock: e.target.checked})}
                    />
                  }
                  label="Allow Negative Stock"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={posSettings.show_customer_details}
                      onChange={(e) => setPosSettings({...posSettings, show_customer_details: e.target.checked})}
                    />
                  }
                  label="Show Customer Details"
                />
              </Grid>
            </Grid>
            <Box mt={3}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSavePOSSettings}
                disabled={loading}
              >
                Save POS Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Inventory Settings */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Inventory Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Reorder Level"
                  type="number"
                  value={inventorySettings.reorder_level}
                  onChange={(e) => setInventorySettings({...inventorySettings, reorder_level: parseInt(e.target.value) || 0})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Expiry Alert Days"
                  type="number"
                  value={inventorySettings.expiry_alert_days}
                  onChange={(e) => setInventorySettings({...inventorySettings, expiry_alert_days: parseInt(e.target.value) || 0})}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={inventorySettings.low_stock_alert}
                      onChange={(e) => setInventorySettings({...inventorySettings, low_stock_alert: e.target.checked})}
                    />
                  }
                  label="Low Stock Alert"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={inventorySettings.expiry_alert}
                      onChange={(e) => setInventorySettings({...inventorySettings, expiry_alert: e.target.checked})}
                    />
                  }
                  label="Expiry Alert"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={inventorySettings.auto_batch_creation}
                      onChange={(e) => setInventorySettings({...inventorySettings, auto_batch_creation: e.target.checked})}
                    />
                  }
                  label="Auto Batch Creation"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={inventorySettings.track_serial_numbers}
                      onChange={(e) => setInventorySettings({...inventorySettings, track_serial_numbers: e.target.checked})}
                    />
                  }
                  label="Track Serial Numbers"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={inventorySettings.storage_conditions}
                      onChange={(e) => setInventorySettings({...inventorySettings, storage_conditions: e.target.checked})}
                    />
                  }
                  label="Track Storage Conditions"
                />
              </Grid>
            </Grid>
            <Box mt={3}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveInventorySettings}
                disabled={loading}
              >
                Save Inventory Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Notification Settings */}
      <TabPanel value={tabValue} index={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Gateway"
                  value={notificationSettings.email_gateway}
                  onChange={(e) => setNotificationSettings({...notificationSettings, email_gateway: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SMS Gateway"
                  value={notificationSettings.sms_gateway}
                  onChange={(e) => setNotificationSettings({...notificationSettings, sms_gateway: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.email_notifications}
                      onChange={(e) => setNotificationSettings({...notificationSettings, email_notifications: e.target.checked})}
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.sms_notifications}
                      onChange={(e) => setNotificationSettings({...notificationSettings, sms_notifications: e.target.checked})}
                    />
                  }
                  label="SMS Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.low_stock_email}
                      onChange={(e) => setNotificationSettings({...notificationSettings, low_stock_email: e.target.checked})}
                    />
                  }
                  label="Low Stock Email Alert"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.expiry_email}
                      onChange={(e) => setNotificationSettings({...notificationSettings, expiry_email: e.target.checked})}
                    />
                  }
                  label="Expiry Email Alert"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.prescription_email}
                      onChange={(e) => setNotificationSettings({...notificationSettings, prescription_email: e.target.checked})}
                    />
                  }
                  label="Prescription Email Alert"
                />
              </Grid>
            </Grid>
            <Box mt={3}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveNotificationSettings}
                disabled={loading}
              >
                Save Notification Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Integration Settings */}
      <TabPanel value={tabValue} index={5}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Integration Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Accounting Software</InputLabel>
                  <Select
                    value={integrationSettings.accounting_software}
                    onChange={(e) => setIntegrationSettings({...integrationSettings, accounting_software: e.target.value})}
                    label="Accounting Software"
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="quickbooks">QuickBooks</MenuItem>
                    <MenuItem value="tally">Tally</MenuItem>
                    <MenuItem value="xero">Xero</MenuItem>
                    <MenuItem value="zoho">Zoho Books</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Gateway</InputLabel>
                  <Select
                    value={integrationSettings.payment_gateway}
                    onChange={(e) => setIntegrationSettings({...integrationSettings, payment_gateway: e.target.value})}
                    label="Payment Gateway"
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="stripe">Stripe</MenuItem>
                    <MenuItem value="paypal">PayPal</MenuItem>
                    <MenuItem value="square">Square</MenuItem>
                    <MenuItem value="razorpay">Razorpay</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Insurance Provider</InputLabel>
                  <Select
                    value={integrationSettings.insurance_provider}
                    onChange={(e) => setIntegrationSettings({...integrationSettings, insurance_provider: e.target.value})}
                    label="Insurance Provider"
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="provider1">Provider 1</MenuItem>
                    <MenuItem value="provider2">Provider 2</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>E-Prescription Service</InputLabel>
                  <Select
                    value={integrationSettings.e_prescription}
                    onChange={(e) => setIntegrationSettings({...integrationSettings, e_prescription: e.target.value})}
                    label="E-Prescription Service"
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="service1">Service 1</MenuItem>
                    <MenuItem value="service2">Service 2</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box mt={3}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveIntegrationSettings}
                disabled={loading}
              >
                Save Integration Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Security Settings */}
      <TabPanel value={tabValue} index={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Minimum Password Length"
                  type="number"
                  value={securitySettings.password_min_length}
                  onChange={(e) => setSecuritySettings({...securitySettings, password_min_length: parseInt(e.target.value) || 8})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={securitySettings.session_timeout}
                  onChange={(e) => setSecuritySettings({...securitySettings, session_timeout: parseInt(e.target.value) || 30})}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.require_uppercase}
                      onChange={(e) => setSecuritySettings({...securitySettings, require_uppercase: e.target.checked})}
                    />
                  }
                  label="Require Uppercase Letters"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.require_lowercase}
                      onChange={(e) => setSecuritySettings({...securitySettings, require_lowercase: e.target.checked})}
                    />
                  }
                  label="Require Lowercase Letters"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.require_numbers}
                      onChange={(e) => setSecuritySettings({...securitySettings, require_numbers: e.target.checked})}
                    />
                  }
                  label="Require Numbers"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.require_special_chars}
                      onChange={(e) => setSecuritySettings({...securitySettings, require_special_chars: e.target.checked})}
                    />
                  }
                  label="Require Special Characters"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.two_factor_auth}
                      onChange={(e) => setSecuritySettings({...securitySettings, two_factor_auth: e.target.checked})}
                    />
                  }
                  label="Two-Factor Authentication"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.audit_logging}
                      onChange={(e) => setSecuritySettings({...securitySettings, audit_logging: e.target.checked})}
                    />
                  }
                  label="Audit Logging"
                />
              </Grid>
            </Grid>
            <Box mt={3}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSecuritySettings}
                disabled={loading}
              >
                Save Security Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Backup Settings */}
      <TabPanel value={tabValue} index={7}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Backup Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Backup Frequency</InputLabel>
                  <Select
                    value={backupSettings.backup_frequency}
                    onChange={(e) => setBackupSettings({...backupSettings, backup_frequency: e.target.value})}
                    label="Backup Frequency"
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Retention Days"
                  type="number"
                  value={backupSettings.retention_days}
                  onChange={(e) => setBackupSettings({...backupSettings, retention_days: parseInt(e.target.value) || 30})}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={backupSettings.auto_backup}
                      onChange={(e) => setBackupSettings({...backupSettings, auto_backup: e.target.checked})}
                    />
                  }
                  label="Automatic Backup"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={backupSettings.cloud_backup}
                      onChange={(e) => setBackupSettings({...backupSettings, cloud_backup: e.target.checked})}
                    />
                  }
                  label="Cloud Backup"
                />
              </Grid>
              {backupSettings.cloud_backup && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Cloud Provider</InputLabel>
                    <Select
                      value={backupSettings.cloud_provider}
                      onChange={(e) => setBackupSettings({...backupSettings, cloud_provider: e.target.value})}
                      label="Cloud Provider"
                    >
                      <MenuItem value="aws">AWS S3</MenuItem>
                      <MenuItem value="google">Google Drive</MenuItem>
                      <MenuItem value="azure">Azure Blob</MenuItem>
                      <MenuItem value="dropbox">Dropbox</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
            
            <Box mt={3}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveBackupSettings}
                disabled={loading}
                sx={{ mr: 2 }}
              >
                Save Backup Settings
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleBackupNow}
                disabled={loading || !isOnline}
                sx={{ mr: 2 }}
              >
                Backup Now
              </Button>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                disabled={!isOnline}
              >
                Restore Backup
                <input
                  type="file"
                  hidden
                  accept=".backup,.db"
                  onChange={handleRestoreBackup}
                />
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Theme Settings */}
      <TabPanel value={tabValue} index={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Theme Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Theme Mode</InputLabel>
                  <Select
                    value={themeSettings.theme_mode}
                    onChange={(e) => setThemeSettings({...themeSettings, theme_mode: e.target.value})}
                    label="Theme Mode"
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Font Size</InputLabel>
                  <Select
                    value={themeSettings.font_size}
                    onChange={(e) => setThemeSettings({...themeSettings, font_size: e.target.value})}
                    label="Font Size"
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Primary Color"
                  type="color"
                  value={themeSettings.primary_color}
                  onChange={(e) => setThemeSettings({...themeSettings, primary_color: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Secondary Color"
                  type="color"
                  value={themeSettings.secondary_color}
                  onChange={(e) => setThemeSettings({...themeSettings, secondary_color: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeSettings.compact_mode}
                      onChange={(e) => setThemeSettings({...themeSettings, compact_mode: e.target.checked})}
                    />
                  }
                  label="Compact Mode"
                />
              </Grid>
            </Grid>
            <Box mt={3}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveThemeSettings}
                disabled={loading}
              >
                Apply Theme
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={userForm.username}
                onChange={(e) => setUserForm({...userForm, username: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={userForm.first_name}
                onChange={(e) => setUserForm({...userForm, first_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={userForm.last_name}
                onChange={(e) => setUserForm({...userForm, last_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={userForm.phone}
                onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userForm.role}
                  onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                  label="Role"
                >
                  <MenuItem value="ADMIN">Admin</MenuItem>
                  <MenuItem value="PHARMACIST">Pharmacist</MenuItem>
                  <MenuItem value="CASHIER">Cashier</MenuItem>
                  <MenuItem value="DOCTOR">Doctor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {!editingUser && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={userForm.password || ''}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userForm.is_active}
                    onChange={(e) => setUserForm({...userForm, is_active: e.target.checked})}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button onClick={editingUser ? handleUpdateUser : handleCreateUser} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : (editingUser ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        message={success}
      />
    </Box>
  );
}

export default Settings;