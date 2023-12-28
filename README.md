# HTTPserverTraining
Этот код представляет собой простой сервер телефонной книги, который позволяет получать список пользователей, искать по имени, просматривать конкретных пользователей и добавлять новых. Необходимые модули можно установить с помощью npm, файлы package и package-lock присутствуют в репозитории.

Краткий разбор работы кода:
Импорты и начальная настройка:
http, fs/promises, lodash: Импортируются необходимые модули. http для создания сервера, fs/promises для асинхронной работы с файловой системой, и lodash для удобной работы с данными.

Переменная id и функция nextId: Используются для создания уникального идентификатора для каждого нового пользователя. id начинается с 1000 (так как в изначальной книге уже 1000 записей) и увеличивается на 1 при каждом добавлении нового пользователя.

Валидация данных:
Функция validate: Принимает объект с именем и телефоном пользователя и возвращает массив ошибок. Если имя или телефон пустые, или имя не соответствует заданному формату, функция добавляет в массив сообщение об ошибке. В случае пустого массива ошибок данные принимаются и 

Парсинг и маршрутизация:
Функция getParams: Извлекает параметры из URL запроса и преобразует их в объект для удобной работы.
Объект router: Содержит маршруты для обработки запросов. Он разделен на две части: GET и POST, каждая из которых содержит функции для обработки определённых путей.

Обработка GET-запросов:
Корневой путь ("/"): Возвращает простое приветственное сообщение и общее количество записей в телефонной книге.
Поиск ("/search.json"): Использует параметр запроса q для поиска пользователей по имени и возвращает соответствующий список.
Список пользователей ("/users.json"): Возвращает список пользователей с поддержкой пагинации через параметры page и perPage.
Конкретный пользователь ("/users/(\\w+).json"): Возвращает данные пользователя по указанному ID.

Обработка POST-запросов:
Создание пользователя ("/users.json"): Принимает данные пользователя, проводит их валидацию и, если данные корректны, добавляет нового пользователя в список. В случае ошибок валидации возвращает соответствующие сообщения.

Создание сервера:
Функция makeServer: Создаёт HTTP-сервер. При получении запроса сервер собирает данные тела запроса, анализирует URL и метод запроса, и использует соответствующую функцию из объекта router для обработки запроса.
Если маршрут не найден, сервер возвращает ответ с кодом 404 (Not Found).

Запуск сервера:
Функция startServer: Асинхронно читает файл phonebook.txt, преобразует строки в объекты пользователей и сохраняет их в usersById. Затем запускает сервер, который начинает слушать запросы на заданном порту.
При успешном запуске в консоль выводится сообщение "started server".

