import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import AppLayout from './layouts/AppLayout';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import './App.css';

// Simple auth check function
const isAuthenticated = () => {
  return localStorage.getItem('authToken') !== null;
};

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Route: HomePage is always accessible at the root */}
            <Route path="/" element={<HomePage />} />

            {/* Protected Route: Dashboard */}
            <Route
              path="/dashboard"
              element={isAuthenticated() ? <DashboardPage /> : <Navigate to="/" replace />}
            />

            {/* If you have AppLayout with nested routes, keep this */}
            <Route
              path="/app/*"
              element={isAuthenticated() ? <AppLayout /> : <Navigate to="/" replace />}
            />

            {/* Catch-all for undefined routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;