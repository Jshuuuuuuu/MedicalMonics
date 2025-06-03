// DashboardPage.js
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getMnemonicsCollectionPath } from '../firebase';

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

            const sorted = userMnemonics.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0) );
            setRecentlyAdded(sorted.slice(0, 3));
        }, (error) => {
            console.error("Error fetching dashboard data:", error);
        });

        return () => unsubscribe();
    }, [userId, db]);

    return (
        <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-sky-300">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-medium text-slate-300 mb-1">Total Mnemonics</h3>
                    <p className="text-4xl font-bold text-sky-400">{totalMnemonics}</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-medium text-slate-300 mb-1">Unique Categories</h3>
                    <p className="text-4xl font-bold text-sky-400">{uniqueCategories}</p>
                </div>
            </div>
            <div className="mt-8 bg-slate-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-sky-300 mb-4">Recently Added</h3>
                {recentlyAdded.length > 0 ? (
                    <div className="space-y-3">
                        {recentlyAdded.map(m => (
                            <div key={m.id} className="bg-slate-700 p-3 rounded-md shadow">
                                <h4 className="font-semibold text-sky-300">{m.acronym}</h4>
                                <p className="text-sm text-slate-300 truncate">{m.fullForm}</p>
                                {m.category && <p className="text-xs text-slate-400">Category: {m.category}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400">No mnemonics added yet.</p>
                )}
            </div>
            <p className="text-xs text-slate-500 mt-4">User ID: {userId}</p>
        </div>
    );
};

export default DashboardPage;
