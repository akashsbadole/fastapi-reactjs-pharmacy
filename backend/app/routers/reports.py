from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, case
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta

from ..database import get_db
from ..models import (
    User, Patient, Medicine, MedicineBatch, Supplier, Prescription,
    PrescriptionItem, Invoice, InvoiceItem, Payment, StockMovement, AuditLog
)
from ..schemas.reports import (
    SalesReport, InventoryReport, PrescriptionReport, PatientReport,
    FinancialReport, SupplierReport, DashboardStats, ReportRequest,
    ReportResponse, AuditLogResponse
)
from ..utils.auth import get_current_active_user, require_admin

router = APIRouter()

def calculate_age(date_of_birth: date) -> int:
    today = date.today()
    age = today.year - date_of_birth.year
    if today.month < date_of_birth.month or (today.month == date_of_birth.month and today.day < date_of_birth.day):
        age -= 1
    return age

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    # Total sales today
    sales_today = db.query(func.sum(Invoice.total_amount)).filter(
        and_(
            Invoice.created_at >= start_of_day,
            Invoice.created_at <= end_of_day,
            Invoice.payment_status == 'PAID'
        )
    ).scalar() or 0.0
    
    # Total orders today
    orders_today = db.query(func.count(Invoice.id)).filter(
        and_(
            Invoice.created_at >= start_of_day,
            Invoice.created_at <= end_of_day
        )
    ).scalar() or 0
    
    # Low stock alerts
    low_stock_count = db.query(func.count(MedicineBatch.id)).filter(
        and_(
            MedicineBatch.current_stock <= MedicineBatch.low_stock_threshold,
            MedicineBatch.current_stock > 0,
            MedicineBatch.is_active == True
        )
    ).scalar() or 0
    
    # Expiring soon alerts (within 30 days)
    thirty_days_from_now = today + timedelta(days=30)
    expiring_count = db.query(func.count(MedicineBatch.id)).filter(
        and_(
            MedicineBatch.expiry_date <= thirty_days_from_now,
            MedicineBatch.current_stock > 0,
            MedicineBatch.is_active == True
        )
    ).scalar() or 0
    
    # Pending prescriptions
    pending_prescriptions = db.query(func.count(Prescription.id)).filter(
        Prescription.status == 'PENDING'
    ).scalar() or 0
    
    # Total patients
    total_patients = db.query(func.count(Patient.id)).scalar() or 0
    
    # Total medicines
    total_medicines = db.query(func.count(Medicine.id)).filter(
        Medicine.is_active == True
    ).scalar() or 0
    
    # Recent activities (last 10 audit logs)
    recent_activities = db.query(AuditLog, User).join(
        User, AuditLog.user_id == User.id
    ).order_by(desc(AuditLog.created_at)).limit(10).all()
    
    activities = []
    for log, user in recent_activities:
        activities.append({
            "id": log.id,
            "username": user.username,
            "action": log.action,
            "resource_type": log.resource_type,
            "new_values": log.new_values,
            "created_at": log.created_at
        })
    
    return DashboardStats(
        total_sales_today=sales_today,
        total_orders_today=orders_today,
        low_stock_alerts=low_stock_count,
        expiring_soon_alerts=expiring_count,
        pending_prescriptions=pending_prescriptions,
        total_patients=total_patients,
        total_medicines=total_medicines,
        recent_activities=activities
    )

@router.get("/sales", response_model=SalesReport)
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
        daily_sales.append({
            "date": data.date,
            "total_sales": data.total_sales or 0,
            "total_invoices": data.total_invoices or 0,
            "cash_sales": data.cash_sales or 0,
            "card_sales": data.card_sales or 0,
            "insurance_sales": data.insurance_sales or 0
        })
    
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

