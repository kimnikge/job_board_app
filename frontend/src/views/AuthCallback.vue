<template>
  <div class="auth-callback">
    <div class="loading" v-if="isLoading">
      <div class="spinner"></div>
      <p>Завершаем авторизацию...</p>
    </div>
    
    <div class="error" v-if="error">
      <h2>Ошибка авторизации</h2>
      <p>{{ error }}</p>
      <button @click="redirectToLogin" class="btn btn-primary">
        Попробовать снова
      </button>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'AuthCallback',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const isLoading = ref(true)
    const error = ref(null)

    onMounted(async () => {
      try {
        // Получаем параметры из URL
        const urlParams = new URLSearchParams(window.location.search)
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')
        
        if (accessToken) {
          // Устанавливаем токены в auth store
          await authStore.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          // Перенаправляем на главную страницу
          router.push('/')
        } else {
          throw new Error('Не получены токены авторизации')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        error.value = err.message || 'Произошла ошибка при авторизации'
      } finally {
        isLoading.value = false
      }
    })

    const redirectToLogin = () => {
      router.push('/auth')
    }

    return {
      isLoading,
      error,
      redirectToLogin
    }
  }
}
</script>

<style scoped>
.auth-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.loading, .error {
  text-align: center;
  max-width: 400px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error h2 {
  color: #dc3545;
  margin-bottom: 15px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  margin-top: 15px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}
</style>
