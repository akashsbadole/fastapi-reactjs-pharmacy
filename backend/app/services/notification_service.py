import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import List, Dict, Any, Optional
import os
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from ..models import User, NotificationSettings, Notification
from ..database import get_db


class EmailNotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.settings = self._get_email_settings()
    
    def _get_email_settings(self) -> Dict[str, Any]:
        """Get email settings from database"""
        settings = self.db.query(NotificationSettings).first()
        if not settings:
            # Return default settings
            return {
                "enabled": False,
                "smtp_server": "",
                "smtp_port": 587,
                "username": "",
                "password": "",
                "use_ssl": True,
                "sender_email": "noreply@pharmacy.com",
                "sender_name": "Pharmacy Management System"
            }
        
        return json.loads(settings.email_settings or "{}")
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        is_html: bool = False,
        attachments: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Send email notification"""
        if not self.settings.get("enabled", False):
            return {
                "success": False,
                "message": "Email notifications are disabled"
            }
        
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.settings.get('sender_name', 'Pharmacy System')} <{self.settings.get('sender_email', 'noreply@pharmacy.com')}>"
            msg["To"] = to_email
            
            # Add body
            if is_html:
                html_part = MIMEText(body, "html")
                msg.attach(html_part)
            else:
                text_part = MIMEText(body, "plain")
                msg.attach(text_part)
            
            # Add attachments if provided
            if attachments:
                for file_path in attachments:
                    if os.path.exists(file_path):
                        with open(file_path, "rb") as attachment:
                            part = MIMEBase("application", "octet-stream")
                            part.set_payload(attachment.read())
                        
                        encoders.encode_base64(part)
                        part.add_header(
                            "Content-Disposition",
                            f"attachment; filename= {os.path.basename(file_path)}"
                        )
                        msg.attach(part)
            
            # Connect to SMTP server and send email
            server = smtplib.SMTP(
                self.settings.get("smtp_server", ""),
                self.settings.get("smtp_port", 587)
            )
            
            if self.settings.get("use_ssl", True):
                server.starttls()
            
            server.login(
                self.settings.get("username", ""),
                self.settings.get("password", "")
            )
            
            server.send_message(msg)
            server.quit()
            
            return {
                "success": True,
                "message": "Email sent successfully"
            }
        
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to send email: {str(e)}"
            }
    
    def send_welcome_email(self, user: User) -> Dict[str, Any]:
        """Send welcome email to new user"""
        subject = "Welcome to Pharmacy Management System"
        body = f"""
        Dear {user.full_name},
        
        Welcome to the Pharmacy Management System! Your account has been created successfully.
        
        Username: {user.username}
        Email: {user.email}
        
        Please keep your login credentials secure and do not share them with anyone.
        
        If you have any questions or need assistance, please contact our support team.
        
        Best regards,
        Pharmacy Management System Team
        """
        
        return self.send_email(user.email, subject, body)
    
    def send_password_reset_email(self, user: User, reset_token: str) -> Dict[str, Any]:
        """Send password reset email"""
        subject = "Password Reset Request"
        body = f"""
        Dear {user.full_name},
        
        We received a request to reset your password for your Pharmacy Management System account.
        
        Please click the link below to reset your password:
        http://localhost:3000/reset-password?token={reset_token}
        
        This link will expire in 1 hour for security reasons.
        
        If you did not request a password reset, please ignore this email and your password will remain unchanged.
        
        Best regards,
        Pharmacy Management System Team
        """
        
        return self.send_email(user.email, subject, body)
    
    def send_otp_email(self, user: User, otp_code: str) -> Dict[str, Any]:
        """Send OTP code via email"""
        subject = "Your OTP Code for Login"
        body = f"""
        Dear {user.full_name},
        
        Your One-Time Password (OTP) for logging into the Pharmacy Management System is:
        
        {otp_code}
        
        This OTP will expire in 5 minutes for security reasons.
        
        Please do not share this OTP with anyone.
        
        Best regards,
        Pharmacy Management System Team
        """
        
        return self.send_email(user.email, subject, body)
    
    def send_low_stock_alert(self, medicine_name: str, current_stock: int, reorder_level: int) -> Dict[str, Any]:
        """Send low stock alert email"""
        subject = f"Low Stock Alert: {medicine_name}"
        body = f"""
        Dear Pharmacy Manager,
        
        This is to inform you that the following medicine is running low on stock:
        
        Medicine: {medicine_name}
        Current Stock: {current_stock}
        Reorder Level: {reorder_level}
        
        Please take appropriate action to replenish the stock.
        
        Best regards,
        Pharmacy Management System
        """
        
        # Get admin users to send alert
        admin_users = self.db.query(User).filter(User.role == "ADMIN").all()
        results = []
        
        for admin in admin_users:
            if admin.email:
                result = self.send_email(admin.email, subject, body)
                results.append({
                    "email": admin.email,
                    "result": result
                })
        
        return {
            "success": True,
            "message": f"Low stock alert sent to {len(results)} admin(s)",
            "details": results
        }
    
    def send_expiry_alert(self, medicine_name: str, batch_number: str, expiry_date: str) -> Dict[str, Any]:
        """Send medicine expiry alert email"""
        subject = f"Medicine Expiry Alert: {medicine_name}"
        body = f"""
        Dear Pharmacy Manager,
        
        This is to inform you that the following medicine is expiring soon:
        
        Medicine: {medicine_name}
        Batch: {batch_number}
        Expiry Date: {expiry_date}
        
        Please take appropriate action.
        
        Best regards,
        Pharmacy Management System
        """
        
        # Get admin users to send alert
        admin_users = self.db.query(User).filter(User.role == "ADMIN").all()
        results = []
        
        for admin in admin_users:
            if admin.email:
                result = self.send_email(admin.email, subject, body)
                results.append({
                    "email": admin.email,
                    "result": result
                })
        
        return {
            "success": True,
            "message": f"Expiry alert sent to {len(results)} admin(s)",
            "details": results
        }
    
    def send_invoice_email(self, user_email: str, invoice_number: str, invoice_path: str) -> Dict[str, Any]:
        """Send invoice via email"""
        subject = f"Invoice {invoice_number}"
        body = f"""
        Dear Customer,
        
        Please find attached your invoice {invoice_number}.
        
        Thank you for your business!
        
        Best regards,
        Pharmacy Management System
        """
        
        return self.send_email(
            user_email,
            subject,
            body,
            attachments=[invoice_path] if os.path.exists(invoice_path) else None
        )


class NotificationManager:
    def __init__(self, db: Session):
        self.db = db
        self.email_service = EmailNotificationService(db)
    
    def create_notification(
        self,
        title: str,
        message: str,
        notification_type: str,
        recipient_id: Optional[int] = None
    ) -> Notification:
        """Create a notification in the database"""
        notification = Notification(
            title=title,
            message=message,
            type=notification_type,
            recipient_id=recipient_id
        )
        
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        
        return notification
    
    def send_notification(
        self,
        title: str,
        message: str,
        notification_type: str,
        recipient_id: Optional[int] = None,
        send_email: bool = False,
        recipient_email: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send notification (in-app and optionally email)"""
        result = {
            "in_app": None,
            "email": None
        }
        
        # Create in-app notification
        notification = self.create_notification(title, message, notification_type, recipient_id)
        result["in_app"] = {
            "success": True,
            "notification_id": notification.id
        }
        
        # Send email if requested
        if send_email and recipient_email:
            email_result = self.email_service.send_email(recipient_email, title, message)
            result["email"] = email_result
        
        return result
    
    def get_user_notifications(
        self,
        user_id: int,
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Notification]:
        """Get notifications for a user"""
        query = self.db.query(Notification).filter(Notification.recipient_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        return query.order_by(Notification.created_at.desc()).limit(limit).all()
    
    def mark_notification_as_read(self, notification_id: int, user_id: int) -> bool:
        """Mark a notification as read"""
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.recipient_id == user_id
        ).first()
        
        if notification:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            self.db.commit()
            return True
        
        return False
    
    def mark_all_notifications_as_read(self, user_id: int) -> int:
        """Mark all notifications as read for a user"""
        count = self.db.query(Notification).filter(
            Notification.recipient_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True, "read_at": datetime.utcnow()})
        
        self.db.commit()
        return count