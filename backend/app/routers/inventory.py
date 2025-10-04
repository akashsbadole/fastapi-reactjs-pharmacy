from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import date, datetime, timedelta
import csv
import io
from fastapi.responses import StreamingResponse

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

@router.get("/medicines")
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
    
    # Calculate total stock and average selling price from batches for each medicine
    result = []
    for medicine in medicines:
        # Get all active batches for this medicine
        batches = db.query(MedicineBatch).filter(
            and_(
                MedicineBatch.medicine_id == medicine.id,
                MedicineBatch.is_active == True
            )
        ).all()
        
        # Calculate total stock
        total_stock = sum(batch.current_stock for batch in batches)
        
        # Calculate average selling price from batches
        avg_selling_price = 0
        if batches:
            # Weighted average based on stock quantity
            total_value = sum(batch.selling_price * batch.current_stock for batch in batches if batch.current_stock > 0)
            total_quantity = sum(batch.current_stock for batch in batches if batch.current_stock > 0)
            if total_quantity > 0:
                avg_selling_price = total_value / total_quantity
        
        # Create medicine dict with calculated values
        medicine_dict = medicine.__dict__.copy()
        medicine_dict['total_stock'] = total_stock
        medicine_dict['price'] = avg_selling_price
        
        # Remove SQLAlchemy internal state
        if '_sa_instance_state' in medicine_dict:
            del medicine_dict['_sa_instance_state']
        
        result.append(medicine_dict)
    
    return result

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

@router.delete("/medicines/{medicine_id}")
async def delete_medicine(
    medicine_id: int,
    current_user: User = Depends(require_pharmacist),
    db: Session = Depends(get_db)
):
    db_medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if db_medicine is None:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    # Check if medicine has any active batches
    active_batches = db.query(MedicineBatch).filter(
        and_(
            MedicineBatch.medicine_id == medicine_id,
            MedicineBatch.is_active == True,
            MedicineBatch.current_stock > 0
        )
    ).count()
    
    if active_batches > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete medicine with active stock. Please clear all stock first."
        )
    
    # Soft delete by setting is_active to False
    db_medicine.is_active = False
    db.commit()
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="DELETE",
        resource_type="MEDICINE",
        resource_id=db_medicine.id,
        new_values=f"Deleted medicine {db_medicine.name}"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Medicine deleted successfully"}

@router.delete("/medicines")
async def delete_all_medicines(
    current_user: User = Depends(require_pharmacist),
    db: Session = Depends(get_db)
):
    # Check if any medicine has active stock
    medicines_with_stock = db.query(Medicine).join(MedicineBatch).filter(
        and_(
            Medicine.is_active == True,
            MedicineBatch.is_active == True,
            MedicineBatch.current_stock > 0
        )
    ).distinct().count()
    
    if medicines_with_stock > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete medicines with active stock. Please clear all stock first."
        )
    
    # Soft delete all medicines
    db.query(Medicine).filter(Medicine.is_active == True).update({"is_active": False})
    db.commit()
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="DELETE_ALL",
        resource_type="MEDICINES",
        new_values="Deleted all medicines"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "All medicines deleted successfully"}

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

@router.get("/medicines/export/csv")
async def export_medicines_csv(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get all active medicines
    medicines = db.query(Medicine).filter(Medicine.is_active == True).all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "name", "generic_name", "brand", "category", "description",
        "dosage_form", "strength", "manufacturer", "requires_prescription",
        "barcode", "sku", "pack_size", "hsn_code", "mrp", "purchase_price",
        "selling_price", "tax_percent", "stock_quantity", "reorder_level",
        "storage_condition", "schedule", "alternative_drug_names",
        "substitution_allowed", "location", "notes", "is_active"
    ])
    
    # Write medicine data
    for medicine in medicines:
        writer.writerow([
            medicine.name,
            medicine.generic_name or "",
            medicine.brand or "",
            medicine.category or "",
            medicine.description or "",
            medicine.dosage_form or "",
            medicine.strength or "",
            medicine.manufacturer or "",
            medicine.requires_prescription,
            medicine.barcode or "",
            medicine.sku or "",
            medicine.pack_size or "",
            medicine.hsn_code or "",
            medicine.mrp or "",
            medicine.purchase_price or "",
            medicine.selling_price or "",
            medicine.tax_percent or 0.0,
            medicine.stock_quantity or 0,
            medicine.reorder_level or 10,
            medicine.storage_condition or "",
            medicine.schedule or "",
            medicine.alternative_drug_names or "",
            medicine.substitution_allowed,
            medicine.location or "",
            medicine.notes or "",
            medicine.is_active
        ])
    
    # Create response
    output.seek(0)
    response = StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=medicines.csv"}
    )
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="EXPORT",
        resource_type="MEDICINES",
        new_values=f"Exported {len(medicines)} medicines to CSV"
    )
    db.add(audit_log)
    db.commit()
    
    return response

