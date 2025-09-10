# 📁 Структура проекта Job Board App

## 🎯 Основные папки:

```
job_board_app/
├── 📂 frontend/                 # Vue.js приложение
│   ├── 📄 .env                  # Настройки Supabase
│   ├── 📄 package.json          # Зависимости
│   ├── 📄 vite.config.js        # Конфигурация Vite
│   ├── 📄 index.html            # Главная страница
│   ├── 📂 src/                  # Исходный код
│   │   ├── 📄 App.vue           # Главный компонент
│   │   ├── 📄 main.js           # Точка входа
│   │   ├── 📂 components/       # Vue компоненты
│   │   ├── 📂 views/            # Страницы
│   │   ├── 📂 stores/           # Pinia хранилища
│   │   ├── 📂 services/         # API сервисы
│   │   └── 📂 router/           # Маршруты
│   └── 📂 public/               # Статичные файлы
│
├── 📂 backend/                  # База данных и сервер
│   ├── 📄 README.md             # Инструкции
│   └── 📂 supabase/             # Конфигурация Supabase
│       ├── 📄 config.toml       # Настройки проекта
│       ├── 📂 migrations/       # SQL миграции
│       └── 📂 functions/        # Edge Functions
│
├── 📂 docs/                     # Документация
│   ├── 📄 MVP.md                # Описание функций
│   ├── 📄 CHANGELOG.md          # История изменений
│   ├── 📄 MONETIZATION_SYSTEM.md # Система монетизации
│   ├── 📂 кабинет/              # Документация интерфейса
│   └── 📂 план/                 # Планы развития
│
├── 📄 README.md                 # Главная документация
├── 📄 netlify.toml              # Настройки деплоя
└── 📄 .gitignore                # Исключения Git

```

## 🚀 Команды для запуска:

### Разработка:
```bash
cd frontend
npm install
npm run dev
```

### Сборка:
```bash
cd frontend
npm run build
```

## 🔧 Настройка:

1. **Frontend**: Настройки в `frontend/.env`
2. **Backend**: Конфигурация в `backend/supabase/config.toml`
3. **База данных**: Миграции в `backend/supabase/migrations/`

## 📱 Доступные страницы:

- `/` - Главная страница
- `/jobs` - Список вакансий
- `/urgent` - Срочные вакансии
- `/favorites` - Избранное
- `/companies` - Компании
- `/profile` - Профиль
- `/notifications` - Уведомления
- `/cabinet` - Личный кабинет

---
*Проект готов к разработке и деплою*
