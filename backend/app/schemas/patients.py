from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime

class PatientBase(BaseModel):
    patient_id: str
    first_name: str
    last_name: str
    date_of_birth: date
    gender: Optional[str] = None
    phone: str
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    allergies: Optional[str] = None
    medical_history: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None

class Patient(PatientBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class PatientSummary(BaseModel):
    id: int
    patient_id: str
    full_name: str
    phone: str
    email: Optional[str] = None
    age: int
    insurance_provider: Optional[str] = None
    
    class Config:
        from_attributes = True

class PatientSearch(BaseModel):
    query: str
    limit: int = 10