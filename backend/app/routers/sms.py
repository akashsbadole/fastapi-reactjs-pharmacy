from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from ..database import get_db
from ..models import User
from ..utils.auth import get_current_active_user
from ..services.sms_service import SMSNotificationService

router = APIRouter()

class SMSTestRequest(BaseModel):
    phone: Optional[str] = None
    message: str

class SMSOTPTestRequest(BaseModel):
    username: str

@router.post("/test-sms")
async def test_sms(
    request: SMSTestRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Test SMS functionality"""
    sms_service = SMSNotificationService(db)
    
    # Use provided phone number or current user's phone
    phone_number = request.phone or current_user.phone
    
    if not phone_number:
        raise HTTPException(
            status_code=400,
            detail="No phone number provided"
        )
    
    result = sms_service.send_sms(
        phone_number=phone_number,
        message=request.message
    )
    
    return {
        "success": result.get("success", False),
        "message": result.get("message", ""),
        "phone": phone_number
    }

@router.post("/test-otp-sms")
async def test_otp_sms(
    request: SMSOTPTestRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Test OTP SMS functionality"""
    user = db.query(User).filter(User.username == request.username).first()
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    # Generate a test OTP
    import secrets
    otp_code = f"{secrets.randbelow(1000000):06d}"
    
    sms_service = SMSNotificationService(db)
    result = sms_service.send_otp_sms(user, otp_code)
    
    return {
        "success": result.get("success", False),
        "message": result.get("message", ""),
        "user": user.username,
        "phone": user.phone,
        "otp_code": otp_code if not result.get("success", False) else None  # Only return OTP if SMS failed
    }

@router.get("/sms-status")
async def get_sms_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get SMS service status"""
    from ..config import settings
    
    return {
        "sms_enabled": settings.SMS_ENABLED,
        "twilio_configured": bool(settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_PHONE_NUMBER),
        "test_mode": settings.SMS_TEST_MODE,
        "user_phone": current_user.phone
    }