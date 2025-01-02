import React, { useState } from 'react';
import '../styles/SettingsModal.css'; 
import { ClipLoader } from 'react-spinners'; // Import the spinner
import { ChromePicker } from 'react-color'; // Import ChromePicker

const SettingsModal = ({ isOpen, onClose }) => {
    const [username, setUsername] = useState('');
    const [color, setColor] = useState('#ffffff'); // Default color
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [displayColorPicker, setDisplayColorPicker] = useState(false); // State to show/hide color picker

    if (!isOpen) return null;

    const handleSave = () => {
        setIsLoading(true); // Start loading

        setTimeout(() => {
            console.log('Updated Settings:', { username, color, notificationsEnabled });
            setUsername('');
            setColor('#ffffff'); // Reset to default color
            setNotificationsEnabled(false); // Reset toggle
            onClose(); // Close the modal after saving
            
            setIsLoading(false); // Stop loading
        }, 2000); // Simulate an API call delay of 2 seconds
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className='text-center'>Настройки</h2>
                <div className="settings-form">
                    <label>
                        Имя пользователя:
                        <input
                            className='field__username'
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="Новое имя"
                        />
                    </label>
                    <label>
                        Выберите цвет:
                        <div 
                            className='color__picker'
                            style={{ backgroundColor: color }}
                            onClick={() => setDisplayColorPicker(!displayColorPicker)} // Toggle color picker
                        />
                        {displayColorPicker && (
                            <div className="color-picker-container">
                                <ChromePicker 
                                    color={color} 
                                    onChangeComplete={(color) => setColor(color.hex)} 
                                />
                            </div>
                        )}
                    </label>
                    <label>
                        <input 
                            type="checkbox" 
                            checked={notificationsEnabled} 
                            onChange={() => setNotificationsEnabled(!notificationsEnabled)} 
                        />
                        Включить уведомления
                    </label>
                </div>
                <button 
                    className='btn__close__settings' 
                    onClick={handleSave} 
                    disabled={isLoading} // Disable button while loading
                >
                    {isLoading ? (
                        <ClipLoader color="#ffffff" loading={isLoading} size={20} /> // Show spinner
                    ) : (
                        'Сохранить'
                    )}
                </button>
            </div>
        </div>
    );
};

export default SettingsModal;
