from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from ..models import PrescriptionStatus

class PrescriptionItemBase(BaseModel):
    medicine_id: int
    dosage: str
    frequency: str
    duration: str
    quantity: int
    instructions: Optional[str] = None

class PrescriptionItemCreate(PrescriptionItemBase):
    batch_id: Optional[int] = None

class PrescriptionItem(PrescriptionItemBase):
    id: int
    prescription_id: int
    batch_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class PrescriptionItemWithDetails(PrescriptionItem):
    medicine_name: str
    batch_number: Optional[str] = None
    selling_price: Optional[float] = None

class PrescriptionBase(BaseModel):
    patient_id: int
    doctor_name: Optional[str] = None
    doctor_license: Optional[str] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    items: List[PrescriptionItemCreate]

class PrescriptionUpdate(BaseModel):
    doctor_name: Optional[str] = None
    doctor_license: Optional[str] = None
    diagnosis: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[PrescriptionStatus] = None

class Prescription(PrescriptionBase):
    id: int
    prescription_number: str
    created_by: int
    status: PrescriptionStatus
    file_path: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    filled_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class PrescriptionWithItems(Prescription):
    items: List[PrescriptionItem] = []

class PrescriptionWithDetails(Prescription):
    items: List[PrescriptionItemWithDetails] = []
    patient_name: str
    created_by_name: str

class PrescriptionValidation(BaseModel):
    is_valid: bool
    warnings: List[str] = []
    errors: List[str] = []
    drug_interactions: List[str] = []
    allergy_warnings: List[str] = []

class PrescriptionFill(BaseModel):
    prescription_id: int
    items: List[dict]  # List of {item_id: int, batch_id: int, quantity: int}

class PrescriptionSearch(BaseModel):
    query: str
    status: Optional[PrescriptionStatus] = None
    patient_id: Optional[int] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    limit: int = 20

class PrescriptionSummary(BaseModel):
    id: int
    prescription_number: str
    patient_id: int
    patient_name: str
    doctor_name: Optional[str] = None
    status: PrescriptionStatus
    created_at: datetime
    total_items: int
    
    class Config:
        from_attributes = True