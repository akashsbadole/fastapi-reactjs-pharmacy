# Multi-Tenant Implementation Guide

This document provides a comprehensive guide to the multi-tenant implementation of the Pharmacy Management System.

## Overview

The Pharmacy Management System has been enhanced to support multi-tenancy, allowing multiple pharmacies to use the same system while keeping their data completely isolated. This implementation follows a shared database with tenant isolation approach.

## Architecture

### Multi-Tenant Models

The multi-tenant functionality is implemented through the following models:

1. **Tenant**: Represents a pharmacy/organization
   - Basic information (name, slug, domain)
   - Subscription details (plan, limits, billing)
   - Status tracking (active, inactive, suspended)

2. **TenantSettings**: Stores tenant-specific configuration
   - Organization settings
   - POS settings
   - Notification preferences
   - And more...

3. **UserInvitation**: Manages user invitations to tenants
   - Email-based invitations
   - Role assignment
   - Expiration tracking

### Tenant Identification

Tenants are identified through multiple methods:

1. **Subdomain**: `tenant1.pharmacy.com`
2. **Custom Domain**: `pharmacy.tenant1.com`
3. **Header**: `X-Tenant-ID` header
4. **URL Path**: `/api/tenant1/...`

### Data Isolation

All data is isolated at the database level through:

1. **Foreign Key Relationships**: Every table has a `tenant_id` foreign key
2. **Query Filtering**: All queries automatically filter by tenant
3. **Middleware Enforcement**: Tenant middleware ensures data isolation

## Implementation Details

### Database Schema Changes

1. Added `tenant_id` to all existing tables
2. Removed unique constraints on username/email (now tenant-scoped)
3. Added tenant-specific indexes for performance
4. Created tenant management tables

### Authentication Changes

1. JWT tokens now include tenant_id
2. Login process identifies tenant based on credentials
3. User validation is tenant-scoped
4. Session management is per-tenant

### API Changes

1. All endpoints now require tenant identification
2. Tenant middleware processes all requests
3. Error handling includes tenant context
4. Resource access is tenant-scoped

## Setup Instructions

### 1. Database Migration

Run the multi-tenant migration:

```bash
cd backend
alembic upgrade head
```

### 2. Create Default Tenant

Run the seed script to create a default tenant:

```bash
cd backend
python seed_default_tenant.py
```

This will create:
- Default tenant with slug "default"
- Admin user (username: admin, password: admin123)
- Additional default users for testing

### 3. Configure Frontend

Update the frontend to work with multi-tenancy:

1. Set up tenant identification (subdomain, header, etc.)
2. Update API calls to include tenant context
3. Handle tenant-specific settings
4. Implement tenant switching if needed

### 4. Configure Desktop App

The desktop application automatically works with multi-tenancy:

1. Login identifies tenant based on credentials
2. All API calls include tenant context
3. Offline data is tenant-isolated

## Usage

### Creating a New Tenant

1. Use the tenant management API:
   ```bash
   POST /api/tenants/
   {
     "name": "My Pharmacy",
     "slug": "my-pharmacy",
     "plan": "professional",
     "billing_email": "admin@mypharmacy.com"
   }
   ```

2. Or use the admin interface (if implemented)

### Adding Users to a Tenant

1. Invite users via email:
   ```bash
   POST /api/tenants/{tenant_id}/invite
   {
     "email": "user@example.com",
     "role": "pharmacist"
   }
   ```

2. Users accept invitation and create account

### Accessing a Tenant

1. **Via Subdomain**: `https://my-pharmacy.pharmacy.com`
2. **Via Custom Domain**: `https://my-pharmacy.com`
3. **Via Header**: Include `X-Tenant-ID: 1` in requests
4. **Via URL Path**: `https://pharmacy.com/api/my-pharmacy/...`

## Security Considerations

### Data Isolation

- All database queries are filtered by tenant_id
- Foreign key constraints prevent cross-tenant data access
- Middleware enforces tenant context on all requests

### Authentication

- Tokens are tenant-scoped
- Users can only access their assigned tenant
- Session management is isolated per tenant

### API Security

- Tenant identification is validated on all requests
- Cross-tenant data access is prevented
- Error messages don't leak tenant information

## Performance Considerations

### Database Indexing

- Added composite indexes on (tenant_id, other_fields)
- Optimized queries for tenant filtering
- Regular maintenance of tenant-specific indexes

### Caching

- Cache keys include tenant_id
- Cache invalidation is tenant-scoped
- Redis can be partitioned by tenant if needed

### Scaling

- Tenant isolation allows for horizontal scaling
- Large tenants can be moved to dedicated resources
- Read replicas can be tenant-specific

## Troubleshooting

### Common Issues

1. **Tenant Not Found**
   - Check tenant identification method
   - Verify tenant exists and is active
   - Check domain/subdomain configuration

2. **Cross-Tenant Data Access**
   - Verify middleware is properly configured
   - Check all queries include tenant filtering
   - Review foreign key constraints

3. **Authentication Issues**
   - Verify tokens include tenant_id
   - Check user is assigned to correct tenant
   - Review authentication flow

### Debugging

1. Check tenant context in request headers
2. Verify database queries include tenant filtering
3. Review middleware logs for tenant identification
4. Check JWT token payload for tenant_id

## Future Enhancements

### Planned Features

1. **Tenant Self-Service Portal**
   - Tenant registration
   - Plan management
   - Billing integration

2. **Advanced Tenant Features**
   - Custom domains
   - White-labeling
   - Tenant-specific modules

3. **Performance Optimization**
   - Tenant-specific database partitions
   - Intelligent caching strategies
   - Resource allocation per tenant

### Migration Path

1. **Single to Multi-Tenant Migration**
   - Data migration scripts
   - Zero-downtime migration
   - Rollback procedures

2. **Tenant Isolation Enhancement**
   - Database per tenant (optional)
   - Application per tenant (optional)
   - Hybrid approaches

## Conclusion

The multi-tenant implementation provides a robust foundation for serving multiple pharmacies while maintaining data isolation and security. The architecture is flexible enough to accommodate various tenant identification methods and can be extended with additional features as needed.

For questions or issues with the multi-tenant implementation, please refer to the troubleshooting section or contact the development team.