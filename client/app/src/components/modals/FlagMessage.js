import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { io } from 'socket.io-client';
const socket = io('http://127.0.0.1:3000');


const FlagMessage = ({ message, messages, userId }) => {
  const [isRead, setIsRead] = useState(false);

  useEffect(() => {
    const checkMessageStatus = async () => {
      setIsRead(message.viewed_by && message.viewed_by.includes(userId));
    };

    checkMessageStatus();
  }, [message, userId]);

  const handleClick = async () => {
    if (!isRead) {
      try {
        const response = await fetch(`/api/messages/${message.id}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          setIsRead(true);
          socket.emit('messageViewed', message.id);
        } else {
          console.error('Ошибка при обновлении статуса сообщения:', response.statusText);
        }
      } catch (error) {
        console.error('Ошибка при обновлении статуса сообщения:', error.message);
      }
    }
  };

  return (
    <div onClick={handleClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
      <FontAwesomeIcon icon={faCheck} style={{ color: isRead ? 'green' : 'gray', margin: '10px 0px 0px 0px' }} />
    </div>
  );
};

export default FlagMessage;
