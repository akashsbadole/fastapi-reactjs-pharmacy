from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AuditLogBase(BaseModel):
    action: str
    resource_type: str
    resource_id: Optional[int] = None
    old_values: Optional[str] = None
    new_values: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    user_id: int

class AuditLogUpdate(AuditLogBase):
    pass

class AuditLog(AuditLogBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    resource_type: str
    resource_id: Optional[int] = None
    old_values: Optional[str] = None
    new_values: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    username: str
    full_name: str
    
    class Config:
        from_attributes = True

class AuditLogFilter(BaseModel):
    user_id: Optional[int] = None
    action: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    skip: int = 0
    limit: int = 100