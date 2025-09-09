// ✨ API АВТОРИЗАЦИИ СОГЛАСНО ТЗ: ЕДИНСТВЕННЫЙ СПОСОБ ВХОДА - TELEGRAM LOGIN
import { supabase, isDemoMode } from './supabase.js'
import { notificationsService } from './notifications.service.js'

// 🔐 Авторизация через Telegram
export const authService = {
  // ГЛАВНАЯ ФУНКЦИЯ: Вход через Telegram
  async loginWithTelegram(telegramData) {
    try {
      if (isDemoMode) {
        // Demo режим - сохраняем пользователя в localStorage
        const demoUser = {
          id: `demo-user-${telegramData.id}`,
          user_metadata: { 
            user_type: 'candidate', 
            full_name: telegramData.first_name + (telegramData.last_name ? ' ' + telegramData.last_name : ''),
            telegram_id: telegramData.id,
            telegram_username: telegramData.username,
            telegram_photo_url: telegramData.photo_url
          }
        }
        
        // Сохраняем сессию в localStorage
        localStorage.setItem('demo-session', JSON.stringify(demoUser))
        
        return {
          data: { user: demoUser },
          error: null
        }
      }

      // Вызываем Edge Function для обработки Telegram Login
      const { data, error } = await supabase.functions.invoke('telegram-login', {
        body: telegramData // Передаем данные напрямую
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Telegram login error:', error)
      return { data: null, error }
    }
  },

  // Выход
  async logout() {
    try {
      if (isDemoMode) {
        // В demo режиме просто удаляем сессию из localStorage
        localStorage.removeItem('demo-session')
        return { error: null }
      }

      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('Logout error:', error)
      return { error }
    }
  },

  // Получение текущего пользователя
  async getCurrentUser() {
    try {
      if (isDemoMode) {
        // В demo режиме тоже требуем авторизацию!
        // Проверяем есть ли сохраненная сессия в localStorage
        const savedSession = localStorage.getItem('demo-session')
        if (savedSession) {
          return {
            data: {
              user: JSON.parse(savedSession)
            },
            error: null
          }
        }
        
        // Если нет сессии - пользователь не авторизован
        return {
          data: { user: null },
          error: null
        }
      }

      const { data, error } = await supabase.auth.getUser()
      
      // В production режиме AuthSessionMissingError это нормально - пользователь не авторизован
      if (error && error.message.includes('Auth session missing')) {
        return {
          data: { user: null },
          error: null
        }
      }
      
      return { data, error }
    } catch (error) {
      console.error('Get user error:', error)
      return { data: null, error }
    }
  },

  // Установка сессии (для callback от Telegram)
  async setSession(sessionData) {
    try {
      if (isDemoMode) {
        return {
          data: {
            user: {
              id: 'demo-user',
              user_metadata: { 
                user_type: 'candidate', 
                full_name: 'Demo User',
                telegram_id: 123456789,
                telegram_username: 'demouser'
              }
            }
          },
          error: null
        }
      }

      const { data, error } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token
      })
      
      return { data, error }
    } catch (error) {
      console.error('Set session error:', error)
      return { data: null, error }
    }
  },

  // Подписка на изменения авторизации
  onAuthStateChange(callback) {
    if (isDemoMode) {
      // В demo режиме не автоматически авторизуем, пользователь должен нажать кнопку
      // Проверяем сохраненную сессию
      const savedSession = localStorage.getItem('demo-session')
      if (savedSession) {
        callback('SIGNED_IN', { user: JSON.parse(savedSession) })
      }
      return { data: { subscription: { unsubscribe: () => {} } } }
    }

    return supabase.auth.onAuthStateChange(callback)
  }
}

console.log('✅ Auth service initialized (Telegram Login only)')
