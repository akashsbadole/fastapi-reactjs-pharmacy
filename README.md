# Pharmacy Management System

A comprehensive pharmacy management system built with FastAPI backend and React frontend.

## Features

### 🟢 Authentication & Roles
- User registration & login with JWT/refresh tokens
- Roles: Admin, Pharmacist, Cashier, Doctor
- Permission sets per role (who can add stock, who can approve prescriptions)
- Audit logging of login/logout & critical actions

### 🟢 Inventory Management
- Add/edit/delete medicines with comprehensive CRUD operations
- Track stock by batch/lot number with batch creation and management
- Track expiry date & low-stock threshold with automated alerts
- Automatic reorder suggestions based on stock levels
- Barcode/QR code support for stock in/out
- Supplier link per batch with supplier management
- CSV import/export functionality for bulk medicine data management
- Inventory analytics dashboard with visual charts and metrics
- Advanced search and filtering capabilities
- Stock movement tracking and history

### 🟢 Prescription Management
- Create new prescriptions (by pharmacist or uploaded by doctor/patient)
- Validate against patient allergies, drug interactions, dose limits
- Refill management with alerts
- Upload scanned/electronic prescriptions

### 🟢 Patient Management
- Patient profiles: demographics, contact info, allergies, medical history
- Prescription history linked to patient
- Refill and dosage reminder tracking

### 🟢 Billing & Financials
- Invoice generation with itemized list
- Support multiple payment modes (cash, card, insurance)
- Handle returns/refunds
- Sales tax/GST calculation
- Daily/weekly/monthly sales reporting
- Point of Sale (POS) system with barcode scanning
- Split payment support and receipt generation
- Hold bill functionality for pending payments
- Quick sale processing for fast checkout

### 🟢 Reporting & Analytics
- Sales reports by day, week, month
- Inventory turnover/valuation
- Expiry summaries
- Profit & loss
- Supplier performance metrics
- Interactive dashboard with real-time data visualization
- Category distribution charts
- Top medicines by stock value
- Stock movement trends and analytics
- Comprehensive reporting with export capabilities

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Powerful relational database
- **SQLite**: Lightweight database for development and testing
- **Redis**: In-memory data structure store for caching
- **SQLAlchemy**: SQL toolkit and ORM
- **Alembic**: Database migration tool
- **Pydantic**: Data validation using Python type annotations
- **JWT**: JSON Web Tokens for authentication
- **Uvicorn**: ASGI server for running FastAPI applications
- **Python-multipart**: For handling form data and file uploads

### Frontend
- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing
- **React Query**: Server state management and caching
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests
- **React Hook Form**: Form handling with validation
- **Heroicons**: Beautiful SVG icons
- **React Hot Toast**: Notification system
- **Chart.js/Recharts**: Data visualization for analytics

## Project Structure

```
pharmacy-management-system/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── routers/        # API route handlers
│   │   ├── schemas/        # Pydantic models
│   │   └── utils/          # Utility functions
│   ├── alembic/            # Database migrations
│   ├── main.py             # FastAPI application entry point
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   ├── public/             # Static files
│   └── package.json        # Node.js dependencies
├── docker-compose.yml      # Docker configuration
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pharmacy-management-system
   ```

2. Start all services:
   ```bash
   docker-compose up --build
   ```

3. Run database migrations:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

4. Access the applications:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development

#### Quick Start (Both Backend and Frontend)

For a quick start, use the provided scripts to run both servers simultaneously:

**On Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

**On Windows:**
```cmd
start-dev.bat
```

These scripts will:
- Check if PostgreSQL and Redis are running
- Set up virtual environments and install dependencies if needed
- Run database migrations
- Start both backend and frontend servers

#### Manual Setup

If you prefer to set up manually:

**Backend Setup:**

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run database migrations:
   ```bash
   alembic upgrade head
   ```

6. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

**Frontend Setup:**

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the frontend development server:
   ```bash
   npm start
   ```

