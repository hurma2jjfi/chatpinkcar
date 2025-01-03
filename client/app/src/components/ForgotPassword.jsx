import React, { useState } from 'react';
import { TextField, Button, Typography, Paper } from '@mui/material';
import { ClipLoader } from 'react-spinners'; // Импортируем спиннер

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false); // Состояние для определения ошибки
    const [loading, setLoading] = useState(false); // Состояние загрузки

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Начинаем загрузку
        try {
            const response = await fetch('http://localhost:3000/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при отправке запроса на восстановление пароля');
            }

            const data = await response.json();
            setMessage(data.message); // Сообщение об успешной отправке
            setIsError(false); // Успех
        } catch (error) {
            setMessage(error.message);
            setIsError(true); // Ошибка
        } finally {
            setLoading(false); // Завершаем загрузку
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Paper elevation={3} className="p-6 w-full max-w-xs">
                <Typography variant="h5" align="center">
                    Забыли пароль?
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        label="Введите ваш email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        className={`mt-4 ${loading ? 'bg-black' : 'bg-blue-500'}`} // Условное изменение цвета кнопки
                        disabled={loading} // Блокируем кнопку во время загрузки
                    >
                        {loading ? <ClipLoader size={24} color="#ffffff" /> : 'Отправить'}
                    </Button>
                </form>
                {message && (
                    <Typography 
                        align="center" 
                        className={`${isError ? 'text-red-500' : 'text-green-500'} mt-3`} 
                    >
                        {message}
                    </Typography>
                )}
            </Paper>
        </div>
    );
};

export default ForgotPassword;
