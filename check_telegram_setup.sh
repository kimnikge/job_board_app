#!/bin/bash

echo "🔧 Проверка настройки авторизации Telegram на продакшн"
echo "=================================================="

cd /Users/hubmarket/Desktop/job_board_app

echo ""
echo "📋 Текущие настройки:"
echo "Demo mode: $(grep VITE_USE_DEMO_MODE frontend/.env | cut -d'=' -f2)"
echo "Production URL: $(grep VITE_PRODUCTION_URL frontend/.env | cut -d'=' -f2)"
echo "Bot username: $(grep VITE_TELEGRAM_BOT_USERNAME frontend/.env | cut -d'=' -f2)"

echo ""
echo "🔍 Проверка Edge Functions:"
curl -s -o /dev/null -w "%{http_code}" https://kuyudpxqlrinkcxvorom.supabase.co/functions/v1/telegram-login
echo " - telegram-login: $(curl -s -o /dev/null -w "%{http_code}" https://kuyudpxqlrinkcxvorom.supabase.co/functions/v1/telegram-login) (должен быть 200)"

echo ""
echo "⚠️  ВАЖНО: Настройте домен в BotFather!"
echo "1. Откройте @BotFather в Telegram"
echo "2. /mybots → Выберите @Hrc_staff_adm_bot"
echo "3. Bot Settings → Domain → horecapp.netlify.app"

echo ""
echo "✅ После настройки:"
echo "- Telegram Login Widget заработает на https://horecapp.netlify.app"
echo "- Пользователи смогут авторизовываться через Telegram"
echo "- Все данные будут проверяться реальным Telegram API"
