# Pharmacy Management System - Desktop Application

A cross-platform desktop application for the Pharmacy Management System built with Electron and React.

## Features

### 🏥 Core Modules
- **Dashboard**: Real-time overview of pharmacy operations
- **Patients**: Comprehensive patient management
- **Inventory**: Medicine and stock management
- **Prescriptions**: Prescription creation and tracking
- **Point of Sale**: Complete POS system with barcode scanning
- **Reports**: Analytics and reporting
- **Settings**: System configuration
- **Billing**: Invoice and payment management
- **Support**: Help desk and knowledge base

### 🌐 Offline Capabilities
- Full offline functionality with data caching
- Automatic synchronization when connection is restored
- Pending operations queue
- Local data storage

### 🔐 Security
- JWT-based authentication
- Two-factor authentication support
- Session management
- Secure data transmission

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pharmacy-management-system/desktop
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

## Development

### Running in Development Mode

```bash
npm run dev
```

This will start the React development server and Electron in development mode with hot reload.

### Building for Production

```bash
npm run build
```

This will create an optimized production build of the application.

### Packaging the Application

#### For Windows:
```bash
npm run package:win
```

#### For macOS:
```bash
npm run package:mac
```

#### For Linux:
```bash
npm run package:linux
```

#### For all platforms:
```bash
npm run package:all
```

The packaged applications will be created in the `dist/` directory.

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_TIMEOUT=30000

# Electron Configuration
ELECTRON_IS_DEV=true

# Application Configuration
REACT_APP_NAME=Pharmacy Management System
REACT_APP_VERSION=1.0.0
REACT_APP_DESCRIPTION=Desktop application for pharmacy management
```

### API Configuration

The desktop application connects to the FastAPI backend. Make sure the backend is running and accessible at the configured API URL.

## Usage

### Login

1. Launch the desktop application
2. Enter your credentials (username and password)
3. If 2FA is enabled, enter the verification code
4. Click "Login" to access the dashboard

### Navigation

Use the sidebar navigation to access different modules:
- Dashboard: Overview of key metrics and activities
- Patients: Manage patient records and information
- Inventory: Manage medicines, batches, and stock
- Prescriptions: Create and manage prescriptions
- Point of Sale: Process sales and payments
- Reports: View analytics and generate reports
- Settings: Configure system settings
- Billing: Manage invoices and payments
- Support: Access help and support resources

### Offline Mode

When the application detects no internet connection, it automatically switches to offline mode:
- A yellow indicator appears in the header
- Data is saved locally
- Operations are queued for synchronization
- When connection is restored, data is automatically synchronized

## Troubleshooting

### Common Issues

1. **Application won't start**
   - Check if Node.js is properly installed
   - Verify all dependencies are installed
   - Check the console for error messages

2. **API connection errors**
   - Verify the backend is running
   - Check the API URL in the environment variables
   - Ensure network connectivity

3. **Build failures**
   - Clear the cache: `npm run clean`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check for any missing dependencies

4. **Packaging issues**
   - Ensure you have the required build tools for your platform
   - Check available disk space
   - Verify all dependencies are properly installed

### Getting Help

If you encounter issues:
1. Check the console logs for error messages
2. Consult the knowledge base in the Support module
3. Create a support ticket with detailed information
4. Contact the support team

## Development Guide

### Project Structure

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
├── build/                 # Production build output
├── dist/                  # Packaged application output
└── package.json           # Dependencies and scripts
```

### Adding New Components

1. Create the component file in `src/components/`
2. Add the component to `src/App.js`
3. Add the route and navigation item
4. Create API service methods if needed
5. Test the component

### API Integration

The application uses a centralized API service (`src/services/api.js`) for all backend communication:
- All API calls are authenticated with JWT tokens
- Automatic token refresh is handled
- Error handling is centralized
- Offline functionality is supported

## Security Considerations

- All sensitive data is encrypted in transit
- User credentials are not stored locally
- Session tokens are securely managed
- API communication uses HTTPS in production
- Input validation is performed on both client and server

## Performance Optimization

- Components use React.memo for optimization
- API calls are cached when appropriate
- Images and assets are optimized
- Bundle size is minimized through code splitting
- Offline data is efficiently managed

## Updates

The desktop application supports automatic updates:
- Updates are downloaded in the background
- Users are notified when updates are available
- Updates can be installed with a single click
- Rollback is supported if needed

## License

This desktop application is part of the Pharmacy Management System and is licensed under the same terms as the main project.