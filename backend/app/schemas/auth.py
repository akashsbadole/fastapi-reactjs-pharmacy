try:
    from pydantic import BaseModel, EmailStr
except ImportError:
    from pydantic.v1 import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from ..models import UserRole

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CASHIER

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    profile_image: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None
    tenant_id: Optional[int] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class StaffLoginRequest(BaseModel):
    username: str
    pin: str

class StaffLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class ProfileImageUpload(BaseModel):
    profile_image: str


class ForgotPassword(BaseModel):
    email: str

class ResetPassword(BaseModel):
    email: str
    token: str
    new_password: str

class OTPLoginRequest(BaseModel):
    username: str
    password: str
    otp_code: Optional[str] = None

class OTPLoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    requires_otp: bool = False
    user: Optional[User] = None

class SendOTPRequest(BaseModel):
    username: str
    password: str

class VerifyOTPRequest(BaseModel):
    username: str
    otp_code: str