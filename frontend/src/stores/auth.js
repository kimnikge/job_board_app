import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/auth.service.js'

// ✨ УПРОЩЕННЫЙ AUTH STORE - СОГЛАСНО ПЛАНУ ЭТАПА 3
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
  
  // Действия
  const fetchUser = async () => {
    try {
      const { data, error } = await authService.getCurrentUser()
      if (error) throw error
      
      user.value = data?.user || null
    } catch (err) {
      console.error('Ошибка загрузки пользователя:', err)
      user.value = null
    }
  }
  
  const login = async (credentials) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: authError } = await authService.login(
        credentials.email,
        credentials.password
      )
      
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
  
  const register = async (credentials) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: authError } = await authService.register(
        credentials.email,
        credentials.password,
        {
          user_type: credentials.userType,
          full_name: credentials.fullName
        }
      )
      
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
  
  const resetPassword = async (email) => {
    try {
      loading.value = true
      error.value = null

      const { error: resetError } = await authService.resetPassword(email)
      if (resetError) throw resetError
      
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
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
    
    // Действия
    fetchUser,
    login,
    register,
    logout,
    resetPassword,
    init
  }
})
