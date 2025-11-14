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
  Divider,
  Chip,
  InputAdornment,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Save as SaveIcon,
  Receipt as ReceiptIcon,
  LocalOffer as DiscountIcon,
  Payment as PaymentIcon,
  Pause as HoldIcon,
  Restore as RestoreIcon,
  Refresh as RefreshIcon,
  BarcodeScanner as BarcodeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { posService, patientService } from '../services/api';

function PointOfSale() {
  const [cart, setCart] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [heldBills, setHeldBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [holdDialogOpen, setHoldDialogOpen] = useState(false);
  const [retrieveDialogOpen, setRetrieveDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [barcodeInput, setBarcodeInput] = useState('');

  useEffect(() => {
    fetchCart();
    fetchMedicines();
    fetchPatients();
    fetchHeldBills();
    
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

  const fetchCart = async () => {
    try {
      if (!isOnline) {
        // Load cached cart if offline
        const cachedCart = localStorage.getItem('pos_cart');
        if (cachedCart) {
          setCart(JSON.parse(cachedCart));
        }
        return;
      }
      
      const data = await posService.getCart();
      setCart(data.items || []);
      localStorage.setItem('pos_cart', JSON.stringify(data.items || []));
    } catch (err) {
      console.error('Error fetching cart:', err);
      
      // Try to load cached cart
      const cachedCart = localStorage.getItem('pos_cart');
      if (cachedCart) {
        setCart(JSON.parse(cachedCart));
      }
    }
  };

  const fetchMedicines = async () => {
    try {
      if (!isOnline) {
        // Load cached medicines if offline
        const cachedMedicines = localStorage.getItem('medicines');
        if (cachedMedicines) {
          setMedicines(JSON.parse(cachedMedicines));
        }
        return;
      }
      
      const data = await posService.getAvailableMedicines();
      setMedicines(data.items || []);
      localStorage.setItem('medicines', JSON.stringify(data.items || []));
    } catch (err) {
      console.error('Error fetching medicines:', err);
      
      // Try to load cached medicines
      const cachedMedicines = localStorage.getItem('medicines');
      if (cachedMedicines) {
        setMedicines(JSON.parse(cachedMedicines));
      }
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

  const fetchHeldBills = async () => {
    try {
      if (!isOnline) return;
      
      const data = await posService.getHeldBills();
      setHeldBills(data.items || []);
    } catch (err) {
      console.error('Error fetching held bills:', err);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleBarcodeChange = (event) => {
    const value = event.target.value;
    setBarcodeInput(value);
    
    // Check if it's a complete barcode (typically 8-13 digits)
    if (value.length >= 8) {
      handleBarcodeScan(value);
    }
  };

  const handleBarcodeScan = async (barcode) => {
    try {
      if (!isOnline) {
        setError('Cannot scan barcode while offline');
        return;
      }
      
      const medicine = medicines.find(m => m.barcode === barcode);
      if (medicine) {
        addToCart(medicine);
        setBarcodeInput('');
      } else {
        setError('Medicine not found with this barcode');
      }
    } catch (err) {
      console.error('Error scanning barcode:', err);
      setError('Failed to scan barcode');
    }
  };

  const addToCart = async (medicine) => {
    try {
      if (!isOnline) {
        // Update local cart if offline
        const existingItem = cart.find(item => item.medicine_id === medicine.id);
        let updatedCart;
        
        if (existingItem) {
          updatedCart = cart.map(item =>
            item.medicine_id === medicine.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          updatedCart = [...cart, {
            medicine_id: medicine.id,
            name: medicine.name,
            selling_price: medicine.selling_price,
            quantity: 1,
            stock: medicine.stock_quantity
          }];
        }
        
        setCart(updatedCart);
        localStorage.setItem('pos_cart', JSON.stringify(updatedCart));
        return;
      }
      
      await posService.addToCart({
        medicine_id: medicine.id,
        quantity: 1
      });
      
      fetchCart();
      setSuccess('Added to cart');
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add to cart');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    
    try {
      if (!isOnline) {
        // Update local cart if offline
        const updatedCart = cart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        setCart(updatedCart);
        localStorage.setItem('pos_cart', JSON.stringify(updatedCart));
        return;
      }
      
      await posService.updateCartItem(itemId, quantity);
      fetchCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      if (!isOnline) {
        // Update local cart if offline
        const updatedCart = cart.filter(item => item.id !== itemId);
        setCart(updatedCart);
        localStorage.setItem('pos_cart', JSON.stringify(updatedCart));
        return;
      }
      
      await posService.removeFromCart(itemId);
      fetchCart();
      setSuccess('Removed from cart');
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Failed to remove from cart');
    }
  };

  const clearCart = async () => {
    try {
      if (!isOnline) {
        setCart([]);
        localStorage.removeItem('pos_cart');
        return;
      }
      
      await posService.clearCart();
      fetchCart();
      setSelectedPatient(null);
      setCustomerInfo({ name: '', phone: '', email: '' });
      setDiscountAmount(0);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart');
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.selling_price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'PERCENTAGE') {
      return subtotal * (discountAmount / 100);
    } else {
      return discountAmount;
    }
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const taxableAmount = subtotal - discount;
    return taxableAmount * 0.08; // Assuming 8% tax
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot complete payment while offline');
        setLoading(false);
        return;
      }
      
      const saleData = {
        patient_id: selectedPatient?.id,
        customer_info: customerInfo,
        items: cart,
        subtotal: calculateSubtotal(),
        discount_amount: calculateDiscount(),
        discount_type: discountType,
        tax_amount: calculateTax(),
        total_amount: calculateTotal(),
        payment_method: paymentMethod
      };
      
      await posService.createSale(saleData);
      
      setSuccess('Payment completed successfully');
      setPaymentDialogOpen(false);
      clearCart();
      
      // Print receipt if needed
      if (window.electronAPI) {
        window.electronAPI.printReceipt(saleData);
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const handleHoldBill = async () => {
    if (!customerInfo.name) {
      setError('Customer name is required to hold bill');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot hold bill while offline');
        setLoading(false);
        return;
      }
      
      const billData = {
        customer_info: customerInfo,
        items: cart,
        subtotal: calculateSubtotal(),
        discount_amount: calculateDiscount(),
        discount_type: discountType,
        tax_amount: calculateTax(),
        total_amount: calculateTotal(),
        hold_reason: document.getElementById('hold-reason')?.value || 'Customer request'
      };
      
      await posService.holdBill(billData);
      
      setSuccess('Bill held successfully');
      setHoldDialogOpen(false);
      clearCart();
      fetchHeldBills();
    } catch (err) {
      console.error('Error holding bill:', err);
      setError('Failed to hold bill');
    } finally {
      setLoading(false);
    }
  };

  const handleRetrieveBill = async (billId) => {
    setLoading(true);
    setError('');
    
    try {
      if (!isOnline) {
        setError('Cannot retrieve bill while offline');
        setLoading(false);
        return;
      }
      
      await posService.retrieveHeldBill(billId);
      
      setSuccess('Bill retrieved successfully');
      setRetrieveDialogOpen(false);
      fetchCart();
      fetchHeldBills();
    } catch (err) {
      console.error('Error retrieving bill:', err);
      setError('Failed to retrieve bill');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Point of Sale
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<HoldIcon />}
            onClick={() => setHoldDialogOpen(true)}
            disabled={cart.length === 0 || !isOnline}
            sx={{ mr: 1 }}
          >
            Hold Bill
          </Button>
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={() => setRetrieveDialogOpen(true)}
            disabled={heldBills.length === 0 || !isOnline}
            sx={{ mr: 1 }}
          >
            Retrieve Bill
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchCart}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You are currently offline. Some features may be limited.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Left Column - Products */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Products
              </Typography>
              
              {/* Barcode Scanner */}
              <Box mb={2}>
                <TextField
                  fullWidth
                  placeholder="Scan barcode or search products..."
                  variant="outlined"
                  value={barcodeInput}
                  onChange={handleBarcodeChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BarcodeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              {/* Search */}
              <Box mb={2}>
                <TextField
                  fullWidth
                  placeholder="Search products..."
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
              </Box>
              
              {/* Products Grid */}
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                <Grid container spacing={2}>
                  {filteredMedicines.map((medicine) => (
                    <Grid item xs={12} sm={6} md={4} key={medicine.id}>
                      <Card
                        variant="outlined"
                        sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}
                        onClick={() => addToCart(medicine)}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Typography variant="subtitle2" noWrap>
                            {medicine.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {medicine.generic_name}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                            <Typography variant="h6">
                              ${medicine.selling_price}
                            </Typography>
                            <Chip
                              label={`Stock: ${medicine.stock_quantity || 0}`}
                              size="small"
                              color={medicine.stock_quantity > 10 ? 'success' : 'warning'}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Right Column - Cart */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Cart
                </Typography>
                <Badge badgeContent={cart.length} color="primary">
                  <CartIcon />
                </Badge>
              </Box>
              
              {/* Customer Information */}
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Customer Information
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Patient (Optional)</InputLabel>
                      <Select
                        value={selectedPatient?.id || ''}
                        onChange={(e) => {
                          const patient = patients.find(p => p.id === e.target.value);
                          setSelectedPatient(patient || null);
                          if (patient) {
                            setCustomerInfo({
                              name: patient.first_name + ' ' + patient.last_name,
                              phone: patient.phone || '',
                              email: patient.email || ''
                            });
                          }
                        }}
                        label="Patient (Optional)"
                      >
                        <MenuItem value="">None</MenuItem>
                        {patients.map((patient) => (
                          <MenuItem key={patient.id} value={patient.id}>
                            {patient.first_name} {patient.last_name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Cart Items */}
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {cart.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center" py={2}>
                    Cart is empty
                  </Typography>
                ) : (
                  cart.map((item) => (
                    <Box key={item.id} mb={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box flex={1}>
                          <Typography variant="body2" noWrap>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ${item.selling_price} × {item.quantity}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="body2" sx={{ mx: 1 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Discount */}
              <Box mb={2}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Discount Type</InputLabel>
                      <Select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value)}
                        label="Discount Type"
                      >
                        <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                        <MenuItem value="FIXED">Fixed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Discount"
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DiscountIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            {discountType === 'PERCENTAGE' ? '%' : '$'}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
              
              {/* Summary */}
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">${calculateSubtotal().toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Discount:</Typography>
                  <Typography variant="body2">-${calculateDiscount().toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Tax (8%):</Typography>
                  <Typography variant="body2">${calculateTax().toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">${calculateTotal().toFixed(2)}</Typography>
                </Box>
              </Box>
              
              {/* Action Buttons */}
              <Box mt={2}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      onClick={clearCart}
                      disabled={cart.length === 0}
                    >
                      Clear
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PaymentIcon />}
                      onClick={() => setPaymentDialogOpen(true)}
                      disabled={cart.length === 0 || !customerInfo.name}
                    >
                      Pay
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Payment</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Subtotal:</Typography>
              <Typography>${calculateSubtotal().toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Discount:</Typography>
              <Typography>-${calculateDiscount().toFixed(2)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Tax:</Typography>
              <Typography>${calculateTax().toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">${calculateTotal().toFixed(2)}</Typography>
            </Box>
          </Box>
          
          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              label="Payment Method"
            >
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="CARD">Card</MenuItem>
              <MenuItem value="INSURANCE">Insurance</MenuItem>
              <MenuItem value="ONLINE">Online</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePayment} variant="contained" disabled={loading}>
            {loading ? 'Processing...' : 'Complete Payment'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Hold Bill Dialog */}
      <Dialog open={holdDialogOpen} onClose={() => setHoldDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Hold Bill</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            id="hold-reason"
            label="Reason (Optional)"
            multiline
            rows={2}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHoldDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleHoldBill} variant="contained" disabled={loading}>
            {loading ? 'Holding...' : 'Hold Bill'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Retrieve Bill Dialog */}
      <Dialog open={retrieveDialogOpen} onClose={() => setRetrieveDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Retrieve Held Bill</DialogTitle>
        <DialogContent>
          {heldBills.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" py={2}>
              No held bills found
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {heldBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.customer_info?.name || 'N/A'}</TableCell>
                      <TableCell>{bill.items?.length || 0}</TableCell>
                      <TableCell>${bill.total_amount || '0.00'}</TableCell>
                      <TableCell>{new Date(bill.held_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleRetrieveBill(bill.id)}
                          disabled={loading}
                        >
                          Retrieve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRetrieveDialogOpen(false)}>Close</Button>
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

export default PointOfSale;