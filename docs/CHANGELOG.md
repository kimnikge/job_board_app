# Changelog

Все значимые изменения этого проекта будут документироваться в этом файле.

Формат основан на Keep a Changelog, версии семантические: MAJOR.MINOR.PATCH.

## [Unreleased]
### Added - R4 Gamification Engine (11 августа 2025)
- **Backend SQL:** create_company_badge() функция для создания корпоративных бейджей
- **Frontend Services:** gamificationService для статистики, прогресса, достижений
- **Frontend Services:** employerService для управления корпоративными бейджами
- **Frontend Services:** badges.service расширен с CRUD операциями и каталогом
- **Store Integration:** useProfileStore дополнен методами R4 (recalcSkills, getGameProgress, awardBadge)
- **Testing:** R4TestPage.vue - полная тестовая страница геймификации на /test-r4
- **Demo Mode:** поддержка mock данных для всех новых сервисов R4

### Enhanced - R1/R2/R3 Extensions
- Baseline расширение профиля: tables skills, badges, badge_skill_links, work_logs, employers.
- RLS политики для новых таблиц (минимальный набор).
- Скелет сервисов (skills, badges, experience, media) и расширение profile store.
- Feature flags (demoData, videoProfile, badges, skills).
- RPC заглушки: recalc_skills, get_user_profile_full.
- Storage bucket profile_videos + политики RLS (storage.objects) через миграцию.
- ERD обновлён (ERD_v2.md, ERD_v2.dbml, ERD_v2.svg — PNG не критичен).
- Ранняя PWA инфраструктура: manifest.webmanifest, service worker (cache-first core).
- Accessibility: skip link, ARIA labels в header, lazy avatar.
- Responsive + prefers-reduced-motion стили профиля.
- Упрощение manualChunks (удалены ссылки на устаревшие src/modules/* пути).

### Pending
- Применение остальных SQL миграций (геймификационные таблицы) к удаленной БД
- Тестирование R4 функций с реальной БД

### Fixed - R4 Database Connection (11 августа 2025)
- ✅ Успешно установлено подключение к удаленной Supabase БД
- ✅ Функция create_company_badge() применена к production БД  
- ✅ CLI авторизация и связывание проекта завершено
- ⚠️ Остальные таблицы геймификации требуют отдельного применения

## [0.1.0] - TBD
Инициализационный релиз R1 будет зафиксирован после завершения всех пунктов Action List R1.
