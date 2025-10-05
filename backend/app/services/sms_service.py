from typing import Dict, Any, Optional, List
import json
from sqlalchemy.orm import Session

try:
    from twilio.rest import Client
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False

from ..models import User, NotificationSettings


class SMSNotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.settings = self._get_sms_settings()
    
    def _get_sms_settings(self) -> Dict[str, Any]:
        """Get SMS settings from database"""
        settings = self.db.query(NotificationSettings).first()
        if not settings:
            # Return default settings
            return {
                "enabled": False,
                "provider": "twilio",
                "api_key": "",
                "api_secret": "",
                "sender_id": "PHARM",
                "use_test_mode": True
            }
        
        return json.loads(settings.sms_settings or "{}")
    
    def send_sms(self, to_phone: str, message: str) -> Dict[str, Any]:
        """Send SMS notification"""
        if not self.settings.get("enabled", False):
            return {
                "success": False,
                "message": "SMS notifications are disabled"
            }
        
        provider = self.settings.get("provider", "twilio")
        
        if provider == "twilio":
            return self._send_twilio_sms(to_phone, message)
        else:
            return {
                "success": False,
                "message": f"Unsupported SMS provider: {provider}"
            }
    
    def _send_twilio_sms(self, to_phone: str, message: str) -> Dict[str, Any]:
        """Send SMS via Twilio"""
        if not TWILIO_AVAILABLE:
            return {
                "success": False,
                "message": "Twilio library not installed"
            }
        
        api_key = self.settings.get("api_key", "")
        api_secret = self.settings.get("api_secret", "")
        sender_id = self.settings.get("sender_id", "PHARM")
        
        if not api_key or not api_secret:
            return {
                "success": False,
                "message": "Twilio API credentials not configured"
            }
        
        # In test mode, just return success without actually sending
        if self.settings.get("use_test_mode", True):
            return {
                "success": True,
                "message": f"SMS sent to {to_phone} (test mode)",
                "test_mode": True
            }
        
        try:
            client = Client(api_key, api_secret)
            
            message_obj = client.messages.create(
                body=message,
                from_=sender_id,
                to=to_phone
            )
            
            return {
                "success": True,
                "message": "SMS sent successfully",
                "message_id": message_obj.sid
            }
        
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to send SMS: {str(e)}"
            }
    
    def send_otp_sms(self, user: User, otp_code: str) -> Dict[str, Any]:
        """Send OTP code via SMS"""
        if not user.phone:
            return {
                "success": False,
                "message": "User phone number not available"
            }
        
        message = f"Your OTP code for Pharmacy Management System login is: {otp_code}. This code will expire in 5 minutes. Do not share this code with anyone."
        
        return self.send_sms(user.phone, message)
    
    def send_low_stock_alert_sms(self, medicine_name: str, current_stock: int, reorder_level: int) -> Dict[str, Any]:
        """Send low stock alert via SMS"""
        message = f"Low Stock Alert: {medicine_name} has only {current_stock} units left (reorder level: {reorder_level}). Please restock soon."
        
        # Get admin users with phone numbers
        admin_users = self.db.query(User).filter(
            User.role == "ADMIN",
            User.phone.isnot(None)
        ).all()
        
        results = []
        
        for admin in admin_users:
            result = self.send_sms(admin.phone, message)
            results.append({
                "phone": admin.phone,
                "result": result
            })
        
        return {
            "success": True,
            "message": f"Low stock alert sent via SMS to {len(results)} admin(s)",
            "details": results
        }
    
    def send_expiry_alert_sms(self, medicine_name: str, batch_number: str, expiry_date: str) -> Dict[str, Any]:
        """Send medicine expiry alert via SMS"""
        message = f"Expiry Alert: {medicine_name} (Batch: {batch_number}) expires on {expiry_date}. Please take appropriate action."
        
        # Get admin users with phone numbers
        admin_users = self.db.query(User).filter(
            User.role == "ADMIN",
            User.phone.isnot(None)
        ).all()
        
        results = []
        
        for admin in admin_users:
            result = self.send_sms(admin.phone, message)
            results.append({
                "phone": admin.phone,
                "result": result
            })
        
        return {
            "success": True,
            "message": f"Expiry alert sent via SMS to {len(results)} admin(s)",
            "details": results
        }
    
    def send_appointment_reminder_sms(self, patient_phone: str, patient_name: str, appointment_date: str, appointment_time: str) -> Dict[str, Any]:
        """Send appointment reminder via SMS"""
        message = f"Dear {patient_name}, this is a reminder for your appointment on {appointment_date} at {appointment_time}. Thank you!"
        
        return self.send_sms(patient_phone, message)
    
    def send_prescription_ready_sms(self, patient_phone: str, patient_name: str, prescription_id: str) -> Dict[str, Any]:
        """Send prescription ready notification via SMS"""
        message = f"Dear {patient_name}, your prescription #{prescription_id} is ready for pickup. Thank you!"
        
        return self.send_sms(patient_phone, message)
    
    def send_payment_confirmation_sms(self, patient_phone: str, patient_name: str, invoice_number: str, amount: float) -> Dict[str, Any]:
        """Send payment confirmation via SMS"""
        message = f"Dear {patient_name}, payment of ${amount:.2f} for invoice #{invoice_number} has been received. Thank you!"
        
        return self.send_sms(patient_phone, message)