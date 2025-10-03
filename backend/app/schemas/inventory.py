from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class SupplierBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    license_number: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    license_number: Optional[str] = None
    is_active: Optional[bool] = None

class Supplier(SupplierBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class MedicineBase(BaseModel):
    name: str
    generic_name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    manufacturer: Optional[str] = None
    requires_prescription: bool = False
    barcode: Optional[str] = None
    
    # Additional pharmacy management fields
    sku: Optional[str] = None
    pack_size: Optional[str] = None
    hsn_code: Optional[str] = None
    mrp: Optional[float] = None
    purchase_price: Optional[float] = None
    selling_price: Optional[float] = None
    tax_percent: Optional[float] = 0.0
    stock_quantity: Optional[int] = 0
    reorder_level: Optional[int] = 10
    storage_condition: Optional[str] = None
    schedule: Optional[str] = None
    alternative_drug_names: Optional[str] = None
    substitution_allowed: Optional[bool] = True
    location: Optional[str] = None
    notes: Optional[str] = None

class MedicineCreate(MedicineBase):
    pass

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    generic_name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    manufacturer: Optional[str] = None
    requires_prescription: Optional[bool] = None
    barcode: Optional[str] = None
    
    # Additional pharmacy management fields
    sku: Optional[str] = None
    pack_size: Optional[str] = None
    hsn_code: Optional[str] = None
    mrp: Optional[float] = None
    purchase_price: Optional[float] = None
    selling_price: Optional[float] = None
    tax_percent: Optional[float] = None
    stock_quantity: Optional[int] = None
    reorder_level: Optional[int] = None
    storage_condition: Optional[str] = None
    schedule: Optional[str] = None
    alternative_drug_names: Optional[str] = None
    substitution_allowed: Optional[bool] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    
    is_active: Optional[bool] = None

class Medicine(MedicineBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class MedicineBatchBase(BaseModel):
    batch_number: str
    medicine_id: int
    supplier_id: int
    quantity: int
    cost_price: float
    selling_price: float
    manufacture_date: date
    expiry_date: date
    low_stock_threshold: int = 10

class MedicineBatchCreate(MedicineBatchBase):
    pass

class MedicineBatchUpdate(BaseModel):
    quantity: Optional[int] = None
    current_stock: Optional[int] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    low_stock_threshold: Optional[int] = None
    is_active: Optional[bool] = None

class MedicineBatch(MedicineBatchBase):
    id: int
    current_stock: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class StockMovementBase(BaseModel):
    batch_id: int
    movement_type: str  # IN, OUT, ADJUSTMENT
    quantity: int
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    reason: Optional[str] = None

class StockMovementCreate(StockMovementBase):
    pass

class StockMovement(StockMovementBase):
    id: int
    created_by: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class MedicineWithBatches(Medicine):
    batches: List[MedicineBatch] = []

class BatchWithDetails(MedicineBatch):
    medicine: Medicine
    supplier: Supplier
    current_stock: int

class LowStockAlert(BaseModel):
    medicine_id: int
    medicine_name: str
    batch_number: str
    current_stock: int
    low_stock_threshold: int
    expiry_date: date

class ExpiryAlert(BaseModel):
    medicine_id: int
    medicine_name: str
    batch_number: str
    current_stock: int
    expiry_date: date
    days_until_expiry: int