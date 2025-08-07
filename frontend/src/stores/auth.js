import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

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
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      user.value = currentUser
    } catch (err) {
      console.error('Ошибка загрузки пользователя:', err)
      user.value = null
    }
  }
  
  const login = async (credentials) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })
      
      if (authError) throw authError
      
      user.value = data.user
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
      
      const { data, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            user_type: credentials.userType,
            full_name: credentials.fullName
          }
        }
      })
      
      if (authError) throw authError
      
      user.value = data.user
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
      await supabase.auth.signOut()
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
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email)
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
    // Слушаем изменения авторизации
    supabase.auth.onAuthStateChange((event, session) => {
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
