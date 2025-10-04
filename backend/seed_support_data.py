import json
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from app.config import settings
from app.models import KnowledgeBaseArticle, SupportResource, SupportContact, User
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database engine
engine = create_engine(settings.DATABASE_URL)

# Knowledge Base Articles based on README.md
knowledge_base_articles = [
    {
        "title": "Getting Started with the System",
        "content": """# Getting Started with the Pharmacy Management System

This guide will help you get started with the Pharmacy Management System.

## Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

## Quick Start Using Docker

1. Clone the repository
2. Start all services: `docker-compose up --build`
3. Run database migrations: `docker-compose exec backend alembic upgrade head`
4. Access the applications:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Local Development

### Quick Start Scripts
For a quick start, use the provided scripts:
- **Linux/Mac**: `./start-dev.sh`
- **Windows**: `start-dev.bat`

### Manual Setup
See the README.md for detailed manual setup instructions.

## Default Credentials
- **Admin**: username: `admin`, password: `admin123`
- **Pharmacist**: username: `pharmacist`, password: `pharm123`
- **Cashier**: username: `cashier`, password: `cash123`

## PIN Codes
- Admin: 1234
- Pharmacist: 5678
- Cashier: 9012""",
        "category": "Getting Started",
        "tags": ["setup", "installation", "getting started"]
    },
    {
        "title": "User Roles and Permissions",
        "content": """# User Roles and Permissions

The Pharmacy Management System supports four main user roles with different permission levels.

## Admin Role
The Admin has full access to all system features:
- Manage all users and their permissions
- Access all system settings and configurations
- View all reports and analytics
- Manage inventory and suppliers
- Approve prescriptions
- Handle billing and financial operations

## Pharmacist Role
The Pharmacist can:
- Manage inventory and medicines
- Create and approve prescriptions
- View patient information
- Access reporting features
- Manage suppliers
- Cannot manage users or system settings

## Cashier Role
The Cashier can:
- Process sales through the POS system
- Manage patient billing
- View and create invoices
- Handle returns and refunds
- Cannot manage inventory, prescriptions, or system settings

## Doctor Role
The Doctor can:
- Create prescriptions for patients
- View patient medical history
- Access patient information
- Cannot access inventory, billing, or system settings

## Role-Based Access Control
The system implements role-based access control to ensure users only have access to the features they need. This enhances security and simplifies the user interface based on the user's role.""",
        "category": "User Management",
        "tags": ["roles", "permissions", "users", "access control"]
    },
    {
        "title": "Inventory Management Guide",
        "content": """# Inventory Management Guide

This guide covers all aspects of inventory management in the Pharmacy Management System.

## Adding Medicines
1. Navigate to Inventory > Medicines
2. Click "Add Medicine"
3. Fill in the required information:
   - Name, generic name, brand
   - Category, dosage form, strength
   - Manufacturer, barcode/SKU
   - Pricing information
   - Stock details and reorder levels
4. Click "Save" to add the medicine

## Managing Batches
Each medicine can have multiple batches with different:
- Batch/lot numbers
- Expiry dates
- Suppliers
- Purchase and selling prices
- Stock quantities

To add a batch:
1. Navigate to Inventory > Medicines
2. Select a medicine
3. Go to the "Batches" tab
4. Click "Add Batch"
5. Fill in batch details and save

## Stock Alerts
The system automatically generates alerts for:
- Low stock items (below reorder level)
- Expiring items (configurable advance notice)
- Out of stock items

To configure alerts:
1. Go to Settings > Inventory Settings
2. Set reorder level defaults
3. Configure expiry alert timing
4. Save your settings

## Stock Movements
All stock movements are tracked with:
- Movement type (IN, OUT, ADJUSTMENT)
- Quantity and reference
- Reason for movement
- Date and user who performed the action

## CSV Import/Export
You can bulk import or export medicine data using CSV files:
1. Navigate to Inventory > Medicines
2. Click "Import" or "Export"
3. Follow the on-screen instructions
4. For imports, ensure your CSV matches the required format

## Inventory Analytics
Access comprehensive analytics through:
- Inventory > Inventory Analytics
- Dashboard with visual charts
- Stock valuation reports
- Expiry summaries
- Supplier performance metrics""",
        "category": "Inventory",
        "tags": ["inventory", "medicines", "batches", "stock", "alerts"]
    },
    {
        "title": "Prescription Management",
        "content": """# Prescription Management

This guide covers the prescription management features of the system.

## Creating Prescriptions
1. Navigate to Prescriptions > Create New
2. Select or add a patient
3. Fill in prescription details:
   - Doctor information
   - Diagnosis and notes
   - Prescription items (medicines, dosage, frequency, duration)
4. Review and save the prescription

## Prescription Status
Prescriptions can have the following statuses:
- **PENDING**: Awaiting pharmacist review
- **APPROVED**: Approved by pharmacist, ready for dispensing
- **FILLED**: Medicines dispensed to patient
- **CANCELLED**: Prescription cancelled

## Uploading Prescriptions
You can upload scanned or electronic prescriptions:
1. Navigate to Prescriptions > Create New
2. Click "Upload Prescription"
3. Select the file from your device
4. The system will process and attach it to the prescription

## Prescription Validation
The system validates prescriptions against:
- Patient allergies
- Drug interactions
- Dosage limits
- Medicine availability

## Refill Management
To manage prescription refills:
1. Navigate to Prescriptions
2. Select the prescription
3. Use the "Refill" option
4. The system will check refill eligibility and create a new prescription

## Prescription History
All prescriptions are linked to patient profiles for easy access to:
- Current and past medications
- Dosage history
- Prescribing doctors
- Refill patterns""",
        "category": "Prescriptions",
        "tags": ["prescriptions", "medication", "refills", "validation"]
    },
    {
        "title": "Billing and POS Operations",
        "content": """# Billing and POS Operations

This guide covers billing and Point of Sale (POS) operations.

## Point of Sale (POS)
The POS system allows for quick sales processing:
1. Navigate to POS
2. Add items by:
   - Scanning barcode
   - Searching medicine name
   - Selecting from inventory
3. Adjust quantities if needed
4. Apply discounts if applicable
5. Select payment method
6. Complete the sale

## Payment Methods
The system supports multiple payment methods:
- Cash
- Card (Credit/Debit)
- Insurance
- Online payments
- Split payments (multiple methods for one invoice)

## Creating Invoices
To create a standalone invoice:
1. Navigate to Billing > Create Invoice
2. Select a patient
3. Add invoice items:
   - Medicines from inventory
   - Services or fees
   - Adjust quantities and prices
4. Apply taxes and discounts
5. Generate and save the invoice

## Managing Payments
To add a payment to an invoice:
1. Navigate to Billing > Invoices
2. Select the invoice
3. Click "Add Payment"
4. Enter payment details:
   - Amount
   - Payment method
   - Transaction reference
5. Save the payment

## Returns and Refunds
To process a return or refund:
1. Navigate to Billing > Invoices
2. Select the paid invoice
3. Click "Process Return"
4. Select items to return
5. Enter return reason
6. Process the refund

## Hold Bills
For pending payments, you can hold bills:
1. In POS, after adding items
2. Click "Hold Bill"
3. Enter a reason for holding
4. The bill will be saved for later retrieval

## Receipt Generation
The system generates receipts for:
- POS sales
- Invoice payments
- Refunds and returns

Receipts can be customized in Settings > POS Settings.""",
        "category": "Billing",
        "tags": ["billing", "pos", "payments", "invoices", "refunds"]
    },
    {
        "title": "Reporting and Analytics",
        "content": """# Reporting and Analytics

This guide covers the reporting and analytics features of the system.

## Accessing Reports
Navigate to Reports to access various report types:
- Sales reports
- Inventory reports
- Financial reports
- Prescription reports

## Sales Reports
Generate sales reports by:
- Day, week, month, or custom date range
- Product category or individual items
- Payment method
- User or cashier

## Inventory Reports
Inventory reports include:
- Stock valuation
- Expiry summaries
- Low stock items
- Stock movement history
- Supplier performance

## Financial Reports
Financial reports provide insights into:
- Revenue and profit
- Tax collected
- Payment method distribution
- Refunds and returns

## Prescription Reports
Track prescription-related data:
- Prescription volume by period
- Common medications prescribed
- Prescription status distribution
- Doctor prescribing patterns

## Dashboard Analytics
The main dashboard provides:
- Real-time sales metrics
- Inventory status indicators
- Expiry alerts
- Low stock notifications
- Prescription status overview

## Exporting Reports
Most reports can be exported in multiple formats:
- PDF for printing and sharing
- CSV for further analysis in spreadsheet software
- Excel with formatting for presentations

## Custom Reports
For specialized reporting needs:
- Use the advanced filters
- Save custom report configurations
- Schedule automatic report generation
- Set up email delivery of scheduled reports""",
        "category": "Reports",
        "tags": ["reports", "analytics", "dashboard", "data", "exports"]
    },
    {
        "title": "System Settings Configuration",
        "content": """# System Settings Configuration

This guide covers all system settings and configuration options.

## Organization Settings
Configure your pharmacy details:
1. Go to Settings > Organization Settings
2. Fill in:
   - Store name and address
   - Contact information
   - Tax/GST numbers
   - HSN code defaults
   - Currency and timezone
   - Date/time formats
   - Invoice numbering format
3. Save your settings

## User and Role Management
Manage system users and their permissions:
1. Go to Settings > User & Roles
2. To add a user:
   - Click "Add User"
   - Fill in user details
   - Assign role and permissions
   - Set up 2FA if required
3. To manage roles:
   - Edit existing role permissions
   - Create custom roles if needed

## POS Settings
Configure Point of Sale operations:
1. Go to Settings > POS Settings
2. Configure:
   - Default payment methods
   - Barcode scanning settings
   - Receipt layout and branding
   - Default discount and tax rules
   - Counter/terminal setup
3. Save your settings

## Inventory Settings
Set up inventory management preferences:
1. Go to Settings > Inventory Settings
2. Configure:
   - Reorder level defaults
   - Expiry alert timing
   - Alternative medicine rules
   - Batch-wise pricing options
3. Save your settings

## Notification Settings
Configure communication channels:
1. Go to Settings > Notifications
2. Set up:
   - Email gateway settings
   - SMS provider configuration
   - WhatsApp integration
   - Notification templates
3. Save your settings

## Integration Settings
Connect with third-party services:
1. Go to Settings > Integrations
2. Configure:
   - Insurance provider APIs
   - E-prescription services
   - Accounting software sync
   - Payment gateways
3. Save your settings

## Compliance Settings
Ensure regulatory compliance:
1. Go to Settings > Compliance
2. Configure:
   - Schedule H, X, NDPS tracking
   - License and certificate uploads
   - Audit log retention
3. Save your settings

## Backup and Data Settings
Configure data protection:
1. Go to Settings > Backup & Data
2. Set up:
   - Automatic backup schedules
   - Cloud storage options
   - Data import/export formats
   - Privacy settings
3. Save your settings

## Theme and UI Settings
Customize the system appearance:
1. Go to Settings > Theme & UI
2. Configure:
   - Color theme (light/dark mode)
   - Logo and branding
   - UI customization options
3. Save your settings""",
        "category": "Settings",
        "tags": ["settings", "configuration", "setup", "customization"]
    }
]

# Support Resources based on README.md
support_resources = [
    {
        "title": "API Documentation",
        "description": "Complete API reference with interactive examples for all system endpoints.",
        "resource_type": "LINK",
        "url": "http://localhost:8000/docs",
        "category": "Documentation"
    },
    {
        "title": "User Manual",
        "description": "Comprehensive user manual covering all system features and operations.",
        "resource_type": "DOCUMENT",
        "file_path": "/docs/user_manual.pdf",
        "category": "Documentation"
    },
    {
        "title": "Video Training Series",
        "description": "Step-by-step video tutorials for learning system features.",
        "resource_type": "VIDEO",
        "url": "https://example.com/training-videos",
        "category": "Training"
    },
    {
        "title": "Database Schema",
        "description": "Detailed database schema diagram and table relationships.",
        "resource_type": "DOCUMENT",
        "file_path": "/docs/database_schema.pdf",
        "category": "Technical"
    },
    {
        "title": "Deployment Guide",
        "description": "Instructions for deploying the system in production environments.",
        "resource_type": "DOCUMENT",
        "file_path": "/docs/deployment_guide.pdf",
        "category": "Technical"
    },
    {
        "title": "Troubleshooting Common Issues",
        "description": "Solutions for common problems and error messages.",
        "resource_type": "LINK",
        "url": "https://example.com/troubleshooting",
        "category": "Support"
    }
]