## Default Credentials

For testing purposes, you can use these default credentials:

- **Admin**: username: `admin`, password: `admin123`
- **Pharmacist**: username: `pharmacist`, password: `pharm123`
- **Cashier**: username: `cashier`, password: `cash123`

*PIN*
Found 3 users without PINs.
- Added PIN '1234' for user: admin (ID: 1)
- Added PIN '5678' for user: pharmacist (ID: 2)
- Added PIN '9012' for user: cashier (ID: 3)
Successfully added PINs to all users.

## API Documentation

Once the backend is running, you can access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database Migrations

### Creating a new migration
```bash
alembic revision --autogenerate -m "Description of changes"
```

### Applying migrations
```bash
alembic upgrade head
```

### Rolling back migrations
```bash
alembic downgrade -1
```

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Production Build

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Use production Docker configuration:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build
   ```

### Environment Variables

#### Backend (.env)
```
DATABASE_URL=postgresql://postgres:password@localhost/pharmacy_db
SECRET_KEY=your-secret-key-here-change-in-production
REDIS_URL=redis://localhost:6379
```

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and ensure they pass
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Current Implementation Status

### ✅ Fully Implemented Features
- **Authentication & User Management**: Complete JWT-based authentication with role-based access control
- **Inventory Management**: Full CRUD operations for medicines with batch tracking
- **CSV Import/Export**: Bulk data management with validation and error handling
- **Batch Management**: Create and manage medicine batches with expiry tracking
- **Inventory Analytics**: Interactive dashboard with charts and metrics
- **Point of Sale (POS)**: Complete sales system with barcode scanning and payment processing
- **Supplier Management**: Add and manage suppliers for inventory tracking
- **Stock Alerts**: Automated notifications for low stock and expiry items
- **Search & Filtering**: Advanced search capabilities across all modules
- **Responsive UI**: Mobile-friendly interface with Tailwind CSS

### 🚧 In Progress
- **Prescription Management**: Basic functionality implemented, validation in progress
- **Patient Management**: Core features implemented, medical history tracking in progress
- **Billing & Invoicing**: Basic invoicing implemented, advanced features in progress

### 📋 Planned Features
- **Advanced Reporting**: Custom report builder with scheduling
- **Mobile App**: Native mobile application for iOS and Android
- **Integration APIs**: Third-party integrations with accounting and EMS systems
- **Multi-Store Support**: Chain pharmacy management capabilities
- **AI-Powered Features**: Drug interaction checking and dosage recommendations

### Additional Suggested Modules

- User & Role Management: Admin, Pharmacist, Cashier roles with permissions
- Audit Trails: Full activity logs for compliance
- Security & Backup: Automated cloud backups, encryption
- Mobile App/Responsive: Mobile POS for home delivery staff
- Delivery Management: Manage home deliveries & riders
- SMS/Email Integration: Automated notifications for refills, bills
- Supplier Portal: Vendors can upload invoices or check PO status
- Regulatory Compliance: Schedule H, X, NDPS tracking
- Analytics Dashboard: Forecasting, top-selling drugs, demand trends


#### Settings Menu
1️⃣ Organization / Pharmacy Settings

Store Name, Address, Logo, Contact info

Tax/GST numbers, HSN code defaults

Default currency, time zone, date formats

Invoice numbering format & prefixes

Prescription numbering format

2️⃣ User & Roles Management

Add/Edit Users (Admin, Pharmacist, Cashier, Accountant)

Role-based permissions (who can view/edit/approve)

2FA / password policies

3️⃣ POS Settings

Default payment methods

Enable/disable barcode scanning

Receipt/invoice print layout & branding

Default discount/tax configuration

Counter/terminal setup

4️⃣ Inventory Settings

Reorder level defaults

Expiry alerts (how many days in advance)

Alternative medicine mapping rules

Batch-wise pricing toggle

5️⃣ Notifications / Communication

Email/SMS gateway setup

Templates for invoices, reminders, refill alerts

WhatsApp integration API keys

6️⃣ Integration Settings

Insurance provider integration

E-prescription provider integration

Accounting software sync (Tally, QuickBooks, Zoho)

Payment gateway setup (UPI, cards)

7️⃣ Compliance & Regulations

Schedule H, X, NDPS tracking settings

Upload license & certificates

Audit log retention period

8️⃣ Backup & Data

Automatic backups (local/cloud)

Data import/export (CSV, JSON, XML)

GDPR/data privacy options

9️⃣ Theme & UI

Color theme selection (dark/light mode)

Logo, favicon, branding customization

## Support

For support and questions, please open an issue in the repository.


## Issue


Below feature and functionality
Settings
Manage your pharmacy system configuration and preferences


Organization Settings
Store details, tax info, and formats

User & Roles
Manage users and their permissions

POS Settings
Payment methods and receipt layout

Inventory Settings
Reorder levels and expiry alerts

Notifications
Email/SMS templates and gateways

Integrations
Third-party service connections

Compliance
Regulatory settings and licenses

Backup & Data
Data backup and import/export

Theme & UI
Appearance and branding



------

@problems @/backend/app/routers/settings.py  @/frontend/src/contexts/SettingsContext.js @/frontend/src/pages/settings/OrganizationSettings.js @/frontend/src/pages/settings/ThemeSettings.js @/frontend/src/pages/settings/POSSettings.js @/frontend/src/pages/settings @/frontend/src/pages/settings/Settings.js  Most of features and functionality are not working, MAKE ALL FEATURES AND FUNCTIONALITY

Below feature and functionality
Settings
Manage your pharmacy system configuration and preferences


Organization Settings
Store details, tax info, and formats
-------------------------------

@problems @/backend/app/routers/settings.py  @/frontend/src/contexts/SettingsContext.js @/frontend/src/pages/settings/OrganizationSettings.js @/frontend/src/pages/settings/ThemeSettings.js @/frontend/src/pages/settings/POSSettings.js @/frontend/src/pages/settings @/frontend/src/pages/settings/Settings.js  Most of features and functionality are not working, MAKE ALL FEATURES AND FUNCTIONALITY

User & Roles
Manage users and their permissions

POS Settings
Payment methods and receipt layout

----------------------------111
@problems @/backend/app/routers/settings.py  @/frontend/src/contexts/SettingsContext.js @/frontend/src/pages/settings/OrganizationSettings.js @/frontend/src/pages/settings/ThemeSettings.js @/frontend/src/pages/settings/POSSettings.js @/frontend/src/pages/settings @/frontend/src/pages/settings/Settings.js  Most of features and functionality are not working, MAKE ALL FEATURES AND FUNCTIONALITY

Inventory Settings
Reorder levels and expiry alerts

Notifications
Email/SMS templates and gateways   ->>>>>>>>>

-------------------22
@problems @/backend/app/routers/settings.py  @/frontend/src/contexts/SettingsContext.js @/frontend/src/pages/settings/OrganizationSettings.js @/frontend/src/pages/settings/ThemeSettings.js @/frontend/src/pages/settings/POSSettings.js @/frontend/src/pages/settings @/frontend/src/pages/settings/Settings.js  Most of features and functionality are not working, MAKE ALL FEATURES AND FUNCTIONALITY

Integrations
Third-party service connections

Compliance
Regulatory settings and licenses
------------------
@problems @/backend/app/routers/settings.py  @/frontend/src/contexts/SettingsContext.js @/frontend/src/pages/settings/OrganizationSettings.js @/frontend/src/pages/settings/ThemeSettings.js @/frontend/src/pages/settings/POSSettings.js @/frontend/src/pages/settings @/frontend/src/pages/settings/Settings.js  Most of features and functionality are not working, MAKE ALL FEATURES AND FUNCTIONALITY

Backup & Data
Data backup and import/export

Theme & UI
Appearance and branding