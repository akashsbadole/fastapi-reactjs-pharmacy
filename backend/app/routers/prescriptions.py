from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from datetime import datetime, date
import os
import uuid
import aiofiles

from ..database import get_db
from ..models import (
    User, Patient, Prescription, PrescriptionItem, Medicine, MedicineBatch,
    StockMovement, AuditLog
)
from ..schemas.prescriptions import (
    Prescription as PrescriptionSchema, PrescriptionCreate, PrescriptionUpdate,
    PrescriptionWithItems, PrescriptionWithDetails, PrescriptionValidation,
    PrescriptionFill, PrescriptionSearch, PrescriptionSummary
)
from ..utils.auth import get_current_active_user, require_pharmacist
from ..config import settings

router = APIRouter()

def generate_prescription_number() -> str:
    # Generate a unique prescription number with timestamp
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_id = str(uuid.uuid4())[:8].upper()
    return f"RX{timestamp}{random_id}"

async def save_upload_file(upload_file: UploadFile) -> str:
    # Create uploads directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    file_extension = upload_file.filename.split(".")[-1] if "." in upload_file.filename else ""
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        content = await upload_file.read()
        await f.write(content)
    
    return file_path

def validate_prescription_items(
    db: Session, 
    patient_id: int, 
    items: List[dict]
) -> PrescriptionValidation:
    """Validate prescription items for allergies, interactions, and stock availability"""
    validation = PrescriptionValidation(is_valid=True)
    
    # Get patient information
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        validation.is_valid = False
        validation.errors.append("Patient not found")
        return validation
    
    # Check each prescription item
    for item in items:
        medicine = db.query(Medicine).filter(Medicine.id == item["medicine_id"]).first()
        if not medicine:
            validation.is_valid = False
            validation.errors.append(f"Medicine with ID {item['medicine_id']} not found")
            continue
        
        # Check if medicine requires prescription
        if medicine.requires_prescription:
            validation.warnings.append(f"{medicine.name} requires prescription")
        
        # Check stock availability
        available_batches = db.query(MedicineBatch).filter(
            and_(
                MedicineBatch.medicine_id == item["medicine_id"],
                MedicineBatch.current_stock >= item["quantity"],
                MedicineBatch.is_active == True
            )
        ).all()
        
        if not available_batches:
            validation.is_valid = False
            validation.errors.append(f"Insufficient stock for {medicine.name}")
        else:
            total_stock = sum(batch.current_stock for batch in available_batches)
            if total_stock < item["quantity"]:
                validation.warnings.append(f"Low stock for {medicine.name}: {total_stock} available")
    
    # Check for allergies (simplified - in real system would use drug database)
    if patient.allergies:
        for item in items:
            medicine = db.query(Medicine).filter(Medicine.id == item["medicine_id"]).first()
            if medicine and medicine.name.lower() in patient.allergies.lower():
                validation.is_valid = False
                validation.allergy_warnings.append(f"Patient allergic to {medicine.name}")
    
    return validation

@router.post("/prescriptions", response_model=PrescriptionWithItems)
async def create_prescription(
    prescription: PrescriptionCreate,
    current_user: User = Depends(require_pharmacist),
    db: Session = Depends(get_db)
):
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == prescription.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Validate prescription items
    validation = validate_prescription_items(
        db, prescription.patient_id, [item.dict() for item in prescription.items]
    )
    
    if not validation.is_valid:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Prescription validation failed",
                "errors": validation.errors,
                "warnings": validation.warnings,
                "allergy_warnings": validation.allergy_warnings
            }
        )
    
    # Create prescription
    db_prescription = Prescription(
        prescription_number=generate_prescription_number(),
        patient_id=prescription.patient_id,
        created_by=current_user.id,
        doctor_name=prescription.doctor_name,
        doctor_license=prescription.doctor_license,
        diagnosis=prescription.diagnosis,
        notes=prescription.notes,
        status="pending"
    )
    
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    
    # Create prescription items
    for item_data in prescription.items:
        db_item = PrescriptionItem(
            prescription_id=db_prescription.id,
            medicine_id=item_data.medicine_id,
            dosage=item_data.dosage,
            frequency=item_data.frequency,
            duration=item_data.duration,
            quantity=item_data.quantity,
            instructions=item_data.instructions,
            batch_id=item_data.batch_id
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_prescription)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="CREATE",
        resource_type="PRESCRIPTION",
        resource_id=db_prescription.id,
        new_values=f"Created prescription {db_prescription.prescription_number} for patient {patient.first_name} {patient.last_name}"
    )
    db.add(audit_log)
    db.commit()
    
    # Get items with details
    items = db.query(PrescriptionItem).filter(
        PrescriptionItem.prescription_id == db_prescription.id
    ).all()
    
    return PrescriptionWithItems(**db_prescription.__dict__, items=items)

