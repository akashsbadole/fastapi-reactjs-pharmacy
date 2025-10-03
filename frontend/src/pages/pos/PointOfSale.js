import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { api, endpoints } from '../../services/api';
import '../../styles/print.css';
import { useSwipeable } from 'react-swipeable';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  PrinterIcon,
  CreditCardIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  QrCodeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  CalendarIcon,
  CubeIcon,
  ArrowUturnLeftIcon,
  ArrowDownTrayIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  SunIcon,
  MoonIcon,
  ReceiptPercentIcon,
  GiftIcon,
  CalculatorIcon,
  ShareIcon,
  TagIcon as TagIconSolid,
  SparklesIcon,
  BoltIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  FaceSmileIcon,
  BuildingOfficeIcon,
  WalletIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  Bars3Icon,
  ComputerDesktopIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  InformationCircleIcon,
  LightBulbIcon,
  TicketIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { FunnelIcon as FunnelIconSolid } from '@heroicons/react/24/solid';
import Loader from '../../components/Loader';

const PointOfSale = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [splitPayments, setSplitPayments] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [isCustomerSearchLoading, setIsCustomerSearchLoading] = useState(false);
  const [prescriptionRequired, setPrescriptionRequired] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [posConfig, setPosConfig] = useState(null);
  const [showHoldBillsModal, setShowHoldBillsModal] = useState(false);
  const [heldBills, setHeldBills] = useState([]);
  const [holdReason, setHoldReason] = useState('');
  const [showHoldReasonModal, setShowHoldReasonModal] = useState(false);
  
  // Enhanced POS features state
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchFilter, setSearchFilter] = useState('all'); // all, name, generic, sku, barcode
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorValue, setCalculatorValue] = useState('0');
  const [calculatorOperation, setCalculatorOperation] = useState(null);
  const [previousValue, setPreviousValue] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesType, setNotesType] = useState(''); // 'cart' or 'item'
  const [notesIndex, setNotesIndex] = useState(null);
  const [cartNotes, setCartNotes] = useState('');
  const [itemNotes, setItemNotes] = useState({});
  const [discountType, setDiscountType] = useState('percentage'); // percentage or fixed
  const [discountValue, setDiscountValue] = useState('');
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountIndex, setDiscountIndex] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundItems, setRefundItems] = useState([]);
  const [showDigitalReceiptModal, setShowDigitalReceiptModal] = useState(false);
  const [digitalReceiptMethod, setDigitalReceiptMethod] = useState(''); // sms, email, whatsapp
  const [receiptPhoneNumber, setReceiptPhoneNumber] = useState('');
  const [receiptEmail, setReceiptEmail] = useState('');
  const [showBarcodePrintModal, setShowBarcodePrintModal] = useState(false);
  const [barcodePrintQuantity, setBarcodePrintQuantity] = useState(1);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftInfo, setShiftInfo] = useState(null);
  const [showOffersPanel, setShowOffersPanel] = useState(false);
  const [availableOffers, setAvailableOffers] = useState([]);
  const [activeTab, setActiveTab] = useState(0); // For multi-tab support
  const [tabs, setTabs] = useState([{ id: 0, name: 'Main POS', cart: [], customer: null }]);
  const [showMultiCounterModal, setShowMultiCounterModal] = useState(false);
  const [selectedCounter, setSelectedCounter] = useState(1);
  const [counters, setCounters] = useState([{ id: 1, name: 'Counter 1', active: true }]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingSync, setPendingSync] = useState([]);
  const [showSyncStatus, setShowSyncStatus] = useState(false);
  const [upsellSuggestions, setUpsellSuggestions] = useState([]);
  const [showUpsellPanel, setShowUpsellPanel] = useState(false);
  const [taxType, setTaxType] = useState('exclusive'); // exclusive or inclusive
  const [showStaffLoginModal, setShowStaffLoginModal] = useState(false);
  const [staffPin, setStaffPin] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showCashReconciliationModal, setShowCashReconciliationModal] = useState(false);
  const [cashReconciliationData, setCashReconciliationData] = useState({
    expectedCash: 0,
    actualCash: 0,
    difference: 0,
    notes: ''
  });
  
  // Refs
  const searchInputRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const quantityInputRef = useRef(null);
  
  // Touch-friendly state
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  
  // Fetch POS configuration
  const { data: config } = useQuery(
    'pos-config',
    () => api.get(endpoints.POS.CONFIG).then(res => res.data),
    {
      onSuccess: (data) => setPosConfig(data),
      refetchOnWindowFocus: false,
    }
  );
  
  // Fetch stock alerts
  const { data: alerts } = useQuery(
    'pos-stock-alerts',
    () => api.get(endpoints.POS.STOCK_ALERTS).then(res => res.data),
    {
      onSuccess: (data) => setStockAlerts(data),
      refetchInterval: 30000, // Refresh every 30 seconds
      refetchOnWindowFocus: false,
    }
  );
  
  // Fetch held bills
  const { data: heldBillsData, refetch: refetchHeldBills } = useQuery(
    'pos-held-bills',
    () => api.get(endpoints.POS.HOLD_BILL_LIST).then(res => res.data),
    {
      onSuccess: (data) => setHeldBills(data),
      refetchInterval: 60000, // Refresh every minute
      refetchOnWindowFocus: false,
    }
  );
  
  // Search customers
  const searchCustomers = async (query) => {
    if (!query || query.length < 2) {
      setCustomerSearchResults([]);
      return;
    }
    
    setIsCustomerSearchLoading(true);
    try {
      const response = await api.get(endpoints.PATIENTS.LIST, {
        params: { search: query, limit: 10 }
      });
      // The API returns a list directly, not wrapped in a patients object
      setCustomerSearchResults(response.data || []);
    } catch (error) {
      console.error('Error searching customers:', error);
      setCustomerSearchResults([]);
    } finally {
      setIsCustomerSearchLoading(false);
    }
  };
  
  // Handle customer search input
  const handleCustomerSearchInput = (e) => {
    const value = e.target.value;
    setCustomerSearchQuery(value);
    searchCustomers(value);
  };
  
  // Select existing customer
  const selectExistingCustomer = (patient) => {
    setCustomer({
      id: patient.id,
      name: patient.full_name, // Use full_name from PatientSummary
      phone: patient.phone,
      email: patient.email || '',
      address: '', // Address not available in PatientSummary
      is_walk_in: false
    });
    setShowCustomerModal(false);
    setCustomerSearchQuery('');
    setCustomerSearchResults([]);
  };
  
  // Search medicines
  const { data: searchResults, isLoading: isSearching } = useQuery(
    ['pos-medicine-search', searchQuery],
    () => api.get(endpoints.POS.MEDICINES_SEARCH, { 
      params: { query: searchQuery, limit: 20 } 
    }).then(res => res.data),
    {
      enabled: searchQuery.length >= 2,
      refetchOnWindowFocus: false,
    }
  );
  
  // Barcode scan mutation
  const barcodeScanMutation = useMutation(
    (barcode) => api.post(endpoints.POS.BARCODE_SCAN, { barcode }),
    {
      onSuccess: (data) => {
        addToCart(data);
        setBarcodeInput('');
        toast.success('Medicine added to cart');
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.detail || 'Failed to scan barcode';
        toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to scan barcode');
        setBarcodeInput('');
      }
    }
  );
  
  // Calculate cart totals
  const calculateTotals = useCallback(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const discountTotal = cart.reduce((sum, item) => sum + (item.discount || 0), 0);
    const taxableAmount = subtotal - discountTotal;
    const taxAmount = taxableAmount * (posConfig?.tax_rate || 0.05);
    const totalAmount = taxableAmount + taxAmount;
    
    return {
      subtotal,
      discountTotal,
      taxAmount,
      totalAmount
    };
  }, [cart, posConfig]);
  
  const totals = calculateTotals();
  
  // Add medicine to cart
  const addToCart = (medicine, batch = null, quantity = 1) => {
    const selectedBatch = batch || (medicine.batches && medicine.batches[0]);
    if (!selectedBatch) {
      toast.error('No available batches for this medicine');
      return;
    }
    
    // Check if already in cart
    const existingItemIndex = cart.findIndex(
      item => item.medicine_id === medicine.id && item.batch_id === selectedBatch.id
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity
      const newCart = [...cart];
      const existingItem = newCart[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > selectedBatch.current_stock) {
        toast.error('Insufficient stock available');
        return;
      }
      
      newCart[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        total: (existingItem.unit_price * newQuantity) - (existingItem.discount || 0)
      };
      setCart(newCart);
    } else {
      // Add new item
      const cartItem = {
        medicine_id: medicine.id,
        medicine_name: medicine.name,
        batch_id: selectedBatch.id,
        batch_number: selectedBatch.batch_number,
        quantity,
        unit_price: selectedBatch.selling_price,
        discount: 0,
        total: selectedBatch.selling_price * quantity,
        requires_prescription: medicine.requires_prescription,
        prescription_id: null,
        expiry_date: selectedBatch.expiry_date,
        stock_available: selectedBatch.current_stock
      };
      
      setCart([...cart, cartItem]);
      
      // Check if prescription is required
      if (medicine.requires_prescription) {
        setPrescriptionRequired(true);
        toast('This medicine requires a prescription', {
          icon: '⚠️',
        });
      }
    }
  };
  
  // Update cart item quantity
  const updateCartItemQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    
    const item = cart[index];
    if (newQuantity > item.stock_available) {
      toast.error('Insufficient stock available');
      return;
    }
    
    const newCart = [...cart];
    newCart[index] = {
      ...item,
      quantity: newQuantity,
      total: (item.unit_price * newQuantity) - (item.discount || 0)
    };
    setCart(newCart);
  };
  
  // Remove from cart
  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };
  
  // Handle barcode input
  const handleBarcodeInput = (e) => {
    const value = e.target.value;
    setBarcodeInput(value);
    
    // If Enter is pressed, scan the barcode
    if (e.key === 'Enter' && value) {
      barcodeScanMutation.mutate(value);
    }
  };
  
  // Handle search input
  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Process sale mutation
  const processSaleMutation = useMutation(
    (saleData) => api.post(endpoints.POS.PROCESS_SALE, saleData),
    {
      onSuccess: (data) => {
        toast.success('Sale processed successfully');
        setCart([]);
        setCustomer(null);
        setShowPaymentModal(false);
        generateReceipt(data.data.id);
        queryClient.invalidateQueries('pos-stock-alerts');
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.detail || 'Failed to process sale';
        toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to process sale');
        setIsProcessing(false);
      }
    }
  );
  
  // Quick sale mutation
  const quickSaleMutation = useMutation(
    (saleData) => api.post(endpoints.POS.QUICK_SALE, saleData),
    {
      onSuccess: (data) => {
        toast.success('Quick sale processed successfully');
        generateReceipt(data.data.id);
        queryClient.invalidateQueries('pos-stock-alerts');
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.detail || 'Failed to process quick sale';
        toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to process quick sale');
        setIsProcessing(false);
      }
    }
  );
  
  // Hold bill mutation
  const holdBillMutation = useMutation(
    (holdData) => api.post(endpoints.POS.HOLD_BILL, holdData),
    {
      onSuccess: () => {
        toast.success('Bill held successfully');
        setCart([]);
        setCustomer(null);
        setShowHoldReasonModal(false);
        setHoldReason('');
        refetchHeldBills();
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.detail || 'Failed to hold bill';
        toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to hold bill');
      }
    }
  );
  
  // Release hold bill mutation
  const releaseHoldBillMutation = useMutation(
    (holdId) => api.post(endpoints.POS.RELEASE_HOLD_BILL(holdId)),
    {
      onSuccess: (data) => {
        toast.success('Bill released successfully');
        setCart(data.data.cart_data.items || []);
        setCustomer(data.data.cart_data.customer || null);
        setShowHoldBillsModal(false);
        refetchHeldBills();
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.detail || 'Failed to release bill';
        toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to release bill');
      }
    }
  );
  
  // Delete hold bill mutation
  const deleteHoldBillMutation = useMutation(
    (holdId) => api.delete(endpoints.POS.DELETE_HOLD_BILL(holdId)),
    {
      onSuccess: () => {
        toast.success('Hold bill deleted successfully');
        refetchHeldBills();
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.detail || 'Failed to delete hold bill';
        toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to delete hold bill');
      }
    }
  );
  
  // Generate receipt
  const generateReceipt = async (invoiceId) => {
    try {
      const receiptData = await api.get(endpoints.POS.RECEIPT(invoiceId));
      setCurrentReceipt(receiptData.data);
      setShowReceiptModal(true);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to generate receipt';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to generate receipt');
    }
  };
  
  // Print receipt
  const printReceipt = () => {
    if (!currentReceipt) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Generate the HTML content for the receipt
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt #${currentReceipt.receipt_number}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 15px;
            width: 80mm;
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
          }
          .header h2 {
            margin: 0;
            font-size: 16px;
            font-weight: bold;
          }
          .header p {
            margin: 3px 0;
            font-size: 10px;
          }
          .info {
            margin-bottom: 10px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .items {
            margin-bottom: 15px;
          }
          .item {
            margin-bottom: 5px;
          }
          .item-name {
            font-weight: bold;
          }
          .item-details {
            font-size: 10px;
            color: #666;
          }
          .item-price {
            text-align: right;
          }
          .totals {
            border-top: 1px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .total-row.grand-total {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px dashed #000;
            padding-top: 5px;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            border-top: 1px dashed #000;
            padding-top: 10px;
            font-size: 10px;
          }
          @media print {
            body { margin: 0; padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${currentReceipt.store_info.name}</h2>
          <p>${currentReceipt.store_info.address}</p>
          <p>${currentReceipt.store_info.phone}</p>
        </div>
        
        <div class="info">
          <div class="info-row">
            <span>Receipt #:</span>
            <span>${currentReceipt.receipt_number}</span>
          </div>
          <div class="info-row">
            <span>Date:</span>
            <span>${new Date(currentReceipt.date_time).toLocaleString()}</span>
          </div>
          <div class="info-row">
            <span>Customer:</span>
            <span>${currentReceipt.customer_info.name}</span>
          </div>
          <div class="info-row">
            <span>Cashier:</span>
            <span>${currentReceipt.cashier_name}</span>
          </div>
        </div>
        
        <div class="items">
          ${currentReceipt.items.map(item => `
            <div class="item">
              <div class="item-name">${item.medicine_name}</div>
              <div class="item-details">${item.quantity} × ${formatCurrency(item.unit_price)}</div>
              <div class="item-price">${formatCurrency(item.total)}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(currentReceipt.subtotal)}</span>
          </div>
          <div class="total-row">
            <span>Tax:</span>
            <span>${formatCurrency(currentReceipt.tax_amount)}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total:</span>
            <span>${formatCurrency(currentReceipt.total_amount)}</span>
          </div>
          ${currentReceipt.change > 0 ? `
            <div class="total-row">
              <span>Change:</span>
              <span>${formatCurrency(currentReceipt.change)}</span>
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>${currentReceipt.store_info?.footer || 'Thank you for visiting!'}</p>
        </div>
      </body>
      </html>
    `;
    
    // Write the HTML to the new window
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    // Wait for the content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };
  
  // Process payment
  const processPayment = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    
    if (!customer && !customerPhone) {
      toast.error('Please add customer information');
      return;
    }
    
    // Check prescription requirements
    const prescriptionNeeded = cart.find(item => item.requires_prescription && !item.prescription_id);
    if (prescriptionNeeded) {
      toast.error('Prescription required for some items');
      return;
    }
    
    setIsProcessing(true);
    
    const saleData = {
      patient_id: customer?.id || null,
      customer_info: customer ? null : {
        name: customerName || 'Walk-in Customer',
        phone: customerPhone,
        email: '',
        address: '',
        age: null,
        gender: null,
        is_existing_patient: false
      },
      items: cart,
      payment_mode: paymentMode.toUpperCase(),
      payments: splitPayments.length > 0 ? splitPayments : [{
        amount: totals.totalAmount,
        payment_mode: paymentMode.toUpperCase(),
        transaction_id: null,
        notes: null
      }],
      subtotal: totals.subtotal,
      tax_amount: totals.taxAmount,
      discount_amount: totals.discountTotal,
      total_amount: totals.totalAmount,
      notes: '',
      prescription_ids: cart.filter(item => item.prescription_id).map(item => item.prescription_id)
    };
    
    processSaleMutation.mutate(saleData);
  };
  
  // Add customer
  const addCustomer = () => {
    if (!customerPhone) {
      toast.error('Phone number is required');
      return;
    }
    
    setCustomer({
      name: customerName || 'Walk-in Customer',
      phone: customerPhone,
      email: '',
      address: '',
      is_walk_in: true
    });
    
    setShowCustomerModal(false);
    setCustomerPhone('');
    setCustomerName('');
  };
  
  // Hold bill
  const holdBill = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    
    if (!holdReason.trim()) {
      toast.error('Please provide a reason for holding the bill');
      return;
    }
    
    const holdData = {
      cart_data: {
        items: cart,
        customer: customer,
        totals: totals
      },
      customer_info: customer ? null : {
        name: customerName || 'Walk-in Customer',
        phone: customerPhone,
        email: '',
        address: '',
        age: null,
        gender: null,
        is_existing_patient: false
      },
      hold_reason: holdReason
    };
    
    holdBillMutation.mutate(holdData);
  };
  
  // Release hold bill
  const releaseHoldBill = (holdId) => {
    releaseHoldBillMutation.mutate(holdId);
  };
  
  // Delete hold bill
  const deleteHoldBill = (holdId) => {
    if (window.confirm('Are you sure you want to delete this held bill?')) {
      deleteHoldBillMutation.mutate(holdId);
    }
  };
  
  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Ctrl/Cmd + B for barcode focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      }
      
      // F1 for customer modal
      if (e.key === 'F1') {
        e.preventDefault();
        setShowCustomerModal(true);
      }
      
      // F2 for payment
      if (e.key === 'F2') {
        e.preventDefault();
        if (cart.length > 0) {
          setShowPaymentModal(true);
        }
      }
      
      // F3 for calculator
      if (e.key === 'F3') {
        e.preventDefault();
        setShowCalculator(!showCalculator);
      }
      
      // F4 for discount
      if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) {
          setShowDiscountModal(true);
        }
      }
      
      // F5 for notes
      if (e.key === 'F5') {
        e.preventDefault();
        setShowNotesModal(true);
        setNotesType('cart');
      }
      
      // F6 for coupons
      if (e.key === 'F6') {
        e.preventDefault();
        setShowCouponModal(true);
      }
      
      // F7 for offers
      if (e.key === 'F7') {
        e.preventDefault();
        setShowOffersPanel(!showOffersPanel);
      }
      
      // F8 for calculator
      if (e.key === 'F8') {
        e.preventDefault();
        setShowCalculator(!showCalculator);
      }
      
      // F9 for dark mode toggle
      if (e.key === 'F9') {
        e.preventDefault();
        setDarkMode(!darkMode);
      }
      
      // F10 for shift management
      if (e.key === 'F10') {
        e.preventDefault();
        setShowShiftModal(!showShiftModal);
      }
      
      // Ctrl/Cmd + T for new tab
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        const newTabId = Math.max(...tabs.map(t => t.id)) + 1;
        setTabs([...tabs, { id: newTabId, name: `POS ${newTabId + 1}`, cart: [], customer: null }]);
        setActiveTab(newTabId);
      }
      
      // Ctrl/Cmd + 1-9 for tab switching
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex].id);
        }
      }
      
      // Ctrl/Cmd + D for discount
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (cart.length > 0) {
          setShowDiscountModal(true);
        }
      }
      
      // Ctrl/Cmd + N for notes
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowNotesModal(true);
        setNotesType('cart');
      }
      
      // Ctrl/Cmd + H for hold bill
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        if (cart.length > 0) {
          setShowHoldReasonModal(true);
        }
      }
      
      // Ctrl/Cmd + R for refund
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        setShowRefundModal(true);
      }
      
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowPaymentModal(false);
        setShowReceiptModal(false);
        setShowCustomerModal(false);
        setShowCalculator(false);
        setShowNotesModal(false);
        setShowDiscountModal(false);
        setShowCouponModal(false);
        setShowRefundModal(false);
        setShowDigitalReceiptModal(false);
        setShowBarcodePrintModal(false);
        setShowShiftModal(false);
        setShowOffersPanel(false);
        setShowUpsellPanel(false);
        setShowStaffLoginModal(false);
        setShowCashReconciliationModal(false);
        setShowMultiCounterModal(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, showCalculator, showOffersPanel, darkMode, showShiftModal, tabs]);
  
  // Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Back online! Syncing pending transactions...');
      // Trigger sync of pending transactions
      if (pendingSync.length > 0) {
        syncPendingTransactions();
      }
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      toast.error('Connection lost. Working in offline mode.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSync]);
  
  // Auto-complete search suggestions
  useEffect(() => {
    if (searchQuery.length >= 2) {
      // Simulate search suggestions (in real app, this would be an API call)
      const timer = setTimeout(() => {
        // This would be replaced with actual API call
        // For now, we'll just show/hide suggestions based on search results
        setShowSearchSuggestions(true);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setShowSearchSuggestions(false);
      setSearchSuggestions([]);
    }
  }, [searchQuery]);
  
  // Save current tab state
  useEffect(() => {
    const currentTab = tabs.find(t => t.id === activeTab);
    if (currentTab) {
      const updatedTabs = tabs.map(t =>
        t.id === activeTab
          ? { ...t, cart, customer }
          : t
      );
      setTabs(updatedTabs);
    }
  }, [cart, customer, activeTab]);
  
  // Load current tab state
  useEffect(() => {
    const currentTab = tabs.find(t => t.id === activeTab);
    if (currentTab) {
      setCart(currentTab.cart || []);
      setCustomer(currentTab.customer || null);
    }
  }, [activeTab]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return `${posConfig?.currency_symbol || '$'}${amount.toFixed(2)}`;
  };
  
  // Get expiry status color
  const getExpiryStatusColor = (expiryDate) => {
    const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 0) return 'text-red-600 bg-red-100';
    if (daysUntilExpiry <= 30) return 'text-orange-600 bg-orange-100';
    if (daysUntilExpiry <= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };
  
  // Get stock status color
  const getStockStatusColor = (currentStock, reorderLevel) => {
    if (currentStock === 0) return 'text-red-600 bg-red-100';
    if (currentStock <= reorderLevel) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };
  
  // Enhanced utility functions
  const syncPendingTransactions = async () => {
    // Function to sync pending transactions when back online
    try {
      for (const transaction of pendingSync) {
        // Sync each pending transaction
        await api.post('/api/pos/sync-transaction', transaction);
      }
      setPendingSync([]);
      toast.success('All transactions synced successfully');
    } catch (error) {
      toast.error('Failed to sync some transactions');
    }
  };
  
  const handleCalculatorInput = (value) => {
    if (value === 'C') {
      setCalculatorValue('0');
      setCalculatorOperation(null);
      setPreviousValue(null);
    } else if (value === '=') {
      if (previousValue !== null && calculatorOperation) {
        const current = parseFloat(calculatorValue);
        const previous = parseFloat(previousValue);
        let result;
        
        switch (calculatorOperation) {
          case '+':
            result = previous + current;
            break;
          case '-':
            result = previous - current;
            break;
          case '*':
            result = previous * current;
            break;
          case '/':
            result = previous / current;
            break;
          default:
            return;
        }
        
        setCalculatorValue(result.toString());
        setCalculatorOperation(null);
        setPreviousValue(null);
      }
    } else if (['+', '-', '*', '/'].includes(value)) {
      setPreviousValue(calculatorValue);
      setCalculatorOperation(value);
      setCalculatorValue('0');
    } else {
      setCalculatorValue(calculatorValue === '0' ? value : calculatorValue + value);
    }
  };
  
  const applyDiscount = (index) => {
    const newCart = [...cart];
    const item = newCart[index];
    
    if (discountType === 'percentage') {
      const discountAmount = (item.unit_price * item.quantity * discountValue) / 100;
      item.discount = discountAmount;
      item.total = (item.unit_price * item.quantity) - discountAmount;
    } else {
      item.discount = Math.min(discountValue, item.total);
      item.total = (item.unit_price * item.quantity) - discountValue;
    }
    
    setCart(newCart);
    setShowDiscountModal(false);
    setDiscountValue('');
    setDiscountIndex(null);
  };
  
  const applyCoupon = () => {
    // Simulate coupon application (in real app, this would validate with backend)
    if (couponCode === 'SAVE10') {
      setAppliedCoupon({ code: couponCode, discount: 0.1, type: 'percentage' });
      toast.success('Coupon applied: 10% discount');
    } else if (couponCode === 'SAVE20') {
      setAppliedCoupon({ code: couponCode, discount: 20, type: 'fixed' });
      toast.success('Coupon applied: $20 discount');
    } else {
      toast.error('Invalid coupon code');
    }
    setShowCouponModal(false);
    setCouponCode('');
  };
  
  const addNotesToItem = (index, notes) => {
    const newItemNotes = { ...itemNotes };
    newItemNotes[index] = notes;
    setItemNotes(newItemNotes);
    setShowNotesModal(false);
    setNotesIndex(null);
  };
  
  const sendDigitalReceipt = async () => {
    try {
      const receiptData = {
        method: digitalReceiptMethod,
        phone: receiptPhoneNumber,
        email: receiptEmail,
        receiptId: currentReceipt?.id
      };
      
      await api.post('/api/pos/send-digital-receipt', receiptData);
      toast.success(`Receipt sent via ${digitalReceiptMethod}`);
      setShowDigitalReceiptModal(false);
    } catch (error) {
      toast.error('Failed to send receipt');
    }
  };
  
  const printBarcodeLabels = async () => {
    try {
      await api.post('/api/pos/print-barcodes', {
        medicineId: selectedMedicine?.id,
        quantity: barcodePrintQuantity
      });
      toast.success('Barcode labels sent to printer');
      setShowBarcodePrintModal(false);
    } catch (error) {
      toast.error('Failed to print barcode labels');
    }
  };
  
  const processRefund = async () => {
    try {
      const refundData = {
        items: refundItems,
        reason: refundReason,
        refundAmount: refundItems.reduce((sum, item) => sum + item.refundAmount, 0)
      };
      
      await api.post('/api/pos/process-refund', refundData);
      toast.success('Refund processed successfully');
      setShowRefundModal(false);
      setRefundItems([]);
      setRefundReason('');
    } catch (error) {
      toast.error('Failed to process refund');
    }
  };
  
  const generateUpsellSuggestions = () => {
    // Generate upsell suggestions based on cart items
    const suggestions = [];
    cart.forEach(item => {
      // Simulate upsell suggestions (in real app, this would come from backend)
      if (item.medicine_name.includes('Paracetamol')) {
        suggestions.push({
          name: 'Ibuprofen',
          reason: 'Often purchased together with pain relievers',
          price: 5.99
        });
      }
      if (item.medicine_name.includes('Vitamin')) {
        suggestions.push({
          name: 'Vitamin C Supplement',
          reason: 'Complete your vitamin regimen',
          price: 12.99
        });
      }
    });
    setUpsellSuggestions(suggestions);
  };
  
  const switchTab = (tabId) => {
    setActiveTab(tabId);
  };
  
  const closeTab = (tabId) => {
    if (tabs.length > 1) {
      const newTabs = tabs.filter(t => t.id !== tabId);
      setTabs(newTabs);
      if (activeTab === tabId) {
        setActiveTab(newTabs[0].id);
      }
    }
  };
  
  const processStaffLogin = async () => {
    try {
      const response = await api.post('/api/auth/staff-login', { pin: staffPin });
      setCurrentUser(response.data);
      setShowStaffLoginModal(false);
      setStaffPin('');
      toast.success('Staff login successful');
    } catch (error) {
      toast.error('Invalid staff PIN');
    }
  };
  
  const endShift = async () => {
    try {
      const shiftData = {
        ...cashReconciliationData,
        staffId: currentUser?.id,
        endTime: new Date()
      };
      
      await api.post('/api/pos/end-shift', shiftData);
      toast.success('Shift ended successfully');
      setShowCashReconciliationModal(false);
      setCashReconciliationData({
        expectedCash: 0,
        actualCash: 0,
        difference: 0,
        notes: ''
      });
    } catch (error) {
      toast.error('Failed to end shift');
    }
  };
  
  // Touch event handlers for swipe actions
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    setIsSwiping(false);
  };
  
  const handleTouchMove = (e) => {
    if (!touchStartX || !touchStartY) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    // Check if it's a horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      setIsSwiping(true);
    }
  };
  
  const handleTouchEnd = (e, itemIndex) => {
    if (!touchStartX || !touchStartY || !isSwiping) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    
    // Swipe left to remove item
    if (deltaX < -50) {
      removeFromCart(itemIndex);
      toast.success('Item removed from cart');
    }
    // Swipe right to add notes
    else if (deltaX > 50) {
      setNotesIndex(itemIndex);
      setNotesType('item');
      setShowNotesModal(true);
    }
    
    setTouchStartX(null);
    setTouchStartY(null);
    setIsSwiping(false);
  };
  
  // Swipe handlers for cart items
  const getSwipeHandlers = (index) => ({
    onSwipedLeft: () => {
      removeFromCart(index);
      toast.success('Item removed from cart');
    },
    onSwipedRight: () => {
      setNotesIndex(index);
      setNotesType('item');
      setShowNotesModal(true);
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });
  
  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Point of Sale</h1>
            <div className={`flex items-center space-x-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              <UserIcon className="h-4 w-4" />
              <span>Cashier: {localStorage.getItem('userName') || 'User'}</span>
            </div>
            {/* Offline indicator */}
            {isOffline && (
              <div className="flex items-center space-x-2 text-sm text-orange-600">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span>Offline Mode</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Stock Alerts */}
            {stockAlerts && stockAlerts.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-orange-600">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span>{stockAlerts.length} Stock Alerts</span>
              </div>
            )}
             
            {/* Customer Info */}
            {customer && (
              <div className={`flex items-center space-x-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <UserIcon className="h-4 w-4" />
                <span>{customer.name}</span>
                <span>({customer.phone})</span>
              </div>
            )}
             
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
              title="Toggle Dark Mode (F9)"
            >
              {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button>
            
            {/* Calculator */}
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
              title="Calculator (F3)"
            >
              <CalculatorIcon className="h-4 w-4" />
            </button>
            
            {/* Multi-counter */}
            <button
              onClick={() => setShowMultiCounterModal(true)}
              className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
              title="Switch Counter"
            >
              <ComputerDesktopIcon className="h-4 w-4" />
            </button>
            
            {/* Staff Login */}
            <button
              onClick={() => setShowStaffLoginModal(true)}
              className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
              title="Staff Login"
            >
              <UserIcon className="h-4 w-4" />
            </button>
            
            {/* Shift Management */}
            <button
              onClick={() => setShowShiftModal(true)}
              className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
              title="Shift Management (F10)"
            >
              <ClockIcon className="h-4 w-4" />
            </button>
            
            {/* Offers */}
            <button
              onClick={() => {
                setShowOffersPanel(!showOffersPanel);
                generateUpsellSuggestions();
              }}
              className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
              title="Offers & Upsells (F7)"
            >
              <SparklesIcon className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setShowHoldBillsModal(true)}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 mr-2"
            >
              <ClockIcon className="h-4 w-4 inline mr-1" />
              Held Bills ({heldBills.length})
            </button>
            <button
              onClick={() => setShowCustomerModal(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Customer
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center space-x-1 mt-3 border-t border-gray-200 pt-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`px-3 py-1 text-sm rounded-t-md flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <span>{tab.name}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="ml-1 hover:bg-red-500 hover:text-white rounded p-0.5"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              )}
            </button>
          ))}
          <button
            onClick={() => {
              const newTabId = Math.max(...tabs.map(t => t.id)) + 1;
              setTabs([...tabs, { id: newTabId, name: `POS ${newTabId + 1}`, cart: [], customer: null }]);
              setActiveTab(newTabId);
            }}
            className={`px-3 py-1 text-sm rounded-t-md ${
              darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title="New Tab (Ctrl+T)"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Main Content - Two Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane - Product Search */}
        <div className={`w-1/2 flex flex-col border-r ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          {/* Search and Barcode */}
          <div className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
            {/* Search Filters */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                  title="Search Filters"
                >
                  <FunnelIcon className="h-4 w-4" />
                </button>
                <select
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className={`px-2 py-1 text-sm border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="all">All Fields</option>
                  <option value="name">Medicine Name</option>
                  <option value="generic">Generic Name</option>
                  <option value="sku">SKU</option>
                  <option value="barcode">Barcode</option>
                </select>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`px-2 py-1 text-sm border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value="all">All Categories</option>
                  <option value="antibiotics">Antibiotics</option>
                  <option value="pain_relief">Pain Relief</option>
                  <option value="vitamins">Vitamins</option>
                  <option value="chronic">Chronic Medicines</option>
                </select>
              </div>
              <div className="text-sm text-gray-500">
                {searchResults ? `${searchResults.length} results` : 'No results'}
              </div>
            </div>
            
            {/* Barcode Scanner */}
            <div className="mb-4">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Barcode Scanner (Ctrl+B)
              </label>
              <div className="relative">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={handleBarcodeInput}
                  onKeyDown={handleBarcodeInput}
                  placeholder="Scan barcode or enter manually"
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <QrCodeIcon className={`absolute right-3 top-2.5 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
            </div>
            
            {/* Medicine Search with Auto-complete */}
            <div className="relative">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Search Medicines (Ctrl+K)
              </label>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  placeholder="Search by name, generic name, SKU..."
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <MagnifyingGlassIcon className={`absolute right-3 top-2.5 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
              
              {/* Search Suggestions */}
              {showSearchSuggestions && searchResults && searchResults.length > 0 && (
                <div className={`absolute z-10 w-full mt-1 rounded-md shadow-lg max-h-60 overflow-auto ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                } border`}>
                  {searchResults.slice(0, 5).map((medicine) => (
                    <div
                      key={medicine.id}
                      onClick={() => {
                        setSearchQuery(medicine.name);
                        setShowSearchSuggestions(false);
                        addToCart(medicine);
                      }}
                      className={`px-4 py-2 cursor-pointer flex items-center justify-between ${
                        darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div>
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {medicine.name}
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {medicine.generic_name} • {formatCurrency(medicine.selling_price)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStockStatusColor(medicine.stock_quantity, 10)}`}>
                          Stock: {medicine.stock_quantity}
                        </span>
                        <PlusIcon className="h-4 w-4 text-blue-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Search Results */}
          <div className="flex-1 overflow-y-auto p-4">
            {isSearching ? (
              <Loader text="Searching medicines..." />
            ) : searchResults && searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((medicine) => (
                  <div
                    key={medicine.id}
                    className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer`}
                    onClick={() => setSelectedMedicine(medicine)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {/* Product Thumbnail */}
                        <div className={`w-16 h-16 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                          {medicine.image_url ? (
                            <img src={medicine.image_url} alt={medicine.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <CubeIcon className={`h-8 w-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{medicine.name}</h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{medicine.generic_name}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <TagIcon className="h-3 w-3 mr-1" />
                              {medicine.sku}
                            </span>
                            <span className="flex items-center">
                              <CubeIcon className="h-3 w-3 mr-1" />
                              {medicine.dosage_form}
                            </span>
                            <span className="flex items-center">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {medicine.strength}
                            </span>
                            {medicine.manufacturer && (
                              <span className="flex items-center">
                                <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                                {medicine.manufacturer}
                              </span>
                            )}
                          </div>
                          
                          {/* Additional Product Details */}
                          <div className="flex items-center space-x-2 mt-2">
                            {medicine.category && (
                              <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-blue-100 text-blue-600'}`}>
                                {medicine.category}
                              </span>
                            )}
                            {medicine.schedule && (
                              <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-purple-100 text-purple-600'}`}>
                                Schedule {medicine.schedule}
                              </span>
                            )}
                          </div>
                           
                          {/* Stock and Expiry Info */}
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStockStatusColor(medicine.stock_quantity, 10)}`}>
                              Stock: {medicine.stock_quantity}
                            </span>
                            {medicine.batches && medicine.batches.length > 0 && (
                              <span className={`px-2 py-1 text-xs rounded-full ${getExpiryStatusColor(medicine.batches[0].expiry_date)}`}>
                                Exp: {new Date(medicine.batches[0].expiry_date).toLocaleDateString()}
                              </span>
                            )}
                            {medicine.requires_prescription && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">
                                Rx Required
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                       
                      <div className="text-right ml-4">
                        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(medicine.selling_price)}
                        </p>
                        {medicine.batches && medicine.batches.length > 0 && (
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {medicine.batches.length} batch{medicine.batches.length > 1 ? 'es' : ''} available
                          </p>
                        )}
                        <div className="flex flex-col space-y-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(medicine);
                            }}
                            className="px-4 py-3 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 touch-manipulation font-medium"
                          >
                            Quick Add
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMedicine(medicine);
                            }}
                            className={`px-4 py-3 text-sm rounded-lg border touch-manipulation font-medium ${
                              darkMode
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                     
                    {/* Batch Selection */}
                    {selectedMedicine?.id === medicine.id && medicine.batches && (
                      <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Select Batch:</p>
                        <div className="space-y-2">
                          {medicine.batches.map((batch) => (
                            <div
                              key={batch.id}
                              className={`flex items-center justify-between p-2 rounded-md ${darkMode ? 'bg-gray-600' : 'bg-gray-50'}`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{batch.batch_number}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${getExpiryStatusColor(batch.expiry_date)}`}>
                                  Exp: {new Date(batch.expiry_date).toLocaleDateString()}
                                </span>
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Stock: {batch.current_stock}
                                </span>
                                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                  Mfg: {new Date(batch.manufacture_date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {formatCurrency(batch.selling_price)}
                                </span>
                                <input
                                  type="number"
                                  min="1"
                                  max={batch.current_stock}
                                  defaultValue="1"
                                  ref={quantityInputRef}
                                  className={`w-16 px-2 py-1 text-sm border rounded-md ${
                                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const quantity = parseInt(e.target.previousElementSibling.value) || 1;
                                    addToCart(medicine, batch, quantity);
                                  }}
                                  className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 touch-manipulation font-medium"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No medicines found matching your search.
              </div>
            ) : (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Start typing to search medicines or scan a barcode.
              </div>
            )}
          </div>
        </div>
        
        {/* Right Pane - Cart */}
        <div className={`w-1/2 flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Cart Header with Running Total */}
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Shopping Cart
              </h2>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            {cart.length > 0 && (
              <div className={`text-center p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>Running Total</p>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-blue-600'}`}>
                  {formatCurrency(totals.totalAmount)}
                </p>
              </div>
            )}
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <ShoppingCartIcon className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p>Your cart is empty</p>
                <p className="text-sm">Add medicines to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    {...useSwipeable(getSwipeHandlers(index))}
                    className={`rounded-lg p-3 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} touch-manipulation transition-all duration-200 hover:shadow-md`}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={(e) => handleTouchEnd(e, index)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.medicine_name}</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Batch: {item.batch_number} | Exp: {new Date(item.expiry_date).toLocaleDateString()}
                        </p>
                        {item.requires_prescription && (
                          <p className="text-sm text-red-600">
                            Prescription Required
                            {item.prescription_id && ` (ID: ${item.prescription_id})`}
                          </p>
                        )}
                        {itemNotes[index] && (
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                            <DocumentTextIcon className="h-3 w-3 inline mr-1" />
                            {itemNotes[index]}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setNotesIndex(index);
                            setNotesType('item');
                            setShowNotesModal(true);
                          }}
                          className={`p-2 rounded ${darkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'} touch-manipulation`}
                          title="Add Notes (F5)"
                        >
                          <DocumentTextIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setDiscountIndex(index);
                            setShowDiscountModal(true);
                          }}
                          className={`p-2 rounded ${darkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'} touch-manipulation`}
                          title="Apply Discount (F4)"
                        >
                          <ReceiptPercentIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="p-2 text-red-500 hover:text-red-700 touch-manipulation"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                          className={`p-3 rounded-md ${darkMode ? 'bg-gray-600 border-gray-500 hover:bg-gray-500' : 'bg-white border border-gray-300 hover:bg-gray-100'} touch-manipulation`}
                        >
                          <MinusIcon className="h-5 w-5" />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateCartItemQuantity(index, parseInt(e.target.value) || 1)}
                          className={`w-20 text-center font-medium border rounded-lg text-lg py-2 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          min="1"
                          max={item.stock_available}
                        />
                        <button
                          onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                          className={`p-3 rounded-md ${darkMode ? 'bg-gray-600 border-gray-500 hover:bg-gray-500' : 'bg-white border border-gray-300 hover:bg-gray-100'} touch-manipulation`}
                        >
                          <PlusIcon className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatCurrency(item.unit_price)} × {item.quantity}
                        </p>
                        {item.discount > 0 && (
                          <p className="text-sm text-green-600">
                            Discount: -{formatCurrency(item.discount)}
                          </p>
                        )}
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(item.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className={`border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4`}>
              {/* Coupon and Notes */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowCouponModal(true)}
                    className={`flex-1 px-3 py-2 text-sm rounded-md ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <TicketIcon className="h-4 w-4 inline mr-1" />
                    Apply Coupon (F6)
                  </button>
                  <button
                    onClick={() => {
                      setNotesType('cart');
                      setShowNotesModal(true);
                    }}
                    className={`flex-1 px-3 py-2 text-sm rounded-md ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                    Add Notes (F5)
                  </button>
                </div>
                
                {/* Applied Coupon */}
                {appliedCoupon && (
                  <div className={`p-2 rounded-md ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Coupon Applied: {appliedCoupon.code}</span>
                      <button
                        onClick={() => setAppliedCoupon(null)}
                        className="text-green-500 hover:text-green-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Cart Notes */}
                {cartNotes && (
                  <div className={`p-2 rounded-md ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    <p className="text-sm">
                      <DocumentTextIcon className="h-3 w-3 inline mr-1" />
                      {cartNotes}
                    </p>
                  </div>
                )}
                
                {/* Tax Type Toggle */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tax Type:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setTaxType('exclusive')}
                      className={`px-2 py-1 text-xs rounded ${
                        taxType === 'exclusive'
                          ? 'bg-blue-500 text-white'
                          : darkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Exclusive
                    </button>
                    <button
                      onClick={() => setTaxType('inclusive')}
                      className={`px-2 py-1 text-xs rounded ${
                        taxType === 'inclusive'
                          ? 'bg-blue-500 text-white'
                          : darkMode
                          ? 'bg-gray-700 text-gray-300'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Inclusive
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.discountTotal > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(totals.discountTotal)}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon ({appliedCoupon.code}):</span>
                    <span>
                      -{formatCurrency(
                        appliedCoupon.type === 'percentage'
                          ? totals.subtotal * appliedCoupon.discount
                          : appliedCoupon.discount
                      )}
                    </span>
                  </div>
                )}
                <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <span>Tax ({((posConfig?.tax_rate || 0.05) * 100).toFixed(0)}%):</span>
                  <span>{formatCurrency(totals.taxAmount)}</span>
                </div>
                <div className={`flex justify-between text-lg font-bold pt-2 border-t ${darkMode ? 'border-gray-600 text-white' : 'border-gray-200 text-gray-900'}`}>
                  <span>Total:</span>
                  <span>
                    {formatCurrency(
                      totals.totalAmount - (appliedCoupon
                        ? appliedCoupon.type === 'percentage'
                          ? totals.subtotal * appliedCoupon.discount
                          : appliedCoupon.discount
                        : 0
                      )
                    )}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full px-4 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg touch-manipulation"
                >
                  Proceed to Payment (F2)
                </button>
                 
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setShowHoldReasonModal(true)}
                    className={`px-3 py-3 text-sm rounded-lg touch-manipulation font-medium ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <PauseIcon className="h-4 w-4 inline mr-1" />
                    Hold
                  </button>
                  <button
                    onClick={() => setShowRefundModal(true)}
                    className={`px-3 py-3 text-sm rounded-lg touch-manipulation font-medium ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <ArrowUturnLeftIcon className="h-4 w-4 inline mr-1" />
                    Refund
                  </button>
                  <button
                    onClick={() => setCart([])}
                    className={`px-3 py-3 text-sm rounded-lg touch-manipulation font-medium ${
                      darkMode
                        ? 'bg-red-900 text-red-300 hover:bg-red-800'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    <TrashIcon className="h-4 w-4 inline mr-1" />
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            
            {/* Search Existing Customers */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Existing Customer
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customerSearchQuery}
                  onChange={handleCustomerSearchInput}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by name or phone..."
                />
                <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              {/* Customer Search Results */}
              {customerSearchQuery.length >= 2 && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                  {isCustomerSearchLoading ? (
                    <div className="p-3 text-center text-sm text-gray-500">
                      Searching...
                    </div>
                  ) : customerSearchResults.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {customerSearchResults.map((patient) => (
                        <div
                          key={patient.id}
                          onClick={() => selectExistingCustomer(patient)}
                          className="p-3 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="font-medium text-sm">
                            {patient.full_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {patient.phone} {patient.email && `| ${patient.email}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-sm text-gray-500">
                      No customers found
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Add New Customer */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Customer</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter customer name"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCustomerModal(false);
                  setCustomerSearchQuery('');
                  setCustomerSearchResults([]);
                  setCustomerPhone('');
                  setCustomerName('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addCustomer}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 w-96 max-w-md`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Payment</h3>
            <div className="space-y-4">
              <div className="text-center">
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(
                    totals.totalAmount - (appliedCoupon
                      ? appliedCoupon.type === 'percentage'
                        ? totals.subtotal * appliedCoupon.discount
                        : appliedCoupon.discount
                      : 0
                    )
                  )}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Amount</p>
              </div>
              
              {/* Split Payments Toggle */}
              <div className="flex items-center justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Enable Split Payments</span>
                <button
                  onClick={() => {
                    if (splitPayments.length === 0) {
                      setSplitPayments([{
                        amount: totals.totalAmount,
                        payment_mode: 'CASH',
                        transaction_id: null,
                        notes: null
                      }]);
                    } else {
                      setSplitPayments([]);
                    }
                  }}
                  className={`px-3 py-1 text-sm rounded ${
                    splitPayments.length > 0
                      ? 'bg-blue-500 text-white'
                      : darkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {splitPayments.length > 0 ? 'Enabled' : 'Enable'}
                </button>
              </div>
              
              {/* Split Payments List */}
              {splitPayments.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Split Payments</span>
                    <button
                      onClick={() => {
                        setSplitPayments([...splitPayments, {
                          amount: 0,
                          payment_mode: 'CASH',
                          transaction_id: null,
                          notes: null
                        }]);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  {splitPayments.map((payment, index) => (
                    <div key={index} className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={payment.amount}
                          onChange={(e) => {
                            const newPayments = [...splitPayments];
                            newPayments[index].amount = parseFloat(e.target.value) || 0;
                            setSplitPayments(newPayments);
                          }}
                          className={`w-20 px-2 py-1 text-sm border rounded ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                          }`}
                          placeholder="Amount"
                        />
                        <select
                          value={payment.payment_mode}
                          onChange={(e) => {
                            const newPayments = [...splitPayments];
                            newPayments[index].payment_mode = e.target.value;
                            setSplitPayments(newPayments);
                          }}
                          className={`flex-1 px-2 py-1 text-sm border rounded ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                          }`}
                        >
                          <option value="CASH">Cash</option>
                          <option value="CARD">Card</option>
                          <option value="UPI">UPI</option>
                          <option value="WALLET">Wallet</option>
                          <option value="INSURANCE">Insurance</option>
                          <option value="ONLINE">Online</option>
                        </select>
                        {splitPayments.length > 1 && (
                          <button
                            onClick={() => {
                              setSplitPayments(splitPayments.filter((_, i) => i !== index));
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Total: {formatCurrency(splitPayments.reduce((sum, p) => sum + p.amount, 0))}
                        </span>
                        <span className={`text-xs ${
                          splitPayments.reduce((sum, p) => sum + p.amount, 0) === totals.totalAmount
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {splitPayments.reduce((sum, p) => sum + p.amount, 0) === totals.totalAmount
                            ? 'Complete'
                            : 'Incomplete'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Single Payment Mode Selection */}
              {splitPayments.length === 0 && (
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMode('cash')}
                      className={`p-3 rounded-md border-2 transition-colors ${
                        paymentMode === 'cash'
                          ? 'border-blue-500 bg-blue-50'
                          : darkMode
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <BanknotesIcon className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm">Cash</span>
                    </button>
                    <button
                      onClick={() => setPaymentMode('card')}
                      className={`p-3 rounded-md border-2 transition-colors ${
                        paymentMode === 'card'
                          ? 'border-blue-500 bg-blue-50'
                          : darkMode
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCardIcon className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm">Card</span>
                    </button>
                    <button
                      onClick={() => setPaymentMode('upi')}
                      className={`p-3 rounded-md border-2 transition-colors ${
                        paymentMode === 'upi'
                          ? 'border-blue-500 bg-blue-50'
                          : darkMode
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <QrCodeIcon className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm">UPI</span>
                    </button>
                    <button
                      onClick={() => setPaymentMode('wallet')}
                      className={`p-3 rounded-md border-2 transition-colors ${
                        paymentMode === 'wallet'
                          ? 'border-blue-500 bg-blue-50'
                          : darkMode
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <WalletIcon className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm">Wallet</span>
                    </button>
                    <button
                      onClick={() => setPaymentMode('insurance')}
                      className={`p-3 rounded-md border-2 transition-colors ${
                        paymentMode === 'insurance'
                          ? 'border-blue-500 bg-blue-50'
                          : darkMode
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <ShieldCheckIcon className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm">Insurance</span>
                    </button>
                    <button
                      onClick={() => setPaymentMode('online')}
                      className={`p-3 rounded-md border-2 transition-colors ${
                        paymentMode === 'online'
                          ? 'border-blue-500 bg-blue-50'
                          : darkMode
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <DevicePhoneMobileIcon className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-sm">Online</span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Cash Payment Details */}
              {(paymentMode === 'cash' || (splitPayments.length > 0 && splitPayments.some(p => p.payment_mode === 'CASH'))) && (
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Amount Paid
                  </label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    placeholder="Enter amount received"
                  />
                  {amountPaid && parseFloat(amountPaid) > totals.totalAmount && (
                    <p className="text-sm text-green-600 mt-1">
                      Change: {formatCurrency(parseFloat(amountPaid) - totals.totalAmount)}
                    </p>
                  )}
                </div>
              )}
              
              {/* UPI Payment Details */}
              {paymentMode === 'upi' && (
                <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Scan QR Code or Enter UPI ID</p>
                  <div className={`w-32 h-32 ${darkMode ? 'bg-gray-600' : 'bg-white'} rounded mx-auto mb-2 flex items-center justify-center`}>
                    <QrCodeIcon className={`h-16 w-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter UPI ID"
                    className={`w-full px-3 py-2 text-sm border rounded ${
                      darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className={`px-4 py-2 border rounded-md ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={processPayment}
                disabled={isProcessing || (splitPayments.length > 0 && splitPayments.reduce((sum, p) => sum + p.amount, 0) !== totals.totalAmount)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Receipt Modal */}
      {showReceiptModal && currentReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto`}>
            <div className="text-center mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Receipt</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Receipt #{currentReceipt.receipt_number}</p>
            </div>
            
            <div className={`border-b pb-4 mb-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="text-center">
                <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{currentReceipt.store_info.name}</h4>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{currentReceipt.store_info.address}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{currentReceipt.store_info.phone}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <span>Date:</span>
                <span>{new Date(currentReceipt.date_time).toLocaleString()}</span>
              </div>
              <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <span>Customer:</span>
                <span>{currentReceipt.customer_info.name}</span>
              </div>
              <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <span>Cashier:</span>
                <span>{currentReceipt.cashier_name}</span>
              </div>
            </div>
            
            <div className={`border-t pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="space-y-2">
                {currentReceipt.items.map((item, index) => (
                  <div key={index} className="text-sm">
                    <div className={`flex justify-between ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <span className="font-medium">{item.medicine_name}</span>
                      <span>{formatCurrency(item.total)}</span>
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={`border-t pt-4 mt-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="space-y-1">
                <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(currentReceipt.subtotal)}</span>
                </div>
                <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span>Tax:</span>
                  <span>{formatCurrency(currentReceipt.tax_amount)}</span>
                </div>
                <div className={`flex justify-between font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <span>Total:</span>
                  <span>{formatCurrency(currentReceipt.total_amount)}</span>
                </div>
                {currentReceipt.change > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Change:</span>
                    <span>{formatCurrency(currentReceipt.change)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className={`text-center mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>{currentReceipt.store_info?.footer || 'Thank you for visiting!'}</p>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowReceiptModal(false)}
                className={`px-4 py-2 border rounded-md ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDigitalReceiptModal(true);
                  setReceiptPhoneNumber(customer?.phone || '');
                  setReceiptEmail(customer?.email || '');
                }}
                className={`px-4 py-2 border rounded-md ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ShareIcon className="h-4 w-4 inline mr-1" />
                Send
              </button>
              <button
                onClick={printReceipt}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PrinterIcon className="h-4 w-4 inline mr-1" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Digital Receipt Modal */}
      {showDigitalReceiptModal && currentReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 w-96 max-w-md`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Send Digital Receipt</h3>
            <div className="space-y-4">
              <div className="text-center">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  Receipt #{currentReceipt.receipt_number}
                </p>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(currentReceipt.total_amount)}
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Select Delivery Method
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setDigitalReceiptMethod('sms')}
                    className={`w-full p-3 rounded-md border-2 transition-colors flex items-center space-x-3 ${
                      digitalReceiptMethod === 'sms'
                        ? 'border-blue-500 bg-blue-50'
                        : darkMode
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <PhoneIcon className="h-6 w-6" />
                    <div className="text-left">
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>SMS</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Send via text message</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setDigitalReceiptMethod('whatsapp')}
                    className={`w-full p-3 rounded-md border-2 transition-colors flex items-center space-x-3 ${
                      digitalReceiptMethod === 'whatsapp'
                        ? 'border-blue-500 bg-blue-50'
                        : darkMode
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">W</span>
                    </div>
                    <div className="text-left">
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>WhatsApp</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Send via WhatsApp</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setDigitalReceiptMethod('email')}
                    className={`w-full p-3 rounded-md border-2 transition-colors flex items-center space-x-3 ${
                      digitalReceiptMethod === 'email'
                        ? 'border-blue-500 bg-blue-50'
                        : darkMode
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <EnvelopeIcon className="h-6 w-6" />
                    <div className="text-left">
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Email</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Send via email</p>
                    </div>
                  </button>
                </div>
              </div>
              
              {digitalReceiptMethod && (
                <div>
                  {digitalReceiptMethod === 'email' ? (
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={receiptEmail}
                        onChange={(e) => setReceiptEmail(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                        placeholder="customer@example.com"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={receiptPhoneNumber}
                        onChange={(e) => setReceiptPhoneNumber(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                        placeholder="+1234567890"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDigitalReceiptModal(false);
                  setDigitalReceiptMethod('');
                  setReceiptPhoneNumber('');
                  setReceiptEmail('');
                }}
                className={`px-4 py-2 border rounded-md ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={sendDigitalReceipt}
                disabled={!digitalReceiptMethod || (!receiptEmail && digitalReceiptMethod === 'email') || (!receiptPhoneNumber && (digitalReceiptMethod === 'sms' || digitalReceiptMethod === 'whatsapp'))}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Send Receipt
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-4 w-80`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Calculator</h3>
              <button
                onClick={() => setShowCalculator(false)}
                className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className={`p-4 rounded mb-4 text-right ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-3xl font-mono ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {calculatorValue}
              </div>
              {previousValue && calculatorOperation && (
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {previousValue} {calculatorOperation}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleCalculatorInput('C')}
                className={`col-span-2 p-4 rounded font-medium ${
                  darkMode
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                Clear
              </button>
              <button
                onClick={() => handleCalculatorInput('/')}
                className={`p-4 rounded font-medium ${
                  darkMode
                    ? 'bg-gray-600 text-white hover:bg-gray-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ÷
              </button>
              <button
                onClick={() => handleCalculatorInput('*')}
                className={`p-4 rounded font-medium ${
                  darkMode
                    ? 'bg-gray-600 text-white hover:bg-gray-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ×
              </button>
              
              <button
                onClick={() => handleCalculatorInput('7')}
                className={`p-4 rounded font-medium ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                7
              </button>
              <button
                onClick={() => handleCalculatorInput('8')}
                className={`p-4 rounded font-medium ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                8
              </button>
              <button
                onClick={() => handleCalculatorInput('9')}
                className={`p-4 rounded font-medium ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                9
              </button>
              <button
                onClick={() => handleCalculatorInput('-')}
                className={`p-4 rounded font-medium ${
                  darkMode
                    ? 'bg-gray-600 text-white hover:bg-gray-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                −
              </button>
              
              <button
                onClick={() => handleCalculatorInput('4')}
                className={`p-4 rounded font-medium ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                4
              </button>
              <button
                onClick={() => handleCalculatorInput('5')}
                className={`p-4 rounded font-medium ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                5
              </button>
              <button
                onClick={() => handleCalculatorInput('6')}
                className={`p-4 rounded font-medium ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                6
              </button>
              <button
                onClick={() => handleCalculatorInput('+')}
                className={`p-4 rounded font-medium ${
                  darkMode
                    ? 'bg-gray-600 text-white hover:bg-gray-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                +
              </button>
              
              <button
                onClick={() => handleCalculatorInput('1')}
                className={`p-4 rounded font-medium ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                1
              </button>
              <button
                onClick={() => handleCalculatorInput('2')}
                className={`p-4 rounded font-medium ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                2
              </button>
              <button
                onClick={() => handleCalculatorInput('3')}
                className={`p-4 rounded font-medium ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                3
              </button>
              <button
                onClick={() => handleCalculatorInput('=')}
                className={`row-span-2 p-4 rounded font-medium ${
                  darkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                =
              </button>
              
              <button
                onClick={() => handleCalculatorInput('0')}
                className={`col-span-2 p-4 rounded font-medium ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                0
              </button>
              <button
                onClick={() => handleCalculatorInput('.')}
                className={`p-4 rounded font-medium ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                .
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hold Reason Modal */}
      {showHoldReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Hold Bill</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Holding *
                </label>
                <textarea
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter reason for holding this bill..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowHoldReasonModal(false);
                  setHoldReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={holdBill}
                disabled={holdBillMutation.isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {holdBillMutation.isLoading ? 'Holding...' : 'Hold Bill'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Held Bills Modal */}
      {showHoldBillsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Held Bills</h3>
              <button
                onClick={() => setShowHoldBillsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {heldBills.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No held bills found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {heldBills.map((heldBill) => (
                  <div key={heldBill.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">Hold #{heldBill.hold_number}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(heldBill.held_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Reason: {heldBill.hold_reason}
                        </p>
                        <div className="text-sm">
                          <span className="font-medium">Items: {heldBill.cart_data.items?.length || 0}</span>
                          <span className="ml-4">
                            Total: {formatCurrency(heldBill.cart_data.totals?.totalAmount || 0)}
                          </span>
                        </div>
                        {heldBill.cart_data.customer && (
                          <p className="text-sm text-gray-600 mt-1">
                            Customer: {heldBill.cart_data.customer.name}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => releaseHoldBill(heldBill.id)}
                          disabled={releaseHoldBillMutation.isLoading}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          <PlayIcon className="h-4 w-4 inline mr-1" />
                          Release
                        </button>
                        <button
                          onClick={() => deleteHoldBill(heldBill.id)}
                          disabled={deleteHoldBillMutation.isLoading}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                          <TrashIcon className="h-4 w-4 inline mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 w-96`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {notesType === 'cart' ? 'Add Notes to Bill' : 'Add Notes to Item'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Notes
                </label>
                <textarea
                  value={notesType === 'cart' ? cartNotes : (itemNotes[notesIndex] || '')}
                  onChange={(e) => {
                    if (notesType === 'cart') {
                      setCartNotes(e.target.value);
                    } else {
                      const newItemNotes = { ...itemNotes };
                      newItemNotes[notesIndex] = e.target.value;
                      setItemNotes(newItemNotes);
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter notes..."
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setNotesType('');
                  setNotesIndex(null);
                }}
                className={`px-4 py-2 border rounded-md ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (notesType === 'item' && notesIndex !== null) {
                    addNotesToItem(notesIndex, itemNotes[notesIndex] || '');
                  } else {
                    setShowNotesModal(false);
                    setNotesType('');
                    setNotesIndex(null);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 w-96`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Apply Discount
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Discount Type
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setDiscountType('percentage')}
                    className={`flex-1 px-3 py-2 rounded-md ${
                      discountType === 'percentage'
                        ? 'bg-blue-500 text-white'
                        : darkMode
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Percentage
                  </button>
                  <button
                    onClick={() => setDiscountType('fixed')}
                    className={`flex-1 px-3 py-2 rounded-md ${
                      discountType === 'fixed'
                        ? 'bg-blue-500 text-white'
                        : darkMode
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Fixed Amount
                  </button>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Discount Value {discountType === 'percentage' ? '(%)' : '(Amount)'}
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                  min="0"
                  max={discountType === 'percentage' ? '100' : undefined}
                  step={discountType === 'percentage' ? '0.1' : '0.01'}
                />
              </div>
              {discountIndex !== null && (
                <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Item: {cart[discountIndex]?.medicine_name}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Price: {formatCurrency(cart[discountIndex]?.unit_price || 0)} × {cart[discountIndex]?.quantity || 0}
                  </p>
                  {discountValue && (
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Discount: {discountType === 'percentage' ? `${discountValue}%` : formatCurrency(parseFloat(discountValue) || 0)}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDiscountModal(false);
                  setDiscountValue('');
                  setDiscountIndex(null);
                }}
                className={`px-4 py-2 border rounded-md ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (discountIndex !== null) {
                    applyDiscount(discountIndex);
                  }
                }}
                disabled={!discountValue || parseFloat(discountValue) <= 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Apply Discount
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 w-96`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Apply Coupon</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter coupon code"
                />
              </div>
              <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Available Coupons:</p>
                <div className="space-y-2">
                  <div className={`p-2 rounded ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>SAVE10</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>10% off on total bill</p>
                  </div>
                  <div className={`p-2 rounded ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>SAVE20</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>$20 off on orders above $100</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCouponModal(false);
                  setCouponCode('');
                }}
                className={`px-4 py-2 border rounded-md ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={applyCoupon}
                disabled={!couponCode}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Apply Coupon
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Process Refund/Return</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Refund Reason
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">Select reason</option>
                  <option value="wrong_item">Wrong item delivered</option>
                  <option value="damaged">Item damaged</option>
                  <option value="expired">Item expired</option>
                  <option value="changed_mind">Customer changed mind</option>
                  <option value="doctor_changed">Doctor changed prescription</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Select Items to Refund
                </label>
                {cart.length === 0 ? (
                  <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No items available for refund
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item, index) => (
                      <div key={index} className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={refundItems.some(r => r.index === index)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRefundItems([...refundItems, {
                                    index,
                                    medicine_name: item.medicine_name,
                                    quantity: item.quantity,
                                    unit_price: item.unit_price,
                                    refundAmount: item.total,
                                    refundQuantity: item.quantity
                                  }]);
                                } else {
                                  setRefundItems(refundItems.filter(r => r.index !== index));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {item.medicine_name}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {formatCurrency(item.unit_price)} × {item.quantity}
                              </p>
                            </div>
                          </div>
                          {refundItems.some(r => r.index === index) && (
                            <div className="flex items-center space-x-2">
                              <label className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Qty:</label>
                              <input
                                type="number"
                                min="1"
                                max={item.quantity}
                                value={refundItems.find(r => r.index === index)?.refundQuantity || 1}
                                onChange={(e) => {
                                  const newRefundItems = [...refundItems];
                                  const itemIndex = newRefundItems.findIndex(r => r.index === index);
                                  if (itemIndex !== -1) {
                                    newRefundItems[itemIndex].refundQuantity = parseInt(e.target.value) || 1;
                                    newRefundItems[itemIndex].refundAmount = newRefundItems[itemIndex].unit_price * newRefundItems[itemIndex].refundQuantity;
                                    setRefundItems(newRefundItems);
                                  }
                                }}
                                className={`w-16 px-2 py-1 text-sm border rounded ${
                                  darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                                }`}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {refundItems.length > 0 && (
                <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex justify-between">
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Refund Amount:</span>
                    <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(refundItems.reduce((sum, item) => sum + item.refundAmount, 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundItems([]);
                  setRefundReason('');
                }}
                className={`px-4 py-2 border rounded-md ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={processRefund}
                disabled={refundItems.length === 0 || !refundReason}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Process Refund
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Barcode Print Modal */}
      {showBarcodePrintModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 w-96`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Print Barcode Labels</h3>
            <div className="space-y-4">
              <div className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMedicine.name}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>SKU: {selectedMedicine.sku}</p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Number of Labels
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={barcodePrintQuantity}
                  onChange={(e) => setBarcodePrintQuantity(parseInt(e.target.value) || 1)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowBarcodePrintModal(false);
                  setBarcodePrintQuantity(1);
                }}
                className={`px-4 py-2 border rounded-md ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={printBarcodeLabels}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Print Labels
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Staff Login Modal */}
      {showStaffLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 w-96`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Staff Login</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Enter Staff PIN
                </label>
                <input
                  type="password"
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowStaffLoginModal(false);
                  setStaffPin('');
                }}
                className={`px-4 py-2 border rounded-md ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={processStaffLogin}
                disabled={staffPin.length !== 4}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cash Reconciliation Modal */}
      {showCashReconciliationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 w-96`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>End Shift - Cash Reconciliation</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Expected Cash
                </label>
                <input
                  type="number"
                  value={cashReconciliationData.expectedCash}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setCashReconciliationData({
                      ...cashReconciliationData,
                      expectedCash: value,
                      difference: value - cashReconciliationData.actualCash
                    });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Actual Cash
                </label>
                <input
                  type="number"
                  value={cashReconciliationData.actualCash}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setCashReconciliationData({
                      ...cashReconciliationData,
                      actualCash: value,
                      difference: cashReconciliationData.expectedCash - value
                    });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className={`p-3 rounded ${Math.abs(cashReconciliationData.difference) > 0.01 ? (cashReconciliationData.difference > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700') : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700')}`}>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Difference:</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(Math.abs(cashReconciliationData.difference))}
                    {cashReconciliationData.difference > 0 ? ' (Short)' : cashReconciliationData.difference < 0 ? ' (Over)' : ' (Balanced)'}
                  </span>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Notes
                </label>
                <textarea
                  value={cashReconciliationData.notes}
                  onChange={(e) => setCashReconciliationData({...cashReconciliationData, notes: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Add any notes about the shift..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCashReconciliationModal(false);
                  setCashReconciliationData({
                    expectedCash: 0,
                    actualCash: 0,
                    difference: 0,
                    notes: ''
                  });
                }}
                className={`px-4 py-2 border rounded-md ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={endShift}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                End Shift
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Offers Panel */}
      {showOffersPanel && (
        <div className={`fixed right-0 top-0 h-full w-80 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow-lg z-40 overflow-y-auto`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Offers & Upsells</h3>
              <button
                onClick={() => setShowOffersPanel(false)}
                className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="mb-6">
              <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Active Offers</h4>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Weekend Special</span>
                    <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">20% OFF</span>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Get 20% off on all vitamins and supplements</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Valid until Sunday</p>
                </div>
                
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Buy 2 Get 1</span>
                    <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full">B2G1</span>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Buy 2 get 1 free on selected pain relievers</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Terms and conditions apply</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Suggested Products</h4>
              {upsellSuggestions.length > 0 ? (
                <div className="space-y-3">
                  {upsellSuggestions.map((suggestion, index) => (
                    <div key={index} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{suggestion.name}</span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(suggestion.price)}</span>
                      </div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{suggestion.reason}</p>
                      <button
                        onClick={() => {
                          // In a real app, this would add the suggested product to cart
                          toast.success(`${suggestion.name} added to cart`);
                        }}
                        className="mt-2 w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <LightBulbIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Add items to cart to see suggestions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointOfSale;