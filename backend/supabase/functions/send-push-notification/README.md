# Send Push Notification Function

Supabase Edge Function для отправки push-уведомлений через Web Push API.

## Настройка

### 1. Генерация VAPID ключей

```bash
# Установите web-push глобально
npm install -g web-push

# Сгенерируйте VAPID ключи
web-push generate-vapid-keys

# Пример вывода:
# ===============================
# Public Key:
# BYour-Public-Key-Here
# Private Key:
# Your-Private-Key-Here
# ===============================
```

### 2. Настройка переменных окружения

Добавьте следующие переменные в Supabase Dashboard > Edge Functions > Environment Variables:

```env
VAPID_PUBLIC_KEY=ваш_public_key
VAPID_PRIVATE_KEY=ваш_private_key
SUPABASE_URL=ваш_supabase_url
SUPABASE_ANON_KEY=ваш_anon_key
```

### 3. Структура подписки в базе данных

Таблица `push_subscriptions` должна содержать:

```sql
CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекс для быстрого поиска
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
```

Структура JSON в поле `subscription`:

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "base64-encoded-public-key",
    "auth": "base64-encoded-auth-key"
  }
}
```

## Использование

### Отправка уведомления конкретному пользователю

```javascript
const response = await fetch('/functions/v1/send-push-notification', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    title: 'Новое сообщение',
    body: 'У вас есть непрочитанное сообщение',
    userId: 'user-uuid',
    type: 'message',
    data: {
      url: '/messages',
      messageId: 'msg-123'
    }
  })
});
```

### Отправка уведомления нескольким пользователям

```javascript
const response = await fetch('/functions/v1/send-push-notification', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    title: 'Важное обновление',
    body: 'Доступна новая версия приложения',
    targetUsers: ['user-uuid-1', 'user-uuid-2'],
    type: 'update',
    data: {
      url: '/updates',
      version: '1.2.0'
    }
  })
});
```

### Отправка уведомления всем подписанным пользователям

```javascript
const response = await fetch('/functions/v1/send-push-notification', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    title: 'Срочная новость',
    body: 'Экстренное объявление для всех пользователей',
    type: 'announcement',
    data: {
      url: '/news',
      priority: 'high'
    }
  })
});
```

## Ответ функции

```json
{
  "success": true,
  "sent": 5,
  "failed": 1,
  "total": 6,
  "errors": [
    {
      "userId": "user-uuid",
      "error": "Invalid subscription",
      "statusCode": 400
    }
  ]
}
```

## Особенности

- ✅ Полная поддержка Web Push API
- ✅ VAPID аутентификация
- ✅ Автоматическое шифрование сообщений
- ✅ Обработка недействительных подписок
- ✅ Поддержка массовых рассылок
- ✅ Детальная статистика отправки
- ✅ CORS поддержка

## Отладка

Логи функции доступны в Supabase Dashboard > Edge Functions > Logs.

Распространенные проблемы:
1. **VAPID ключи не настроены** - проверьте переменные окружения
2. **Неверная структура подписки** - убедитесь, что subscription содержит endpoint и keys
3. **Просроченные подписки** - функция автоматически удаляет недействительные подписки
