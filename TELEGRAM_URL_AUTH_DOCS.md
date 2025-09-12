# 🔗 Telegram URL Authorization Implementation

## Описание

Реализована система автоматической авторизации через URL с `autologin_token` согласно документации Telegram API для URL Authorization.

## Архитектура

### Frontend компоненты

1. **`telegram-url-auth.js`** - Основной модуль обработки URL авторизации
   - Класс `TelegramURLAuth` для управления токенами
   - Добавление `autologin_token` к URL
   - Обработка входящих URL с токенами
   - События автоавторизации

2. **`TelegramURLAuthDemo.vue`** - Демо-страница для тестирования
   - Интерфейс управления токенами
   - Генерация ссылок с автоавторизацией
   - Тестирование URL обработки

3. **Интеграция в `App.vue`**
   - Автоинициализация URL авторизации
   - Обработка событий автоавторизации
   - Интеграция с auth store

### Backend компоненты

1. **Edge Function: `telegram-url-auth`**
   - Валидация `autologin_token`
   - Создание пользователя из токена
   - Генерация сессии авторизации

2. **Auth Service расширение**
   - Метод `loginWithURLToken()`
   - Поддержка demo и production режимов

## Принцип работы

### 1. Создание URL с токеном

```javascript
const authURL = await telegramURLAuth.createAutologinURL(
  'https://horecapp.netlify.app/jobs',
  { utm_source: 'telegram' }
)
// Результат: https://horecapp.netlify.app/jobs?utm_source=telegram&autologin_token=mock_autologin_1726142567_abc123
```

### 2. Обработка входящего URL

При переходе по ссылке:
1. `telegramURLAuth.processCurrentURL()` проверяет URL
2. Извлекает `autologin_token` 
3. Валидирует токен
4. Отправляет событие `telegram-url-auth`
5. Удаляет токен из URL

### 3. Автоавторизация

При получении события:
1. `App.vue` вызывает `authStore.loginWithURLToken()`
2. Токен отправляется на backend для валидации
3. Создается сессия пользователя
4. Пользователь автоматически авторизован

## API Reference

### TelegramURLAuth Class

#### Методы

- `init()` - Инициализация обработчика
- `needsAutoLogin(url)` - Проверка нужности автоавторизации
- `addAutologinToken(url)` - Добавление токена к URL
- `processIncomingURL(url)` - Обработка входящего URL
- `createAutologinURL(baseUrl, params)` - Создание URL с токеном
- `generateShareableLink(path, params)` - Генерация ссылки для шаринга

#### События

- `telegram-url-auth` - Событие обнаружения токена автоавторизации
  ```javascript
  window.addEventListener('telegram-url-auth', (event) => {
    console.log('Token:', event.detail.token)
    console.log('Timestamp:', event.detail.timestamp)
  })
  ```

### Auth Service

#### loginWithURLToken(token, additionalData)

Авторизация через URL токен:

```javascript
const result = await authService.loginWithURLToken(token, {
  timestamp: Date.now(),
  url_auth: true
})
```

**Параметры:**
- `token` - autologin_token из URL
- `additionalData` - дополнительные данные для профиля

**Возврат:**
```javascript
{
  data: { user: { ... } },
  error: null
}
```

## Конфигурация

### Доверенные домены

```javascript
trustedDomains: [
  'telegram.org',
  't.me', 
  'web.telegram.org',
  'horecapp.netlify.app' // Наш домен
]
```

### Переменные окружения

```env
# Для production Edge Function
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
TELEGRAM_BOT_TOKEN=your_bot_token
```

## Безопасность

### Валидация токенов

1. **Формат**: Минимум 10 символов, только [a-zA-Z0-9_-]
2. **Время жизни**: Не старше 10000 секунд
3. **Подпись**: В production должна проверяться HMAC подпись

### Mock токены (для демо)

```javascript
// Формат: mock_autologin_{timestamp}_{random}
const mockToken = 'mock_autologin_1726142567_abc123def'
```

### Production токены

В реальной реализации токены должны:
- Генерироваться Telegram через MTProto API
- Подписываться секретным ключом
- Проверяться на backend через HMAC

## Тестирование

### Демо-страница

Доступна по адресу: `/test/telegram-url-auth`

Функции:
- 🔄 Обновление токена
- 🔗 Генерация URL с токеном  
- 🧪 Тестирование текущего URL
- 📋 Копирование ссылок
- 📊 Отображение результатов

### Автотесты

Создать тесты для:
- Валидации токенов
- Обработки URL
- Создания ссылок
- Авторизации через токены

## Использование

### 1. Автоматическая инициализация

URL авторизация автоматически инициализируется при загрузке страницы.

### 2. Создание ссылки с автоавторизацией

```javascript
// Простая ссылка
const link = await telegramURLAuth.generateShareableLink('/profile')

// С параметрами
const linkWithParams = await telegramURLAuth.createAutologinURL(
  'https://horecapp.netlify.app/jobs/123',
  { ref: 'telegram_bot', action: 'apply' }
)
```

### 3. Обработка авторизации

```javascript
// Подписка на события автоавторизации
window.addEventListener('telegram-url-auth', async (event) => {
  const { token, timestamp } = event.detail
  
  // Выполняем авторизацию
  const result = await authStore.loginWithURLToken(token)
  
  if (result.success) {
    // Пользователь авторизован
    console.log('Auto-login successful!')
  }
})
```

## Ограничения

1. **Demo режим**: Все токены принимаются как валидные
2. **Mock токены**: Используются для демонстрации
3. **Подпись**: В production требуется настройка проверки подписи
4. **MTProto**: Для получения реальных токенов нужен MTProto API

## Roadmap

1. ✅ Базовая реализация URL авторизации
2. ✅ Demo интерфейс и тестирование  
3. ✅ Интеграция с auth системой
4. ⏳ Настройка проверки подписи токенов
5. ⏳ Интеграция с MTProto API
6. ⏳ Автотесты и документация

## Примеры URL

### Без токена
```
https://horecapp.netlify.app/jobs?filter=urgent
```

### С autologin_token
```
https://horecapp.netlify.app/jobs?filter=urgent&autologin_token=mock_autologin_1726142567_abc123
```

### После обработки (токен удален)
```
https://horecapp.netlify.app/jobs?filter=urgent
```

---

*Документация обновлена: 12 сентября 2025 г.*
