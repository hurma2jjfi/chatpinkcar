import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EmojiPicker from 'emoji-picker-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SendBtn from '../assets/Group 234.svg';
import Stikers from '../assets/Stikers.svg';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmModal from './modals/ConfirmModal';
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';
import FlagMessage from './modals/FlagMessage';
import VoiceMessageInput from './voice/VoiseMessage';
import ProfileIcon from './profile/ProfileIcon';
import SimpleMenu from './profile/SimpleMenu';

const socket = io('http://127.0.0.1:3000');

function Room() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingMessageText, setEditingMessageText] = useState('');
    const [hasJoinedRoom, setHasJoinedRoom] = useState(false); // Флаг для уведомления
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    
    

    useEffect(() => {
        const originalTitle = `Чат - ${messages.length} ${messages.length === 1 ? 'сообщение' : 'сообщений'}`;
        document.title = originalTitle;

        let blinkInterval;
        if (messages.length > 0) {
            // Начинаем мигание заголовка
            blinkInterval = setInterval(() => {
                document.title = document.title === originalTitle ? '' : originalTitle; // Мигание заголовка
            }, 900); // Изменение каждые 500 мс

            // Останавливаем мигание через 2 секунды
            setTimeout(() => clearInterval(blinkInterval), 4000);
        }

        return () => clearInterval(blinkInterval); // Очистка интервала при размонтировании
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
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUserId(response.data.userId);
                setCurrentUser(response.data);
            } catch (error) {
                console.error('Ошибка при получении данных пользователя:', error);
                toast.error('Ошибка при получении данных пользователя.');
            }
        };

        

        const loadMessages = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/messages');
                const messagesWithTime = response.data.map((msg) => ({
                    ...msg,
                    created_at: msg.created_at
                        ? new Date(msg.created_at).toISOString()
                        : new Date().toISOString(),
                }));
                setMessages(messagesWithTime);

                socket.emit('userJoined', response.data.userId); // Сообщаем серверу, что пользователь вошел

                for (const msg of response.data) {
                    await axios.post(
                        `http://localhost:3000/api/messages/${msg.id}/view`,
                        {},
                        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
                    );
                }
            } catch (error) {
                console.error('Ошибка при загрузке сообщений:', error);
                toast.error('Ошибка при загрузке сообщений.');
            }
        };

        fetchUserData();
        loadMessages();

        socket.on('receiveMessage', (newMessage) => {
            const formattedMessage = {
                ...newMessage,
                created_at: new Date().toISOString(),
            };
            setMessages((prevMessages) => [...prevMessages, formattedMessage]);
            toast.info(`Новое сообщение: ${newMessage.message}`);
        });

        socket.on('messageViewed', (messageId) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) => {
                    if (msg.id === messageId) {
                        return { ...msg, viewed_by: [...(msg.viewed_by || []), userId] };
                    }
                    return msg;
                }),
            );
        });

        if (!hasJoinedRoom) {
            toast.success('Вы успешно вошли в комнату чата!');
            setHasJoinedRoom(true); // Устанавливаем флаг, чтобы уведомление больше не повторялось
        }

        return () => {
            socket.off('receiveMessage');
            socket.off('messageViewed');
        };
    }, [userId, navigate, hasJoinedRoom]); // Добавляем зависимость от hasJoinedRoom

    const handleSendMessage = () => {
        if (message.trim() && userId) {
            const newMessage = {
                userId,
                message,
                created_at: new Date().toISOString(),
            };
            socket.emit('sendMessage', newMessage);
            setMessage('');
        } else {
            toast.error('Сообщение не может быть пустым');
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
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:3000/api/messages/${editingMessageId}`,
                { message: editingMessageText },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === editingMessageId ? { ...msg, message: editingMessageText } : msg,
                ),
            );
            setEditingMessageId(null);
            setEditingMessageText('');
            toast.success('Сообщение обновлено!');
        } catch (error) {
            console.error(error);
            toast.error('Ошибка при обновлении сообщения: ' + (error.response?.data || error.message));
        }
    };

    const handleConfirmDelete = async () => {
        if (messageToDelete) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:3000/api/messages/${messageToDelete}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageToDelete));
                toast.success('Сообщение удалено!');
            } catch (error) {
                console.error(error);
                toast.error('Ошибка при удалении сообщения: ' + (error.response?.data || error.message));
            }
        }
        setIsModalOpen(false); // Закрываем модальное окно
    };

    const handleDeleteClick = (messageId) => {
        setMessageToDelete(messageId); // Устанавливаем сообщение для удаления
        setIsModalOpen(true); // Открываем модальное окно
    };
    

    const handleEmojiClick = (emojiObject) => {
        setMessage((prev) => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    const handleLogout = () => {
        toast.loading('Выход из системы');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const generateColorFromUsername = (username) => {
        
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash += username.charCodeAt(i);
        }
        const color = `hsl(${hash % 360}, 70%, 50%)`; 
        return color;
    };

    
    const fetchUser = () => {
        return new Promise((resolve, reject) => {
            const token = localStorage.getItem('token');
            if (!token) {
                reject('Токен отсутствует. Пожалуйста, войдите снова.');
                return;
            }

            fetch('http://localhost:3000/api/users', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка при получении данных пользователя');
                    }
                    return response.json();
                })
                .then(data => {
                    if (!data.username) {
                        reject('Имя пользователя не найдено.');
                    } else {
                        resolve(data.username); // Возвращаем имя пользователя
                    }
                })
                .catch(error => reject(error.message));
        });
    };

    useEffect(() => {
        fetchUser()
            .then(username => {
                console.log(`Имя залогиненного пользователя: ${username}`);
                setUsername(username);
            })
            .catch(error => console.error('Ошибка:', error));
    }, []);

    

    


    return (
        <div className='room'>
            <div className="dsaodka">
            <img className='pattern' /></div>
            <div className="room__container">
            <h1 className="text-4xl font-bold text-center mt-4 mb-6">
    Room Chat:
</h1>

            </div>

            <div className="grid space-y-4 max-w-2xl mx-auto">
    {messages.map((msg) => (
        <div
        key={msg.id}
        className="bg-gray shadow-md rounded-lg p-3 flex flex-col sm:flex-row transition-transform transform hover:scale-105"
        style={{ borderLeft: '2px solid rgb(139, 38, 217)' }} 
    >
            <img
                className='avatar__img rounded-full w-10 h-10 mb-2 sm:mb-0 sm:mr-3'
                src={msg.avatar ? `${process.env.REACT_APP_API_URL}/${msg.avatar}` : 'default-avatar.png'}
                alt="Avatar"
            />

            <div className="flex-grow">
                <strong style={{ color: generateColorFromUsername(msg.username) }} className="text-blue-600">{msg.username}</strong>
                {users.map(user => (
    <div key={user.id}>
        <span>{user.username}</span>
        <span className={`status-indicator ${user.online ? 'online' : 'offline'}`}></span>
    </div>
))}

                <p className="text-gray-700">{msg.message}</p>
                <FlagMessage message={msg} />
                <span className="text-gray-500 text-xs">{formatTime(msg.created_at)}</span>
            </div>

            {editingMessageId === msg.id ? (
                <form onSubmit={handleEditSubmit} className="flex flex-col mt-2">
                    <input
                        type="text"
                        value={editingMessageText}
                        onChange={(e) => setEditingMessageText(e.target.value)}
                        required
                        className="border border-gray-300 rounded p-1 focus:outline-none focus:ring focus:ring-blue-500"
                    />
                    <button type="submit" className="bg-blue-500 text-white rounded mt-1 text-sm hover:bg-blue-600 transition">Save</button>
                </form>
            ) : (
                <div className="message__actions flex space-x-1 mt-10">
    <button 
    onClick={() => handleEditClick(msg)} 
    className="flex items-center justify-center bg-gray-200 text-gray-700 rounded-full w-9 h-9 hover:bg-gray-300 transition"
>
    <EditIcon className="m-0" />  
</button>
<button 
    onClick={() => handleDeleteClick(msg.id)} 
    className="flex items-center justify-center bg-red-400 text-white rounded-full w-9 h-9 hover:bg-red-500 transition"
>
    <DeleteIcon className="m-0" />  
</button>

</div>

            )}
        </div>
    ))}
</div>




            <div className='input__container'>
                <div className="input__flex">
                <button className='btn__stikers' onClick={() => setShowEmojiPicker(!showEmojiPicker)}><img className='stik' src={Stikers}></img></button>
                <input
                className='field__msg'
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message..."
            /></div>
                <div className="btn__wrapper">
                <div className="flex__btn__voic">
                <button title='Send message...' className='btn__send' onClick={handleSendMessage}><div className="flex-send-btn"><img className='svg__icon__send' src={SendBtn}/></div></button></div>
                <VoiceMessageInput message={message} setMessage={setMessage} /></div>
            </div>
            

            <div className="username__profile">
            <ProfileIcon username={username} />
            <div className="username">{username}</div>
            <SimpleMenu/>
            </div>
            
            
            {/* <Button
            title='Logout with account...'
            variant="contained"
            style={{
                fontFamily: '"Karantina", serif', 
                backgroundColor: 'rgb(247, 70, 70)', 
                position: 'absolute', 
                top: '20px', 
                right: '20px',
                textTransform: 'capitalize',
                fontSize: '16px', 
                padding: '6px 14px', 
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                transition: 'background-color 0.3s, box-shadow 0.3s', 
            }}
            startIcon={<LogoutIcon style={{ fontSize: '22px' }} />}
            onClick={handleLogout}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(200, 50, 50)'; // Цвет при наведении
                e.currentTarget.style.boxShadow = '0px 6px 12px rgba(0, 0, 0, 0.3)'; // Увеличенная тень
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(247, 70, 70)'; // Возвращаем исходный цвет
                e.currentTarget.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)'; // Возвращаем исходную тень
            }}
            onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0px 6px 12px rgba(0, 0, 0, 0.3)'; // Увеличенная тень при фокусе
            }}
            onBlur={(e) => {
                e.currentTarget.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)'; // Возвращаем исходную тень при потере фокуса
            }}
        >
            Logout
        </Button> */}









            {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
            <ToastContainer />

            <ConfirmModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onConfirm={handleConfirmDelete} 
            />
        </div>
    );
}

export default Room;


