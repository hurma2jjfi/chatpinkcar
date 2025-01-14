import React, { useEffect, useState } from 'react';
import './styles/UserStatus.css';

const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

const UserStatus = () => {
    const [isOnline, setIsOnline] = useState(false);
    const token = localStorage.getItem('token');

    const fetchUserStatus = async () => {
        try {
            const response = await fetch('http://localhost:3000/status/current', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Ошибка при получении статуса пользователя');

            const data = await response.json();
            setIsOnline(data.isOnline);
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    const updateOnlineStatus = async (status) => {
        try {
            const response = await fetch('http://localhost:3000/status/online', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isOnline: status })
            });

            if (!response.ok) throw new Error('Ошибка при обновлении статуса онлайн');
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    const updateLastActivity = async () => {
        const activityTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        try {
            const response = await fetch('http://localhost:3000/status/activity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ lastActivity: activityTime })
            });

            if (!response.ok) throw new Error('Ошибка при обновлении времени активности');
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    const debouncedUpdateLastActivity = debounce(updateLastActivity, 2000);

    useEffect(() => {
        fetchUserStatus();
        updateOnlineStatus(true);

        const handleActivity = () => {
            debouncedUpdateLastActivity();
        };

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keypress', handleActivity);

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keypress', handleActivity);
            updateOnlineStatus(false);
        };
    }, []);

    return (
        <div id="online-status">
            <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}></div>
            <span>{isOnline ? '' : ''}</span>
        </div>
    );
};

export default UserStatus;
