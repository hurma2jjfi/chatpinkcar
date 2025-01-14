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
const nodemailer = require('nodemailer');
const crypto = require('crypto'); 
let users = [];

const app = express();
app.use(cors()); // Включаем CORS для HTTP-запросов
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('Destination folder:', path.join(__dirname, 'uploads')); // Логируем папку назначения
        cb(null, path.join(__dirname, 'uploads')); // Используем __dirname для абсолютного пути
    },
    filename: (req, file, cb) => {
        console.log('Uploading file:', file.originalname); // Логируем имя загружаемого файла
        cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
    }
});

// Инициализация multer
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
    database: 'messanger',
    charset: 'utf8mb4'
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


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'legashurik2@gmail.com',
        pass: 'rynk nzxu jbcn odxp'
    },
});

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    // Проверка существования пользователя в базе данных
    const userQuery = 'SELECT * FROM users WHERE email = ?';
    connection.query(userQuery, [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const userId = results[0].id;
        const token = crypto.randomBytes(20).toString('hex'); // Генерация токена

        // Сохранение токена и его срока действия в базе данных
        const tokenQuery = 'UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?';
        connection.query(tokenQuery, [token, new Date(Date.now() + 3600000), userId], (err) => { // Токен действителен 1 час
            if (err) {
                console.error("Ошибка при сохранении токена:", err); // Логируем ошибку
                return res.status(500).json({ message: 'Ошибка при сохранении токена' });
            }
        
            const resetUrl = `http://localhost:3001/reset-password/${token}`; // Измените URL

const mailOptions = {
    to: email,
    subject: 'Сброс пароля',
    html: `Вы получили это письмо, потому что вы запросили сброс пароля. Пожалуйста, перейдите по следующей ссылке: <a href="${resetUrl}">Сбросить пароль</a>`,
};

        
            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                    console.error("Ошибка при отправке письма:", error); // Логируем ошибку
                    return res.status(500).json({ message: 'Ошибка при отправке письма' });
                }
                res.status(200).json({ message: 'Письмо с инструкциями по сбросу пароля отправлено' });
            });
        });
    });
});


app.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body; // Получаем новый пароль из тела запроса
    const token = req.params.token; // Получаем токен из параметров запроса

    // Проверка существования токена в базе данных
    const query = 'SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?';
    connection.query(query, [token, new Date()], (err, results) => {
        if (err || results.length === 0) {
            console.error("Недействительный или просроченный токен:", err); // Логируем ошибку
            return res.status(400).json({ message: 'Недействительный или просроченный токен' });
        }

        const userId = results[0].id;

        // Проверяем, что пароль не пустой
        if (!password || password.trim() === '') {
            return res.status(400).json({ message: 'Пароль не может быть пустым' });
        }

        // Хеширование нового пароля и обновление записи в базе данных
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error("Ошибка при хешировании пароля:", err); // Логируем ошибку
                return res.status(500).json({ message: 'Ошибка при хешировании пароля' });
            }

            const updateQuery = 'UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?';
            connection.query(updateQuery, [hashedPassword, userId], (err) => {
                if (err) {
                    console.error("Ошибка при обновлении пароля:", err); // Логируем ошибку
                    return res.status(500).json({ message: 'Ошибка при обновлении пароля' });
                }

                res.status(200).json({ message: 'Пароль успешно изменен' });
            });
        });
    });
});








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
        ORDER BY messages.created_at ASC
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
        SELECT id, username 
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
    
                    // Создаем объект нового сообщения с username
                    const newMessage = { id: Date.now(), user_id: userId, message, username };
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


app.post('/change-password', async (req, res) => {
    console.log(req.body); // Логируем тело запроса
    const { userId, password } = req.body;

    if (!userId || !password) {
        return res.status(400).json({ message: 'Пользователь и пароль не могут быть пустыми' });
    }

    try {
        // Хешируем новый пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Обновляем пароль в базе данных
        connection.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (error, results) => {
            if (error) {
                console.error("Ошибка при изменении пароля:", error);
                return res.status(500).json({ message: 'Произошла ошибка при изменении пароля', error: error.message });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            res.status(200).json({ message: 'Пароль успешно изменен' });
        });
    } catch (error) {
        console.error("Ошибка при изменении пароля:", error);
        res.status(500).json({ message: 'Произошла ошибка при изменении пароля', error: error.message });
    }
});


app.get('/user-id', authenticateToken, (req, res) => {
    const userId = req.userId; 
    res.status(200).json({ userId }); 
});











// Обновление сообщения
app.put('/api/messages/:id', authenticateToken, (req, res) => {
    const messageId = req.params.id;
    const { message } = req.body;

    // Проверка на пустое сообщение
    if (!message || !message.trim()) {
        return res.status(400).send('Сообщение не может быть пустым');
    }

    // Обновление сообщения
    connection.query('UPDATE messages SET message = ? WHERE id = ? AND user_id = ?', [message, messageId, req.userId], (err, results) => {
        if (err) {
            console.error('Ошибка при обновлении сообщения:', err);
            return res.status(500).send('Ошибка при обновлении сообщения');
        }

        // Проверяем, было ли обновлено какое-либо сообщение
        if (results.affectedRows === 0) {
            return res.status(404).send('Сообщение не найдено или у вас нет прав для его редактирования');
        }

        // Уведомляем всех клиентов об обновлении сообщения
        io.emit('messageUpdated', { id: messageId, newMessage: message });

        res.status(200).send('Сообщение обновлено');
    });
});







