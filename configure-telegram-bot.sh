#!/bin/bash

echo "🤖 Настройка Telegram бота @HoReCa_KZ_bot"
echo "==========================================="
echo ""

echo "📱 1. Откройте @BotFather в Telegram"
open "https://t.me/botfather"

echo ""
echo "⚙️ 2. Отправьте следующие команды:"
echo ""

echo "🔧 Команда 1: Установка Web App"
echo "/myapps"
echo "→ Выберите: @HoReCa_KZ_bot" 
echo "→ Нажмите: Edit Web App"
echo "→ Web App URL: https://horecapp.netlify.app"
echo ""

echo "🌐 Команда 2: Установка домена"
echo "/setdomain"
echo "→ Выберите: @HoReCa_KZ_bot"
echo "→ Введите: horecapp.netlify.app"
echo ""

echo "📋 Команда 3: Установка описания"
echo "/setdescription"
echo "→ Выберите: @HoReCa_KZ_bot"
echo "→ Введите: Платформа поиска работы в сфере HoReCa Казахстана"
echo ""

echo "🔗 Команда 4: Установка меню кнопки"
echo "/setmenubutton"  
echo "→ Выберите: @HoReCa_KZ_bot"
echo "→ Button text: 🔍 Найти работу"
echo "→ Web App URL: https://horecapp.netlify.app"
echo ""

echo "✅ После настройки бот будет корректно открывать Web App!"
echo ""
echo "🧪 Тестирование:"
echo "1. Найдите @HoReCa_KZ_bot в Telegram"
echo "2. Нажмите кнопку '🔍 Найти работу'"
echo "3. Должно открыться приложение на horecapp.netlify.app"
