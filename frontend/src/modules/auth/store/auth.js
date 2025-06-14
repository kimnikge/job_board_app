import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const isCompany = computed(() => user.value?.user_metadata?.user_type === 'company')
  const isSpecialist = computed(() => user.value?.user_metadata?.user_type === 'specialist')

  async function register({ email, password, user_type }) {
    loading.value = true
    error.value = null
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { user_type }
        }
      })
      if (signUpError) throw signUpError
      user.value = data.user
      return true
    } catch (err) {
      error.value = err.message || 'Ошибка регистрации'
      return false
    } finally {
      loading.value = false
    }
  }

  async function login({ email, password }) {
    loading.value = true
    error.value = null
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (loginError) throw loginError
      user.value = data.user
      return true
    } catch (err) {
      error.value = err.message || 'Ошибка входа'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    router.push('/auth/login')
  }

  async function fetchUser() {
    const { data, error: userError } = await supabase.auth.getUser()
    if (userError) {
      user.value = null
      return
    }
    user.value = data.user
  }

  function setUser(userData) {
    user.value = userData
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isCompany,
    isSpecialist,
    register,
    login,
    logout,
    fetchUser,
    setUser
  }
})