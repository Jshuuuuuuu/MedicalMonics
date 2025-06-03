// LoginPage.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext'; // Assuming AuthContext.js is in the same folder or adjust path
import { useToast } from '../contexts/ToastContext'; // Assuming ToastContext.js is in the same folder or adjust path

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const { auth } = useAuth();
    const showToast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!auth) {
            setError("Authentication service is not available.");
            return;
        }
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
                showToast('Account created successfully! Please log in.', 'success');
                setIsSignUp(false);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                // AuthProvider handles state change
            }
        } catch (err) {
            setError(err.message);
            showToast(err.message, 'error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
            <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-sky-400 mb-6">
                    {isSignUp ? 'Create Account' : 'Login'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email-login" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            id="email-login" // Unique ID
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-2.5 rounded-lg bg-slate-700 text-gray-100 border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password-login" className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <input
                            type="password"
                            id="password-login" // Unique ID
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-2.5 rounded-lg bg-slate-700 text-gray-100 border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                    <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-all duration-150 ease-in-out transform hover:scale-105 active:bg-sky-700">
                        {isSignUp ? 'Sign Up' : 'Login'}
                    </button>
                </form>
                <p className="text-sm text-center text-slate-400 mt-6">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-sky-400 hover:text-sky-300 ml-1">
                        {isSignUp ? 'Login' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
