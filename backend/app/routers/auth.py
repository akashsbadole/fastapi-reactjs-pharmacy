from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from ..database import get_db
from ..models import User, AuditLog
from ..schemas.auth import User as UserSchema, UserCreate, UserUpdate, LoginRequest, Token, RefreshTokenRequest, PasswordChange, StaffLoginRequest, StaffLoginResponse
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