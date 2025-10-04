import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/patients/Patients';
import PatientCreate from './pages/patients/PatientCreate';
import PatientDetails from './pages/patients/PatientDetails';
import PatientEdit from './pages/patients/PatientEdit';
import Inventory from './pages/inventory/Inventory';
import Medicines from './pages/inventory/Medicines';
import MedicineCreate from './pages/inventory/MedicineCreate';
import MedicineDetails from './pages/inventory/MedicineDetails';
import MedicineEdit from './pages/inventory/MedicineEdit';
import InventoryAnalytics from './pages/inventory/InventoryAnalytics';
import BatchCreate from './pages/inventory/BatchCreate';
import BatchDetails from './pages/inventory/BatchDetails';
import BatchEdit from './pages/inventory/BatchEdit';
import Suppliers from './pages/inventory/Suppliers';
import SupplierCreate from './pages/inventory/SupplierCreate';
import SupplierDetails from './pages/inventory/SupplierDetails';
import Prescriptions from './pages/prescriptions/Prescriptions';
import PrescriptionDetails from './pages/prescriptions/PrescriptionDetails';
import PrescriptionCreate from './pages/prescriptions/PrescriptionCreate';
import PrescriptionEdit from './pages/prescriptions/PrescriptionEdit';
import Billing from './pages/billing/Billing';
import CreateInvoice from './pages/billing/CreateInvoice';
import EditInvoice from './pages/billing/EditInvoice';
import AddPayment from './pages/billing/AddPayment';
import InvoiceDetails from './pages/billing/InvoiceDetails';
import PointOfSale from './pages/pos/PointOfSale';
import Reports from './pages/reports/Reports';
import AuditLogs from './pages/audit/AuditLogs';
import AuditLogDetails from './pages/audit/AuditLogDetails';
import HelpSupport from './pages/support/HelpSupport';
import SupportTickets from './pages/support/SupportTickets';
import KnowledgeBaseArticleDetails from './pages/support/KnowledgeBaseArticleDetails';
import Subscription from './pages/subscription/Subscription';
import Users from './pages/users/Users';
import CreateUser from './pages/users/CreateUser';
import UserDetails from './pages/users/UserDetails';
import EditUser from './pages/users/EditUser';
import Profile from './pages/Profile';
import Settings from './pages/settings/Settings';
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
        <SettingsProvider>
          <Router future={{ v7_relativeSplatPath: true }}>
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
                <Route path="patients/create" element={<PatientCreate />} />
                <Route path="patients/:id" element={<PatientDetails />} />
                <Route path="patients/:id/edit" element={<PatientEdit />} />
                
                {/* Inventory routes */}
                <Route path="inventory" element={<Inventory />} />
                <Route path="inventory/medicines" element={<Medicines />} />
                <Route path="inventory/medicines/create" element={<MedicineCreate />} />
                <Route path="inventory/medicines/:id" element={<MedicineDetails />} />
                <Route path="inventory/medicines/:id/edit" element={<MedicineEdit />} />
                <Route path="inventory/batches/create" element={<BatchCreate />} />
                <Route path="inventory/batches/:id" element={<BatchDetails />} />
                <Route path="inventory/batches/:id/edit" element={<BatchEdit />} />
                <Route path="inventory/analytics" element={<InventoryAnalytics />} />
                <Route path="inventory/suppliers" element={<Suppliers />} />
                <Route path="inventory/suppliers/create" element={<SupplierCreate />} />
                <Route path="inventory/suppliers/:id" element={<SupplierDetails />} />
                
                {/* Prescription routes */}
                <Route path="prescriptions" element={<Prescriptions />} />
                <Route path="prescriptions/create" element={<PrescriptionCreate />} />
                <Route path="prescriptions/:id" element={<PrescriptionDetails />} />
                <Route path="prescriptions/:id/edit" element={<PrescriptionEdit />} />
                
                {/* Billing routes */}
                <Route path="billing" element={<Billing />} />
                <Route path="billing/create" element={<CreateInvoice />} />
                <Route path="billing/invoices/:id" element={<InvoiceDetails />} />
                <Route path="billing/invoices/:id/edit" element={<EditInvoice />} />
                <Route path="billing/invoices/:id/payments" element={<AddPayment />} />
                
                {/* POS routes */}
                <Route path="pos" element={<PointOfSale />} />
                
                {/* Reports routes */}
                <Route path="reports" element={<Reports />} />
                
                {/* Audit routes */}
                <Route path="audit" element={<AuditLogs />} />
                <Route path="audit/:id" element={<AuditLogDetails />} />
                
                {/* Support routes */}
                <Route path="support" element={<HelpSupport />} />
                <Route path="support/tickets" element={<SupportTickets />} />
                <Route path="support/knowledge-base/:id" element={<KnowledgeBaseArticleDetails />} />
                
                {/* Subscription routes */}
                <Route path="subscription" element={<Subscription />} />
                
                {/* User management */}
                <Route path="users" element={<Users />} />
                <Route path="users/create" element={<CreateUser />} />
                <Route path="users/:id" element={<UserDetails />} />
                <Route path="users/:id/edit" element={<EditUser />} />
                
                {/* Profile */}
                <Route path="profile" element={<Profile />} />
                
                {/* Settings */}
                <Route path="settings" element={<Settings />} />
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
      </SettingsProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;