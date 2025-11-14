from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, ForeignKey, Text, Enum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
from .multi_tenant_models import Tenant
import enum

# Enums
class UserRole(enum.Enum):
    ADMIN = "ADMIN"
    PHARMACIST = "PHARMACIST"
    CASHIER = "CASHIER"
    DOCTOR = "DOCTOR"

class PrescriptionStatus(enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    FILLED = "FILLED"
    CANCELLED = "CANCELLED"

class PaymentStatus(enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    REFUNDED = "REFUNDED"
    PARTIAL = "PARTIAL"

class PaymentMode(enum.Enum):
    CASH = "CASH"
    CARD = "CARD"
    INSURANCE = "INSURANCE"
    ONLINE = "ONLINE"

# User Model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    username = Column(String, index=True, nullable=False)
    email = Column(String, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    pin = Column(String, index=True)  # 4-digit PIN for POS login
    full_name = Column(String, nullable=False)
    phone = Column(String)
    role = Column(Enum(UserRole), default=UserRole.CASHIER)
    is_active = Column(Boolean, default=True)
    profile_image = Column(String)  # URL to profile image
    # Password reset fields
    reset_token = Column(String)  # Password reset token
    reset_token_expires_at = Column(DateTime(timezone=True))  # Password reset token expiration
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    tenant = relationship("Tenant", back_populates="users")
    prescriptions_created = relationship("Prescription", back_populates="created_by_user")
    audit_logs = relationship("AuditLog", back_populates="user")

# Patient Model
class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    patient_id = Column(String, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String)
    phone = Column(String, nullable=False)
    email = Column(String)
    address = Column(Text)
    emergency_contact = Column(String)
    emergency_phone = Column(String)
    allergies = Column(Text)
    medical_history = Column(Text)
    insurance_provider = Column(String)
    insurance_policy_number = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    prescriptions = relationship("Prescription", back_populates="patient")

# Supplier Model
class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    name = Column(String, nullable=False)
    contact_person = Column(String)
    phone = Column(String, nullable=False)
    email = Column(String)
    address = Column(Text)
    license_number = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    batches = relationship("MedicineBatch", back_populates="supplier")

# Medicine Model
class Medicine(Base):
    __tablename__ = "medicines"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    generic_name = Column(String)
    brand = Column(String)
    category = Column(String)
    description = Column(Text)
    dosage_form = Column(String)  # tablet, capsule, syrup, etc.
    strength = Column(String)  # 500mg, 10ml, etc.
    manufacturer = Column(String)
    requires_prescription = Column(Boolean, default=False)
    barcode = Column(String, index=True)
    
    # Additional pharmacy management fields
    sku = Column(String, index=True)  # Stock Keeping Unit
    pack_size = Column(String)  # e.g., "10 tablets", "100ml bottle"
    hsn_code = Column(String)  # HSN/SAC code for taxation
    mrp = Column(Float)  # Maximum Retail Price
    purchase_price = Column(Float)  # Default purchase price
    selling_price = Column(Float)  # Default selling price
    tax_percent = Column(Float, default=0.0)  # Tax percentage
    stock_quantity = Column(Integer, default=0)  # Current stock quantity
    reorder_level = Column(Integer, default=10)  # Reorder level
    storage_condition = Column(String)  # Storage conditions (e.g., "Cool dry place")
    schedule = Column(String)  # Drug schedule (e.g., H1, H2, Schedule X)
    alternative_drug_names = Column(Text)  # Alternative drug names (comma separated)
    substitution_allowed = Column(Boolean, default=True)  # Whether substitution is allowed
    location = Column(String)  # Storage location in pharmacy
    notes = Column(Text)  # Additional notes
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    batches = relationship("MedicineBatch", back_populates="medicine")
    prescription_items = relationship("PrescriptionItem", back_populates="medicine")

# Medicine Batch Model
class MedicineBatch(Base):
    __tablename__ = "medicine_batches"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    batch_number = Column(String, nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    current_stock = Column(Integer, nullable=False)
    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    manufacture_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    low_stock_threshold = Column(Integer, default=10)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    medicine = relationship("Medicine", back_populates="batches")
    supplier = relationship("Supplier", back_populates="batches")
    stock_movements = relationship("StockMovement", back_populates="batch")

# Stock Movement Model
class StockMovement(Base):
    __tablename__ = "stock_movements"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("medicine_batches.id"), nullable=False)
    movement_type = Column(String, nullable=False)  # IN, OUT, ADJUSTMENT
    quantity = Column(Integer, nullable=False)
    reference_type = Column(String)  # PURCHASE, PRESCRIPTION, ADJUSTMENT, RETURN
    reference_id = Column(Integer)
    reason = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    batch = relationship("MedicineBatch", back_populates="stock_movements")
    user = relationship("User")

# Prescription Model
class Prescription(Base):
    __tablename__ = "prescriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    prescription_number = Column(String, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_name = Column(String)
    doctor_license = Column(String)
    diagnosis = Column(Text)
    notes = Column(Text)
    status = Column(Enum(PrescriptionStatus), default=PrescriptionStatus.PENDING)
    file_path = Column(String)  # For uploaded prescription files
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    filled_at = Column(DateTime(timezone=True))
    
    # Relationships
    patient = relationship("Patient", back_populates="prescriptions")
    created_by_user = relationship("User", back_populates="prescriptions_created")
    items = relationship("PrescriptionItem", back_populates="prescription")
    invoice_items = relationship("InvoiceItem", back_populates="prescription")

# Prescription Item Model
class PrescriptionItem(Base):
    __tablename__ = "prescription_items"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("medicine_batches.id"))
    dosage = Column(String, nullable=False)
    frequency = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    instructions = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    prescription = relationship("Prescription", back_populates="items")
    medicine = relationship("Medicine", back_populates="prescription_items")
    batch = relationship("MedicineBatch")

# Invoice Model
class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    invoice_number = Column(String, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    subtotal = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    payment_mode = Column(Enum(PaymentMode))
    paid_amount = Column(Float, default=0.0)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient")
    user = relationship("User")
    items = relationship("InvoiceItem", back_populates="invoice")
    payments = relationship("Payment", back_populates="invoice")

# Invoice Item Model
class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"))
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("medicine_batches.id"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    invoice = relationship("Invoice", back_populates="items")
    prescription = relationship("Prescription", back_populates="invoice_items")
    medicine = relationship("Medicine")
    batch = relationship("MedicineBatch")

# Payment Model
class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_mode = Column(Enum(PaymentMode), nullable=False)
    transaction_id = Column(String)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    invoice = relationship("Invoice", back_populates="payments")
    user = relationship("User")

# Refund Model
class Refund(Base):
    __tablename__ = "refunds"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    refund_number = Column(String, index=True, nullable=False)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    amount = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    refund_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    invoice = relationship("Invoice")
    user = relationship("User")

# Audit Log Model
class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(Integer)
    old_values = Column(Text)
    new_values = Column(Text)
    ip_address = Column(String)
    user_agent = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")

# Notification Model
class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False)  # EXPIRY, LOW_STOCK, REFILL, etc.
    recipient_id = Column(Integer, ForeignKey("users.id"))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True))
    
    # Relationships
    recipient = relationship("User")

# Hold Bill Model for POS
class HoldBill(Base):
    __tablename__ = "hold_bills"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    hold_number = Column(String, index=True, nullable=False)
    cart_data = Column(Text, nullable=False)  # JSON data for cart
    customer_info = Column(Text)  # JSON data for customer
    held_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    held_at = Column(DateTime(timezone=True), server_default=func.now())
    hold_reason = Column(Text)
    is_active = Column(Boolean, default=True)
    released_at = Column(DateTime(timezone=True))
    released_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    user = relationship("User", foreign_keys=[held_by])
    released_by_user = relationship("User", foreign_keys=[released_by])

# Organization Settings Model
class OrganizationSettings(Base):
    __tablename__ = "organization_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    store_name = Column(String, nullable=False, default="Pharmacy Store")
    address = Column(String)
    city = Column(String)
    state = Column(String)
    postal_code = Column(String)
    country = Column(String)
    phone = Column(String)
    email = Column(String)
    website = Column(String)
    logo = Column(String)  # URL or base64 encoded image
    tax_number = Column(String)
    gst_number = Column(String)
    hsn_code_default = Column(String, default="3004")
    currency = Column(String, default="USD")
    timezone = Column(String, default="UTC")
    date_format = Column(String, default="MM/DD/YYYY")
    time_format = Column(String, default="12-hour")
    invoice_number_format = Column(String, default="INV-{YYYY}-{MM}-{SEQ}")
    invoice_prefix = Column(String, default="INV")
    prescription_number_format = Column(String, default="PRX-{YYYY}-{MM}-{SEQ}")
    prescription_prefix = Column(String, default="PRX")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# POS Settings Model
class POSSettings(Base):
    __tablename__ = "pos_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    payment_methods = Column(Text)  # JSON string
    barcode_scanning = Column(Text)  # JSON string
    receipt = Column(Text)  # JSON string
    discount = Column(Text)  # JSON string
    terminal = Column(Text)  # JSON string
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Theme Settings Model
class ThemeSettings(Base):
    __tablename__ = "theme_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    theme_mode = Column(String, default="light")
    color_scheme = Column(Text)  # JSON string
    branding = Column(Text)  # JSON string
    ui = Column(Text)  # JSON string
    print = Column(Text)  # JSON string
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Inventory Settings Model
class InventorySettings(Base):
    __tablename__ = "inventory_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    reorder_settings = Column(Text)  # JSON string
    expiry_alerts = Column(Text)  # JSON string
    low_stock_alerts = Column(Text)  # JSON string
    alternatives = Column(Text)  # JSON string
    batch_pricing = Column(Text)  # JSON string
    stock_movement = Column(Text)  # JSON string
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Notification Settings Model
class NotificationSettings(Base):
    __tablename__ = "notification_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    email_settings = Column(Text)  # JSON string
    sms_settings = Column(Text)  # JSON string
    whatsapp_settings = Column(Text)  # JSON string
    notification_types = Column(Text)  # JSON string
    templates = Column(Text)  # JSON string
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Integration Settings Model
class IntegrationSettings(Base):
    __tablename__ = "integration_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    payment_gateway = Column(Text)  # JSON string
    eprescription = Column(Text)  # JSON string
    accounting = Column(Text)  # JSON string
    insurance = Column(Text)  # JSON string
    cloud_storage = Column(Text)  # JSON string
    laboratory = Column(Text)  # JSON string
    supplier_portal = Column(Text)  # JSON string
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Compliance Settings Model
class ComplianceSettings(Base):
    __tablename__ = "compliance_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    regulatory = Column(Text)  # JSON string
    licenses = Column(Text)  # JSON string
    audit = Column(Text)  # JSON string
    privacy = Column(Text)  # JSON string
    prescription = Column(Text)  # JSON string
    reporting = Column(Text)  # JSON string
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Support Ticket Model
class SupportTicket(Base):
    __tablename__ = "support_tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    priority = Column(String, default="Medium")  # Low, Medium, High, Critical
    status = Column(String, default="Open")  # Open, In Progress, Resolved, Closed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")

# Knowledge Base Article Model
class KnowledgeBaseArticle(Base):
    __tablename__ = "knowledge_base_articles"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    tags = Column(String)  # JSON string of tags
    is_published = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    author = relationship("User")

# Support Contact Model
class SupportContact(Base):
    __tablename__ = "support_contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String)
    department = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Support Resource Model
class SupportResource(Base):
    __tablename__ = "support_resources"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    resource_type = Column(String, nullable=False)  # VIDEO, DOCUMENT, LINK
    url = Column(String)  # For links or videos
    file_path = Column(String)  # For documents
    category = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Subscription Plan Model
class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Integer, nullable=False)  # Price in cents
    billing_cycle = Column(String, nullable=False)  # MONTHLY, YEARLY
    features = Column(String)  # JSON string of features
    is_active = Column(Boolean, default=True)
    max_users = Column(Integer)  # Maximum number of users allowed
    max_pharmacies = Column(Integer)  # Maximum number of pharmacies allowed
    storage_limit_gb = Column(Integer)  # Storage limit in GB
    support_level = Column(String, default="Standard")  # Basic, Standard, Premium
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user_subscriptions = relationship("UserSubscription", back_populates="plan")

