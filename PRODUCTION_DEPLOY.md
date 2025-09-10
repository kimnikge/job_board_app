# 🚀 Деплой на Production - Telegram Login

## 📋 Чек-лист перед деплоем

### ✅ Подготовка завершена:
- [x] Demo режим работает локально
- [x] Production build создан
- [x] Edge Functions развёрнуты
- [x] Конфигурация Netlify обновлена
- [x] Переменные окружения настроены

### 🤖 Настройка BotFather (ОБЯЗАТЕЛЬНО!)

**Перед деплоем выполните в Telegram:**

1. Найдите @BotFather в Telegram
2. Отправьте команду: `/setdomain`
3. Выберите бота: `@Hrc_staff_adm_bot`
4. Укажите домен: `horecapp.netlify.app`

**Проверка настройки:**
```
/mybots → Выберите бота → Bot Settings → Domain
Должно быть: horecapp.netlify.app
```

## 🚀 Деплой

### Вариант 1: Автоматический деплой (рекомендуется)
1. Запушьте изменения в GitHub
2. Netlify автоматически задеплоит

### Вариант 2: Ручной деплой
1. Зайдите на https://app.netlify.com/
2. Drag & Drop папку `frontend/dist/`
3. Или используйте Netlify CLI

## 🔍 Проверка работы

### После деплоя проверьте:

1. **Главная страница:**
   - https://horecapp.netlify.app/ - должна загружаться

2. **Страница авторизации:**
   - https://horecapp.netlify.app/auth - должна появиться кнопка Telegram

3. **Telegram Widget:**
   - Кнопка должна называться "Войти через Telegram" (без "Demo")
   - При клике должно открыться окно авторизации Telegram

4. **API тест:**
   ```bash
   curl -X POST https://kuyudpxqlrinkcxvorom.supabase.co/functions/v1/telegram-login \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer anon-key" \
     -d '{"test": true}'
   ```

## 🐛 Возможные проблемы

### Telegram Widget не появляется
- ❌ Домен не настроен в BotFather
- ❌ Неправильное имя бота в переменных
- ❌ Сайт открыт не через https://horecapp.netlify.app

### Кнопка есть, но не работает  
- ❌ Edge Function не развёрнута
- ❌ Неправильные переменные окружения
- ❌ CORS ошибки

### Ошибка авторизации
- ❌ Неправильный токен бота
- ❌ Проблемы с базой данных
- ❌ Неправильная валидация hash

## 📱 Тестирование в Telegram

### Как открыть в Telegram:
1. **Через бота:**
   - Найдите @Hrc_staff_adm_bot
   - Нажмите кнопку "Открыть приложение"

2. **Через ссылку:**
   - Отправьте ссылку в Telegram: https://horecapp.netlify.app
   - Нажмите "Open via @instant_view_bot"

3. **Через Mini App (если настроено):**
   - В боте должна быть кнопка Menu
   - Или команда `/app`

## 🔧 Откат в demo режим

Если что-то не работает, можно быстро откатиться:

1. В Netlify зайти в Environment Variables
2. Изменить `VITE_USE_DEMO_MODE` на `true`
3. Redeploy site

## 📊 Мониторинг

### Логи для отладки:
- Netlify Deploy Log
- Supabase Edge Functions Logs
- Browser Console (F12)

### Полезные команды:
```bash
# Проверка Edge Functions
npx supabase functions list

# Просмотр логов
npx supabase functions logs telegram-login

# Тест API
curl -X POST https://kuyudpxqlrinkcxvorom.supabase.co/functions/v1/telegram-login
```

## 🎯 Ожидаемый результат

После успешного деплоя:

1. ✅ Пользователь открывает https://horecapp.netlify.app/auth
2. ✅ Видит кнопку "Войти через Telegram" (без Demo)
3. ✅ Нажимает кнопку → открывается авторизация Telegram
4. ✅ Авторизуется → перенаправляется в приложение
5. ✅ Данные сохраняются в базе данных
6. ✅ Сессия работает между перезагрузками

---

**Статус:** 🟡 Готов к деплою (требуется настройка BotFather)
