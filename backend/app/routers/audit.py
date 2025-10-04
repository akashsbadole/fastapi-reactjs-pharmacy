from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import User, AuditLog as AuditLogModel
from app.schemas.audit import AuditLogCreate, AuditLogResponse, AuditLogFilter
from app.utils.auth import get_current_active_user

router = APIRouter()

def create_audit_log_entry(
    db: Session, 
    user_id: int, 
    action: str, 
    resource_type: str, 
    resource_id: Optional[int] = None,
    old_values: Optional[str] = None,
    new_values: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> AuditLogModel:
    """Create an audit log entry"""
    db_audit_log = AuditLogModel(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        old_values=old_values,
        new_values=new_values,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(db_audit_log)
    db.commit()
    db.refresh(db_audit_log)
    return db_audit_log

@router.post("/", response_model=AuditLogResponse)
async def create_audit_log(
    audit_log: AuditLogCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new audit log entry"""
    # Get client IP address
    client_ip = request.client.host if request.client else None
    
    # Get user agent
    user_agent = request.headers.get("user-agent")
    
    db_audit_log = create_audit_log_entry(
        db=db,
        user_id=audit_log.user_id,
        action=audit_log.action,
        resource_type=audit_log.resource_type,
        resource_id=audit_log.resource_id,
        old_values=audit_log.old_values,
        new_values=audit_log.new_values,
        ip_address=client_ip,
        user_agent=user_agent
    )
    
    # Get user information for response
    user = db.query(User).filter(User.id == db_audit_log.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": db_audit_log.id,
        "user_id": db_audit_log.user_id,
        "action": db_audit_log.action,
        "resource_type": db_audit_log.resource_type,
        "resource_id": db_audit_log.resource_id,
        "old_values": db_audit_log.old_values,
        "new_values": db_audit_log.new_values,
        "ip_address": db_audit_log.ip_address,
        "user_agent": db_audit_log.user_agent,
        "created_at": db_audit_log.created_at,
        "username": user.username,
        "full_name": user.full_name
    }

@router.get("/", response_model=List[AuditLogResponse])
async def get_audit_logs(
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    action: Optional[str] = Query(None, description="Filter by action"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    resource_id: Optional[int] = Query(None, description="Filter by resource ID"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get audit logs with optional filters"""
    query = db.query(AuditLogModel, User).join(User)
    
    if user_id:
        query = query.filter(AuditLogModel.user_id == user_id)
    
    if action:
        query = query.filter(AuditLogModel.action.ilike(f"%{action}%"))
    
    if resource_type:
        query = query.filter(AuditLogModel.resource_type.ilike(f"%{resource_type}%"))
    
    if resource_id:
        query = query.filter(AuditLogModel.resource_id == resource_id)
    
    if start_date:
        query = query.filter(AuditLogModel.created_at >= start_date)
    
    if end_date:
        query = query.filter(AuditLogModel.created_at <= end_date)
    
    # Order by created_at descending (most recent first)
    query = query.order_by(AuditLogModel.created_at.desc())
    
    # Apply pagination
    audit_logs = query.offset(skip).limit(limit).all()
    
    # Convert to response format
    result = []
    for audit_log, user in audit_logs:
        result.append({
            "id": audit_log.id,
            "user_id": audit_log.user_id,
            "action": audit_log.action,
            "resource_type": audit_log.resource_type,
            "resource_id": audit_log.resource_id,
            "old_values": audit_log.old_values,
            "new_values": audit_log.new_values,
            "ip_address": audit_log.ip_address,
            "user_agent": audit_log.user_agent,
            "created_at": audit_log.created_at,
            "username": user.username,
            "full_name": user.full_name
        })
    
    return result

@router.get("/actions", response_model=List[str])
async def get_audit_actions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get distinct audit actions"""
    actions = db.query(AuditLogModel.action).distinct().all()
    return [action[0] for action in actions]

@router.get("/resource-types", response_model=List[str])
async def get_audit_resource_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get distinct audit resource types"""
    resource_types = db.query(AuditLogModel.resource_type).distinct().all()
    return [resource_type[0] for resource_type in resource_types]

@router.get("/{audit_log_id}", response_model=AuditLogResponse)
async def get_audit_log(
    audit_log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific audit log by ID"""
    audit_log = db.query(AuditLogModel, User).join(User).filter(AuditLogModel.id == audit_log_id).first()
    
    if not audit_log:
        raise HTTPException(status_code=404, detail="Audit log not found")
    
    audit_log_model, user = audit_log
    
    return {
        "id": audit_log_model.id,
        "user_id": audit_log_model.user_id,
        "action": audit_log_model.action,
        "resource_type": audit_log_model.resource_type,
        "resource_id": audit_log_model.resource_id,
        "old_values": audit_log_model.old_values,
        "new_values": audit_log_model.new_values,
        "ip_address": audit_log_model.ip_address,
        "user_agent": audit_log_model.user_agent,
        "created_at": audit_log_model.created_at,
        "username": user.username,
        "full_name": user.full_name
    }