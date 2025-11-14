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
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  PictureAsPdf as PdfIcon,
  GetApp as DownloadIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  LocalOffer as DiscountIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { billingService, patientService, posService } from '../services/api';

function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
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
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    patient_id: '',
    items: [],
    subtotal: 0,
    discount_amount: 0,
    discount_type: 'PERCENTAGE',
    tax_amount: 0,
    total_amount: 0,
    status: 'DRAFT',
    notes: ''
  });
  
  const [paymentData, setPaymentData] = useState({
    payment_method: 'CASH',
    amount_paid: 0,
    reference_number: ''
  });
  
  const [invoiceItem, setInvoiceItem] = useState({
    medicine_id: '',
    quantity: 0,
    unit_price: 0,
    discount: 0
  });

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
    
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

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        // Load cached invoices if offline
        const cachedInvoices = localStorage.getItem('invoices');
        if (cachedInvoices) {
          setInvoices(JSON.parse(cachedInvoices));
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
      
      const data = await billingService.getInvoices(params);
      setInvoices(data.items || []);
      setTotalPages(data.pages || 1);
      
      // Cache invoices
      localStorage.setItem('invoices', JSON.stringify(data.items || []));
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to fetch invoices');
      
      // Try to load cached invoices
      const cachedInvoices = localStorage.getItem('invoices');
      if (cachedInvoices) {
        setInvoices(JSON.parse(cachedInvoices));
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

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setFormData({
      patient_id: '',
      items: [],
      subtotal: 0,
      discount_amount: 0,
      discount_type: 'PERCENTAGE',
      tax_amount: 0,
      total_amount: 0,
      status: 'DRAFT',
      notes: ''
    });
    setDialogOpen(true);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      patient_id: invoice.patient_id || '',
      items: invoice.items || [],
      subtotal: invoice.subtotal || 0,
      discount_amount: invoice.discount_amount || 0,
      discount_type: invoice.discount_type || 'PERCENTAGE',
      tax_amount: invoice.tax_amount || 0,
      total_amount: invoice.total_amount || 0,
      status: invoice.status || 'DRAFT',
      notes: invoice.notes || ''
    });
    setDialogOpen(true);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot delete invoice while offline');
        setLoading(false);
        return;
      }
      
      await billingService.deleteInvoice(id);
      setSuccess('Invoice deleted successfully');
      fetchInvoices();
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError('Failed to delete invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInvoice = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot save invoice while offline');
        setLoading(false);
        return;
      }
      
      if (editingInvoice) {
        await billingService.updateInvoice(editingInvoice.id, formData);
        setSuccess('Invoice updated successfully');
      } else {
        await billingService.createInvoice(formData);
        setSuccess('Invoice created successfully');
      }
      
      setDialogOpen(false);
      fetchInvoices();
    } catch (err) {
      console.error('Error saving invoice:', err);
      setError('Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvoiceItem = () => {
    if (!invoiceItem.medicine_id || invoiceItem.quantity <= 0) return;
    
    const itemTotal = invoiceItem.quantity * invoiceItem.unit_price;
    const itemDiscountAmount = itemTotal * (invoiceItem.discount / 100);
    const finalAmount = itemTotal - itemDiscountAmount;
    
    const newItem = {
      ...invoiceItem,
      id: Date.now(),
      total: finalAmount
    };
    
    const newItems = [...formData.items, newItem];
    const newSubtotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = formData.discount_type === 'PERCENTAGE' 
      ? newSubtotal * (formData.discount_amount / 100)
      : formData.discount_amount;
    const taxableAmount = newSubtotal - discountAmount;
    const taxAmount = taxableAmount * 0.08; // 8% tax
    const totalAmount = taxableAmount + taxAmount;
    
    setFormData({
      ...formData,
      items: newItems,
      subtotal: newSubtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount
    });
    
    setInvoiceItem({
      medicine_id: '',
      quantity: 0,
      unit_price: 0,
      discount: 0
    });
  };

  const handleRemoveInvoiceItem = (itemId) => {
    const newItems = formData.items.filter(item => item.id !== itemId);
    const newSubtotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = formData.discount_type === 'PERCENTAGE' 
      ? newSubtotal * (formData.discount_amount / 100)
      : formData.discount_amount;
    const taxableAmount = newSubtotal - discountAmount;
    const taxAmount = taxableAmount * 0.08; // 8% tax
    const totalAmount = taxableAmount + taxAmount;
    
    setFormData({
      ...formData,
      items: newItems,
      subtotal: newSubtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount
    });
  };

  const handleProcessPayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot process payment while offline');
        setLoading(false);
        return;
      }
      
      await billingService.processPayment(selectedInvoice.id, paymentData);
      setSuccess('Payment processed successfully');
      setPaymentDialogOpen(false);
      fetchInvoices();
      setViewDialogOpen(false);
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = async (invoice) => {
    try {
      if (window.electronAPI) {
        window.electronAPI.printInvoice(invoice);
      } else {
        window.print();
      }
    } catch (err) {
      console.error('Error printing invoice:', err);
      setError('Failed to print invoice');
    }
  };

  const handleDownloadInvoice = async (invoice) => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot download invoice while offline');
        setLoading(false);
        return;
      }
      
      const response = await billingService.downloadInvoice(invoice.id);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoice.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSuccess('Invoice downloaded successfully');
    } catch (err) {
      console.error('Error downloading invoice:', err);
      setError('Failed to download invoice');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'PENDING': return 'warning';
      case 'PAID': return 'success';
      case 'OVERDUE': return 'error';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Billing & Invoices
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchInvoices}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateInvoice}
            disabled={!isOnline}
          >
            New Invoice
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
                placeholder="Search invoices..."
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
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="PAID">Paid</MenuItem>
                  <MenuItem value="OVERDUE">Overdue</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
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
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" py={2}>
                          No invoices found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>
                          {invoice.patient_name || `Patient #${invoice.patient_id}`}
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>${invoice.total_amount?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.status}
                            color={getStatusColor(invoice.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                onClick={() => handleViewInvoice(invoice)}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditInvoice(invoice)}
                                disabled={!isOnline || invoice.status === 'PAID'}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Print">
                              <IconButton
                                size="small"
                                onClick={() => handlePrintInvoice(invoice)}
                              >
                                <PrintIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadInvoice(invoice)}
                                disabled={!isOnline}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteInvoice(invoice.id)}
                                disabled={!isOnline || invoice.status === 'PAID'}
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
          {editingInvoice ? 'Edit Invoice' : 'New Invoice'}
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
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </Grid>
            
            {/* Invoice Items */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Invoice Items
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={invoiceItem.quantity}
                    onChange={(e) => setInvoiceItem({...invoiceItem, quantity: parseInt(e.target.value) || 0})}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Unit Price"
                    type="number"
                    value={invoiceItem.unit_price}
                    onChange={(e) => setInvoiceItem({...invoiceItem, unit_price: parseFloat(e.target.value) || 0})}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Discount (%)"
                    type="number"
                    value={invoiceItem.discount}
                    onChange={(e) => setInvoiceItem({...invoiceItem, discount: parseFloat(e.target.value) || 0})}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    variant="outlined"
                    onClick={handleAddInvoiceItem}
                    disabled={!invoiceItem.medicine_id || invoiceItem.quantity <= 0}
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
                          <TableCell>Item</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Unit Price</TableCell>
                          <TableCell>Discount</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.medicine_name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                            <TableCell>{item.discount}%</TableCell>
                            <TableCell>${item.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveInvoiceItem(item.id)}
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
            
            {/* Summary */}
            <Grid item xs={12}>
              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Discount Type"
                      select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                    >
                      <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                      <MenuItem value="FIXED">Fixed</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Discount Amount"
                      type="number"
                      value={formData.discount_amount}
                      onChange={(e) => setFormData({...formData, discount_amount: parseFloat(e.target.value) || 0})}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle2">Subtotal:</Typography>
                      <Typography>${formData.subtotal.toFixed(2)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle2">Tax:</Typography>
                      <Typography>${formData.tax_amount.toFixed(2)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6">${formData.total_amount.toFixed(2)}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveInvoice} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Invoice Details</DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Invoice Number:</Typography>
                <Typography variant="body1">{selectedInvoice.invoice_number}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Patient:</Typography>
                <Typography variant="body1">
                  {selectedInvoice.patient_name || `Patient #${selectedInvoice.patient_id}`}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Date:</Typography>
                <Typography variant="body1">
                  {new Date(selectedInvoice.created_at).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Due Date:</Typography>
                <Typography variant="body1">
                  {new Date(selectedInvoice.due_date).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Status:</Typography>
                <Chip
                  label={selectedInvoice.status}
                  color={getStatusColor(selectedInvoice.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Total Amount:</Typography>
                <Typography variant="h6">${selectedInvoice.total_amount?.toFixed(2) || '0.00'}</Typography>
              </Grid>
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Invoice Items:
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Unit Price</TableCell>
                          <TableCell>Discount</TableCell>
                          <TableCell>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedInvoice.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.medicine_name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                            <TableCell>{item.discount}%</TableCell>
                            <TableCell>${item.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
              {selectedInvoice.status === 'PENDING' && (
                <Grid item xs={12}>
                  <Box mt={2}>
                    <Button
                      variant="contained"
                      startIcon={<PaymentIcon />}
                      onClick={() => setPaymentDialogOpen(true)}
                      disabled={!isOnline}
                    >
                      Process Payment
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({...paymentData, payment_method: e.target.value})}
                  label="Payment Method"
                >
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="CARD">Card</MenuItem>
                  <MenuItem value="INSURANCE">Insurance</MenuItem>
                  <MenuItem value="ONLINE">Online</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount Paid"
                type="number"
                value={paymentData.amount_paid}
                onChange={(e) => setPaymentData({...paymentData, amount_paid: parseFloat(e.target.value) || 0})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reference Number"
                value={paymentData.reference_number}
                onChange={(e) => setPaymentData({...paymentData, reference_number: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleProcessPayment} variant="contained" disabled={loading}>
            {loading ? 'Processing...' : 'Process Payment'}
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

export default Billing;