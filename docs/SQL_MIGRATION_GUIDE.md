# 🗂️ Инструкция по применению SQL миграций к удаленной БД

## 📋 Файлы для применения к Supabase БД:

### 1. **Основная функция создания корпоративных бейджей (R4)**
**Файл:** `backend/supabase/migrations/20250811122000_create_company_badge_function.sql`

**Описание:** Создает функцию `create_company_badge()` для создания корпоративных бейджей работодателями.

**Применение:**
1. Открыть [Supabase Dashboard](https://app.supabase.com/project/kuyudpxqrlnkcvxorom)
2. Перейти в **SQL Editor**
3. Скопировать содержимое файла `20250811122000_create_company_badge_function.sql`
4. Выполнить SQL запрос
5. Проверить что функция создана: `SELECT proname FROM pg_proc WHERE proname = 'create_company_badge';`

---

## 🔧 Быстрое применение через psql (если есть прямой доступ):

```bash
# Если у вас есть connection string, можно применить напрямую:
psql "postgresql://postgres:PASSWORD@db.kuyudpxqrlnkcvxorom.supabase.co:5432/postgres" \
  -f backend/supabase/migrations/20250811122000_create_company_badge_function.sql
```

---

## 🧪 Проверка применения:

После применения миграции проверьте что функция работает:

```sql
-- Проверка существования функции
SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'create_company_badge';

-- Проверка прав доступа
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.routine_privileges 
WHERE routine_name = 'create_company_badge';
```

---

## 📊 Что даст применение миграции:

✅ **Работодатели смогут создавать собственные бейджи** через API  
✅ **Корпоративные бейджи с навыковыми бонусами**  
✅ **RLS политики для безопасности**  
✅ **Полная функциональность R4 Gamification Engine**

---

## ⚠️ Альтернативное решение без миграции:

Если не удается применить миграцию, можно временно использовать **Demo Mode** в frontend:

```javascript
// В services/gamification.service.js и employer.service.js
// Уже настроен fallback на mock данные
const isDemoMode = true // Временно для тестирования
```

Это позволит протестировать весь R4 функционал с имитацией данных.

---

## 🔗 Полезные ссылки:

- **Supabase Dashboard:** https://app.supabase.com/project/kuyudpxqrlnkcvxorom
- **SQL Editor:** https://app.supabase.com/project/kuyudpxqrlnkcvxorom/sql/new
- **Database:** https://app.supabase.com/project/kuyudpxqrlnkcvxorom/database/tables
