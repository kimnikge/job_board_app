# Changelog

Все значимые изменения этого проекта будут документироваться в этом файле.

Формат основан на Keep a Changelog, версии семантические: MAJOR.MINOR.PATCH.

## [Unreleased]
### Added
- Baseline расширение профиля: tables skills, badges, badge_skill_links, work_logs, employers.
- RLS политики для новых таблиц (минимальный набор).
- Скелет сервисов (skills, badges, experience, media) и расширение profile store.
- Feature flags (demoData, videoProfile, badges, skills).
- RPC заглушки: recalc_skills, get_user_profile_full.

### Pending
- ERD_v2.png (диаграмма) — будет добавлена после генерации.
- Storage bucket profile_videos (создать вручную в Supabase Dashboard).
- RLS политики user_profiles (SELECT/UPDATE/DELETE) в новой инкрементной миграции.

## [0.1.0] - TBD
Инициализационный релиз R1 будет зафиксирован после завершения всех пунктов Action List R1.
