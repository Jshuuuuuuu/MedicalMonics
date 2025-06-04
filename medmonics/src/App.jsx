// App.js
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import LoginPage from './pages/LoginPage';
import AppLayout from './layouts/AppLayout';

const AppContent = () => {
  const { currentUser, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-sky-400">
        <div className="animate-spin h-10 w-10 border-4 border-blue-400 border-t-transparent rounded-full mb-4"></div>
        <p className="text-xl">Loading Application...</p>
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
