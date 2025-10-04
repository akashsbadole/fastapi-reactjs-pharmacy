from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, case
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
import json
import uuid
from decimal import Decimal

from ..models import (
    User, Patient, Invoice, InvoiceItem, Payment, Medicine, MedicineBatch,
    Prescription, PrescriptionItem, AuditLog, StockMovement, Refund, HoldBill,
    OrganizationSettings, POSSettings
)
from ..database import get_db
from ..schemas.pos import (
    POSMedicineSearch, POSMedicineWithBatches, POSBatchInfo,
    POSCart, POSCartItem, POSCustomer, POSPayment, POSSplitPayment,
    POSTransaction, POSInvoiceCreate, POSHoldBill, POSReceipt,
    POSQuickSale, POSBarcodeScan, POSStockAlert, POSExpiryAlert,
    POSDailySummary, POSConfig
)
from ..schemas.billing import InvoiceWithItems
from ..utils.auth import get_current_active_user, require_cashier

router = APIRouter()

# POS Configuration (can be moved to database later)
POS_CONFIG = {
    "store_name": "Pharmacy Plus",
    "store_address": "123 Main St, City, State 12345",
    "store_phone": "+1-555-123-4567",
    "store_email": "info@pharmacyplus.com",
    "tax_rate": 0.05,  # 5% tax
    "currency_symbol": "$",
    "receipt_header": "PHARMACY PLUS - Your Health Partner",
    "receipt_footer": "Thank you for visiting! Please come again",
    "low_stock_threshold": 10,
    "expiry_warning_days": 30,
    "enable_barcode_scanning": True,
    "enable_prescription_validation": True,
    "require_manager_for_discount": True,
    "max_discount_percentage": 15.0
}

def generate_receipt_number() -> str:
    """Generate a unique receipt number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_id = str(uuid.uuid4())[:6].upper()
    return f"RCP{timestamp}{random_id}"

def generate_hold_number() -> str:
    """Generate a unique hold bill number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_id = str(uuid.uuid4())[:4].upper()
    return f"HOLD{timestamp}{random_id}"

def calculate_tax(subtotal: float) -> float:
    """Calculate tax based on POS configuration"""
    return subtotal * POS_CONFIG["tax_rate"]

def check_expiry_warnings(batch: MedicineBatch) -> Optional[str]:
    """Check if batch is expiring soon and return warning level"""
    days_until_expiry = (batch.expiry_date - date.today()).days
    
    if days_until_expiry <= 0:
        return "EXPIRED"
    elif days_until_expiry <= 30:
        return "CRITICAL"
    elif days_until_expiry <= 60:
        return "WARNING"
    
    return None

