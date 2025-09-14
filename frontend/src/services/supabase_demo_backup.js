// ✨ БАЗОВАЯ КОНФИГУРАЦИЯ SUPABASE - ЭТАП 4.1.1
import { createClient } from '@supabase/supabase-js'

// Предотвращение множественных экземпляров
if (globalThis.supabaseClient) {
  console.warn('⚠️ Supabase client already exists, reusing existing instance')
}

// Безопасное получение переменных окружения с fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const forceDemoEnv = (import.meta.env.VITE_USE_DEMO_MODE || import.meta.env.VITE_USE_DEMO_DATA)
  ? String(import.meta.env.VITE_USE_DEMO_MODE || import.meta.env.VITE_USE_DEMO_DATA).toLowerCase() === 'true'
  : false

// Проверяем принудительный demo режим из localStorage (для тестирования в браузере)
const forceDemoFromStorage = typeof window !== 'undefined' 
  ? localStorage.getItem('force-demo-mode') === 'true'
  : false

// Флаг для определения demo режима (определяем ПЕРЕД использованием)
export const isDemoMode = forceDemoEnv || forceDemoFromStorage

console.log('🔧 Supabase config:', {
  isDemoMode,
  forceDemoEnv,
  forceDemoFromStorage,
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: isDemoMode ? 'demo-mode' : supabaseUrl.substring(0, 30) + '...',
  env: import.meta.env.MODE
})

// В демо-режиме используем заглушки
const finalUrl = isDemoMode ? 'https://demo.localhost' : supabaseUrl
const finalKey = isDemoMode ? 'demo-key-12345' : supabaseAnonKey

// Создаем клиент даже с demo данными для предотвращения ошибок
let clientConfig = {
  auth: {
    // Используем уникальный storage key для предотвращения конфликтов
    storageKey: 'job-board-auth-token',
    // Автоматическое обновление токенов
    autoRefreshToken: true,
    // Сохранение сессии
    persistSession: true,
    // Предотвращение множественных экземпляров
    detectSessionInUrl: false
  }
}

// Полностью отключаем realtime для demo режима
if (isDemoMode) {
  clientConfig.realtime = {
    params: {
      eventsPerSecond: 0
    }
  }
  console.log('🔇 Realtime disabled for demo mode')
}

// В демо-режиме создаем заглушку без сетевых запросов
let supabaseClient
if (isDemoMode) {
  console.log('🎭 Creating demo Supabase client (no network calls)')
  
  supabaseClient = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: (table) => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null })
    }),
    channel: () => ({
      on: () => ({}),
      subscribe: () => ({})
    })
  }
} else {
  supabaseClient = globalThis.supabaseClient || createClient(finalUrl, finalKey, clientConfig)
  // Сохраняем глобальную ссылку для предотвращения дубликатов
  globalThis.supabaseClient = supabaseClient
}

export const supabase = supabaseClient

// Функция для проверки аутентификации
export const isAuthenticated = async () => {
  if (isDemoMode) {
    console.log('🎭 Demo mode: returning false for auth check')
    return false
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  } catch (error) {
    console.warn('Auth check failed:', error)
    return false
  }
}

// Обработчик ошибок для запросов
export const handleAuthError = (error) => {
  if (isDemoMode) {
    console.log('🎭 Demo mode: ignoring auth error')
    return
  }
  
  if (error?.message?.includes('AuthSessionMissingError') || 
      error?.status === 401 || 
      error?.message?.includes('session missing')) {
    console.warn('Auth session missing, falling back to demo data')
    return true // Используем демо-данные
  }
  return false
}

// Функция для создания realtime подписки только для аутентифицированных пользователей
export const createRealtimeSubscription = async (table, callback) => {
  const userAuthenticated = await isAuthenticated()
  if (!userAuthenticated || isDemoMode) {
    console.log('Skipping realtime subscription - user not authenticated or demo mode')
    return null
  }
  
  return supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: table 
    }, callback)
    .subscribe()
}

// Базовые настройки для всех запросов
export const DEFAULT_SELECT = '*'
export const DEFAULT_LIMIT = 50

console.log('✅ Supabase service initialized:', { 
  url: finalUrl, 
  isDemoMode,
  forceDemoEnv
})
