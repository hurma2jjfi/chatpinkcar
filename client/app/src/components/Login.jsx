import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom'; // Импортируем useNavigate
import 'react-toastify/dist/ReactToastify.css';
import MaskGroup from '../assets/MaskGroup.svg';
import backSvg from '../assets/back.svg';
import LayerMask from '../assets/LayerMask.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailValid, setEmailValid] = useState(true); // Validation state for email
  const [passwordValid, setPasswordValid] = useState(true); // Validation state for password
  const navigate = useNavigate(); // Используем хук для навигации

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Reset validation states
    setEmailValid(true);
    setPasswordValid(true);

    // Validate fields
    if (!email) {
        setEmailValid(false);
    }
    if (!password) {
        setPasswordValid(false);
    }

    // If either field is invalid, stop execution
    if (!email || !password) {
        return;
    }

    try {
        const response = await axios.post('http://127.0.0.1:3000/login', {
            email,
            password,
        });
        
        // Сохраняем токен и id пользователя в localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId); // Сохраняем userId
        
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
    <div className='wrapper'>
      <div className="center__wrapo">
        <div className="center">
          <div className="logo__flex">
            <img src={MaskGroup} alt="" />
          </div>
          <div className="back" title='Назад'>
            <Link to="/"> 
              <img src={backSvg}/>
            </Link>
          </div>
          <div className="layerMask"><img src={LayerMask} /></div>
          <div className="title__flex">
            <h1 className='sayHello'>Sign in to chat <span>Pinkcar</span></h1>
          </div>
        </div>
      </div>
      <div className="flex__form">
        <form onSubmit={handleLogin}>
          <div className="flex__fields">
            <div>
              <input
                className='field__one'
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ borderColor: emailValid ? '' : 'red' }} // Conditional styling
                placeholder='Email*'
              />
            </div>
            <div>
              <input
                className='field__two'
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ borderColor: passwordValid ? '' : 'red' }} // Conditional styling
                placeholder='Password*'
              />
            </div>
            <button className='submit__btn' type="submit">Log in</button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Login;
