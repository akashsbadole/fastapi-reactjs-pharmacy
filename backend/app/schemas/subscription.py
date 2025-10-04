from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class SubscriptionPlanBase(BaseModel):
    name: str
    description: str
    price: Decimal
    billing_cycle: str  # MONTHLY, YEARLY
    features: List[str] = []
    is_active: bool = True
    max_users: Optional[int] = None
    max_pharmacies: Optional[int] = None
    storage_limit_gb: Optional[int] = None
    support_level: Optional[str] = "Standard"  # Basic, Standard, Premium

class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass

class SubscriptionPlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    billing_cycle: Optional[str] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None
    max_users: Optional[int] = None
    max_pharmacies: Optional[int] = None
    storage_limit_gb: Optional[int] = None
    support_level: Optional[str] = None

class SubscriptionPlan(SubscriptionPlanBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserSubscriptionBase(BaseModel):
    user_id: int
    plan_id: int
    status: str = "ACTIVE"  # ACTIVE, CANCELLED, EXPIRED, PENDING
    start_date: datetime
    end_date: datetime
    auto_renew: bool = True

class UserSubscriptionCreate(UserSubscriptionBase):
    pass

class UserSubscriptionUpdate(BaseModel):
    status: Optional[str] = None
    end_date: Optional[datetime] = None
    auto_renew: Optional[bool] = None

class UserSubscription(UserSubscriptionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserSubscriptionResponse(UserSubscriptionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    plan_name: str
    plan_description: str
    plan_price: Decimal
    plan_billing_cycle: str
    plan_features: List[str]
    
    class Config:
        from_attributes = True

class PaymentMethodBase(BaseModel):
    user_id: int
    method_type: str  # CREDIT_CARD, PAYPAL, BANK_TRANSFER
    last_four: Optional[str] = None
    expiry_month: Optional[int] = None
    expiry_year: Optional[int] = None
    cardholder_name: Optional[str] = None
    is_default: bool = False
    is_active: bool = True

class PaymentMethodCreate(PaymentMethodBase):
    pass

class PaymentMethodUpdate(BaseModel):
    method_type: Optional[str] = None
    last_four: Optional[str] = None
    expiry_month: Optional[int] = None
    expiry_year: Optional[int] = None
    cardholder_name: Optional[str] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None

class PaymentMethod(PaymentMethodBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    user_id: int
    subscription_id: int
    amount: Decimal
    due_date: datetime
    status: str = "PENDING"  # PENDING, PAID, OVERDUE, CANCELLED
    description: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(BaseModel):
    amount: Optional[Decimal] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    description: Optional[str] = None

class Invoice(InvoiceBase):
    id: int
    invoice_number: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class InvoiceResponse(InvoiceBase):
    id: int
    invoice_number: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    plan_name: str
    
    class Config:
        from_attributes = True

class PaymentBase(BaseModel):
    invoice_id: int
    amount: Decimal
    payment_method_id: int
    status: str = "PENDING"  # PENDING, COMPLETED, FAILED, REFUNDED
    transaction_id: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    status: Optional[str] = None
    transaction_id: Optional[str] = None

class Payment(PaymentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UsageData(BaseModel):
    user_id: int
    current_users: int
    max_users: int
    current_pharmacies: int
    max_pharmacies: int
    storage_used_mb: float
    storage_limit_mb: float
    subscription_status: str
    subscription_end_date: datetime
    
    class Config:
        from_attributes = True