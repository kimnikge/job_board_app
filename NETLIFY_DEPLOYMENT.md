# Netlify Deployment Instructions

## Environment Variables Required

Set these environment variables in your Netlify dashboard:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Build Settings

- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`
- **Base directory**: `frontend`

## Troubleshooting

### Ошибка "vite: not found"
- Убедитесь, что `npm ci` выполняется перед `npm run build`
- Проверьте наличие vite в devDependencies
- Используйте `npm ci` вместо `npm install` для более надежной установки

### Ошибка пути публикации
- Базовая директория: `frontend`
- Директория публикации: `frontend/dist` (относительно корня репозитория)
- НЕ используйте `frontend/frontend/dist` - это дублирование пути

### Environment Variables
- Все переменные VITE_* должны быть установлены в Netlify Dashboard
- Без них приложение не будет корректно работать

### Последние исправления (7 августа 2025)
- Исправлена команда сборки: добавлен `npm ci` перед `npm run build`
- Исправлен путь публикации в netlify.toml
- Добавлена установка зависимостей в команду сборки
