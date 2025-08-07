/**
 * 🗄️ НАСТРОЙКА SUPABASE ДЛЯ МОДУЛЬНОЙ АРХИТЕКТУРЫ
 * 
 * Центральная конфигурация Supabase с поддержкой модулей
 */

import { createClient } from '@supabase/supabase-js'
import { moduleEvents, SYSTEM_EVENTS } from '../events/moduleEvents.js'

// Настройки Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not found in environment variables')
  throw new Error('Missing Supabase configuration')
}

/**
 * 🔧 СОЗДАНИЕ КЛИЕНТА SUPABASE
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

/**
 * 🔐 ОБРАБОТЧИКИ АВТОРИЗАЦИИ
 */

// Слушаем изменения состояния авторизации
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔐 Auth state changed:', event, session?.user?.email)
  
  // Отправляем события через модульную систему
  switch (event) {
    case 'SIGNED_IN':
      moduleEvents.emit(SYSTEM_EVENTS.USER_LOGIN, {
        user: session.user,
        session
      })
      break
      
    case 'SIGNED_OUT':
      moduleEvents.emit(SYSTEM_EVENTS.USER_LOGOUT)
      break
      
    case 'TOKEN_REFRESHED':
      console.log('🔄 Token refreshed')
      break
      
    case 'USER_UPDATED':
      moduleEvents.emit(SYSTEM_EVENTS.USER_PROFILE_UPDATED, {
        user: session.user
      })
      break
  }
})

/**
 * 🛠️ HELPER ФУНКЦИИ ДЛЯ РАБОТЫ С API
 */

/**
 * Выполнить запрос с обработкой ошибок
 * @param {Function} queryFn - Функция запроса
 * @param {string} operation - Название операции для логирования
 */
export async function executeQuery(queryFn, operation = 'query') {
  try {
    moduleEvents.emit(SYSTEM_EVENTS.LOADING_START, { operation })
    
    const result = await queryFn()
    
    if (result.error) {
      console.error(`❌ ${operation} failed:`, result.error)
      throw result.error
    }
    
    console.log(`✅ ${operation} completed successfully`)
    return result.data
    
  } catch (error) {
    console.error(`💥 ${operation} error:`, error)
    throw error
  } finally {
    moduleEvents.emit(SYSTEM_EVENTS.LOADING_END, { operation })
  }
}

/**
 * Получить текущего пользователя
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('❌ Error getting current user:', error)
    return null
  }
  
  return user
}

/**
 * Проверить, авторизован ли пользователь
 */
export function isAuthenticated() {
  const session = supabase.auth.getSession()
  return !!session?.data?.session?.user
}

/**
 * Получить текущую сессию
 */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('❌ Error getting session:', error)
    return null
  }
  
  return data.session
}

/**
 * 📡 REAL-TIME ПОДПИСКИ
 */

/**
 * Подписаться на изменения в таблице
 * @param {string} table - Название таблицы
 * @param {Function} callback - Функция обратного вызова
 * @param {Object} options - Опции подписки
 */
export function subscribeToTable(table, callback, options = {}) {
  const { filter, event = '*' } = options
  
  let subscription = supabase
    .channel(`public:${table}`)
    .on('postgres_changes', 
      { 
        event, 
        schema: 'public', 
        table,
        filter 
      }, 
      callback
    )
    .subscribe()
  
  console.log(`📡 Subscribed to table: ${table}`)
  
  // Возвращаем функцию отписки
  return () => {
    subscription.unsubscribe()
    console.log(`📡 Unsubscribed from table: ${table}`)
  }
}

/**
 * Подписаться на срочные вакансии
 * @param {Function} callback - Функция обратного вызова
 */
export function subscribeToUrgentJobs(callback) {
  return subscribeToTable('urgent_jobs', (payload) => {
    console.log('🚨 Urgent job change:', payload)
    
    // Отправляем событие через модульную систему
    if (payload.eventType === 'INSERT') {
      moduleEvents.emit(SYSTEM_EVENTS.URGENT_JOB_CREATED, payload.new)
    }
    
    callback(payload)
  })
}

/**
 * Подписаться на обычные вакансии
 * @param {Function} callback - Функция обратного вызова
 */
export function subscribeToJobs(callback) {
  return subscribeToTable('jobs', (payload) => {
    console.log('💼 Job change:', payload)
    
    if (payload.eventType === 'INSERT') {
      moduleEvents.emit(SYSTEM_EVENTS.JOB_CREATED, payload.new)
    }
    
    callback(payload)
  })
}

/**
 * 🔍 ПОИСКОВЫЕ ФУНКЦИИ
 */

/**
 * Полнотекстовый поиск
 * @param {string} table - Таблица для поиска
 * @param {string} column - Колонка для поиска
 * @param {string} query - Поисковый запрос
 * @param {Object} options - Дополнительные опции
 */
export async function fullTextSearch(table, column, query, options = {}) {
  const { select = '*', limit = 50 } = options
  
  return executeQuery(
    () => supabase
      .from(table)
      .select(select)
      .textSearch(column, query, {
        type: 'websearch',
        config: 'russian'
      })
      .limit(limit),
    `Full-text search in ${table}`
  )
}

/**
 * 🔢 СТАТИСТИЧЕСКИЕ ФУНКЦИИ
 */

/**
 * Получить количество записей в таблице
 * @param {string} table - Название таблицы
 * @param {Object} filters - Фильтры
 */
export async function getCount(table, filters = {}) {
  let query = supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
  
  // Применяем фильтры
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value)
  })
  
  const { count, error } = await query
  
  if (error) {
    console.error(`❌ Error getting count for ${table}:`, error)
    throw error
  }
  
  return count
}

/**
 * 📊 ФУНКЦИИ ДЛЯ АНАЛИТИКИ
 */

/**
 * Получить статистику по срочным вакансиям
 */
export async function getUrgentJobsStats() {
  return executeQuery(
    () => supabase.rpc('get_urgent_jobs_stats'),
    'Get urgent jobs statistics'
  )
}

/**
 * Получить статистику по обычным вакансиям
 */
export async function getJobsStats() {
  return executeQuery(
    () => supabase.rpc('get_jobs_stats'),
    'Get jobs statistics'
  )
}

console.log('🗄️ Supabase client configured for modular architecture!')
