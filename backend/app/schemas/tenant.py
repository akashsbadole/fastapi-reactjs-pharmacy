from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class TenantPlanEnum(str, Enum):
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class TenantStatusEnum(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class UserRoleEnum(str, Enum):
    ADMIN = "admin"
    PHARMACIST = "pharmacist"
    CASHIER = "cashier"
    DOCTOR = "doctor"


class TenantBase(BaseModel):
    name: str
    slug: str
    domain: Optional[str] = None
    plan: TenantPlanEnum = TenantPlanEnum.BASIC
    max_users: Optional[int] = 5
    max_pharmacies: Optional[int] = 1
    storage_limit_gb: Optional[int] = 10
    billing_email: Optional[EmailStr] = None
    billing_address: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None


class TenantCreate(TenantBase):
    pass


class TenantUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    plan: Optional[TenantPlanEnum] = None
    max_users: Optional[int] = None
    max_pharmacies: Optional[int] = None
    storage_limit_gb: Optional[int] = None
    billing_email: Optional[EmailStr] = None
    billing_address: Optional[str] = None
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None


class TenantResponse(TenantBase):
    id: int
    status: TenantStatusEnum
    subscription_start_date: Optional[datetime] = None
    subscription_end_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class TenantSettingsBase(BaseModel):
    settings_data: Optional[Dict[str, Any]] = {}


class TenantSettingsCreate(TenantSettingsBase):
    pass


class TenantSettingsUpdate(BaseModel):
    settings_data: Optional[Dict[str, Any]] = None


class TenantSettingsResponse(TenantSettingsBase):
    id: int
    tenant_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class UserInvitationBase(BaseModel):
    email: EmailStr
    role: UserRoleEnum


class UserInvitationCreate(UserInvitationBase):
    pass


class UserInvitationResponse(UserInvitationBase):
    id: int
    tenant_id: int
    invitation_token: str
    expires_at: Optional[datetime] = None
    is_accepted: Optional[bool] = None
    accepted_by: Optional[int] = None
    accepted_at: Optional[datetime] = None
    created_by: Optional[int] = None
    created_at: datetime

    class Config:
        orm_mode = True


class AcceptInvitationRequest(BaseModel):
    token: str
    password: str
    full_name: str
    phone: Optional[str] = None


class TenantStats(BaseModel):
    total_users: int
    total_medicines: int
    total_patients: int
    total_prescriptions: int
    total_invoices: int
    storage_used_mb: float

    class Config:
        orm_mode = True


class TenantWithStats(TenantResponse):
    stats: Optional[TenantStats] = None