// Modal.js
import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-sky-400">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-2xl">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
