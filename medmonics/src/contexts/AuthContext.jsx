import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';  // For making HTTP requests to your backend

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Check if the user is already authenticated using the JWT token stored in localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken'); // Get JWT token from localStorage

    if (token) {
      // If token exists, verify the user by calling the backend API
      axios.get('http://localhost:5000/verify-token', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => {
        setCurrentUser(response.data.user);  // Set user data if token is valid
      })
      .catch(error => {
        console.error('Error verifying token:', error);
        setCurrentUser(null);  // Clear user if the token is invalid
      })
      .finally(() => setLoadingAuth(false));
    } else {
      setLoadingAuth(false); // If no token, just finish loading state
    }
  }, []);

  // Login function to authenticate the user
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      const { token, user } = response.data;

      // Store JWT in localStorage
      localStorage.setItem('authToken', token);

      // Set the user data in the context
      setCurrentUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      setCurrentUser(null);
    }
  };

  // Logout function to clear the session
  const logout = () => {
    // Remove JWT from localStorage
    localStorage.removeItem('authToken');

    // Clear user state
    setCurrentUser(null);
  };

  const value = { currentUser, loadingAuth, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
