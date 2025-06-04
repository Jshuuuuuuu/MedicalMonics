// LibraryPage.js
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Modal from '../contexts/Modal'; // Assuming Modal.js is in the same folder
import { getMnemonicsCollectionPath } from '../firebase';

const LibraryPage = ({ onEditMnemonic }) => {
    const { userId, db } = useAuth();
    const [mnemonics, setMnemonics] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [uniqueCategories, setUniqueCategories] = useState([]);
    const [mnemonicToDelete, setMnemonicToDelete] = useState(null);
    const showToast = useToast();

    useEffect(() => {
        if (!userId || !db) return;
        const mnemonicsColPath = getMnemonicsCollectionPath(userId);
        const q = query(collection(db, mnemonicsColPath));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMnemonics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMnemonics(fetchedMnemonics);
            const categories = new Set(fetchedMnemonics.map(m => m.category).filter(Boolean));
            setUniqueCategories(['', ...Array.from(categories).sort()]);
        }, (error) => {
            console.error("Error fetching mnemonics:", error);
            showToast(`Error fetching mnemonics: ${error.message}`, 'error');
        });
        return () => unsubscribe();
    }, [userId, db, showToast]);

    const handleDelete = async () => {
        if (!mnemonicToDelete || !userId || !db) return;
        try {
            const mnemonicsColPath = getMnemonicsCollectionPath(userId);
            await deleteDoc(doc(db, mnemonicsColPath, mnemonicToDelete.id));
            showToast('Mnemonic deleted successfully!', 'warning');
            setMnemonicToDelete(null);
        } catch (error) {
            console.error("Error deleting mnemonic:", error);
            showToast(`Error deleting: ${error.message}`, 'error');
        }
    };

    const filteredMnemonics = mnemonics.filter(m => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesSearch = (
            m.acronym.toLowerCase().includes(lowerSearchTerm) ||
            m.fullForm.toLowerCase().includes(lowerSearchTerm) ||
            (m.description && m.description.toLowerCase().includes(lowerSearchTerm))
        );
        const matchesCategory = categoryFilter ? m.category === categoryFilter : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-sky-400">📚 My Mnemonics</h2>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                <div className="flex-1">
                    <label htmlFor="search" className="text-sm text-slate-300 block mb-1">Search</label>
                    <input
                        id="search"
                        type="text"
                        placeholder="Search by acronym, full form, notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 rounded-lg bg-slate-700 text-gray-100 border border-slate-600 focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                </div>
                <div className="sm:w-64">
                    <label htmlFor="category" className="text-sm text-slate-300 block mb-1">Filter by Category</label>
                    <select
                        id="category"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full p-3 rounded-lg bg-slate-700 text-gray-100 border border-slate-600 focus:ring-2 focus:ring-sky-500 outline-none"
                    >
                        {uniqueCategories.map(cat => (
                            <option key={cat || 'all'} value={cat}>{cat || 'All Categories'}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mnemonic-list-container max-h-[calc(100vh-250px)] md:max-h-[calc(100vh-220px)] overflow-y-auto bg-slate-700 p-4 rounded-xl shadow-inner space-y-5 transition-all duration-200">
                {filteredMnemonics.length > 0 ? filteredMnemonics.map(m => (
                    <div
                        key={m.id}
                        className="bg-slate-600 p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-semibold text-sky-300">{m.acronym}</h3>
                                <p className="text-slate-200 whitespace-pre-wrap">{m.fullForm}</p>
                                {m.category && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        <strong>Category:</strong> {m.category}
                                    </p>
                                )}
                                {m.description && (
                                    <p className="text-sm text-slate-300 italic mt-1 whitespace-pre-wrap">
                                        <strong>Notes:</strong> {m.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onEditMnemonic(m)}
                                    className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold py-1 px-3 rounded-lg text-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => setMnemonicToDelete(m)}
                                    className="bg-red-600 hover:bg-red-500 text-white font-semibold py-1 px-3 rounded-lg text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-slate-400 p-6">
                        <p className="text-lg mb-2">🤔 No mnemonics found.</p>
                        <p>Try adjusting your filters or add new mnemonics from the dashboard.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={!!mnemonicToDelete} onClose={() => setMnemonicToDelete(null)} title="Confirm Deletion">
                <p className="text-slate-300 mb-6">
                    Are you sure you want to delete the mnemonic "<strong>{mnemonicToDelete?.acronym}</strong>"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setMnemonicToDelete(null)}
                        className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg"
                    >
                        Delete
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default LibraryPage;
