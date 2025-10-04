from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..models import PaymentStatus, PaymentMode

class InvoiceItemBase(BaseModel):
    medicine_id: int
    batch_id: int
    quantity: int
    unit_price: float
    discount: float = 0.0

class InvoiceItemCreate(InvoiceItemBase):
    prescription_id: Optional[int] = None

class InvoiceItem(InvoiceItemBase):
    id: int
    invoice_id: int
    prescription_id: Optional[int] = None
    total: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class InvoiceItemWithDetails(InvoiceItem):
    medicine_name: str
    batch_number: str
    prescription_number: Optional[str] = None
    
    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    patient_id: int
    payment_mode: Optional[PaymentMode] = None

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate]

class InvoiceUpdate(BaseModel):
    payment_status: Optional[PaymentStatus] = None
    payment_mode: Optional[PaymentMode] = None
    notes: Optional[str] = None

class Invoice(InvoiceBase):
    id: int
    invoice_number: str
    subtotal: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    payment_status: PaymentStatus
    paid_amount: float
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class InvoiceWithItems(Invoice):
    items: List[InvoiceItem] = []

class InvoiceWithDetails(Invoice):
    items: List[InvoiceItemWithDetails] = []
    patient_name: str
    created_by_name: str

class PaymentBase(BaseModel):
    amount: float
    payment_mode: PaymentMode
    transaction_id: Optional[str] = None
    notes: Optional[str] = None

class PaymentCreate(PaymentBase):
    invoice_id: int

class Payment(PaymentBase):
    id: int
    invoice_id: int
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class RefundBase(BaseModel):
    amount: float
    reason: str

class RefundCreate(RefundBase):
    invoice_id: int

class Refund(RefundBase):
    id: int
    invoice_id: int
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class InvoiceSummary(BaseModel):
    id: int
    invoice_number: str
    patient_id: int
    patient_name: str
    total_amount: float
    payment_status: PaymentStatus
    payment_mode: Optional[PaymentMode] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class DailySales(BaseModel):
    date: datetime
    total_sales: float
    total_invoices: int
    cash_sales: float
    card_sales: float
    insurance_sales: float

class SalesReport(BaseModel):
    period: str
    total_sales: float
    total_invoices: int
    average_invoice_value: float
    payment_breakdown: dict
    daily_sales: List[DailySales]

class TaxCalculation(BaseModel):
    subtotal: float
    tax_rate: float
    tax_amount: float
    total_with_tax: float