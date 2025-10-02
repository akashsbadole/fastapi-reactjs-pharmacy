from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import date, datetime

class SalesReport(BaseModel):
    period: str
    total_sales: float
    total_invoices: int
    average_invoice_value: float
    payment_breakdown: Dict[str, float]
    daily_sales: List[Dict[str, Any]]

class InventoryReport(BaseModel):
    total_medicines: int
    total_batches: int
    low_stock_items: int
    expiring_items: int
    total_inventory_value: float
    category_breakdown: Dict[str, int]
    low_stock_details: List[Dict[str, Any]]
    expiring_details: List[Dict[str, Any]]

class PrescriptionReport(BaseModel):
    total_prescriptions: int
    filled_prescriptions: int
    pending_prescriptions: int
    cancelled_prescriptions: int
    average_items_per_prescription: float
    top_medicines: List[Dict[str, Any]]
    daily_prescriptions: List[Dict[str, Any]]

class PatientReport(BaseModel):
    total_patients: int
    new_patients_this_month: int
    patients_with_prescriptions: int
    age_distribution: Dict[str, int]
    gender_distribution: Dict[str, int]
    top_patients: List[Dict[str, Any]]

class FinancialReport(BaseModel):
    period: str
    total_revenue: float
    total_cost: float
    gross_profit: float
    profit_margin: float
    revenue_by_payment_mode: Dict[str, float]
    monthly_breakdown: List[Dict[str, Any]]

class SupplierReport(BaseModel):
    total_suppliers: int
    active_suppliers: int
    total_purchases: float
    top_suppliers: List[Dict[str, Any]]
    supplier_performance: List[Dict[str, Any]]

class DashboardStats(BaseModel):
    total_sales_today: float
    total_orders_today: int
    low_stock_alerts: int
    expiring_soon_alerts: int
    pending_prescriptions: int
    total_patients: int
    total_medicines: int
    recent_activities: List[Dict[str, Any]]

class ReportRequest(BaseModel):
    report_type: str
    period: str
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    filters: Optional[Dict[str, Any]] = None

class ReportResponse(BaseModel):
    report_type: str
    period: str
    generated_at: datetime
    data: Dict[str, Any]

class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    username: str
    action: str
    resource_type: str
    resource_id: Optional[int] = None
    old_values: Optional[str] = None
    new_values: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True