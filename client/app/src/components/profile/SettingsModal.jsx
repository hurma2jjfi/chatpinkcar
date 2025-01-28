import React, { useState, useEffect } from 'react';
import '../styles/SettingsModal.css'; 
import { ClipLoader } from 'react-spinners';
import ProfileSettingsIcon from './ProfileSettingsIcon';

const SettingsModal = ({ isOpen, onClose }) => {
    const [username, setUsername] = useState('');
    const [color, setColor] = useState('#ffffff');
    const [isLoading, setIsLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userId, setUserId] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Функция для получения userId из API
    const fetchUserId = async () => {
        try {
            const token = localStorage.getItem('token');
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
            setUserId(data.userId);
            return data.userId;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    // Функция для получения профиля пользователя
    const fetchUserProfile = async (userId) => {
        if (!userId) return;

        setProfileLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/user-profile?userId=${userId}`);
            
            if (!response.ok) {
                throw new Error('Ошибка получения профиля');
            }

            const data = await response.json();
            setUserProfile(data);
            setUsername(data.username); // Добавьте установку username
        } catch (error) {
            console.error("Ошибка загрузки профиля:", error);
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            const loadUserData = async () => {
                const id = await fetchUserId();
                if (id) {
                    fetchUserProfile(id);
                }
            };
            loadUserData();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsLoading(true);
    
        try {
            if (newPassword) {
                if (newPassword !== confirmPassword) {
                    alert("Пароли не совпадают");
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
    
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Ошибка при смене пароля');
                }
    
                const data = await response.json();
                console.log(data.message);
            }
        } catch (error) {
            console.error("Ошибка:", error);
        } finally {
            setTimeout(() => {
                setIsLoading(false);
                onClose();
            }, 1000);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
            <span 
                    className="close__btn__settings" 
                    onClick={onClose}
                >
                    ✕
                </span>
                <h2 className="text-center text-dark">Настройки</h2>
                {profileLoading ? (
                    <div className="profile-loading">
                        <ClipLoader color="#000" loading={true} size={50} />
                    </div>
                ) : userProfile && (
                    <div className="user-profile-info">
                       
                       
                       <ProfileSettingsIcon username={username} />
                       
                        <div className='name__user'>
                            <strong>Имя пользователя:</strong> {userProfile.username}
                        </div>
                        <div className='email'>
                            <strong>Почта:</strong> {userProfile.email}
                        </div>
                        <div className='timestamp'>
                            <strong>Дата регистрации:</strong> {new Date(userProfile.created_at).toLocaleDateString()}
                        </div>
                        {userProfile.bio && (
                            <div className='bio'>
                                <strong>Биография:</strong> {userProfile.bio}
                            </div>
                        )}
                    </div>
                )}

                <div className="settings-form">
                    <label>
                        Новый пароль:
                        <input
                            className='fild__new'
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Введите новый пароль"
                        />
                    </label>
                    <label>
                        Подтверждение пароля:
                        <input
                            className='fild__one'
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
                    disabled={isLoading} 
                >
                    {isLoading ? (
                        <ClipLoader color="#ffffff" loading={isLoading} size={20} /> 
                    ) : (
                        'Сохранить'
                    )}
                </button>
            </div>
        </div>
    );
};

export default SettingsModal;
