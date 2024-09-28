import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (user.is_verified !== 1 && location.pathname !== '/verification') {
    return <Navigate to="/verification" replace />;
  }

  const isUserDashboard = location.pathname.startsWith('/userdashboard');
  const isAdminDashboard = location.pathname.startsWith('/dashboard');

  if ((user.role === 'student' || user.role === 'teacher') && isAdminDashboard) {
    return <Navigate to="/userdashboard" replace />;
  } else if (user.role !== 'student' && user.role !== 'teacher' && isUserDashboard ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;