// App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // <-- add useAuth here
import { ToastProvider } from './contexts/ToastContext';
import LoginPage from './pages/LoginPage';
import AppLayout from './layouts/AppLayout';
import './App.css';

const AppContent = () => {
  const { currentUser, loadingAuth } = useAuth(); // Use context to get authentication status

  if (loadingAuth) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p className="loading-message">Loading Application...</p>
      </div>
    );
  }

  // If the user is authenticated, render the AppLayout (dashboard); otherwise, render the LoginPage
  return currentUser ? <AppLayout /> : <LoginPage />;
};

export default function App() {
  return (
    <Router>  {/* Wrap your entire app with BrowserRouter */}
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