@router.get("/medicines/search", response_model=List[POSMedicineWithBatches])
async def search_medicines_pos(
    query: str = Query(..., description="Search query for medicine name, barcode, or SKU"),
    limit: int = Query(20, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Search medicines for POS with batch information"""
    
    # Search by name, barcode, or SKU
    medicines = db.query(Medicine).filter(
        and_(
            Medicine.is_active == True,
            or_(
                Medicine.name.ilike(f"%{query}%"),
                Medicine.generic_name.ilike(f"%{query}%"),
                Medicine.barcode == query,
                Medicine.sku == query
            )
        )
    ).limit(limit).all()
    
    result = []
    for medicine in medicines:
        # Get available batches with stock
        batches = db.query(MedicineBatch).filter(
            and_(
                MedicineBatch.medicine_id == medicine.id,
                MedicineBatch.current_stock > 0,
                MedicineBatch.is_active == True,
                MedicineBatch.expiry_date > date.today()
            )
        ).order_by(MedicineBatch.expiry_date).all()
        
        # Add expiry warnings to batches
        batch_info = []
        for batch in batches:
            expiry_warning = check_expiry_warnings(batch)
            batch_data = POSBatchInfo(**batch.__dict__)
            batch_info.append(batch_data)
        
        medicine_data = POSMedicineWithBatches(**medicine.__dict__, batches=batch_info)
        result.append(medicine_data)
    
    return result

@router.post("/barcode/scan", response_model=POSMedicineWithBatches)
async def scan_barcode(
    scan_data: POSBarcodeScan,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Scan barcode to get medicine information"""
    
    # Find medicine by barcode
    medicine = db.query(Medicine).filter(
        and_(
            Medicine.barcode == scan_data.barcode,
            Medicine.is_active == True
        )
    ).first()
    
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found with this barcode")
    
    # Get available batches
    batches = db.query(MedicineBatch).filter(
        and_(
            MedicineBatch.medicine_id == medicine.id,
            MedicineBatch.current_stock > 0,
            MedicineBatch.is_active == True,
            MedicineBatch.expiry_date > date.today()
        )
    ).order_by(MedicineBatch.expiry_date).all()
    
    if not batches:
        raise HTTPException(status_code=400, detail="No stock available for this medicine")
    
    batch_info = [POSBatchInfo(**batch.__dict__) for batch in batches]
    
    return POSMedicineWithBatches(**medicine.__dict__, batches=batch_info)

@router.get("/stock/alerts", response_model=List[POSStockAlert])
async def get_stock_alerts(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get stock alerts for POS"""
    
    alerts = []
    
    # Low stock alerts
    low_stock_batches = db.query(Medicine, MedicineBatch).join(
        MedicineBatch, Medicine.id == MedicineBatch.medicine_id
    ).filter(
        and_(
            MedicineBatch.current_stock <= MedicineBatch.low_stock_threshold,
            MedicineBatch.current_stock > 0,
            Medicine.is_active == True,
            MedicineBatch.is_active == True
        )
    ).all()
    
    for medicine, batch in low_stock_batches:
        batch_info = [POSBatchInfo(**batch.__dict__)]
        alert = POSStockAlert(
            medicine_id=medicine.id,
            medicine_name=medicine.name,
            current_stock=batch.current_stock,
            reorder_level=batch.low_stock_threshold,
            batch_info=batch_info,
            alert_type="LOW_STOCK"
        )
        alerts.append(alert)
    
    # Expiry alerts
    expiry_date_limit = date.today() + timedelta(days=POS_CONFIG["expiry_warning_days"])
    expiring_batches = db.query(Medicine, MedicineBatch).join(
        MedicineBatch, Medicine.id == MedicineBatch.medicine_id
    ).filter(
        and_(
            MedicineBatch.expiry_date <= expiry_date_limit,
            MedicineBatch.expiry_date > date.today(),
            MedicineBatch.current_stock > 0,
            Medicine.is_active == True,
            MedicineBatch.is_active == True
        )
    ).all()
    
    for medicine, batch in expiring_batches:
        days_until_expiry = (batch.expiry_date - date.today()).days
        alert_level = "CRITICAL" if days_until_expiry <= 30 else "WARNING"
        
        batch_info = [POSBatchInfo(**batch.__dict__)]
        alert = POSStockAlert(
            medicine_id=medicine.id,
            medicine_name=medicine.name,
            current_stock=batch.current_stock,
            reorder_level=batch.low_stock_threshold,
            batch_info=batch_info,
            alert_type="EXPIRING_SOON"
        )
        alerts.append(alert)
    
    return alerts

@router.post("/cart/calculate", response_model=POSCart)
async def calculate_cart_totals(
    cart: POSCart,
    current_user: User = Depends(get_current_active_user)
):
    """Calculate cart totals including tax and discounts"""
    
    # Calculate subtotal
    subtotal = sum(item.total for item in cart.items)
    
    # Calculate tax
    tax_amount = calculate_tax(subtotal)
    
    # Calculate total
    total_amount = subtotal + tax_amount
    
    # Update cart with calculated values
    cart.subtotal = subtotal
    cart.tax_amount = tax_amount
    cart.total_amount = total_amount
    cart.discount_total = sum(item.discount for item in cart.items)
    
    return cart

@router.post("/sale/quick", response_model=InvoiceWithItems)
async def quick_sale(
    sale_data: POSQuickSale,
    current_user: User = Depends(require_cashier),
    db: Session = Depends(get_db)
):
    """Process a quick sale with minimal information"""
    
    # Find medicine by barcode or ID
    if sale_data.barcode:
        medicine = db.query(Medicine).filter(
            and_(
                Medicine.barcode == sale_data.barcode,
                Medicine.is_active == True
            )
        ).first()
    elif sale_data.medicine_id:
        medicine = db.query(Medicine).filter(
            and_(
                Medicine.id == sale_data.medicine_id,
                Medicine.is_active == True
            )
        ).first()
    else:
        raise HTTPException(status_code=400, detail="Either barcode or medicine_id is required")
    
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    # Get available batch
    batch = db.query(MedicineBatch).filter(
        and_(
            MedicineBatch.medicine_id == medicine.id,
            MedicineBatch.current_stock >= sale_data.quantity,
            MedicineBatch.is_active == True,
            MedicineBatch.expiry_date > date.today()
        )
    ).order_by(MedicineBatch.expiry_date).first()
    
    if not batch:
        raise HTTPException(status_code=400, detail="No stock available")
    
    # Find or create patient
    patient = None
    if sale_data.customer_phone:
        patient = db.query(Patient).filter(Patient.phone == sale_data.customer_phone).first()
    
    if not patient:
        # Create a temporary patient record
        patient = Patient(
            patient_id=f"TEMP{datetime.now().strftime('%Y%m%d%H%M%S')}",
            first_name="Walk-in",
            last_name="Customer",
            phone=sale_data.customer_phone or "N/A",
            date_of_birth=date.today()
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)
    
    # Create invoice
    from ..routers.billing import generate_invoice_number
    
    unit_price = batch.selling_price
    item_total = unit_price * sale_data.quantity
    subtotal = item_total
    tax_amount = calculate_tax(subtotal)
    total_amount = subtotal + tax_amount
    
    invoice = Invoice(
        invoice_number=generate_invoice_number(),
        patient_id=patient.id,
        subtotal=subtotal,
        tax_amount=tax_amount,
        discount_amount=0.0,
        total_amount=total_amount,
        payment_status="PAID",
        payment_mode=sale_data.payment_mode,
        paid_amount=total_amount,
        created_by=current_user.id
    )
    
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    
    # Create invoice item
    invoice_item = InvoiceItem(
        invoice_id=invoice.id,
        medicine_id=medicine.id,
        batch_id=batch.id,
        quantity=sale_data.quantity,
        unit_price=unit_price,
        discount=0.0,
        total=item_total
    )
    
    db.add(invoice_item)
    
    # Update stock
    batch.current_stock -= sale_data.quantity
    
    # Create stock movement
    stock_movement = StockMovement(
        batch_id=batch.id,
        movement_type="OUT",
        quantity=sale_data.quantity,
        reference_type="QUICK_SALE",
        reference_id=invoice.id,
        reason=f"Quick sale via POS",
        created_by=current_user.id
    )
    db.add(stock_movement)
    
    # Create payment
    payment = Payment(
        invoice_id=invoice.id,
        amount=sale_data.amount_paid or total_amount,
        payment_mode=sale_data.payment_mode,
        created_by=current_user.id
    )
    db.add(payment)
    
    db.commit()
    
    # Get invoice with items
    items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.id).all()
    
    return InvoiceWithItems(**invoice.__dict__, items=items)

@router.post("/sale", response_model=InvoiceWithItems)
async def process_sale(
    sale_data: POSInvoiceCreate,
    current_user: User = Depends(require_cashier),
    db: Session = Depends(get_db)
):
    """Process a complete POS sale"""
    
    # Validate all items have sufficient stock
    for item in sale_data.items:
        batch = db.query(MedicineBatch).filter(MedicineBatch.id == item.batch_id).first()
        if not batch or batch.current_stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for item in batch {item.batch_number}"
            )
    
    # Validate prescription if required
    for item in sale_data.items:
        if item.requires_prescription and not item.prescription_id:
            raise HTTPException(
                status_code=400,
                detail=f"Prescription required for {item.medicine_name}"
            )
    
    # Handle patient - create a temporary patient for walk-in customers
    patient_id = sale_data.patient_id
    if not patient_id:
        # Create a temporary patient record for walk-in customer
        customer_name = "Walk-in Customer"
        customer_phone = "N/A"
        
        if sale_data.customer_info:
            customer_name = sale_data.customer_info.name
            customer_phone = sale_data.customer_info.phone or "N/A"
        
        patient = Patient(
            patient_id=f"TEMP{datetime.now().strftime('%Y%m%d%H%M%S')}",
            first_name=customer_name.split(' ')[0] if ' ' in customer_name else customer_name,
            last_name=customer_name.split(' ')[1] if ' ' in customer_name else "Customer",
            phone=customer_phone,
            date_of_birth=date.today()
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)
        patient_id = patient.id
    
    # Create invoice
    from ..routers.billing import generate_invoice_number
    
    invoice = Invoice(
        invoice_number=generate_invoice_number(),
        patient_id=patient_id,  # This should now have a valid ID
        subtotal=sale_data.subtotal,
        tax_amount=sale_data.tax_amount,
        discount_amount=sale_data.discount_amount,
        total_amount=sale_data.total_amount,
        payment_status="PENDING",
        payment_mode=sale_data.payment_mode,
        paid_amount=0.0,
        created_by=current_user.id
    )
    
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    
    # Create invoice items and update stock
    for item_data in sale_data.items:
        invoice_item = InvoiceItem(
            invoice_id=invoice.id,
            medicine_id=item_data.medicine_id,
            batch_id=item_data.batch_id,
            prescription_id=item_data.prescription_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            discount=item_data.discount,
            total=item_data.total
        )
        db.add(invoice_item)
        
        # Update stock
        batch = db.query(MedicineBatch).filter(MedicineBatch.id == item_data.batch_id).first()
        batch.current_stock -= item_data.quantity
        
        # Create stock movement
        stock_movement = StockMovement(
            batch_id=item_data.batch_id,
            movement_type="OUT",
            quantity=item_data.quantity,
            reference_type="POS_SALE",
            reference_id=invoice.id,
            reason=f"POS sale - Invoice {invoice.invoice_number}",
            created_by=current_user.id
        )
        db.add(stock_movement)
    
    # Process payments
    if sale_data.payments:
        total_paid = 0
        for payment_data in sale_data.payments:
            payment = Payment(
                invoice_id=invoice.id,
                amount=payment_data.amount,
                payment_mode=payment_data.payment_mode,
                transaction_id=payment_data.transaction_id,
                notes=payment_data.notes,
                created_by=current_user.id
            )
            db.add(payment)
            total_paid += payment_data.amount
        
        invoice.paid_amount = total_paid
        if total_paid >= invoice.total_amount:
            invoice.payment_status = "PAID"
        elif total_paid > 0:
            invoice.payment_status = "PARTIAL"
    
    db.commit()
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="POS_SALE",
        resource_type="INVOICE",
        resource_id=invoice.id,
        new_values=f"POS sale processed: Invoice {invoice.invoice_number}"
    )
    db.add(audit_log)
    db.commit()
    
    # Get invoice with items
    items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.id).all()
    
    return InvoiceWithItems(**invoice.__dict__, items=items)

@router.get("/receipt/{invoice_id}", response_model=POSReceipt)
async def generate_receipt(
    invoice_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate receipt for an invoice"""
    
    # Get invoice with patient and items
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    patient = db.query(Patient).filter(Patient.id == invoice.patient_id).first()
    
    # Get invoice items with medicine and batch details
    items_data = db.query(InvoiceItem, Medicine, MedicineBatch).join(
        Medicine, InvoiceItem.medicine_id == Medicine.id
    ).join(
        MedicineBatch, InvoiceItem.batch_id == MedicineBatch.id
    ).filter(
        InvoiceItem.invoice_id == invoice_id
    ).all()
    
    cart_items = []
    for item, medicine, batch in items_data:
        cart_item = POSCartItem(
            medicine_id=item.medicine_id,
            medicine_name=medicine.name,
            batch_id=item.batch_id,
            batch_number=batch.batch_number,
            quantity=item.quantity,
            unit_price=item.unit_price,
            discount=item.discount,
            total=item.total,
            requires_prescription=medicine.requires_prescription,
            prescription_id=item.prescription_id,
            expiry_date=batch.expiry_date,
            stock_available=batch.current_stock
        )
        cart_items.append(cart_item)
    
    # Get payments
    payments_data = db.query(Payment).filter(Payment.invoice_id == invoice_id).all()
    payments = [POSPayment(**payment.__dict__) for payment in payments_data]
    
    # Calculate change
    change = sum(p.amount for p in payments) - invoice.total_amount
    
    # Build receipt
    receipt = POSReceipt(
        receipt_number=generate_receipt_number(),
        invoice_number=invoice.invoice_number,
        date_time=invoice.created_at,
        store_info={
            "name": POS_CONFIG["store_name"],
            "address": POS_CONFIG["store_address"],
            "phone": POS_CONFIG["store_phone"],
            "email": POS_CONFIG["store_email"]
        },
        customer_info={
            "name": f"{patient.first_name} {patient.last_name}" if patient else "Walk-in Customer",
            "phone": patient.phone if patient else "N/A",
            "email": patient.email if patient else "N/A"
        },
        items=cart_items,
        subtotal=invoice.subtotal,
        tax_amount=invoice.tax_amount,
        discount_amount=invoice.discount_amount,
        total_amount=invoice.total_amount,
        payments=payments,
        change=change,
        cashier_name=current_user.full_name
    )
    
    return receipt

@router.get("/config", response_model=POSConfig)
async def get_pos_config(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get POS configuration"""
    # Get organization settings to fetch currency
    org_settings = db.query(OrganizationSettings).first()
    
    # Get POS settings to fetch receipt currency
    pos_settings = db.query(POSSettings).first()
    
    # Create a copy of the POS config
    config = POS_CONFIG.copy()
    
    # Update currency symbol from organization settings
    if org_settings and org_settings.currency:
        # Map currency codes to symbols
        currency_symbols = {
            "USD": "$",
            "EUR": "€",
            "GBP": "£",
            "JPY": "¥",
            "INR": "₹",
            "CNY": "¥",
            "CAD": "$",
            "AUD": "$"
        }
        config["currency_symbol"] = currency_symbols.get(org_settings.currency, "$")
    
    # If POS settings exist and have receipt currency, use that
    if pos_settings and pos_settings.receipt:
        try:
            receipt_config = json.loads(pos_settings.receipt)
            if "currency" in receipt_config:
                currency_symbols = {
                    "USD": "$",
                    "EUR": "€",
                    "GBP": "£",
                    "JPY": "¥",
                    "INR": "₹",
                    "CNY": "¥",
                    "CAD": "$",
                    "AUD": "$"
                }
                config["currency_symbol"] = currency_symbols.get(receipt_config["currency"], "$")
        except (json.JSONDecodeError, TypeError):
            pass  # Use default if JSON parsing fails
    
    return POSConfig(**config)

@router.get("/summary/daily", response_model=POSDailySummary)
async def get_daily_summary(
    target_date_param: Optional[date] = Query(None, description="Date for summary (default: today)"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get daily sales summary for POS"""
    try:
        target_date = target_date_param or date.today()
        start_datetime = datetime.combine(target_date, datetime.min.time())
        end_datetime = datetime.combine(target_date, datetime.max.time())
        
        # Get sales data
        sales_data = db.query(
            func.sum(Invoice.total_amount).label('total_sales'),
            func.count(Invoice.id).label('total_invoices'),
            func.sum(case((Invoice.payment_mode == 'CASH', Invoice.total_amount), else_=0)).label('cash_sales'),
            func.sum(case((Invoice.payment_mode == 'CARD', Invoice.total_amount), else_=0)).label('card_sales'),
            func.sum(case((Invoice.payment_mode == 'INSURANCE', Invoice.total_amount), else_=0)).label('insurance_sales'),
            func.sum(case((Invoice.payment_mode == 'ONLINE', Invoice.total_amount), else_=0)).label('online_sales')
        ).filter(
            and_(
                Invoice.created_at >= start_datetime,
                Invoice.created_at <= end_datetime,
                Invoice.payment_status == 'PAID'
            )
        ).first()
        
        # Get top medicines
        top_medicines = db.query(
            Medicine.name,
            func.sum(InvoiceItem.quantity).label('total_quantity'),
            func.sum(InvoiceItem.total).label('total_revenue')
        ).join(
            InvoiceItem, Medicine.id == InvoiceItem.medicine_id
        ).join(
            Invoice, InvoiceItem.invoice_id == Invoice.id
        ).filter(
            and_(
                Invoice.created_at >= start_datetime,
                Invoice.created_at <= end_datetime,
                Invoice.payment_status == 'PAID'
            )
        ).group_by(
            Medicine.name
        ).order_by(
            desc(func.sum(InvoiceItem.quantity))
        ).limit(10).all()
        
        # Build summary
        summary = POSDailySummary(
            date=target_date,
            total_sales=float(sales_data.total_sales or 0),
            total_invoices=int(sales_data.total_invoices or 0),
            cash_sales=float(sales_data.cash_sales or 0),
            card_sales=float(sales_data.card_sales or 0),
            insurance_sales=float(sales_data.insurance_sales or 0),
            online_sales=float(sales_data.online_sales or 0),
            top_medicines=[
                {
                    "name": med[0],
                    "quantity": int(med[1]),
                    "revenue": float(med[2])
                }
                for med in top_medicines
            ],
            payment_breakdown={
                "cash": float(sales_data.cash_sales or 0),
                "card": float(sales_data.card_sales or 0),
                "insurance": float(sales_data.insurance_sales or 0),
                "online": float(sales_data.online_sales or 0)
            }
        )
        
        return summary
    except Exception as e:
        # Log the error
        print(f"Error in get_daily_summary: {str(e)}")
        # Return a default response instead of 500 error
        return POSDailySummary(
            date=target_date_param or date.today(),
            total_sales=0,
            total_invoices=0,
            cash_sales=0,
            card_sales=0,
            insurance_sales=0,
            online_sales=0,
            top_medicines=[],
            payment_breakdown={
                "cash": 0,
                "card": 0,
                "insurance": 0,
                "online": 0
            }
        )

@router.post("/hold", response_model=POSHoldBill)
async def hold_bill(
    hold_data: Dict[str, Any],
    current_user: User = Depends(require_cashier),
    db: Session = Depends(get_db)
):
    """Hold a bill for later processing"""
    
    cart_data = hold_data.get('cart_data', {})
    customer_info = hold_data.get('customer_info')
    hold_reason = hold_data.get('hold_reason')
    
    if not cart_data.get('items'):
        raise HTTPException(status_code=400, detail="Cannot hold an empty cart")
    
    # Create hold bill
    hold_bill = HoldBill(
        hold_number=generate_hold_number(),
        cart_data=json.dumps(cart_data),
        customer_info=json.dumps(customer_info) if customer_info else None,
        held_by=current_user.id,
        hold_reason=hold_reason
    )
    
    db.add(hold_bill)
    db.commit()
    db.refresh(hold_bill)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="HOLD_BILL",
        resource_type="HOLD_BILL",
        resource_id=hold_bill.id,
        new_values=f"Held bill {hold_bill.hold_number} with {len(cart_data.get('items', []))} items"
    )
    db.add(audit_log)
    db.commit()
    
    return POSHoldBill(
        id=hold_bill.id,
        hold_number=hold_bill.hold_number,
        cart_data=json.loads(hold_bill.cart_data),
        customer_info=json.loads(hold_bill.customer_info) if hold_bill.customer_info else None,
        held_by=hold_bill.held_by,
        held_at=hold_bill.held_at,
        hold_reason=hold_bill.hold_reason,
        is_active=hold_bill.is_active
    )

@router.get("/hold/list", response_model=List[POSHoldBill])
async def list_held_bills(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all active held bills"""
    
    held_bills = db.query(HoldBill, User).join(
        User, HoldBill.held_by == User.id
    ).filter(
        HoldBill.is_active == True
    ).order_by(
        HoldBill.held_at.desc()
    ).all()
    
    result = []
    for hold_bill, user in held_bills:
        result.append(POSHoldBill(
            id=hold_bill.id,
            hold_number=hold_bill.hold_number,
            cart_data=json.loads(hold_bill.cart_data),
            customer_info=json.loads(hold_bill.customer_info) if hold_bill.customer_info else None,
            held_by=hold_bill.held_by,
            held_at=hold_bill.held_at,
            hold_reason=hold_bill.hold_reason,
            is_active=hold_bill.is_active
        ))
    
    return result

@router.post("/hold/{hold_id}/release")
async def release_held_bill(
    hold_id: int,
    current_user: User = Depends(require_cashier),
    db: Session = Depends(get_db)
):
    """Release a held bill and return cart data"""
    
    hold_bill = db.query(HoldBill).filter(
        and_(
            HoldBill.id == hold_id,
            HoldBill.is_active == True
        )
    ).first()
    
    if not hold_bill:
        raise HTTPException(status_code=404, detail="Held bill not found")
    
    # Mark as released
    hold_bill.is_active = False
    hold_bill.released_at = datetime.utcnow()
    hold_bill.released_by = current_user.id
    
    db.commit()
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="RELEASE_HOLD_BILL",
        resource_type="HOLD_BILL",
        resource_id=hold_bill.id,
        new_values=f"Released held bill {hold_bill.hold_number}"
    )
    db.add(audit_log)
    db.commit()
    
    # Return cart data for restoration
    return {
        "cart_data": json.loads(hold_bill.cart_data),
        "customer_info": json.loads(hold_bill.customer_info) if hold_bill.customer_info else None
    }

@router.delete("/hold/{hold_id}")
async def delete_held_bill(
    hold_id: int,
    current_user: User = Depends(require_cashier),
    db: Session = Depends(get_db)
):
    """Delete a held bill"""
    
    hold_bill = db.query(HoldBill).filter(
        and_(
            HoldBill.id == hold_id,
            HoldBill.is_active == True
        )
    ).first()
    
    if not hold_bill:
        raise HTTPException(status_code=404, detail="Held bill not found")
    
    # Only allow deletion by the user who held it or admin
    if hold_bill.held_by != current_user.id and current_user.role.value != 'ADMIN':
        raise HTTPException(status_code=403, detail="Not authorized to delete this held bill")
    
    # Mark as inactive (soft delete)
    hold_bill.is_active = False
    
    db.commit()
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="DELETE_HOLD_BILL",
        resource_type="HOLD_BILL",
        resource_id=hold_bill.id,
        new_values=f"Deleted held bill {hold_bill.hold_number}"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Held bill deleted successfully"}

@router.post("/refund")
async def process_refund(
    refund_data: Dict[str, Any],
    current_user: User = Depends(require_cashier),
    db: Session = Depends(get_db)
):
    """Process a refund for returned items"""
    
    items = refund_data.get('items', [])
    reason = refund_data.get('reason', '')
    refund_amount = refund_data.get('refundAmount', 0)
    
    if not items:
        raise HTTPException(status_code=400, detail="No items provided for refund")
    
    if not reason:
        raise HTTPException(status_code=400, detail="Refund reason is required")
    
    # Create refund record
    refund = Refund(
        refund_number=f"REF{datetime.now().strftime('%Y%m%d%H%M%S')}",
        invoice_id=0,  # This would need to be passed in the refund_data
        amount=refund_amount,
        reason=reason,
        created_by=current_user.id
    )
    
    db.add(refund)
    db.commit()
    db.refresh(refund)
    
    # Process each item refund
    for item in items:
        # Get the original invoice item
        invoice_item = db.query(InvoiceItem).filter(
            InvoiceItem.id == item.get('invoice_item_id')
        ).first()
        
        if not invoice_item:
            continue
        
        # Restock the item
        batch = db.query(MedicineBatch).filter(
            MedicineBatch.id == invoice_item.batch_id
        ).first()
        
        if batch:
            batch.current_stock += item.get('refundQuantity', 1)
            
            # Create stock movement for refund
            stock_movement = StockMovement(
                batch_id=batch.id,
                movement_type="IN",
                quantity=item.get('refundQuantity', 1),
                reference_type="REFUND",
                reference_id=refund.id,
                reason=f"Refund: {reason}",
                created_by=current_user.id
            )
            db.add(stock_movement)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="PROCESS_REFUND",
        resource_type="REFUND",
        resource_id=refund.id,
        new_values=f"Processed refund {refund.refund_number} for {refund_amount}"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Refund processed successfully", "refund_id": refund.id}

@router.post("/send-digital-receipt")
async def send_digital_receipt(
    receipt_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send digital receipt via SMS, WhatsApp, or Email"""
    
    method = receipt_data.get('method')
    phone = receipt_data.get('phone')
    email = receipt_data.get('email')
    receipt_id = receipt_data.get('receiptId')
    
    if not method or not receipt_id:
        raise HTTPException(status_code=400, detail="Method and receipt ID are required")
    
    if method in ['sms', 'whatsapp'] and not phone:
        raise HTTPException(status_code=400, detail="Phone number is required for SMS/WhatsApp")
    
    if method == 'email' and not email:
        raise HTTPException(status_code=400, detail="Email is required for email delivery")
    
    # Get receipt details
    receipt = db.query(Invoice).filter(Invoice.id == receipt_id).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    # In a real implementation, this would integrate with SMS/WhatsApp/Email services
    # For now, we'll just log the action
    background_tasks.add_task(
        log_digital_receipt,
        method=method,
        recipient=phone or email,
        receipt_id=receipt_id,
        user_id=current_user.id
    )
    
    return {"message": f"Receipt sent via {method.upper()}"}

def log_digital_receipt(method: str, recipient: str, receipt_id: int, user_id: int):
    """Background task to log digital receipt sending"""
    # This would integrate with actual SMS/WhatsApp/Email services
    print(f"Digital receipt {receipt_id} sent via {method} to {recipient}")

@router.post("/print-barcodes")
async def print_barcodes(
    print_data: Dict[str, Any],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Print barcode labels for medicines"""
    
    medicine_id = print_data.get('medicineId')
    quantity = print_data.get('quantity', 1)
    
    if not medicine_id:
        raise HTTPException(status_code=400, detail="Medicine ID is required")
    
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    if not medicine.barcode:
        raise HTTPException(status_code=400, detail="Medicine has no barcode")
    
    # In a real implementation, this would send to a label printer
    # For now, we'll just log the action
    print(f"Printing {quantity} barcode labels for medicine {medicine.name} (Barcode: {medicine.barcode})")
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="PRINT_BARCODES",
        resource_type="MEDICINE",
        resource_id=medicine_id,
        new_values=f"Printed {quantity} barcode labels for {medicine.name}"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": f"{quantity} barcode labels sent to printer"}

@router.post("/sync-transaction")
async def sync_transaction(
    transaction_data: Dict[str, Any],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Sync offline transactions when back online"""
    
    # Process the offline transaction
    try:
        # Convert to POSInvoiceCreate and process
        sale_data = POSInvoiceCreate(**transaction_data)
        result = await process_sale(sale_data, current_user, db)
        return {"message": "Transaction synced successfully", "invoice_id": result.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to sync transaction: {str(e)}")

@router.post("/auth/staff-login")
async def staff_login(
    login_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Staff login with PIN for POS access"""
    
    pin = login_data.get('pin')
    
    if not pin:
        raise HTTPException(status_code=400, detail="PIN is required")
    
    # Find user by PIN (in a real implementation, PIN would be hashed)
    user = db.query(User).filter(
        and_(
            User.pin == pin,
            User.is_active == True,
            User.role.in_(['CASHIER', 'PHARMACIST', 'ADMIN'])
        )
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid PIN")
    
    # Create audit log
    audit_log = AuditLog(
        user_id=user.id,
        action="STAFF_LOGIN_POS",
        resource_type="USER",
        resource_id=user.id,
        new_values=f"Staff {user.full_name} logged into POS"
    )
    db.add(audit_log)
    db.commit()
    
    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role.value
    }

@router.post("/end-shift")
async def end_shift(
    shift_data: Dict[str, Any],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """End shift with cash reconciliation"""
    
    expected_cash = shift_data.get('expectedCash', 0)
    actual_cash = shift_data.get('actualCash', 0)
    notes = shift_data.get('notes', '')
    
    # Calculate difference
    difference = expected_cash - actual_cash
    
    # Create shift record (in a real implementation, this would be a proper Shift model)
    shift_record = {
        "staff_id": current_user.id,
        "end_time": datetime.utcnow(),
        "expected_cash": expected_cash,
        "actual_cash": actual_cash,
        "difference": difference,
        "notes": notes
    }
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="END_SHIFT",
        resource_type="USER",
        resource_id=current_user.id,
        new_values=f"Shift ended. Expected: ${expected_cash}, Actual: ${actual_cash}, Difference: ${difference}"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Shift ended successfully", "shift_record": shift_record}