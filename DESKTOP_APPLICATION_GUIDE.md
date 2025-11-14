# Desktop Application Guide

This guide provides comprehensive instructions for setting up, running, and testing the Pharmacy Management System desktop application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Testing Features](#testing-features)
6. [Troubleshooting](#troubleshooting)
7. [Development Workflow](#development-workflow)
8. [Building for Production](#building-for-production)

## Prerequisites

### System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, or Ubuntu 18.04+
- **Node.js**: Version 16.x or higher
- **npm**: Version 7.x or higher (or yarn 1.22.x+)
- **RAM**: Minimum 4GB, recommended 8GB
- **Storage**: Minimum 500MB free space
- **Network**: Internet connection for initial setup and API access

### Required Software

1. **Node.js and npm**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation:
   ```bash
   node --version
   npm --version
   ```

2. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation:
   ```bash
   git --version
   ```

3. **Backend API Server**
   - The FastAPI backend must be running
   - Default URL: http://localhost:8000
   - See [Backend Setup Guide](./backend/README.md)

## Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd pharmacy-management-system
```

### Step 2: Install Desktop Dependencies

```bash
cd desktop
npm install
```

This will install all required dependencies including:
- React and related packages
- Material-UI components
- Electron and its dependencies
- Chart.js for data visualization
- Axios for API communication

### Step 3: Verify Backend Connection

Ensure the backend API is running:

```bash
# From the root directory
cd backend
python main.py
```

The API should be accessible at http://localhost:8000

### Step 4: Create Environment Configuration

Create a `.env` file in the `desktop` directory:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_TENANT_ID=default

# Application Settings
REACT_APP_APP_NAME=Pharmacy Management System
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_OFFLINE=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_BARCODE=true
```

## Configuration

### API Configuration

The desktop application needs to connect to the backend API. Configure the following:

1. **API URL**: Set in `.env` file
2. **Tenant ID**: Your pharmacy's tenant identifier
3. **Authentication**: JWT tokens are handled automatically

### Multi-tenant Setup

For multi-tenant deployments:

1. **Tenant Identification**: Configure tenant ID in `.env`
2. **Subdomain Setup**: See [Subdomain Setup Guide](./SUBDOMAIN_SETUP_GUIDE.md)
3. **User Accounts**: Create users for each tenant

### Offline Configuration

Offline functionality is enabled by default:

1. **Data Caching**: Essential data is cached locally
2. **Queue Operations**: Changes are queued when offline
3. **Auto Sync**: Data syncs when connection is restored

## Running the Application

### Development Mode

For development with hot reload:

```bash
cd desktop
npm start
```

This will:
1. Start the React development server
2. Launch Electron in development mode
3. Enable hot reload for React components
4. Open developer tools by default

### Production Mode

To test the production build:

```bash
cd desktop
npm run build
npm run electron
```

This will:
1. Build the React app for production
2. Start Electron with the production build
3. Disable developer tools
4. Use optimized bundles

### Debug Mode

For debugging issues:

```bash
# Enable debug logging
DEBUG=pharmacy:* npm start

# Or enable in .env
DEBUG=pharmacy:*
```

## Testing Features

### Authentication Testing

1. **Login with Default Credentials**
   - Username: `admin`
   - Password: `admin123`
   - Tenant: `default` (or your tenant ID)

2. **Test Multi-tenant Login**
   - Use different tenant IDs
   - Verify data isolation
   - Test user roles and permissions

### Module Testing

#### Dashboard
- Verify metrics display correctly
- Check charts and graphs
- Test real-time updates
- Verify offline indicators

#### Patient Management
1. **Add New Patient**
   - Fill in all required fields
   - Test validation
   - Check duplicate prevention

2. **Search and Filter**
   - Test search functionality
   - Apply filters
   - Verify pagination

3. **Offline Mode**
   - Disconnect from internet
   - Add/modify patients
   - Reconnect and verify sync

#### Inventory Management
1. **Add Medicine**
   - Complete all required fields
   - Test batch creation
   - Verify stock tracking

2. **Stock Management**
   - Update stock levels
   - Test low stock alerts
   - Verify expiry tracking

3. **Barcode Scanning**
   - Test with sample barcodes
   - Verify search functionality
   - Check duplicate handling

#### Point of Sale
1. **Create Sale**
   - Add items to cart
   - Apply discounts
   - Process payment

2. **Hold/Retrieve Bills**
   - Hold a sale
   - Retrieve held bill
   - Complete transaction

3. **Receipt Printing**
   - Test receipt generation
   - Verify print layout
   - Check email receipts

#### Reports
1. **Generate Reports**
   - Select different report types
   - Apply date filters
   - Test export functionality

2. **Charts and Analytics**
   - Verify chart rendering
   - Test interactive features
   - Check data accuracy

#### Settings
1. **Organization Settings**
   - Update pharmacy details
   - Test different formats
   - Verify save functionality

2. **User Management**
   - Create new users
   - Assign roles
   - Test permissions

3. **Theme Customization**
   - Switch between themes
   - Customize colors
   - Verify persistence

### Offline Testing

1. **Enable Offline Mode**
   - Disconnect from network
   - Verify offline indicator
   - Test cached data access

2. **Offline Operations**
   - Perform various operations
   - Verify data is queued
   - Check local storage

3. **Synchronization**
   - Reconnect to network
   - Verify auto-sync
   - Check for conflicts

### Performance Testing

1. **Load Testing**
   - Add large amounts of data
   - Test with multiple tabs
   - Verify memory usage

2. **Network Testing**
   - Test with slow connections
   - Simulate network interruptions
   - Verify timeout handling

## Troubleshooting

### Common Issues

#### Application Won't Start

1. **Check Node.js Version**
   ```bash
   node --version  # Should be 16.x or higher
   ```

2. **Clear Node Modules**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Check Port Availability**
   - Ensure port 3000 is available
   - Kill processes using the port

#### API Connection Issues

1. **Verify Backend is Running**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Check CORS Configuration**
   - Verify backend allows electron://
   - Check CORS headers

3. **Validate Tenant Configuration**
   - Ensure tenant ID exists
   - Check tenant is active

#### Authentication Issues

1. **Clear Local Storage**
   - Open developer tools
   - Clear localStorage
   - Restart application

2. **Verify Token Refresh**
   - Check token expiry
   - Verify refresh mechanism

3. **Check User Permissions**
   - Verify user role
   - Check tenant assignment

#### Performance Issues

1. **Clear Cache**
   ```bash
   npm run reset-cache
   ```

2. **Update Dependencies**
   ```bash
   npm update
   ```

3. **Check Memory Usage**
   - Open task manager
   - Monitor memory usage
   - Restart if needed

### Debug Mode

Enable detailed logging:

```bash
# Start with debug logging
DEBUG=pharmacy:* npm start

# Enable specific modules
DEBUG=pharmacy:api,pharmacy:offline npm start
```

### Log Files

Application logs are stored at:
- **Windows**: `%APPDATA%/pharmacy-desktop/logs/`
- **macOS**: `~/Library/Logs/pharmacy-desktop/`
- **Linux**: `~/.config/pharmacy-desktop/logs/`

## Development Workflow

### Code Structure

```
desktop/
├── public/
│   ├── electron.js      # Main Electron process
│   └── preload.js       # Preload script
├── src/
│   ├── components/      # React components
│   ├── services/        # API services
│   └── utils/           # Utility functions
└── package.json         # Dependencies
```

### Adding New Features

1. **Create Component**
   ```bash
   # Create new component file
   touch src/components/NewFeature.js
   ```

2. **Add API Methods**
   ```javascript
   // Add to src/services/api.js
   export const newFeatureService = {
     getItems: () => api.get('/new-feature'),
     createItem: (data) => api.post('/new-feature', data)
   };
   ```

3. **Update Navigation**
   ```javascript
   // Add to src/App.js menuItems
   { text: 'New Feature', icon: <NewFeatureIcon />, path: '/new-feature' }
   ```

4. **Add Route**
   ```javascript
   // Add to src/App.js Routes
   <Route path="/new-feature" element={<NewFeature />} />
   ```

### Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run type checking
npm run type-check

# Format code
npm run format
```

## Building for Production

### Build Process

1. **Build React App**
   ```bash
   npm run build
   ```

2. **Package Electron App**
   ```bash
   # For Windows
   npm run electron-pack:win
   
   # For macOS
   npm run electron-pack:mac
   
   # For Linux
   npm run electron-pack:linux
   ```

3. **Create Installer**
   ```bash
   # Windows installer
   npm run electron-installer:win
   
   # macOS installer
   npm run electron-installer:mac
   
   # Linux installer
   npm run electron-installer:linux
   ```

### Distribution

1. **Automatic Updates**
   - Configure update server
   - Set up update endpoints
   - Test update mechanism

2. **Code Signing**
   - Windows: Configure certificate
   - macOS: Configure developer ID
   - Test signed builds

3. **Store Submission**
   - Prepare store assets
   - Follow store guidelines
   - Submit for review

### Configuration for Production

Create `.env.production`:

```bash
# Production API URL
REACT_APP_API_URL=https://api.yourpharmacy.com
REACT_APP_TENANT_ID=production

# Production Settings
REACT_APP_APP_NAME=Pharmacy Management System
REACT_APP_VERSION=1.0.0

# Security
REACT_APP_ENABLE_DEBUG=false
REACT_APP_ENABLE_CONSOLE=false
```

## Security Considerations

### Data Protection

1. **Local Storage**
   - Encrypt sensitive data
   - Clear data on logout
   - Use secure storage APIs

2. **API Communication**
   - Use HTTPS only
   - Verify SSL certificates
   - Implement token refresh

3. **Application Security**
   - Code signing
   - Runtime security
   - Input validation

### Best Practices

1. **Regular Updates**
   - Keep dependencies updated
   - Apply security patches
   - Monitor vulnerabilities

2. **Access Control**
   - Implement proper authentication
   - Use role-based permissions
   - Audit user actions

3. **Data Backup**
   - Regular data exports
   - Cloud backup options
   - Disaster recovery plan

## Support and Resources

### Documentation

- [API Documentation](./backend/README.md)
- [Multi-tenant Implementation](./MULTI_TENANT_IMPLEMENTATION.md)
- [Subdomain Setup Guide](./SUBDOMAIN_SETUP_GUIDE.md)

### Community

- GitHub Issues: Report bugs and request features
- Discussion Forum: Community support
- Knowledge Base: Articles and tutorials

### Professional Support

- Email Support: support@pharmacy-system.com
- Phone Support: +1-800-PHARMACY
- Enterprise Support: enterprise@pharmacy-system.com