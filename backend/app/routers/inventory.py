from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import date, datetime, timedelta

from ..database import get_db
from ..models import User, Medicine, MedicineBatch, Supplier, StockMovement, AuditLog
from ..schemas.inventory import (
    Supplier as SupplierSchema, SupplierCreate, SupplierUpdate,
    Medicine as MedicineSchema, MedicineCreate, MedicineUpdate,
    MedicineBatch as MedicineBatchSchema, MedicineBatchCreate, MedicineBatchUpdate,
    StockMovement as StockMovementSchema, StockMovementCreate,
    MedicineWithBatches, BatchWithDetails, LowStockAlert, ExpiryAlert
)
from ..utils.auth import get_current_active_user, require_pharmacist

router = APIRouter()

# Supplier endpoints
@router.post("/suppliers", response_model=SupplierSchema)
async def create_supplier(
    supplier: SupplierCreate,
    current_user: User = Depends(require_pharmacist),
    db: Session = Depends(get_db)
):
    db_supplier = Supplier(**supplier.dict())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="CREATE",
        resource_type="SUPPLIER",
        resource_id=db_supplier.id,
        new_values=f"Created supplier {supplier.name}"
    )
    db.add(audit_log)
    db.commit()
    
    return db_supplier

@router.get("/suppliers", response_model=List[SupplierSchema])
async def list_suppliers(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Supplier).filter(Supplier.is_active == True)
    
    if search:
        query = query.filter(
            or_(
                Supplier.name.ilike(f"%{search}%"),
                Supplier.contact_person.ilike(f"%{search}%"),
                Supplier.phone.ilike(f"%{search}%")
            )
        )
    
    suppliers = query.offset(skip).limit(limit).all()
    return suppliers

@router.get("/suppliers/{supplier_id}", response_model=SupplierSchema)
async def get_supplier(
    supplier_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

@router.put("/suppliers/{supplier_id}", response_model=SupplierSchema)
async def update_supplier(
    supplier_id: int,
    supplier_update: SupplierUpdate,
    current_user: User = Depends(require_pharmacist),
    db: Session = Depends(get_db)
):
    db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    update_data = supplier_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_supplier, field, value)
    
    db.commit()
    db.refresh(db_supplier)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="UPDATE",
        resource_type="SUPPLIER",
        resource_id=db_supplier.id,
        new_values=f"Updated supplier {db_supplier.name}"
    )
    db.add(audit_log)
    db.commit()
    
    return db_supplier

# Medicine endpoints
@router.post("/medicines", response_model=MedicineSchema)
async def create_medicine(
    medicine: MedicineCreate,
    current_user: User = Depends(require_pharmacist),
    db: Session = Depends(get_db)
):
    # Check if medicine with same name or barcode already exists
    existing_medicine = db.query(Medicine).filter(
        or_(Medicine.name == medicine.name, Medicine.barcode == medicine.barcode)
    ).first()
    
    if existing_medicine:
        raise HTTPException(
            status_code=400,
            detail="Medicine with this name or barcode already exists"
        )
    
    db_medicine = Medicine(**medicine.dict())
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="CREATE",
        resource_type="MEDICINE",
        resource_id=db_medicine.id,
        new_values=f"Created medicine {medicine.name}"
    )
    db.add(audit_log)
    db.commit()
    
    return db_medicine

@router.get("/medicines", response_model=List[MedicineSchema])
async def list_medicines(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Medicine).filter(Medicine.is_active == True)
    
    if search:
        query = query.filter(
            or_(
                Medicine.name.ilike(f"%{search}%"),
                Medicine.generic_name.ilike(f"%{search}%"),
                Medicine.brand.ilike(f"%{search}%"),
                Medicine.barcode.ilike(f"%{search}%")
            )
        )
    
    if category:
        query = query.filter(Medicine.category == category)
    
    medicines = query.offset(skip).limit(limit).all()
    return medicines

@router.get("/medicines/{medicine_id}", response_model=MedicineWithBatches)
async def get_medicine(
    medicine_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if medicine is None:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    # Get active batches for this medicine
    batches = db.query(MedicineBatch).filter(
        and_(
            MedicineBatch.medicine_id == medicine_id,
            MedicineBatch.is_active == True,
            MedicineBatch.current_stock > 0
        )
    ).all()
    
    return MedicineWithBatches(**medicine.__dict__, batches=batches)

@router.put("/medicines/{medicine_id}", response_model=MedicineSchema)
async def update_medicine(
    medicine_id: int,
    medicine_update: MedicineUpdate,
    current_user: User = Depends(require_pharmacist),
    db: Session = Depends(get_db)
):
    db_medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if db_medicine is None:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    update_data = medicine_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_medicine, field, value)
    
    db.commit()
    db.refresh(db_medicine)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="UPDATE",
        resource_type="MEDICINE",
        resource_id=db_medicine.id,
        new_values=f"Updated medicine {db_medicine.name}"
    )
    db.add(audit_log)
    db.commit()
    
    return db_medicine

