import React, { useState, createContext, useContext, useCallback } from 'react';
import '../styles/Toast.css';  // Import the CSS file for styles

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ message: '', type: '', visible: false });

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            {toast.visible && (
                <div className={`toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    return useContext(ToastContext);
};