@router.post("/medicines/import/csv")
async def import_medicines_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(require_pharmacist),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are allowed"
        )
    
    try:
        # Read CSV content
        contents = await file.read()
        csv_data = contents.decode('utf-8').splitlines()
        reader = csv.DictReader(csv_data)
        
        imported_count = 0
        skipped_count = 0
        errors = []
        
        for row_num, row in enumerate(reader, start=2):  # Start at 2 to account for header
            try:
                # Skip empty rows
                if not row.get("name", "").strip():
                    skipped_count += 1
                    continue
                
                # Check if medicine with same name, barcode, or SKU already exists
                # Only check for duplicates if the field has a value
                conditions = []
                name = row.get("name", "").strip()
                barcode = row.get("barcode", "").strip()
                sku = row.get("sku", "").strip()
                
                if name:
                    conditions.append(Medicine.name == name)
                if barcode:
                    conditions.append(Medicine.barcode == barcode)
                if sku:
                    conditions.append(Medicine.sku == sku)
                
                if conditions:
                    existing_medicine = db.query(Medicine).filter(or_(*conditions)).first()
                    
                    if existing_medicine:
                        skipped_count += 1
                        continue
                
                # Parse numeric fields with error handling
                try:
                    mrp = float(row.get("mrp", 0)) if row.get("mrp", "") else None
                except ValueError:
                    mrp = None
                    
                try:
                    purchase_price = float(row.get("purchase_price", 0)) if row.get("purchase_price", "") else None
                except ValueError:
                    purchase_price = None
                    
                try:
                    selling_price = float(row.get("selling_price", 0)) if row.get("selling_price", "") else None
                except ValueError:
                    selling_price = None
                    
                try:
                    tax_percent = float(row.get("tax_percent", 0)) if row.get("tax_percent", "") else 0.0
                except ValueError:
                    tax_percent = 0.0
                    
                try:
                    stock_quantity = int(row.get("stock_quantity", 0)) if row.get("stock_quantity", "") else 0
                except ValueError:
                    stock_quantity = 0
                    
                try:
                    reorder_level = int(row.get("reorder_level", 10)) if row.get("reorder_level", "") else 10
                except ValueError:
                    reorder_level = 10
                
                # Create new medicine
                medicine_data = {
                    "name": row.get("name", "").strip(),
                    "generic_name": row.get("generic_name", "").strip() or None,
                    "brand": row.get("brand", "").strip() or None,
                    "category": row.get("category", "").strip() or None,
                    "description": row.get("description", "").strip() or None,
                    "dosage_form": row.get("dosage_form", "").strip() or None,
                    "strength": row.get("strength", "").strip() or None,
                    "manufacturer": row.get("manufacturer", "").strip() or None,
                    "requires_prescription": row.get("requires_prescription", "False").lower() == "true",
                    "barcode": row.get("barcode", "").strip() or None,
                    
                    # Additional pharmacy management fields
                    "sku": row.get("sku", "").strip() or None,
                    "pack_size": row.get("pack_size", "").strip() or None,
                    "hsn_code": row.get("hsn_code", "").strip() or None,
                    "mrp": mrp,
                    "purchase_price": purchase_price,
                    "selling_price": selling_price,
                    "tax_percent": tax_percent,
                    "stock_quantity": stock_quantity,
                    "reorder_level": reorder_level,
                    "storage_condition": row.get("storage_condition", "").strip() or None,
                    "schedule": row.get("schedule", "").strip() or None,
                    "alternative_drug_names": row.get("alternative_drug_names", "").strip() or None,
                    "substitution_allowed": row.get("substitution_allowed", "True").lower() == "true",
                    "location": row.get("location", "").strip() or None,
                    "notes": row.get("notes", "").strip() or None,
                    
                    "is_active": row.get("is_active", "True").lower() == "true"
                }
                
                # Validate required fields
                if not medicine_data["name"]:
                    errors.append(f"Row {row_num}: Medicine name is required")
                    continue
                
                # Create medicine
                db_medicine = Medicine(**medicine_data)
                db.add(db_medicine)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
                continue
        
        # Commit all changes
        db.commit()
        
        # Create audit log
        audit_log = AuditLog(
            user_id=current_user.id,
            action="IMPORT",
            resource_type="MEDICINES",
            new_values=f"Imported {imported_count} medicines, skipped {skipped_count}, errors: {len(errors)}"
        )
        db.add(audit_log)
        db.commit()
        
        return {
            "message": "Import completed",
            "imported": imported_count,
            "skipped": skipped_count,
            "errors": errors
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error processing CSV file: {str(e)}"
        )

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

