# Pharmacy Management System - Frontend

A modern React-based frontend for the Pharmacy Management System.

## Features

- **Authentication & Authorization**: Secure login with JWT tokens and role-based access control
- **Dashboard**: Comprehensive overview with key metrics and recent activities
- **Patient Management**: Complete patient records with search and filtering
- **Inventory Management**: Medicine and batch tracking with alerts
- **Prescription Management**: Digital prescription handling and validation
- **Billing & Invoicing**: Complete billing workflow with payment processing
- **Reporting & Analytics**: Detailed reports with charts and visualizations
- **Responsive Design**: Mobile-friendly interface that works on all devices

## Tech Stack

- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing
- **React Query**: Server state management and caching
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests
- **React Hook Form**: Form handling with validation
- **React Hot Toast**: Toast notifications
- **Heroicons**: Beautiful SVG icons

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.js       # Main layout with navigation
│   │   ├── Loader.js       # Loading component
│   │   └── ProtectedRoute.js # Route protection wrapper
│   ├── contexts/           # React contexts
│   │   └── AuthContext.js  # Authentication state management
│   ├── pages/              # Page components
│   │   ├── auth/           # Authentication pages
│   │   │   └── Login.js
│   │   ├── patients/       # Patient management pages
│   │   ├── inventory/      # Inventory management pages
│   │   ├── prescriptions/  # Prescription management pages
│   │   ├── billing/        # Billing and invoicing pages
│   │   ├── reports/        # Reporting pages
│   │   ├── users/          # User management pages
│   │   ├── Dashboard.js    # Main dashboard
│   │   ├── Profile.js      # User profile
│   │   └── NotFound.js     # 404 page
│   ├── services/           # API services
│   │   └── api.js          # API configuration and endpoints
│   ├── App.js              # Main App component
│   ├── index.css           # Global styles with Tailwind
│   └── index.js            # App entry point
├── package.json
├── tailwind.config.js      # Tailwind configuration
└── postcss.config.js       # PostCSS configuration
```

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- Backend API server running

### Installation

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

4. Start the development server:
   ```bash
   npm start
   ```

The app will be available at http://localhost:3000

### Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:8000
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Authentication

The frontend uses JWT tokens for authentication. Tokens are stored in localStorage and automatically included in API requests. The app handles token refresh automatically to maintain session continuity.

## State Management

- **AuthContext**: Manages authentication state and user information
- **React Query**: Handles server state, caching, and data fetching
- **Local State**: Component-level state with React hooks

## Styling

The app uses Tailwind CSS for styling with a custom color scheme and component classes. The design is responsive and follows modern UI/UX principles.

## API Integration

The frontend communicates with the backend API using Axios. All API endpoints are centralized in the `services/api.js` file for easy management and consistency.

## Build for Production

To create an optimized production build:

```bash
npm run build
```

This will create a `build` folder with the production-ready application.

## Contributing

1. Follow the existing code style and conventions
2. Use meaningful component and variable names
3. Add comments for complex logic
4. Test your changes thoroughly
5. Ensure responsive design for new components

## License

This project is licensed under the MIT License.