import React, { useState, useEffect } from 'react';
import '../components/styles/ScrollBottomButton.css';
import Arrow from '../assets/arrow.svg';

const ScrollToBottomButton = ({ messages, userId, messagesEndRef, scrollToBottom }) => {
  const [unseenMessagesCount, setUnseenMessagesCount] = useState(0);
  const [isCounting, setIsCounting] = useState(false); // Состояние для анимации

  // Проверяем, находится ли пользователь внизу контейнера
  const isAtBottom = () => {
    const container = messagesEndRef.current;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
  };

  // Обработчик скролла контейнера
  const handleScroll = () => {
    if (isAtBottom()) {
      setUnseenMessagesCount(0);
    }
  };

  // Эффект для отслеживания новых сообщений
  useEffect(() => {
    const container = messagesEndRef.current;
    if (container && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Игнорируем собственные сообщения
      if (lastMessage.user_id !== userId && !isAtBottom()) {
        setUnseenMessagesCount(prev => prev + 1);
        setIsCounting(true); // Запускаем анимацию
      }
    }
  }, [messages]);

  // Сбрасываем анимацию после завершения
  useEffect(() => {
    if (isCounting) {
      const timer = setTimeout(() => setIsCounting(false), 300); // Длительность анимации
      return () => clearTimeout(timer);
    }
  }, [isCounting]);

  return (
    unseenMessagesCount > 0 && (
      <button
        className="scroll-to-bottom-button"
        onClick={() => {
          scrollToBottom();
          setUnseenMessagesCount(0);
        }}
      >
        <div className={`unseen-count-container ${isCounting ? 'counting' : ''}`}>
          <span className="unseen-count">{unseenMessagesCount}</span>
        </div>
        <span className="arrow-down"><img src={Arrow} width={16} height={16} alt="Scroll down" /></span>
      </button>
    )
  );
};

export default ScrollToBottomButton;