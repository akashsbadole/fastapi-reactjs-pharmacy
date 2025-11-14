# Pharmacy Management System - Backend

A comprehensive pharmacy management system built with FastAPI, PostgreSQL, and Redis.

## Screenshot

![home](home.png "home")

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Inventory Management**: Complete medicine and batch tracking with expiry and low-stock alerts
- **Prescription Management**: Digital prescription handling with validation and tracking
- **Patient Management**: Comprehensive patient records with medical history
- **Billing & Financials**: Invoice generation, payment processing, and financial reporting
- **Reporting & Analytics**: Detailed reports for sales, inventory, prescriptions, and more
- **Audit Logging**: Complete audit trail for all critical actions

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Powerful relational database
- **Redis**: In-memory data structure store for caching
- **SQLAlchemy**: SQL toolkit and ORM
- **Alembic**: Database migration tool
- **Pydantic**: Data validation using Python type annotations
- **JWT**: JSON Web Tokens for authentication

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py          # Application configuration
│   ├── database.py        # Database connection and session
│   ├── models.py          # SQLAlchemy models
│   ├── routers/           # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py        # Authentication routes
│   │   ├── inventory.py   # Inventory management routes
│   │   ├── patients.py    # Patient management routes
│   │   ├── prescriptions.py # Prescription management routes
│   │   ├── billing.py     # Billing and financial routes
│   │   └── reports.py     # Reporting and analytics routes
│   ├── schemas/           # Pydantic models for request/response
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── inventory.py
│   │   ├── patients.py
│   │   ├── prescriptions.py
│   │   ├── billing.py
│   │   └── reports.py
│   └── utils/             # Utility functions
│       ├── __init__.py
│       └── auth.py        # Authentication utilities
├── alembic/               # Database migrations
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── uploads/               # File upload directory
├── main.py                # FastAPI application entry point
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker configuration
└── alembic.ini           # Alembic configuration
```

## Getting Started

### Prerequisites

- Python 3.11+
- PostgreSQL
- Redis
- Docker (optional)

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Create a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. Run database migrations:

   ```bash
   alembic upgrade head
   ```

7. Start the application:
   ```bash
   uvicorn main:app --reload
   ```

### Using Docker

1. Build and start all services:

   ```bash
   docker-compose up --build
   ```

2. Run database migrations:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

## API Documentation

Once the application is running, you can access the interactive API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Roles

The system supports the following roles:

- **Admin**: Full system access
- **Pharmacist**: Can manage inventory, prescriptions, and billing
- **Cashier**: Can manage patients and billing
- **Doctor**: Can create and view prescriptions

## Database Migrations

To create a new migration:

```bash
alembic revision --autogenerate -m "Description of changes"
```

To apply migrations:

```bash
alembic upgrade head
```

To rollback migrations:

```bash
alembic downgrade -1
```

## Testing

Run tests with:

```bash
pytest
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
