// DashboardPage.js
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getMnemonicsCollectionPath } from '../firebase';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
    const { userId, db } = useAuth();
    const [totalMnemonics, setTotalMnemonics] = useState(0);
    const [uniqueCategories, setUniqueCategories] = useState(0);
    const [recentlyAdded, setRecentlyAdded] = useState([]);

    useEffect(() => {
        if (!userId || !db) return;

        const mnemonicsColPath = getMnemonicsCollectionPath(userId);
        const q = query(collection(db, mnemonicsColPath));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userMnemonics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTotalMnemonics(userMnemonics.length);

            const categories = new Set(userMnemonics.map(m => m.category).filter(Boolean));
            setUniqueCategories(categories.size);

            const sorted = userMnemonics.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setRecentlyAdded(sorted.slice(0, 3));
        }, (error) => {
            console.error("Error fetching dashboard data:", error);
        });

        return () => unsubscribe();
    }, [userId, db]);

    return (
        <div className="dashboard-bg">
            <div className="dashboard-content-wrapper">
                <h2 className="dashboard-title">Dashboard</h2>
                <div className="dashboard-cards">
                    <div className="dashboard-card">
                        <h3 className="dashboard-card-title">Total Mnemonics</h3>
                        <p className="dashboard-card-value">{totalMnemonics}</p>
                    </div>
                    <div className="dashboard-card">
                        <h3 className="dashboard-card-title">Unique Categories</h3>
                        <p className="dashboard-card-value">{uniqueCategories}</p>
                    </div>
                </div>
                <div className="dashboard-recent">
                    <h3 className="dashboard-recent-title">Recently Added</h3>
                    {recentlyAdded.length > 0 ? (
                        recentlyAdded.map(m => (
                            <div key={m.id} className="dashboard-recent-item">
                                <div className="dashboard-recent-acronym">{m.acronym}</div>
                                <div className="dashboard-recent-fullform">{m.fullForm}</div>
                                {m.category && <div className="dashboard-recent-category">Category: {m.category}</div>}
                            </div>
                        ))
                    ) : (
                        <p className="dashboard-recent-category">No mnemonics added yet.</p>
                    )}
                </div>
                <div className="dashboard-userid">User ID: {userId}</div>
            </div>
        </div>
    );
};

export default DashboardPage;
