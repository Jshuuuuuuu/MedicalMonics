import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import '../styles/LoginPage.css'; 

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { auth } = useAuth();
  const showToast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!auth) {
      setError('Authentication service is not available.');
      setLoading(false);
      return;
    }
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        showToast('Account created successfully! Please log in.', 'success');
        setIsSignUp(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
  <div className="login-card">
    <h2 className="login-title">{isSignUp ? 'Create Account' : 'Login'}</h2>
    <form onSubmit={handleSubmit}>
      <label htmlFor="email-login" className="login-label">Email</label>
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
      <label htmlFor="password-login" className="login-label">Password</label>
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
        {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Login'}
      </button>
    </form>
    <div className="login-switch">
      {isSignUp ? 'Already have an account?' : "Don't have an account?"}
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="login-switch-btn"
      >
        {isSignUp ? 'Login' : 'Sign Up'}
      </button>
    </div>
  </div>
</div>
  );
};

export default LoginPage;
