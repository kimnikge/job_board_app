// useAuth.js — логика авторизации
import { ref } from 'vue'
import { authService } from '@/services/auth.service.js'

export function useAuth() {
  const user = ref(null)
  const error = ref(null)

  async function login(email, password) {
    const { data, error: err } = await authService.login(email, password)
    user.value = data?.user || null
    error.value = err
    return { user: user.value, error: error.value }
  }

  async function logout() {
    user.value = null
    // Можно добавить вызов сервиса
  }

  return { user, error, login, logout }
}