@router.post("/prescriptions/upload")
async def upload_prescription(
    patient_id: int,
    file: UploadFile = File(...),
    doctor_name: Optional[str] = None,
    doctor_license: Optional[str] = None,
    diagnosis: Optional[str] = None,
    notes: Optional[str] = None,
    current_user: User = Depends(require_pharmacist),
    db: Session = Depends(get_db)
):
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    
    # Save uploaded file
    file_path = await save_upload_file(file)
    
    # Create prescription record
    db_prescription = Prescription(
        prescription_number=generate_prescription_number(),
        patient_id=patient_id,
        created_by=current_user.id,
        doctor_name=doctor_name,
        doctor_license=doctor_license,
        diagnosis=diagnosis,
        notes=notes,
        file_path=file_path,
        status="pending"
    )
    
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="UPLOAD",
        resource_type="PRESCRIPTION",
        resource_id=db_prescription.id,
        new_values=f"Uploaded prescription {db_prescription.prescription_number} for patient {patient.first_name} {patient.last_name}"
    )
    db.add(audit_log)
    db.commit()
    
    return db_prescription

@router.get("/prescriptions", response_model=List[PrescriptionSummary])
async def list_prescriptions(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(
        Prescription,
        Patient,
        func.count(PrescriptionItem.id).label('total_items')
    ).join(
        Patient, Prescription.patient_id == Patient.id
    ).outerjoin(
        PrescriptionItem, Prescription.id == PrescriptionItem.prescription_id
    ).group_by(Prescription.id, Patient.id)
    
    if status:
        query = query.filter(Prescription.status == status)
    
    if patient_id:
        query = query.filter(Prescription.patient_id == patient_id)
    
    prescriptions = query.order_by(Prescription.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for prescription, patient, total_items in prescriptions:
        result.append(PrescriptionSummary(
            id=prescription.id,
            prescription_number=prescription.prescription_number,
            patient_id=prescription.patient_id,
            patient_name=f"{patient.first_name} {patient.last_name}",
            doctor_name=prescription.doctor_name,
            status=prescription.status,
            created_at=prescription.created_at,
            total_items=total_items or 0
        ))
    
    return result

@router.get("/prescriptions/{prescription_id}", response_model=PrescriptionWithDetails)
async def get_prescription(
    prescription_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get prescription with patient and creator details
    prescription = db.query(Prescription, Patient, User).join(
        Patient, Prescription.patient_id == Patient.id
    ).join(
        User, Prescription.created_by == User.id
    ).filter(Prescription.id == prescription_id).first()
    
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    prescription_obj, patient, creator = prescription
    
    # Get prescription items with medicine details
    items = db.query(
        PrescriptionItem, Medicine, MedicineBatch
    ).join(
        Medicine, PrescriptionItem.medicine_id == Medicine.id
    ).outerjoin(
        MedicineBatch, PrescriptionItem.batch_id == MedicineBatch.id
    ).filter(
        PrescriptionItem.prescription_id == prescription_id
    ).all()
    
    item_details = []
    for item, medicine, batch in items:
        item_details.append(PrescriptionItemWithDetails(
            **item.__dict__,
            medicine_name=medicine.name,
            batch_number=batch.batch_number if batch else None,
            selling_price=batch.selling_price if batch else None
        ))
    
    return PrescriptionWithDetails(
        **prescription_obj.__dict__,
        items=item_details,
        patient_name=f"{patient.first_name} {patient.last_name}",
        created_by_name=creator.full_name
    )

@router.put("/prescriptions/{prescription_id}", response_model=PrescriptionSchema)
async def update_prescription(
    prescription_id: int,
    prescription_update: PrescriptionUpdate,
    current_user: User = Depends(require_pharmacist),
    db: Session = Depends(get_db)
):
    db_prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not db_prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    # Store old values for audit
    old_status = db_prescription.status
    
    # Update prescription fields if provided
    update_data = prescription_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_prescription, field, value)
    
    # Set filled_at timestamp if status is being changed to filled
    if prescription_update.status == "filled" and old_status != "filled":
        db_prescription.filled_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_prescription)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="UPDATE",
        resource_type="PRESCRIPTION",
        resource_id=db_prescription.id,
        new_values=f"Updated prescription {db_prescription.prescription_number}"
    )
    db.add(audit_log)
    db.commit()
    
    return db_prescription

