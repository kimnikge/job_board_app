#!/bin/bash

cd /Users/hubmarket/Desktop/job_board_app/frontend

echo "🔄 ПЕРЕКЛЮЧЕНИЕ РЕЖИМА АВТОРИЗАЦИИ"
echo "=================================="

CURRENT_MODE=$(grep VITE_USE_DEMO_MODE .env | cut -d'=' -f2)

if [ "$CURRENT_MODE" = "true" ]; then
    echo "📱 Текущий режим: DEMO"
    echo "🔄 Переключаю на PRODUCTION..."
    sed -i '' 's/VITE_USE_DEMO_MODE=true/VITE_USE_DEMO_MODE=false/' .env
    echo "✅ Переключено на PRODUCTION режим"
    echo "🔗 Telegram авторизация будет работать через реальный API"
else
    echo "🌐 Текущий режим: PRODUCTION"
    echo "🔄 Переключаю на DEMO..."
    sed -i '' 's/VITE_USE_DEMO_MODE=true/VITE_USE_DEMO_MODE=false/' .env
    sed -i '' 's/VITE_USE_DEMO_MODE=false/VITE_USE_DEMO_MODE=true/' .env
    echo "✅ Переключено на DEMO режим"
    echo "🔗 Telegram авторизация будет работать с тестовыми данными"
fi

echo ""
echo "📋 Текущие настройки:"
echo "Demo mode: $(grep VITE_USE_DEMO_MODE .env | cut -d'=' -f2)"
echo "Frontend: http://localhost:3000/"
echo ""
echo "🔄 Перезапустите dev сервер для применения изменений"
