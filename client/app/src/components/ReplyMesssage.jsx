const ReplyComponent = () => {
    if (!replyingTo) return null;
  
    const messageToReply = messages.find((msg) => msg.id === replyingTo);
  
    return (
      <div className="bg-gray-100 p-2 mb-2 rounded">
        <p>Отвечаю на сообщение:</p>
        <p className="text-gray-600">{messageToReply.message}</p>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Введите ответ..."
          className="block w-full p-2 pl-10 text-sm text-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onClick={handleSendMessage}
        >
          Отправить
        </button>
      </div>
    );
  };

export default ReplyComponent;