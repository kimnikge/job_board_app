#!/bin/bash

# 🔧 Скрипт для настройки переменных окружения в Netlify
# Выполните этот скрипт после получения нового токена от BotFather

echo "🚀 Настройка переменных окружения Netlify для horecapp..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📝 Введите новый Telegram Bot токен (формат: 1234567890:ABCdefGhIJKlmNOpqrSTUvwxyZ):${NC}"
read -r NEW_BOT_TOKEN

# Извлекаем Bot ID из токена
BOT_ID=$(echo $NEW_BOT_TOKEN | cut -d':' -f1)

echo -e "${GREEN}✅ Bot ID: $BOT_ID${NC}"
echo -e "${GREEN}✅ Token: $NEW_BOT_TOKEN${NC}"

# Проверяем формат токена
if [[ ! $NEW_BOT_TOKEN =~ ^[0-9]+:[A-Za-z0-9_-]+$ ]]; then
    echo -e "${RED}❌ Неверный формат токена! Токен должен быть в формате: 1234567890:ABCdefGhIJKlmNOpqrSTUvwxyZ${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔧 Теперь выполните следующие шаги в Netlify Dashboard:${NC}"
echo ""
echo "1. Откройте: https://app.netlify.com/sites/horecapp/settings/deploys"
echo "2. Перейдите в раздел 'Environment variables'"
echo "3. Нажмите 'Add variable' для каждой переменной:"
echo ""
echo -e "${GREEN}   VITE_TELEGRAM_BOT_ID${NC} = ${BOT_ID}"
echo -e "${GREEN}   VITE_TELEGRAM_BOT_TOKEN${NC} = ${NEW_BOT_TOKEN}"
echo -e "${GREEN}   VITE_TELEGRAM_BOT_USERNAME${NC} = Hrc_staff_adm_bot"
echo ""
echo "4. После добавления всех переменных нажмите 'Deploy site' для пересборки"
echo ""
echo -e "${YELLOW}📋 Также обновите локальный .env файл:${NC}"
echo ""
echo "VITE_TELEGRAM_BOT_ID=$BOT_ID"
echo "VITE_TELEGRAM_BOT_TOKEN=$NEW_BOT_TOKEN"
echo "VITE_TELEGRAM_BOT_USERNAME=Hrc_staff_adm_bot"
echo ""
echo -e "${GREEN}✅ Готово! После настройки протестируйте авторизацию на horecapp.netlify.app${NC}"
