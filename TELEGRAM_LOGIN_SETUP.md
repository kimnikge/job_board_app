# Настройка Telegram Login Widget

## Проблема
Кнопка "Войти через Telegram" не работает, потому что Telegram Login Widget не настроен для работы с локальным доменом.

## Что происходит сейчас
1. ✅ Все тесты проходят (32 теста)
2. ✅ Edge Functions работают
3. ✅ База данных настроена
4. ❌ Telegram Login Widget не загружается из-за ограничений домена

## Решения

### 1. Временное решение - Demo режим (ГОТОВО)
```bash
# В файле frontend/.env
VITE_USE_DEMO_MODE=true
```

Теперь будет показываться кнопка "Войти через Telegram (Demo)" которая работает с тестовыми данными.

### 2. Настройка для production

#### Шаг 1: Настройте бота в BotFather
1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/setdomain`
3. Выберите вашего бота `@Hrc_staff_adm_bot`
4. Укажите домен: `horecapp.netlify.app`

#### Шаг 2: Проверьте настройки бота
```bash
# Отправьте BotFather команду:
/mybots
# Выберите вашего бота
# Проверьте Domain в настройках
```

#### Шаг 3: Для локальной разработки
Telegram Login Widget НЕ работает на localhost. Варианты:
1. Используйте demo режим (рекомендуется)
2. Настройте локальный туннель (ngrok/localtunnel)
3. Используйте staging домен

## Как проверить что сейчас работает

### В Demo режиме:
1. Откройте http://localhost:3000/
2. Вы увидите страницу авторизации
3. Нажмите "Войти через Telegram (Demo)"
4. Вы будете авторизованы как тестовый пользователь

### В Production режиме:
1. Установите `VITE_USE_DEMO_MODE=false`
2. Убедитесь что домен настроен в BotFather
3. Разверните на horecapp.netlify.app
4. Telegram Widget должен появиться

## Диагностика

### Проверить загрузку Widget в консоли браузера:
```javascript
// Должно быть определено после загрузки
console.log(window.TelegramLoginWidget)
```

### Проверить переменные окружения:
```javascript
console.log('Bot username:', import.meta.env.VITE_TELEGRAM_BOT_USERNAME)
console.log('Demo mode:', import.meta.env.VITE_USE_DEMO_MODE)
```

## Статус на данный момент
- ✅ Demo режим включен и работает
- ✅ Все backend функции готовы
- ✅ Тесты покрывают всю логику
- ⏳ Нужна настройка домена в BotFather для production
