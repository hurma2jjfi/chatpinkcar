import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import MaskGroup from '../assets/MaskGroup.svg';
import backSvg from '../assets/back.svg';
import LayerMask from '../assets/LayerMask.png';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailValid, setEmailValid] = useState(true);
    const [passwordValid, setPasswordValid] = useState(true);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        setEmailValid(true);
        setPasswordValid(true);

        if (!email) setEmailValid(false);
        if (!password) setPasswordValid(false);

        if (!email || !password) return;

        try {
            const response = await axios.post('http://127.0.0.1:3000/login', {
                email,
                password,
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.userId);

            toast.success('Успешный вход!');
            navigate('/room');

            setEmail('');
            setPassword('');
        } catch (error) {
            console.error(error.response);
            toast.error('Ошибка входа: ' + (error.response?.data || error.message));
        }
    };

    return (
        <div className="wrapper">
            <div className="center__wrapo">
                <div className="center">
                    <div className="logo__flex">
                        <img src={MaskGroup} alt="Logo" />
                    </div>
                    <div className="back" title="Назад">
                        <Link to="/">
                            <img src={backSvg} alt="Back" />
                        </Link>
                    </div>
                    <div className="title__flex">
                        <h1 className="sayHello">
                            Sign in to chat <span>Pinkcar</span>
                        </h1>
                    </div>
                </div>
            </div>
            <div className="flex__form">
                <form onSubmit={handleLogin}>
                    <div className="flex__fields">
                        <div className="input-wrapper">
                            <input
                                className="field__one"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ borderColor: emailValid ? '' : 'red' }}
                                placeholder=" "
                            />
                            <label>Email*</label>
                        </div>
                        <div className="input-wrapper">
                            <input
                                className="field__two"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ borderColor: passwordValid ? '' : 'red' }}
                                placeholder=" "
                            />
                            <label>Password*</label>
                        </div>
                        <button className="submit__btn" type="submit">
                            Log in
                        </button>
                    </div>
                </form>
            </div>
            <div className="forgotPass__wrap">
                <div className="wrap">
                    <Link to="/forgot-password" className="link">
                        <h1>Forgot password?</h1>
                    </Link>
                    <span>|</span>
                    <Link to="/register" className="link">
                        <h1>Don't have an account?</h1>
                    </Link>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Login;