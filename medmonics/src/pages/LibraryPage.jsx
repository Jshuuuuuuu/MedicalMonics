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
        <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-sky-300">My Mnemonics</h2>
            <div className="mb-4 flex flex-col sm:flex-row gap-2">
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-2 rounded-lg bg-slate-700 text-gray-100 border border-slate-600 focus:ring-2 focus:ring-sky-500 outline-none"
                />
                <select 
                    value={categoryFilter} 
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-2 rounded-lg bg-slate-700 text-gray-100 border border-slate-600 focus:ring-2 focus:ring-sky-500 outline-none"
                >
                    {uniqueCategories.map(cat => (
                        <option key={cat || 'all'} value={cat}>{cat || 'All Categories'}</option>
                    ))}
                </select>
            </div>
            <div className="mnemonic-list-container max-h-[calc(100vh-250px)] md:max-h-[calc(100vh-220px)] overflow-y-auto bg-slate-700 p-4 rounded-lg shadow-inner space-y-4">
                {filteredMnemonics.length > 0 ? filteredMnemonics.map(m => (
                    <div key={m.id} className="bg-slate-600 p-4 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-sky-300 mb-1">{m.acronym}</h3>
                        <p className="text-slate-200 whitespace-pre-wrap mb-1">{m.fullForm}</p>
                        {m.category && <p className="text-xs text-slate-400 mb-1"><strong>Category:</strong> {m.category}</p>}
                        {m.description && <p className="text-sm text-slate-300 italic whitespace-pre-wrap"><strong>Notes:</strong> {m.description}</p>}
                        <div className="mt-3 flex gap-2 justify-end">
                            <button onClick={() => onEditMnemonic(m)} className="bg-yellow-500 hover:bg-yellow-400 text-slate-800 font-medium py-1 px-3 rounded-md text-sm">Edit</button>
                            <button onClick={() => setMnemonicToDelete(m)} className="bg-red-600 hover:bg-red-500 text-white font-medium py-1 px-3 rounded-md text-sm">Delete</button>
                        </div>
                    </div>
                )) : <p className="text-slate-400 text-center">No mnemonics found. Try adjusting your search or add some!</p>}
            </div>
            <Modal isOpen={!!mnemonicToDelete} onClose={() => setMnemonicToDelete(null)} title="Confirm Deletion">
                <p className="text-slate-300 mb-6">Are you sure you want to delete the mnemonic "<strong>{mnemonicToDelete?.acronym}</strong>"? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setMnemonicToDelete(null)} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg">Cancel</button>
                    <button onClick={handleDelete} className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg">Delete</button>
                </div>
            </Modal>
        </div>
    );
};

export default LibraryPage;
