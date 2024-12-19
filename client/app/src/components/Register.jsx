import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null); // Новое состояние для аватарки

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Пароль должен содержать минимум 8 символов');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('username', username);
      formData.append('bio', bio);
      if (avatar) formData.append('avatar', avatar); // Добавляем аватарку в форму

      await registerUser(formData);
      toast.success('Регистрация успешна!');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setUsername('');
      setBio('');
      setAvatar(null); // Сбрасываем поле аватарки
    } catch (error) {
      console.error(error.response);
      toast.error(error.response?.data || error.message);
    }
  };

  const registerUser = async (formData) => {
    return axios.post('http://127.0.0.1:3000/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  };

  return (
    <div>
      <h1>Регистрация</h1>
      <form onSubmit={handleRegister}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Имя пользователя:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Пароль:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>Повторите пароль:</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        <div>
          <label>Биография:</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div>
          <label>Аватарка:</label>
          <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} />
        </div>
        <button type="submit">Зарегистрироваться</button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default Register;
