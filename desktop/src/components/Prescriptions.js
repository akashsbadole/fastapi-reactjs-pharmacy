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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment,
  Tooltip,
  Pagination,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Check as ApproveIcon,
  LocalPharmacy as FillIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  Upload as ImportIcon,
  PictureAsPdf as PdfIcon,
  Description as FileIcon
} from '@mui/icons-material';
import { prescriptionService, patientService, inventoryService } from '../services/api';

function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_name: '',
    doctor_license: '',
    diagnosis: '',
    notes: '',
    items: []
  });
  
  const [prescriptionItem, setPrescriptionItem] = useState({
    medicine_id: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
    fetchMedicines();
    
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
  }, [page, searchTerm, statusFilter]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        // Load cached prescriptions if offline
        const cachedPrescriptions = localStorage.getItem('prescriptions');
        if (cachedPrescriptions) {
          setPrescriptions(JSON.parse(cachedPrescriptions));
        }
        setLoading(false);
        return;
      }
      
      const params = {
        page,
        limit: 10,
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      const data = await prescriptionService.getPrescriptions(params);
      setPrescriptions(data.items || []);
      setTotalPages(data.pages || 1);
      
      // Cache prescriptions
      localStorage.setItem('prescriptions', JSON.stringify(data.items || []));
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError('Failed to fetch prescriptions');
      
      // Try to load cached prescriptions
      const cachedPrescriptions = localStorage.getItem('prescriptions');
      if (cachedPrescriptions) {
        setPrescriptions(JSON.parse(cachedPrescriptions));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      if (!isOnline) return;
      
      const data = await patientService.getPatients({ limit: 100 });
      setPatients(data.items || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchMedicines = async () => {
    try {
      if (!isOnline) return;
      
      const data = await inventoryService.getMedicines({ limit: 100 });
      setMedicines(data.items || []);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleCreatePrescription = () => {
    setEditingPrescription(null);
    setFormData({
      patient_id: '',
      doctor_name: '',
      doctor_license: '',
      diagnosis: '',
      notes: '',
      items: []
    });
    setDialogOpen(true);
  };

  const handleEditPrescription = (prescription) => {
    setEditingPrescription(prescription);
    setFormData({
      patient_id: prescription.patient_id || '',
      doctor_name: prescription.doctor_name || '',
      doctor_license: prescription.doctor_license || '',
      diagnosis: prescription.diagnosis || '',
      notes: prescription.notes || '',
      items: prescription.items || []
    });
    setDialogOpen(true);
  };

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setViewDialogOpen(true);
  };

  const handleDeletePrescription = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot delete prescription while offline');
        setLoading(false);
        return;
      }
      
      await prescriptionService.deletePrescription(id);
      setSuccess('Prescription deleted successfully');
      fetchPrescriptions();
    } catch (err) {
      console.error('Error deleting prescription:', err);
      setError('Failed to delete prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePrescription = async (id) => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot approve prescription while offline');
        setLoading(false);
        return;
      }
      
      await prescriptionService.approvePrescription(id);
      setSuccess('Prescription approved successfully');
      fetchPrescriptions();
    } catch (err) {
      console.error('Error approving prescription:', err);
      setError('Failed to approve prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleFillPrescription = async (id) => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot fill prescription while offline');
        setLoading(false);
        return;
      }
      
      await prescriptionService.fillPrescription(id);
      setSuccess('Prescription filled successfully');
      fetchPrescriptions();
    } catch (err) {
      console.error('Error filling prescription:', err);
      setError('Failed to fill prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrescription = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot save prescription while offline');
        setLoading(false);
        return;
      }
      
      if (editingPrescription) {
        await prescriptionService.updatePrescription(editingPrescription.id, formData);
        setSuccess('Prescription updated successfully');
      } else {
        await prescriptionService.createPrescription(formData);
        setSuccess('Prescription created successfully');
      }
      
      setDialogOpen(false);
      fetchPrescriptions();
    } catch (err) {
      console.error('Error saving prescription:', err);
      setError('Failed to save prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrescriptionItem = () => {
    if (!prescriptionItem.medicine_id) return;
    
    const medicine = medicines.find(m => m.id === prescriptionItem.medicine_id);
    const newItem = {
      ...prescriptionItem,
      medicine_name: medicine?.name || '',
      id: Date.now()
    };
    
    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
    
    setPrescriptionItem({
      medicine_id: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
  };

  const handleRemovePrescriptionItem = (itemId) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== itemId)
    });
  };

  const handleExportPrescriptions = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot export prescriptions while offline');
        setLoading(false);
        return;
      }
      
      const response = await prescriptionService.exportPrescriptions({
        status: statusFilter,
        search: searchTerm
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'prescriptions.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSuccess('Prescriptions exported successfully');
    } catch (err) {
      console.error('Error exporting prescriptions:', err);
      setError('Failed to export prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'info';
      case 'FILLED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Prescriptions
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExportPrescriptions}
            disabled={loading || !isOnline}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPrescriptions}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You are currently offline. Showing cached data.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Card>
        <CardContent>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search prescriptions..."
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="FILLED">Filled</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreatePrescription}
                  disabled={!isOnline}
                >
                  New Prescription
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <Typography>Loading...</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prescriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" py={2}>
                          No prescriptions found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    prescriptions.map((prescription) => (
                      <TableRow key={prescription.id}>
                        <TableCell>{prescription.id}</TableCell>
                        <TableCell>
                          {prescription.patient_name || `Patient #${prescription.patient_id}`}
                        </TableCell>
                        <TableCell>{prescription.doctor_name}</TableCell>
                        <TableCell>
                          {new Date(prescription.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={prescription.status}
                            color={getStatusColor(prescription.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{prescription.items?.length || 0}</TableCell>
                        <TableCell>
                          <Box>
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                onClick={() => handleViewPrescription(prescription)}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditPrescription(prescription)}
                                disabled={!isOnline || prescription.status === 'FILLED'}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {prescription.status === 'PENDING' && (
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  onClick={() => handleApprovePrescription(prescription.id)}
                                  disabled={!isOnline}
                                >
                                  <ApproveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {prescription.status === 'APPROVED' && (
                              <Tooltip title="Fill">
                                <IconButton
                                  size="small"
                                  onClick={() => handleFillPrescription(prescription.id)}
                                  disabled={!isOnline}
                                >
                                  <FillIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeletePrescription(prescription.id)}
                                disabled={!isOnline || prescription.status === 'FILLED'}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPrescription ? 'Edit Prescription' : 'New Prescription'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Patient</InputLabel>
                <Select
                  value={formData.patient_id}
                  onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                  label="Patient"
                >
                  {patients.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Doctor Name"
                value={formData.doctor_name}
                onChange={(e) => setFormData({...formData, doctor_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Doctor License"
                value={formData.doctor_license}
                onChange={(e) => setFormData({...formData, doctor_license: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Diagnosis"
                value={formData.diagnosis}
                onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </Grid>
            
            {/* Prescription Items */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Prescription Items
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Medicine</InputLabel>
                    <Select
                      value={prescriptionItem.medicine_id}
                      onChange={(e) => setPrescriptionItem({...prescriptionItem, medicine_id: e.target.value})}
                      label="Medicine"
                    >
                      {medicines.map((medicine) => (
                        <MenuItem key={medicine.id} value={medicine.id}>
                          {medicine.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="Dosage"
                    value={prescriptionItem.dosage}
                    onChange={(e) => setPrescriptionItem({...prescriptionItem, dosage: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="Frequency"
                    value={prescriptionItem.frequency}
                    onChange={(e) => setPrescriptionItem({...prescriptionItem, frequency: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="Duration"
                    value={prescriptionItem.duration}
                    onChange={(e) => setPrescriptionItem({...prescriptionItem, duration: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    variant="outlined"
                    onClick={handleAddPrescriptionItem}
                    disabled={!prescriptionItem.medicine_id}
                    fullWidth
                  >
                    Add Item
                  </Button>
                </Grid>
              </Grid>
              
              {/* Items List */}
              {formData.items.length > 0 && (
                <Box mt={2}>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Medicine</TableCell>
                          <TableCell>Dosage</TableCell>
                          <TableCell>Frequency</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.medicine_name}</TableCell>
                            <TableCell>{item.dosage}</TableCell>
                            <TableCell>{item.frequency}</TableCell>
                            <TableCell>{item.duration}</TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleRemovePrescriptionItem(item.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePrescription} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Prescription Details</DialogTitle>
        <DialogContent>
          {selectedPrescription && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Patient:</Typography>
                <Typography variant="body1">
                  {selectedPrescription.patient_name || `Patient #${selectedPrescription.patient_id}`}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Doctor:</Typography>
                <Typography variant="body1">{selectedPrescription.doctor_name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Date:</Typography>
                <Typography variant="body1">
                  {new Date(selectedPrescription.created_at).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Status:</Typography>
                <Chip
                  label={selectedPrescription.status}
                  color={getStatusColor(selectedPrescription.status)}
                  size="small"
                />
              </Grid>
              {selectedPrescription.diagnosis && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Diagnosis:</Typography>
                  <Typography variant="body1">{selectedPrescription.diagnosis}</Typography>
                </Grid>
              )}
              {selectedPrescription.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Notes:</Typography>
                  <Typography variant="body1">{selectedPrescription.notes}</Typography>
                </Grid>
              )}
              {selectedPrescription.items && selectedPrescription.items.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Prescription Items:
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Medicine</TableCell>
                          <TableCell>Dosage</TableCell>
                          <TableCell>Frequency</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Instructions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedPrescription.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.medicine_name}</TableCell>
                            <TableCell>{item.dosage}</TableCell>
                            <TableCell>{item.frequency}</TableCell>
                            <TableCell>{item.duration}</TableCell>
                            <TableCell>{item.instructions}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
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

export default Prescriptions;