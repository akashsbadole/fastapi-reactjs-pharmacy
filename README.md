# Pharmacy Management System

A comprehensive pharmacy management system built with FastAPI backend and React frontend, now with multi-tenant support and a desktop application.

## Features

### 🟢 Authentication & User Management
- User registration & login with JWT/refresh tokens
- Multi-factor authentication with 2FA support
- Roles: Admin, Pharmacist, Cashier, Doctor
- Permission sets per role (who can add stock, who can approve prescriptions)
- Password reset functionality with email notifications
- PIN-based authentication for POS systems
- Profile image support for user accounts
- Last login tracking and session management

### 🟢 Multi-Tenant Architecture
- Complete data isolation between tenants
- Subdomain-based tenant identification (tenant.pharmacy.com)
- Custom domain support for enterprise clients
- Tenant-specific settings and configurations
- User invitations and tenant management
- Shared database with tenant isolation
- Scalable architecture for SaaS deployment

### 🟢 Desktop Application
- Cross-platform desktop app (Windows, macOS, Linux)
- Offline functionality with data synchronization
- Modern Material-UI interface
- Barcode scanning support
- Receipt printing capabilities
- Local data caching for performance
- Automatic updates and notifications
- Complete offline mode operation

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
- Alternative medicine mapping and substitution rules
- Storage condition tracking and location management
- Drug schedule classification (H1, H2, Schedule X)

### 🟢 Prescription Management
- Create new prescriptions (by pharmacist or uploaded by doctor/patient)
- Validate against patient allergies, drug interactions, dose limits
- Refill management with alerts
- Upload scanned/electronic prescriptions
- Prescription status tracking (Pending, Approved, Filled, Cancelled)
- Prescription numbering and formatting
- Doctor information and license tracking

### 🟢 Patient Management
- Patient profiles: demographics, contact info, allergies, medical history
- Prescription history linked to patient
- Refill and dosage reminder tracking
- Insurance information and policy management
- Emergency contact details
- Date of birth and gender tracking

### 🟢 Billing & Financials
- Invoice generation with itemized list
- Support multiple payment modes (cash, card, insurance, online)
- Handle returns/refunds with refund tracking
- Sales tax/GST calculation with HSN code support
- Daily/weekly/monthly sales reporting
- Point of Sale (POS) system with barcode scanning
- Split payment support and receipt generation
- Hold bill functionality for pending payments
- Quick sale processing for fast checkout
- Invoice numbering and customization

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

### 🟢 AI-Powered Features
- Medicine prediction based on symptoms and patient history
- Upcoming inventory needs prediction based on historical data
- Medicine alternatives recommendation system
- Confidence scoring for predictions
- AI service status and capabilities monitoring

### 🟢 Subscription & Billing Management
- Multiple subscription plans with different features
- Usage tracking and limits (users, pharmacies, storage)
- Payment method management (credit cards, etc.)
- Invoice generation and payment tracking
- Automatic renewal support
- Subscription status management (Active, Cancelled, Expired)
- Billing history and payment processing

### 🟢 Support System
- Support ticket creation and management
- Knowledge base articles with categorization
- Support contact directory
- Ticket prioritization (Low, Medium, High, Critical)
- Status tracking (Open, In Progress, Resolved, Closed)
- Support resources and documentation

### 🟢 Audit & Compliance
- Comprehensive audit logging of all system activities
- User action tracking with IP addresses and timestamps
- Resource change tracking with old/new values
- Regulatory compliance settings
- License and certificate management
- Audit log retention policies
- Compliance reporting

### 🟢 Notifications & Communication
- In-app notification system
- Email notification support
- SMS integration for alerts and notifications
- WhatsApp integration capabilities
- Notification templates and customization
- Notification type management (expiry, low stock, refill, etc.)

### 🟢 System Settings & Configuration
- Organization settings (store details, tax info, formats)
- User roles and permissions management
- POS settings (payment methods, receipt layout)
- Inventory settings (reorder levels, expiry alerts)
- Integration settings (payment gateways, accounting software)
- Compliance and regulatory settings
- Backup and data management
- Theme and UI customization
- Notification preferences and templates

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

### Desktop Application
- **Electron**: Cross-platform desktop application framework
- **Material-UI (MUI)**: Component library for modern UI
- **React**: Frontend framework
- **Node.js**: Runtime environment
- **Chart.js**: Data visualization
- **Offline Storage**: Local data caching and synchronization

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
├── desktop/                # Electron desktop application
│   ├── src/
│   │   ├── components/     # React components for desktop
│   │   ├── services/       # API services
│   │   └── App.js          # Main desktop app
│   ├── public/
│   │   ├── electron.js     # Electron main process
│   │   └── preload.js      # Preload script
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

