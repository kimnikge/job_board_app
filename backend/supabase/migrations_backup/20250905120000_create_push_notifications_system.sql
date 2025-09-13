-- Создание таблицы для хранения push-подписок
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Создание таблицы для хранения конфигурации push-уведомлений
CREATE TABLE public.push_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vapid_public_key text NOT NULL,
  vapid_private_key text NOT NULL,
  fcm_server_key text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Создание таблицы для логирования отправленных уведомлений
CREATE TABLE public.push_notifications_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  type text DEFAULT 'info',
  data jsonb,
  sent_at timestamp with time zone DEFAULT now(),
  success boolean DEFAULT false,
  error_message text
);

-- RLS политики
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications_log ENABLE ROW LEVEL SECURITY;

-- Пользователи могут управлять только своими подписками
CREATE POLICY "Users can manage their own subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Только админы могут читать конфигурацию
CREATE POLICY "Admins can read config" ON public.push_config
  FOR SELECT USING (auth.role() = 'service_role');

-- Пользователи могут видеть логи своих уведомлений
CREATE POLICY "Users can view their notification logs" ON public.push_notifications_log
  FOR SELECT USING (auth.uid() = user_id);

-- Создание индексов для производительности
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX idx_push_notifications_log_user_id ON public.push_notifications_log(user_id);
CREATE INDEX idx_push_notifications_log_sent_at ON public.push_notifications_log(sent_at DESC);

-- Функция для очистки старых логов уведомлений (старше 30 дней)
CREATE OR REPLACE FUNCTION cleanup_old_push_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.push_notifications_log 
  WHERE sent_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Функция для отправки push-уведомления через Edge Function
CREATE OR REPLACE FUNCTION send_push_notification(
  p_user_id uuid,
  p_title text,
  p_body text,
  p_type text DEFAULT 'info',
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean AS $$
DECLARE
  result boolean := false;
BEGIN
  -- Здесь будет вызов Edge Function
  -- Пока что просто логируем
  INSERT INTO public.push_notifications_log (user_id, title, body, type, data, success)
  VALUES (p_user_id, p_title, p_body, p_type, p_data, true);
  
  result := true;
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO public.push_notifications_log (user_id, title, body, type, data, success, error_message)
    VALUES (p_user_id, p_title, p_body, p_type, p_data, false, SQLERRM);
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
