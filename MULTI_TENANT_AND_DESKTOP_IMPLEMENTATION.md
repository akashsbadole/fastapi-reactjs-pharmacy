# Multi-Tenant Pharmacy Management System with Desktop Application

This document provides a comprehensive overview of the multi-tenant implementation and desktop application for the Pharmacy Management System.

## Table of Contents

1. [Multi-Tenant Architecture](#multi-tenant-architecture)
2. [Database Design](#database-design)
3. [Authentication & Authorization](#authentication--authorization)
4. [Desktop Application](#desktop-application)
5. [API Integration](#api-integration)
6. [Offline Functionality](#offline-functionality)
7. [Deployment Guide](#deployment-guide)
8. [Troubleshooting](#troubleshooting)

## Multi-Tenant Architecture

### Overview

The Pharmacy Management System has been enhanced to support multi-tenancy, allowing multiple pharmacies to use the same system while maintaining data isolation and security.

### Implementation Approach

We've implemented a **shared database, shared schema** approach with tenant identification through:

1. **Tenant Context**: Each request is associated with a specific tenant
2. **Data Isolation**: All data queries are filtered by tenant ID
3. **Tenant Management**: Complete CRUD operations for tenant management
4. **Security**: Tenant-specific authentication and authorization

### Key Components

#### 1. Tenant Model

```python
# backend/app/multi_tenant_models.py
class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    domain = Column(String, unique=True, index=True, nullable=False)
    database_url = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

#### 2. Tenant Middleware

```python
# backend/app/middleware/tenant.py
class TenantMiddleware:
    async def __call__(self, request: Request, call_next):
        # Extract tenant from request
        tenant_id = self.get_tenant_id(request)
        
        # Set tenant context
        request.state.tenant_id = tenant_id
        
        # Process request
        response = await call_next(request)
        
        return response
```

#### 3. Tenant-Aware Models

All existing models have been enhanced with tenant awareness:

```python
# Example: Enhanced Medicine Model
class Medicine(Base):
    __tablename__ = "medicines"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    name = Column(String, index=True, nullable=False)
    # ... other fields
    
    # Relationship with tenant
    tenant = relationship("Tenant", back_populates="medicines")
```

## Database Design

### Multi-Tenant Schema

The database schema has been updated to support multi-tenancy:

1. **Tenants Table**: Stores tenant information
2. **Tenant ID Columns**: Added to all existing tables
3. **Foreign Key Constraints**: Ensuring data integrity
4. **Indexes**: Optimized for tenant-specific queries

### Migration Strategy

A comprehensive migration script has been created:

```python
# backend/alembic/versions/add_multi_tenant_support.py
def upgrade():
    # Create tenants table
    # Add tenant_id columns to all tables
    # Create foreign key constraints
    # Create indexes for performance
```

## Authentication & Authorization

### Multi-Tenant Authentication

The authentication system has been enhanced to support multi-tenancy:

1. **Tenant-Specific Login**: Users login within their tenant context
2. **JWT Tokens**: Include tenant information in tokens
3. **Session Management**: Tenant-aware session handling
4. **Role-Based Access**: Tenant-specific roles and permissions

### Authentication Flow

1. User provides credentials and tenant identifier
2. System validates credentials within tenant context
3. JWT token is issued with tenant information
4. Subsequent requests include tenant context
5. Authorization checks consider both user and tenant

### Security Features

- **Data Isolation**: Tenants can only access their own data
- **Cross-Tenant Protection**: Prevents data leakage between tenants
- **Secure Defaults**: Default tenant for fallback scenarios
- **Audit Logging**: Tenant-specific audit trails

## Desktop Application

### Technology Stack

The desktop application is built with:

- **Electron**: Cross-platform desktop application framework
- **React**: Modern UI framework
- **Material-UI**: Component library for consistent design
- **Axios**: HTTP client for API communication
- **IndexedDB**: Local storage for offline functionality

### Architecture

The desktop application follows a modular architecture:

```
desktop/
├── public/                 # Static files and Electron main process
│   ├── electron.js        # Electron main process
│   ├── preload.js         # Preload script for security
│   └── index.html         # HTML template
├── src/                   # React application source
│   ├── components/        # React components
│   ├── services/          # API services
│   ├── contexts/          # React contexts
│   ├── utils/             # Utility functions
│   ├── App.js             # Main App component
│   └── index.js           # Application entry point
```

### Key Features

1. **Complete Module Coverage**: All web application features available
2. **Offline Functionality**: Full offline support with data synchronization
3. **Native Integration**: File system access, notifications, and more
4. **Cross-Platform**: Windows, macOS, and Linux support

### Component Structure

Each module has its own component with consistent structure:

- **Dashboard**: Overview with key metrics
- **Patients**: Patient management with offline support
- **Inventory**: Medicine and stock management
- **Prescriptions**: Prescription creation and tracking
- **Point of Sale**: Complete POS system
- **Reports**: Analytics and reporting
- **Settings**: System configuration
- **Billing**: Invoice and payment management
- **Support**: Help desk and knowledge base

## API Integration

### API Service Architecture

The desktop application uses a centralized API service:

```javascript
// desktop/src/services/api.js
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: process.env.REACT_APP_API_TIMEOUT || 30000,
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add tenant context
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Service Modules

Each module has its own service:

- **authService**: Authentication and user management
- **patientService**: Patient operations
- **inventoryService**: Medicine and stock management
- **prescriptionService**: Prescription management
- **posService**: Point of sale operations
- **reportService**: Reports and analytics
- **settingsService**: System configuration
- **billingService**: Invoice and payment management
- **supportService**: Help desk and knowledge base

### Error Handling

Comprehensive error handling with:

- Automatic token refresh
- Network error detection
- User-friendly error messages
- Retry mechanisms for failed requests

## Offline Functionality

### Offline Architecture

The desktop application supports full offline functionality:

1. **Local Storage**: IndexedDB for data caching
2. **Operation Queue**: Pending operations stored locally
3. **Synchronization**: Automatic sync when connection is restored
4. **Conflict Resolution**: Handling data conflicts

### Implementation

```javascript
// desktop/src/services/offlineService.js
class OfflineService {
  // Store data locally
  async storeData(key, data) {
    await this.db.put(key, data);
  }
  
  // Queue operations for later sync
  async queueOperation(operation) {
    const queue = await this.getQueue();
    queue.push(operation);
    await this.storeData('operationQueue', queue);
  }
  
  // Synchronize pending operations
  async synchronize() {
    const queue = await this.getQueue();
    for (const operation of queue) {
      try {
        await this.executeOperation(operation);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  }
}
```

### Offline Features

- **Data Caching**: Frequently accessed data stored locally
- **Operation Queue**: CRUD operations queued for sync
- **Pending Operations Indicator**: Visual feedback for pending sync
- **Conflict Resolution**: Manual and automatic conflict handling

## Deployment Guide

### Multi-Tenant Backend Deployment

1. **Database Setup**:
   ```bash
   # Create database
   createdb pharmacy_multi_tenant
   
   # Run migrations
   cd backend
   alembic upgrade head
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

3. **Start Application**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### Desktop Application Deployment

1. **Install Dependencies**:
   ```bash
   cd desktop
   npm install
   ```

2. **Build Application**:
   ```bash
   npm run build
   ```

3. **Package for Distribution**:
   ```bash
   # Windows
   npm run package:win
   
   # macOS
   npm run package:mac
   
   # Linux
   npm run package:linux
   ```

### Production Considerations

1. **Security**:
   - HTTPS for all API communication
   - Environment variables for sensitive data
   - Regular security updates

2. **Performance**:
   - Database indexing for tenant queries
   - Caching strategies for frequently accessed data
   - Load balancing for high-traffic scenarios

3. **Monitoring**:
   - Application performance monitoring
   - Error tracking and logging
   - Resource usage monitoring

## Troubleshooting

### Common Issues

#### Multi-Tenant Issues

1. **Tenant Not Found**:
   - Verify tenant exists in database
   - Check tenant identifier in request headers
   - Ensure tenant is active

2. **Cross-Tenant Data Access**:
   - Check tenant context in all queries
   - Verify foreign key constraints
   - Review middleware implementation

#### Desktop Application Issues

1. **API Connection Errors**:
   - Verify backend is running
   - Check API URL configuration
   - Ensure network connectivity

2. **Authentication Issues**:
   - Verify JWT token validity
   - Check tenant context in token
   - Review authentication flow

3. **Offline Sync Issues**:
   - Check operation queue
   - Verify conflict resolution
   - Review synchronization logic

### Debugging Tools

1. **Backend Debugging**:
   - FastAPI debug endpoints
   - Database query logging
   - Middleware logging

2. **Desktop Application Debugging**:
   - Electron developer tools
   - React developer tools
   - Console logging

### Support

For additional support:

1. Check the documentation
2. Review the code comments
3. Create a support ticket
4. Contact the development team

## Conclusion

The multi-tenant Pharmacy Management System with desktop application provides a comprehensive solution for managing pharmacy operations across multiple organizations. The implementation ensures data isolation, security, and scalability while providing a rich desktop experience with offline capabilities.

The system is designed to be:
- **Scalable**: Support for multiple tenants with growing data
- **Secure**: Complete data isolation and secure authentication
- **Reliable**: Offline functionality and error handling
- **User-Friendly**: Intuitive desktop interface with all features
- **Maintainable**: Clean code architecture and comprehensive documentation