import React, { useState } from 'react';
import { useParams } from 'react-router-dom'; // Импортируем useParams
import { TextField, Button, Typography, Paper, Container } from '@mui/material';
import { ClipLoader } from 'react-spinners'; // Импортируем спиннер

const ResetPassword = () => {
    const { token } = useParams(); // Получаем токен из параметров маршрута
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false); // Состояние для определения ошибки
    const [loading, setLoading] = useState(false); // Состояние загрузки

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true); // Начинаем загрузку
        
        // Проверка на совпадение паролей
        if (newPassword !== confirmPassword) {
            setMessage("Пароли не совпадают");
            setIsError(true); // Устанавливаем состояние ошибки
            setLoading(false); // Завершаем загрузку
            return;
        }

        try {
            // Отправка запроса на сброс пароля
            const response = await fetch(`http://localhost:3000/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: newPassword }),
            });

            if (!response.ok) throw new Error('Ошибка при сбросе пароля');

            const data = await response.json();
            setMessage(data.message); // Успешное сообщение
            setIsError(false); // Успех
        } catch (error) {
            setMessage(error.message); // Сообщение об ошибке
            setIsError(true); // Устанавливаем состояние ошибки
        } finally {
            setLoading(false); // Завершаем загрузку
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Container component="main" maxWidth="xs">
                <Paper elevation={3} className="p-6">
                    <Typography variant="h5" align="center">
                        Сбросить пароль
                    </Typography>
                    <form onSubmit={handleResetPassword}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            label="Новый пароль"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            label="Подтвердите новый пароль"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            className={`mt-4 ${loading ? 'bg-black' : 'bg-blue-500'}`} // Условное изменение цвета кнопки
                            disabled={loading} // Блокируем кнопку во время загрузки
                        >
                            {loading ? <ClipLoader size={24} color="#ffffff" /> : 'Сбросить пароль'}
                        </Button>
                    </form>
                    {message && (
                        <Typography 
                            align="center" 
                            color={isError ? "error" : "success"} 
                            className="mt-2"
                        >
                            {message}
                        </Typography>
                    )}
                </Paper>
            </Container>
        </div>
    );
};

export default ResetPassword;
