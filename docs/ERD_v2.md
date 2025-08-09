# ERD v2 (текстовая форма)

Сущности:
- user_profiles(id, auth_user_id, full_name, primary_role, short_bio, avatar_url, video_url, experience_years, created_at, updated_at)
- skills(id, user_id, name, category, base_level, calculated_level, updated_at)
- badges(id, user_id, employer_id, name, icon_url, description, source, awarded_at)
- badge_skill_links(badge_id, skill_name, delta)
- work_logs(id, user_id, employer_id, period_from, period_to, shifts_count, total_hours, created_at)
- employers(id, name, logo_url, district_id, created_at)

Отношения:
- user_profiles 1:N skills
- user_profiles 1:N badges
- badges 1:N badge_skill_links (через badge_id)
- user_profiles 1:N work_logs
- employers 1:N work_logs
- employers 1:N badges (опционально)

Ключевые индексы:
- skills(user_id, name) UNIQUE
- badges(user_id, awarded_at DESC)
- work_logs(user_id, employer_id)

RLS (цель):
- user_profiles: владение по auth_user_id
- skills/badges/work_logs: user_id владение
- employers: публичный SELECT (MVP)

Диаграмма: ERD_v2.png (в работе).
