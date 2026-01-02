from datetime import timedelta, datetime
from typing import List
import os
import uuid
import secrets
import pyotp

try:
    from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
    from fastapi.security import HTTPBearer
except ImportError:
    print("FastAPI import error - please ensure FastAPI is installed")
    raise


from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import User, AuditLog
from ..schemas.auth import (
    User as UserSchema, UserCreate, UserUpdate, LoginRequest, Token, RefreshTokenRequest,
    PasswordChange, StaffLoginRequest, StaffLoginResponse, ProfileImageUpload,
    ForgotPassword, ResetPassword,
    OTPLoginRequest, OTPLoginResponse, SendOTPRequest, VerifyOTPRequest
)
from ..utils.auth import (
    authenticate_user, authenticate_staff, create_access_token, create_refresh_token, verify_token,
    get_password_hash, get_current_active_user, require_admin
)
from ..config import settings
from ..services.notification_service import EmailNotificationService
from ..services.sms_service import SMSNotificationService

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=UserSchema)
async def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    # Check if user already exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )

    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        hashed_password=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create audit log
    audit_log = AuditLog(
        user_id=db_user.id,
        action="CREATE",
        resource_type="USER",
        resource_id=db_user.id,
        new_values=f"Created user {user.username}"
    )
    db.add(audit_log)
    db.commit()

    return db_user

@router.get("/test")
async def test_auth():
    return {"message": "Auth router working"}

@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Proceed with normal login
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.username})

    # Update last login
    user.last_login = func.now()
    db.commit()

    # Create audit log
    try:
        audit_log = AuditLog(
            user_id=user.id,
            action="LOGIN",
            resource_type="USER",
            resource_id=user.id,
            new_values=f"User {user.username} logged in"
        )
        db.add(audit_log)
        db.commit()
    except Exception as e:
        print(f"Error creating audit log: {e}")
        # Continue without audit log
        pass

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    token_data = verify_token(refresh_data.refresh_token, token_type="refresh")
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.username})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.put("/me", response_model=UserSchema)
async def update_user_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Store old values for audit
    old_values = {
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone
    }
    
    # Update user fields if provided
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    # Create audit log
    new_values = {
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone
    }
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action="UPDATE",
        resource_type="USER",
        resource_id=current_user.id,
        old_values=str(old_values),
        new_values=str(new_values)
    )
    db.add(audit_log)
    db.commit()
    
    return current_user

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Verify current password
    if not authenticate_user(db, current_user.username, password_data.current_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="PASSWORD_CHANGE",
        resource_type="USER",
        resource_id=current_user.id,
        new_values=f"Password changed for user {current_user.username}"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.get("/users", response_model=List[UserSchema])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Store old values for audit
    old_values = {
        "username": db_user.username,
        "email": db_user.email,
        "full_name": db_user.full_name,
        "phone": db_user.phone,
        "role": db_user.role,
        "is_active": db_user.is_active
    }

    # Update user fields if provided
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)

    # Create audit log
    new_values = {
        "username": db_user.username,
        "email": db_user.email,
        "full_name": db_user.full_name,
        "phone": db_user.phone,
        "role": db_user.role,
        "is_active": db_user.is_active
    }

    audit_log = AuditLog(
        user_id=current_user.id,
        action="UPDATE",
        resource_type="USER",
        resource_id=db_user.id,
        old_values=str(old_values),
        new_values=str(new_values)
    )
    db.add(audit_log)
    db.commit()

    return db_user

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Don't allow users to delete themselves
    if db_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    # Store user info for audit
    user_info = {
        "username": db_user.username,
        "email": db_user.email,
        "full_name": db_user.full_name
    }

    # Delete user
    db.delete(db_user)
    db.commit()

    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="DELETE",
        resource_type="USER",
        resource_id=user_id,
        old_values=str(user_info),
        new_values="User deleted"
    )
    db.add(audit_log)
    db.commit()

    return {"message": "User deleted successfully"}

@router.patch("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Don't allow users to deactivate themselves
    if db_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own status")

    # Toggle user status
    old_status = db_user.is_active
    db_user.is_active = not db_user.is_active
    db.commit()
    db.refresh(db_user)

    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="STATUS_TOGGLE",
        resource_type="USER",
        resource_id=user_id,
        old_values=f"User was {'active' if old_status else 'inactive'}",
        new_values=f"User is now {'active' if db_user.is_active else 'inactive'}"
    )
    db.add(audit_log)
    db.commit()

    return {"message": f"User is now {'active' if db_user.is_active else 'inactive'}"}

