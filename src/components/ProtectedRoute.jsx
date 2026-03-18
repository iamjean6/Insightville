import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * For now, it uses a mock authentication check since the backend 
 * credentials are not yet fully implemented.
 */
const ProtectedRoute = ({ isAdminOnly = false }) => {
  // Mock authentication check
  // You can set 'isAdmin' in localStorage to manually test protection
  // localStorage.setItem('isAdmin', 'true');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true' || isAdmin;

  if (isAdminOnly && !isAdmin) {
    // If route requires admin but user is not admin, redirect to homepage
    return <Navigate to="/" replace />;
  }

  if (!isAuthenticated) {
    // If not authenticated at all, redirect to homepage (or login if available)
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
