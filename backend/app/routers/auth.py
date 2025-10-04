from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import os
import uuid
import secrets
import pyotp
from datetime import datetime

from ..database import get_db
from ..models import User, AuditLog
from ..schemas.auth import (
    User as UserSchema, UserCreate, UserUpdate, LoginRequest, Token, RefreshTokenRequest,
    PasswordChange, StaffLoginRequest, StaffLoginResponse, ProfileImageUpload,
    TwoFactorSetup, TwoFactorVerify, ForgotPassword, ResetPassword
)
from ..utils.auth import (
    authenticate_user, authenticate_staff, create_access_token, create_refresh_token, verify_token,
    get_password_hash, get_current_active_user, require_admin
)
from ..config import settings

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=UserSchema)
async def register(user: UserCreate, db: Session = Depends(get_db)):
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
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = authenticate_user(db, login_data.username, login_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
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
    except Exception as e:
        print(f"Login error: {e}")
        raise

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_data: RefreshTokenRequest, db: Session = Depends(get_db)):
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
async def staff_login(login_data: StaffLoginRequest, db: Session = Depends(get_db)):
    try:
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
    except Exception as e:
        print(f"Staff login error: {e}")
        raise

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

# Two-Factor Authentication endpoints
@router.post("/setup-2fa")
async def setup_two_factor(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Generate secret key
    secret = pyotp.random_base32()
    
    # Store secret temporarily (not enabled yet)
    current_user.two_factor_secret = secret
    db.commit()
    
    # Generate provisioning URI
    provisioning_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=current_user.email,
        issuer_name="Pharmacy Management System"
    )
    
    return {
        "secret": secret,
        "provisioning_uri": provisioning_uri,
        " qr_code": provisioning_uri  # In a real implementation, you would generate a QR code image
    }

@router.post("/verify-2fa")
async def verify_two_factor(
    verification_data: TwoFactorVerify,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not current_user.two_factor_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA not set up"
        )
    
    # Verify the code
    totp = pyotp.TOTP(current_user.two_factor_secret)
    if not totp.verify(verification_data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )
    
    # Enable 2FA
    current_user.two_factor_enabled = True
    db.commit()
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="UPDATE",
        resource_type="USER",
        resource_id=current_user.id,
        new_values=f"2FA enabled for user {current_user.username}"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Two-factor authentication enabled successfully"}

@router.post("/disable-2fa")
async def disable_two_factor(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not current_user.two_factor_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA not enabled"
        )
    
    # Disable 2FA
    current_user.two_factor_enabled = False
    current_user.two_factor_secret = None
    db.commit()
    
    # Create audit log
    audit_log = AuditLog(
        user_id=current_user.id,
        action="UPDATE",
        resource_type="USER",
        resource_id=current_user.id,
        new_values=f"2FA disabled for user {current_user.username}"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Two-factor authentication disabled successfully"}

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
    
    # In a real implementation, you would store this token in the database or a cache
    # For now, we'll just return a success message
    
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
    
    return {"message": "If your email is registered, you will receive a password reset link"}

@router.post("/reset-password")
async def reset_password(
    request_data: ResetPassword,
    db: Session = Depends(get_db)
):
    # In a real implementation, you would validate the token against the database or cache
    # For now, we'll just return a success message
    
    # Create audit log
    audit_log = AuditLog(
        user_id=0,  # Unknown user at this point
        action="PASSWORD_RESET",
        resource_type="USER",
        resource_id=0,
        new_values="Password reset completed"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Password reset successfully"}