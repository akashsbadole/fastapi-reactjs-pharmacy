from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import User, UserRole
from ..schemas.auth import TokenData

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token handling
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Truncate password to 72 bytes if longer (bcrypt limitation)
    if len(plain_password.encode('utf-8')) > 72:
        plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    # Truncate password to 72 bytes if longer (bcrypt limitation)
    if len(password.encode('utf-8')) > 72:
        password = password[:72]
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    print(f"Creating access token with data: {to_encode}")
    print(f"Using secret key: {settings.SECRET_KEY[:10]}...")
    print(f"Algorithm: {settings.ALGORITHM}")
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    print(f"Created access token: {encoded_jwt[:10]}...")
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    print(f"Creating refresh token with data: {to_encode}")
    print(f"Using secret key: {settings.SECRET_KEY[:10]}...")
    print(f"Algorithm: {settings.ALGORITHM}")
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    print(f"Created refresh token: {encoded_jwt[:10]}...")
    return encoded_jwt

def verify_token(token: str, token_type: str = "access") -> Optional[TokenData]:
    # Check for placeholder tokens that shouldn't be validated
    if token == "2FA_REQUIRED":
        print("Received placeholder token '2FA_REQUIRED' instead of actual JWT")
        return None
        
    if not token or "." not in token:
        print("Invalid token format - token must contain at least one period")
        return None
        
    try:
        print(f"Verifying token: {token[:10]}...")
        print(f"Using secret key: {settings.SECRET_KEY[:10]}...")
        print(f"Algorithm: {settings.ALGORITHM}")
        
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        tenant_id: int = payload.get("tenant_id")
        
        print(f"Token payload: {payload}")
        
        if token_type == "refresh" and payload.get("type") != "refresh":
            print("Token type mismatch")
            return None
            
        if username is None:
            print("No username in token")
            return None
            
        token_data = TokenData(username=username, tenant_id=tenant_id)
        return token_data
    except JWTError as e:
        print(f"JWT error: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error verifying token: {e}")
        return None

def authenticate_user(db: Session, username: str, password: str, tenant_id: int = None) -> Union[bool, User]:
    if tenant_id:
        user = db.query(User).filter(
            User.username == username,
            User.tenant_id == tenant_id
        ).first()
    else:
        user = db.query(User).filter(User.username == username).first()
    
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def authenticate_staff(db: Session, username: str, pin: str, tenant_id: int = None) -> Union[bool, User]:
    if tenant_id:
        user = db.query(User).filter(
            User.username == username,
            User.tenant_id == tenant_id
        ).first()
    else:
        user = db.query(User).filter(User.username == username).first()
    
    if not user:
        return False
    if not user.pin:
        return False
    
    # Try to verify the PIN using bcrypt directly
    try:
        import bcrypt
        if bcrypt.checkpw(pin.encode('utf-8'), user.pin.encode('utf-8')):
            return user
    except Exception:
        # Fallback to the regular password verification if bcrypt fails
        if verify_password(pin, user.pin):
            return user
    
    return False

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        
        # Check for placeholder tokens
        if token == "2FA_REQUIRED":
            print("Received placeholder token '2FA_REQUIRED' in get_current_user")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Two-factor authentication required. Please complete 2FA verification.",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        token_data = verify_token(token)
        if token_data is None:
            raise credentials_exception
            
        user = db.query(User).filter(
            User.username == token_data.username,
            User.tenant_id == token_data.tenant_id
        ).first()
        if user is None:
            raise credentials_exception
            
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
            
        return user
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Authentication error: {e}")
        raise credentials_exception

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Role-based access control
def require_role(allowed_roles: list):
    def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

# Common role dependencies
require_admin = require_role([UserRole.ADMIN])
require_pharmacist = require_role([UserRole.ADMIN, UserRole.PHARMACIST])
require_cashier = require_role([UserRole.ADMIN, UserRole.PHARMACIST, UserRole.CASHIER])
require_doctor = require_role([UserRole.ADMIN, UserRole.PHARMACIST, UserRole.DOCTOR])