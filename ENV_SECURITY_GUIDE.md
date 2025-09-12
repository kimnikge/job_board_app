# 🔒 Гид по безопасности переменных окружения

## ❌ Проблемы, которые были:

1. **Service Role Key в фронтенде** - 🚨 КРИТИЧНО!
2. **Bot Token в фронтенде** - 🚨 КРИТИЧНО!  
3. **Дублирование секретов** - риск утечек
4. **Много .env файлов** - сложно контролировать

## ✅ Правильная архитектура:

### Frontend (.env) - ТОЛЬКО публичные данные:
```bash
# ✅ Можно в браузере
VITE_SUPABASE_URL=...           # Публичный URL
VITE_SUPABASE_ANON_KEY=...      # Анонимный ключ (ограниченный)
VITE_TELEGRAM_BOT_ID=...        # ID бота (публичная информация)
VITE_TELEGRAM_BOT_USERNAME=...  # Имя бота (публичное)

# ❌ НЕ ДОЛЖНО быть в фронтенде:
# VITE_SUPABASE_SERVICE_ROLE_KEY  ← Полный доступ к БД!
# VITE_TELEGRAM_BOT_TOKEN         ← Контроль над ботом!
```

### Backend (.env) - Только приватные секреты:
```bash
# ✅ Только на сервере
SUPABASE_SERVICE_ROLE_KEY=...   # Административный доступ
TELEGRAM_BOT_TOKEN=...          # Токен бота
```

### Production (Netlify) - Переменные окружения:
```bash
# Frontend (публичные)
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY  
VITE_TELEGRAM_BOT_ID

# Backend (через Edge Functions)
SUPABASE_SERVICE_ROLE_KEY
TELEGRAM_BOT_TOKEN
```

## 🛡️ Правила безопасности:

1. **Frontend = публичные данные** (VITE_*)
2. **Backend = приватные секреты** (без VITE_)
3. **Никогда не дублируйте секреты**
4. **Production = только переменные окружения**
5. **Локально = .env в .gitignore**

## 🔍 Как проверить безопасность:

```bash
# Найти все секреты в коде
grep -r "SERVICE_ROLE_KEY\|BOT_TOKEN" .

# Проверить что нет в git
git log --oneline | head -5
git show --name-only

# Проверить .gitignore
cat .gitignore | grep -E "\.env"
```

## 🚨 В случае утечки:

1. **Немедленно смените ключи**
2. **Очистите git историю**  
3. **Обновите production переменные**
4. **Проверьте логи доступа**

## ✅ Безопасная разработка:

- Используйте `.env.example` для шаблонов
- Автоматизируйте настройку через скрипты
- Регулярно ротируйте ключи
- Мониторьте логи безопасности
