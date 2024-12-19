const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken'); // Для работы с токенами

const app = express();
app.use(cors()); // Включаем CORS для HTTP-запросов
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Статическая папка для загруженных файлов

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Папка для сохранения загруженных файлов
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
    }
});

const upload = multer({ storage });

// Создание HTTP сервера и настройка Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3001", // Укажите адрес вашего клиента
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

// Подключение к базе данных
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

// Middleware для проверки токена
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401); // Если нет токена, возвращаем статус 401

    jwt.verify(token, 'your_jwt_secret', (err, user) => { // Замените 'your_jwt_secret' на ваш секретный ключ
        if (err) return res.sendStatus(403); // Если токен недействителен, возвращаем статус 403
        req.userId = user.id; // Сохраняем идентификатор пользователя в запросе
        next(); // Переходим к следующему middleware или маршруту
    });
}

// Получение текущего пользователя
app.get('/api/current-user', authenticateToken, (req, res) => {
    res.status(200).json({ userId: req.userId });
});

// Получение всех сообщений
// Получение всех сообщений с именами пользователей
app.get('/api/messages', (req, res) => {
    const query = `
        SELECT messages.*, users.username 
        FROM messages 
        JOIN users ON messages.user_id = users.id 
        ORDER BY messages.created_at DESC
    `;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при получении сообщений');
        }
        res.status(200).json(results); // Возвращаем список сообщений с именами пользователей
    });
});



// Обработка подключения веб-сокетов
io.on('connection', (socket) => {
    console.log('Новое соединение:', socket.id);

    // Получение ранее сохраненных сообщений при подключении
    connection.query('SELECT * FROM messages ORDER BY created_at DESC', (err, results) => {
        if (err) {
            console.error(err);
            return;
        }
        socket.emit('loadMessages', results); // Отправляем все сообщения новому клиенту
    });

    socket.on('sendMessage', async ({ userId, message }) => {
        // Получаем username из базы данных
        connection.query('SELECT username FROM users WHERE id = ?', [userId], (err, results) => {
            if (err || results.length === 0) {
                console.error("Ошибка при получении имени пользователя:", err);
                return;
            }
    
            const username = results[0].username;
    
            connection.query(
                'INSERT INTO messages (user_id, message) VALUES (?, ?)',
                [userId, message],
                (err) => {
                    if (err) {
                        console.error("Ошибка при сохранении сообщения в БД:", err);
                        return;
                    }
                    
                    const newMessage = { id: Date.now(), user_id: userId, message, username }; // Добавляем username
                    io.emit('receiveMessage', newMessage); // Отправляем новое сообщение всем клиентам
                    console.log(`Saved message to DB and emitted to clients: ${newMessage}`);
                }
            );
        });
    });
    

    socket.on('disconnect', () => {
        console.log('Пользователь отключился:', socket.id);
    });
});


// Регистрация пользователя с загрузкой аватарки
app.post('/register', upload.single('avatar'), async (req, res) => {
    const { email, password, username, bio } = req.body;
    const avatarPath = req.file ? req.file.path : null; 

    if (!email || !email.includes('@')) {
        return res.status(400).send('Некорректный email. Убедитесь, что он содержит "@"');
    }

    if (!password || password.length < 8) {
        return res.status(400).send('Пароль не может быть пустым и должен содержать минимум 8 символов');
    }

    // Check if user already exists
    connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error("Ошибка при проверке пользователя:", err);
            return res.status(500).send('Ошибка при проверке пользователя');
        }

        if (results.length > 0) {
            return res.status(400).send('Пользователь с таким email уже существует');
        }
        
        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user into database
            connection.query(
                'INSERT INTO users (email, password, username, bio, avatar) VALUES (?, ?, ?, ?, ?)',
                [email, hashedPassword, username, bio, avatarPath],
                (err) => {
                    if (err) {
                        console.error("Ошибка при регистрации пользователя:", err);
                        return res.status(500).send('Ошибка при регистрации пользователя');
                    }

                    res.status(201).send('Пользователь зарегистрирован');
                }
            );
        } catch (hashError) {
            console.error("Ошибка при хешировании пароля:", hashError);
            return res.status(500).send('Ошибка при хешировании пароля');
        }
    });
});


// Авторизация пользователя и создание токена
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).send('Некорректный email. Убедитесь, что он содержит "@"');
    }

    if (!password) {
        return res.status(400).send('Пароль не может быть пустым');
    }

    connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при проверке пользователя');
        }

        if (results.length === 0) {
            return res.status(400).send('Неверный email или пароль');
        }

        const user = results[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).send('Неверный email или пароль');
        }

        // Создание токена после успешного входа
        const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' }); 

        res.status(200).json({ message: 'Успешный вход', token }); 
    });
});


// Обновление сообщения
app.put('/api/messages/:id', authenticateToken, (req, res) => {
    const messageId = req.params.id;
    const { message } = req.body;

    // Проверка на наличие текста сообщения
    if (!message) {
        return res.status(400).send('Сообщение не может быть пустым');
    }

    // Обновление сообщения в базе данных
    connection.query('UPDATE messages SET message = ? WHERE id = ? AND user_id = ?', [message, messageId, req.userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при обновлении сообщения');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Сообщение не найдено или у вас нет прав для его редактирования');
        }
        res.status(200).send('Сообщение обновлено');
    });
});


// Удаление сообщения
app.delete('/api/messages/:id', authenticateToken, (req, res) => {
    const messageId = req.params.id;

    // Удаление сообщения из базы данных
    connection.query('DELETE FROM messages WHERE id = ? AND user_id = ?', [messageId, req.userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при удалении сообщения');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('Сообщение не найдено или у вас нет прав для его удаления');
        }
        res.status(200).send('Сообщение удалено');
    });
});


app.post('/api/messages/:id/view', authenticateToken, (req, res) => {
    const messageId = req.params.id;
    const userId = req.userId;

    // Проверяем, есть ли уже userId в viewed_by
    connection.query(
        'SELECT viewed_by FROM messages WHERE id = ?',
        [messageId],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Ошибка при получении статуса просмотра сообщения');
            }

            const viewedByArray = results[0]?.viewed_by || '[]';
            const viewedByList = JSON.parse(viewedByArray);

            // Проверяем, был ли пользователь уже добавлен
            if (!viewedByList.includes(userId)) {
                // Если нет, добавляем его
                connection.query(
                    'UPDATE messages SET viewed_by = JSON_ARRAY_APPEND(viewed_by, "$", ?) WHERE id = ?',
                    [userId, messageId],
                    (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send('Ошибка при обновлении статуса просмотра сообщения');
                        }
                        // Эмитим событие на клиентскую сторону
                        io.emit('messageViewed', messageId); // Уведомляем всех о просмотре сообщения
                        return res.status(200).send('Статус просмотра обновлен');
                    }
                );
            } else {
                // Если пользователь уже был добавлен
                return res.status(200).send('Пользователь уже просмотрел сообщение');
            }
        }
    );
});






// Запуск сервера
server.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});