@router.post("/staff-login", response_model=StaffLoginResponse)
async def staff_login(
    login_data: StaffLoginRequest,
    db: Session = Depends(get_db)
):
    user = authenticate_staff(db, login_data.username, login_data.pin)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or PIN",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    # Update last login
    user.last_login = func.now()
    db.commit()

    # Create audit log
    try:
        audit_log = AuditLog(
            user_id=user.id,
            action="STAFF_LOGIN",
            resource_type="USER",
            resource_id=user.id,
            new_values=f"Staff {user.username} logged in with PIN"
        )
        db.add(audit_log)
        db.commit()
    except Exception as e:
        print(f"Error creating audit log: {e}")
        # Continue without audit log
        pass

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

# Profile image upload endpoint
@router.post("/upload-profile-image", response_model=UserSchema)
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if file is an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Create uploads directory if it doesn't exist
    uploads_dir = "uploads/profile_images"
    os.makedirs(uploads_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"{uploads_dir}/{unique_filename}"
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file: {str(e)}"
        )
    
    # Update user profile
    old_image = current_user.profile_image
    current_user.profile_image = f"/{file_path}"
    db.commit()
    db.refresh(current_user)
    
    # Delete old image if exists
    if old_image and old_image.startswith("/uploads/"):
        try:
            old_path = old_image.lstrip("/")
            if os.path.exists(old_path):
                os.remove(old_path)
        except Exception:
            pass  # Ignore errors when deleting old file
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="UPDATE",
        resource_type="USER",
        resource_id=current_user.id,
        new_values=f"Profile image updated for user {current_user.username}"
    )
    db.add(audit_log)
    db.commit()
    
    return current_user


# Forgot password endpoints
@router.post("/forgot-password")
async def forgot_password(
    request_data: ForgotPassword,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == request_data.email).first()
    
    if not user:
        # Don't reveal if email exists or not
        return {"message": "If your email is registered, you will receive a password reset link"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expiry_time = datetime.utcnow() + timedelta(hours=1)  # Token valid for 1 hour
    
    # Store reset token in database
    user.reset_token = reset_token
    user.reset_token_expires_at = expiry_time
    db.commit()
    
    # Send email with reset link
    email_service = EmailNotificationService(db)
    email_result = email_service.send_password_reset_email(user, reset_token)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=user.id,
        action="PASSWORD_RESET_REQUEST",
        resource_type="USER",
        resource_id=user.id,
        new_values=f"Password reset requested for user {user.username}"
    )
    db.add(audit_log)
    db.commit()
    
    return {
        "message": "If your email is registered, you will receive a password reset link",
        "email_sent": email_result.get("success", False),
        "email_message": email_result.get("message", ""),
        "reset_token": reset_token if not email_result.get("success", False) else None  # Only return token if email failed
    }

