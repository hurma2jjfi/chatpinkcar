import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Новое состояние для повторного ввода пароля

  const handleRegister = async (e) => {
    e.preventDefault();

    // Проверка длины пароля на клиенте
    if (password.length < 8) {
      toast.error('Пароль должен содержать минимум 8 символов');
      return;
    }

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    
    try {
      await registerUser(email, password);
      toast.success('Регистрация успешна!');
      setEmail('');
      setPassword('');
      setConfirmPassword(''); // Сбрасываем поле повторного ввода пароля
    } catch (error) {
      console.error(error.response);
      toast.error('' + (error.response?.data || error.message));
    }
  };

  const registerUser = async (email, password) => {
    return axios.post('http://127.0.0.1:3000/register', { email, password });
  };

  return (
    <div>
      <h1>Регистрация</h1>
      <form onSubmit={handleRegister}>
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
        <div>
          <label>Повторите пароль:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Зарегистрироваться</button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default Register;