# Support Contacts
support_contacts = [
    {
        "name": "Technical Support",
        "email": "support@pharmacy-system.com",
        "phone": "+1-800-555-0123",
        "department": "Technical Support"
    },
    {
        "name": "Billing Department",
        "email": "billing@pharmacy-system.com",
        "phone": "+1-800-555-0124",
        "department": "Billing"
    },
    {
        "name": "Training Team",
        "email": "training@pharmacy-system.com",
        "phone": "+1-800-555-0125",
        "department": "Training"
    },
    {
        "name": "Sales Inquiries",
        "email": "sales@pharmacy-system.com",
        "phone": "+1-800-555-0126",
        "department": "Sales"
    },
    {
        "name": "Emergency Support",
        "email": "emergency@pharmacy-system.com",
        "phone": "+1-800-555-0199",
        "department": "Emergency Support"
    }
]

def seed_support_data():
    """Seed the database with support data"""
    with Session(engine) as db:
        try:
            # Get the admin user to use as the author for knowledge base articles
            admin_user = db.query(User).filter(User.username == "admin").first()
            if not admin_user:
                logger.error("Admin user not found. Please make sure the database is seeded with users.")
                return
            
            # Seed Knowledge Base Articles
            logger.info("Seeding Knowledge Base Articles...")
            for article_data in knowledge_base_articles:
                # Check if article already exists
                existing_article = db.query(KnowledgeBaseArticle).filter(
                    KnowledgeBaseArticle.title == article_data["title"]
                ).first()
                
                if not existing_article:
                    # Convert tags list to JSON string
                    tags_json = json.dumps(article_data["tags"])
                    
                    article = KnowledgeBaseArticle(
                        title=article_data["title"],
                        content=article_data["content"],
                        category=article_data["category"],
                        tags=tags_json,
                        created_by=admin_user.id
                    )
                    db.add(article)
                    logger.info(f"Added knowledge base article: {article_data['title']}")
                else:
                    logger.info(f"Knowledge base article already exists: {article_data['title']}")
            
            # Seed Support Resources
            logger.info("Seeding Support Resources...")
            for resource_data in support_resources:
                # Check if resource already exists
                existing_resource = db.query(SupportResource).filter(
                    SupportResource.title == resource_data["title"]
                ).first()
                
                if not existing_resource:
                    resource = SupportResource(
                        title=resource_data["title"],
                        description=resource_data["description"],
                        resource_type=resource_data["resource_type"],
                        url=resource_data.get("url"),
                        file_path=resource_data.get("file_path"),
                        category=resource_data["category"]
                    )
                    db.add(resource)
                    logger.info(f"Added support resource: {resource_data['title']}")
                else:
                    logger.info(f"Support resource already exists: {resource_data['title']}")
            
            # Seed Support Contacts
            logger.info("Seeding Support Contacts...")
            for contact_data in support_contacts:
                # Check if contact already exists
                existing_contact = db.query(SupportContact).filter(
                    SupportContact.email == contact_data["email"]
                ).first()
                
                if not existing_contact:
                    contact = SupportContact(
                        name=contact_data["name"],
                        email=contact_data["email"],
                        phone=contact_data["phone"],
                        department=contact_data["department"]
                    )
                    db.add(contact)
                    logger.info(f"Added support contact: {contact_data['name']}")
                else:
                    logger.info(f"Support contact already exists: {contact_data['name']}")
            
            # Commit all changes
            db.commit()
            logger.info("Support data seeding completed successfully!")
            
        except Exception as e:
            logger.error(f"Error seeding support data: {str(e)}")
            db.rollback()

if __name__ == "__main__":
    seed_support_data()