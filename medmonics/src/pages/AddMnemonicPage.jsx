// AddMnemonicPage.js
import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getMnemonicsCollectionPath } from '../firebase';
import { PlusCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline'; // Add this if you have Heroicons installed

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
        <div className="flex justify-center items-center min-h-[70vh]">
            <div className="w-full max-w-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-8 rounded-2xl shadow-2xl border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                    {editingMnemonic ? (
                        <PencilSquareIcon className="h-7 w-7 text-yellow-400" />
                    ) : (
                        <PlusCircleIcon className="h-7 w-7 text-green-400" />
                    )}
                    <h2 className={`text-2xl md:text-3xl font-bold ${editingMnemonic ? 'text-yellow-400' : 'text-green-400'}`}>
                        {editingMnemonic ? 'Edit Mnemonic' : 'Add New Mnemonic'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="mnemonic-acronym-form" className="block text-sm font-semibold text-slate-200 mb-1">
                            Acronym/Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="mnemonic-acronym-form"
                            value={acronym}
                            onChange={(e) => setAcronym(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg bg-slate-700 text-gray-100 border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                            placeholder="e.g., FAST, ABCDE"
                        />
                    </div>
                    <div>
                        <label htmlFor="mnemonic-fullform-form" className="block text-sm font-semibold text-slate-200 mb-1">
                            Full Form/Meaning <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="mnemonic-fullform-form"
                            value={fullForm}
                            onChange={(e) => setFullForm(e.target.value)}
                            rows="3"
                            required
                            className="w-full p-3 rounded-lg bg-slate-700 text-gray-100 border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                            placeholder="e.g., Face, Arms, Speech, Time"
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="mnemonic-category-form" className="block text-sm font-semibold text-slate-200 mb-1">
                            Category
                        </label>
                        <input
                            type="text"
                            id="mnemonic-category-form"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-3 rounded-lg bg-slate-700 text-gray-100 border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                            placeholder="e.g., Stroke, Emergency"
                        />
                    </div>
                    <div>
                        <label htmlFor="mnemonic-description-form" className="block text-sm font-semibold text-slate-200 mb-1">
                            Description/Notes
                        </label>
                        <textarea
                            id="mnemonic-description-form"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="2"
                            className="w-full p-3 rounded-lg bg-slate-700 text-gray-100 border border-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                            placeholder="Additional details or context"
                        ></textarea>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            className={`flex-1 text-white font-semibold py-3 px-4 rounded-lg shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105 focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${
                                editingMnemonic
                                    ? 'bg-yellow-500 hover:bg-yellow-400 focus:ring-yellow-400'
                                    : 'bg-green-600 hover:bg-green-500 focus:ring-green-500'
                            }`}
                        >
                            {editingMnemonic ? 'Update Mnemonic' : 'Save Mnemonic'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 bg-slate-500 hover:bg-slate-400 text-white font-semibold py-3 px-4 rounded-lg shadow-lg transition-all focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
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
