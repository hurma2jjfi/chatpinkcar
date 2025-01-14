import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out">
    <div className="fixed inset-0 backdrop-blur-sm" style={{ backdropFilter: 'blur(5px)' }}></div>
    <div className="bg-dark rounded-2xl p-4 shadow-lg transform transition-transform duration-300 ease-in-out scale-100 hover:scale-105 z-60">
        <h2 className="text-lg font-semibold text-white">Подтверждение</h2>
        <p className="text-white">Вы уверены, что хотите удалить это сообщение?</p>
        <div className="flex justify-end mt-4">
            <button 
                className="bg-gray-600 text-white rounded px-2 py-1 mr-2 hover:bg-gray-700 transition" 
                onClick={onClose}
            >
                ОТМЕНА
            </button>
            <button
                className="bg-red-600 text-white rounded px-2 py-1 hover:bg-red-700 transition" 
                onClick={onConfirm}
            >
                УДАЛИТЬ
            </button>
        </div>
    </div>
</div>

    );
};

export default ConfirmModal;