@router.get("/analytics/summary")
async def get_inventory_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get total medicines count
    total_medicines = db.query(Medicine).filter(Medicine.is_active == True).count()
    
    # Get total stock value
    total_stock_value = db.query(
        func.sum(Medicine.stock_quantity * Medicine.selling_price)
    ).filter(Medicine.is_active == True).scalar() or 0
    
    # Get low stock medicines count
    low_stock_count = db.query(Medicine).filter(
        and_(
            Medicine.is_active == True,
            Medicine.stock_quantity <= Medicine.reorder_level
        )
    ).count()
    
    # Get out of stock medicines count
    out_of_stock_count = db.query(Medicine).filter(
        and_(
            Medicine.is_active == True,
            Medicine.stock_quantity <= 0
        )
    ).count()
    
    # Get category distribution
    category_distribution = db.query(
        Medicine.category,
        func.count(Medicine.id).label('count')
    ).filter(
        and_(
            Medicine.is_active == True,
            Medicine.category.isnot(None)
        )
    ).group_by(Medicine.category).all()
    
    # Get top 10 medicines by stock value
    top_medicines_by_value = db.query(
        Medicine.name,
        Medicine.stock_quantity,
        Medicine.selling_price,
        (Medicine.stock_quantity * Medicine.selling_price).label('total_value')
    ).filter(
        and_(
            Medicine.is_active == True,
            Medicine.stock_quantity > 0
        )
    ).order_by(
        (Medicine.stock_quantity * Medicine.selling_price).desc()
    ).limit(10).all()
    
    # Get expiring batches count (from existing batches)
    thirty_days_from_now = date.today() + timedelta(days=30)
    expiring_batches_count = db.query(MedicineBatch).filter(
        and_(
            MedicineBatch.is_active == True,
            MedicineBatch.expiry_date <= thirty_days_from_now,
            MedicineBatch.current_stock > 0
        )
    ).count()
    
    return {
        "total_medicines": total_medicines,
        "total_stock_value": float(total_stock_value),
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "expiring_batches_count": expiring_batches_count,
        "category_distribution": [
            {"category": cat, "count": count}
            for cat, count in category_distribution
        ],
        "top_medicines_by_value": [
            {
                "name": name,
                "stock_quantity": stock_quantity,
                "selling_price": float(selling_price),
                "total_value": float(total_value)
            }
            for name, stock_quantity, selling_price, total_value in top_medicines_by_value
        ]
    }

@router.get("/analytics/stock-movement")
async def get_stock_movement_analytics(
    days: int = Query(30, description="Number of days to analyze"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    start_date = datetime.now() - timedelta(days=days)
    
    # Get stock movements grouped by date and type
    movements = db.query(
        func.date(StockMovement.created_at).label('date'),
        StockMovement.movement_type,
        func.sum(StockMovement.quantity).label('total_quantity')
    ).filter(
        StockMovement.created_at >= start_date
    ).group_by(
        func.date(StockMovement.created_at),
        StockMovement.movement_type
    ).order_by(
        func.date(StockMovement.created_at)
    ).all()
    
    # Format data for chart
    movement_data = {}
    for movement in movements:
        date_str = movement.date.isoformat()
        if date_str not in movement_data:
            movement_data[date_str] = {"IN": 0, "OUT": 0, "ADJUSTMENT": 0}
        movement_data[date_str][movement.movement_type] = movement.total_quantity
    
    return {
        "movement_data": movement_data,
        "period_days": days
    }