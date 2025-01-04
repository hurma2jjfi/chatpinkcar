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
import UploadImage from '../assets/UploadImage.svg';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import IconButton from '@mui/material/IconButton'; // Import IconButton
import CloseIcon from '@mui/icons-material/Close'; // Import Close icon

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
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isModalOpenUpload, setIsModalOpenUpload] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0); // New state for loading progress
    const [isLoading, setIsLoading] = useState(false);


    const openPreviewModal = () => {
        setIsPreviewModalOpen(true);
    };

    const closePreviewModal = () => {
        setIsPreviewModalOpen(false);
    };

    const openModalUpload = () => {
        setIsModalOpenUpload(true);
    };
    
    const closeModalUpload = () => {
        setIsModalOpenUpload(false);
        setImagePreviewUrl('');
        setUserId('');
        setLoadingProgress(0); // Reset progress on close
        setIsLoading(false); // Reset loading state on close
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);

        // Создаем URL для предварительного просмотра изображения
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreviewUrl(previewUrl);

            // Start loading simulation
            setIsLoading(true); // Start loading
            setLoadingProgress(0); // Reset progress

            // Simulate loading progress
            const interval = setInterval(() => {
                setLoadingProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 10; // Increment progress
                });
            }, 100); // Adjust timing as needed

            // Simulate the end of loading after a short delay
            setTimeout(() => {
                clearInterval(interval);
                setIsLoading(false); // Stop loading when done
            }, 1000); // Total time for loading simulation
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedFile) {
            toast.error('Пожалуйста, выберите файл для загрузки.');
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('userId', userId);
        
        try {
            const response = await axios.post('http://localhost:3000/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setUploadedImage(response.data.image);
            setSelectedFile(null);
            setUserId('');
            setImagePreviewUrl(null); // Сбрасываем предварительный просмотр
            toast.success('Изображение успешно загружено!');

            // Запускаем анимацию закрытия модального окна
            setIsClosing(true);
            setTimeout(closeModalUpload, 500); // Закрываем модал через 500 мс (время анимации)
        } catch (error) {
            console.error('Ошибка при загрузке изображения:', error);
            toast.error('Ошибка при загрузке изображения.');
        }
    };

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await fetch('http://localhost:3000/user-id', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`, 
                    },
                });

                if (!response.ok) {
                    throw new Error('Ошибка при получении user ID');
                }

                const data = await response.json();
                setUserId(data.userId); // Сохраняем userId в состоянии
                console.log('User ID:', data.userId); // Выводим userId в консоль
            } catch (error) {
                console.error('Ошибка:', error);
            }
        };

        fetchUserId();
    }, []);





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

            // Проверяем, является ли отправитель текущим пользователем
            if (newMessage.user_id !== userId) {
                toast.info(`Новое сообщение от ${newMessage.username}: ${newMessage.message}`);
            } else {
                toast.info(`Вы: ${newMessage.message}`); // Отображаем сообщение без имени
            }

            setMessages((prevMessages) => [...prevMessages, formattedMessage]);
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
        
        console.log('Обновляем сообщение с ID:', editingMessageId); // Логируем ID сообщения
    
        // Проверка на пустое сообщение
        if (!editingMessageText.trim()) {
            toast.error('Сообщение не может быть пустым');
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
    
            // Отправка PUT-запроса на сервер
            const response = await axios.put(
                `http://localhost:3000/api/messages/${editingMessageId}`,
                { message: editingMessageText },
                { headers: { Authorization: `Bearer ${token}` } },
            );
    
            // Проверка успешного ответа от сервера
            if (response.status === 200) {
                // Обновляем состояние локально
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg.id === editingMessageId ? { ...msg, message: editingMessageText } : msg,
                    ),
                );
                setEditingMessageId(null);
                setEditingMessageText('');
                toast.success('Сообщение обновлено!');
            }
        } catch (error) {
            console.error(error);
            toast.error('Ошибка при обновлении сообщения: ' + (error.response?.data || error.message));
        }
    };
    
    
    
    
    
    
    const handleConfirmDelete = async () => {
        console.log('Удаляем сообщение с ID:', messageToDelete); // Логируем ID сообщения
        if (messageToDelete) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:3000/api/messages/${messageToDelete}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
    
                // Отправляем событие через сокет
                socket.emit('messageDeleted', messageToDelete);
    
                // Удаляем сообщение из состояния
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

                        {msg.image && (
        <img 
            src={msg.image} 
            alt="Uploaded" 
            className="max-w-2/3 h-2/3 mt-2 rounded"
            onClick={openPreviewModal}
        />
    )} 
                        <FlagMessage message={msg} />
                        <span className="text-gray-500 text-xs">{formatTime(msg.created_at)}</span>
                    </div>

                    {msg.user_id === userId && ( // Проверяем, является ли текущий пользователь владельцем сообщения
                        editingMessageId === msg.id ? (
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
                        )
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
                <button title='Send message...' className='btn__send' onClick={handleSendMessage}><div className="flex-send-btn"><img className='svg__icon__send' src={SendBtn}/></div></button>
                </div>
                <VoiceMessageInput message={message} setMessage={setMessage} />
                <button title='Upload image...' className='btn__send' onClick={openModalUpload}><div className="flex-send-btn"><img className='svg__icon__upload' src={UploadImage}/></div></button>
                </div>
            </div>
            

            <div className="username__profile">
            <ProfileIcon username={username} />
            <div className="username">{username}</div>
            <SimpleMenu/>
            </div>
            





            {isModalOpenUpload && ( 
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModalUpload}><IconButton onClick={closeModalUpload} style={{ float: 'right', color: '#000', opacity: '70%' }}>
                            <CloseIcon /> 
                        </IconButton></span>
                        <form onSubmit={handleSubmit}>
                            <label className="custom-file-upload">
                                <UploadFileIcon /> 
                                <input
                                    className="file"
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    required 
                                />
                                Выберите файл
                            </label>
                            
                            <input
                                className='display-none'
                                type="text" 
                                placeholder="Введите ваш ID" 
                                value={userId} 
                                onChange={(e) => setUserId(e.target.value)} 
                                required 
                            />
                            
                            {isLoading ? ( // Show loading indicator while loading
                                <div className="loading-indicator" style={{ marginTop: '10px' }}>
                                    <div className="progress-bar" style={{ width: `${loadingProgress}%` }} />
                                </div>
                            ) : (
                                imagePreviewUrl && ( // Show image if available
                                    <img 
                                        src={imagePreviewUrl} 
                                        alt="Preview" 
                                        className="image-preview" 
                                        style={{ maxWidth: '100%', marginTop: '10px', transition: 'opacity 0.5s ease-in-out' }} 
                                        onLoad={(e) => e.currentTarget.style.opacity = 1} // Fade in effect
                                        onError={(e) => e.currentTarget.style.display = 'none'} // Hide on error
                                    />
                                )
                            )}
                            
                            <button className='upload' type="submit">
                                {<CloudUploadIcon className='up__ui' />}Загрузить
                            </button>
                        </form>
                    </div>
                </div>
            )}
        








<div className="emoji__picker">
            {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}</div>

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


