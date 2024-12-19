import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate
import 'react-toastify/dist/ReactToastify.css';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Используем хук для навигации

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://127.0.0.1:3000/login', {
        email,
        password,
      });
      
      // Сохраняем токен в localStorage
      localStorage.setItem('token', response.data.token);
      
      toast.success('Успешный вход!'); // Уведомление об успешном входе
      
      // Перенаправление в комнату после успешного входа
      navigate('/room'); 
      
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error(error.response);
      toast.error('Ошибка входа: ' + (error.response?.data || error.message)); // Уведомление об ошибке
    }
  };

  return (
    <div>
      <h1>Авторизация</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Войти</button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default Login;