// Обработка удаления сообщения на сервере
app.delete('/api/messages/:id', authenticateToken, (req, res) => {
    const messageId = req.params.id;

    connection.query('DELETE FROM messages WHERE id = ? AND user_id = ?', [messageId, req.userId], (err, results) => {
        if (err) {
            console.error('Ошибка при удалении сообщения:', err);
            return res.status(500).send('Ошибка при удалении сообщения');
        }

        // Проверяем, было ли удалено какое-либо сообщение
        if (results.affectedRows === 0) {
            return res.status(404).send('Сообщение не найдено или у вас нет прав для его удаления');
        }

        // Уведомляем всех клиентов об удалении сообщения
        io.emit('messageDeleted', messageId);
        
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




app.post('/upload-image', upload.single('image'), async (req, res) => {
    console.log('Request received:', req.body);
    console.log('Uploaded file:', req.file);

    if (!req.file) {
        return res.status(400).json({ error: 'Изображение не загружено' });
    }

    console.log(`File uploaded successfully: ${req.file.filename}`);
    
    const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    const userId = req.body.userId;
    const messageText = req.body.message;

    try {
        const result = await connection.query(
            'INSERT INTO messages (user_id, message, image) VALUES (?, ?, ?)',
            [userId, messageText, imageUrl]
        );

        const newMessage = { id: result.insertId, userId, message: messageText, image: imageUrl };

        // Emit the new message to all connected clients
        io.emit('newMessage', newMessage);

        res.json(newMessage);
    } catch (error) {
        console.error('Error saving message to DB:', error);
        res.status(500).json({ error: 'Ошибка при сохранении сообщения' });
    }
});




app.post('/send-message', async (req, res) => {
    const { userId, message } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    try {
        const result = await connection.query(
            'INSERT INTO messages (user_id, message, image) VALUES (?, ?, ?)',
            [userId, message, imageUrl]
        );

        const newMessage = { id: result.insertId, userId, message, image: imageUrl };

        // Emit the new message to all connected clients
        io.emit('newMessage', newMessage);

        res.json(newMessage);
    } catch (error) {
        console.error('Error saving message to DB:', error);
        res.status(500).json({ error: 'Ошибка при сохранении сообщения' });
    }
});



app.post('/status/online', authenticateToken, (req, res) => {
    const userId = req.userId; 
    const { isOnline } = req.body; 

    if (!userId) {
        console.error("ID пользователя не найден. Запрос не может быть обработан.");
        return res.status(400).send('ID пользователя не предоставлен');
    }

    console.log(`Обновление статуса онлайн для userId: ${userId}, isOnline: ${isOnline}`);

    connection.query('UPDATE users SET is_online = ? WHERE id = ?', [isOnline ? 1 : 0, userId], (err, results) => {
        if (err) {
            console.error("Ошибка при обновлении статуса пользователя:", err);
            return res.status(500).send('Ошибка при обновлении статуса');
        }
    
        console.log("Результаты обновления:", results);
        
        if (results.affectedRows === 0) {
            console.warn("Статус не обновлен. Возможно, пользователь не найден.");
            return res.status(404).send('Пользователь не найден');
        }
    
        res.status(200).send('Статус пользователя обновлен');
    });    
});


app.post('/status/activity', authenticateToken, (req, res) => {
    const userId = req.userId; 
    const { lastActivity } = req.body; 

    if (!userId) {
        console.error("ID пользователя не найден. Запрос не может быть обработан.");
        return res.status(400).send('ID пользователя не предоставлен');
    }

    console.log(`Обновление времени последней активности для userId: ${userId}, lastActivity: ${lastActivity}`);

    connection.query('UPDATE users SET last_activity = ? WHERE id = ?', [lastActivity, userId], (err, results) => {
        if (err) {
            console.error("Ошибка при обновлении времени активности пользователя:", err);
            return res.status(500).send('Ошибка при обновлении времени активности');
        }
    
        console.log("Результаты обновления:", results);
        
        if (results.affectedRows === 0) {
            console.warn("Время активности не обновлено. Возможно, пользователь не найден.");
            return res.status(404).send('Пользователь не найден');
        }
    
        res.status(200).send('Время последней активности обновлено');
    });    
});


app.get('/status/current', authenticateToken, (req, res) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(400).send('ID пользователя не предоставлен');
    }

    connection.query('SELECT is_online FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error("Ошибка при получении статуса пользователя:", err);
            return res.status(500).send('Ошибка при получении статуса');
        }

        if (results.length === 0) {
            return res.status(404).send('Пользователь не найден');
        }

        // Возвращаем статус как true/false
        res.json({ isOnline: results[0].is_online === 1 });
    });
});



app.get('/users', authenticateToken, (req, res) => {
    connection.query('SELECT id, username, is_online FROM users', (err, results) => {
        if (err) {
            console.error("Ошибка при получении списка пользователей:", err);
            return res.status(500).send('Ошибка при получении списка пользователей');
        }

        // Преобразуем результаты в нужный формат
        const users = results.map(user => ({
            id: user.id,
            username: user.name,
            isOnline: user.is_online === 1 // Преобразуем 1 в true и 0 в false
        }));

        res.json(users);
    });
});





// Запуск сервера
server.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});