### Desktop Application

1. Install dependencies:
   ```bash
   cd desktop
   npm install
   ```

2. Configure API endpoint:
   ```bash
   # Create .env file
   echo "REACT_APP_API_URL=http://localhost:8000" > .env
   echo "REACT_APP_TENANT_ID=default" >> .env
   ```

3. Start the desktop application:
   ```bash
   npm start
   ```

For detailed desktop application setup, see [Desktop Application Guide](./DESKTOP_APPLICATION_GUIDE.md).

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

## Multi-Tenant Setup

### Default Tenant

The system automatically creates a default tenant with ID "default" during initial setup.

### Creating New Tenants

1. **Via API:**
   ```bash
   curl -X POST "http://localhost:8000/api/tenants/" \
   -H "Content-Type: application/json" \
   -d '{
     "name": "Pharmacy Name",
     "subdomain": "pharmacy",
     "admin_email": "admin@pharmacy.com",
     "plan": "premium"
   }'
   ```

2. **Via Admin Panel:**
   - Access the admin panel
   - Navigate to Tenant Management
   - Create new tenant with required details

### Subdomain Configuration

For production deployment, configure subdomain routing:
- See [Subdomain Setup Guide](./SUBDOMAIN_SETUP_GUIDE.md)
- Configure DNS records
- Set up reverse proxy
- Configure SSL certificates

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

### Desktop Application Tests
```bash
cd desktop
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

### Desktop Application Distribution

1. Build for production:
   ```bash
   cd desktop
   npm run build
   ```

2. Package application:
   ```bash
   # For Windows
   npm run electron-pack:win
   
   # For macOS
   npm run electron-pack:mac
   
   # For Linux
   npm run electron-pack:linux
   ```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:password@localhost/pharmacy_db
SECRET_KEY=your-secret-key-here-change-in-production
REDIS_URL=redis://localhost:6379
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
```

#### Desktop (.env)
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_TENANT_ID=default
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
- **Authentication & User Management**: Complete JWT-based authentication with role-based access control, 2FA support, and PIN-based POS authentication
- **Multi-Tenant Architecture**: Complete multi-tenant system with data isolation, subdomain support, and tenant management
- **Desktop Application**: Full-featured desktop app with offline functionality, barcode scanning, and receipt printing
- **Inventory Management**: Full CRUD operations for medicines with batch tracking, expiry alerts, and alternative medicine mapping
- **CSV Import/Export**: Bulk data management with validation and error handling
- **Batch Management**: Create and manage medicine batches with expiry tracking
- **Inventory Analytics**: Interactive dashboard with charts and metrics
- **Point of Sale (POS)**: Complete sales system with barcode scanning, payment processing, and hold bill functionality
- **Supplier Management**: Add and manage suppliers for inventory tracking
- **Stock Alerts**: Automated notifications for low stock and expiry items
- **Search & Filtering**: Advanced search capabilities across all modules
- **Responsive UI**: Mobile-friendly interface with Tailwind CSS
- **AI-Powered Features**: Medicine prediction based on symptoms, inventory needs prediction, and medicine alternatives
- **Subscription Management**: Complete subscription system with plans, payment methods, and billing
- **Support System**: Ticket management, knowledge base, and support resources
- **Audit Logging**: Comprehensive activity tracking with user actions and resource changes
- **Notifications**: In-app notifications with email and SMS integration
- **System Settings**: Comprehensive configuration options for all system modules

### 🚧 In Progress
- **Prescription Management**: Basic functionality implemented, validation in progress
- **Patient Management**: Core features implemented, medical history tracking in progress
- **Billing & Invoicing**: Basic invoicing implemented, advanced features in progress

### 📋 Planned Features
- **Advanced Reporting**: Custom report builder with scheduling
- **Mobile App**: Native mobile application for iOS and Android
- **Integration APIs**: Third-party integrations with accounting and EMS systems
- **Multi-Store Support**: Chain pharmacy management capabilities
- **Enhanced AI Features**: Advanced drug interaction checking and dosage recommendations

### Additional Suggested Modules

- Delivery Management: Manage home deliveries & riders
- Supplier Portal: Vendors can upload invoices or check PO status
- Advanced Analytics: Enhanced forecasting and demand trends
- Mobile App: Native mobile application for field staff

## Documentation

- [Desktop Application Guide](./DESKTOP_APPLICATION_GUIDE.md)
- [Multi-Tenant Implementation](./MULTI_TENANT_IMPLEMENTATION.md)
- [Subdomain Setup Guide](./SUBDOMAIN_SETUP_GUIDE.md)
- [Desktop Application Options](./DESKTOP_APPLICATION_OPTIONS.md)

## Support

For support and questions, please open an issue in the repository.