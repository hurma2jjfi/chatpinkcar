import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons'; 

const FlagMessage = ({ message }) => {
    const [isRead, setIsRead] = useState(false);
    const userId = localStorage.getItem('user_id'); // Получаем ID текущего пользователя из localStorage

    useEffect(() => {
        const checkMessageStatus = async () => {
            try {
                const response = await fetch(`/api/messages/${message.id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}` 
                    }
                });

                if (response.ok) {
                    const updatedMessage = await response.json();
                    // Проверяем, прочитал ли текущий пользователь сообщение
                    setIsRead(updatedMessage.viewed_by ? JSON.parse(updatedMessage.viewed_by).includes(userId) : false);
                } else {
                    // console.error('Ошибка при получении статуса сообщения:', response.statusText);
                }
            } catch (error) {
                // console.error('Ошибка при получении статуса сообщения:', error.message);
            }
        };

        checkMessageStatus();
        const intervalId = setInterval(checkMessageStatus, 5000); // Проверка каждые 5 секунд
        return () => clearInterval(intervalId);
    }, [message.id, userId]);

    const handleClick = async () => {
        if (!isRead) {
            try {
                const response = await fetch(`/api/messages/${message.id}/view`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ userId }) // Убедитесь, что здесь правильный ID пользователя
                });
    
                if (response.ok) {
                    setIsRead(true);
                } else {
                    // console.error('Ошибка при обновлении статуса сообщения:', response.statusText);
                }
            } catch (error) {
                // console.error('Ошибка при обновлении статуса сообщения:', error.message);
            }
        }
    };

    return (
        <div onClick={handleClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <FontAwesomeIcon icon={faCheck} style={{ color: isRead ? 'green' : 'gray' }} />
            <span style={{ marginLeft: '8px' }}>{isRead ? 'Прочитано' : 'Непрочитано'}</span>
        </div>
    );
};

export default FlagMessage;