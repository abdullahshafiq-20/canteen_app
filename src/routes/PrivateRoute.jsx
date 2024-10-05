import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Add loading state check
  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  // Check if user exists and has necessary properties
  if (!user || !user.role) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Skip verification check for Google OAuth users
  if (!user.is_verified && user.auth_type !== 'google' && location.pathname !== '/verification') {
    return <Navigate to="/verification" replace />;
  }

  const isUserDashboard = location.pathname.startsWith('/userdashboard');
  const isAdminDashboard = location.pathname.startsWith('/dashboard');

  if ((user.role === 'student' || user.role === 'teacher') && isAdminDashboard) {
    return <Navigate to="/userdashboard" replace />;
  } else if (user.role !== 'student' && user.role !== 'teacher' && isUserDashboard) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;