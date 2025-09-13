#!/bin/bash

# 🤖 Скрипт настройки Telegram Web App
# После деплоя на Netlify нужно настроить бота

echo "🤖 Настройка Telegram бота для Web App"
echo ""
echo "📋 Инструкция:"
echo ""
echo "1. Откройте @BotFather в Telegram"
echo "2. Выберите вашего бота: @Shift_work_kz"  
echo "3. Выберите: Bot Settings → Menu Button"
echo "4. Укажите URL: https://horecapp.netlify.app"
echo "5. Укажите текст кнопки: 'Открыть приложение'"
echo ""
echo "6. Настройте Web App:"
echo "   /setmenubutton"
echo "   @Shift_work_kz"
echo "   text: Работа в HoReCa"
echo "   url: https://horecapp.netlify.app"
echo ""
echo "7. Настройте Domain:"
echo "   /setdomain"
echo "   @Shift_work_kz"  
echo "   horecapp.netlify.app"
echo ""

# Проверяем текущие настройки бота
TELEGRAM_BOT_TOKEN="7555643826:AAGwL6EDJIXCdLY8fEtbJZIAWG0fkh---Iw"

echo "🔍 Проверка текущих настроек бота..."

# Получаем информацию о боте
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe" | jq .

echo ""
echo "✅ Настройка завершена!"
echo "🚀 Теперь в вашем боте должна появиться кнопка 'Работа в HoReCa'"
echo "📱 Нажатие на неё откроет Web App: https://horecapp.netlify.app"