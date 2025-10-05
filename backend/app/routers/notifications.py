from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from ..models import User, Notification
from ..utils.auth import get_current_active_user
from ..services.notification_service import NotificationManager

router = APIRouter(prefix="/notifications", tags=["notifications"])

# Pydantic models for request/response
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: str
    read_at: Optional[str] = None
    
    class Config:
        from_attributes = True

class SendNotificationRequest(BaseModel):
    title: str
    message: str
    type: str
    recipient_id: Optional[int] = None
    send_email: bool = False
    recipient_email: Optional[str] = None

class MarkAsReadRequest(BaseModel):
    notification_id: int

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    unread_only: bool = Query(False, description="Filter unread notifications only"),
    limit: int = Query(50, description="Maximum number of notifications to return"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get notifications for the current user"""
    notification_manager = NotificationManager(db)
    notifications = notification_manager.get_user_notifications(
        current_user.id,
        unread_only=unread_only,
        limit=limit
    )
    
    return [
        NotificationResponse(
            id=notification.id,
            title=notification.title,
            message=notification.message,
            type=notification.type,
            is_read=notification.is_read,
            created_at=notification.created_at.isoformat() if notification.created_at else None,
            read_at=notification.read_at.isoformat() if notification.read_at else None
        )
        for notification in notifications
    ]

@router.post("/send")
async def send_notification(
    request: SendNotificationRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Send a notification to users"""
    # Only admin users can send notifications
    if current_user.role.value != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can send notifications"
        )
    
    notification_manager = NotificationManager(db)
    result = notification_manager.send_notification(
        title=request.title,
        message=request.message,
        notification_type=request.type,
        recipient_id=request.recipient_id,
        send_email=request.send_email,
        recipient_email=request.recipient_email
    )
    
    return result

@router.post("/mark-as-read")
async def mark_notification_as_read(
    request: MarkAsReadRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    notification_manager = NotificationManager(db)
    success = notification_manager.mark_notification_as_read(
        request.notification_id,
        current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"message": "Notification marked as read"}

@router.post("/mark-all-as-read")
async def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read for the current user"""
    notification_manager = NotificationManager(db)
    count = notification_manager.mark_all_notifications_as_read(current_user.id)
    
    return {"message": f"Marked {count} notifications as read"}

@router.get("/unread-count")
async def get_unread_notifications_count(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get count of unread notifications for the current user"""
    count = db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    return {"unread_count": count}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a notification"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.recipient_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted successfully"}