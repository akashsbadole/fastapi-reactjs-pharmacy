from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, ForeignKey, Text, Enum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

# Enums
class UserRole(enum.Enum):
    ADMIN = "admin"
    PHARMACIST = "pharmacist"
    CASHIER = "cashier"
    DOCTOR = "doctor"

class PrescriptionStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    FILLED = "filled"
    CANCELLED = "cancelled"

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"
    PARTIAL = "partial"

class PaymentMode(enum.Enum):
    CASH = "cash"
    CARD = "card"
    INSURANCE = "insurance"
    ONLINE = "online"

# User Model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    role = Column(Enum(UserRole), default=UserRole.CASHIER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    prescriptions_created = relationship("Prescription", back_populates="created_by_user")
    audit_logs = relationship("AuditLog", back_populates="user")

# Patient Model
class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, unique=True, index=True, nullable=False)
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
    name = Column(String, nullable=False, index=True)
    generic_name = Column(String)
    brand = Column(String)
    category = Column(String)
    description = Column(Text)
    dosage_form = Column(String)  # tablet, capsule, syrup, etc.
    strength = Column(String)  # 500mg, 10ml, etc.
    manufacturer = Column(String)
    requires_prescription = Column(Boolean, default=False)
    barcode = Column(String, unique=True, index=True)
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
    prescription_number = Column(String, unique=True, index=True, nullable=False)
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
    invoice_number = Column(String, unique=True, index=True, nullable=False)
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
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    amount = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    invoice = relationship("Invoice")
    user = relationship("User")

# Audit Log Model
class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
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
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False)  # EXPIRY, LOW_STOCK, REFILL, etc.
    recipient_id = Column(Integer, ForeignKey("users.id"))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True))
    
    # Relationships
    recipient = relationship("User")