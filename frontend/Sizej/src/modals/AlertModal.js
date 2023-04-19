import React, { useEffect, useRef } from 'react';
import styles from './alertModal.module.css';

const AlertModal = ({ modalStyle, children, show, onClose, isExpanded, isExtraExpanded, backdropStyle }) => {
    const modalRef = useRef(null);
    useEffect(
        () => {
            if(show) {
                modalRef.current.classList.add(styles.visible);
            }
            else {
                modalRef.current.classList.remove(styles.visible);
            }
        },
        [show]
    );
    return (
        <React.Fragment>
            <div ref={modalRef} style={backdropStyle} className={`${styles.modal__wrap}`}>
                <div style={modalStyle} className={isExpanded ? isExtraExpanded ? styles.modalExtraExpanded : styles.modalExpanded : styles.modal}>
                    {children}
                </div>
            </div>
        </React.Fragment>
    );
};

export default AlertModal;