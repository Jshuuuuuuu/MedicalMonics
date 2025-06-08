import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import { useToast } from "../contexts/ToastContext";
import axios from "axios";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const showToast = useToast();
  const navigate = useNavigate();  // Initialize navigate hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset previous errors
    setLoading(true);

    try {
      if (isSignUp) {
        const response = await axios.post("http://localhost:5000/signup", { email, password });

        if (response.data.message === "User created successfully") {
          showToast("Account created successfully! Please log in.", "success");
          setIsSignUp(false);
        }
      } else {
        // Handle login logic here
        const response = await axios.post("http://localhost:5000/login", { email, password });
        // Assuming you receive a token upon successful login
        if (response.data.token) {
          // Store the token (e.g., in localStorage)
          localStorage.setItem("authToken", response.data.token);
          showToast("Logged in successfully", "success");
          
          // Redirect to the dashboard page
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during authentication");
      showToast(error, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
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
    </div>
  );
};

export default LoginPage;
