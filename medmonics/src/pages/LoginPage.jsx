import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import axios from "axios";
import "../styles/LoginPage.css";

const LoginPage = ({ onClose, onLoginSuccess }) => {
  const navigate = useNavigate(); // Add this hook
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Simple toast function instead of using context
  const showToast = (message, type) => {
    // For now, just use alert - you can implement a proper toast later
    if (type === 'error') {
      alert('Error: ' + message);
    } else {
      alert('Success: ' + message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const response = await axios.post("http://localhost:5000/signup", { 
          email, 
          password 
        });

        if (response.data.message === "User created successfully") {
          showToast("Account created successfully! Please log in.", "success");
          setIsSignUp(false);
        }
      } else {
        const response = await axios.post("http://localhost:5000/login", { 
          email, 
          password 
        });
        
        if (response.data.token) {
          localStorage.setItem("authToken", response.data.token);
          showToast("Logged in successfully", "success");
          
          // Use navigate (lowercase) instead of Navigate
          navigate("/dashboard");
          
          // Call the success callback if provided
          if (onLoginSuccess) {
            onLoginSuccess();
          } else if (onClose) {
            onClose();
          }
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An error occurred during authentication";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <h2 className="login-title">{isSignUp ? "Create Account" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email-login" className="login-label">
          Email
        </label>
        <input
          type="email"
          id="email-login"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          className="login-input"
          placeholder="you@example.com"
        />
        <label htmlFor="password-login" className="login-label">
          Password
        </label>
        <input
          type="password"
          id="password-login"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="login-input"
          placeholder="••••••••"
        />
        {error && <p className="login-error">{error}</p>}
        <button type="submit" disabled={loading} className="login-btn">
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
        </button>
      </form>
      <div className="login-switch">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}
        <button onClick={() => setIsSignUp(!isSignUp)} className="login-switch-btn">
          {isSignUp ? "Login" : "Sign Up"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;