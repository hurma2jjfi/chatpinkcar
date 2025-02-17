import React, { useEffect, useState, useRef } from 'react';
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
import UserStatus from './UserStatus';
import SearchBar from './SearchBar';
import ReplyIcon from '@mui/icons-material/Reply';
import './styles/SearchBar.css';
import ParticleAnimation from './hundle/ParticleAnimation';
import ImageModals from './modals/ImageModals';
import ScrollToBottomButton from './ScrollBottom';

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
    const [loadingProgress, setLoadingProgress] = useState(0); 
    const [isLoading, setIsLoading] = useState(false);
    const [filteredMessages, setFilteredMessages] = useState(messages);
    const [replyingToMessage, setReplyingToMessage] = useState(null);
    const [activeMessageId, setActiveMessageId] = useState(null);
    const [showParticleAnimation, setShowParticleAnimation] = useState(false);
    const [particleMessageId, setParticleMessageId] = useState(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');
    const [giftData, setGiftData] = useState(null);
    const messagesEndRef = useRef(null);
    const [typingUsers, setTypingUsers] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeout = useRef(null);
    const [unseenMessagesCount, setUnseenMessagesCount] = useState(0);


    const handleInputChange = (e) => {
        setMessage(e.target.value);
        
        if (!isTyping) {
          socket.emit('typing', userId); // Убедитесь, что userId существует
          setIsTyping(true);
        }
      
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
          socket.emit('stopTyping', userId); // userId должен быть актуальным
          setIsTyping(false);
        }, 1500);
      };

      useEffect(() => {
        socket.on('userTyping', ({ userId, username }) => {
          setTypingUsers(prev => ({ ...prev, [userId]: username }));
        });
      
        socket.on('userStoppedTyping', ({ userId }) => {
          setTypingUsers(prev => {
            const newState = { ...prev };
            delete newState[userId];
            return newState;
          });
        });
      
        return () => {
          socket.off('userTyping');
          socket.off('userStoppedTyping');
        };
      }, []);

      const TypingIndicator = () => {
        const typingList = Object.values(typingUsers);
    
        if (typingList.length === 0) return null;
      
        return (
            <div className="typing-indicator">
            <div className="hacker-text">
              {typingList.map((username, index) => (
                <span key={username} className="typing-username">
                  {username}
                  {index < typingList.length - 1 ? ', ' : ''}
                </span>
              ))}
              <span className="typing-dots">
                {typingList.length === 1 ? ' печатает' : ' печатают'}
                <span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
              </span>
            </div>
          </div>
        );
      };



    const scrollToBottom = () => {
        messagesEndRef.current?.scrollTo({
          top: messagesEndRef.current.scrollHeight,
          behavior: 'smooth'
        });
      };
    
      useEffect(() => {
        scrollToBottom();
      }, [messages]);
    
    // const token = localStorage.getItem('token');
    // console.log(token);

    const handleImageClick = (imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setIsImageModalOpen(true);
    };

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

    
    const handleReplyClick = (messageObject) => {
        setReplyingToMessage(messageObject); // Устанавливаем объект сообщения для ответа
        setActiveMessageId(messageObject.id); // Используем msg.id как идентификатор
    };

    const resetActiveMessage = () => {
        setActiveMessageId(null);
    };
    
    

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
        if (message.trim() && userId && currentUser) {
            const newMessage = {
                userId,
                message,
                username: currentUser.username, // Добавляем имя пользователя
                avatar: currentUser.avatar, // Добавляем аватар пользователя
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
    
                // Запускаем анимацию удаления
                setParticleMessageId(messageToDelete);
                setShowParticleAnimation(true);
    
                // Отправляем событие через сокет
                socket.emit('messageDeleted', messageToDelete);
    
                // Удаляем сообщение из состояния после завершения анимации
                setTimeout(() => {
                    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageToDelete));
                    setShowParticleAnimation(false);
                    toast.success('Сообщение удалено!');
                }, 1000); // Длительность анимации
    
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


    const fetchUserGift = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/user-gift/${userId}`);
            
            if (!response.ok) {
                throw new Error('Ошибка получения данных о подарке');
            }
    
            const data = await response.json();
            setGiftData(data);
        } catch (error) {
            console.error("Ошибка загрузки данных о подарке:", error);
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
    
    // Загружаем данные о подарке, когда userId доступен
    useEffect(() => {
        if (userId) {
            fetchUserGift(userId); // Вызываем функцию для загрузки данных о подарке
        }
    }, [userId]); // Зависимость от userId
    

    const getTimeLabel = (timestamp) => {
        const today = new Date();
        const messageDate = new Date(timestamp);
    
        const isToday = messageDate.toDateString() === today.toDateString();
        const isYesterday = new Date(today.setDate(today.getDate() - 1)).toDateString() === messageDate.toDateString();
    
        if (isToday) {
            return 'Сегодня';
        } else if (isYesterday) {
            return 'Вчера';
        } else {
            return messageDate.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        }
    };

    const groupMessagesByDate = (messages) => {
        const groupedMessages = {};
        messages.forEach((msg) => {
            const date = new Date(msg.created_at).toDateString();
            if (!groupedMessages[date]) {
                groupedMessages[date] = [];
            }
            groupedMessages[date].push(msg);
        });
        return groupedMessages;
    };

    const handleScroll = () => {
        const container = messagesEndRef.current;
        if (container) {
          const isBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
          if (isBottom) {
            setUnseenMessagesCount(0);
          }
        }
      };
    


    return (
        <div className='room'>
            <div className="dsaodka">
            <img className='pattern' /></div>
            <div className="room__container">
            <h1 className="text-4xl font-bold text-center mt-4 mb-6">
    Room Chat:
</h1>

            </div>

            <div className="grid space-y-4 max-w-2xl" ref={messagesEndRef} onScroll={handleScroll}>
            {Object.entries(groupMessagesByDate(messages)).map(([date, messagesForDate]) => (
    <div key={date}>
        {/* Временная метка */}
        <div className="time-label">
            {getTimeLabel(messagesForDate[0].created_at)}
        </div>

        {/* Отображение сообщений */}
        {messagesForDate.map((msg) => {
            const isMyMessage = msg.user_id === userId;
            return (
                <div
                    key={msg.id}
                    className={`message-container ${isMyMessage ? 'my' : 'other'} visible`}
                    style={{
                        backgroundColor: activeMessageId === msg.id ? 'rgba(139, 38, 217, 0.3)' : '',
                    }}
                >
                    {!isMyMessage && (
                        <div className="avatar__back">
                            <img
                                className="avatar__img"
                                src={msg.avatar ? `http://localhost:3000/${msg.avatar}` : 'default-avatar.png'}
                                alt="Аватар"
                            />
                        </div>
                    )}

                    <div className="message-content">
                        {!isMyMessage && (
                            <div className="username-label" style={{ color: generateColorFromUsername(msg.username) }}>
                                {msg.username}
                            </div>
                        )}

                        {/* Форма редактирования */}
                        {editingMessageId === msg.id ? (
                            <form onSubmit={handleEditSubmit} className="edit-form">
                                <input
                                    type="text"
                                    value={editingMessageText}
                                    onChange={(e) => setEditingMessageText(e.target.value)}
                                    required
                                    className="edit-input"
                                    placeholder="Редактировать сообщение..."
                                />
                                <button type="submit" className="save-button">
                                    Сохранить
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingMessageId(null)}
                                    className="cancel-button"
                                >
                                    Отмена
                                </button>
                            </form>
                        ) : (
                            <>
                                {msg.message && <p>{msg.message}</p>}
                                {msg.image && (
                                    <img 
                                        src={msg.image} 
                                        alt="Content" 
                                        onClick={() => handleImageClick(msg.image)}
                                    />
                                )}
                            </>
                        )}

                        <span className="message-time">
  {formatTime(msg.created_at)}
  {isMyMessage && (
    <span className={`message-status ${msg.viewed_by?.length > 0 ? 'read' : 'sent'}`}>
      ✓
    </span>
  )}
