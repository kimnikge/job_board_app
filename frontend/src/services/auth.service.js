// ✨ API АВТОРИЗАЦИИ - ЭТАП 4.1.2
import { supabase, isDemoMode } from './supabase.js'

// 🔐 Авторизация и регистрация
export const authService = {
  // Вход в систему
  async login(email, password) {
    try {
      if (isDemoMode) {
        // Demo режим - возвращаем фиктивного пользователя
        return {
          data: {
            user: {
              id: 'demo-user',
              email: email,
              user_metadata: { user_type: 'candidate', full_name: 'Demo User' }
            }
          },
          error: null
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      return { data, error }
    } catch (error) {
      console.error('Login error:', error)
      return { data: null, error }
    }
  },

  // Регистрация
  async register(email, password, userData) {
    try {
      if (isDemoMode) {
        // Demo режим
        return {
          data: {
            user: {
              id: 'demo-user-new',
              email: email,
              user_metadata: userData
            }
          },
          error: null
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      return { data, error }
    } catch (error) {
      console.error('Register error:', error)
      return { data: null, error }
    }
  },

  // Выход
  async logout() {
    try {
      if (isDemoMode) {
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
        return {
          data: {
            user: {
              id: 'demo-user',
              email: 'demo@example.com',
              user_metadata: { user_type: 'candidate', full_name: 'Demo User' }
            }
          },
          error: null
        }
      }

      const { data, error } = await supabase.auth.getUser()
      return { data, error }
    } catch (error) {
      console.error('Get user error:', error)
      return { data: null, error }
    }
  },

  // Сброс пароля
  async resetPassword(email) {
    try {
      if (isDemoMode) {
        return { error: null }
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email)
      return { error }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error }
    }
  },

  // Подписка на изменения авторизации
  onAuthStateChange(callback) {
    if (isDemoMode) {
      // В demo режиме просто вызываем callback с demo данными
      callback('SIGNED_IN', {
        user: {
          id: 'demo-user',
          email: 'demo@example.com',
          user_metadata: { user_type: 'candidate', full_name: 'Demo User' }
        }
      })
      return { data: { subscription: { unsubscribe: () => {} } } }
    }

    return supabase.auth.onAuthStateChange(callback)
  }
}

console.log('✅ Auth service initialized')
