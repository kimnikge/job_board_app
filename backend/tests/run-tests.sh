#!/bin/bash

# Скрипт для запуска тестов авторизации через Telegram

echo "🚀 Запуск тестов системы авторизации через Telegram"
echo "=================================================="

# Проверяем наличие переменных окружения
if [ ! -f "../supabase/.env" ]; then
    echo "❌ Не найден файл ../supabase/.env"
    echo "Создайте файл с переменными окружения:"
    echo "SUPABASE_URL=your_supabase_url"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    echo "TELEGRAM_BOT_TOKEN=your_telegram_bot_token"
    exit 1
fi

# Проверяем наличие node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Устанавливаем зависимости..."
    npm install
fi

echo ""
echo "🧪 Запуск базовых тестов..."
npx vitest basic.test.ts --run

if [ $? -ne 0 ]; then
    echo "❌ Базовые тесты не прошли"
    exit 1
fi

echo ""
echo "✅ Базовые тесты прошли успешно"
echo ""

# Запускаем основные тесты, если они есть
if [ -f "auth/telegram-login.test.ts" ]; then
    echo "🔐 Запуск тестов авторизации..."
    npx vitest auth/telegram-login.test.ts --run
fi

if [ -f "auth/telegram-bot.test.ts" ]; then
    echo "🤖 Запуск тестов Telegram бота..."
    npx vitest auth/telegram-bot.test.ts --run
fi

if [ -f "auth/integration.test.ts" ]; then
    echo "🔗 Запуск интеграционных тестов..."
    npx vitest auth/integration.test.ts --run
fi

echo ""
echo "✅ Все тесты завершены!"
echo ""
echo "Для запуска в watch режиме: npm run test:watch"
echo "Для просмотра покрытия: npm run test:coverage"
echo "Для UI интерфейса: npm run test:ui"
