from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
import json

from app.database import get_db
from app.models import User
from app.schemas.subscription import (
    SubscriptionPlanCreate, SubscriptionPlanUpdate, SubscriptionPlan,
    UserSubscriptionCreate, UserSubscriptionUpdate, UserSubscriptionResponse,
    PaymentMethodCreate, PaymentMethodUpdate, PaymentMethod,
    InvoiceCreate, InvoiceUpdate, InvoiceResponse,
    PaymentCreate, PaymentUpdate, Payment, UsageData
)
from app.utils.auth import get_current_active_user

router = APIRouter()

# Subscription Plans endpoints
@router.post("/plans", response_model=SubscriptionPlan)
async def create_subscription_plan(
    plan: SubscriptionPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new subscription plan"""
    # Import here to avoid circular imports
    from app.models import SubscriptionPlan as SubscriptionPlanModel
    
    db_plan = SubscriptionPlanModel(
        name=plan.name,
        description=plan.description,
        price=plan.price,
        billing_cycle=plan.billing_cycle,
        features=json.dumps(plan.features),
        is_active=plan.is_active,
        max_users=plan.max_users,
        max_pharmacies=plan.max_pharmacies,
        storage_limit_gb=plan.storage_limit_gb,
        support_level=plan.support_level
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    
    # Convert features from JSON string to list
    plan_dict = db_plan.__dict__
    if 'features' in plan_dict and plan_dict['features']:
        plan_dict['features'] = json.loads(plan_dict['features'])
    
    return plan_dict

@router.get("/plans", response_model=List[SubscriptionPlan])
async def get_subscription_plans(
    is_active: Optional[bool] = Query(True, description="Filter by active status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get subscription plans"""
    # Import here to avoid circular imports
    from app.models import SubscriptionPlan as SubscriptionPlanModel
    
    query = db.query(SubscriptionPlanModel)
    
    if is_active is not None:
        query = query.filter(SubscriptionPlanModel.is_active == is_active)
    
    plans = query.all()
    
    # Convert features from JSON string to list for each plan
    result = []
    for plan in plans:
        plan_dict = plan.__dict__
        if 'features' in plan_dict and plan_dict['features']:
            plan_dict['features'] = json.loads(plan_dict['features'])
        result.append(plan_dict)
    
    return result

@router.get("/plans/{plan_id}", response_model=SubscriptionPlan)
async def get_subscription_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific subscription plan by ID"""
    # Import here to avoid circular imports
    from app.models import SubscriptionPlan as SubscriptionPlanModel
    
    plan = db.query(SubscriptionPlanModel).filter(SubscriptionPlanModel.id == plan_id).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")
    
    # Convert features from JSON string to list
    plan_dict = plan.__dict__
    if 'features' in plan_dict and plan_dict['features']:
        plan_dict['features'] = json.loads(plan_dict['features'])
    
    return plan_dict

@router.put("/plans/{plan_id}", response_model=SubscriptionPlan)
async def update_subscription_plan(
    plan_id: int,
    plan_update: SubscriptionPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a subscription plan"""
    # Import here to avoid circular imports
    from app.models import SubscriptionPlan as SubscriptionPlanModel
    
    db_plan = db.query(SubscriptionPlanModel).filter(SubscriptionPlanModel.id == plan_id).first()
    
    if not db_plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")
    
    # Update fields if provided
    update_data = plan_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "features":
            setattr(db_plan, field, json.dumps(value))
        else:
            setattr(db_plan, field, value)
    
    db_plan.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_plan)
    
    # Convert features from JSON string to list
    plan_dict = db_plan.__dict__
    if 'features' in plan_dict and plan_dict['features']:
        plan_dict['features'] = json.loads(plan_dict['features'])
    
    return plan_dict