@router.get("/inventory", response_model=InventoryReport)
async def get_inventory_report(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Total medicines and batches
    total_medicines = db.query(func.count(Medicine.id)).filter(
        Medicine.is_active == True
    ).scalar() or 0
    
    total_batches = db.query(func.count(MedicineBatch.id)).filter(
        MedicineBatch.is_active == True
    ).scalar() or 0
    
    # Low stock items
    low_stock_items = db.query(func.count(MedicineBatch.id)).filter(
        and_(
            MedicineBatch.current_stock <= MedicineBatch.low_stock_threshold,
            MedicineBatch.current_stock > 0,
            MedicineBatch.is_active == True
        )
    ).scalar() or 0
    
    # Expiring items (within 30 days)
    thirty_days_from_now = date.today() + timedelta(days=30)
    expiring_items = db.query(func.count(MedicineBatch.id)).filter(
        and_(
            MedicineBatch.expiry_date <= thirty_days_from_now,
            MedicineBatch.current_stock > 0,
            MedicineBatch.is_active == True
        )
    ).scalar() or 0
    
    # Total inventory value
    total_inventory_value = db.query(func.sum(
        MedicineBatch.current_stock * MedicineBatch.selling_price
    )).filter(
        and_(
            MedicineBatch.current_stock > 0,
            MedicineBatch.is_active == True
        )
    ).scalar() or 0
    
    # Category breakdown
    category_breakdown = db.query(
        Medicine.category,
        func.count(Medicine.id)
    ).filter(
        Medicine.is_active == True
    ).group_by(Medicine.category).all()
    
    category_dict = {cat or "Uncategorized": count for cat, count in category_breakdown}
    
    # Low stock details
    low_stock_details = db.query(
        Medicine.name,
        MedicineBatch.batch_number,
        MedicineBatch.current_stock,
        MedicineBatch.low_stock_threshold,
        MedicineBatch.expiry_date
    ).join(
        Medicine, MedicineBatch.medicine_id == Medicine.id
    ).filter(
        and_(
            MedicineBatch.current_stock <= MedicineBatch.low_stock_threshold,
            MedicineBatch.current_stock > 0,
            MedicineBatch.is_active == True
        )
    ).limit(10).all()
    
    low_stock_list = [
        {
            "medicine_name": name,
            "batch_number": batch_number,
            "current_stock": current_stock,
            "low_stock_threshold": low_stock_threshold,
            "expiry_date": expiry_date
        }
        for name, batch_number, current_stock, low_stock_threshold, expiry_date in low_stock_details
    ]
    
    # Expiring details
    expiring_details = db.query(
        Medicine.name,
        MedicineBatch.batch_number,
        MedicineBatch.current_stock,
        MedicineBatch.expiry_date
    ).join(
        Medicine, MedicineBatch.medicine_id == Medicine.id
    ).filter(
        and_(
            MedicineBatch.expiry_date <= thirty_days_from_now,
            MedicineBatch.current_stock > 0,
            MedicineBatch.is_active == True
        )
    ).order_by(MedicineBatch.expiry_date).limit(10).all()
    
    expiring_list = [
        {
            "medicine_name": name,
            "batch_number": batch_number,
            "current_stock": current_stock,
            "expiry_date": expiry_date,
            "days_until_expiry": (expiry_date - date.today()).days
        }
        for name, batch_number, current_stock, expiry_date in expiring_details
    ]
    
    return InventoryReport(
        total_medicines=total_medicines,
        total_batches=total_batches,
        low_stock_items=low_stock_items,
        expiring_items=expiring_items,
        total_inventory_value=total_inventory_value,
        category_breakdown=category_dict,
        low_stock_details=low_stock_list,
        expiring_details=expiring_list
    )

@router.get("/prescriptions", response_model=PrescriptionReport)
async def get_prescription_report(
    period: str = Query("month", description="Period: day, week, month, year"),
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
        start_date = end_date - timedelta(days=30)
    
    # Prescription counts by status
    total_prescriptions = db.query(func.count(Prescription.id)).filter(
        Prescription.created_at >= start_date
    ).scalar() or 0
    
    filled_prescriptions = db.query(func.count(Prescription.id)).filter(
        and_(
            Prescription.created_at >= start_date,
            Prescription.status == 'FILLED'
        )
    ).scalar() or 0
    
    pending_prescriptions = db.query(func.count(Prescription.id)).filter(
        and_(
            Prescription.created_at >= start_date,
            Prescription.status == 'PENDING'
        )
    ).scalar() or 0
    
    cancelled_prescriptions = db.query(func.count(Prescription.id)).filter(
        and_(
            Prescription.created_at >= start_date,
            Prescription.status == 'CANCELLED'
        )
    ).scalar() or 0
    
    # Average items per prescription
    avg_items_result = db.query(
        func.avg(PrescriptionItem.subquery.c.item_count)
    ).join(
        Prescription, Prescription.id == PrescriptionItem.subquery.c.prescription_id
    ).filter(
        Prescription.created_at >= start_date
    ).scalar()
    
    average_items_per_prescription = avg_items_result or 0
    
    # Top medicines (most prescribed)
    top_medicines = db.query(
        Medicine.name,
        func.sum(PrescriptionItem.quantity).label('total_quantity'),
        func.count(PrescriptionItem.id).label('prescription_count')
    ).join(
        PrescriptionItem, Medicine.id == PrescriptionItem.medicine_id
    ).join(
        Prescription, PrescriptionItem.prescription_id == Prescription.id
    ).filter(
        Prescription.created_at >= start_date
    ).group_by(Medicine.id, Medicine.name).order_by(
        desc(func.sum(PrescriptionItem.quantity))
    ).limit(10).all()
    
    top_medicines_list = [
        {
            "medicine_name": name,
            "total_quantity": total_quantity,
            "prescription_count": prescription_count
        }
        for name, total_quantity, prescription_count in top_medicines
    ]
    
    # Daily prescriptions
    daily_prescriptions = db.query(
        func.date(Prescription.created_at).label('date'),
        func.count(Prescription.id).label('count'),
        func.sum(func.case([(Prescription.status == 'FILLED', 1)], else_=0)).label('filled'),
        func.sum(func.case([(Prescription.status == 'PENDING', 1)], else_=0)).label('pending')
    ).filter(
        Prescription.created_at >= start_date
    ).group_by(func.date(Prescription.created_at)).all()
    
    daily_list = [
        {
            "date": data.date,
            "count": data.count,
            "filled": data.filled,
            "pending": data.pending
        }
        for data in daily_prescriptions
    ]
    
    return PrescriptionReport(
        total_prescriptions=total_prescriptions,
        filled_prescriptions=filled_prescriptions,
        pending_prescriptions=pending_prescriptions,
        cancelled_prescriptions=cancelled_prescriptions,
        average_items_per_prescription=average_items_per_prescription,
        top_medicines=top_medicines_list,
        daily_prescriptions=daily_list
    )

@router.get("/patients", response_model=PatientReport)
async def get_patient_report(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Total patients
    total_patients = db.query(func.count(Patient.id)).scalar() or 0
    
    # New patients this month
    start_of_month = date.today().replace(day=1)
    new_patients_this_month = db.query(func.count(Patient.id)).filter(
        Patient.created_at >= start_of_month
    ).scalar() or 0
    
    # Patients with prescriptions
    patients_with_prescriptions = db.query(func.count(func.distinct(Prescription.patient_id))).scalar() or 0
    
    # Age distribution
    patients = db.query(Patient).all()
    age_groups = {"0-18": 0, "19-35": 0, "36-50": 0, "51-65": 0, "65+": 0}
    
    for patient in patients:
        age = calculate_age(patient.date_of_birth)
        if age <= 18:
            age_groups["0-18"] += 1
        elif age <= 35:
            age_groups["19-35"] += 1
        elif age <= 50:
            age_groups["36-50"] += 1
        elif age <= 65:
            age_groups["51-65"] += 1
        else:
            age_groups["65+"] += 1
    
    # Gender distribution
    gender_distribution = db.query(
        Patient.gender,
        func.count(Patient.id)
    ).group_by(Patient.gender).all()
    
    gender_dict = {gender or "Not specified": count for gender, count in gender_distribution}
    
    # Top patients (by prescription count)
    top_patients = db.query(
        Patient.first_name,
        Patient.last_name,
        func.count(Prescription.id).label('prescription_count')
    ).join(
        Prescription, Patient.id == Prescription.patient_id
    ).group_by(Patient.id).order_by(
        desc(func.count(Prescription.id))
    ).limit(10).all()
    
    top_patients_list = [
        {
            "patient_name": f"{first_name} {last_name}",
            "prescription_count": prescription_count
        }
        for first_name, last_name, prescription_count in top_patients
    ]
    
    return PatientReport(
        total_patients=total_patients,
        new_patients_this_month=new_patients_this_month,
        patients_with_prescriptions=patients_with_prescriptions,
        age_distribution=age_groups,
        gender_distribution=gender_dict,
        top_patients=top_patients_list
    )

@router.get("/financial", response_model=FinancialReport)
async def get_financial_report(
    period: str = Query("month", description="Period: day, week, month, year"),
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
        start_date = end_date - timedelta(days=30)
    
    # Total revenue (sales)
    total_revenue = db.query(func.sum(Invoice.total_amount)).filter(
        and_(
            Invoice.created_at >= start_date,
            Invoice.created_at <= end_date,
            Invoice.payment_status == 'PAID'
        )
    ).scalar() or 0
    
    # Total cost (cost of goods sold)
    total_cost = db.query(
        func.sum(InvoiceItem.quantity * MedicineBatch.cost_price)
    ).join(
        MedicineBatch, InvoiceItem.batch_id == MedicineBatch.id
    ).join(
        Invoice, InvoiceItem.invoice_id == Invoice.id
    ).filter(
        and_(
            Invoice.created_at >= start_date,
            Invoice.created_at <= end_date,
            Invoice.payment_status == 'PAID'
        )
    ).scalar() or 0
    
    # Calculate profit
    gross_profit = total_revenue - total_cost
    profit_margin = (gross_profit / total_revenue * 100) if total_revenue > 0 else 0
    
    # Revenue by payment mode
    revenue_by_payment_mode = db.query(
        Invoice.payment_mode,
        func.sum(Invoice.total_amount)
    ).filter(
        and_(
            Invoice.created_at >= start_date,
            Invoice.created_at <= end_date,
            Invoice.payment_status == 'PAID'
        )
    ).group_by(Invoice.payment_mode).all()
    
    payment_dict = {mode or "unknown": revenue for mode, revenue in revenue_by_payment_mode}
    
    # Monthly breakdown (for longer periods)
    monthly_breakdown = []
    if period in ["month", "year"]:
        monthly_data = db.query(
            func.date_trunc('month', Invoice.created_at).label('month'),
            func.sum(Invoice.total_amount).label('revenue'),
            func.sum(InvoiceItem.quantity * MedicineBatch.cost_price).label('cost')
        ).join(
            InvoiceItem, Invoice.id == InvoiceItem.invoice_id
        ).join(
            MedicineBatch, InvoiceItem.batch_id == MedicineBatch.id
        ).filter(
            and_(
                Invoice.created_at >= start_date,
                Invoice.created_at <= end_date,
                Invoice.payment_status == 'PAID'
            )
        ).group_by(func.date_trunc('month', Invoice.created_at)).all()
        
        for data in monthly_data:
            profit = (data.revenue or 0) - (data.cost or 0)
            monthly_breakdown.append({
                "month": data.month,
                "revenue": data.revenue or 0,
                "cost": data.cost or 0,
                "profit": profit
            })
    
    return FinancialReport(
        period=period,
        total_revenue=total_revenue,
        total_cost=total_cost,
        gross_profit=gross_profit,
        profit_margin=profit_margin,
        revenue_by_payment_mode=payment_dict,
        monthly_breakdown=monthly_breakdown
    )

@router.get("/suppliers", response_model=SupplierReport)
async def get_supplier_report(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Total suppliers
    total_suppliers = db.query(func.count(Supplier.id)).scalar() or 0
    
    # Active suppliers
    active_suppliers = db.query(func.count(Supplier.id)).filter(
        Supplier.is_active == True
    ).scalar() or 0
    
    # Total purchases (sum of all batch costs)
    total_purchases = db.query(func.sum(MedicineBatch.quantity * MedicineBatch.cost_price)).filter(
        MedicineBatch.is_active == True
    ).scalar() or 0
    
    # Top suppliers (by purchase value)
    top_suppliers = db.query(
        Supplier.name,
        func.sum(MedicineBatch.quantity * MedicineBatch.cost_price).label('total_purchase'),
        func.count(MedicineBatch.id).label('batch_count')
    ).join(
        MedicineBatch, Supplier.id == MedicineBatch.supplier_id
    ).filter(
        MedicineBatch.is_active == True
    ).group_by(Supplier.id).order_by(
        desc(func.sum(MedicineBatch.quantity * MedicineBatch.cost_price))
    ).limit(10).all()
    
    top_suppliers_list = [
        {
            "supplier_name": name,
            "total_purchase": total_purchase,
            "batch_count": batch_count
        }
        for name, total_purchase, batch_count in top_suppliers
    ]
    
    # Supplier performance (delivery quality, expiry rates, etc.)
    supplier_performance = db.query(
        Supplier.name,
        func.count(MedicineBatch.id).label('total_batches'),
        func.sum(MedicineBatch.quantity).label('total_quantity'),
        func.avg(MedicineBatch.current_stock).label('avg_stock'),
        func.min(MedicineBatch.expiry_date).label('earliest_expiry')
    ).join(
        MedicineBatch, Supplier.id == MedicineBatch.supplier_id
    ).filter(
        MedicineBatch.is_active == True
    ).group_by(Supplier.id).limit(10).all()
    
    performance_list = [
        {
            "supplier_name": name,
            "total_batches": total_batches,
            "total_quantity": total_quantity,
            "avg_stock": avg_stock,
            "earliest_expiry": earliest_expiry
        }
        for name, total_batches, total_quantity, avg_stock, earliest_expiry in supplier_performance
    ]
    
    return SupplierReport(
        total_suppliers=total_suppliers,
        active_suppliers=active_suppliers,
        total_purchases=total_purchases,
        top_suppliers=top_suppliers_list,
        supplier_performance=performance_list
    )

@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog, User).join(
        User, AuditLog.user_id == User.id
    )
    
    if action:
        query = query.filter(AuditLog.action == action)
    
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)
    
    if date_from:
        query = query.filter(AuditLog.created_at >= date_from)
    
    if date_to:
        query = query.filter(AuditLog.created_at <= date_to)
    
    logs = query.order_by(desc(AuditLog.created_at)).offset(skip).limit(limit).all()
    
    result = []
    for log, user in logs:
        result.append(AuditLogResponse(
            id=log.id,
            user_id=log.user_id,
            username=user.username,
            action=log.action,
            resource_type=log.resource_type,
            resource_id=log.resource_id,
            old_values=log.old_values,
            new_values=log.new_values,
            ip_address=log.ip_address,
            created_at=log.created_at
        ))
    
    return result

@router.post("/generate", response_model=ReportResponse)
async def generate_custom_report(
    request: ReportRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # This is a placeholder for custom report generation
    # In a real implementation, this would dynamically generate reports based on the request
    
    report_data = {}
    
    if request.report_type == "sales":
        # Generate custom sales report based on filters
        report_data = {"message": "Custom sales report generated", "filters": request.filters}
    elif request.report_type == "inventory":
        # Generate custom inventory report based on filters
        report_data = {"message": "Custom inventory report generated", "filters": request.filters}
    elif request.report_type == "prescriptions":
        # Generate custom prescription report based on filters
        report_data = {"message": "Custom prescription report generated", "filters": request.filters}
    else:
        report_data = {"message": "Unknown report type", "report_type": request.report_type}
    
    return ReportResponse(
        report_type=request.report_type,
        period=request.period,
        generated_at=datetime.utcnow(),
        data=report_data
    )