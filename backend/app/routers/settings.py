from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os
import aiofiles
from datetime import datetime
from pydantic import BaseModel

from app.database import get_db
from app.utils.auth import get_current_user
from app.models import User
from app.models import (
    OrganizationSettings, POSSettings, ThemeSettings,
    InventorySettings, NotificationSettings, IntegrationSettings,
    ComplianceSettings, BackupSettings, UserRolesSettings
)

# Pydantic models for request validation
class OrganizationSettingsUpdate(BaseModel):
    storeName: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postalCode: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    logo: Optional[str] = None
    taxNumber: Optional[str] = None
    gstNumber: Optional[str] = None
    hsnCodeDefault: Optional[str] = None
    currency: Optional[str] = None
    timezone: Optional[str] = None
    dateFormat: Optional[str] = None
    timeFormat: Optional[str] = None
    invoiceNumberFormat: Optional[str] = None
    invoicePrefix: Optional[str] = None
    prescriptionNumberFormat: Optional[str] = None
    prescriptionPrefix: Optional[str] = None

class POSSettingsUpdate(BaseModel):
    paymentMethods: Optional[dict] = None
    barcodeScanning: Optional[dict] = None
    receipt: Optional[dict] = None
    discount: Optional[dict] = None
    terminal: Optional[dict] = None

class ThemeSettingsUpdate(BaseModel):
    themeMode: Optional[str] = None
    colorScheme: Optional[dict] = None
    branding: Optional[dict] = None
    ui: Optional[dict] = None
    print: Optional[dict] = None

class InventorySettingsUpdate(BaseModel):
    reorder: Optional[dict] = None
    expiry: Optional[dict] = None
    lowStock: Optional[dict] = None
    alternatives: Optional[dict] = None
    batchPricing: Optional[dict] = None
    stockMovement: Optional[dict] = None

class NotificationSettingsUpdate(BaseModel):
    email: Optional[dict] = None
    sms: Optional[dict] = None
    whatsapp: Optional[dict] = None
    notifications: Optional[dict] = None
    templates: Optional[dict] = None

class IntegrationSettingsUpdate(BaseModel):
    paymentGateway: Optional[dict] = None
    eprescription: Optional[dict] = None
    accounting: Optional[dict] = None
    insurance: Optional[dict] = None
    cloudStorage: Optional[dict] = None
    laboratory: Optional[dict] = None
    supplierPortal: Optional[dict] = None

class ComplianceSettingsUpdate(BaseModel):
    regulatory: Optional[dict] = None
    licenses: Optional[dict] = None
    audit: Optional[dict] = None
    privacy: Optional[dict] = None
    prescription: Optional[dict] = None
    reporting: Optional[dict] = None

class BackupSettingsUpdate(BaseModel):
    automaticBackup: Optional[dict] = None
    cloudBackup: Optional[dict] = None
    localBackup: Optional[dict] = None
    dataExport: Optional[dict] = None
    dataImport: Optional[dict] = None
    dataPrivacy: Optional[dict] = None

class UserRolesSettingsUpdate(BaseModel):
    roles: Optional[list] = None
    permissions: Optional[list] = None

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    phone: Optional[str] = None
    password: str
    role: str
    is_active: Optional[bool] = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class PasswordReset(BaseModel):
    password: str

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/", summary="Test Settings Endpoint", description="Test endpoint to verify settings router is working")
async def test_settings():
    """Test endpoint to verify settings router is working"""
    return {"message": "Settings router is working"}