# User Subscription Model
class UserSubscription(Base):
    __tablename__ = "user_subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=False)
    status = Column(String, default="ACTIVE")  # ACTIVE, CANCELLED, EXPIRED, PENDING
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    auto_renew = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    plan = relationship("SubscriptionPlan", back_populates="user_subscriptions")
    invoices = relationship("SubscriptionInvoice", back_populates="subscription")

# Payment Method Model
class PaymentMethod(Base):
    __tablename__ = "payment_methods"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    method_type = Column(String, nullable=False)  # CREDIT_CARD, PAYPAL, BANK_TRANSFER
    last_four = Column(String)  # Last 4 digits of card or account
    expiry_month = Column(Integer)  # For credit cards
    expiry_year = Column(Integer)  # For credit cards
    cardholder_name = Column(String)  # For credit cards
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    subscription_payments = relationship("SubscriptionPayment", back_populates="payment_method")

# Subscription Invoice Model
class SubscriptionInvoice(Base):
    __tablename__ = "subscription_invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subscription_id = Column(Integer, ForeignKey("user_subscriptions.id"), nullable=False)
    invoice_number = Column(String, index=True, nullable=False)
    amount = Column(Integer, nullable=False)  # Amount in cents
    due_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default="PENDING")  # PENDING, PAID, OVERDUE, CANCELLED
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    paid_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User")
    subscription = relationship("UserSubscription", back_populates="invoices")
    payments = relationship("SubscriptionPayment", back_populates="invoice")

# Subscription Payment Model
class SubscriptionPayment(Base):
    __tablename__ = "subscription_payments"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    invoice_id = Column(Integer, ForeignKey("subscription_invoices.id"), nullable=False)
    amount = Column(Integer, nullable=False)  # Amount in cents
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id"), nullable=False)
    status = Column(String, default="PENDING")  # PENDING, COMPLETED, FAILED, REFUNDED
    transaction_id = Column(String)  # External transaction ID
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    invoice = relationship("SubscriptionInvoice", back_populates="payments")
    payment_method = relationship("PaymentMethod", back_populates="subscription_payments")

# Backup Settings Model
class BackupSettings(Base):
    __tablename__ = "backup_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    automatic_backup = Column(Text)  # JSON string
    cloud_backup = Column(Text)  # JSON string
    local_backup = Column(Text)  # JSON string
    data_export = Column(Text)  # JSON string
    data_import = Column(Text)  # JSON string
    data_privacy = Column(Text)  # JSON string
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# User Roles Settings Model
class UserRolesSettings(Base):
    __tablename__ = "user_roles_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    roles = Column(Text)  # JSON string
    permissions = Column(Text)  # JSON string
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())