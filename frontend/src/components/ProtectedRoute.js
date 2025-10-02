import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role (if specified)
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to dashboard with access denied message
    return <Navigate to="/dashboard" state={{ accessDenied: true }} replace />;
  }

  return children;
};

export default ProtectedRoute;