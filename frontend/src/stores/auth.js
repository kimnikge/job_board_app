import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ✨ УПРОЩЕННЫЙ AUTH STORE - СОГЛАСНО ПЛАНУ
// Будет полностью реализован в ЭТАПЕ 3

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  
  const isAuthenticated = computed(() => !!user.value)
  
  // Загрузка пользователя (заглушка)
  const fetchUser = async () => {
    // ВРЕМЕННО: заглушка для роутера
    // В ЭТАПЕ 3 будет реальная логика с Supabase
    console.log('🔄 Загрузка пользователя (заглушка)')
  }
  
  // Вход (заглушка)
  const login = async (credentials) => {
    console.log('🔑 Логин (заглушка)', credentials)
  }
  
  // Выход (заглушка) 
  const logout = async () => {
    console.log('👋 Выход (заглушка)')
    user.value = null
  }
  
  return {
    user,
    isAuthenticated,
    fetchUser,
    login,
    logout
  }
})
