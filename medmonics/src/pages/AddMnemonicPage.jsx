// AddMnemonicPage.js
import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getMnemonicsCollectionPath } from '../firebase';

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
                if(onMnemonicUpdated) onMnemonicUpdated({ id: editingMnemonic.id, ...mnemonicData });
            } else {
                mnemonicData.createdAt = Timestamp.now();
                const docRef = await addDoc(collection(db, mnemonicsColPath), mnemonicData);
                showToast('Mnemonic added successfully!', 'success');
                if(onMnemonicAdded) onMnemonicAdded({ id: docRef.id, ...mnemonicData });
            }
            setAcronym(''); setFullForm(''); setCategory(''); setDescription('');
            if(clearEditing) clearEditing();

        } catch (error) {
            console.error("Error saving mnemonic: ", error);
            showToast(`Error saving mnemonic: ${error.message}`, 'error');
        }
    };
    
    const handleCancel = () => {
        setAcronym(''); setFullForm(''); setCategory(''); setDescription('');
        if(clearEditing) clearEditing();
    }

    return (
        <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-green-400">
                {editingMnemonic ? 'Edit Mnemonic' : 'Add New Mnemonic'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800 p-6 rounded-xl shadow-lg">
                <div>
                    <label htmlFor="mnemonic-acronym-form" className="block text-sm font-medium text-slate-300 mb-1">Acronym/Title <span className="text-red-500">*</span></label>
                    <input type="text" id="mnemonic-acronym-form" value={acronym} onChange={(e) => setAcronym(e.target.value)} required className="w-full p-2 rounded-lg bg-slate-700 text-gray-100 border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" placeholder="e.g., FAST, ABCDE" />
                </div>
                <div>
                    <label htmlFor="mnemonic-fullform-form" className="block text-sm font-medium text-slate-300 mb-1">Full Form/Meaning <span className="text-red-500">*</span></label>
                    <textarea id="mnemonic-fullform-form" value={fullForm} onChange={(e) => setFullForm(e.target.value)} rows="3" required className="w-full p-2 rounded-lg bg-slate-700 text-gray-100 border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" placeholder="e.g., Face, Arms, Speech, Time"></textarea>
                </div>
                <div>
                    <label htmlFor="mnemonic-category-form" className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                    <input type="text" id="mnemonic-category-form" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 rounded-lg bg-slate-700 text-gray-100 border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" placeholder="e.g., Stroke, Emergency" />
                </div>
                <div>
                    <label htmlFor="mnemonic-description-form" className="block text-sm font-medium text-slate-300 mb-1">Description/Notes</label>
                    <textarea id="mnemonic-description-form" value={description} onChange={(e) => setDescription(e.target.value)} rows="2" className="w-full p-2 rounded-lg bg-slate-700 text-gray-100 border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" placeholder="Additional details or context"></textarea>
                </div>
                <div className="flex gap-2 pt-2">
                    <button type="submit" className={`flex-1 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-all duration-150 ease-in-out transform hover:scale-105 ${editingMnemonic ? 'bg-yellow-500 hover:bg-yellow-400' : 'bg-green-600 hover:bg-green-500'}`}>
                        {editingMnemonic ? 'Update Mnemonic' : 'Save Mnemonic'}
                    </button>
                    <button type="button" onClick={handleCancel} className="flex-1 bg-slate-500 hover:bg-slate-400 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition-all">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default AddMnemonicPage;