# Medicine Batch endpoints
@router.post("/batches", response_model=MedicineBatchSchema)
async def create_medicine_batch(
    batch: MedicineBatchCreate,
    current_user: User = Depends(require_pharmacist),
    db: Session = Depends(get_db)
):
    # Verify medicine and supplier exist
    medicine = db.query(Medicine).filter(Medicine.id == batch.medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    supplier = db.query(Supplier).filter(Supplier.id == batch.supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Check if batch number already exists for this medicine
    existing_batch = db.query(MedicineBatch).filter(
        and_(
            MedicineBatch.medicine_id == batch.medicine_id,
            MedicineBatch.batch_number == batch.batch_number
        )
    ).first()
    
    if existing_batch:
        raise HTTPException(
            status_code=400,
            detail="Batch number already exists for this medicine"
        )
    
    db_batch = MedicineBatch(
        **batch.dict(),
        current_stock=batch.quantity
    )
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    
    # Create stock movement
    stock_movement = StockMovement(
        batch_id=db_batch.id,
        movement_type="IN",
        quantity=batch.quantity,
        reference_type="PURCHASE",
        reason=f"Initial stock for batch {batch.batch_number}",
        created_by=current_user.id
    )
    db.add(stock_movement)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="CREATE",
        resource_type="BATCH",
        resource_id=db_batch.id,
        new_values=f"Created batch {batch.batch_number} for {medicine.name}"
    )
    db.add(audit_log)
    db.commit()
    
    return db_batch

@router.get("/batches", response_model=List[BatchWithDetails])
async def list_medicine_batches(
    skip: int = 0,
    limit: int = 100,
    medicine_id: Optional[int] = None,
    low_stock: Optional[bool] = False,
    expiring_soon: Optional[bool] = False,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(MedicineBatch).filter(MedicineBatch.is_active == True)
    
    if medicine_id:
        query = query.filter(MedicineBatch.medicine_id == medicine_id)
    
    if low_stock:
        query = query.filter(
            MedicineBatch.current_stock <= MedicineBatch.low_stock_threshold
        )
    
    if expiring_soon:
        thirty_days_from_now = date.today() + timedelta(days=30)
        query = query.filter(
            and_(
                MedicineBatch.expiry_date <= thirty_days_from_now,
                MedicineBatch.current_stock > 0
            )
        )
    
    batches = query.offset(skip).limit(limit).all()
    
    # Load relationships
    result = []
    for batch in batches:
        medicine = db.query(Medicine).filter(Medicine.id == batch.medicine_id).first()
        supplier = db.query(Supplier).filter(Supplier.id == batch.supplier_id).first()
        result.append(BatchWithDetails(
            **batch.__dict__,
            medicine=medicine,
            supplier=supplier
        ))
    
    return result

@router.get("/batches/{batch_id}", response_model=BatchWithDetails)
async def get_medicine_batch(
    batch_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    batch = db.query(MedicineBatch).filter(MedicineBatch.id == batch_id).first()
    if batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    medicine = db.query(Medicine).filter(Medicine.id == batch.medicine_id).first()
    supplier = db.query(Supplier).filter(Supplier.id == batch.supplier_id).first()
    
    return BatchWithDetails(
        **batch.__dict__,
        medicine=medicine,
        supplier=supplier
    )

@router.post("/batches/{batch_id}/stock-movement", response_model=StockMovementSchema)
async def create_stock_movement(
    batch_id: int,
    movement: StockMovementCreate,
    current_user: User = Depends(require_pharmacist),
    db: Session = Depends(get_db)
):
    batch = db.query(MedicineBatch).filter(MedicineBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    # Update stock based on movement type
    if movement.movement_type == "OUT":
        if batch.current_stock < movement.quantity:
            raise HTTPException(
                status_code=400,
                detail="Insufficient stock in batch"
            )
        batch.current_stock -= movement.quantity
    elif movement.movement_type == "IN":
        batch.current_stock += movement.quantity
    elif movement.movement_type == "ADJUSTMENT":
        batch.current_stock = movement.quantity
    
    db.commit()
    
    # Create stock movement record
    stock_movement = StockMovement(
        batch_id=batch_id,
        movement_type=movement.movement_type,
        quantity=movement.quantity,
        reference_type=movement.reference_type,
        reference_id=movement.reference_id,
        reason=movement.reason,
        created_by=current_user.id
    )
    db.add(stock_movement)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="STOCK_MOVEMENT",
        resource_type="BATCH",
        resource_id=batch_id,
        new_values=f"{movement.movement_type} {movement.quantity} units from batch {batch.batch_number}"
    )
    db.add(audit_log)
    db.commit()
    
    return stock_movement

@router.get("/alerts/low-stock", response_model=List[LowStockAlert])
async def get_low_stock_alerts(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get batches with low stock
    low_stock_batches = db.query(MedicineBatch, Medicine).join(
        Medicine, MedicineBatch.medicine_id == Medicine.id
    ).filter(
        and_(
            MedicineBatch.is_active == True,
            MedicineBatch.current_stock <= MedicineBatch.low_stock_threshold,
            MedicineBatch.current_stock > 0
        )
    ).all()
    
    alerts = []
    for batch, medicine in low_stock_batches:
        alerts.append(LowStockAlert(
            medicine_id=medicine.id,
            medicine_name=medicine.name,
            batch_number=batch.batch_number,
            current_stock=batch.current_stock,
            low_stock_threshold=batch.low_stock_threshold,
            expiry_date=batch.expiry_date
        ))
    
    return alerts

@router.get("/alerts/expiring-soon", response_model=List[ExpiryAlert])
async def get_expiring_soon_alerts(
    days: int = Query(30, description="Days until expiry to alert"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    expiry_date = date.today() + timedelta(days=days)
    
    # Get batches expiring soon
    expiring_batches = db.query(MedicineBatch, Medicine).join(
        Medicine, MedicineBatch.medicine_id == Medicine.id
    ).filter(
        and_(
            MedicineBatch.is_active == True,
            MedicineBatch.expiry_date <= expiry_date,
            MedicineBatch.current_stock > 0
        )
    ).all()
    
    alerts = []
    for batch, medicine in expiring_batches:
        days_until_expiry = (batch.expiry_date - date.today()).days
        alerts.append(ExpiryAlert(
            medicine_id=medicine.id,
            medicine_name=medicine.name,
            batch_number=batch.batch_number,
            current_stock=batch.current_stock,
            expiry_date=batch.expiry_date,
            days_until_expiry=days_until_expiry
        ))
    
    return alerts