// ✨ ЧИСТАЯ АВТОРИЗАЦИЯ ЧЕРЕЗ TELEGRAM 
import { supabase } from './supabase.js'
import { notificationsService } from './notifications.service.js'
import { profileService } from './profile.service.js'

// 🔐 Авторизация через Telegram
export const authService = {
  // ГЛАВНАЯ ФУНКЦИЯ: Вход через Telegram
  async loginWithTelegram(telegramData) {
    try {
      console.log('🔧 loginWithTelegram called with:', telegramData)

      // Вызываем Edge Function для обработки Telegram Login
      console.log('🔧 Calling Edge Function telegram-login with data:', telegramData)
      
      // Добавляем флаг что это Telegram Web App
      if (window.Telegram && window.Telegram.WebApp) {
        telegramData.is_web_app = true
        telegramData.init_data = window.Telegram.WebApp.initData
        console.log('🔧 Telegram Web App detected, init_data:', telegramData.init_data)
      }
      
      // Делаем прямой HTTP запрос к Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      // Используем anon key для обычных запросов
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      console.log('🔧 Calling Edge Function:', `${supabaseUrl}/functions/v1/telegram-login`)
      console.log('🔧 Request payload:', JSON.stringify(telegramData, null, 2))
      
      const response = await fetch(`${supabaseUrl}/functions/v1/telegram-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey
        },
        body: JSON.stringify(telegramData)
      })

      console.log('🔧 Response status:', response.status)
      console.log('🔧 Response headers:', Object.fromEntries(response.headers.entries()))
      
      const result = await response.json()
      console.log('🔧 Edge Function response:', { response: result, status: response.status })

      if (!response.ok) {
        throw new Error(result.error || 'Edge Function failed')
      }

      const data = result

      // После успешной авторизации создаем/обновляем профиль в БД
      if (data?.user) {
        console.log('✅ Авторизация успешна, создаем профиль в БД...')
        try {
          const { data: profile, error: profileError } = await profileService.createOrUpdateProfile(data.user)
          if (profileError) {
            console.warn('⚠️ Ошибка создания профиля (не критично):', profileError)
          } else {
            console.log('✅ Профиль успешно создан/обновлен:', profile)
            // Дополняем данные пользователя информацией из профиля
            if (profile) {
              data.user.profile = profile
            }
          }
        } catch (profileError) {
          console.warn('⚠️ Ошибка при работе с профилем:', profileError)
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Telegram login error:', error)
      return { data: null, error }
    }
  },

  // Выход
  async logout() {
    try {
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

  // Авторизация через Telegram Web App (правильный способ)
  async loginWithWebApp(webAppData) {
    try {
      console.log('📱 Авторизация через Telegram Web App:', webAppData)
      
      // Используем простую Edge Function  
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      console.log('🔧 Простая авторизация Telegram')
      
      const response = await fetch(`${supabaseUrl}/functions/v1/telegram-simple-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey
        },
        body: JSON.stringify(webAppData)
      })

      console.log('🔧 Response status:', response.status)
      const result = await response.json()
      console.log('🔧 Edge Function response:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Telegram Web App authentication failed')
      }

      // После успешной авторизации создаем/обновляем профиль в БД
      if (result?.user) {
        console.log('✅ Web App авторизация успешна, создаем профиль в БД...')
        try {
          const { data: profile, error: profileError } = await profileService.createOrUpdateProfile(result.user)
          if (profileError) {
            console.warn('⚠️ Ошибка создания профиля (не критично):', profileError)
          } else {
            console.log('✅ Профиль успешно создан/обновлен:', profile)
            // Дополняем данные пользователя информацией из профиля
            if (profile) {
              result.user.profile = profile
            }
          }
        } catch (profileError) {
          console.warn('⚠️ Ошибка при работе с профилем:', profileError)
        }
      }

      return { data: result, error: null }
      
    } catch (error) {
      console.error('Telegram Web App login error:', error)
      return { data: null, error }
    }
  },

  // Авторизация через URL токен (Telegram URL Authorization)
  async loginWithURLToken(token, additionalData = {}) {
    try {
      console.log('🔗 Авторизация через URL токен:', token)
      
      // Отправляем токен на backend для валидации
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      const response = await fetch(`${supabaseUrl}/functions/v1/telegram-url-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey
        },
        body: JSON.stringify({ 
          autologin_token: token,
          ...additionalData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'URL authentication failed')
      }

      const result = await response.json()
      return { data: result, error: null }
      
    } catch (error) {
      console.error('URL token login error:', error)
      return { data: null, error }
    }
  },

  // Подписка на изменения авторизации
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

console.log('✅ Auth service initialized (Telegram Login only)')
