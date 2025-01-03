-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Янв 03 2025 г., 21:14
-- Версия сервера: 8.0.30
-- Версия PHP: 8.1.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `messanger`
--

-- --------------------------------------------------------

--
-- Структура таблицы `messages`
--

CREATE TABLE `messages` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `viewed_by` json DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `messages`
--

INSERT INTO `messages` (`id`, `user_id`, `message`, `created_at`, `viewed_by`, `image`) VALUES
(407, 6, 'выфвы', '2024-12-29 17:27:56', '[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 15, 14, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 3, 16, 17]', NULL),
(408, 6, 'ыфв', '2024-12-29 17:32:41', '[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 15, 14, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 3, 16, 17]', NULL),
(443, 14, 'daas', '2024-12-29 19:58:27', '[null, null, null, null, null, null, null, null, null, null, 15, 3, 16, 17]', NULL),
(458, 3, 'So Malekum.', '2025-01-01 20:33:23', '[3, 15, 16, 17]', NULL),
(462, 16, 'sadds', '2025-01-02 12:52:31', '[16, 15, 3, 17]', NULL),
(468, 17, 'fddsfds', '2025-01-03 14:40:22', '[17]', NULL),
(469, 17, 'ffds', '2025-01-03 14:40:25', '[17]', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `username` varchar(50) NOT NULL,
  `bio` text,
  `avatar` varchar(255) DEFAULT NULL,
  `is_online` tinyint(1) DEFAULT '0',
  `last_activity` timestamp NULL DEFAULT NULL,
  `resetPasswordToken` varchar(255) DEFAULT NULL,
  `resetPasswordExpires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `created_at`, `username`, `bio`, `avatar`, `is_online`, `last_activity`, `resetPasswordToken`, `resetPasswordExpires`) VALUES
(1, 'sadsad@gmail.com', '$2b$10$UdG3UwoSU6umLVULsx8KrutsGEoxWUZFiVmfb3ISng6pCvp/wsPxy', '2024-12-18 15:51:47', '', NULL, NULL, 0, NULL, NULL, NULL),
(2, 'sadsa@mail.ru', '$2b$10$7Gv4a/AqRQ..Td1Bncs6R.ZXWaD2bST1IvhwgPHUYTRrKIVw8rVUi', '2024-12-18 16:01:15', 'adsdas', 'sdadsadsa', NULL, 0, NULL, NULL, NULL),
(3, 'kirik@mail.ru', '$2b$10$CM2ywPvjrhvU8o6gxXnQm.h5JyZ8brhC0ff5x1EWAKIXhVGLoAwDO', '2024-12-18 16:09:00', 'kirka', 'daadsdsads', 'uploads\\1734538140292.png', 0, NULL, NULL, NULL),
(4, 'adsdsa@mail.ru', '$2b$10$HSyPN9/KG6Kor3uIFTPdLuvOFhv8V03XWWMpK0Vx65rKUnDmWM.66', '2024-12-18 16:17:26', 'adwdas', 'dsaasdsa', 'uploads\\1734538646039.webp', 0, NULL, NULL, NULL),
(5, 'kkasdsa@mail.ru', '$2b$10$PF.cw5qGT5OD4BVpC15PMe8nxuItb.hTB.6NzIv5dmC9Zb8NVfXmq', '2024-12-18 16:32:52', 'dssdadsa', 'dsadsadsa', NULL, 0, NULL, NULL, NULL),
(6, 'kirik2@mail.ru', '$2b$10$hw93lIpye/BvFUrUvpVld.EFLz6VNOWmQzPz56RHBHG2frY31/YbC', '2024-12-18 16:38:59', 'adssada', 'dawdasdsa', 'uploads\\1734539939469.png', 0, NULL, NULL, NULL),
(7, 'kirlasdlds@mail.ru', '$2b$10$p6dPylCxrmQFeLep.4.X4O7/OwD6kmIEHUdT1I2kYgiX86WJSVPEG', '2024-12-18 17:00:15', 'saddsasa', 'dsadsa', 'uploads\\1734541215892.jpg', 0, NULL, NULL, NULL),
(8, 'ewqewq@mail.ru', '$2b$10$gL8lvt4kEvA..YubKwH92uEhjwPbCEVdB4PhnuuNnPNcktECJDu5y', '2024-12-18 17:05:14', 'ewqewqeqw', 'dsdsa', 'uploads\\1734541514167.png', 0, NULL, NULL, NULL),
(9, 'kfdkds@mail.ru', '$2b$10$n2e01Be8LuIvdnZDblEJS.GBYGafGPa8DMszr6H5bGsmFNNlPJTe2', '2024-12-18 17:08:57', 'sdadsadsa', 'dsaasd', 'uploads\\1734541737606.png', 0, NULL, NULL, NULL),
(10, 'kdkdsak@mail.ru', '$2b$10$ORPrUCsoD1gNQn2or7m3reAgWGo4r7Rg.YxKmeM0jTSto4ejj/Lh.', '2024-12-18 17:19:19', 'dsadsaas', 'dadsasa', 'uploads\\1734542359326.png', 0, NULL, NULL, NULL),
(11, 'sanek@mail.ru', '$2b$10$blecwkO9yLrlzLaRFTVeh.e4xOPzNSgJIu0XkTeO7qSSMYchHWWlm', '2024-12-19 12:22:24', 'sania', 'dssadsa', 'uploads\\1734610944020.jpg', 0, NULL, NULL, NULL),
(12, 'huesis@mail.ru', '$2b$10$IpPuC.aAKCJylj5SQqYe.uynXlvtb4dAYBKoGw0Gs4hKNWpANkU3S', '2024-12-19 12:28:27', 'sdsda', 'dsaasdads', 'uploads\\1734611307230.png', 0, NULL, NULL, NULL),
(13, 'kakamaka@mail.ru', '$2b$10$QRkxVFGPkb/Xj0bTlYVkBOYcbl0qgDy5tvx8.XeIWPXWgFMRhx/zq', '2024-12-19 18:44:54', 'kakamaka', 'я топчу собак', 'uploads/1734633894134.jpg', 0, NULL, NULL, NULL),
(14, 'svinkapeppa@mail.ru', '$2b$10$a4RI4meQzv3lC4x0GcvuGe9ZGmYizGF1amTtl4dVJQbirdJQbwwxi', '2024-12-27 12:34:48', 'peppa', 'dsdsaassda', 'uploads\\1735302888817.png', 0, NULL, NULL, NULL),
(15, 'peppa@mail.ru', '$2b$10$0gB/n8DJNWmr09Hi7V52Su/.f0MCxNmm2MHW1xoFheV9ab9G7nLCC', '2024-12-27 12:38:25', 'peppa22', 'fdafdfd', 'uploads/1735303105872.png', 0, NULL, NULL, NULL),
(16, 'rozetka@mail.ru', '$2b$10$xvALwvi3APLzUikxOuJQA.WPkyERWA4ahOxhm6synWpbq7.3S5Owu', '2025-01-02 12:52:13', 'rozetka', 'I am best rozetka', 'uploads/1735822333727.png', 0, NULL, NULL, NULL),
(17, 'utipov36@gmail.com', '$2b$10$9fntHAiIhY29GN18jvthsefgQx53oMk3GWIC2pRU/8zlofcwMwMYa', '2025-01-03 14:40:06', 'hurma444', 'dasdsasaddsa', 'uploads/1735915206380.png', 0, NULL, NULL, NULL);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=470;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
