// ✨ БАЗОВАЯ КОНФИГУРАЦИЯ SUPABASE - ЭТАП 4.1.1
import { createClient } from '@supabase/supabase-js'

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

// Создаем клиент даже с demo данными для предотвращения ошибок
export const supabase = createClient(finalUrl, finalKey)

// Флаг для определения demo режима
export const isDemoMode = forceDemoEnv || !supabaseUrl || !supabaseAnonKey

// Базовые настройки для всех запросов
export const DEFAULT_SELECT = '*'
export const DEFAULT_LIMIT = 50

console.log('✅ Supabase service initialized:', { 
  url: finalUrl, 
  isDemoMode,
  forceDemoEnv
})
