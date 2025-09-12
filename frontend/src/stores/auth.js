import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/auth.service.js'

// ✨ AUTH STORE СОГЛАСНО ТЗ: ЕДИНСТВЕННЫЙ СПОСОБ ВХОДА - TELEGRAM LOGIN
export const useAuthStore = defineStore('auth', () => {
  // Состояние
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // Геттеры
  const isAuthenticated = computed(() => !!user.value)
  const userType = computed(() => user.value?.user_metadata?.user_type || null)
  const isCandidate = computed(() => userType.value === 'candidate')
  const isEmployer = computed(() => userType.value === 'employer')
  const isAdmin = computed(() => userType.value === 'admin')
  
  // Действия
  const fetchUser = async () => {
    try {
      const { data, error } = await authService.getCurrentUser()
      
      // Игнорируем ошибки отсутствия сессии - это нормально для неавторизованных
      if (error && !error.message?.includes('Auth session missing')) {
        console.error('Ошибка загрузки пользователя:', error)
      }
      
      user.value = data?.user || null
    } catch (err) {
      console.error('Ошибка загрузки пользователя:', err)
      user.value = null
    }
  }

  // Алиас для fetchUser (для совместимости)
  const checkAuth = fetchUser
  
  // ГЛАВНАЯ ФУНКЦИЯ: Авторизация через Telegram
  const loginWithTelegram = async (telegramData) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: authError } = await authService.loginWithTelegram(telegramData)
      
      if (authError) throw authError
      
      user.value = data?.user || null
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }
  
  const logout = async () => {
    try {
      loading.value = true
      const { error: logoutError } = await authService.logout()
      if (logoutError) throw logoutError
      user.value = null
      error.value = null
    } catch (err) {
      console.error('Ошибка выхода:', err)
    } finally {
      loading.value = false
    }
  }

  // Устанавливаем сессию (для callback от Telegram)
  const setSession = async (sessionData) => {
    try {
      loading.value = true
      
      // Используем authService для установки сессии
      const { data, error } = await authService.setSession(sessionData)
      
      if (error) throw error
      
      user.value = data?.user || null
      error.value = null
      
      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('Ошибка установки сессии:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }
  
  // Очистка ошибок
  const clearError = () => {
    error.value = null
  }

  // Инициализация
  const init = () => {
    // Слушаем изменения авторизации через сервис
    authService.onAuthStateChange((event, session) => {
      user.value = session?.user || null
      if (event === 'SIGNED_OUT') {
        user.value = null
      }
    })
    
    // Загружаем текущего пользователя
    fetchUser()
  }

  return {
    // Состояние
    user,
    loading,
    error,
    
    // Геттеры
    isAuthenticated,
    userType,
    isCandidate,
    isEmployer,
    isAdmin,
    
    // Действия
    fetchUser,
    checkAuth,
    loginWithTelegram,
    logout,
    setSession,
    clearError,
    init
  }
})
