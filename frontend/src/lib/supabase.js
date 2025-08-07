import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Проверяем, что переменные окружения установлены в продакшене
if (import.meta.env.PROD) {
  if (!import.meta.env.VITE_SUPABASE_URL) {
    console.error('VITE_SUPABASE_URL is required in production')
  }
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.error('VITE_SUPABASE_ANON_KEY is required in production')
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})