@router.post("/reset-password")
async def reset_password(
    request_data: ResetPassword,
    db: Session = Depends(get_db)
):
    # Find user by email
    user = db.query(User).filter(User.email == request_data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Validate reset token
    if not user.reset_token or user.reset_token != request_data.token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Check if token has expired
    if datetime.utcnow() > user.reset_token_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )
    
    # Update password
    user.hashed_password = get_password_hash(request_data.new_password)
    
    # Clear reset token
    user.reset_token = None
    user.reset_token_expires_at = None
    db.commit()
    
    # Create audit log
    audit_log = AuditLog(
        user_id=user.id,
        action="PASSWORD_RESET",
        resource_type="USER",
        resource_id=user.id,
        new_values=f"Password reset completed for user {user.username}"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Password reset successfully"}

# OTP Login endpoints
@router.post("/send-otp", response_model=dict)
async def send_otp(
    request_data: SendOTPRequest,
    db: Session = Depends(get_db)
):
    """Send OTP to user for login"""
    user = authenticate_user(db, request_data.username, request_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Generate OTP
    otp_code = f"{secrets.randbelow(1000000):06d}"  # 6-digit OTP
    otp_secret = pyotp.random_base32()
    
    # Store OTP in database
    user.otp_code = otp_code
    user.otp_secret = otp_secret
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=5)  # OTP valid for 5 minutes
    db.commit()
    
    # Send OTP via email
    email_service = EmailNotificationService(db)
    email_result = email_service.send_otp_email(user, otp_code)
    
    # Send OTP via SMS if user has a phone number
    sms_result = {"success": False, "message": "No phone number provided"}
    if user.phone:
        sms_service = SMSNotificationService(db)
        sms_result = sms_service.send_otp_sms(user, otp_code)
    
    # Create audit log
    audit_log = AuditLog(
        user_id=user.id,
        action="OTP_SENT",
        resource_type="USER",
        resource_id=user.id,
        new_values=f"OTP sent to user {user.username} via email and SMS"
    )
    db.add(audit_log)
    db.commit()
    
    return {
        "message": "OTP sent successfully",
        "email_sent": email_result.get("success", False),
        "email_message": email_result.get("message", ""),
        "sms_sent": sms_result.get("success", False),
        "sms_message": sms_result.get("message", ""),
        "otp_code": otp_code if not email_result.get("success", False) and not sms_result.get("success", False) else None,  # Only return OTP if both failed
        "expires_at": user.otp_expires_at.isoformat() if user.otp_expires_at else None
    }

@router.post("/verify-otp", response_model=Token)
async def verify_otp(
    request_data: VerifyOTPRequest,
    db: Session = Depends(get_db)
):
    """Verify OTP and complete login"""
    user = db.query(User).filter(User.username == request_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Check if OTP is valid
    if not user.otp_code or not user.otp_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP request found"
        )
    
    # Check if OTP has expired
    if datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired"
        )
    
    # Verify OTP
    if user.otp_code != request_data.otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    # Clear OTP after successful verification
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    
    # Generate tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.username})
    
    # Update last login
    user.last_login = func.now()
    db.commit()
    
    # Create audit log
    audit_log = AuditLog(
        user_id=user.id,
        action="LOGIN_OTP",
        resource_type="USER",
        resource_id=user.id,
        new_values=f"User {user.username} logged in with OTP"
    )
    db.add(audit_log)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/login-otp", response_model=OTPLoginResponse)
async def login_with_otp(
    login_data: OTPLoginRequest,
    db: Session = Depends(get_db)
):
    """Login with optional OTP verification"""
    try:
        user = authenticate_user(db, login_data.username, login_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user has OTP enabled
        if user.otp_enabled:
            # If OTP is enabled but no code provided, return that OTP is required
            if not login_data.otp_code:
                return {
                    "requires_otp": True,
                    "user": None
                }
            
            # Verify OTP code
            if not user.otp_secret:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="OTP not set up for this user"
                )
            
            totp = pyotp.TOTP(user.otp_secret)
            if not totp.verify(login_data.otp_code):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid OTP code"
                )
        
        # Generate tokens
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(data={"sub": user.username})
        
        # Update last login
        user.last_login = func.now()
        db.commit()
        
        # Create audit log
        try:
            audit_log = AuditLog(
                user_id=user.id,
                action="LOGIN_OTP",
                resource_type="USER",
                resource_id=user.id,
                new_values=f"User {user.username} logged in with OTP"
            )
            db.add(audit_log)
            db.commit()
        except Exception as e:
            print(f"Error creating audit log: {e}")
            # Continue without audit log
            pass
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "requires_otp": False,
            "user": user
        }
    except Exception as e:
        print(f"OTP login error: {e}")
        raise

@router.post("/setup-otp")
async def setup_otp(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Setup OTP for user"""
    # Generate secret key
    secret = pyotp.random_base32()
    
    # Store secret
    current_user.otp_secret = secret
    current_user.otp_enabled = True
    db.commit()
    
    # Generate provisioning URI
    provisioning_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=current_user.email,
        issuer_name="Pharmacy Management System"
    )
    
    return {
        "secret": secret,
        "provisioning_uri": provisioning_uri,
        "qr_code": provisioning_uri  # In a real implementation, you would generate a QR code image
    }

@router.post("/disable-otp")
async def disable_otp(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Disable OTP for user"""
    if not current_user.otp_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP not enabled"
        )
    
    # Disable OTP
    current_user.otp_enabled = False
    current_user.otp_secret = None
    current_user.otp_code = None
    current_user.otp_expires_at = None
    db.commit()
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="UPDATE",
        resource_type="USER",
        resource_id=current_user.id,
        new_values=f"OTP disabled for user {current_user.username}"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "OTP disabled successfully"}
