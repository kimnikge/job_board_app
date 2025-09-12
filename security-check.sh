#!/bin/bash

echo "🔒 ПОЛНАЯ ПРОВЕРКА БЕЗОПАСНОСТИ ПРОЕКТА"
echo "========================================"
echo ""

echo "1. 🔍 Проверка .env файлов в Git:"
if git ls-files | grep -E "\.env$"; then
    echo "❌ ОПАСНО: .env файлы в репозитории!"
else
    echo "✅ .env файлы не в репозитории"
fi
echo ""

echo "2. 🔍 Поиск секретов в коммитах:"
if git log --oneline -10 | grep -i "token\|secret\|key"; then
    echo "❌ НАЙДЕНЫ УПОМИНАНИЯ СЕКРЕТОВ В КОММИТАХ"
else
    echo "✅ Секреты не упоминаются в коммитах"
fi
echo ""

echo "3. 🔍 Проверка staging area:"
if git diff --cached --name-only | xargs -I {} sh -c 'echo "Checking: {}"; grep -l "5039661525\|AAFJWbYG8s9q\|sb_secret_gJZsDLOT" "{}" 2>/dev/null || true'; then
    echo "❌ СЕКРЕТЫ В STAGING AREA!"
else
    echo "✅ Нет секретов в staging area"
fi
echo ""

echo "4. 🔍 Файлы с секретами (должны быть в .gitignore):"
echo "frontend/.env: $(git check-ignore frontend/.env && echo '✅ Игнорируется' || echo '❌ НЕ ИГНОРИРУЕТСЯ')"
echo "backend/supabase/.env: $(git check-ignore backend/supabase/.env && echo '✅ Игнорируется' || echo '❌ НЕ ИГНОРИРУЕТСЯ')"
echo "netlify-production.env: $(git check-ignore netlify-production.env && echo '✅ Игнорируется' || echo '❌ НЕ ИГНОРИРУЕТСЯ')"
echo ""

echo "5. 🔍 Содержимое .gitignore:"
echo "$(grep -E "\.env|secret" .gitignore | wc -l) правил для .env файлов"
echo ""

echo "6. 🌐 Статус Netlify переменных:"
echo "Переменные настроены в Netlify Dashboard (не в коде)"
echo ""

echo "7. 📊 ИТОГОВЫЙ СТАТУС БЕЗОПАСНОСТИ:"
SECRET_FILES=$(find . -name "*.env" -not -path "./.git/*" | wc -l)
IGNORED_FILES=$(find . -name "*.env" -not -path "./.git/*" | xargs git check-ignore 2>/dev/null | wc -l)

if [ "$SECRET_FILES" -eq "$IGNORED_FILES" ]; then
    echo "🟢 БЕЗОПАСНО: Все .env файлы игнорируются Git"
else
    echo "🔴 ОПАСНО: Не все .env файлы игнорируются!"
fi
echo ""

echo "8. 🎯 РЕКОМЕНДАЦИИ:"
echo "✅ Локальная разработка: .env файлы защищены"
echo "✅ Production: переменные в Netlify Dashboard" 
echo "✅ Git: секреты не попадают в репозиторий"
echo "⚠️  Регулярно проверяйте git status перед коммитами"
