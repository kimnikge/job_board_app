-- Создание системы геймификации R4
-- Таблицы badges, user_badges, badge_skill_links и функции

-- Создаем таблицу employers если её нет (для связей)
CREATE TABLE IF NOT EXISTS public.employers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Создаем таблицу user_profiles если её нет (для связей)  
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE,
  name text,
  created_at timestamptz DEFAULT now()
);

-- Создаем таблицу work_logs если её нет (для связей)
CREATE TABLE IF NOT EXISTS public.work_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Таблица шаблонов бейджей (глобальный каталог)
CREATE TABLE IF NOT EXISTS public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon_url text NOT NULL,
  category text NOT NULL CHECK (category IN ('Hard Skills', 'Soft Skills', 'Experience', 'Recommendations', 'Special Projects', 'Loyalty', 'Team Contribution', 'Other')),
  level text CHECK (level IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  is_company_generated boolean DEFAULT false,
  company_id uuid REFERENCES public.employers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Таблица присвоенных бейджей пользователям  
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id uuid REFERENCES public.badges(id) NOT NULL,
  user_id uuid REFERENCES public.user_profiles(id) NOT NULL,
  employer_id uuid REFERENCES public.employers(id),
  awarded_by uuid REFERENCES public.user_profiles(id),
  awarded_at timestamptz DEFAULT now(),
  reason text,
  source text CHECK (source IN ('manual','auto')) DEFAULT 'manual',
  work_log_id uuid REFERENCES public.work_logs(id)
);

-- Таблица связей бейджей с навыками (для пересчета calculated_level)
CREATE TABLE IF NOT EXISTS public.badge_skill_links (
  badge_id uuid REFERENCES public.badges(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  delta smallint NOT NULL DEFAULT 0,
  PRIMARY KEY (badge_id, skill_name)
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS badges_category_level_idx ON public.badges(category, level);
CREATE INDEX IF NOT EXISTS badges_company_id_idx ON public.badges(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS user_badges_user_id_awarded_at_idx ON public.user_badges(user_id, awarded_at DESC);
CREATE INDEX IF NOT EXISTS user_badges_badge_id_idx ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS user_badges_employer_id_idx ON public.user_badges(employer_id) WHERE employer_id IS NOT NULL;

-- RLS Policies
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_skill_links ENABLE ROW LEVEL SECURITY;

-- Политики для badges (шаблоны доступны всем для чтения)
DROP POLICY IF EXISTS badges_select_all ON public.badges;
CREATE POLICY badges_select_all ON public.badges 
FOR SELECT USING (true);

-- Политики для создания корпоративных бейджей (только владельцы компаний)
DROP POLICY IF EXISTS badges_company_insert ON public.badges;
CREATE POLICY badges_company_insert ON public.badges 
FOR INSERT WITH CHECK (
  is_company_generated = true AND 
  company_id IS NOT NULL
);

-- Политики для user_badges (пользователи видят только свои)
DROP POLICY IF EXISTS user_badges_select_own ON public.user_badges;
CREATE POLICY user_badges_select_own ON public.user_badges 
FOR SELECT USING (
  user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
);

-- Политики для выдачи бейджей (работодатели могут награждать своих сотрудников)
DROP POLICY IF EXISTS user_badges_insert_employer ON public.user_badges;
CREATE POLICY user_badges_insert_employer ON public.user_badges 
FOR INSERT WITH CHECK (
  employer_id IS NOT NULL AND
  awarded_by = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
);

-- Политики для badge_skill_links (администраторы и создатели бейджей)
DROP POLICY IF EXISTS badge_skill_links_select_all ON public.badge_skill_links;
CREATE POLICY badge_skill_links_select_all ON public.badge_skill_links 
FOR SELECT USING (true);

-- Updated at trigger
DROP TRIGGER IF EXISTS set_updated_at_badges ON public.badges;
CREATE TRIGGER set_updated_at_badges
  BEFORE UPDATE ON public.badges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Создаем базовые системные бейджи согласно ТЗ
INSERT INTO public.badges (name, description, icon_url, category, level, is_company_generated) VALUES
-- Hard Skills
('Barista Bronze', 'Базовые навыки бариста', '☕', 'Hard Skills', 'Bronze', false),
('Barista Silver', 'Продвинутые навыки бариста', '☕', 'Hard Skills', 'Silver', false),
('Barista Gold', 'Экспертные навыки бариста', '☕', 'Hard Skills', 'Gold', false),
('Mixology Bronze', 'Базовые навыки барменa', '🍸', 'Hard Skills', 'Bronze', false),
('Mixology Silver', 'Продвинутые навыки бармена', '🍸', 'Hard Skills', 'Silver', false),
('Mixology Gold', 'Экспертные навыки бармена', '🍸', 'Hard Skills', 'Gold', false),

-- Soft Skills  
('Team Player', 'Командный игрок', '🤝', 'Soft Skills', 'Bronze', false),
('Punctuality', 'Пунктуальность', '⏰', 'Soft Skills', 'Bronze', false),
('Leadership', 'Лидерские качества', '👑', 'Soft Skills', 'Gold', false),

-- Experience
('5 Shifts', 'Выполнено 5 смен', '📅', 'Experience', 'Bronze', false),
('25 Shifts', 'Выполнено 25 смен', '📅', 'Experience', 'Silver', false),
('50 Shifts', 'Выполнено 50 смен', '📅', 'Experience', 'Gold', false),
('100 Shifts', 'Выполнено 100 смен', '📅', 'Experience', 'Platinum', false),
('Night Owl', 'Работа в ночные смены', '🌙', 'Experience', 'Silver', false),

-- Recommendations
('Recommended by Employer', 'Рекомендован работодателем', '⭐', 'Recommendations', 'Gold', false),
('Customer Favorite', 'Любимец клиентов', '❤️', 'Recommendations', 'Silver', false)
ON CONFLICT (name) DO NOTHING;

-- Связываем бейджи с навыками (для автоматического пересчета)
INSERT INTO public.badge_skill_links (badge_id, skill_name, delta) VALUES
-- Barista бейджи повышают навык "Кофе"
((SELECT id FROM public.badges WHERE name = 'Barista Bronze'), 'Кофе', 10),
((SELECT id FROM public.badges WHERE name = 'Barista Silver'), 'Кофе', 20),
((SELECT id FROM public.badges WHERE name = 'Barista Gold'), 'Кофе', 30),

-- Mixology бейджи повышают навык "Бармен"
((SELECT id FROM public.badges WHERE name = 'Mixology Bronze'), 'Бармен', 10),
((SELECT id FROM public.badges WHERE name = 'Mixology Silver'), 'Бармен', 20),
((SELECT id FROM public.badges WHERE name = 'Mixology Gold'), 'Бармен', 30),

-- Team Player повышает навык "Командная работа"
((SELECT id FROM public.badges WHERE name = 'Team Player'), 'Командная работа', 15),

-- Leadership повышает навык "Управление"
((SELECT id FROM public.badges WHERE name = 'Leadership'), 'Управление', 25)
ON CONFLICT DO NOTHING;