</span>
                    </div>

                    <div className="message__actions">
                        {isMyMessage ? (
                            editingMessageId !== msg.id && (
                                <>
                                    <button onClick={() => handleEditClick(msg)}>
                                        <EditIcon fontSize="small" />
                                    </button>
                                    <button onClick={() => handleDeleteClick(msg.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </button>
                                </>
                            )
                        ) : (
                            <button onClick={() => handleReplyClick(msg)}>
                                <ReplyIcon fontSize="small" />
                            </button>
                        )}

                        {isMyMessage && giftData && giftData.svg_data && (
                            <div className="gift-container">
                                <img 
                                    src={`${giftData.svg_data}`} 
                                    alt="Подарок" 
                                    className="gift-image"
                                    width={30}
                                    height={30}
                                />
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
    </div>
))}
</div>




            <div className="input__container">
    
    <div className="input__flex">
        {replyingToMessage && (
        <div className="reply-preview">
            <div className="reply-preview-content">
                <strong>{replyingToMessage.username}</strong>
                {replyingToMessage.image && (
                    <img 
                        src={replyingToMessage.image} 
                        alt={`Изображение ${replyingToMessage.username}`} 
                        width={40} // Установите нужную ширину
                        height={40} // Установите нужную высоту
                    />
                )}
                <p>{replyingToMessage.message}</p>
            </div>
            <button 
                className="cancel-reply-btn" 
                onClick={() => {
                    setReplyingToMessage(null);
                    resetActiveMessage();}} 
            >
                <CloseIcon />
            </button>
        </div>
    )}

<div className="input__wrap" style={{
    display: 'flex',
    alignItems: 'center'
}}>
    <input
        className='field__msg'
        type="text"
        value={message}
        onChange={handleInputChange} // Изменено!
  onBlur={() => { // Добавлено для обработки потери фокуса
    clearTimeout(typingTimeout.current);
    socket.emit('stopTyping', userId);
    setIsTyping(false);
  }}
        placeholder={replyingToMessage ? `Ответить @${replyingToMessage.username}` : 'Сообщение...'}
    />
    <button className='btn__stikers' onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
        <img className='stik' src={Stikers} alt="Stickers" />
    </button>
</div>

        
    </div>
    <div className="btn__wrapper">
        <div className="flex__btn__voic">
            <button title='Send message...' className='btn__send' onClick={handleSendMessage}>
                <div className="flex-send-btn">
                    <img className='svg__icon__send' src={SendBtn} alt="Send" />
                </div>
            </button>
        </div>
        <VoiceMessageInput message={message} setMessage={setMessage} />
        <button title='Upload image...' className='btn__send' onClick={openModalUpload}>
            <div className="flex-send-btn">
                <img className='svg__icon__upload' src={UploadImage} alt="Upload" />
            </div>
        </button>
    </div>
</div>
            

            <div className="username__profile">
            <div className="username">{username}</div>
            <SimpleMenu/>
            </div>
            
            {showParticleAnimation && (
    <ParticleAnimation
        messageId={particleMessageId}
        onAnimationEnd={() => setShowParticleAnimation(false)}
    />
)}


            {isModalOpenUpload && ( 
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModalUpload}><IconButton onClick={closeModalUpload} style={{ float: 'right', color: '#000', opacity: '70%' }}>
                            <CloseIcon /> 
                        </IconButton></span>
                        
                        <form onSubmit={handleSubmit}>
                        <div className="flexColumn">
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
                            </div>
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
        


        {/* <div className="searchbar__wrap">
  <SearchBar messages={messages} setFilteredMessages={setFilteredMessages} />
  {filteredMessages.length > 0 ? (
    <div>
      <span className="found-count">Найдено: {filteredMessages.length} сообщений</span>
      {filteredMessages.map((message) => (
        <div className='msg__contain' key={message.id}>
          <span className='span__msg' style={{ color: 'white', fontWeight: 'bold' }}>
            {message.username}:
          </span>
          {' '}
          {message.message}
        </div>
      ))}
    </div>
  ) : (
    <div className='noMsg'></div>
  )}
</div> */}



{isImageModalOpen && (
    <ImageModals 
        imageUrl={selectedImageUrl} 
        onClose={() => setIsImageModalOpen(false)} 
    />
)}

<TypingIndicator />

<div className="emoji__picker">
            {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}</div>

            <ToastContainer />

            <ConfirmModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onConfirm={handleConfirmDelete} 
            />

            <ScrollToBottomButton 
  messages={messages}
  userId={userId}
  messagesEndRef={messagesEndRef}
  scrollToBottom={scrollToBottom}
/>
        </div>



    );
}

export default Room;


