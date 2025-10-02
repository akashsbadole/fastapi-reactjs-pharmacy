# Pharmacy Management System

A comprehensive pharmacy management system built with FastAPI backend and React frontend.

## Features

### 🟢 Authentication & Roles
- User registration & login with JWT/refresh tokens
- Roles: Admin, Pharmacist, Cashier, Doctor
- Permission sets per role (who can add stock, who can approve prescriptions)
- Audit logging of login/logout & critical actions

### 🟢 Inventory Management
- Add/edit/delete medicines
- Track stock by batch/lot number
- Track expiry date & low-stock threshold
- Automatic reorder suggestions
- Barcode/QR code support for stock in/out
- Supplier link per batch

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

### 🟢 Reporting & Analytics
- Sales reports by day, week, month
- Inventory turnover/valuation
- Expiry summaries
- Profit & loss
- Supplier performance metrics

## Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Powerful relational database
- **Redis**: In-memory data structure store for caching
- **SQLAlchemy**: SQL toolkit and ORM
- **Alembic**: Database migration tool
- **Pydantic**: Data validation using Python type annotations
- **JWT**: JSON Web Tokens for authentication

### Frontend
- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing
- **React Query**: Server state management and caching
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests
- **React Hook Form**: Form handling with validation
- **Heroicons**: Beautiful SVG icons

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

## Support

For support and questions, please open an issue in the repository.