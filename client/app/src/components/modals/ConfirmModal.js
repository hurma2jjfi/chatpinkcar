import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out">
            <div className="fixed inset-0 backdrop-blur-sm" style={{ backdropFilter: 'blur(5px)' }}></div>
            <div className="bg-white rounded-lg p-4 shadow-lg transform transition-transform duration-300 ease-in-out scale-100 hover:scale-105 z-60">
                <h2 className="text-lg font-semibold text-black">Подтверждение</h2>
                <p className="text-black">Вы уверены, что хотите удалить это сообщение?</p>
                <div className="flex justify-end mt-4">
                    <button 
                        className="bg-gray-200 text-gray-700 rounded px-2 py-1 mr-2 hover:bg-gray-300 transition" 
                        onClick={onClose}
                    >
                        Отмена
                    </button>
                    <button 
                        className="bg-red-400 text-white rounded px-2 py-1 hover:bg-red-500 transition" 
                        onClick={onConfirm}
                    >
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
