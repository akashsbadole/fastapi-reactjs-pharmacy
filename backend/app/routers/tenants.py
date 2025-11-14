from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import re

from ..database import get_db
from ..multi_tenant_models import Tenant, TenantSettings, UserInvitation, TenantStatus, TenantPlan
from ..models import User, UserRole
from ..schemas.tenant import TenantCreate, TenantUpdate, TenantResponse, TenantSettingsResponse, UserInvitationCreate, UserInvitationResponse
from ..utils.auth import get_current_user, get_password_hash
from ..middleware import get_current_tenant_id

router = APIRouter()


@router.post("/", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    tenant: TenantCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new tenant (pharmacy).
    This is a public endpoint for tenant registration.
    """
    # Check if tenant slug already exists
    existing_tenant = db.query(Tenant).filter(Tenant.slug == tenant.slug).first()
    if existing_tenant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tenant slug already exists"
        )
    
    # Check if domain already exists
    if tenant.domain:
        existing_domain = db.query(Tenant).filter(Tenant.domain == tenant.domain).first()
        if existing_domain:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Domain already exists"
            )
    
    # Create new tenant
    new_tenant = Tenant(
        name=tenant.name,
        slug=tenant.slug,
        domain=tenant.domain,
        status=TenantStatus.ACTIVE,
        plan=TenantPlan(tenant.plan.upper()),
        max_users=tenant.max_users,
        max_pharmacies=tenant.max_pharmacies,
        storage_limit_gb=tenant.storage_limit_gb,
        subscription_start_date=datetime.utcnow(),
        subscription_end_date=datetime.utcnow() + timedelta(days=30),  # 30-day trial
        billing_email=tenant.billing_email,
        billing_address=tenant.billing_address,
        contact_person=tenant.contact_person,
        contact_email=tenant.contact_email,
        contact_phone=tenant.contact_phone,
    )
    
    db.add(new_tenant)
    db.commit()
    db.refresh(new_tenant)
    
    # Create default tenant settings
    tenant_settings = TenantSettings(
        tenant_id=new_tenant.id,
        settings_data={
            "organization": {
                "store_name": new_tenant.name,
                "address": "",
                "city": "",
                "state": "",
                "postal_code": "",
                "country": "",
                "phone": "",
                "email": new_tenant.contact_email,
                "website": "",
                "tax_number": "",
                "gst_number": "",
                "currency": "USD",
                "timezone": "UTC",
                "date_format": "MM/DD/YYYY",
                "time_format": "12-hour"
            },
            "pos": {
                "payment_methods": ["CASH", "CARD"],
                "barcode_scanning": True,
                "receipt_layout": "default"
            },
            "inventory": {
                "reorder_level": 10,
                "expiry_alert_days": 30,
                "low_stock_alert": True
            },
            "notifications": {
                "email_enabled": True,
                "sms_enabled": False,
                "expiry_alerts": True,
                "low_stock_alerts": True
            }
        }
    )
    
    db.add(tenant_settings)
    db.commit()
    
    return new_tenant


@router.get("/", response_model=List[TenantResponse])
async def get_tenants(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all tenants (admin only).
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )
    
    tenants = db.query(Tenant).offset(skip).limit(limit).all()
    return tenants


@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific tenant by ID.
    """
    # Users can only view their own tenant
    if current_user.role != UserRole.ADMIN and current_user.tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this tenant"
        )
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    return tenant


@router.put("/{tenant_id}", response_model=TenantResponse)
async def update_tenant(
    tenant_id: int,
    tenant_update: TenantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a tenant.
    """
    # Users can only update their own tenant
    if current_user.role != UserRole.ADMIN and current_user.tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this tenant"
        )
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Update tenant fields
    update_data = tenant_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "plan" and value:
            setattr(tenant, field, TenantPlan(value.upper()))
        else:
            setattr(tenant, field, value)
    
    db.commit()
    db.refresh(tenant)
    
    return tenant


@router.get("/{tenant_id}/settings", response_model=TenantSettingsResponse)
async def get_tenant_settings(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get tenant settings.
    """
    # Users can only view their own tenant settings
    if current_user.role != UserRole.ADMIN and current_user.tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this tenant's settings"
        )
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    settings = db.query(TenantSettings).filter(TenantSettings.tenant_id == tenant_id).first()
    if not settings:
        # Create default settings if they don't exist
        settings = TenantSettings(
            tenant_id=tenant_id,
            settings_data={}
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings


@router.post("/{tenant_id}/invite", response_model=UserInvitationResponse, status_code=status.HTTP_201_CREATED)
async def invite_user(
    tenant_id: int,
    invitation: UserInvitationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Invite a user to join a tenant.
    """
    # Only tenant admins can invite users
    if current_user.role != UserRole.ADMIN and current_user.tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to invite users to this tenant"
        )
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == invitation.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Check if invitation already exists
    existing_invitation = db.query(UserInvitation).filter(
        UserInvitation.email == invitation.email,
        UserInvitation.tenant_id == tenant_id,
        UserInvitation.is_accepted == False
    ).first()
    
    if existing_invitation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation already sent to this email"
        )
    
    # Create invitation
    new_invitation = UserInvitation(
        tenant_id=tenant_id,
        email=invitation.email,
        role=UserRole(invitation.role.upper()),
        expires_at=datetime.utcnow() + timedelta(days=7),  # Invitation expires in 7 days
        created_by=current_user.id
    )
    
    db.add(new_invitation)
    db.commit()
    db.refresh(new_invitation)
    
    # TODO: Send invitation email
    
    return new_invitation


@router.get("/{tenant_id}/invitations", response_model=List[UserInvitationResponse])
async def get_tenant_invitations(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all invitations for a tenant.
    """
    # Only tenant admins can view invitations
    if current_user.role != UserRole.ADMIN and current_user.tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view invitations for this tenant"
        )
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    invitations = db.query(UserInvitation).filter(UserInvitation.tenant_id == tenant_id).all()
    return invitations


@router.post("/accept-invitation/{token}")
async def accept_invitation(
    token: str,
    password: str,
    full_name: str,
    phone: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Accept an invitation and create a new user account.
    This is a public endpoint.
    """
    invitation = db.query(UserInvitation).filter(
        UserInvitation.invitation_token == token,
        UserInvitation.is_accepted == False,
        UserInvitation.expires_at > datetime.utcnow()
    ).first()
    
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired invitation"
        )
    
    # Create new user
    new_user = User(
        tenant_id=invitation.tenant_id,
        username=invitation.email.split("@")[0],  # Use email prefix as username
        email=invitation.email,
        hashed_password=get_password_hash(password),
        full_name=full_name,
        phone=phone,
        role=invitation.role,
        is_active=True
    )
    
    db.add(new_user)
    
    # Mark invitation as accepted
    invitation.is_accepted = True
    invitation.accepted_by = new_user.id
    invitation.accepted_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Invitation accepted successfully", "user_id": new_user.id}