# User Subscriptions endpoints
@router.post("/subscriptions", response_model=UserSubscriptionResponse)
async def create_user_subscription(
    subscription: UserSubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new user subscription"""
    # Import here to avoid circular imports
    from app.models import UserSubscription as UserSubscriptionModel, SubscriptionPlan as SubscriptionPlanModel
    
    # Check if plan exists
    plan = db.query(SubscriptionPlanModel).filter(SubscriptionPlanModel.id == subscription.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")
    
    # Check if user already has an active subscription
    existing_subscription = db.query(UserSubscriptionModel).filter(
        UserSubscriptionModel.user_id == subscription.user_id,
        UserSubscriptionModel.status == "ACTIVE"
    ).first()
    
    if existing_subscription:
        raise HTTPException(status_code=400, detail="User already has an active subscription")
    
    db_subscription = UserSubscriptionModel(
        user_id=subscription.user_id,
        plan_id=subscription.plan_id,
        status=subscription.status,
        start_date=subscription.start_date,
        end_date=subscription.end_date,
        auto_renew=subscription.auto_renew
    )
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    
    # Get plan information for response
    plan_features = json.loads(plan.features) if plan.features else []
    
    return {
        "id": db_subscription.id,
        "user_id": db_subscription.user_id,
        "plan_id": db_subscription.plan_id,
        "status": db_subscription.status,
        "start_date": db_subscription.start_date,
        "end_date": db_subscription.end_date,
        "auto_renew": db_subscription.auto_renew,
        "created_at": db_subscription.created_at,
        "updated_at": db_subscription.updated_at,
        "plan_name": plan.name,
        "plan_description": plan.description,
        "plan_price": plan.price,
        "plan_billing_cycle": plan.billing_cycle,
        "plan_features": plan_features
    }

@router.get("/subscriptions", response_model=List[UserSubscriptionResponse])
async def get_user_subscriptions(
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user subscriptions"""
    # Import here to avoid circular imports
    from app.models import UserSubscription as UserSubscriptionModel, SubscriptionPlan as SubscriptionPlanModel
    
    query = db.query(UserSubscriptionModel, SubscriptionPlanModel).join(SubscriptionPlanModel)
    
    if user_id:
        query = query.filter(UserSubscriptionModel.user_id == user_id)
    
    if status:
        query = query.filter(UserSubscriptionModel.status == status)
    
    subscriptions = query.all()
    
    # Convert to response format
    result = []
    for subscription, plan in subscriptions:
        plan_features = json.loads(plan.features) if plan.features else []
        result.append({
            "id": subscription.id,
            "user_id": subscription.user_id,
            "plan_id": subscription.plan_id,
            "status": subscription.status,
            "start_date": subscription.start_date,
            "end_date": subscription.end_date,
            "auto_renew": subscription.auto_renew,
            "created_at": subscription.created_at,
            "updated_at": subscription.updated_at,
            "plan_name": plan.name,
            "plan_description": plan.description,
            "plan_price": plan.price,
            "plan_billing_cycle": plan.billing_cycle,
            "plan_features": plan_features
        })
    
    return result

@router.get("/subscriptions/current", response_model=UserSubscriptionResponse)
async def get_current_user_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get the current user's active subscription"""
    # Import here to avoid circular imports
    from app.models import UserSubscription as UserSubscriptionModel, SubscriptionPlan as SubscriptionPlanModel
    
    subscription = db.query(UserSubscriptionModel, SubscriptionPlanModel).join(SubscriptionPlanModel).filter(
        UserSubscriptionModel.user_id == current_user.id,
        UserSubscriptionModel.status == "ACTIVE"
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription found")
    
    subscription_model, plan = subscription
    plan_features = json.loads(plan.features) if plan.features else []
    
    return {
        "id": subscription_model.id,
        "user_id": subscription_model.user_id,
        "plan_id": subscription_model.plan_id,
        "status": subscription_model.status,
        "start_date": subscription_model.start_date,
        "end_date": subscription_model.end_date,
        "auto_renew": subscription_model.auto_renew,
        "created_at": subscription_model.created_at,
        "updated_at": subscription_model.updated_at,
        "plan_name": plan.name,
        "plan_description": plan.description,
        "plan_price": plan.price,
        "plan_billing_cycle": plan.billing_cycle,
        "plan_features": plan_features
    }

@router.put("/subscriptions/{subscription_id}", response_model=UserSubscriptionResponse)
async def update_user_subscription(
    subscription_id: int,
    subscription_update: UserSubscriptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a user subscription"""
    # Import here to avoid circular imports
    from app.models import UserSubscription as UserSubscriptionModel, SubscriptionPlan as SubscriptionPlanModel
    
    db_subscription = db.query(UserSubscriptionModel).filter(UserSubscriptionModel.id == subscription_id).first()
    
    if not db_subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Update fields if provided
    update_data = subscription_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_subscription, field, value)
    
    db_subscription.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_subscription)
    
    # Get plan information for response
    plan = db.query(SubscriptionPlanModel).filter(SubscriptionPlanModel.id == db_subscription.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")
    
    plan_features = json.loads(plan.features) if plan.features else []
    
    return {
        "id": db_subscription.id,
        "user_id": db_subscription.user_id,
        "plan_id": db_subscription.plan_id,
        "status": db_subscription.status,
        "start_date": db_subscription.start_date,
        "end_date": db_subscription.end_date,
        "auto_renew": db_subscription.auto_renew,
        "created_at": db_subscription.created_at,
        "updated_at": db_subscription.updated_at,
        "plan_name": plan.name,
        "plan_description": plan.description,
        "plan_price": plan.price,
        "plan_billing_cycle": plan.billing_cycle,
        "plan_features": plan_features
    }

# Payment Methods endpoints
@router.post("/payment-methods", response_model=PaymentMethod)
async def create_payment_method(
    payment_method: PaymentMethodCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new payment method"""
    # Import here to avoid circular imports
    from app.models import PaymentMethod as PaymentMethodModel
    
    # If this is set as default, unset other default methods for this user
    if payment_method.is_default:
        db.query(PaymentMethodModel).filter(
            PaymentMethodModel.user_id == payment_method.user_id,
            PaymentMethodModel.is_default == True
        ).update({"is_default": False})
    
    db_payment_method = PaymentMethodModel(
        user_id=payment_method.user_id,
        method_type=payment_method.method_type,
        last_four=payment_method.last_four,
        expiry_month=payment_method.expiry_month,
        expiry_year=payment_method.expiry_year,
        cardholder_name=payment_method.cardholder_name,
        is_default=payment_method.is_default,
        is_active=payment_method.is_active
    )
    db.add(db_payment_method)
    db.commit()
    db.refresh(db_payment_method)
    return db_payment_method

@router.get("/payment-methods", response_model=List[PaymentMethod])
async def get_payment_methods(
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    is_active: Optional[bool] = Query(True, description="Filter by active status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get payment methods"""
    # Import here to avoid circular imports
    from app.models import PaymentMethod as PaymentMethodModel
    
    query = db.query(PaymentMethodModel)
    
    if user_id:
        query = query.filter(PaymentMethodModel.user_id == user_id)
    
    if is_active is not None:
        query = query.filter(PaymentMethodModel.is_active == is_active)
    
    payment_methods = query.all()
    return payment_methods

# Invoices endpoints
@router.post("/invoices", response_model=InvoiceResponse)
async def create_invoice(
    invoice: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new invoice"""
    # Import here to avoid circular imports
    from app.models import SubscriptionInvoice as InvoiceModel, UserSubscription as UserSubscriptionModel, SubscriptionPlan as SubscriptionPlanModel
    
    # Generate invoice number
    last_invoice = db.query(InvoiceModel).order_by(InvoiceModel.id.desc()).first()
    invoice_number = f"INV-{datetime.now().strftime('%Y%m%d')}-{(last_invoice.id + 1) if last_invoice else 1:05d}"
    
    # Get subscription and plan information
    subscription = db.query(UserSubscriptionModel).filter(UserSubscriptionModel.id == invoice.subscription_id).first()
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    plan = db.query(SubscriptionPlanModel).filter(SubscriptionPlanModel.id == subscription.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")
    
    db_invoice = InvoiceModel(
        user_id=invoice.user_id,
        subscription_id=invoice.subscription_id,
        invoice_number=invoice_number,
        amount=invoice.amount,
        due_date=invoice.due_date,
        status=invoice.status,
        description=invoice.description
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    
    return {
        "id": db_invoice.id,
        "user_id": db_invoice.user_id,
        "subscription_id": db_invoice.subscription_id,
        "invoice_number": db_invoice.invoice_number,
        "amount": db_invoice.amount,
        "due_date": db_invoice.due_date,
        "status": db_invoice.status,
        "description": db_invoice.description,
        "created_at": db_invoice.created_at,
        "updated_at": db_invoice.updated_at,
        "paid_at": db_invoice.paid_at,
        "plan_name": plan.name
    }

@router.get("/invoices", response_model=List[InvoiceResponse])
async def get_invoices(
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get invoices"""
    # Import here to avoid circular imports
    from app.models import SubscriptionInvoice as InvoiceModel, UserSubscription as UserSubscriptionModel, SubscriptionPlan as SubscriptionPlanModel
    
    query = db.query(InvoiceModel, SubscriptionPlanModel).join(
        UserSubscriptionModel, InvoiceModel.subscription_id == UserSubscriptionModel.id
    ).join(
        SubscriptionPlanModel, UserSubscriptionModel.plan_id == SubscriptionPlanModel.id
    )
    
    if user_id:
        query = query.filter(InvoiceModel.user_id == user_id)
    
    if status:
        query = query.filter(InvoiceModel.status == status)
    
    invoices = query.order_by(InvoiceModel.created_at.desc()).all()
    
    # Convert to response format
    result = []
    for invoice, plan in invoices:
        result.append({
            "id": invoice.id,
            "user_id": invoice.user_id,
            "subscription_id": invoice.subscription_id,
            "invoice_number": invoice.invoice_number,
            "amount": invoice.amount,
            "due_date": invoice.due_date,
            "status": invoice.status,
            "description": invoice.description,
            "created_at": invoice.created_at,
            "updated_at": invoice.updated_at,
            "paid_at": invoice.paid_at,
            "plan_name": plan.name
        })
    
    return result

@router.get("/usage", response_model=UsageData)
async def get_usage_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get current usage data for the user"""
    # Import here to avoid circular imports
    from app.models import UserSubscription as UserSubscriptionModel, SubscriptionPlan as SubscriptionPlanModel
    
    # Get user's active subscription
    subscription = db.query(UserSubscriptionModel, SubscriptionPlanModel).join(SubscriptionPlanModel).filter(
        UserSubscriptionModel.user_id == current_user.id,
        UserSubscriptionModel.status == "ACTIVE"
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription found")
    
    subscription_model, plan = subscription
    
    # Get user count (simplified - in a real app, this would be more complex)
    user_count = 1  # Current user
    
    # Get pharmacy count (simplified - in a real app, this would query the pharmacies table)
    pharmacy_count = 1  # Default
    
    # Calculate storage used (simplified - in a real app, this would calculate actual storage usage)
    storage_used_mb = 50.0  # Default
    
    storage_limit_mb = plan.storage_limit_gb * 1024 if plan.storage_limit_gb else 1024  # Convert GB to MB
    
    return {
        "user_id": current_user.id,
        "current_users": user_count,
        "max_users": plan.max_users or 1,
        "current_pharmacies": pharmacy_count,
        "max_pharmacies": plan.max_pharmacies or 1,
        "storage_used_mb": storage_used_mb,
        "storage_limit_mb": storage_limit_mb,
        "subscription_status": subscription_model.status,
        "subscription_end_date": subscription_model.end_date
    }