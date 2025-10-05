from datetime import datetime, timedelta
from typing import Dict, Any
import json
import secrets

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import get_db
from ..models import User, UserSubscription, SubscriptionPlan, SubscriptionInvoice
from ..utils.auth import get_current_active_user

router = APIRouter()

# Payment request models
class RazorpayPaymentRequest(BaseModel):
    plan_id: int
    payment_id: str
    order_id: str
    signature: str

class PayPalPaymentRequest(BaseModel):
    plan_id: int
    payment_id: str
    order_id: str
    payer_id: str

class SubscriptionPlanResponse(BaseModel):
    id: int
    name: str
    description: str
    price: int
    billing_cycle: str
    features: str
    is_active: bool

@router.get("/plans", response_model=list[SubscriptionPlanResponse])
async def get_subscription_plans(db: Session = Depends(get_db)):
    """Get all available subscription plans"""
    plans = db.query(SubscriptionPlan).filter(SubscriptionPlan.is_active == True).all()
    return plans

@router.post("/razorpay/create-order")
async def create_razorpay_order(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a Razorpay order for subscription payment"""
    # Get the subscription plan
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found"
        )
    
    # In a real implementation, you would integrate with Razorpay API
    # For now, we'll create a mock order
    order_id = f"order_{secrets.token_hex(16)}"
    
    # Store order details in session or database for verification
    # This is a simplified version - in production, you'd store more details
    
    return {
        "order_id": order_id,
        "amount": plan.price,  # Amount in paise for Razorpay
        "currency": "INR",
        "name": "Pharmacy Management System",
        "description": f"Subscription for {plan.name} Plan",
        "notes": {
            "user_id": current_user.id,
            "plan_id": plan_id,
        }
    }

@router.post("/razorpay/verify")
async def verify_razorpay_payment(
    payment_data: RazorpayPaymentRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Verify Razorpay payment and create subscription"""
    # In a real implementation, you would verify the signature with Razorpay
    # For now, we'll assume the payment is valid
    
    # Get the subscription plan
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == payment_data.plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found"
        )
    
    # Check if user already has an active subscription
    existing_subscription = db.query(UserSubscription).filter(
        UserSubscription.user_id == current_user.id,
        UserSubscription.status == "ACTIVE"
    ).first()
    
    if existing_subscription:
        # Update existing subscription
        existing_subscription.plan_id = plan.id
        existing_subscription.end_date = datetime.utcnow() + timedelta(days=30)
        existing_subscription.status = "ACTIVE"
        db.commit()
    else:
        # Create new subscription
        new_subscription = UserSubscription(
            user_id=current_user.id,
            plan_id=plan.id,
            status="ACTIVE",
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=30),
            auto_renew=True
        )
        db.add(new_subscription)
        db.commit()
    
    # Create invoice
    invoice = SubscriptionInvoice(
        user_id=current_user.id,
        subscription_id=new_subscription.id if 'new_subscription' in locals() else existing_subscription.id,
        invoice_number=f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{secrets.token_hex(4)}",
        amount=plan.price,
        due_date=datetime.utcnow(),
        status="PAID",
        description=f"Payment for {plan.name} Plan via Razorpay"
    )
    db.add(invoice)
    db.commit()
    
    return {"message": "Payment verified and subscription activated successfully"}

@router.post("/paypal/create-order")
async def create_paypal_order(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a PayPal order for subscription payment"""
    # Get the subscription plan
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found"
        )
    
    # Convert price to USD (rough conversion)
    amount_usd = round(plan.price / 75, 2)
    
    # In a real implementation, you would integrate with PayPal API
    # For now, we'll create a mock order
    order_id = f"PAYPAL-{secrets.token_hex(16)}"
    
    return {
        "order_id": order_id,
        "amount": str(amount_usd),
        "currency": "USD",
        "name": "Pharmacy Management System",
        "description": f"Subscription for {plan.name} Plan"
    }

@router.post("/paypal/verify")
async def verify_paypal_payment(
    payment_data: PayPalPaymentRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Verify PayPal payment and create subscription"""
    # In a real implementation, you would verify the payment with PayPal
    # For now, we'll assume the payment is valid
    
    # Get the subscription plan
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == payment_data.plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription plan not found"
        )
    
    # Check if user already has an active subscription
    existing_subscription = db.query(UserSubscription).filter(
        UserSubscription.user_id == current_user.id,
        UserSubscription.status == "ACTIVE"
    ).first()
    
    if existing_subscription:
        # Update existing subscription
        existing_subscription.plan_id = plan.id
        existing_subscription.end_date = datetime.utcnow() + timedelta(days=30)
        existing_subscription.status = "ACTIVE"
        db.commit()
    else:
        # Create new subscription
        new_subscription = UserSubscription(
            user_id=current_user.id,
            plan_id=plan.id,
            status="ACTIVE",
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=30),
            auto_renew=True
        )
        db.add(new_subscription)
        db.commit()
    
    # Create invoice
    invoice = SubscriptionInvoice(
        user_id=current_user.id,
        subscription_id=new_subscription.id if 'new_subscription' in locals() else existing_subscription.id,
        invoice_number=f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{secrets.token_hex(4)}",
        amount=plan.price,
        due_date=datetime.utcnow(),
        status="PAID",
        description=f"Payment for {plan.name} Plan via PayPal"
    )
    db.add(invoice)
    db.commit()
    
    return {"message": "Payment verified and subscription activated successfully"}

@router.get("/subscription")
async def get_user_subscription(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's subscription details"""
    subscription = db.query(UserSubscription).filter(
        UserSubscription.user_id == current_user.id,
        UserSubscription.status == "ACTIVE"
    ).first()
    
    if not subscription:
        return {"subscription": None}
    
    # Get plan details
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == subscription.plan_id).first()
    
    return {
        "subscription": {
            "id": subscription.id,
            "plan": {
                "id": plan.id,
                "name": plan.name,
                "description": plan.description,
                "features": json.loads(plan.features) if isinstance(plan.features, str) else plan.features
            },
            "status": subscription.status,
            "start_date": subscription.start_date,
            "end_date": subscription.end_date,
            "auto_renew": subscription.auto_renew
        }
    }

@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cancel user's subscription"""
    subscription = db.query(UserSubscription).filter(
        UserSubscription.user_id == current_user.id,
        UserSubscription.status == "ACTIVE"
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    # Set auto_renew to False
    subscription.auto_renew = False
    db.commit()
    
    return {"message": "Subscription cancelled successfully. You will continue to have access until the end of your billing period."}