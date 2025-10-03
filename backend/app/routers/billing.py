from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, date, timedelta
import uuid

from ..models import (
    User, Patient, Invoice, InvoiceItem, Payment, Medicine, MedicineBatch,
    Prescription, AuditLog, StockMovement, Refund
)

from ..database import get_db
from ..models import (
    User, Patient, Invoice, InvoiceItem, Payment, Medicine, MedicineBatch,
    Prescription, AuditLog
)
from ..schemas.billing import (
    Invoice as InvoiceSchema, InvoiceCreate, InvoiceUpdate,
    InvoiceWithItems, InvoiceWithDetails, InvoiceSummary,
    Payment as PaymentSchema, PaymentCreate,
    RefundCreate, Refund,
    DailySales, SalesReport, TaxCalculation
)
from ..utils.auth import get_current_active_user, require_cashier

router = APIRouter()

# Tax rate (can be made configurable)
TAX_RATE = 0.05  # 5% tax

def generate_invoice_number() -> str:
    # Generate a unique invoice number with timestamp
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_id = str(uuid.uuid4())[:6].upper()
    return f"INV{timestamp}{random_id}"

def calculate_tax(subtotal: float) -> float:
    return subtotal * TAX_RATE

@router.post("/", response_model=InvoiceWithItems)
async def create_invoice(
    invoice: InvoiceCreate,
    current_user: User = Depends(require_cashier),
    db: Session = Depends(get_db)
):
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == invoice.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Calculate totals
    subtotal = 0.0
    total_discount = 0.0
    
    # Validate items and calculate totals
    for item in invoice.items:
        # Verify medicine and batch exist
        medicine = db.query(Medicine).filter(Medicine.id == item.medicine_id).first()
        if not medicine:
            raise HTTPException(status_code=404, detail=f"Medicine with ID {item.medicine_id} not found")
        
        batch = db.query(MedicineBatch).filter(MedicineBatch.id == item.batch_id).first()
        if not batch:
            raise HTTPException(status_code=404, detail=f"Batch with ID {item.batch_id} not found")
        
        # Check if batch belongs to the medicine
        if batch.medicine_id != item.medicine_id:
            raise HTTPException(
                status_code=400,
                detail=f"Batch {batch.batch_number} does not belong to medicine {medicine.name}"
            )
        
        # Check stock availability
        if batch.current_stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {medicine.name} in batch {batch.batch_number}"
            )
        
        # Calculate item total
        item_total = (item.unit_price * item.quantity) - item.discount
        subtotal += item_total
        total_discount += item.discount
    
    # Calculate tax and total
    tax_amount = calculate_tax(subtotal)
    total_amount = subtotal + tax_amount
    
    # Create invoice
    db_invoice = Invoice(
        invoice_number=generate_invoice_number(),
        patient_id=invoice.patient_id,
        subtotal=subtotal,
        tax_amount=tax_amount,
        discount_amount=total_discount,
        total_amount=total_amount,
        payment_status="PENDING",
        payment_mode=invoice.payment_mode,
        paid_amount=0.0,
        created_by=current_user.id
    )
    
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    
    # Create invoice items
    for item_data in invoice.items:
        # Calculate item total
        item_total = (item_data.unit_price * item_data.quantity) - item_data.discount
        
        db_item = InvoiceItem(
            invoice_id=db_invoice.id,
            medicine_id=item_data.medicine_id,
            batch_id=item_data.batch_id,
            prescription_id=item_data.prescription_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            discount=item_data.discount,
            total=item_total
        )
        db.add(db_item)
        
        # Update stock (reserve the items)
        batch = db.query(MedicineBatch).filter(MedicineBatch.id == item_data.batch_id).first()
        batch.current_stock -= item_data.quantity
        
        # Create stock movement
        stock_movement = StockMovement(
            batch_id=item_data.batch_id,
            movement_type="OUT",
            quantity=item_data.quantity,
            reference_type="INVOICE",
            reference_id=db_invoice.id,
            reason=f"Sold via invoice {db_invoice.invoice_number}",
            created_by=current_user.id
        )
        db.add(stock_movement)
    
    db.commit()
    db.refresh(db_invoice)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="CREATE",
        resource_type="INVOICE",
        resource_id=db_invoice.id,
        new_values=f"Created invoice {db_invoice.invoice_number} for patient {patient.first_name} {patient.last_name}"
    )
    db.add(audit_log)
    db.commit()
    
    # Get items with details
    items = db.query(InvoiceItem).filter(
        InvoiceItem.invoice_id == db_invoice.id
    ).all()
    
    return InvoiceWithItems(**db_invoice.__dict__, items=items)

