import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContexts';
import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';
import LoginPage from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/dashboard';
import Home from './pages/dashboard/Home';
import Menu from './pages/dashboard/Menu';
import Orders from './pages/dashboard/Orders';
import Customers from './pages/dashboard/Customers';
import UserDashboard from './pages/userDashboard';
import UserHome from './pages/userDashboard/UserHome';
import LiveOrders from './pages/userDashboard/LiveOrders';
import Profile from './pages/userDashboard/Profile';
import OTPVerification from './pages/OtpVerification';
import ShopSignupPage from './pages/ShopSignup';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<LoginPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/shopsignup" element={<ShopSignupPage />} />

          </Route>
          
          <Route path="/verification" element={
            <PrivateRoute>
              <OTPVerification />
            </PrivateRoute>
          } />

          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }>
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="menu" element={<Menu />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
          </Route>

          <Route path="/userdashboard" element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }>
            <Route index element={<UserHome />} />
            <Route path="home" element={<UserHome />} />
            <Route path="profile" element={<Profile />} />
            <Route path="liveorders" element={<LiveOrders />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;