import json
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import OrganizationSettings, POSSettings, ThemeSettings

def seed_settings():
    db = SessionLocal()
    try:
        # Check if organization settings already exist
        org_settings = db.query(OrganizationSettings).first()
        if not org_settings:
            org_settings = OrganizationSettings(
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
            db.add(org_settings)
            print("Created default organization settings")
        else:
            print("Organization settings already exist")

        # Check if POS settings already exist
        pos_settings = db.query(POSSettings).first()
        if not pos_settings:
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
            print("Created default POS settings")
        else:
            print("POS settings already exist")

        # Check if theme settings already exist
        theme_settings = db.query(ThemeSettings).first()
        if not theme_settings:
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
            theme_settings = ThemeSettings(
                theme_mode=default_theme["themeMode"],
                color_scheme=json.dumps(default_theme["colorScheme"]),
                branding=json.dumps(default_theme["branding"]),
                ui=json.dumps(default_theme["ui"]),
                print=json.dumps(default_theme["print"]),
            )
            db.add(theme_settings)
            print("Created default theme settings")
        else:
            print("Theme settings already exist")

        db.commit()
        print("Settings seeded successfully!")
    except Exception as e:
        print(f"Error seeding settings: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_settings()