// App.js
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import LoginPage from './pages/LoginPage';
import AppLayout from './layouts/AppLayout';
import './App.css'; // Should use consistent styling with global.css

const AppContent = () => {
  const { currentUser, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p className="loading-message">Loading Application...</p>
      </div>
    );
  }

  return currentUser ? <AppLayout /> : <LoginPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
