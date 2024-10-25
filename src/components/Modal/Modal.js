import React, { useEffect, useState } from 'react';
import './Modal.css';

const Modal = ({ show, imageUrl, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
        } else {
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [show]);

    if (!show && !isVisible) {
        return null;
    }

    return (
        <div className={`modal-overlay ${show ? 'show' : ''}`} onClick={onClose}>
            <div className={`modal-content ${show ? 'show' : ''}`} onClick={e => e.stopPropagation()}>
                <img src={imageUrl} alt="Full-size card" />
            </div>
        </div>
    );
};

export default Modal;