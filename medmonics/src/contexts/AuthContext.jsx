// AuthContext.js
import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { auth, db, appId as firebaseAppId } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [userId, setUserId] = useState(null);

    const initialAuthTokenFromEnv = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                setUserId(user.uid);
            } else {
                if (initialAuthTokenFromEnv) {
                    try {
                        await signInWithCustomToken(auth, initialAuthTokenFromEnv);
                        // onAuthStateChanged will run again
                    } catch (error) {
                        console.error("Error signing in with custom token, trying anonymous:", error);
                        try {
                            const anonUserCredential = await signInAnonymously(auth);
                            setCurrentUser(anonUserCredential.user);
                            setUserId(anonUserCredential.user.uid);
                        } catch (anonError) {
                            console.error("Error signing in anonymously:", anonError);
                            setCurrentUser(null);
                            setUserId(null);
                        }
                    }
                } else {
                    try {
                        const anonUserCredential = await signInAnonymously(auth);
                        setCurrentUser(anonUserCredential.user);
                        setUserId(anonUserCredential.user.uid);
                    } catch (anonError) {
                        console.error("Error signing in anonymously:", anonError);
                        setCurrentUser(null);
                        setUserId(null);
                    }
                }
            }
            setLoadingAuth(false);
        });
        return unsubscribe;
    }, [initialAuthTokenFromEnv]);

    const value = { currentUser, userId, loadingAuth, db, auth, appId: firebaseAppId };

    return <AuthContext.Provider value={value}>{!loadingAuth && children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};