@router.get("/", response_model=List[InvoiceSummary])
async def list_invoices(
    skip: int = 0,
    limit: int = 50,
    payment_status: Optional[str] = None,
    patient_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Invoice, Patient).join(
        Patient, Invoice.patient_id == Patient.id
    )
    
    if payment_status:
        query = query.filter(Invoice.payment_status == payment_status)
    
    if patient_id:
        query = query.filter(Invoice.patient_id == patient_id)
    
    if date_from:
        query = query.filter(Invoice.created_at >= date_from)
    
    if date_to:
        query = query.filter(Invoice.created_at <= date_to)
    
    invoices = query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for invoice, patient in invoices:
        result.append(InvoiceSummary(
            id=invoice.id,
            invoice_number=invoice.invoice_number,
            patient_id=invoice.patient_id,
            patient_name=f"{patient.first_name} {patient.last_name}",
            total_amount=invoice.total_amount,
            payment_status=invoice.payment_status,
            payment_mode=invoice.payment_mode,
            created_at=invoice.created_at
        ))
    
    return result

@router.get("/{invoice_id}", response_model=InvoiceWithDetails)
async def get_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get invoice with patient and creator details
    invoice = db.query(Invoice, Patient, User).join(
        Patient, Invoice.patient_id == Patient.id
    ).join(
        User, Invoice.created_by == User.id
    ).filter(Invoice.id == invoice_id).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice_obj, patient, creator = invoice
    
    # Get invoice items with medicine and batch details
    items = db.query(
        InvoiceItem, Medicine, MedicineBatch, Prescription
    ).join(
        Medicine, InvoiceItem.medicine_id == Medicine.id
    ).join(
        MedicineBatch, InvoiceItem.batch_id == MedicineBatch.id
    ).outerjoin(
        Prescription, InvoiceItem.prescription_id == Prescription.id
    ).filter(
        InvoiceItem.invoice_id == invoice_id
    ).all()
    
    item_details = []
    for item, medicine, batch, prescription in items:
        item_details.append(InvoiceItemWithDetails(
            **item.__dict__,
            medicine_name=medicine.name,
            batch_number=batch.batch_number,
            prescription_number=prescription.prescription_number if prescription else None
        ))
    
    return InvoiceWithDetails(
        **invoice_obj.__dict__,
        items=item_details,
        patient_name=f"{patient.first_name} {patient.last_name}",
        created_by_name=creator.full_name
    )

@router.put("/{invoice_id}", response_model=InvoiceSchema)
async def update_invoice(
    invoice_id: int,
    invoice_update: InvoiceUpdate,
    current_user: User = Depends(require_cashier),
    db: Session = Depends(get_db)
):
    db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Store old values for audit
    old_status = db_invoice.payment_status
    
    # Update invoice fields if provided
    update_data = invoice_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_invoice, field, value)
    
    db.commit()
    db.refresh(db_invoice)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="UPDATE",
        resource_type="INVOICE",
        resource_id=db_invoice.id,
        new_values=f"Updated invoice {db_invoice.invoice_number}"
    )
    db.add(audit_log)
    db.commit()
    
    return db_invoice

@router.post("/{invoice_id}/payments", response_model=PaymentSchema)
async def create_payment(
    invoice_id: int,
    payment: PaymentCreate,
    current_user: User = Depends(require_cashier),
    db: Session = Depends(get_db)
):
    # Verify invoice exists
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check if payment amount exceeds remaining balance
    remaining_balance = invoice.total_amount - invoice.paid_amount
    if payment.amount > remaining_balance:
        raise HTTPException(
            status_code=400,
            detail=f"Payment amount exceeds remaining balance of {remaining_balance}"
        )
    
    # Create payment
    db_payment = Payment(
        invoice_id=invoice_id,
        amount=payment.amount,
        payment_mode=payment.payment_mode,
        transaction_id=payment.transaction_id,
        notes=payment.notes,
        created_by=current_user.id
    )
    
    db.add(db_payment)
    
    # Update invoice paid amount
    invoice.paid_amount += payment.amount
    
    # Update payment status if fully paid
    if invoice.paid_amount >= invoice.total_amount:
        invoice.payment_status = "PAID"
    elif invoice.paid_amount > 0:
        invoice.payment_status = "PARTIAL"
    
    db.commit()
    db.refresh(db_payment)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="PAYMENT",
        resource_type="INVOICE",
        resource_id=invoice_id,
        new_values=f"Payment of {payment.amount} for invoice {invoice.invoice_number}"
    )
    db.add(audit_log)
    db.commit()
    
    return db_payment

