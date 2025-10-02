from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from datetime import date, datetime

from ..database import get_db
from ..models import User, Patient, Prescription, AuditLog
from ..schemas.patients import (
    Patient as PatientSchema, PatientCreate, PatientUpdate,
    PatientSummary, PatientSearch
)
from ..utils.auth import get_current_active_user, require_cashier

router = APIRouter()

def calculate_age(date_of_birth: date) -> int:
    today = date.today()
    age = today.year - date_of_birth.year
    if today.month < date_of_birth.month or (today.month == date_of_birth.month and today.day < date_of_birth.day):
        age -= 1
    return age

@router.post("/patients", response_model=PatientSchema)
async def create_patient(
    patient: PatientCreate,
    current_user: User = Depends(require_cashier),
    db: Session = Depends(get_db)
):
    # Check if patient ID already exists
    existing_patient = db.query(Patient).filter(Patient.patient_id == patient.patient_id).first()
    if existing_patient:
        raise HTTPException(
            status_code=400,
            detail="Patient ID already exists"
        )
    
    # Check if patient with same phone already exists
    existing_patient = db.query(Patient).filter(Patient.phone == patient.phone).first()
    if existing_patient:
        raise HTTPException(
            status_code=400,
            detail="Patient with this phone number already exists"
        )
    
    db_patient = Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="CREATE",
        resource_type="PATIENT",
        resource_id=db_patient.id,
        new_values=f"Created patient {patient.first_name} {patient.last_name} (ID: {patient.patient_id})"
    )
    db.add(audit_log)
    db.commit()
    
    return db_patient

@router.get("/patients", response_model=List[PatientSummary])
async def list_patients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Patient)
    
    if search:
        query = query.filter(
            or_(
                Patient.patient_id.ilike(f"%{search}%"),
                Patient.first_name.ilike(f"%{search}%"),
                Patient.last_name.ilike(f"%{search}%"),
                Patient.phone.ilike(f"%{search}%"),
                Patient.email.ilike(f"%{search}%")
            )
        )
    
    patients = query.offset(skip).limit(limit).all()
    
    # Convert to patient summary format
    patient_summaries = []
    for patient in patients:
        age = calculate_age(patient.date_of_birth)
        patient_summaries.append(PatientSummary(
            id=patient.id,
            patient_id=patient.patient_id,
            full_name=f"{patient.first_name} {patient.last_name}",
            phone=patient.phone,
            email=patient.email,
            age=age,
            insurance_provider=patient.insurance_provider
        ))
    
    return patient_summaries

@router.get("/patients/search", response_model=List[PatientSummary])
async def search_patients(
    search: PatientSearch,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Patient).filter(
        or_(
            Patient.patient_id.ilike(f"%{search.query}%"),
            Patient.first_name.ilike(f"%{search.query}%"),
            Patient.last_name.ilike(f"%{search.query}%"),
            Patient.phone.ilike(f"%{search.query}%"),
            Patient.email.ilike(f"%{search.query}%")
        )
    ).limit(search.limit)
    
    patients = query.all()
    
    # Convert to patient summary format
    patient_summaries = []
    for patient in patients:
        age = calculate_age(patient.date_of_birth)
        patient_summaries.append(PatientSummary(
            id=patient.id,
            patient_id=patient.patient_id,
            full_name=f"{patient.first_name} {patient.last_name}",
            phone=patient.phone,
            email=patient.email,
            age=age,
            insurance_provider=patient.insurance_provider
        ))
    
    return patient_summaries

@router.get("/patients/{patient_id}", response_model=PatientSchema)
async def get_patient(
    patient_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.get("/patients/by-patient-id/{patient_identifier}", response_model=PatientSchema)
async def get_patient_by_identifier(
    patient_identifier: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.patient_id == patient_identifier).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.put("/patients/{patient_id}", response_model=PatientSchema)
async def update_patient(
    patient_id: int,
    patient_update: PatientUpdate,
    current_user: User = Depends(require_cashier),
    db: Session = Depends(get_db)
):
    db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Store old values for audit
    old_values = {
        "first_name": db_patient.first_name,
        "last_name": db_patient.last_name,
        "phone": db_patient.phone,
        "email": db_patient.email
    }
    
    # Update patient fields if provided
    update_data = patient_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_patient, field, value)
    
    db.commit()
    db.refresh(db_patient)
    
    # Create audit log
    new_values = {
        "first_name": db_patient.first_name,
        "last_name": db_patient.last_name,
        "phone": db_patient.phone,
        "email": db_patient.email
    }
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action="UPDATE",
        resource_type="PATIENT",
        resource_id=db_patient.id,
        old_values=str(old_values),
        new_values=str(new_values)
    )
    db.add(audit_log)
    db.commit()
    
    return db_patient

@router.get("/patients/{patient_id}/prescriptions")
async def get_patient_prescriptions(
    patient_id: int,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    prescriptions = db.query(Prescription).filter(
        Prescription.patient_id == patient_id
    ).order_by(Prescription.created_at.desc()).offset(skip).limit(limit).all()
    
    return prescriptions

@router.get("/patients/{patient_id}/summary")
async def get_patient_summary(
    patient_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get patient details
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Get prescription count
    prescription_count = db.query(Prescription).filter(
        Prescription.patient_id == patient_id
    ).count()
    
    # Get recent prescriptions
    recent_prescriptions = db.query(Prescription).filter(
        Prescription.patient_id == patient_id
    ).order_by(Prescription.created_at.desc()).limit(5).all()
    
    age = calculate_age(patient.date_of_birth)
    
    return {
        "patient": patient,
        "age": age,
        "prescription_count": prescription_count,
        "recent_prescriptions": recent_prescriptions
    }