// AddMnemonicPage.js
import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getMnemonicsCollectionPath } from '../firebase';
import { PlusCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import '../styles/AddMnemonicPage.css';

const AddMnemonicPage = ({ onMnemonicAdded, editingMnemonic, onMnemonicUpdated, clearEditing }) => {
    const { userId, db } = useAuth();
    const [acronym, setAcronym] = useState('');
    const [fullForm, setFullForm] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const showToast = useToast();

    useEffect(() => {
        if (editingMnemonic) {
            setAcronym(editingMnemonic.acronym);
            setFullForm(editingMnemonic.fullForm);
            setCategory(editingMnemonic.category || '');
            setDescription(editingMnemonic.description || '');
        } else {
            setAcronym('');
            setFullForm('');
            setCategory('');
            setDescription('');
        }
    }, [editingMnemonic]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId || !db) {
            showToast("User not authenticated or DB not available.", "error");
            return;
        }
        if (!acronym.trim() || !fullForm.trim()) {
            showToast("Acronym and Full Form are required.", "error");
            return;
        }

        const mnemonicData = {
            acronym,
            fullForm,
            category,
            description,
            userId,
        };

        try {
            const mnemonicsColPath = getMnemonicsCollectionPath(userId);
            if (editingMnemonic) {
                mnemonicData.updatedAt = Timestamp.now();
                const mnemonicRef = doc(db, mnemonicsColPath, editingMnemonic.id);
                await updateDoc(mnemonicRef, mnemonicData);
                showToast('Mnemonic updated successfully!', 'success');
                if (onMnemonicUpdated) onMnemonicUpdated({ id: editingMnemonic.id, ...mnemonicData });
            } else {
                mnemonicData.createdAt = Timestamp.now();
                const docRef = await addDoc(collection(db, mnemonicsColPath), mnemonicData);
                showToast('Mnemonic added successfully!', 'success');
                if (onMnemonicAdded) onMnemonicAdded({ id: docRef.id, ...mnemonicData });
            }
            setAcronym('');
            setFullForm('');
            setCategory('');
            setDescription('');
            if (clearEditing) clearEditing();

        } catch (error) {
            console.error("Error saving mnemonic: ", error);
            showToast(`Error saving mnemonic: ${error.message}`, 'error');
        }
    };

    const handleCancel = () => {
        setAcronym('');
        setFullForm('');
        setCategory('');
        setDescription('');
        if (clearEditing) clearEditing();
    };

    return (
        <div className="mnemonic-page-wrapper">
            <div className="mnemonic-form-container">
                <div className="mnemonic-header">
                    {editingMnemonic ? (
                        <PencilSquareIcon className="mnemonic-icon yellow" />
                    ) : (
                        <PlusCircleIcon className="mnemonic-icon green" />
                    )}
                    <h2 className={`mnemonic-title ${editingMnemonic ? 'yellow' : 'green'}`}>
                        {editingMnemonic ? 'Edit Mnemonic' : 'Add New Mnemonic'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="mnemonic-form">
                    <div className="form-group">
                        <label htmlFor="mnemonic-acronym-form" className="form-label">
                            Acronym/Title <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="mnemonic-acronym-form"
                            value={acronym}
                            onChange={(e) => setAcronym(e.target.value)}
                            required
                            className="form-input"
                            placeholder="e.g., FAST, ABCDE"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="mnemonic-fullform-form" className="form-label">
                            Full Form/Meaning <span className="required">*</span>
                        </label>
                        <textarea
                            id="mnemonic-fullform-form"
                            value={fullForm}
                            onChange={(e) => setFullForm(e.target.value)}
                            rows="3"
                            required
                            className="form-input"
                            placeholder="e.g., Face, Arms, Speech, Time"
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="mnemonic-category-form" className="form-label">
                            Category
                        </label>
                        <input
                            type="text"
                            id="mnemonic-category-form"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="form-input"
                            placeholder="e.g., Stroke, Emergency"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="mnemonic-description-form" className="form-label">
                            Description/Notes
                        </label>
                        <textarea
                            id="mnemonic-description-form"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="2"
                            className="form-input"
                            placeholder="Additional details or context"
                        ></textarea>
                    </div>
                    <div className="form-actions">
                        <button
                            type="submit"
                            className={`submit-btn ${editingMnemonic ? 'yellow' : 'green'}`}
                        >
                            {editingMnemonic ? 'Update Mnemonic' : 'Save Mnemonic'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMnemonicPage;