@router.get("/{invoice_id}/payments", response_model=List[PaymentSchema])
async def get_invoice_payments(
    invoice_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Verify invoice exists
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    payments = db.query(Payment).filter(Payment.invoice_id == invoice_id).all()
    return payments

@router.post("/{invoice_id}/refund")
async def refund_invoice(
    invoice_id: int,
    refund: RefundCreate,
    current_user: User = Depends(require_cashier),
    db: Session = Depends(get_db)
):
    # Verify invoice exists
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Check if invoice is paid
    if invoice.payment_status != "PAID":
        raise HTTPException(
            status_code=400,
            detail="Only paid invoices can be refunded"
        )
    
    # Check if refund amount exceeds total amount
    if refund.amount > invoice.total_amount:
        raise HTTPException(
            status_code=400,
            detail="Refund amount cannot exceed invoice total"
        )
    
    # Create refund record (simplified - in real system would have separate refund table)
    db_refund = Refund(
        invoice_id=invoice_id,
        amount=refund.amount,
        reason=refund.reason,
        created_by=current_user.id
    )
    
    db.add(db_refund)
    
    # Update invoice status
    invoice.payment_status = "REFUNDED"
    invoice.paid_amount = 0
    
    # Return items to stock (simplified - would need to track which items to return)
    items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice_id).all()
    for item in items:
        batch = db.query(MedicineBatch).filter(MedicineBatch.id == item.batch_id).first()
        if batch:
            batch.current_stock += item.quantity
            
            # Create stock movement
            stock_movement = StockMovement(
                batch_id=item.batch_id,
                movement_type="IN",
                quantity=item.quantity,
                reference_type="REFUND",
                reference_id=invoice_id,
                reason=f"Refund for invoice {invoice.invoice_number}",
                created_by=current_user.id
            )
            db.add(stock_movement)
    
    db.commit()
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="REFUND",
        resource_type="INVOICE",
        resource_id=invoice_id,
        new_values=f"Refunded {refund.amount} for invoice {invoice.invoice_number}: {refund.reason}"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Invoice refunded successfully", "refund_id": db_refund.id}

@router.get("/sales-report", response_model=SalesReport)
async def get_sales_report(
    period: str = Query("week", description="Period: day, week, month, year"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Calculate date range based on period
    end_date = datetime.utcnow()
    if period == "day":
        start_date = end_date - timedelta(days=1)
    elif period == "week":
        start_date = end_date - timedelta(weeks=1)
    elif period == "month":
        start_date = end_date - timedelta(days=30)
    elif period == "year":
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(weeks=1)
    
    # Get sales data
    sales_data = db.query(
        func.date(Invoice.created_at).label('date'),
        func.sum(Invoice.total_amount).label('total_sales'),
        func.count(Invoice.id).label('total_invoices'),
        func.sum(func.case([(Invoice.payment_mode == 'CASH', Invoice.total_amount)], else_=0)).label('cash_sales'),
        func.sum(func.case([(Invoice.payment_mode == 'CARD', Invoice.total_amount)], else_=0)).label('card_sales'),
        func.sum(func.case([(Invoice.payment_mode == 'INSURANCE', Invoice.total_amount)], else_=0)).label('insurance_sales')
    ).filter(
        and_(
            Invoice.created_at >= start_date,
            Invoice.created_at <= end_date,
            Invoice.payment_status == 'PAID'
        )
    ).group_by(func.date(Invoice.created_at)).all()
    
    # Calculate totals
    total_sales = sum(data.total_sales or 0 for data in sales_data)
    total_invoices = sum(data.total_invoices or 0 for data in sales_data)
    average_invoice_value = total_sales / total_invoices if total_invoices > 0 else 0
    
    # Format daily sales
    daily_sales = []
    for data in sales_data:
        daily_sales.append(DailySales(
            date=data.date,
            total_sales=data.total_sales or 0,
            total_invoices=data.total_invoices or 0,
            cash_sales=data.cash_sales or 0,
            card_sales=data.card_sales or 0,
            insurance_sales=data.insurance_sales or 0
        ))
    
    # Payment breakdown
    payment_breakdown = {
        "cash": sum(data.cash_sales or 0 for data in sales_data),
        "card": sum(data.card_sales or 0 for data in sales_data),
        "insurance": sum(data.insurance_sales or 0 for data in sales_data)
    }
    
    return SalesReport(
        period=period,
        total_sales=total_sales,
        total_invoices=total_invoices,
        average_invoice_value=average_invoice_value,
        payment_breakdown=payment_breakdown,
        daily_sales=daily_sales
    )

@router.post("/calculate-tax", response_model=TaxCalculation)
async def calculate_tax_endpoint(
    subtotal: float,
    current_user: User = Depends(get_current_active_user)
):
    tax_amount = calculate_tax(subtotal)
    total_with_tax = subtotal + tax_amount
    
    return TaxCalculation(
        subtotal=subtotal,
        tax_rate=TAX_RATE,
        tax_amount=tax_amount,
        total_with_tax=total_with_tax
    )