// LibraryPage.js (Classic CSS version)
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Modal from '../contexts/Modal';
import { getMnemonicsCollectionPath } from '../firebase';
import '../styles/common.css';
import '../styles/LibraryPage.css';


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
        <div className="library-page">
            <h2 className="library-title">📚 My Mnemonics</h2>

            <div className="library-filters">
                <div className="filter-group">
                    <label htmlFor="search">Search</label>
                    <input
                        id="search"
                        type="text"
                        placeholder="Search by acronym, full form, notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label htmlFor="category">Filter by Category</label>
                    <select
                        id="category"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        {uniqueCategories.map(cat => (
                            <option key={cat || 'all'} value={cat}>{cat || 'All Categories'}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mnemonic-list">
                {filteredMnemonics.length > 0 ? filteredMnemonics.map(m => (
                    <div key={m.id} className="mnemonic-card">
                        <div className="mnemonic-content">
                            <div>
                                <h3 className="mnemonic-acronym">{m.acronym}</h3>
                                <p className="mnemonic-fullform">{m.fullForm}</p>
                                {m.category && <p className="mnemonic-category"><strong>Category:</strong> {m.category}</p>}
                                {m.description && <p className="mnemonic-notes"><strong>Notes:</strong> {m.description}</p>}
                            </div>
                            <div className="mnemonic-actions">
                                <button onClick={() => onEditMnemonic(m)} className="btn edit">Edit</button>
                                <button onClick={() => setMnemonicToDelete(m)} className="btn delete">Delete</button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="empty-message">
                        <p>🤔 No mnemonics found.</p>
                        <p>Try adjusting your filters or add new mnemonics from the dashboard.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={!!mnemonicToDelete} onClose={() => setMnemonicToDelete(null)} title="Confirm Deletion">
                <p className="modal-text">
                    Are you sure you want to delete the mnemonic "<strong>{mnemonicToDelete?.acronym}</strong>"? This action cannot be undone.
                </p>
                <div className="modal-actions">
                    <button onClick={() => setMnemonicToDelete(null)} className="btn cancel">Cancel</button>
                    <button onClick={handleDelete} className="btn confirm">Delete</button>
                </div>
            </Modal>
        </div>
    );
};

export default LibraryPage;