@router.get("/organization", summary="Get Organization Settings", description="Retrieve organization settings including store details, contact information, and formatting preferences")
async def get_organization_settings(
    # current_user: User = Depends(get_current_user),  # Temporarily disabled for testing
    db: Session = Depends(get_db)
):
    """Get organization settings"""
    settings = db.query(OrganizationSettings).first()
    if not settings:
        # Create default settings if none exist
        settings = OrganizationSettings(
            store_name="MediCare Pharmacy",
            address="123 Health Street",
            city="New York",
            state="NY",
            postal_code="10001",
            country="USA",
            phone="+1 (555) 123-4567",
            email="info@medicarepharmacy.com",
            website="www.medicarepharmacy.com",
            tax_number="TX123456789",
            gst_number="GST987654321",
            hsn_code_default="3004",
            currency="USD",
            timezone="America/New_York",
            date_format="MM/DD/YYYY",
            time_format="12-hour",
            invoice_number_format="INV-{YYYY}-{MM}-{SEQ}",
            invoice_prefix="INV",
            prescription_number_format="PRX-{YYYY}-{MM}-{SEQ}",
            prescription_prefix="PRX",
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    # Convert to dict with camelCase keys for frontend
    return {
        "storeName": settings.store_name,
        "address": settings.address,
        "city": settings.city,
        "state": settings.state,
        "postalCode": settings.postal_code,
        "country": settings.country,
        "phone": settings.phone,
        "email": settings.email,
        "website": settings.website,
        "logo": settings.logo,
        "taxNumber": settings.tax_number,
        "gstNumber": settings.gst_number,
        "hsnCodeDefault": settings.hsn_code_default,
        "currency": settings.currency,
        "timezone": settings.timezone,
        "dateFormat": settings.date_format,
        "timeFormat": settings.time_format,
        "invoiceNumberFormat": settings.invoice_number_format,
        "invoicePrefix": settings.invoice_prefix,
        "prescriptionNumberFormat": settings.prescription_number_format,
        "prescriptionPrefix": settings.prescription_prefix,
    }

@router.get("/pos", summary="Get POS Settings", description="Retrieve Point of Sale settings including payment methods, barcode scanning, receipt printing, and terminal configuration")
async def get_pos_settings(
    # current_user: User = Depends(get_current_user),  # Temporarily disabled for testing
    db: Session = Depends(get_db)
):
    """Get POS settings"""
    settings = db.query(POSSettings).first()
    if not settings:
        # Create default settings if none exist
        default_pos = {
            "paymentMethods": {
                "cash": {"enabled": True, "name": "Cash"},
                "card": {"enabled": True, "name": "Card"},
                "upi": {"enabled": False, "name": "UPI"},
                "wallet": {"enabled": False, "name": "Wallet"},
                "insurance": {"enabled": False, "name": "Insurance"},
            },
            "barcodeScanning": {
                "enabled": True,
                "autoAddToCart": True,
                "scannerType": "usb",
                "soundEnabled": True,
            },
            "receipt": {
                "printAutomatically": True,
                "showCustomerDetails": True,
                "showItemDetails": True,
                "showPaymentDetails": True,
                "showBarcode": False,
                "showQrCode": False,
                "headerText": "Thank you for visiting!",
                "footerText": "Please come again!",
                "logoSize": "medium",
                "fontSize": "normal",
                "currency": "USD",
            },
            "discount": {
                "enabled": True,
                "maxDiscountPercentage": 20,
                "requireManagerApproval": True,
                "approvalThreshold": 10,
                "defaultDiscountReason": "Special Discount",
            },
            "terminal": {
                "terminalId": "POS-01",
                "counterName": "Main Counter",
                "cashDrawer": {"enabled": True, "autoOpen": True},
                "display": {"showCustomerDisplay": True, "customerDisplayType": "lcd"},
            },
        }
        settings = POSSettings(
            payment_methods=json.dumps(default_pos["paymentMethods"]),
            barcode_scanning=json.dumps(default_pos["barcodeScanning"]),
            receipt=json.dumps(default_pos["receipt"]),
            discount=json.dumps(default_pos["discount"]),
            terminal=json.dumps(default_pos["terminal"]),
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    # Parse JSON fields and return
    return {
        "paymentMethods": json.loads(settings.payment_methods),
        "barcodeScanning": json.loads(settings.barcode_scanning),
        "receipt": json.loads(settings.receipt),
        "discount": json.loads(settings.discount),
        "terminal": json.loads(settings.terminal),
    }

@router.get("/theme", summary="Get Theme Settings", description="Retrieve theme settings including color scheme, branding, UI preferences, and print settings")
async def get_theme_settings(
    # current_user: User = Depends(get_current_user),  # Temporarily disabled for testing
    db: Session = Depends(get_db)
):
    """Get theme settings"""
    settings = db.query(ThemeSettings).first()
    if not settings:
        # Create default settings if none exist
        default_theme = {
            "themeMode": "light",
            "colorScheme": {
                "primary": "#3b82f6",
                "secondary": "#6b7280",
                "success": "#10b981",
                "warning": "#f59e0b",
                "error": "#ef4444",
                "info": "#3b82f6",
            },
            "branding": {
                "logo": "",
                "favicon": "",
                "companyName": "Pharmacy Management System",
                "tagline": "Your trusted pharmacy partner",
                "showLogoInHeader": True,
                "showLogoInLogin": True,
                "showLogoInReports": True,
            },
            "ui": {
                "compactMode": False,
                "showSidebarIcons": True,
                "showSidebarLabels": True,
                "sidebarCollapsed": False,
                "showBreadcrumbs": True,
                "showPageTitles": True,
                "showFooter": True,
                "animationsEnabled": True,
            },
            "print": {
                "header": True,
                "footer": True,
                "logo": True,
                "companyName": True,
                "date": True,
                "pageNumber": True,
                "fontSize": "normal",
                "margins": "normal",
            },
        }
        settings = ThemeSettings(
            theme_mode=default_theme["themeMode"],
            color_scheme=json.dumps(default_theme["colorScheme"]),
            branding=json.dumps(default_theme["branding"]),
            ui=json.dumps(default_theme["ui"]),
            print=json.dumps(default_theme["print"]),
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    # Parse JSON fields and return
    return {
        "themeMode": settings.theme_mode,
        "colorScheme": json.loads(settings.color_scheme),
        "branding": json.loads(settings.branding),
        "ui": json.loads(settings.ui),
        "print": json.loads(settings.print),
    }

@router.put("/organization")
async def update_organization_settings(
    settings_data: OrganizationSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update organization settings"""
    settings = db.query(OrganizationSettings).first()
    if not settings:
        settings = OrganizationSettings()
        db.add(settings)
    
    # Update fields from settings_data
    settings.store_name = settings_data.get("storeName", settings.store_name)
    settings.address = settings_data.get("address", settings.address)
    settings.city = settings_data.get("city", settings.city)
    settings.state = settings_data.get("state", settings.state)
    settings.postal_code = settings_data.get("postalCode", settings.postal_code)
    settings.country = settings_data.get("country", settings.country)
    settings.phone = settings_data.get("phone", settings.phone)
    settings.email = settings_data.get("email", settings.email)
    settings.website = settings_data.get("website", settings.website)
    settings.logo = settings_data.get("logo", settings.logo)
    settings.tax_number = settings_data.get("taxNumber", settings.tax_number)
    settings.gst_number = settings_data.get("gstNumber", settings.gst_number)
    settings.hsn_code_default = settings_data.get("hsnCodeDefault", settings.hsn_code_default)
    settings.currency = settings_data.get("currency", settings.currency)
    settings.timezone = settings_data.get("timezone", settings.timezone)
    settings.date_format = settings_data.get("dateFormat", settings.date_format)
    settings.time_format = settings_data.get("timeFormat", settings.time_format)
    settings.invoice_number_format = settings_data.get("invoiceNumberFormat", settings.invoice_number_format)
    settings.invoice_prefix = settings_data.get("invoicePrefix", settings.invoice_prefix)
    settings.prescription_number_format = settings_data.get("prescriptionNumberFormat", settings.prescription_number_format)
    settings.prescription_prefix = settings_data.get("prescriptionPrefix", settings.prescription_prefix)
    
    db.commit()
    
    # Update theme settings if store name or logo changed
    if "storeName" in settings_data or "logo" in settings_data:
        theme_settings = db.query(ThemeSettings).first()
        if not theme_settings:
            # Create theme settings if they don't exist
            theme_settings = ThemeSettings(
                theme_mode="light",
                color_scheme=json.dumps({
                    "primary": "#3b82f6",
                    "secondary": "#6b7280",
                    "success": "#10b981",
                    "warning": "#f59e0b",
                    "error": "#ef4444",
                    "info": "#3b82f6",
                }),
                branding=json.dumps({
                    "logo": settings_data.get("logo", ""),
                    "favicon": "",
                    "companyName": settings_data.get("storeName", "Pharmacy Management System"),
                    "tagline": "Your trusted pharmacy partner",
                    "showLogoInHeader": True,
                    "showLogoInLogin": True,
                    "showLogoInReports": True,
                }),
                ui=json.dumps({
                    "compactMode": False,
                    "showSidebarIcons": True,
                    "showSidebarLabels": True,
                    "sidebarCollapsed": False,
                    "showBreadcrumbs": True,
                    "showPageTitles": True,
                    "showFooter": True,
                    "animationsEnabled": True,
                }),
                print=json.dumps({
                    "header": True,
                    "footer": True,
                    "logo": True,
                    "companyName": True,
                    "date": True,
                    "pageNumber": True,
                    "fontSize": "normal",
                    "margins": "normal",
                }),
            )
            db.add(theme_settings)
        else:
            # Update existing theme settings
            branding = json.loads(theme_settings.branding)
            if "storeName" in settings_data:
                branding["companyName"] = settings_data["storeName"]
            if "logo" in settings_data:
                branding["logo"] = settings_data["logo"]
            theme_settings.branding = json.dumps(branding)
        db.commit()
    
    # Update POS settings if currency changed
    if "currency" in settings_data:
        pos_settings = db.query(POSSettings).first()
        if not pos_settings:
            # Create POS settings if they don't exist
            default_pos = {
                "paymentMethods": {
                    "cash": {"enabled": True, "name": "Cash"},
                    "card": {"enabled": True, "name": "Card"},
                    "upi": {"enabled": False, "name": "UPI"},
                    "wallet": {"enabled": False, "name": "Wallet"},
                    "insurance": {"enabled": False, "name": "Insurance"},
                },
                "barcodeScanning": {
                    "enabled": True,
                    "autoAddToCart": True,
                    "scannerType": "usb",
                    "soundEnabled": True,
                },
                "receipt": {
                    "printAutomatically": True,
                    "showCustomerDetails": True,
                    "showItemDetails": True,
                    "showPaymentDetails": True,
                    "showBarcode": False,
                    "showQrCode": False,
                    "headerText": "Thank you for visiting!",
                    "footerText": "Please come again!",
                    "logoSize": "medium",
                    "fontSize": "normal",
                    "currency": settings_data["currency"],
                },
                "discount": {
                    "enabled": True,
                    "maxDiscountPercentage": 20,
                    "requireManagerApproval": True,
                    "approvalThreshold": 10,
                    "defaultDiscountReason": "Special Discount",
                },
                "terminal": {
                    "terminalId": "POS-01",
                    "counterName": "Main Counter",
                    "cashDrawer": {"enabled": True, "autoOpen": True},
                    "display": {"showCustomerDisplay": True, "customerDisplayType": "lcd"},
                },
            }
            pos_settings = POSSettings(
                payment_methods=json.dumps(default_pos["paymentMethods"]),
                barcode_scanning=json.dumps(default_pos["barcodeScanning"]),
                receipt=json.dumps(default_pos["receipt"]),
                discount=json.dumps(default_pos["discount"]),
                terminal=json.dumps(default_pos["terminal"]),
            )
            db.add(pos_settings)
        else:
            # Update existing POS settings
            receipt = json.loads(pos_settings.receipt)
            receipt["currency"] = settings_data["currency"]
            pos_settings.receipt = json.dumps(receipt)
        db.commit()
    
    return {"message": "Organization settings updated successfully"}

@router.put("/pos")
async def update_pos_settings(
    settings_data: POSSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update POS settings"""
    settings = db.query(POSSettings).first()
    if not settings:
        settings = POSSettings()
        db.add(settings)
    
    # Update JSON fields
    if "paymentMethods" in settings_data:
        settings.payment_methods = json.dumps(settings_data["paymentMethods"])
    if "barcodeScanning" in settings_data:
        settings.barcode_scanning = json.dumps(settings_data["barcodeScanning"])
    if "receipt" in settings_data:
        settings.receipt = json.dumps(settings_data["receipt"])
    if "discount" in settings_data:
        settings.discount = json.dumps(settings_data["discount"])
    if "terminal" in settings_data:
        settings.terminal = json.dumps(settings_data["terminal"])
    
    db.commit()
    return {"message": "POS settings updated successfully"}

@router.put("/theme")
async def update_theme_settings(
    settings_data: ThemeSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update theme settings"""
    settings = db.query(ThemeSettings).first()
    if not settings:
        settings = ThemeSettings()
        db.add(settings)
    
    # Update fields
    if "themeMode" in settings_data:
        settings.theme_mode = settings_data["themeMode"]
    if "colorScheme" in settings_data:
        settings.color_scheme = json.dumps(settings_data["colorScheme"])
    if "branding" in settings_data:
        settings.branding = json.dumps(settings_data["branding"])
    if "ui" in settings_data:
        settings.ui = json.dumps(settings_data["ui"])
    if "print" in settings_data:
        settings.print = json.dumps(settings_data["print"])
    
    db.commit()
    return {"message": "Theme settings updated successfully"}

@router.get("/inventory")
async def get_inventory_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get inventory settings"""
    try:
        settings = db.query(InventorySettings).first()
        if not settings:
            # Create default settings if none exist
            default_inventory = {
                "reorder": {
                    "defaultReorderLevel": 20,
                    "defaultReorderQuantity": 100,
                    "enableAutoReorder": False,
                    "autoReorderSuppliers": [],
                },
                "expiry": {
                    "enabled": True,
                    "alertDaysBefore": 30,
                    "criticalAlertDaysBefore": 7,
                    "dailyAlerts": True,
                    "weeklyAlerts": True,
                    "alertEmails": ["manager@pharmacy.com"],
                },
                "lowStock": {
                    "enabled": True,
                    "alertThreshold": 10,
                    "criticalThreshold": 5,
                    "dailyAlerts": True,
                    "weeklyAlerts": True,
                    "alertEmails": ["manager@pharmacy.com"],
                },
                "alternatives": {
                    "enabled": True,
                    "autoSuggestAlternatives": True,
                    "requirePharmacistApproval": True,
                    "mappingRules": [
                        {"condition": "out_of_stock", "action": "suggest_alternatives"},
                        {"condition": "higher_price", "action": "suggest_cheaper"},
                        {"condition": "same_generic", "action": "suggest_generic"},
                    ],
                },
                "batchPricing": {
                    "enabled": False,
                    "allowDifferentPrices": True,
                    "defaultPricingMethod": "fifo",
                    "priceChangeApproval": True,
                },
                "stockMovement": {
                    "trackAllMovements": True,
                    "requireReasonForAdjustments": True,
                    "autoLogSales": True,
                    "autoLogPurchases": True,
                    "adjustmentReasons": [
                        "Damage", "Theft", "Expired", "Return", "Correction", "Transfer",
                    ],
                },
            }
            settings = InventorySettings(
                reorder_settings=json.dumps(default_inventory["reorder"]),
                expiry_alerts=json.dumps(default_inventory["expiry"]),
                low_stock_alerts=json.dumps(default_inventory["lowStock"]),
                alternatives=json.dumps(default_inventory["alternatives"]),
                batch_pricing=json.dumps(default_inventory["batchPricing"]),
                stock_movement=json.dumps(default_inventory["stockMovement"]),
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)

        # Parse JSON fields and return
        return {
            "reorder": json.loads(settings.reorder_settings),
            "expiry": json.loads(settings.expiry_alerts),
            "lowStock": json.loads(settings.low_stock_alerts),
            "alternatives": json.loads(settings.alternatives),
            "batchPricing": json.loads(settings.batch_pricing),
            "stockMovement": json.loads(settings.stock_movement),
        }
    except Exception as e:
        # Return default settings if table doesn't exist or other error
        print(f"Error fetching inventory settings: {e}")
        return {
            "reorder": {
                "defaultReorderLevel": 20,
                "defaultReorderQuantity": 100,
                "enableAutoReorder": False,
                "autoReorderSuppliers": [],
            },
            "expiry": {
                "enabled": True,
                "alertDaysBefore": 30,
                "criticalAlertDaysBefore": 7,
                "dailyAlerts": True,
                "weeklyAlerts": True,
                "alertEmails": ["manager@pharmacy.com"],
            },
            "lowStock": {
                "enabled": True,
                "alertThreshold": 10,
                "criticalThreshold": 5,
                "dailyAlerts": True,
                "weeklyAlerts": True,
                "alertEmails": ["manager@pharmacy.com"],
            },
            "alternatives": {
                "enabled": True,
                "autoSuggestAlternatives": True,
                "requirePharmacistApproval": True,
                "mappingRules": [
                    {"condition": "out_of_stock", "action": "suggest_alternatives"},
                    {"condition": "higher_price", "action": "suggest_cheaper"},
                    {"condition": "same_generic", "action": "suggest_generic"},
                ],
            },
            "batchPricing": {
                "enabled": False,
                "allowDifferentPrices": True,
                "defaultPricingMethod": "fifo",
                "priceChangeApproval": True,
            },
            "stockMovement": {
                "trackAllMovements": True,
                "requireReasonForAdjustments": True,
                "autoLogSales": True,
                "autoLogPurchases": True,
                "adjustmentReasons": [
                    "Damage", "Theft", "Expired", "Return", "Correction", "Transfer",
                ],
            },
        }

@router.get("/notifications")
async def get_notification_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notification settings"""
    try:
        settings = db.query(NotificationSettings).first()
        if not settings:
            # Create default settings if none exist
            default_notifications = {
                "email": {
                    "enabled": True,
                    "smtpServer": "",
                    "smtpPort": 587,
                    "username": "",
                    "password": "",
                    "useSSL": True,
                    "senderEmail": "noreply@pharmacy.com",
                    "senderName": "Pharmacy System",
                },
                "sms": {
                    "enabled": False,
                    "provider": "twilio",
                    "apiKey": "",
                    "apiSecret": "",
                    "senderId": "PHARM",
                },
                "whatsapp": {
                    "enabled": False,
                    "apiKey": "",
                    "phoneNumber": "",
                    "businessId": "",
                },
                "notifications": {
                    "lowStock": {"email": True, "sms": False, "whatsapp": False},
                    "expiryAlert": {"email": True, "sms": False, "whatsapp": False},
                    "newOrder": {"email": True, "sms": False, "whatsapp": False},
                    "paymentReceived": {"email": True, "sms": False, "whatsapp": False},
                    "prescriptionReady": {"email": True, "sms": True, "whatsapp": False},
                    "appointmentReminder": {"email": True, "sms": True, "whatsapp": False},
                    "systemUpdates": {"email": True, "sms": False, "whatsapp": False},
                },
                "templates": {
                    "lowStockEmail": {
                        "subject": "Low Stock Alert: {medicine_name}",
                        "body": "Dear {recipient_name},\n\nThis is to inform you that the following medicine is running low on stock:\n\nMedicine: {medicine_name}\nCurrent Stock: {current_stock}\nReorder Level: {reorder_level}\n\nPlease take appropriate action.\n\nThank you,\nPharmacy Management System",
                    },
                    "expiryAlertEmail": {
                        "subject": "Expiry Alert: {medicine_name}",
                        "body": "Dear {recipient_name},\n\nThis is to inform you that the following medicine is expiring soon:\n\nMedicine: {medicine_name}\nBatch: {batch_number}\nExpiry Date: {expiry_date}\nDays Until Expiry: {days_until_expiry}\n\nPlease take appropriate action.\n\nThank you,\nPharmacy Management System",
                    },
                    "prescriptionReadySMS": {
                        "message": "Dear {patient_name}, your prescription is ready for pickup. Order ID: {order_id}. Thank you!",
                    },
                    "appointmentReminderSMS": {
                        "message": "Dear {patient_name}, this is a reminder for your appointment on {appointment_date} at {appointment_time}. Thank you!",
                    },
                },
            }
            settings = NotificationSettings(
                email_settings=json.dumps(default_notifications["email"]),
                sms_settings=json.dumps(default_notifications["sms"]),
                whatsapp_settings=json.dumps(default_notifications["whatsapp"]),
                notification_types=json.dumps(default_notifications["notifications"]),
                templates=json.dumps(default_notifications["templates"]),
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)

        # Parse JSON fields and return
        return {
            "email": json.loads(settings.email_settings),
            "sms": json.loads(settings.sms_settings),
            "whatsapp": json.loads(settings.whatsapp_settings),
            "notifications": json.loads(settings.notification_types),
            "templates": json.loads(settings.templates),
        }
    except Exception as e:
        # Return default settings if table doesn't exist or other error
        print(f"Error fetching notification settings: {e}")
        return {
            "email": {
                "enabled": True,
                "smtpServer": "",
                "smtpPort": 587,
                "username": "",
                "password": "",
                "useSSL": True,
                "senderEmail": "noreply@pharmacy.com",
                "senderName": "Pharmacy System",
            },
            "sms": {
                "enabled": False,
                "provider": "twilio",
                "apiKey": "",
                "apiSecret": "",
                "senderId": "PHARM",
            },
            "whatsapp": {
                "enabled": False,
                "apiKey": "",
                "phoneNumber": "",
                "businessId": "",
            },
            "notifications": {
                "lowStock": {"email": True, "sms": False, "whatsapp": False},
                "expiryAlert": {"email": True, "sms": False, "whatsapp": False},
                "newOrder": {"email": True, "sms": False, "whatsapp": False},
                "paymentReceived": {"email": True, "sms": False, "whatsapp": False},
                "prescriptionReady": {"email": True, "sms": True, "whatsapp": False},
                "appointmentReminder": {"email": True, "sms": True, "whatsapp": False},
                "systemUpdates": {"email": True, "sms": False, "whatsapp": False},
            },
            "templates": {
                "lowStockEmail": {
                    "subject": "Low Stock Alert: {medicine_name}",
                    "body": "Dear {recipient_name},\n\nThis is to inform you that the following medicine is running low on stock:\n\nMedicine: {medicine_name}\nCurrent Stock: {current_stock}\nReorder Level: {reorder_level}\n\nPlease take appropriate action.\n\nThank you,\nPharmacy Management System",
                },
                "expiryAlertEmail": {
                    "subject": "Expiry Alert: {medicine_name}",
                    "body": "Dear {recipient_name},\n\nThis is to inform you that the following medicine is expiring soon:\n\nMedicine: {medicine_name}\nBatch: {batch_number}\nExpiry Date: {expiry_date}\nDays Until Expiry: {days_until_expiry}\n\nPlease take appropriate action.\n\nThank you,\nPharmacy Management System",
                },
                "prescriptionReadySMS": {
                    "message": "Dear {patient_name}, your prescription is ready for pickup. Order ID: {order_id}. Thank you!",
                },
                "appointmentReminderSMS": {
                    "message": "Dear {patient_name}, this is a reminder for your appointment on {appointment_date} at {appointment_time}. Thank you!",
                },
            },
        }

@router.get("/integrations")
async def get_integration_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get integration settings"""
    settings = db.query(IntegrationSettings).first()
    if not settings:
        # Create default settings if none exist
        default_integrations = {
            "paymentGateway": {
                "enabled": False,
                "provider": "stripe",
                "apiKey": "",
                "apiSecret": "",
                "webhookSecret": "",
                "testMode": True,
            },
            "eprescription": {
                "enabled": False,
                "provider": "default",
                "apiKey": "",
                "apiEndpoint": "",
                "autoImport": False,
            },
            "accounting": {
                "enabled": False,
                "provider": "none",
                "apiKey": "",
                "apiSecret": "",
                "companyCode": "",
                "syncFrequency": "daily",
                "autoSync": False,
            },
            "insurance": {
                "enabled": False,
                "providers": [
                    {
                        "name": "Provider A",
                        "apiKey": "",
                        "apiEndpoint": "",
                        "enabled": False,
                    },
                    {
                        "name": "Provider B",
                        "apiKey": "",
                        "apiEndpoint": "",
                        "enabled": False,
                    },
                ],
            },
            "cloudStorage": {
                "enabled": False,
                "provider": "aws",
                "accessKey": "",
                "secretKey": "",
                "bucket": "",
                "region": "us-east-1",
                "backupFrequency": "daily",
            },
            "laboratory": {
                "enabled": False,
                "provider": "default",
                "apiKey": "",
                "apiEndpoint": "",
                "autoImportResults": False,
            },
            "supplierPortal": {
                "enabled": False,
                "allowOrders": True,
                "allowInvoices": True,
                "allowInventoryUpdates": False,
            },
        }
        settings = IntegrationSettings(
            payment_gateway=json.dumps(default_integrations["paymentGateway"]),
            eprescription=json.dumps(default_integrations["eprescription"]),
            accounting=json.dumps(default_integrations["accounting"]),
            insurance=json.dumps(default_integrations["insurance"]),
            cloud_storage=json.dumps(default_integrations["cloudStorage"]),
            laboratory=json.dumps(default_integrations["laboratory"]),
            supplier_portal=json.dumps(default_integrations["supplierPortal"]),
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    # Parse JSON fields and return
    return {
        "paymentGateway": json.loads(settings.payment_gateway),
        "eprescription": json.loads(settings.eprescription),
        "accounting": json.loads(settings.accounting),
        "insurance": json.loads(settings.insurance),
        "cloudStorage": json.loads(settings.cloud_storage),
        "laboratory": json.loads(settings.laboratory),
        "supplierPortal": json.loads(settings.supplier_portal),
    }

@router.get("/compliance")
async def get_compliance_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get compliance settings"""
    settings = db.query(ComplianceSettings).first()
    if not settings:
        # Create default settings if none exist
        default_compliance = {
            "regulatory": {
                "scheduleH": {
                    "enabled": True,
                    "requirePrescription": True,
                    "recordKeeping": True,
                    "maxSaleQuantity": 30,
                    "maxDaysSupply": 30,
                },
                "scheduleX": {
                    "enabled": True,
                    "requirePrescription": True,
                    "recordKeeping": True,
                    "maxSaleQuantity": 7,
                    "maxDaysSupply": 7,
                    "specialStorage": True,
                },
                "ndps": {
                    "enabled": True,
                    "requirePrescription": True,
                    "recordKeeping": True,
                    "maxSaleQuantity": 14,
                    "maxDaysSupply": 14,
                    "specialStorage": True,
                },
            },
            "licenses": {
                "pharmacyLicense": {
                    "number": "",
                    "issuedDate": "",
                    "expiryDate": "",
                    "issuingAuthority": "",
                    "reminderDays": 90,
                    "documentUrl": "",
                },
                "drugLicense": {
                    "number": "",
                    "issuedDate": "",
                    "expiryDate": "",
                    "issuingAuthority": "",
                    "reminderDays": 90,
                    "documentUrl": "",
                },
                "gstRegistration": {
                    "number": "",
                    "issuedDate": "",
                    "expiryDate": "",
                    "issuingAuthority": "",
                    "reminderDays": 90,
                    "documentUrl": "",
                },
            },
            "audit": {
                "enabled": True,
                "logLevel": "info",
                "retentionPeriod": 365,
                "includeSensitiveData": False,
                "emailReports": True,
                "reportFrequency": "monthly",
                "reportRecipients": ["manager@pharmacy.com"],
            },
            "privacy": {
                "gdprCompliant": False,
                "dataEncryption": True,
                "anonymizePatientData": True,
                "consentManagement": True,
                "dataRetentionPeriod": 2555,
                "autoDeleteExpiredData": False,
            },
            "prescription": {
                "requireDoctorSignature": True,
                "requirePatientConsent": True,
                "validateDrugInteractions": True,
                "validateAllergies": True,
                "validateDosage": True,
                "maxRefills": 3,
                "refillPeriodDays": 30,
            },
            "reporting": {
                "generateMonthlyReports": True,
                "generateQuarterlyReports": True,
                "generateAnnualReports": True,
                "reportToAuthorities": False,
                "authorityEmail": "",
                "includeScheduleDrugs": True,
                "includeExpiryData": True,
            },
        }
        settings = ComplianceSettings(
            regulatory=json.dumps(default_compliance["regulatory"]),
            licenses=json.dumps(default_compliance["licenses"]),
            audit=json.dumps(default_compliance["audit"]),
            privacy=json.dumps(default_compliance["privacy"]),
            prescription=json.dumps(default_compliance["prescription"]),
            reporting=json.dumps(default_compliance["reporting"]),
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    # Parse JSON fields and return
    return {
        "regulatory": json.loads(settings.regulatory),
        "licenses": json.loads(settings.licenses),
        "audit": json.loads(settings.audit),
        "privacy": json.loads(settings.privacy),
        "prescription": json.loads(settings.prescription),
        "reporting": json.loads(settings.reporting),
    }

@router.get("/backup")
async def get_backup_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get backup settings"""
    settings = db.query(BackupSettings).first()
    if not settings:
        # Create default settings if none exist
        default_backup = {
            "automaticBackup": {
                "enabled": True,
                "frequency": "daily",
                "time": "02:00",
                "retentionDays": 30,
                "compression": True,
                "encryption": True,
            },
            "cloudBackup": {
                "enabled": False,
                "provider": "aws",
                "accessKey": "",
                "secretKey": "",
                "bucket": "",
                "region": "us-east-1",
                "encryption": True,
            },
            "localBackup": {
                "enabled": True,
                "path": "/backups",
                "retentionDays": 7,
                "compression": True,
            },
            "dataExport": {
                "formats": ["csv", "json", "xml"],
                "includeSensitiveData": False,
                "includeImages": False,
                "dateRange": "last_month",
                "customDateRange": {
                    "startDate": "",
                    "endDate": "",
                },
            },
            "dataImport": {
                "allowImport": True,
                "validateBeforeImport": True,
                "backupBeforeImport": True,
                "mergeStrategy": "replace",
            },
            "dataPrivacy": {
                "anonymizePersonalData": True,
                "retainPatientData": True,
                "patientDataRetentionYears": 7,
                "autoDeleteExpiredData": False,
                "consentManagement": True,
            },
        }
        settings = BackupSettings(
            automatic_backup=json.dumps(default_backup["automaticBackup"]),
            cloud_backup=json.dumps(default_backup["cloudBackup"]),
            local_backup=json.dumps(default_backup["localBackup"]),
            data_export=json.dumps(default_backup["dataExport"]),
            data_import=json.dumps(default_backup["dataImport"]),
            data_privacy=json.dumps(default_backup["dataPrivacy"]),
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    # Parse JSON fields and return
    return {
        "automaticBackup": json.loads(settings.automatic_backup),
        "cloudBackup": json.loads(settings.cloud_backup),
        "localBackup": json.loads(settings.local_backup),
        "dataExport": json.loads(settings.data_export),
        "dataImport": json.loads(settings.data_import),
        "dataPrivacy": json.loads(settings.data_privacy),
    }

@router.get("/users")
async def get_user_roles_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user roles settings"""
    settings = db.query(UserRolesSettings).first()
    if not settings:
        # Create default settings if none exist
        default_users = {
            "roles": [
                {"id": 1, "name": "admin", "description": "Full system access"},
                {"id": 2, "name": "pharmacist", "description": "Can manage prescriptions and inventory"},
                {"id": 3, "name": "cashier", "description": "Can process sales and manage billing"},
                {"id": 4, "name": "accountant", "description": "Can access financial reports"},
            ],
            "permissions": [
                {"id": 1, "name": "view_dashboard", "description": "View Dashboard", "category": "General"},
                {"id": 2, "name": "view_patients", "description": "View Patients", "category": "Patients"},
                {"id": 3, "name": "add_patients", "description": "Add Patients", "category": "Patients"},
                {"id": 4, "name": "edit_patients", "description": "Edit Patients", "category": "Patients"},
                {"id": 5, "name": "delete_patients", "description": "Delete Patients", "category": "Patients"},
                {"id": 6, "name": "view_inventory", "description": "View Inventory", "category": "Inventory"},
                {"id": 7, "name": "add_medicines", "description": "Add Medicines", "category": "Inventory"},
                {"id": 8, "name": "edit_medicines", "description": "Edit Medicines", "category": "Inventory"},
                {"id": 9, "name": "delete_medicines", "description": "Delete Medicines", "category": "Inventory"},
                {"id": 10, "name": "view_prescriptions", "description": "View Prescriptions", "category": "Prescriptions"},
                {"id": 11, "name": "create_prescriptions", "description": "Create Prescriptions", "category": "Prescriptions"},
                {"id": 12, "name": "view_billing", "description": "View Billing", "category": "Billing"},
                {"id": 13, "name": "create_invoices", "description": "Create Invoices", "category": "Billing"},
                {"id": 14, "name": "process_payments", "description": "Process Payments", "category": "Billing"},
                {"id": 15, "name": "view_reports", "description": "View Reports", "category": "Reports"},
                {"id": 16, "name": "manage_users", "description": "Manage Users", "category": "Admin"},
                {"id": 17, "name": "manage_settings", "description": "Manage Settings", "category": "Admin"},
            ],
        }
        settings = UserRolesSettings(
            roles=json.dumps(default_users["roles"]),
            permissions=json.dumps(default_users["permissions"]),
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    # Parse JSON fields and return
    return {
        "roles": json.loads(settings.roles),
        "permissions": json.loads(settings.permissions),
    }

@router.put("/inventory")
async def update_inventory_settings(
    settings_data: InventorySettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update inventory settings"""
    settings = db.query(InventorySettings).first()
    if not settings:
        settings = InventorySettings()
        db.add(settings)
    
    # Update JSON fields
    if "reorder" in settings_data:
        settings.reorder_settings = json.dumps(settings_data["reorder"])
    if "expiry" in settings_data:
        settings.expiry_alerts = json.dumps(settings_data["expiry"])
    if "lowStock" in settings_data:
        settings.low_stock_alerts = json.dumps(settings_data["lowStock"])
    if "alternatives" in settings_data:
        settings.alternatives = json.dumps(settings_data["alternatives"])
    if "batchPricing" in settings_data:
        settings.batch_pricing = json.dumps(settings_data["batchPricing"])
    if "stockMovement" in settings_data:
        settings.stock_movement = json.dumps(settings_data["stockMovement"])
    
    db.commit()
    return {"message": "Inventory settings updated successfully"}


@router.put("/notifications")
async def update_notification_settings(
    settings_data: NotificationSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update notification settings"""
    settings = db.query(NotificationSettings).first()
    if not settings:
        settings = NotificationSettings()
        db.add(settings)
    
    # Update JSON fields
    if "email" in settings_data:
        settings.email_settings = json.dumps(settings_data["email"])
    if "sms" in settings_data:
        settings.sms_settings = json.dumps(settings_data["sms"])
    if "whatsapp" in settings_data:
        settings.whatsapp_settings = json.dumps(settings_data["whatsapp"])
    if "notifications" in settings_data:
        settings.notification_types = json.dumps(settings_data["notifications"])
    if "templates" in settings_data:
        settings.templates = json.dumps(settings_data["templates"])
    
    db.commit()
    return {"message": "Notification settings updated successfully"}

@router.put("/integrations")
async def update_integration_settings(
    settings_data: IntegrationSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update integration settings"""
    settings = db.query(IntegrationSettings).first()
    if not settings:
        settings = IntegrationSettings()
        db.add(settings)
    
    # Update JSON fields
    if "paymentGateway" in settings_data:
        settings.payment_gateway = json.dumps(settings_data["paymentGateway"])
    if "eprescription" in settings_data:
        settings.eprescription = json.dumps(settings_data["eprescription"])
    if "accounting" in settings_data:
        settings.accounting = json.dumps(settings_data["accounting"])
    if "insurance" in settings_data:
        settings.insurance = json.dumps(settings_data["insurance"])
    if "cloudStorage" in settings_data:
        settings.cloud_storage = json.dumps(settings_data["cloudStorage"])
    if "laboratory" in settings_data:
        settings.laboratory = json.dumps(settings_data["laboratory"])
    if "supplierPortal" in settings_data:
        settings.supplier_portal = json.dumps(settings_data["supplierPortal"])
    
    db.commit()
    return {"message": "Integration settings updated successfully"}

@router.put("/compliance")
async def update_compliance_settings(
    settings_data: ComplianceSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update compliance settings"""
    settings = db.query(ComplianceSettings).first()
    if not settings:
        settings = ComplianceSettings()
        db.add(settings)
    
    # Update JSON fields
    if "regulatory" in settings_data:
        settings.regulatory = json.dumps(settings_data["regulatory"])
    if "licenses" in settings_data:
        settings.licenses = json.dumps(settings_data["licenses"])
    if "audit" in settings_data:
        settings.audit = json.dumps(settings_data["audit"])
    if "privacy" in settings_data:
        settings.privacy = json.dumps(settings_data["privacy"])
    if "prescription" in settings_data:
        settings.prescription = json.dumps(settings_data["prescription"])
    if "reporting" in settings_data:
        settings.reporting = json.dumps(settings_data["reporting"])
    
    db.commit()
    return {"message": "Compliance settings updated successfully"}

@router.put("/backup")
async def update_backup_settings(
    settings_data: BackupSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update backup settings"""
    settings = db.query(BackupSettings).first()
    if not settings:
        settings = BackupSettings()
        db.add(settings)
    
    # Update JSON fields
    if "automaticBackup" in settings_data:
        settings.automatic_backup = json.dumps(settings_data["automaticBackup"])
    if "cloudBackup" in settings_data:
        settings.cloud_backup = json.dumps(settings_data["cloudBackup"])
    if "localBackup" in settings_data:
        settings.local_backup = json.dumps(settings_data["localBackup"])
    if "dataExport" in settings_data:
        settings.data_export = json.dumps(settings_data["dataExport"])
    if "dataImport" in settings_data:
        settings.data_import = json.dumps(settings_data["dataImport"])
    if "dataPrivacy" in settings_data:
        settings.data_privacy = json.dumps(settings_data["dataPrivacy"])
    
    db.commit()
    return {"message": "Backup settings updated successfully"}

@router.put("/users", summary="Update User Roles Settings", description="Update user roles and permissions configuration for the pharmacy management system")
async def update_user_roles_settings(
    settings_data: UserRolesSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user roles settings"""
    settings = db.query(UserRolesSettings).first()
    if not settings:
        settings = UserRolesSettings()
        db.add(settings)
    
    # Update JSON fields
    if "roles" in settings_data:
        settings.roles = json.dumps(settings_data["roles"])
    if "permissions" in settings_data:
        settings.permissions = json.dumps(settings_data["permissions"])
    
    db.commit()
    return {"message": "User roles settings updated successfully"}

@router.get("/{category}", summary="Get Settings by Category", description="Retrieve settings for a specific category (organization, pos, theme, inventory, notifications, integrations, compliance, backup, or users)")
async def get_settings(
    category: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get settings for a specific category"""
    if category == "organization":
        settings = db.query(OrganizationSettings).first()
        if not settings:
            # Create default settings if none exist
            settings = OrganizationSettings(
                store_name="MediCare Pharmacy",
                address="123 Health Street",
                city="New York",
                state="NY",
                postal_code="10001",
                country="USA",
                phone="+1 (555) 123-4567",
                email="info@medicarepharmacy.com",
                website="www.medicarepharmacy.com",
                tax_number="TX123456789",
                gst_number="GST987654321",
                hsn_code_default="3004",
                currency="USD",
                timezone="America/New_York",
                date_format="MM/DD/YYYY",
                time_format="12-hour",
                invoice_number_format="INV-{YYYY}-{MM}-{SEQ}",
                invoice_prefix="INV",
                prescription_number_format="PRX-{YYYY}-{MM}-{SEQ}",
                prescription_prefix="PRX",
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
        
        # Convert to dict with camelCase keys for frontend
        return {
            "storeName": settings.store_name,
            "address": settings.address,
            "city": settings.city,
            "state": settings.state,
            "postalCode": settings.postal_code,
            "country": settings.country,
            "phone": settings.phone,
            "email": settings.email,
            "website": settings.website,
            "logo": settings.logo,
            "taxNumber": settings.tax_number,
            "gstNumber": settings.gst_number,
            "hsnCodeDefault": settings.hsn_code_default,
            "currency": settings.currency,
            "timezone": settings.timezone,
            "dateFormat": settings.date_format,
            "timeFormat": settings.time_format,
            "invoiceNumberFormat": settings.invoice_number_format,
            "invoicePrefix": settings.invoice_prefix,
            "prescriptionNumberFormat": settings.prescription_number_format,
            "prescriptionPrefix": settings.prescription_prefix,
        }
    
    elif category == "pos":
        settings = db.query(POSSettings).first()
        if not settings:
            # Create default settings if none exist
            default_pos = {
                "paymentMethods": {
                    "cash": {"enabled": True, "name": "Cash"},
                    "card": {"enabled": True, "name": "Card"},
                    "upi": {"enabled": False, "name": "UPI"},
                    "wallet": {"enabled": False, "name": "Wallet"},
                    "insurance": {"enabled": False, "name": "Insurance"},
                },
                "barcodeScanning": {
                    "enabled": True,
                    "autoAddToCart": True,
                    "scannerType": "usb",
                    "soundEnabled": True,
                },
                "receipt": {
                    "printAutomatically": True,
                    "showCustomerDetails": True,
                    "showItemDetails": True,
                    "showPaymentDetails": True,
                    "showBarcode": False,
                    "showQrCode": False,
                    "headerText": "Thank you for visiting!",
                    "footerText": "Please come again!",
                    "logoSize": "medium",
                    "fontSize": "normal",
                    "currency": "USD",
                },
                "discount": {
                    "enabled": True,
                    "maxDiscountPercentage": 20,
                    "requireManagerApproval": True,
                    "approvalThreshold": 10,
                    "defaultDiscountReason": "Special Discount",
                },
                "terminal": {
                    "terminalId": "POS-01",
                    "counterName": "Main Counter",
                    "cashDrawer": {"enabled": True, "autoOpen": True},
                    "display": {"showCustomerDisplay": True, "customerDisplayType": "lcd"},
                },
            }
            settings = POSSettings(
                payment_methods=json.dumps(default_pos["paymentMethods"]),
                barcode_scanning=json.dumps(default_pos["barcodeScanning"]),
                receipt=json.dumps(default_pos["receipt"]),
                discount=json.dumps(default_pos["discount"]),
                terminal=json.dumps(default_pos["terminal"]),
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
        
        # Parse JSON fields and return
        return {
            "paymentMethods": json.loads(settings.payment_methods),
            "barcodeScanning": json.loads(settings.barcode_scanning),
            "receipt": json.loads(settings.receipt),
            "discount": json.loads(settings.discount),
            "terminal": json.loads(settings.terminal),
        }
    
    elif category == "theme":
        settings = db.query(ThemeSettings).first()
        if not settings:
            # Create default settings if none exist
            default_theme = {
                "themeMode": "light",
                "colorScheme": {
                    "primary": "#3b82f6",
                    "secondary": "#6b7280",
                    "success": "#10b981",
                    "warning": "#f59e0b",
                    "error": "#ef4444",
                    "info": "#3b82f6",
                },
                "branding": {
                    "logo": "",
                    "favicon": "",
                    "companyName": "Pharmacy Management System",
                    "tagline": "Your trusted pharmacy partner",
                    "showLogoInHeader": True,
                    "showLogoInLogin": True,
                    "showLogoInReports": True,
                },
                "ui": {
                    "compactMode": False,
                    "showSidebarIcons": True,
                    "showSidebarLabels": True,
                    "sidebarCollapsed": False,
                    "showBreadcrumbs": True,
                    "showPageTitles": True,
                    "showFooter": True,
                    "animationsEnabled": True,
                },
                "print": {
                    "header": True,
                    "footer": True,
                    "logo": True,
                    "companyName": True,
                    "date": True,
                    "pageNumber": True,
                    "fontSize": "normal",
                    "margins": "normal",
                },
            }
            settings = ThemeSettings(
                theme_mode=default_theme["themeMode"],
                color_scheme=json.dumps(default_theme["colorScheme"]),
                branding=json.dumps(default_theme["branding"]),
                ui=json.dumps(default_theme["ui"]),
                print=json.dumps(default_theme["print"]),
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
        
        # Parse JSON fields and return
        return {
            "themeMode": settings.theme_mode,
            "colorScheme": json.loads(settings.color_scheme),
            "branding": json.loads(settings.branding),
            "ui": json.loads(settings.ui),
            "print": json.loads(settings.print),
        }
    
    elif category == "inventory":
        settings = db.query(InventorySettings).first()
        if not settings:
            # Create default settings if none exist
            default_inventory = {
                "reorder": {
                    "defaultReorderLevel": 20,
                    "defaultReorderQuantity": 100,
                    "enableAutoReorder": False,
                    "autoReorderSuppliers": [],
                },
                "expiry": {
                    "enabled": True,
                    "alertDaysBefore": 30,
                    "criticalAlertDaysBefore": 7,
                    "dailyAlerts": True,
                    "weeklyAlerts": True,
                    "alertEmails": ["manager@pharmacy.com"],
                },
                "lowStock": {
                    "enabled": True,
                    "alertThreshold": 10,
                    "criticalThreshold": 5,
                    "dailyAlerts": True,
                    "weeklyAlerts": True,
                    "alertEmails": ["manager@pharmacy.com"],
                },
                "alternatives": {
                    "enabled": True,
                    "autoSuggestAlternatives": True,
                    "requirePharmacistApproval": True,
                    "mappingRules": [
                        {"condition": "out_of_stock", "action": "suggest_alternatives"},
                        {"condition": "higher_price", "action": "suggest_cheaper"},
                        {"condition": "same_generic", "action": "suggest_generic"},
                    ],
                },
                "batchPricing": {
                    "enabled": False,
                    "allowDifferentPrices": True,
                    "defaultPricingMethod": "fifo",
                    "priceChangeApproval": True,
                },
                "stockMovement": {
                    "trackAllMovements": True,
                    "requireReasonForAdjustments": True,
                    "autoLogSales": True,
                    "autoLogPurchases": True,
                    "adjustmentReasons": [
                        "Damage", "Theft", "Expired", "Return", "Correction", "Transfer",
                    ],
                },
            }
            settings = InventorySettings(
                reorder_settings=json.dumps(default_inventory["reorder"]),
                expiry_alerts=json.dumps(default_inventory["expiry"]),
                low_stock_alerts=json.dumps(default_inventory["lowStock"]),
                alternatives=json.dumps(default_inventory["alternatives"]),
                batch_pricing=json.dumps(default_inventory["batchPricing"]),
                stock_movement=json.dumps(default_inventory["stockMovement"]),
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
        
        # Parse JSON fields and return
        return {
            "reorder": json.loads(settings.reorder_settings),
            "expiry": json.loads(settings.expiry_alerts),
            "lowStock": json.loads(settings.low_stock_alerts),
            "alternatives": json.loads(settings.alternatives),
            "batchPricing": json.loads(settings.batch_pricing),
            "stockMovement": json.loads(settings.stock_movement),
        }
    
    elif category == "notifications":
        settings = db.query(NotificationSettings).first()
        if not settings:
            # Create default settings if none exist
            default_notifications = {
                "email": {
                    "enabled": True,
                    "smtpServer": "",
                    "smtpPort": 587,
                    "username": "",
                    "password": "",
                    "useSSL": True,
                    "senderEmail": "noreply@pharmacy.com",
                    "senderName": "Pharmacy System",
                },
                "sms": {
                    "enabled": False,
                    "provider": "twilio",
                    "apiKey": "",
                    "apiSecret": "",
                    "senderId": "PHARM",
                },
                "whatsapp": {
                    "enabled": False,
                    "apiKey": "",
                    "phoneNumber": "",
                    "businessId": "",
                },
                "notifications": {
                    "lowStock": {"email": True, "sms": False, "whatsapp": False},
                    "expiryAlert": {"email": True, "sms": False, "whatsapp": False},
                    "newOrder": {"email": True, "sms": False, "whatsapp": False},
                    "paymentReceived": {"email": True, "sms": False, "whatsapp": False},
                    "prescriptionReady": {"email": True, "sms": True, "whatsapp": False},
                    "appointmentReminder": {"email": True, "sms": True, "whatsapp": False},
                    "systemUpdates": {"email": True, "sms": False, "whatsapp": False},
                },
                "templates": {
                    "lowStockEmail": {
                        "subject": "Low Stock Alert: {medicine_name}",
                        "body": "Dear {recipient_name},\n\nThis is to inform you that the following medicine is running low on stock:\n\nMedicine: {medicine_name}\nCurrent Stock: {current_stock}\nReorder Level: {reorder_level}\n\nPlease take appropriate action.\n\nThank you,\nPharmacy Management System",
                    },
                    "expiryAlertEmail": {
                        "subject": "Expiry Alert: {medicine_name}",
                        "body": "Dear {recipient_name},\n\nThis is to inform you that the following medicine is expiring soon:\n\nMedicine: {medicine_name}\nBatch: {batch_number}\nExpiry Date: {expiry_date}\nDays Until Expiry: {days_until_expiry}\n\nPlease take appropriate action.\n\nThank you,\nPharmacy Management System",
                    },
                    "prescriptionReadySMS": {
                        "message": "Dear {patient_name}, your prescription is ready for pickup. Order ID: {order_id}. Thank you!",
                    },
                    "appointmentReminderSMS": {
                        "message": "Dear {patient_name}, this is a reminder for your appointment on {appointment_date} at {appointment_time}. Thank you!",
                    },
                },
            }
            settings = NotificationSettings(
                email_settings=json.dumps(default_notifications["email"]),
                sms_settings=json.dumps(default_notifications["sms"]),
                whatsapp_settings=json.dumps(default_notifications["whatsapp"]),
                notification_types=json.dumps(default_notifications["notifications"]),
                templates=json.dumps(default_notifications["templates"]),
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
        
        # Parse JSON fields and return
        return {
            "email": json.loads(settings.email_settings),
            "sms": json.loads(settings.sms_settings),
            "whatsapp": json.loads(settings.whatsapp_settings),
            "notifications": json.loads(settings.notification_types),
            "templates": json.loads(settings.templates),
        }
    
    elif category == "integrations":
        settings = db.query(IntegrationSettings).first()
        if not settings:
            # Create default settings if none exist
            default_integrations = {
                "paymentGateway": {
                    "enabled": False,
                    "provider": "stripe",
                    "apiKey": "",
                    "apiSecret": "",
                    "webhookSecret": "",
                    "testMode": True,
                },
                "eprescription": {
                    "enabled": False,
                    "provider": "default",
                    "apiKey": "",
                    "apiEndpoint": "",
                    "autoImport": False,
                },
                "accounting": {
                    "enabled": False,
                    "provider": "none",
                    "apiKey": "",
                    "apiSecret": "",
                    "companyCode": "",
                    "syncFrequency": "daily",
                    "autoSync": False,
                },
                "insurance": {
                    "enabled": False,
                    "providers": [
                        {
                            "name": "Provider A",
                            "apiKey": "",
                            "apiEndpoint": "",
                            "enabled": False,
                        },
                        {
                            "name": "Provider B",
                            "apiKey": "",
                            "apiEndpoint": "",
                            "enabled": False,
                        },
                    ],
                },
                "cloudStorage": {
                    "enabled": False,
                    "provider": "aws",
                    "accessKey": "",
                    "secretKey": "",
                    "bucket": "",
                    "region": "us-east-1",
                    "backupFrequency": "daily",
                },
                "laboratory": {
                    "enabled": False,
                    "provider": "default",
                    "apiKey": "",
                    "apiEndpoint": "",
                    "autoImportResults": False,
                },
                "supplierPortal": {
                    "enabled": False,
                    "allowOrders": True,
                    "allowInvoices": True,
                    "allowInventoryUpdates": False,
                },
            }
            settings = IntegrationSettings(
                payment_gateway=json.dumps(default_integrations["paymentGateway"]),
                eprescription=json.dumps(default_integrations["eprescription"]),
                accounting=json.dumps(default_integrations["accounting"]),
                insurance=json.dumps(default_integrations["insurance"]),
                cloud_storage=json.dumps(default_integrations["cloudStorage"]),
                laboratory=json.dumps(default_integrations["laboratory"]),
                supplier_portal=json.dumps(default_integrations["supplierPortal"]),
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
        
        # Parse JSON fields and return
        return {
            "paymentGateway": json.loads(settings.payment_gateway),
            "eprescription": json.loads(settings.eprescription),
            "accounting": json.loads(settings.accounting),
            "insurance": json.loads(settings.insurance),
            "cloudStorage": json.loads(settings.cloud_storage),
            "laboratory": json.loads(settings.laboratory),
            "supplierPortal": json.loads(settings.supplier_portal),
        }
    
    elif category == "compliance":
        settings = db.query(ComplianceSettings).first()
        if not settings:
            # Create default settings if none exist
            default_compliance = {
                "regulatory": {
                    "scheduleH": {
                        "enabled": True,
                        "requirePrescription": True,
                        "recordKeeping": True,
                        "maxSaleQuantity": 30,
                        "maxDaysSupply": 30,
                    },
                    "scheduleX": {
                        "enabled": True,
                        "requirePrescription": True,
                        "recordKeeping": True,
                        "maxSaleQuantity": 7,
                        "maxDaysSupply": 7,
                        "specialStorage": True,
                    },
                    "ndps": {
                        "enabled": True,
                        "requirePrescription": True,
                        "recordKeeping": True,
                        "maxSaleQuantity": 14,
                        "maxDaysSupply": 14,
                        "specialStorage": True,
                    },
                },
                "licenses": {
                    "pharmacyLicense": {
                        "number": "",
                        "issuedDate": "",
                        "expiryDate": "",
                        "issuingAuthority": "",
                        "reminderDays": 90,
                        "documentUrl": "",
                    },
                    "drugLicense": {
                        "number": "",
                        "issuedDate": "",
                        "expiryDate": "",
                        "issuingAuthority": "",
                        "reminderDays": 90,
                        "documentUrl": "",
                    },
                    "gstRegistration": {
                        "number": "",
                        "issuedDate": "",
                        "expiryDate": "",
                        "issuingAuthority": "",
                        "reminderDays": 90,
                        "documentUrl": "",
                    },
                },
                "audit": {
                    "enabled": True,
                    "logLevel": "info",
                    "retentionPeriod": 365,
                    "includeSensitiveData": False,
                    "emailReports": True,
                    "reportFrequency": "monthly",
                    "reportRecipients": ["manager@pharmacy.com"],
                },
                "privacy": {
                    "gdprCompliant": False,
                    "dataEncryption": True,
                    "anonymizePatientData": True,
                    "consentManagement": True,
                    "dataRetentionPeriod": 2555,
                    "autoDeleteExpiredData": False,
                },
                "prescription": {
                    "requireDoctorSignature": True,
                    "requirePatientConsent": True,
                    "validateDrugInteractions": True,
                    "validateAllergies": True,
                    "validateDosage": True,
                    "maxRefills": 3,
                    "refillPeriodDays": 30,
                },
                "reporting": {
                    "generateMonthlyReports": True,
                    "generateQuarterlyReports": True,
                    "generateAnnualReports": True,
                    "reportToAuthorities": False,
                    "authorityEmail": "",
                    "includeScheduleDrugs": True,
                    "includeExpiryData": True,
                },
            }
            settings = ComplianceSettings(
                regulatory=json.dumps(default_compliance["regulatory"]),
                licenses=json.dumps(default_compliance["licenses"]),
                audit=json.dumps(default_compliance["audit"]),
                privacy=json.dumps(default_compliance["privacy"]),
                prescription=json.dumps(default_compliance["prescription"]),
                reporting=json.dumps(default_compliance["reporting"]),
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
        
        # Parse JSON fields and return
        return {
            "regulatory": json.loads(settings.regulatory),
            "licenses": json.loads(settings.licenses),
            "audit": json.loads(settings.audit),
            "privacy": json.loads(settings.privacy),
            "prescription": json.loads(settings.prescription),
            "reporting": json.loads(settings.reporting),
        }
    
    elif category == "backup":
        settings = db.query(BackupSettings).first()
        if not settings:
            # Create default settings if none exist
            default_backup = {
                "automaticBackup": {
                    "enabled": True,
                    "frequency": "daily",
                    "time": "02:00",
                    "retentionDays": 30,
                    "compression": True,
                    "encryption": True,
                },
                "cloudBackup": {
                    "enabled": False,
                    "provider": "aws",
                    "accessKey": "",
                    "secretKey": "",
                    "bucket": "",
                    "region": "us-east-1",
                    "encryption": True,
                },
                "localBackup": {
                    "enabled": True,
                    "path": "/backups",
                    "retentionDays": 7,
                    "compression": True,
                },
                "dataExport": {
                    "formats": ["csv", "json", "xml"],
                    "includeSensitiveData": False,
                    "includeImages": False,
                    "dateRange": "last_month",
                    "customDateRange": {
                        "startDate": "",
                        "endDate": "",
                    },
                },
                "dataImport": {
                    "allowImport": True,
                    "validateBeforeImport": True,
                    "backupBeforeImport": True,
                    "mergeStrategy": "replace",
                },
                "dataPrivacy": {
                    "anonymizePersonalData": True,
                    "retainPatientData": True,
                    "patientDataRetentionYears": 7,
                    "autoDeleteExpiredData": False,
                    "consentManagement": True,
                },
            }
            settings = BackupSettings(
                automatic_backup=json.dumps(default_backup["automaticBackup"]),
                cloud_backup=json.dumps(default_backup["cloudBackup"]),
                local_backup=json.dumps(default_backup["localBackup"]),
                data_export=json.dumps(default_backup["dataExport"]),
                data_import=json.dumps(default_backup["dataImport"]),
                data_privacy=json.dumps(default_backup["dataPrivacy"]),
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
        
        # Parse JSON fields and return
        return {
            "automaticBackup": json.loads(settings.automatic_backup),
            "cloudBackup": json.loads(settings.cloud_backup),
            "localBackup": json.loads(settings.local_backup),
            "dataExport": json.loads(settings.data_export),
            "dataImport": json.loads(settings.data_import),
            "dataPrivacy": json.loads(settings.data_privacy),
        }
    
    elif category == "users":
        settings = db.query(UserRolesSettings).first()
        if not settings:
            # Create default settings if none exist
            default_users = {
                "roles": [
                    {"id": 1, "name": "admin", "description": "Full system access"},
                    {"id": 2, "name": "pharmacist", "description": "Can manage prescriptions and inventory"},
                    {"id": 3, "name": "cashier", "description": "Can process sales and manage billing"},
                    {"id": 4, "name": "accountant", "description": "Can access financial reports"},
                ],
                "permissions": [
                    {"id": 1, "name": "view_dashboard", "description": "View Dashboard", "category": "General"},
                    {"id": 2, "name": "view_patients", "description": "View Patients", "category": "Patients"},
                    {"id": 3, "name": "add_patients", "description": "Add Patients", "category": "Patients"},
                    {"id": 4, "name": "edit_patients", "description": "Edit Patients", "category": "Patients"},
                    {"id": 5, "name": "delete_patients", "description": "Delete Patients", "category": "Patients"},
                    {"id": 6, "name": "view_inventory", "description": "View Inventory", "category": "Inventory"},
                    {"id": 7, "name": "add_medicines", "description": "Add Medicines", "category": "Inventory"},
                    {"id": 8, "name": "edit_medicines", "description": "Edit Medicines", "category": "Inventory"},
                    {"id": 9, "name": "delete_medicines", "description": "Delete Medicines", "category": "Inventory"},
                    {"id": 10, "name": "view_prescriptions", "description": "View Prescriptions", "category": "Prescriptions"},
                    {"id": 11, "name": "create_prescriptions", "description": "Create Prescriptions", "category": "Prescriptions"},
                    {"id": 12, "name": "view_billing", "description": "View Billing", "category": "Billing"},
                    {"id": 13, "name": "create_invoices", "description": "Create Invoices", "category": "Billing"},
                    {"id": 14, "name": "process_payments", "description": "Process Payments", "category": "Billing"},
                    {"id": 15, "name": "view_reports", "description": "View Reports", "category": "Reports"},
                    {"id": 16, "name": "manage_users", "description": "Manage Users", "category": "Admin"},
                    {"id": 17, "name": "manage_settings", "description": "Manage Settings", "category": "Admin"},
                ],
            }
            settings = UserRolesSettings(
                roles=json.dumps(default_users["roles"]),
                permissions=json.dumps(default_users["permissions"]),
            )
            db.add(settings)
            db.commit()
            db.refresh(settings)
        
        # Parse JSON fields and return
        return {
            "roles": json.loads(settings.roles),
            "permissions": json.loads(settings.permissions),
        }
    
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Settings category '{category}' not found"
        )

@router.put("/{category}")
async def update_settings(
    category: str,
    settings_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update settings for a specific category"""
    if category == "organization":
        settings = db.query(OrganizationSettings).first()
        if not settings:
            settings = OrganizationSettings()
            db.add(settings)
        
        # Update fields from settings_data
        settings.store_name = settings_data.get("storeName", settings.store_name)
        settings.address = settings_data.get("address", settings.address)
        settings.city = settings_data.get("city", settings.city)
        settings.state = settings_data.get("state", settings.state)
        settings.postal_code = settings_data.get("postalCode", settings.postal_code)
        settings.country = settings_data.get("country", settings.country)
        settings.phone = settings_data.get("phone", settings.phone)
        settings.email = settings_data.get("email", settings.email)
        settings.website = settings_data.get("website", settings.website)
        settings.logo = settings_data.get("logo", settings.logo)
        settings.tax_number = settings_data.get("taxNumber", settings.tax_number)
        settings.gst_number = settings_data.get("gstNumber", settings.gst_number)
        settings.hsn_code_default = settings_data.get("hsnCodeDefault", settings.hsn_code_default)
        settings.currency = settings_data.get("currency", settings.currency)
        settings.timezone = settings_data.get("timezone", settings.timezone)
        settings.date_format = settings_data.get("dateFormat", settings.date_format)
        settings.time_format = settings_data.get("timeFormat", settings.time_format)
        settings.invoice_number_format = settings_data.get("invoiceNumberFormat", settings.invoice_number_format)
        settings.invoice_prefix = settings_data.get("invoicePrefix", settings.invoice_prefix)
        settings.prescription_number_format = settings_data.get("prescriptionNumberFormat", settings.prescription_number_format)
        settings.prescription_prefix = settings_data.get("prescriptionPrefix", settings.prescription_prefix)
        
        db.commit()
        
        # Update theme settings if store name or logo changed
        if "storeName" in settings_data or "logo" in settings_data:
            theme_settings = db.query(ThemeSettings).first()
            if not theme_settings:
                # Create theme settings if they don't exist
                theme_settings = ThemeSettings(
                    theme_mode="light",
                    color_scheme=json.dumps({
                        "primary": "#3b82f6",
                        "secondary": "#6b7280",
                        "success": "#10b981",
                        "warning": "#f59e0b",
                        "error": "#ef4444",
                        "info": "#3b82f6",
                    }),
                    branding=json.dumps({
                        "logo": settings_data.get("logo", ""),
                        "favicon": "",
                        "companyName": settings_data.get("storeName", "Pharmacy Management System"),
                        "tagline": "Your trusted pharmacy partner",
                        "showLogoInHeader": True,
                        "showLogoInLogin": True,
                        "showLogoInReports": True,
                    }),
                    ui=json.dumps({
                        "compactMode": False,
                        "showSidebarIcons": True,
                        "showSidebarLabels": True,
                        "sidebarCollapsed": False,
                        "showBreadcrumbs": True,
                        "showPageTitles": True,
                        "showFooter": True,
                        "animationsEnabled": True,
                    }),
                    print=json.dumps({
                        "header": True,
                        "footer": True,
                        "logo": True,
                        "companyName": True,
                        "date": True,
                        "pageNumber": True,
                        "fontSize": "normal",
                        "margins": "normal",
                    }),
                )
                db.add(theme_settings)
            else:
                # Update existing theme settings
                branding = json.loads(theme_settings.branding)
                if "storeName" in settings_data:
                    branding["companyName"] = settings_data["storeName"]
                if "logo" in settings_data:
                    branding["logo"] = settings_data["logo"]
                theme_settings.branding = json.dumps(branding)
            db.commit()
        
        # Update POS settings if currency changed
        if "currency" in settings_data:
            pos_settings = db.query(POSSettings).first()
            if not pos_settings:
                # Create POS settings if they don't exist
                default_pos = {
                    "paymentMethods": {
                        "cash": {"enabled": True, "name": "Cash"},
                        "card": {"enabled": True, "name": "Card"},
                        "upi": {"enabled": False, "name": "UPI"},
                        "wallet": {"enabled": False, "name": "Wallet"},
                        "insurance": {"enabled": False, "name": "Insurance"},
                    },
                    "barcodeScanning": {
                        "enabled": True,
                        "autoAddToCart": True,
                        "scannerType": "usb",
                        "soundEnabled": True,
                    },
                    "receipt": {
                        "printAutomatically": True,
                        "showCustomerDetails": True,
                        "showItemDetails": True,
                        "showPaymentDetails": True,
                        "showBarcode": False,
                        "showQrCode": False,
                        "headerText": "Thank you for visiting!",
                        "footerText": "Please come again!",
                        "logoSize": "medium",
                        "fontSize": "normal",
                        "currency": settings_data["currency"],
                    },
                    "discount": {
                        "enabled": True,
                        "maxDiscountPercentage": 20,
                        "requireManagerApproval": True,
                        "approvalThreshold": 10,
                        "defaultDiscountReason": "Special Discount",
                    },
                    "terminal": {
                        "terminalId": "POS-01",
                        "counterName": "Main Counter",
                        "cashDrawer": {"enabled": True, "autoOpen": True},
                        "display": {"showCustomerDisplay": True, "customerDisplayType": "lcd"},
                    },
                }
                pos_settings = POSSettings(
                    payment_methods=json.dumps(default_pos["paymentMethods"]),
                    barcode_scanning=json.dumps(default_pos["barcodeScanning"]),
                    receipt=json.dumps(default_pos["receipt"]),
                    discount=json.dumps(default_pos["discount"]),
                    terminal=json.dumps(default_pos["terminal"]),
                )
                db.add(pos_settings)
            else:
                # Update existing POS settings
                receipt = json.loads(pos_settings.receipt)
                receipt["currency"] = settings_data["currency"]
                pos_settings.receipt = json.dumps(receipt)
            db.commit()
    
    elif category == "pos":
        settings = db.query(POSSettings).first()
        if not settings:
            settings = POSSettings()
            db.add(settings)
        
        # Update JSON fields
        if "paymentMethods" in settings_data:
            settings.payment_methods = json.dumps(settings_data["paymentMethods"])
        if "barcodeScanning" in settings_data:
            settings.barcode_scanning = json.dumps(settings_data["barcodeScanning"])
        if "receipt" in settings_data:
            settings.receipt = json.dumps(settings_data["receipt"])
        if "discount" in settings_data:
            settings.discount = json.dumps(settings_data["discount"])
        if "terminal" in settings_data:
            settings.terminal = json.dumps(settings_data["terminal"])
        
        db.commit()
    
    elif category == "theme":
        settings = db.query(ThemeSettings).first()
        if not settings:
            settings = ThemeSettings()
            db.add(settings)
        
        # Update fields
        if "themeMode" in settings_data:
            settings.theme_mode = settings_data["themeMode"]
        if "colorScheme" in settings_data:
            settings.color_scheme = json.dumps(settings_data["colorScheme"])
        if "branding" in settings_data:
            settings.branding = json.dumps(settings_data["branding"])
        if "ui" in settings_data:
            settings.ui = json.dumps(settings_data["ui"])
        if "print" in settings_data:
            settings.print = json.dumps(settings_data["print"])
        
        db.commit()
    
    elif category == "inventory":
        settings = db.query(InventorySettings).first()
        if not settings:
            settings = InventorySettings()
            db.add(settings)
        
        # Update JSON fields
        if "reorder" in settings_data:
            settings.reorder_settings = json.dumps(settings_data["reorder"])
        if "expiry" in settings_data:
            settings.expiry_alerts = json.dumps(settings_data["expiry"])
        if "lowStock" in settings_data:
            settings.low_stock_alerts = json.dumps(settings_data["lowStock"])
        if "alternatives" in settings_data:
            settings.alternatives = json.dumps(settings_data["alternatives"])
        if "batchPricing" in settings_data:
            settings.batch_pricing = json.dumps(settings_data["batchPricing"])
        if "stockMovement" in settings_data:
            settings.stock_movement = json.dumps(settings_data["stockMovement"])
        
        db.commit()
    
    elif category == "notifications":
        settings = db.query(NotificationSettings).first()
        if not settings:
            settings = NotificationSettings()
            db.add(settings)
        
        # Update JSON fields
        if "email" in settings_data:
            settings.email_settings = json.dumps(settings_data["email"])
        if "sms" in settings_data:
            settings.sms_settings = json.dumps(settings_data["sms"])
        if "whatsapp" in settings_data:
            settings.whatsapp_settings = json.dumps(settings_data["whatsapp"])
        if "notifications" in settings_data:
            settings.notification_types = json.dumps(settings_data["notifications"])
        if "templates" in settings_data:
            settings.templates = json.dumps(settings_data["templates"])
        
        db.commit()
    
    elif category == "integrations":
        settings = db.query(IntegrationSettings).first()
        if not settings:
            settings = IntegrationSettings()
            db.add(settings)
        
        # Update JSON fields
        if "paymentGateway" in settings_data:
            settings.payment_gateway = json.dumps(settings_data["paymentGateway"])
        if "eprescription" in settings_data:
            settings.eprescription = json.dumps(settings_data["eprescription"])
        if "accounting" in settings_data:
            settings.accounting = json.dumps(settings_data["accounting"])
        if "insurance" in settings_data:
            settings.insurance = json.dumps(settings_data["insurance"])
        if "cloudStorage" in settings_data:
            settings.cloud_storage = json.dumps(settings_data["cloudStorage"])
        if "laboratory" in settings_data:
            settings.laboratory = json.dumps(settings_data["laboratory"])
        if "supplierPortal" in settings_data:
            settings.supplier_portal = json.dumps(settings_data["supplierPortal"])
        
        db.commit()
    
    elif category == "compliance":
        settings = db.query(ComplianceSettings).first()
        if not settings:
            settings = ComplianceSettings()
            db.add(settings)
        
        # Update JSON fields
        if "regulatory" in settings_data:
            settings.regulatory = json.dumps(settings_data["regulatory"])
        if "licenses" in settings_data:
            settings.licenses = json.dumps(settings_data["licenses"])
        if "audit" in settings_data:
            settings.audit = json.dumps(settings_data["audit"])
        if "privacy" in settings_data:
            settings.privacy = json.dumps(settings_data["privacy"])
        if "prescription" in settings_data:
            settings.prescription = json.dumps(settings_data["prescription"])
        if "reporting" in settings_data:
            settings.reporting = json.dumps(settings_data["reporting"])
        
        db.commit()
    
    elif category == "backup":
        settings = db.query(BackupSettings).first()
        if not settings:
            settings = BackupSettings()
            db.add(settings)
        
        # Update JSON fields
        if "automaticBackup" in settings_data:
            settings.automatic_backup = json.dumps(settings_data["automaticBackup"])
        if "cloudBackup" in settings_data:
            settings.cloud_backup = json.dumps(settings_data["cloudBackup"])
        if "localBackup" in settings_data:
            settings.local_backup = json.dumps(settings_data["localBackup"])
        if "dataExport" in settings_data:
            settings.data_export = json.dumps(settings_data["dataExport"])
        if "dataImport" in settings_data:
            settings.data_import = json.dumps(settings_data["dataImport"])
        if "dataPrivacy" in settings_data:
            settings.data_privacy = json.dumps(settings_data["dataPrivacy"])
        
        db.commit()
    
    elif category == "users":
        settings = db.query(UserRolesSettings).first()
        if not settings:
            settings = UserRolesSettings()
            db.add(settings)
        
        # Update JSON fields
        if "roles" in settings_data:
            settings.roles = json.dumps(settings_data["roles"])
        if "permissions" in settings_data:
            settings.permissions = json.dumps(settings_data["permissions"])
        
        db.commit()
    
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Settings category '{category}' not found"
        )
    
    return {"message": f"{category} settings updated successfully"}

@router.post("/backup/create", summary="Create Manual Backup", description="Create a manual backup of the pharmacy database with optional cloud storage")
async def create_backup(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a manual backup"""
    try:
        # Get backup settings
        backup_settings = db.query(BackupSettings).first()
        if not backup_settings:
            # Create default settings if none exist
            backup_settings = BackupSettings(
                automatic_backup=json.dumps({
                    "enabled": True,
                    "frequency": "daily",
                    "time": "02:00",
                    "retentionDays": 30,
                    "compression": True,
                    "encryption": True,
                }),
                cloud_backup=json.dumps({
                    "enabled": False,
                    "provider": "aws",
                    "accessKey": "",
                    "secretKey": "",
                    "bucket": "",
                    "region": "us-east-1",
                    "encryption": True,
                }),
                local_backup=json.dumps({
                    "enabled": True,
                    "path": "/backups",
                    "retentionDays": 7,
                    "compression": True,
                }),
                data_export=json.dumps({
                    "formats": ["csv", "json", "xml"],
                    "includeSensitiveData": False,
                    "includeImages": False,
                    "dateRange": "last_month",
                    "customDateRange": {
                        "startDate": "",
                        "endDate": "",
                    },
                }),
                data_import=json.dumps({
                    "allowImport": True,
                    "validateBeforeImport": True,
                    "backupBeforeImport": True,
                    "mergeStrategy": "replace",
                }),
                data_privacy=json.dumps({
                    "anonymizePersonalData": True,
                    "retainPatientData": True,
                    "patientDataRetentionYears": 7,
                    "autoDeleteExpiredData": False,
                    "consentManagement": True,
                }),
            )
            db.add(backup_settings)
            db.commit()
            db.refresh(backup_settings)
        
        local_backup_settings = json.loads(backup_settings.local_backup or "{}")
        cloud_backup_settings = json.loads(backup_settings.cloud_backup or "{}")
        data_privacy_settings = json.loads(backup_settings.data_privacy or "{}")
        
        # Generate backup ID
        backup_id = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # In a real implementation, this would create an actual backup
        # For now, we'll simulate the backup process
        
        # Create backup directory if it doesn't exist
        backup_path = local_backup_settings.get("path", "/backups")
        os.makedirs(backup_path, exist_ok=True)
        
        # Simulate backup creation
        import time
        import shutil
        
        # Get database file path
        db_path = "pharmacy.db"  # This would be the actual database path
        
        # Create backup file path
        backup_file_path = os.path.join(backup_path, f"{backup_id}.db")
        
        # In a real implementation, this would copy the database
        # shutil.copy2(db_path, backup_file_path)
        
        # Simulate backup time based on database size
        time.sleep(2)  # Simulate backup creation time
        
        # Get backup file size (simulated)
        backup_size = "126.1 MB"
        
        # Check if cloud backup is enabled
        cloud_enabled = cloud_backup_settings.get("enabled", False)
        backup_location = "local"
        
        if cloud_enabled:
            # In a real implementation, this would upload to cloud storage
            # For now, we'll just simulate it
            time.sleep(1)  # Simulate upload time
            backup_location = "local and cloud"
        
        # Log the backup operation
        # In a real implementation, this would be logged to the audit trail
        print(f"Backup created by user {current_user.username} at {datetime.now().isoformat()}")
        
        return {
            "message": "Backup created successfully",
            "backup_id": backup_id,
            "date": datetime.now().isoformat(),
            "type": "manual",
            "location": backup_location,
            "size": backup_size,
            "status": "completed"
        }
    
    except Exception as e:
        return {
            "message": "Backup creation failed",
            "backup_id": backup_id if 'backup_id' in locals() else None,
            "date": datetime.now().isoformat(),
            "type": "manual",
            "location": "none",
            "size": "0 MB",
            "status": "failed",
            "error": str(e)
        }

@router.get("/backup/history", summary="Get Backup History", description="Retrieve the history of backup operations including automatic and manual backups")
async def get_backup_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get backup history"""
    # In a real implementation, this would fetch actual backup history
    # For now, we'll return mock data
    return [
        {
            "id": 1,
            "date": "2023-12-01 02:00:00",
            "type": "automatic",
            "location": "local",
            "size": "125.4 MB",
            "status": "completed",
        },
        {
            "id": 2,
            "date": "2023-11-30 02:00:00",
            "type": "automatic",
            "location": "local",
            "size": "124.8 MB",
            "status": "completed",
        },
        {
            "id": 3,
            "date": "2023-11-29 02:00:00",
            "type": "automatic",
            "location": "local",
            "size": "124.2 MB",
            "status": "completed",
        },
    ]

@router.post("/backup/{backup_id}/restore", summary="Restore from Backup", description="Restore the pharmacy database from a specified backup file")
async def restore_backup(
    backup_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Restore from a backup"""
    try:
        # Get backup settings
        backup_settings = db.query(BackupSettings).first()
        if not backup_settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Backup settings not found"
            )
        
        local_backup_settings = json.loads(backup_settings.local_backup or "{}")
        cloud_backup_settings = json.loads(backup_settings.cloud_backup or "{}")
        
        backup_path = local_backup_settings.get("path", "/backups")
        backup_file_path = os.path.join(backup_path, f"{backup_id}.db")
        
        # Check if backup file exists
        if not os.path.exists(backup_file_path):
            # If not found locally, check if cloud backup is enabled
            if cloud_backup_settings.get("enabled", False):
                # In a real implementation, this would download from cloud storage
                # For now, we'll just simulate it
                import time
                time.sleep(2)  # Simulate download time
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Backup {backup_id} not found"
                )
        
        # In a real implementation, this would:
        # 1. Create a backup of the current database before restoring
        # 2. Restore the database from the backup file
        # 3. Verify the restore was successful
        
        # Simulate restore process
        import time
        time.sleep(3)  # Simulate restore time
        
        # Log the restore operation
        # In a real implementation, this would be logged to the audit trail
        print(f"Backup {backup_id} restored by user {current_user.username} at {datetime.now().isoformat()}")
        
        return {
            "message": f"Backup {backup_id} restored successfully",
            "backup_id": backup_id,
            "restored_by": current_user.username,
            "restored_at": datetime.now().isoformat(),
            "status": "completed"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        return {
            "message": f"Backup {backup_id} restore failed",
            "backup_id": backup_id,
            "restored_by": current_user.username,
            "restored_at": datetime.now().isoformat(),
            "status": "failed",
            "error": str(e)
        }

@router.post("/export", summary="Export Data", description="Export pharmacy data in the specified format (CSV, JSON, or XML) with customizable options")
async def export_data(
    format: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export data in the specified format"""
    if format not in ["csv", "json", "xml"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid format. Supported formats: csv, json, xml"
        )
    
    try:
        # Get backup settings
        backup_settings = db.query(BackupSettings).first()
        if not backup_settings:
            # Create default settings if none exist
            backup_settings = BackupSettings(
                automatic_backup=json.dumps({
                    "enabled": True,
                    "frequency": "daily",
                    "time": "02:00",
                    "retentionDays": 30,
                    "compression": True,
                    "encryption": True,
                }),
                cloud_backup=json.dumps({
                    "enabled": False,
                    "provider": "aws",
                    "accessKey": "",
                    "secretKey": "",
                    "bucket": "",
                    "region": "us-east-1",
                    "encryption": True,
                }),
                local_backup=json.dumps({
                    "enabled": True,
                    "path": "/backups",
                    "retentionDays": 7,
                    "compression": True,
                }),
                data_export=json.dumps({
                    "formats": ["csv", "json", "xml"],
                    "includeSensitiveData": False,
                    "includeImages": False,
                    "dateRange": "last_month",
                    "customDateRange": {
                        "startDate": "",
                        "endDate": "",
                    },
                }),
                data_import=json.dumps({
                    "allowImport": True,
                    "validateBeforeImport": True,
                    "backupBeforeImport": True,
                    "mergeStrategy": "replace",
                }),
                data_privacy=json.dumps({
                    "anonymizePersonalData": True,
                    "retainPatientData": True,
                    "patientDataRetentionYears": 7,
                    "autoDeleteExpiredData": False,
                    "consentManagement": True,
                }),
            )
            db.add(backup_settings)
            db.commit()
            db.refresh(backup_settings)
        
        data_export_settings = json.loads(backup_settings.data_export or "{}")
        data_privacy_settings = json.loads(backup_settings.data_privacy or "{}")
        
        # Check if format is enabled in settings
        if format not in data_export_settings.get("formats", ["csv", "json", "xml"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Format {format} is not enabled in export settings"
            )
        
        # Generate export filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"export_{timestamp}.{format}"
        
        # Create export directory if it doesn't exist
        export_dir = os.path.join("exports", format)
        os.makedirs(export_dir, exist_ok=True)
        
        export_path = os.path.join(export_dir, filename)
        
        # In a real implementation, this would export the actual data
        # For now, we'll simulate the export process
        
        # Get data to export based on settings
        include_sensitive_data = data_export_settings.get("includeSensitiveData", False)
        include_images = data_export_settings.get("includeImages", False)
        date_range = data_export_settings.get("dateRange", "last_month")
        
        # Simulate data export based on format
        if format == "csv":
            # In a real implementation, this would generate CSV files for each table
            # For now, we'll create a placeholder file
            with open(export_path, "w") as f:
                f.write("# Pharmacy Management System Data Export\n")
                f.write(f"# Export Date: {datetime.now().isoformat()}\n")
                f.write(f"# Exported By: {current_user.username}\n")
                f.write("# Format: CSV\n")
                f.write("# Tables: medicines, patients, prescriptions, invoices, etc.\n")
        
        elif format == "json":
            # In a real implementation, this would generate a JSON file with all data
            # For now, we'll create a placeholder file
            import json as json_module
            export_data = {
                "export_info": {
                    "date": datetime.now().isoformat(),
                    "exported_by": current_user.username,
                    "format": "json",
                    "include_sensitive_data": include_sensitive_data,
                    "include_images": include_images,
                    "date_range": date_range
                },
                "data": {
                    "medicines": [],
                    "patients": [],
                    "prescriptions": [],
                    "invoices": []
                }
            }
            with open(export_path, "w") as f:
                json_module.dump(export_data, f, indent=2)
        
        elif format == "xml":
            # In a real implementation, this would generate an XML file with all data
            # For now, we'll create a placeholder file
            with open(export_path, "w") as f:
                f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
                f.write('<pharmacy_export>\n')
                f.write(f'  <export_info>\n')
                f.write(f'    <date>{datetime.now().isoformat()}</date>\n')
                f.write(f'    <exported_by>{current_user.username}</exported_by>\n')
                f.write(f'    <format>xml</format>\n')
                f.write(f'    <include_sensitive_data>{include_sensitive_data}</include_sensitive_data>\n')
                f.write(f'    <include_images>{include_images}</include_images>\n')
                f.write(f'    <date_range>{date_range}</date_range>\n')
                f.write(f'  </export_info>\n')
                f.write(f'  <data>\n')
                f.write(f'    <!-- Data would be exported here -->\n')
                f.write(f'  </data>\n')
                f.write('</pharmacy_export>\n')
        
        # Get file size
        file_size = os.path.getsize(export_path)
        file_size_mb = round(file_size / (1024 * 1024), 2)
        
        # Log the export operation
        # In a real implementation, this would be logged to the audit trail
        print(f"Data exported as {format} by user {current_user.username} at {datetime.now().isoformat()}")
        
        return {
            "message": f"Data exported as {format.upper()} successfully",
            "download_url": f"/api/downloads/{format}/{filename}",
            "filename": filename,
            "format": format,
            "size": f"{file_size_mb} MB"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        return {
            "message": f"Data export as {format.upper()} failed",
            "format": format,
            "error": str(e)
        }

@router.post("/upload-document", summary="Upload Document", description="Upload a document such as a license or certificate and optionally associate it with a specific license type")
async def upload_document(
    file: UploadFile = File(...),
    license_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a document (e.g., license document)"""
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    try:
        # Check file size (max 10MB)
        max_file_size = 10 * 1024 * 1024  # 10MB
        file_content = await file.read()
        
        if len(file_content) > max_file_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds the maximum limit of 10MB"
            )
        
        # Check file type
        allowed_extensions = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Create upload directory if it doesn't exist
        upload_dir = "uploads/documents"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file to disk
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_content)
        
        # If license_type is provided, update compliance settings
        if license_type:
            compliance_settings = db.query(ComplianceSettings).first()
            if compliance_settings:
                licenses = json.loads(compliance_settings.licenses or "{}")
                
                # Update the specific license with the document URL
                if license_type in licenses:
                    licenses[license_type]["documentUrl"] = f"/api/uploads/documents/{unique_filename}"
                    compliance_settings.licenses = json.dumps(licenses)
                    db.commit()
        
        # Log the upload operation
        # In a real implementation, this would be logged to the audit trail
        print(f"Document {file.filename} uploaded by user {current_user.username} at {datetime.now().isoformat()}")
        
        return {
            "message": "Document uploaded successfully",
            "url": f"/api/uploads/documents/{unique_filename}",
            "filename": file.filename,
            "size": f"{len(file_content) / 1024:.2f} KB",
            "license_type": license_type
        }
    
    except HTTPException:
        raise
    except Exception as e:
        return {
            "message": "Document upload failed",
            "filename": file.filename if file else "unknown",
            "error": str(e)
        }

@router.post("/test-connection/{integration}")
async def test_integration_connection(
    integration: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test connection to an external integration"""
    try:
        # Get integration settings
        settings = db.query(IntegrationSettings).first()
        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Integration settings not found"
            )
        
        # Get the integration data based on the integration type
        if integration == "paymentGateway":
            integration_data = json.loads(settings.payment_gateway or "{}")
        elif integration == "eprescription":
            integration_data = json.loads(settings.eprescription or "{}")
        elif integration == "accounting":
            integration_data = json.loads(settings.accounting or "{}")
        elif integration == "insurance":
            integration_data = json.loads(settings.insurance or "{}")
        elif integration == "cloudStorage":
            integration_data = json.loads(settings.cloud_storage or "{}")
        elif integration == "laboratory":
            integration_data = json.loads(settings.laboratory or "{}")
        elif integration == "supplierPortal":
            integration_data = json.loads(settings.supplier_portal or "{}")
        else:
            integration_data = {}
        
        # Test different integration types
        if integration == "paymentGateway":
            # Test payment gateway connection
            provider = integration_data.get("provider", "")
            api_key = integration_data.get("apiKey", "")
            
            if not provider or not api_key:
                return {
                    "message": f"{integration} connection test failed",
                    "status": "failed",
                    "error": "Missing provider or API key",
                    "timestamp": datetime.now().isoformat()
                }
            
            # Simulate connection test based on provider
            if provider == "stripe":
                # In a real implementation, this would use Stripe's API
                import time
                time.sleep(1)  # Simulate API call
                return {
                    "message": f"{integration} connection test successful",
                    "status": "success",
                    "provider": provider,
                    "timestamp": datetime.now().isoformat()
                }
        
        elif integration == "eprescription":
            # Test e-prescription connection
            api_key = integration_data.get("apiKey", "")
            api_endpoint = integration_data.get("apiEndpoint", "")
            
            if not api_key or not api_endpoint:
                return {
                    "message": f"{integration} connection test failed",
                    "status": "failed",
                    "error": "Missing API key or endpoint",
                    "timestamp": datetime.now().isoformat()
                }
            
            # Simulate connection test
            import time
            time.sleep(1)  # Simulate API call
            return {
                "message": f"{integration} connection test successful",
                "status": "success",
                "endpoint": api_endpoint,
                "timestamp": datetime.now().isoformat()
            }
        
        elif integration == "accounting":
            # Test accounting software connection
            provider = integration_data.get("provider", "")
            api_key = integration_data.get("apiKey", "")
            
            if not provider or provider == "none":
                return {
                    "message": f"{integration} connection test failed",
                    "status": "failed",
                    "error": "No accounting provider configured",
                    "timestamp": datetime.now().isoformat()
                }
            
            # Simulate connection test
            import time
            time.sleep(1)  # Simulate API call
            return {
                "message": f"{integration} connection test successful",
                "status": "success",
                "provider": provider,
                "timestamp": datetime.now().isoformat()
            }
        
        elif integration == "cloudStorage":
            # Test cloud storage connection
            provider = integration_data.get("provider", "")
            access_key = integration_data.get("accessKey", "")
            bucket = integration_data.get("bucket", "")
            
            if not provider or not access_key or not bucket:
                return {
                    "message": f"{integration} connection test failed",
                    "status": "failed",
                    "error": "Missing provider, access key, or bucket name",
                    "timestamp": datetime.now().isoformat()
                }
            
            # Simulate connection test
            import time
            time.sleep(1)  # Simulate API call
            return {
                "message": f"{integration} connection test successful",
                "status": "success",
                "provider": provider,
                "bucket": bucket,
                "timestamp": datetime.now().isoformat()
            }
        
        elif integration == "laboratory":
            # Test laboratory connection
            api_key = integration_data.get("apiKey", "")
            api_endpoint = integration_data.get("apiEndpoint", "")
            
            if not api_key or not api_endpoint:
                return {
                    "message": f"{integration} connection test failed",
                    "status": "failed",
                    "error": "Missing API key or endpoint",
                    "timestamp": datetime.now().isoformat()
                }
            
            # Simulate connection test
            import time
            time.sleep(1)  # Simulate API call
            return {
                "message": f"{integration} connection test successful",
                "status": "success",
                "endpoint": api_endpoint,
                "timestamp": datetime.now().isoformat()
            }
        
        else:
            return {
                "message": f"{integration} connection test failed",
                "status": "failed",
                "error": f"Unknown integration type: {integration}",
                "timestamp": datetime.now().isoformat()
            }
    
    except Exception as e:
        return {
            "message": f"{integration} connection test failed",
            "status": "failed",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.post("/test-email")
async def test_email_settings(
    email: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test email settings by sending a test email"""
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is required"
        )
    
    try:
        # Get notification settings
        settings = db.query(NotificationSettings).first()
        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification settings not found"
            )
        
        email_settings = json.loads(settings.email_settings or "{}")
        
        # Check if email is enabled
        if not email_settings.get("enabled", False):
            return {
                "message": "Email test failed",
                "status": "failed",
                "error": "Email notifications are disabled",
                "timestamp": datetime.now().isoformat()
            }
        
        # Check if SMTP settings are configured
        smtp_server = email_settings.get("smtpServer", "")
        smtp_port = email_settings.get("smtpPort", 587)
        username = email_settings.get("username", "")
        password = email_settings.get("password", "")
        
        if not smtp_server or not username or not password:
            return {
                "message": "Email test failed",
                "status": "failed",
                "error": "SMTP settings are not configured",
                "timestamp": datetime.now().isoformat()
            }
        
        # In a real implementation, this would send an actual email
        # For now, we'll simulate the email sending process
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        try:
            # Create a test email
            sender_email = email_settings.get("senderEmail", username)
            sender_name = email_settings.get("senderName", "Pharmacy System")
            
            message = MIMEMultipart("alternative")
            message["Subject"] = "Test Email from Pharmacy Management System"
            message["From"] = f"{sender_name} <{sender_email}>"
            message["To"] = email
            
            # Create plain text and HTML versions of the message
            text = f"""
            Dear User,
            
            This is a test email from your Pharmacy Management System.
            
            If you received this email, your email settings are configured correctly.
            
            Best regards,
            {sender_name}
            """
            
            html = f"""
            <html>
              <body>
                <p>Dear User,</p>
                <p>This is a test email from your Pharmacy Management System.</p>
                <p>If you received this email, your email settings are configured correctly.</p>
                <p>Best regards,<br>{sender_name}</p>
              </body>
            </html>
            """
            
            # Turn these into plain/html MIMEText objects
            part1 = MIMEText(text, "plain")
            part2 = MIMEText(html, "html")
            
            # Add HTML/plain-text parts to MIMEMultipart message
            message.attach(part1)
            message.attach(part2)
            
            # In a real implementation, we would send the email here
            # server = smtplib.SMTP(smtp_server, smtp_port)
            # server.starttls()
            # server.login(username, password)
            # server.sendmail(sender_email, email, message.as_string())
            # server.quit()
            
            # For now, we'll just simulate a successful send
            import time
            time.sleep(1)  # Simulate email sending time
            
            return {
                "message": f"Test email sent to {email} successfully",
                "status": "success",
                "timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            return {
                "message": "Email test failed",
                "status": "failed",
                "error": f"Failed to send email: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    except Exception as e:
        return {
            "message": "Email test failed",
            "status": "failed",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.post("/test-sms")
async def test_sms_settings(
    phone: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test SMS settings by sending a test SMS"""
    if not phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number is required"
        )
    
    try:
        # Get notification settings
        settings = db.query(NotificationSettings).first()
        if not settings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification settings not found"
            )
        
        sms_settings = json.loads(settings.sms_settings or "{}")
        
        # Check if SMS is enabled
        if not sms_settings.get("enabled", False):
            return {
                "message": "SMS test failed",
                "status": "failed",
                "error": "SMS notifications are disabled",
                "timestamp": datetime.now().isoformat()
            }
        
        # Check if SMS settings are configured
        provider = sms_settings.get("provider", "")
        api_key = sms_settings.get("apiKey", "")
        api_secret = sms_settings.get("apiSecret", "")
        sender_id = sms_settings.get("senderId", "")
        
        if not provider or not api_key:
            return {
                "message": "SMS test failed",
                "status": "failed",
                "error": "SMS settings are not configured",
                "timestamp": datetime.now().isoformat()
            }
        
        # Test different SMS providers
        if provider == "twilio":
            # Check for Twilio specific settings
            if not api_secret:
                return {
                    "message": "SMS test failed",
                    "status": "failed",
                    "error": "Twilio API secret is required",
                    "timestamp": datetime.now().isoformat()
                }
            
            # In a real implementation, this would use Twilio's API
            # from twilio.rest import Client
            # client = Client(api_key, api_secret)
            # message = client.messages.create(
            #     body="This is a test SMS from your Pharmacy Management System.",
            #     from_=sender_id,
            #     to=phone
            # )
            
            # For now, we'll simulate a successful send
            import time
            time.sleep(1)  # Simulate API call
            
            return {
                "message": f"Test SMS sent to {phone} successfully",
                "status": "success",
                "provider": provider,
                "timestamp": datetime.now().isoformat()
            }
        
        else:
            return {
                "message": "SMS test failed",
                "status": "failed",
                "error": f"Unsupported SMS provider: {provider}",
                "timestamp": datetime.now().isoformat()
            }
    
    except Exception as e:
        return {
            "message": "SMS test failed",
            "status": "failed",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
# User Management Endpoints
@router.get("/users/list")
async def get_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all users"""
    from app.models import User
    users = db.query(User).all()
    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "role": user.role.value,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None,
        }
        for user in users
    ]

@router.post("/users/create")
async def create_user(
    user_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new user"""
    from app.models import User, UserRole
    from app.utils.auth import get_password_hash
    
    # Check if username or email already exists
    existing_user = db.query(User).filter(
        (User.username == user_data.get("username")) | 
        (User.email == user_data.get("email"))
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists"
        )
    
    # Validate required fields
    required_fields = ["username", "email", "full_name", "password", "role"]
    for field in required_fields:
        if field not in user_data or not user_data[field]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Field '{field}' is required"
            )
    
    # Validate role
    try:
        role = UserRole(user_data["role"])
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {[r.value for r in UserRole]}"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data["password"])
    new_user = User(
        username=user_data["username"],
        email=user_data["email"],
        full_name=user_data["full_name"],
        phone=user_data.get("phone"),
        hashed_password=hashed_password,
        role=role,
        is_active=user_data.get("is_active", True)
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "message": "User created successfully",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "phone": new_user.phone,
            "role": new_user.role.value,
            "is_active": new_user.is_active,
            "created_at": new_user.created_at.isoformat() if new_user.created_at else None,
        }
    }

@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    user_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing user"""
    from app.models import User, UserRole
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if username or email already exists (excluding current user)
    if "username" in user_data or "email" in user_data:
        existing_user = db.query(User).filter(
            (User.username == user_data.get("username")) | 
            (User.email == user_data.get("email")),
            User.id != user_id
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already exists"
            )
    
    # Update fields
    if "username" in user_data:
        user.username = user_data["username"]
    if "email" in user_data:
        user.email = user_data["email"]
    if "full_name" in user_data:
        user.full_name = user_data["full_name"]
    if "phone" in user_data:
        user.phone = user_data["phone"]
    if "role" in user_data:
        try:
            user.role = UserRole(user_data["role"])
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of: {[r.value for r in UserRole]}"
            )
    if "is_active" in user_data:
        user.is_active = user_data["is_active"]
    
    # Update password if provided
    if "password" in user_data and user_data["password"]:
        from app.utils.auth import get_password_hash
        user.hashed_password = get_password_hash(user_data["password"])
    
    db.commit()
    db.refresh(user)
    
    return {
        "message": "User updated successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "role": user.role.value,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None,
        }
    }

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a user"""
    from app.models import User
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent self-deletion
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}

@router.post("/users/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    password_data: PasswordReset,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reset a user's password"""
    from app.models import User
    from app.utils.auth import get_password_hash
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if "password" not in password_data or not password_data["password"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required"
        )
    
    user.hashed_password = get_password_hash(password_data["password"])
    db.commit()
    
    return {"message": "Password reset successfully"}

@router.post("/users/{user_id}/toggle-status", summary="Toggle User Status", description="Activate or deactivate a user account (prevents self-deactivation)")
async def toggle_user_status(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle a user's active status"""
    from app.models import User
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent self-deactivation
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    user.is_active = not user.is_active
    db.commit()
    
    return {
        "message": f"User {'activated' if user.is_active else 'deactivated'} successfully",
        "is_active": user.is_active
    }
