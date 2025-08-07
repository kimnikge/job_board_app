/**
 * 🔐 КОМПОЗАБЛ ДЛЯ АВТОРИЗАЦИИ
 * 
 * Vue 3 композабл для работы с авторизацией через Supabase
 */

import { ref, computed, watch } from 'vue'
import { supabase, getCurrentUser, getCurrentSession } from '../core/api/supabaseClient.js'
import { moduleEvents, SYSTEM_EVENTS } from '../core/events/moduleEvents.js'

// Глобальное состояние авторизации
const user = ref(null)
const session = ref(null)
const loading = ref(true)
const error = ref(null)

/**
 * 🔐 ОСНОВНОЙ КОМПОЗАБЛ useAuth
 */
export function useAuth() {
  // Computed свойства
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.user_metadata?.role === 'admin')
  const isCompany = computed(() => user.value?.user_metadata?.role === 'company')
  const isSeeker = computed(() => user.value?.user_metadata?.role === 'seeker')
  
  const userProfile = computed(() => ({
    id: user.value?.id,
    email: user.value?.email,
    name: user.value?.user_metadata?.name || user.value?.email?.split('@')[0],
    role: user.value?.user_metadata?.role || 'seeker',
    avatar: user.value?.user_metadata?.avatar_url,
    phone: user.value?.user_metadata?.phone,
    created_at: user.value?.created_at
  }))

  /**
   * 🔄 ИНИЦИАЛИЗАЦИЯ
   */
  async function initialize() {
    try {
      loading.value = true
      error.value = null
      
      // Получаем текущую сессию
      const currentSession = await getCurrentSession()
      
      if (currentSession) {
        session.value = currentSession
        user.value = currentSession.user
        
        console.log('✅ User session restored:', user.value.email)
        
        // Отправляем событие о восстановлении сессии
        moduleEvents.emit(SYSTEM_EVENTS.AUTH_SESSION_RESTORED, {
          user: user.value,
          session: session.value
        })
      }
      
    } catch (err) {
      console.error('❌ Auth initialization error:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /**
   * 📧 ВХОД ПО EMAIL И ПАРОЛЮ
   */
  async function signIn(email, password) {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })
      
      if (signInError) {
        throw signInError
      }
      
      user.value = data.user
      session.value = data.session
      
      console.log('✅ User signed in:', user.value.email)
      
      return { success: true, user: user.value }
      
    } catch (err) {
      console.error('❌ Sign in error:', err)
      error.value = getAuthErrorMessage(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 📝 РЕГИСТРАЦИЯ
   */
  async function signUp(email, password, metadata = {}) {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            role: 'seeker',
            ...metadata
          }
        }
      })
      
      if (signUpError) {
        throw signUpError
      }
      
      // Если пользователь создан, но нужно подтверждение email
      if (data.user && !data.session) {
        return { 
          success: true, 
          user: data.user,
          needsConfirmation: true 
        }
      }
      
      user.value = data.user
      session.value = data.session
      
      console.log('✅ User signed up:', user.value.email)
      
      return { success: true, user: user.value }
      
    } catch (err) {
      console.error('❌ Sign up error:', err)
      error.value = getAuthErrorMessage(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 🚪 ВЫХОД
   */
  async function signOut() {
    try {
      loading.value = true
      error.value = null
      
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) {
        throw signOutError
      }
      
      user.value = null
      session.value = null
      
      console.log('✅ User signed out')
      
      return { success: true }
      
    } catch (err) {
      console.error('❌ Sign out error:', err)
      error.value = err.message
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 🔄 СБРОС ПАРОЛЯ
   */
  async function resetPassword(email) {
    try {
      loading.value = true
      error.value = null
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`
        }
      )
      
      if (resetError) {
        throw resetError
      }
      
      console.log('✅ Password reset email sent')
      
      return { success: true }
      
    } catch (err) {
      console.error('❌ Password reset error:', err)
      error.value = getAuthErrorMessage(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 🔐 ОБНОВЛЕНИЕ ПАРОЛЯ
   */
  async function updatePassword(newPassword) {
    try {
      loading.value = true
      error.value = null
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (updateError) {
        throw updateError
      }
      
      console.log('✅ Password updated')
      
      return { success: true }
      
    } catch (err) {
      console.error('❌ Password update error:', err)
      error.value = getAuthErrorMessage(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 👤 ОБНОВЛЕНИЕ ПРОФИЛЯ
   */
  async function updateProfile(updates) {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: updates
      })
      
      if (updateError) {
        throw updateError
      }
      
      user.value = data.user
      
      console.log('✅ Profile updated')
      
      return { success: true, user: user.value }
      
    } catch (err) {
      console.error('❌ Profile update error:', err)
      error.value = getAuthErrorMessage(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 📱 СОЦИАЛЬНАЯ АВТОРИЗАЦИЯ
   */
  async function signInWithProvider(provider) {
    try {
      loading.value = true
      error.value = null
      
      const { error: providerError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      })
      
      if (providerError) {
        throw providerError
      }
      
      return { success: true }
      
    } catch (err) {
      console.error(`❌ ${provider} sign in error:`, err)
      error.value = getAuthErrorMessage(err)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 🔍 ПРОВЕРКА РОЛИ
   */
  function hasRole(role) {
    if (Array.isArray(role)) {
      return role.includes(userProfile.value.role)
    }
    return userProfile.value.role === role
  }

  /**
   * 🛡️ ПРОВЕРКА РАЗРЕШЕНИЙ
   */
  function hasPermission(permission) {
    const rolePermissions = {
      admin: ['read', 'write', 'delete', 'manage'],
      company: ['read', 'write'],
      seeker: ['read']
    }
    
    const userRole = userProfile.value.role
    const permissions = rolePermissions[userRole] || []
    
    return permissions.includes(permission)
  }

  return {
    // Состояние
    user: computed(() => user.value),
    session: computed(() => session.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    
    // Computed свойства
    isAuthenticated,
    isAdmin,
    isCompany,
    isSeeker,
    userProfile,
    
    // Методы
    initialize,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    signInWithProvider,
    hasRole,
    hasPermission,
    
    // Utilities
    clearError: () => { error.value = null }
  }
}

/**
 * 🛠️ HELPER ФУНКЦИИ
 */

/**
 * Получить понятное сообщение об ошибке авторизации
 */
function getAuthErrorMessage(error) {
  const errorMessages = {
    'Invalid login credentials': 'Неверный email или пароль',
    'Email not confirmed': 'Email не подтвержден. Проверьте почту.',
    'Password should be at least 6 characters': 'Пароль должен содержать минимум 6 символов',
    'User already registered': 'Пользователь уже зарегистрирован',
    'Invalid email': 'Неверный формат email',
    'Signup requires a valid password': 'Для регистрации требуется корректный пароль',
    'Token has expired or is invalid': 'Токен истек или недействителен'
  }
  
  return errorMessages[error.message] || error.message || 'Произошла ошибка авторизации'
}

/**
 * 🔄 АВТОМАТИЧЕСКАЯ ИНИЦИАЛИЗАЦИЯ
 */

// Глобальная инициализация при загрузке модуля
let isInitialized = false

export async function initializeAuth() {
  if (isInitialized) return
  
  const auth = useAuth()
  await auth.initialize()
  
  isInitialized = true
  console.log('🔐 Auth system initialized')
}

/**
 * 🎯 КОМПОЗАБЛ ДЛЯ PROTECTED ROUTES
 */
export function useAuthGuard() {
  const auth = useAuth()
  
  function requireAuth() {
    if (!auth.isAuthenticated.value) {
      throw new Error('Authentication required')
    }
  }
  
  function requireRole(role) {
    requireAuth()
    if (!auth.hasRole(role)) {
      throw new Error(`Role ${role} required`)
    }
  }
  
  function requirePermission(permission) {
    requireAuth()
    if (!auth.hasPermission(permission)) {
      throw new Error(`Permission ${permission} required`)
    }
  }
  
  return {
    requireAuth,
    requireRole,
    requirePermission
  }
}

console.log('🔐 Auth composable ready!')
