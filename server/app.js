const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'messanger'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Подключение к MySQL успешно установлено');
});

// Регистрация пользователя
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Валидация email
    if (!email || !email.includes('@')) {
        return res.status(400).send('Некорректный email. Убедитесь, что он содержит "@"');
    }

    // Валидация пароля
    if (!password) {
        return res.status(400).send('Пароль не может быть пустым');
    }
    
    if (password.length < 8) {
        return res.status(400).send('Пароль должен содержать минимум 8 символов');
    }

    // Проверка наличия пользователя
    connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при проверке пользователя');
        }

        if (results.length > 0) {
            return res.status(400).send('Пользователь с таким email уже существует');
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        connection.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Ошибка при регистрации пользователя');
            }

            res.status(201).send('Пользователь зарегистрирован');
        });
    });
});

// Авторизация пользователя
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Валидация email
    if (!email || !email.includes('@')) {
        return res.status(400).send('Некорректный email. Убедитесь, что он содержит "@"');
    }

    // Валидация пароля
    if (!password) {
        return res.status(400).send('Пароль не может быть пустым');
    }

    // Проверка наличия пользователя
    connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при проверке пользователя');
        }

        if (results.length === 0) {
            return res.status(400).send('Неверный email или пароль');
        }

        const user = results[0];

        // Сравнение паролей
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).send('Неверный email или пароль');
        }

        // Успешный вход
        res.status(200).send('Успешный вход');
    });
});

app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});
