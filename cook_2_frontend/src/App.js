import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ChefSearch from './pages/ChefSearch';
import ChefProfile from './pages/ChefProfile';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import BookingDetails from './pages/BookingDetails';
import './App.css';

// Main application routing for CookSup frontend.
// This file defines public pages, protected routes, and role-based dashboard access.
// ProtectedRoute ensures only authenticated users can access customer/chef pages.
// RoleProtectedRoute additionally checks whether the user is a chef or customer.
// DashboardRedirect sends the user to the correct dashboard based on their role.


// Protected route component that requires authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Role-protected route that checks user type
const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.userType || user?.user_type;
  if (!role) {
    return <div>Loading dashboard...</div>;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Redirect component for dashboard based on user role
const DashboardRedirect = () => {
  const { user } = useAuth();
  const role = user?.userType || user?.user_type;

  if (!role) {
    return <div>Loading dashboard...</div>;
  }

  if (role === 'chef') {
    return <Navigate to="/dashboard/chef" replace />;
  }

  return <Navigate to="/dashboard/customer" replace />;
};

// Main App component with routing
function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <main className="app-main">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chefs" element={<ChefSearch />} />
            <Route path="/chef/:chefId" element={<ChefProfile />} />

            {/* Protected dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/customer"
              element={
                <RoleProtectedRoute allowedRoles={['customer']}>
                  <Dashboard />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/payment/:bookingId"
              element={
                <RoleProtectedRoute allowedRoles={['customer']}>
                  <Payment />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/booking/:bookingId"
              element={
                <ProtectedRoute>
                  <BookingDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/chef"
              element={
                <RoleProtectedRoute allowedRoles={['chef']}>
                  <Dashboard />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </AuthProvider>
    </Router>
  );
}

export default App;
