from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Enum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

# Multi-tenancy enums
class TenantStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"
    TRIAL = "TRIAL"

class TenantPlan(enum.Enum):
    BASIC = "BASIC"
    PROFESSIONAL = "PROFESSIONAL"
    ENTERPRISE = "ENTERPRISE"

# Tenant Model
class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    subdomain = Column(String, unique=True, index=True, nullable=False)
    domain = Column(String, unique=True, index=True)  # Optional custom domain
    status = Column(Enum(TenantStatus), default=TenantStatus.TRIAL)
    plan = Column(Enum(TenantPlan), default=TenantPlan.BASIC)
    
    # Tenant configuration
    max_users = Column(Integer, default=5)
    max_stores = Column(Integer, default=1)
    storage_limit_gb = Column(Integer, default=5)
    
    # Subscription details
    subscription_start_date = Column(Date)
    subscription_end_date = Column(Date)
    trial_end_date = Column(Date)
    
    # Contact information
    contact_email = Column(String, nullable=False)
    contact_phone = Column(String)
    contact_name = Column(String)
    
    # Billing information
    billing_address = Column(Text)
    billing_city = Column(String)
    billing_state = Column(String)
    billing_country = Column(String)
    billing_postal_code = Column(String)
    tax_id = Column(String)
    
    # System information
    database_name = Column(String)  # For database-per-tenant approach
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="tenant")
    tenant_settings = relationship("TenantSettings", back_populates="tenant", uselist=False)

# Tenant Settings Model
class TenantSettings(Base):
    __tablename__ = "tenant_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    
    # Organization settings
    store_name = Column(String, nullable=False)
    address = Column(String)
    city = Column(String)
    state = Column(String)
    postal_code = Column(String)
    country = Column(String)
    phone = Column(String)
    email = Column(String)
    website = Column(String)
    logo = Column(String)  # URL to logo
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
    
    # Feature flags
    enable_multi_store = Column(Boolean, default=False)
    enable_advanced_reporting = Column(Boolean, default=False)
    enable_api_access = Column(Boolean, default=False)
    enable_sms_notifications = Column(Boolean, default=False)
    enable_whatsapp_notifications = Column(Boolean, default=False)
    enable_email_integration = Column(Boolean, default=False)
    enable_backup = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tenant = relationship("Tenant", back_populates="tenant_settings")

# User Invitation Model
class UserInvitation(Base):
    __tablename__ = "user_invitations"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    email = Column(String, nullable=False)
    role = Column(String, nullable=False)
    invited_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    invitation_token = Column(String, nullable=False, unique=True)
    is_accepted = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tenant = relationship("Tenant")
    inviter = relationship("User")