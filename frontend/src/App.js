import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/patients/Patients';
import PatientDetails from './pages/patients/PatientDetails';
import Inventory from './pages/inventory/Inventory';
import Medicines from './pages/inventory/Medicines';
import Suppliers from './pages/inventory/Suppliers';
import Prescriptions from './pages/prescriptions/Prescriptions';
import PrescriptionDetails from './pages/prescriptions/PrescriptionDetails';
import Billing from './pages/billing/Billing';
import InvoiceDetails from './pages/billing/InvoiceDetails';
import Reports from './pages/reports/Reports';
import Users from './pages/users/Users';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Patient routes */}
                <Route path="patients" element={<Patients />} />
                <Route path="patients/:id" element={<PatientDetails />} />
                
                {/* Inventory routes */}
                <Route path="inventory" element={<Inventory />} />
                <Route path="medicines" element={<Medicines />} />
                <Route path="suppliers" element={<Suppliers />} />
                
                {/* Prescription routes */}
                <Route path="prescriptions" element={<Prescriptions />} />
                <Route path="prescriptions/:id" element={<PrescriptionDetails />} />
                
                {/* Billing routes */}
                <Route path="billing" element={<Billing />} />
                <Route path="billing/invoices/:id" element={<InvoiceDetails />} />
                
                {/* Reports routes */}
                <Route path="reports" element={<Reports />} />
                
                {/* User management */}
                <Route path="users" element={<Users />} />
                
                {/* Profile */}
                <Route path="profile" element={<Profile />} />
              </Route>
              
              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;