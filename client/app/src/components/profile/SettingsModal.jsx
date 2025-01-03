import React, { useState, useEffect } from 'react';
import '../styles/SettingsModal.css'; 
import { ClipLoader } from 'react-spinners'; // Импортируем спиннер
import { ChromePicker } from 'react-color'; // Импортируем ChromePicker

const SettingsModal = ({ isOpen, onClose }) => {
    const [username, setUsername] = useState('');
    const [color, setColor] = useState('#ffffff'); // Цвет по умолчанию
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Состояние загрузки
    const [displayColorPicker, setDisplayColorPicker] = useState(false); // Состояние для показа/скрытия цветового пикара
    const [newPassword, setNewPassword] = useState(''); // Состояние для нового пароля
    const [confirmPassword, setConfirmPassword] = useState(''); // Состояние для подтверждения пароля
    const [userId, setUserId] = useState(null); // Состояние для хранения userId

    // Функция для получения userId из API
    const fetchUserId = async () => {
        try {
            const token = localStorage.getItem('token'); // Получаем токен из localStorage
            if (!token) {
                throw new Error('Токен отсутствует. Пожалуйста, войдите снова.');
            }

            const response = await fetch('http://localhost:3000/user-id', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при получении userId');
            }

            const data = await response.json();
            console.log("Данные пользователя:", data); // Логируем данные пользователя
            setUserId(data.userId); // Устанавливаем userId из ответа
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchUserId(); // Вызываем функцию при открытии модального окна
        }
    }, [isOpen]); // Зависимость от isOpen

    if (!isOpen) return null; // Возвращаем null если модальное окно закрыто

    const handleSave = async () => {
        setIsLoading(true); // Начинаем загрузку
    
        try {
            // Отправка запроса на смену пароля, если он введен
            if (newPassword) {
                if (newPassword !== confirmPassword) {
                    alert("Пароли не совпадают"); // Проверка на совпадение паролей
                    return;
                }
    
                const response = await fetch('http://localhost:3000/change-password', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId, 
                        password: newPassword,
                    }),
                });
    
                // Проверяем статус ответа
                if (!response.ok) {
                    const errorData = await response.json(); // Получаем данные об ошибке
                    throw new Error(errorData.message || 'Ошибка при смене пароля');
                }
    
                const data = await response.json();
                console.log(data.message); // Логируем сообщение от сервера
            }
    
            console.log('Updated Settings:', { username, color, notificationsEnabled });
            
        } catch (error) {
            console.error("Ошибка:", error);
        } finally {
            // Устанавливаем задержку перед скрытием спиннера
            setTimeout(() => {
                setIsLoading(false); // Останавливаем загрузку после задержки
                onClose(); // Закрываем модальное окно после сохранения
            }, 1000); // Задержка в 2 секунды (2000 мс)
        }
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
                            onClick={() => setDisplayColorPicker(!displayColorPicker)} // Переключаем цветовой пикер
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
                    <label>
                        Новый пароль:
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Введите новый пароль"
                        />
                    </label>
                    <label>
                        Подтверждение пароля:
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Подтвердите новый пароль"
                        />
                    </label>
                </div>
                <button 
                    className='btn__close__settings' 
                    onClick={handleSave} 
                    disabled={isLoading} // Отключаем кнопку во время загрузки
                >
                    {isLoading ? (
                        <ClipLoader color="#ffffff" loading={isLoading} size={20} /> // Показываем спиннер
                    ) : (
                        'Сохранить'
                    )}
                </button>
            </div>
        </div>
    );
};

export default SettingsModal;
