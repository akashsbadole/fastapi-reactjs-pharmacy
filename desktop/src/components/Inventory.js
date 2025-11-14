import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  InputAdornment,
  Tooltip,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  LocalPharmacy as PharmacyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { inventoryService } from '../services/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Inventory() {
  const [tabValue, setTabValue] = useState(0);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    brand: '',
    category: '',
    description: '',
    dosage_form: '',
    strength: '',
    manufacturer: '',
    requires_prescription: false,
    barcode: '',
    sku: '',
    pack_size: '',
    hsn_code: '',
    mrp: '',
    purchase_price: '',
    selling_price: '',
    tax_percent: '',
    stock_quantity: '',
    reorder_level: '',
    storage_condition: '',
    schedule: '',
    alternative_drug_names: '',
    substitution_allowed: true,
    location: '',
    notes: '',
    supplier_id: ''
  });
  const [batchFormData, setBatchFormData] = useState({
    batch_number: '',
    medicine_id: '',
    supplier_id: '',
    quantity: '',
    cost_price: '',
    selling_price: '',
    manufacture_date: '',
    expiry_date: '',
    low_stock_threshold: ''
  });

  useEffect(() => {
    fetchMedicines();
    fetchSuppliers();
    
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

  const fetchMedicines = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        // Load cached data if offline
        const cachedMedicines = localStorage.getItem('medicines');
        if (cachedMedicines) {
          setMedicines(JSON.parse(cachedMedicines));
        }
        setLoading(false);
        return;
      }
      
      const data = await inventoryService.getMedicines();
      setMedicines(data.items || []);
      localStorage.setItem('medicines', JSON.stringify(data.items || []));
    } catch (err) {
      console.error('Error fetching medicines:', err);
      setError('Failed to fetch medicines. Please try again.');
      
      // Try to load cached data
      const cachedMedicines = localStorage.getItem('medicines');
      if (cachedMedicines) {
        setMedicines(JSON.parse(cachedMedicines));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      if (!isOnline) {
        // Load cached data if offline
        const cachedSuppliers = localStorage.getItem('suppliers');
        if (cachedSuppliers) {
          setSuppliers(JSON.parse(cachedSuppliers));
        }
        return;
      }
      
      const data = await inventoryService.getSuppliers();
      setSuppliers(data.items || []);
      localStorage.setItem('suppliers', JSON.stringify(data.items || []));
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      
      // Try to load cached data
      const cachedSuppliers = localStorage.getItem('suppliers');
      if (cachedSuppliers) {
        setSuppliers(JSON.parse(cachedSuppliers));
      }
    }
  };

  const fetchBatches = async (medicineId) => {
    try {
      if (!isOnline) return;
      
      const data = await inventoryService.getBatches(medicineId);
      setBatches(data.items || []);
    } catch (err) {
      console.error('Error fetching batches:', err);
      setError('Failed to fetch batches');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const handleMenuClick = (event, medicine) => {
    setAnchorEl(event.currentTarget);
    setSelectedMedicine(medicine);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMedicine(null);
  };

  const handleEditMedicine = () => {
    if (selectedMedicine) {
      setFormData({
        name: selectedMedicine.name || '',
        generic_name: selectedMedicine.generic_name || '',
        brand: selectedMedicine.brand || '',
        category: selectedMedicine.category || '',
        description: selectedMedicine.description || '',
        dosage_form: selectedMedicine.dosage_form || '',
        strength: selectedMedicine.strength || '',
        manufacturer: selectedMedicine.manufacturer || '',
        requires_prescription: selectedMedicine.requires_prescription || false,
        barcode: selectedMedicine.barcode || '',
        sku: selectedMedicine.sku || '',
        pack_size: selectedMedicine.pack_size || '',
        hsn_code: selectedMedicine.hsn_code || '',
        mrp: selectedMedicine.mrp || '',
        purchase_price: selectedMedicine.purchase_price || '',
        selling_price: selectedMedicine.selling_price || '',
        tax_percent: selectedMedicine.tax_percent || '',
        stock_quantity: selectedMedicine.stock_quantity || '',
        reorder_level: selectedMedicine.reorder_level || '',
        storage_condition: selectedMedicine.storage_condition || '',
        schedule: selectedMedicine.schedule || '',
        alternative_drug_names: selectedMedicine.alternative_drug_names || '',
        substitution_allowed: selectedMedicine.substitution_allowed !== false,
        location: selectedMedicine.location || '',
        notes: selectedMedicine.notes || '',
        supplier_id: selectedMedicine.supplier_id || ''
      });
      setDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleAddBatch = () => {
    if (selectedMedicine) {
      setBatchFormData({
        ...batchFormData,
        medicine_id: selectedMedicine.id
      });
      setBatchDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteMedicine = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleBatchFormChange = (event) => {
    const { name, value } = event.target;
    setBatchFormData({
      ...batchFormData,
      [name]: value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot save while offline. Please check your connection.');
        setLoading(false);
        return;
      }
      
      if (selectedMedicine) {
        await inventoryService.updateMedicine(selectedMedicine.id, formData);
        setSuccess('Medicine updated successfully');
      } else {
        await inventoryService.createMedicine(formData);
        setSuccess('Medicine created successfully');
      }
      
      setDialogOpen(false);
      fetchMedicines();
      resetForm();
    } catch (err) {
      console.error('Error saving medicine:', err);
      setError('Failed to save medicine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot save while offline. Please check your connection.');
        setLoading(false);
        return;
      }
      
      await inventoryService.createBatch(batchFormData);
      setSuccess('Batch created successfully');
      setBatchDialogOpen(false);
      fetchBatches(batchFormData.medicine_id);
      resetBatchForm();
    } catch (err) {
      console.error('Error creating batch:', err);
      setError('Failed to create batch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMedicine) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot delete while offline. Please check your connection.');
        setLoading(false);
        return;
      }
      
      await inventoryService.deleteMedicine(selectedMedicine.id);
      setSuccess('Medicine deleted successfully');
      setDeleteDialogOpen(false);
      fetchMedicines();
    } catch (err) {
      console.error('Error deleting medicine:', err);
      setError('Failed to delete medicine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      generic_name: '',
      brand: '',
      category: '',
      description: '',
      dosage_form: '',
      strength: '',
      manufacturer: '',
      requires_prescription: false,
      barcode: '',
      sku: '',
      pack_size: '',
      hsn_code: '',
      mrp: '',
      purchase_price: '',
      selling_price: '',
      tax_percent: '',
      stock_quantity: '',
      reorder_level: '',
      storage_condition: '',
      schedule: '',
      alternative_drug_names: '',
      substitution_allowed: true,
      location: '',
      notes: '',
      supplier_id: ''
    });
    setSelectedMedicine(null);
  };

  const resetBatchForm = () => {
    setBatchFormData({
      batch_number: '',
      medicine_id: '',
      supplier_id: '',
      quantity: '',
      cost_price: '',
      selling_price: '',
      manufacture_date: '',
      expiry_date: '',
      low_stock_threshold: ''
    });
  };

  const getStockStatus = (medicine) => {
    const stock = parseInt(medicine.stock_quantity || 0);
    const reorderLevel = parseInt(medicine.reorder_level || 10);
    
    if (stock === 0) {
      return { label: 'Out of Stock', color: 'error' };
    } else if (stock <= reorderLevel) {
      return { label: 'Low Stock', color: 'warning' };
    } else {
      return { label: 'In Stock', color: 'success' };
    }
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'out_of_stock') return matchesSearch && parseInt(medicine.stock_quantity || 0) === 0;
    if (filterStatus === 'low_stock') return matchesSearch && parseInt(medicine.stock_quantity || 0) <= parseInt(medicine.reorder_level || 10);
    if (filterStatus === 'in_stock') return matchesSearch && parseInt(medicine.stock_quantity || 0) > parseInt(medicine.reorder_level || 10);
    
    return matchesSearch;
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Inventory Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchMedicines}
            disabled={loading || !isOnline}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            disabled={!isOnline}
          >
            Add Medicine
          </Button>
        </Box>
      </Box>
      
      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You are currently offline. Showing cached data. Some features may be limited.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Medicines" />
          <Tab label="Suppliers" />
          <Tab label="Batches" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <TextField
                placeholder="Search medicines..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
              <Box display="flex" alignItems="center">
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 1 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={handleFilterChange}
                    label="Status"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="in_stock">In Stock</MenuItem>
                    <MenuItem value="low_stock">Low Stock</MenuItem>
                    <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                  </Select>
                </FormControl>
                <Tooltip title="Import/Export">
                  <IconButton>
                    <UploadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download CSV">
                  <IconButton>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Generic Name</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography>Loading...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredMedicines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography>No medicines found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMedicines.map((medicine) => {
                      const stockStatus = getStockStatus(medicine);
                      return (
                        <TableRow key={medicine.id}>
                          <TableCell>{medicine.name}</TableCell>
                          <TableCell>{medicine.generic_name || '-'}</TableCell>
                          <TableCell>{medicine.brand || '-'}</TableCell>
                          <TableCell>{medicine.stock_quantity || 0}</TableCell>
                          <TableCell>${medicine.selling_price || '0.00'}</TableCell>
                          <TableCell>
                            <Chip
                              label={stockStatus.label}
                              color={stockStatus.color}
                              size="small"
                              icon={stockStatus.color === 'error' ? <WarningIcon /> : <CheckCircleIcon />}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuClick(e, medicine)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Suppliers
            </Typography>
            <Typography variant="body2">
              Supplier management functionality will be implemented here.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Batches
            </Typography>
            <Typography variant="body2">
              Batch management functionality will be implemented here.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Medicine Form Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedMedicine ? 'Edit Medicine' : 'Add Medicine'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="name"
                  label="Medicine Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="generic_name"
                  label="Generic Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.generic_name}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="brand"
                  label="Brand"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.brand}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="category"
                  label="Category"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.category}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="dosage_form"
                  label="Dosage Form"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.dosage_form}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="strength"
                  label="Strength"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.strength}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="manufacturer"
                  label="Manufacturer"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.manufacturer}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="barcode"
                  label="Barcode"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.barcode}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="sku"
                  label="SKU"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.sku}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="mrp"
                  label="MRP"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.mrp}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="purchase_price"
                  label="Purchase Price"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.purchase_price}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="selling_price"
                  label="Selling Price"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.selling_price}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="stock_quantity"
                  label="Stock Quantity"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.stock_quantity}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="reorder_level"
                  label="Reorder Level"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.reorder_level}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Batch Form Dialog */}
      <Dialog open={batchDialogOpen} onClose={() => setBatchDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Batch</DialogTitle>
        <form onSubmit={handleBatchSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="batch_number"
                  label="Batch Number"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={batchFormData.batch_number}
                  onChange={handleBatchFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Supplier</InputLabel>
                  <Select
                    name="supplier_id"
                    value={batchFormData.supplier_id}
                    onChange={handleBatchFormChange}
                    label="Supplier"
                  >
                    {suppliers.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="quantity"
                  label="Quantity"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={batchFormData.quantity}
                  onChange={handleBatchFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="cost_price"
                  label="Cost Price"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={batchFormData.cost_price}
                  onChange={handleBatchFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="selling_price"
                  label="Selling Price"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={batchFormData.selling_price}
                  onChange={handleBatchFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="manufacture_date"
                  label="Manufacture Date"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={batchFormData.manufacture_date}
                  onChange={handleBatchFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="expiry_date"
                  label="Expiry Date"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={batchFormData.expiry_date}
                  onChange={handleBatchFormChange}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBatchDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Medicine</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedMedicine?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuList>
          <MenuItem onClick={handleEditMedicine}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleAddBatch}>
            <ListItemIcon>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Add Batch</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            fetchBatches(selectedMedicine.id);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <PharmacyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Batches</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteMedicine}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
      
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

export default Inventory;