@router.post("/prescriptions/{prescription_id}/validate", response_model=PrescriptionValidation)
async def validate_prescription(
    prescription_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    # Get prescription items
    items = db.query(PrescriptionItem).filter(
        PrescriptionItem.prescription_id == prescription_id
    ).all()
    
    # Validate items
    validation = validate_prescription_items(
        db, prescription.patient_id, [item.__dict__ for item in items]
    )
    
    return validation

@router.post("/prescriptions/fill", response_model=PrescriptionSchema)
async def fill_prescription(
    fill_data: PrescriptionFill,
    current_user: User = Depends(require_pharmacist),
    db: Session = Depends(get_db)
):
    # Get prescription
    prescription = db.query(Prescription).filter(
        Prescription.id == fill_data.prescription_id
    ).first()
    
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    if prescription.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot fill prescription with status: {prescription.status}"
        )
    
    # Validate and fill each item
    for item_fill in fill_data.items:
        # Get prescription item
        prescription_item = db.query(PrescriptionItem).filter(
            PrescriptionItem.id == item_fill["item_id"]
        ).first()
        
        if not prescription_item:
            raise HTTPException(status_code=404, detail="Prescription item not found")
        
        # Get batch
        batch = db.query(MedicineBatch).filter(
            MedicineBatch.id == item_fill["batch_id"]
        ).first()
        
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        # Check stock availability
        if batch.current_stock < item_fill["quantity"]:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock in batch {batch.batch_number}"
            )
        
        # Update stock
        batch.current_stock -= item_fill["quantity"]
        
        # Update prescription item with batch
        prescription_item.batch_id = item_fill["batch_id"]
        
        # Create stock movement
        stock_movement = StockMovement(
            batch_id=item_fill["batch_id"],
            movement_type="OUT",
            quantity=item_fill["quantity"],
            reference_type="PRESCRIPTION",
            reference_id=prescription.id,
            reason=f"Filled prescription {prescription.prescription_number}",
            created_by=current_user.id
        )
        db.add(stock_movement)
    
    # Update prescription status
    prescription.status = "filled"
    prescription.filled_at = datetime.utcnow()
    
    db.commit()
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="FILL",
        resource_type="PRESCRIPTION",
        resource_id=prescription.id,
        new_values=f"Filled prescription {prescription.prescription_number}"
    )
    db.add(audit_log)
    db.commit()
    
    return prescription

@router.get("/prescriptions/search", response_model=List[PrescriptionSummary])
async def search_prescriptions(
    search: PrescriptionSearch,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(
        Prescription,
        Patient,
        func.count(PrescriptionItem.id).label('total_items')
    ).join(
        Patient, Prescription.patient_id == Patient.id
    ).outerjoin(
        PrescriptionItem, Prescription.id == PrescriptionItem.prescription_id
    )
    
    # Apply search filters
    if search.query:
        query = query.filter(
            or_(
                Prescription.prescription_number.ilike(f"%{search.query}%"),
                Patient.first_name.ilike(f"%{search.query}%"),
                Patient.last_name.ilike(f"%{search.query}%"),
                Prescription.doctor_name.ilike(f"%{search.query}%")
            )
        )
    
    if search.status:
        query = query.filter(Prescription.status == search.status)
    
    if search.patient_id:
        query = query.filter(Prescription.patient_id == search.patient_id)
    
    if search.date_from:
        query = query.filter(Prescription.created_at >= search.date_from)
    
    if search.date_to:
        query = query.filter(Prescription.created_at <= search.date_to)
    
    prescriptions = query.group_by(
        Prescription.id, Patient.id
    ).order_by(Prescription.created_at.desc()).limit(search.limit).all()
    
    result = []
    for prescription, patient, total_items in prescriptions:
        result.append(PrescriptionSummary(
            id=prescription.id,
            prescription_number=prescription.prescription_number,
            patient_id=prescription.patient_id,
            patient_name=f"{patient.first_name} {patient.last_name}",
            doctor_name=prescription.doctor_name,
            status=prescription.status,
            created_at=prescription.created_at,
            total_items=total_items or 0
        ))
    
    return result