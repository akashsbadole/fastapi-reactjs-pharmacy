from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from ..models import PaymentStatus, PaymentMode

class POSMedicineSearch(BaseModel):
    id: int
    name: str
    generic_name: Optional[str] = None
    brand: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    selling_price: float
    stock_quantity: int
    requires_prescription: bool
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    manufacturer: Optional[str] = None
    schedule: Optional[str] = None
    category: Optional[str] = None
    is_active: bool = True
    
    class Config:
        from_attributes = True

class POSBatchInfo(BaseModel):
    id: int
    batch_number: str
    current_stock: int
    selling_price: float
    expiry_date: datetime
    manufacture_date: datetime
    low_stock_threshold: int
    
    class Config:
        from_attributes = True

class POSMedicineWithBatches(POSMedicineSearch):
    batches: List[POSBatchInfo] = []
    
    class Config:
        from_attributes = True

class POSCartItem(BaseModel):
    medicine_id: int
    medicine_name: str
    batch_id: int
    batch_number: str
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)
    discount: float = Field(default=0.0, ge=0)
    total: float
    requires_prescription: bool = False
    prescription_id: Optional[int] = None
    expiry_date: datetime
    stock_available: int
    
    class Config:
        from_attributes = True

class POSCart(BaseModel):
    items: List[POSCartItem] = []
    subtotal: float = 0.0
    tax_amount: float = 0.0
    discount_total: float = 0.0
    total_amount: float = 0.0
    patient_id: Optional[int] = None
    prescription_ids: List[int] = []
    notes: Optional[str] = None

class POSCustomer(BaseModel):
    id: Optional[int] = None
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    is_existing_patient: bool = False

class POSPayment(BaseModel):
    amount: float = Field(..., gt=0)
    payment_mode: PaymentMode
    transaction_id: Optional[str] = None
    notes: Optional[str] = None

class POSSplitPayment(BaseModel):
    payments: List[POSPayment] = []
    total_amount: float

class POSTransaction(BaseModel):
    cart: POSCart
    customer: POSCustomer
    payments: POSSplitPayment
    cashier_id: int
    store_id: Optional[str] = None
    receipt_number: Optional[str] = None

class POSInvoiceCreate(BaseModel):
    patient_id: Optional[int] = None
    customer_info: Optional[POSCustomer] = None
    items: List[POSCartItem]
    payment_mode: PaymentMode
    payments: Optional[List[POSPayment]] = None
    subtotal: float
    tax_amount: float
    discount_amount: float = 0.0
    total_amount: float
    notes: Optional[str] = None
    prescription_ids: List[int] = []
    hold_bill: bool = False
    hold_reason: Optional[str] = None

class POSHoldBill(BaseModel):
    id: int
    hold_number: str
    cart_data: Dict[str, Any]
    customer_info: Optional[Dict[str, Any]] = None
    held_by: int
    held_at: datetime
    hold_reason: Optional[str] = None
    is_active: bool = True
    
    class Config:
        from_attributes = True

class POSReceipt(BaseModel):
    receipt_number: str
    invoice_number: str
    date_time: datetime
    store_info: Dict[str, Any]
    customer_info: Dict[str, Any]
    items: List[POSCartItem]
    subtotal: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    payments: List[POSPayment]
    change: float = 0.0
    cashier_name: str
    prescription_info: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None

class POSQuickSale(BaseModel):
    barcode: Optional[str] = None
    medicine_id: Optional[int] = None
    quantity: int = Field(default=1, gt=0)
    customer_phone: Optional[str] = None
    payment_mode: PaymentMode = PaymentMode.CASH
    amount_paid: Optional[float] = None

class POSBarcodeScan(BaseModel):
    barcode: str
    quantity: int = Field(default=1, gt=0)

class POSStockAlert(BaseModel):
    medicine_id: int
    medicine_name: str
    current_stock: int
    reorder_level: int
    batch_info: List[POSBatchInfo]
    alert_type: str  # LOW_STOCK, EXPIRING_SOON, OUT_OF_STOCK

class POSExpiryAlert(BaseModel):
    medicine_id: int
    medicine_name: str
    batch_id: int
    batch_number: str
    expiry_date: datetime
    current_stock: int
    days_until_expiry: int
    alert_level: str  # CRITICAL, WARNING, INFO

class POSDailySummary(BaseModel):
    date: datetime
    total_sales: float
    total_invoices: int
    cash_sales: float
    card_sales: float
    insurance_sales: float
    online_sales: float
    top_medicines: List[Dict[str, Any]]
    payment_breakdown: Dict[str, float]

class POSConfig(BaseModel):
    store_name: str
    store_address: str
    store_phone: str
    store_email: str
    tax_rate: float
    currency_symbol: str
    receipt_header: Optional[str] = None
    receipt_footer: Optional[str] = None
    low_stock_threshold: int = 10
    expiry_warning_days: int = 30
    enable_barcode_scanning: bool = True
    enable_prescription_validation: bool = True
    require_manager_for_discount: bool = True
    max_discount_percentage: float = 15.0