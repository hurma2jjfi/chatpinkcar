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
let users = [];

const app = express();
app.use(cors()); // Включаем CORS для HTTP-запросов
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    const token = req.headers['authorization']?.split(' ')[1]; // Извлекаем токен из заголовка

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


app.get('/api/users', authenticateToken, (req, res) => {
    const userId = req.userId; // Получаем ID пользователя из запроса

    const query = `
        SELECT username 
        FROM users 
        WHERE id = ? 
        LIMIT 1
    `;

    connection.query(query, [userId], (err, results) => {
        if (err || results.length === 0) { // Проверка на наличие результатов
            console.error(err);
            return res.status(404).send('Пользователь не найден'); // Возвращаем статус 404 если пользователь не найден
        }
        res.status(200).json(results[0]); // Возвращаем данные текущего пользователя
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

    // Когда пользователь подключается
    socket.on('userConnected', (userId) => {
        // Найдите пользователя в массиве и обновите его статус
        const user = users.find(u => u.id === userId);
        if (user) {
            user.is_online = true; // Установите статус онлайн
            // Также обновите статус в БД
            updateUserStatusInDB(userId, true);
            io.emit('userStatusUpdate', users); // Отправьте обновленный список пользователей
        } else {
            // Если пользователь не найден в массиве, добавьте его
            users.push({ id: userId, is_online: true });
            updateUserStatusInDB(userId, true);
            io.emit('userStatusUpdate', users); // Обновите всех клиентов о новом пользователе
        }
    });

    // Обработка отправки сообщения
    socket.on('sendMessage', ({ userId, message }) => {
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

    // Когда пользователь отключается
    socket.on('disconnect', () => {
        const userId = socket.id; // Или используйте другой способ идентификации пользователя
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].is_online = false; // Установите статус оффлайн
            updateUserStatusInDB(userId, false); // Также обновите статус в БД
            io.emit('userStatusUpdate', users); // Отправьте обновленный список пользователей
            users.splice(userIndex, 1); // Удалите пользователя из массива при отключении
        }
    });
});

// Функция для обновления статуса пользователя в БД
const updateUserStatusInDB = (userId, status) => {
    connection.query(
        'UPDATE users SET is_online = ? WHERE id = ?',
        [status, userId],
        (err) => {
            if (err) {
                console.error("Ошибка при обновлении статуса пользователя в БД:", err);
            }
        }
    );
};


// Регистрация пользователя с загрузкой аватарки
app.post('/register', upload.single('avatar'), async (req, res) => {
    const { email, password, username, bio } = req.body;
    const avatarPath = req.file ? `uploads/${req.file.filename}` : null; // Сохраняем только относительный путь

    if (!email || !email.includes('@')) {
        return res.status(400).send('Некорректный email');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    connection.query('INSERT INTO users (email, password, username, bio, avatar) VALUES (?, ?, ?, ?, ?)', 
        [email, hashedPassword, username, bio, avatarPath], 
        (err) => {
            if (err) {
                console.error("Ошибка при сохранении пользователя:", err);
                return res.status(500).send('Ошибка при сохранении пользователя');
            }
            res.status(201).send('Пользователь зарегистрирован успешно');
        }
    );
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
    const userId = req.userId; // Теперь берем ID пользователя из req.userId

    connection.query('SELECT viewed_by FROM messages WHERE id = ?', [messageId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при получении сообщения');
        }

        if (results.length === 0) {
            return res.status(404).send('Сообщение не найдено');
        }

        // Десериализация массива viewed_by
        let viewedBy = results[0].viewed_by ? JSON.parse(results[0].viewed_by) : [];

        // Проверка, если ID пользователя уже находится в массиве
        if (!viewedBy.includes(userId)) {
            viewedBy.push(userId); // Добавляем ID пользователя
        } else {
            // Если пользователь уже добавлен, просто возвращаем успешный ответ
            return res.status(200).send('Статус сообщения уже обновлен');
        }

        // Сериализация массива для сохранения в базу данных
        connection.query('UPDATE messages SET viewed_by = ? WHERE id = ?', [JSON.stringify(viewedBy), messageId], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Ошибка при обновлении статуса сообщения');
            }
            res.status(200).send('Статус сообщения обновлен');
        });
    });
});



// Запуск сервера
server.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});
