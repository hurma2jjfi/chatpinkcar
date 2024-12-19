import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EmojiPicker from 'emoji-picker-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const socket = io('http://127.0.0.1:3000');

function Room() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingMessageText, setEditingMessageText] = useState('');

    // Эффект для обновления заголовка страницы
    useEffect(() => {
        document.title = `Чат - ${messages.length} ${messages.length === 1 ? 'сообщение' : 'сообщений'}`;
    }, [messages.length]);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Токен отсутствует. Пожалуйста, войдите снова.');
                navigate('/login');
                return;
            }
            try {
                const response = await axios.get('http://localhost:3000/api/current-user', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserId(response.data.userId);
            } catch (error) {
                console.error("Ошибка при получении данных пользователя:", error);
                toast.error('Ошибка при получении данных пользователя.');
            }
        };

        const loadMessages = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/messages');
                setMessages(response.data);

                // Отправляем событие о том, что пользователь вошел в комнату
                socket.emit('userJoined', response.data.userId); // Отправьте ID пользователя на сервер
                
                // Отправляем запрос на обновление статуса просмотра для всех сообщений
                for (const msg of response.data) {
                    await axios.post(`http://localhost:3000/api/messages/${msg.id}/view`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                }
            } catch (error) {
                console.error("Ошибка при загрузке сообщений:", error);
                toast.error('Ошибка при загрузке сообщений.');
            }
        };

        fetchUserData();
        loadMessages();

        socket.on('receiveMessage', (newMessage) => {
            setMessages(prevMessages => [...prevMessages, newMessage]);
            toast.info(`Новое сообщение: ${newMessage.message}`);
        });

        socket.on('messageViewed', (messageId) => {
            setMessages((prevMessages) => {
                return prevMessages.map((msg) => {
                    if (msg.id === messageId) {
                        return { ...msg, viewed_by: [...(msg.viewed_by || []), userId] }; 
                    }
                    return msg;
                });
            });
        });

        toast.success('Вы успешно вошли в комнату чата!');

        return () => {
            socket.off('receiveMessage');
            socket.off('messageViewed');
        };
    }, []);

    const handleSendMessage = () => {
        if (message.trim() && userId) {
            socket.emit('sendMessage', { userId, message });
            setMessage('');
        } else {
            toast.error('Сообщение не может быть пустым или отсутствовать идентификатор пользователя');
        }
    };

    const handleEditClick = (msg) => {
        setEditingMessageId(msg.id);
        setEditingMessageText(msg.message);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingMessageText.trim()) {
            toast.error('Сообщение не может быть пустым');
            return;
        }

        try {
            const token = localStorage.getItem('token'); // Get token from local storage
            await axios.put(`http://localhost:3000/api/messages/${editingMessageId}`, 
                { message: editingMessageText }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.id === editingMessageId ? { ...msg, message: editingMessageText } : msg
                )
            );
            setEditingMessageId(null);
            setEditingMessageText('');
            toast.success('Сообщение обновлено!');
        } catch (error) {
            console.error(error);
            toast.error('Ошибка при обновлении сообщения: ' + (error.response?.data || error.message));
        }
    };
    
    const handleDeleteClick = async (messageId) => {
        if (window.confirm('Вы уверены, что хотите удалить это сообщение?')) {
            try {
                const token = localStorage.getItem('token'); // Get token from local storage
                await axios.delete(`http://localhost:3000/api/messages/${messageId}`, { headers: { Authorization: `Bearer ${token}` } });
                setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
                toast.success('Сообщение удалено!');
            } catch (error) {
                console.error(error);
                toast.error('Ошибка при удалении сообщения: ' + (error.response?.data || error.message));
            }
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setMessage(prev => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    const handleLogout = () => {
        toast.loading('Выход из системы');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
    };

    return (
        <div>
            <h1>Комната чата</h1>
            
            <div>
                {messages.map((msg) => (
                    <div key={msg.id}>
                        <strong>{msg.username}</strong>: 
                        <span>{msg.message}</span>
                        <span> ({msg.viewed_by ? msg.viewed_by.length : 0} просмотров)</span>
                        {editingMessageId === msg.id ? (
                            <form onSubmit={handleEditSubmit}>
                                <input
                                    type="text"
                                    value={editingMessageText}
                                    onChange={(e) => setEditingMessageText(e.target.value)}
                                    required
                                />
                                <button type="submit">Сохранить</button>
                            </form>
                        ) : (
                            <>
                                <button onClick={() => handleEditClick(msg)}>Редактировать</button>
                                <button onClick={() => handleDeleteClick(msg.id)}>Удалить</button>
                            </>
                        )}
                    </div>
                ))}
            </div>

            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Введите сообщение"
            />
            <button onClick={handleSendMessage}>Отправить</button>
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😀</button>
            <button onClick={handleLogout}>Выйти</button>

            {showEmojiPicker && (
                <EmojiPicker onEmojiClick={handleEmojiClick} />
            )}
            
            <ToastContainer />
        </div>
    );
}

export default Room;
