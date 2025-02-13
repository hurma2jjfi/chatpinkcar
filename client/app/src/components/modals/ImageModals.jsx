import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import '../styles/ImageModal.css'; 

const ImageModals = ({ imageUrl, onClose }) => {
    return (
        <div className="image-modal-overlay" onClick={onClose}>
            <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="image-modal-close" onClick={onClose}>
                    <CloseIcon className='close__btn__modals' />
                </button>
                <img src={imageUrl} alt="Full size" className="image-modal-image" />
            </div>
        </div>
    );
};

export default ImageModals;