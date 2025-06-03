// App.js
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';// Adjust path if needed
import { ToastProvider } from './contexts/ToastContext'; // Adjust path if needed
import LoginPage from './pages/LoginPage'; // Adjust path if needed
import AppLayout from './layouts/AppLayout'; // Adjust path if needed

const AppContent = () => {
    const { currentUser, loadingAuth } = useAuth();

    if (loadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
                <p className="text-sky-400 text-xl">Loading Application...</p>
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
