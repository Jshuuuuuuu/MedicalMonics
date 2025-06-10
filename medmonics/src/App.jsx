
// App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AppLayout from './layouts/AppLayout';
import Loader from './components/Capsule'; // Import the new Loader component
import './App.css';

const AppContent = () => {
  const { currentUser, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="app-loading">
        <Loader />{}
        <p className="loading-message">Loading Application...</p>
      </div>
    );
  }

  return currentUser ? <AppLayout /> : <HomePage />;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}