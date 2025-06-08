import React from 'react';
import '../styles/Modal.css'; // Assuming we create a Modal.css file for custom styles

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
