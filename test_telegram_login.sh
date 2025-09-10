#!/bin/bash

echo "🔧 Тестирование Telegram Login"
echo "=================================="

cd /Users/hubmarket/Desktop/job_board_app/frontend

echo "📋 Текущие настройки:"
echo "DEMO_MODE: $(grep VITE_USE_DEMO_MODE .env)"
echo "BOT_USERNAME: $(grep VITE_TELEGRAM_BOT_USERNAME .env)"
echo ""

echo "🔍 Проверка Edge Function..."
curl -X POST https://kuyudpxqlrinkcxvorom.supabase.co/functions/v1/telegram-login \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eXVkcHhxbHJpbmtjeHZvcm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NTYyNDAsImV4cCI6MjA1MjQzMjI0MH0.Xr0gLu29YWtfFe9MK4cLUfbHYcQhxV_W1IiT8mB3TWA" \
  -d '{
    "id": 123456789,
    "first_name": "Test",
    "last_name": "User",
    "username": "testuser",
    "auth_date": 1640995200,
    "hash": "test_hash"
  }'

echo -e "\n\n📱 Как протестировать в браузере:"
echo "1. Откройте http://localhost:3000/auth"
echo "2. Вы должны увидеть кнопку 'Войти через Telegram (Demo)'"
echo "3. Нажмите на кнопку"
echo "4. Вы должны быть перенаправлены на главную страницу"
echo ""
echo "🔧 Для production настройте домен в BotFather:"
echo "1. Отправьте /setdomain в @BotFather"
echo "2. Выберите бота @Hrc_staff_adm_bot"
echo "3. Укажите домен: horecapp.netlify.app"
