// ✨ ЧИСТАЯ КОНФИГУРАЦИЯ SUPABASE БЕЗ DEMO РЕЖИМА
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration')
  throw new Error('Missing Supabase configuration. Check environment variables.')
}

console.log('✅ Supabase config loaded:', {
  url: supabaseUrl.substring(0, 30) + '...',
  hasKey: !!supabaseAnonKey
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'shiftwork-auth-token',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// Простые экспорты для совместимости
export const DEFAULT_SELECT = '*'

export const isAuthenticated = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}

export const handleAuthError = (error) => {
  if (error?.message?.includes('Auth session missing')) {
    return { data: null, error: null }
  }
  return { data: null, error }
}