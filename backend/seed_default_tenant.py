"""
Script to create a default tenant for the pharmacy management system.
This should be run after applying the multi-tenant migration.
"""

import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app.multi_tenant_models import Tenant, TenantSettings, TenantStatus, TenantPlan
from app.models import User, UserRole
from app.utils.auth import get_password_hash
from datetime import datetime, timedelta

def create_default_tenant():
    """
    Create a default tenant with admin user.
    """
    db = SessionLocal()
    try:
        # Check if default tenant already exists
        default_tenant = db.query(Tenant).filter(Tenant.slug == "default").first()
        if default_tenant:
            print("Default tenant already exists.")
            return default_tenant
        
        # Create default tenant
        default_tenant = Tenant(
            name="Default Pharmacy",
            slug="default",
            domain=None,
            status=TenantStatus.ACTIVE,
            plan=TenantPlan.ENTERPRISE,
            max_users=100,
            max_pharmacies=10,
            storage_limit_gb=100,
            subscription_start_date=datetime.utcnow(),
            subscription_end_date=datetime.utcnow() + timedelta(days=365),  # 1 year
            billing_email="admin@pharmacy.com",
            billing_address="Default Address",
            contact_person="System Administrator",
            contact_email="admin@pharmacy.com",
            contact_phone="1234567890"
        )
        
        db.add(default_tenant)
        db.commit()
        db.refresh(default_tenant)
        
        print(f"Created default tenant with ID: {default_tenant.id}")
        
        # Create default tenant settings
        tenant_settings = TenantSettings(
            tenant_id=default_tenant.id,
            settings_data={
                "organization": {
                    "store_name": "Default Pharmacy",
                    "address": "123 Main St",
                    "city": "Anytown",
                    "state": "CA",
                    "postal_code": "12345",
                    "country": "USA",
                    "phone": "+1-123-456-7890",
                    "email": "info@pharmacy.com",
                    "website": "www.pharmacy.com",
                    "tax_number": "123456789",
                    "gst_number": "123456789",
                    "currency": "USD",
                    "timezone": "America/New_York",
                    "date_format": "MM/DD/YYYY",
                    "time_format": "12-hour"
                },
                "pos": {
                    "payment_methods": ["CASH", "CARD", "INSURANCE"],
                    "barcode_scanning": True,
                    "receipt_layout": "default",
                    "default_discount": 0,
                    "tax_rate": 8.5
                },
                "inventory": {
                    "reorder_level": 10,
                    "expiry_alert_days": 30,
                    "low_stock_alert": True,
                    "batch_tracking": True,
                    "alternative_mapping": True
                },
                "notifications": {
                    "email_enabled": True,
                    "sms_enabled": False,
                    "expiry_alerts": True,
                    "low_stock_alerts": True,
                    "refill_reminders": True
                },
                "compliance": {
                    "schedule_h_tracking": True,
                    "prescription_validation": True,
                    "audit_log_retention_days": 365
                }
            }
        )
        
        db.add(tenant_settings)
        db.commit()
        
        print("Created default tenant settings")
        
        # Create default admin user
        admin_user = db.query(User).filter(
            User.username == "admin",
            User.tenant_id == default_tenant.id
        ).first()
        
        if not admin_user:
            admin_user = User(
                tenant_id=default_tenant.id,
                username="admin",
                email="admin@pharmacy.com",
                hashed_password=get_password_hash("admin123"),
                full_name="System Administrator",
                phone="1234567890",
                role=UserRole.ADMIN,
                is_active=True,
                pin="1234"  # Default PIN for POS
            )
            
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            
            print("Created default admin user (username: admin, password: admin123, PIN: 1234)")
        
        # Create additional default users
        default_users = [
            {
                "username": "pharmacist",
                "email": "pharmacist@pharmacy.com",
                "password": "pharm123",
                "full_name": "John Pharmacist",
                "phone": "1234567891",
                "role": UserRole.PHARMACIST,
                "pin": "5678"
            },
            {
                "username": "cashier",
                "email": "cashier@pharmacy.com",
                "password": "cash123",
                "full_name": "Jane Cashier",
                "phone": "1234567892",
                "role": UserRole.CASHIER,
                "pin": "9012"
            },
            {
                "username": "doctor",
                "email": "doctor@pharmacy.com",
                "password": "doc123",
                "full_name": "Dr. Smith",
                "phone": "1234567893",
                "role": UserRole.DOCTOR,
                "pin": "3456"
            }
        ]
        
        for user_data in default_users:
            existing_user = db.query(User).filter(
                User.username == user_data["username"],
                User.tenant_id == default_tenant.id
            ).first()
            
            if not existing_user:
                new_user = User(
                    tenant_id=default_tenant.id,
                    username=user_data["username"],
                    email=user_data["email"],
                    hashed_password=get_password_hash(user_data["password"]),
                    full_name=user_data["full_name"],
                    phone=user_data["phone"],
                    role=user_data["role"],
                    is_active=True,
                    pin=user_data["pin"]
                )
                
                db.add(new_user)
                db.commit()
                
                print(f"Created default {user_data['role'].value} user (username: {user_data['username']}, password: {user_data['password']}, PIN: {user_data['pin']})")
        
        print("\nDefault tenant setup completed successfully!")
        print("\nDefault credentials:")
        print("Admin: username=admin, password=admin123, PIN=1234")
        print("Pharmacist: username=pharmacist, password=pharm123, PIN=5678")
        print("Cashier: username=cashier, password=cash123, PIN=9012")
        print("Doctor: username=doctor, password=doc123, PIN=3456")
        
        return default_tenant
        
    except Exception as e:
        print(f"Error creating default tenant: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_default_tenant()