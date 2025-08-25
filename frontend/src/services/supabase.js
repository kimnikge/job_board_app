// ✨ БАЗОВАЯ КОНФИГУРАЦИЯ SUPABASE - ЭТАП 4.1.1
import { createClient } from '@supabase/supabase-js'

// Предотвращение множественных экземпляров
if (globalThis.supabaseClient) {
  console.warn('⚠️ Supabase client already exists, reusing existing instance')
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const forceDemoEnv = (import.meta.env.VITE_USE_DEMO_MODE || import.meta.env.VITE_USE_DEMO_DATA)
  ? String(import.meta.env.VITE_USE_DEMO_MODE || import.meta.env.VITE_USE_DEMO_DATA).toLowerCase() === 'true'
  : false

// Fallback для демо-режима если переменные не заданы
const defaultUrl = 'https://demo.supabase.co'
const defaultKey = 'demo-key'

const finalUrl = supabaseUrl || defaultUrl
const finalKey = supabaseAnonKey || defaultKey

// Флаг для определения demo режима (определяем ПЕРЕД использованием)
export const isDemoMode = forceDemoEnv || !supabaseUrl || !supabaseAnonKey

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

// Полностью отключаем realtime для demo режима или невалидных URL
if (isDemoMode || finalUrl === defaultUrl) {
  clientConfig.realtime = {
    params: {
      eventsPerSecond: 0
    }
  }
  // Для demo режима используем пустой URL без realtime
  console.log('🔇 Realtime disabled for demo mode')
}

export const supabase = globalThis.supabaseClient || createClient(finalUrl, finalKey, clientConfig)

// Сохраняем глобальную ссылку для предотвращения дубликатов
globalThis.supabaseClient = supabase

// Функция для проверки аутентификации
export const isAuthenticated = async () => {
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
