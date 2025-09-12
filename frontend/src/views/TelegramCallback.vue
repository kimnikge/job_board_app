<template>
  <div class="telegram-callback">
    <div class="container">
      <div class="callback-info">
        <h1>🔐 Обработка Telegram авторизации</h1>
        <p>Обрабатываем данные от Telegram...</p>
      </div>
      
      <div class="status">
        <div v-if="processing" class="processing">
          <div class="spinner"></div>
          <p>Проверяем данные авторизации...</p>
        </div>
        
        <div v-if="error" class="error">
          <h3>❌ Ошибка</h3>
          <p>{{ error }}</p>
          <button @click="goHome" class="btn">На главную</button>
        </div>
        
        <div v-if="success" class="success">
          <h3>✅ Успех!</h3>
          <p>Авторизация завершена. Перенаправляем...</p>
        </div>
      </div>
      
      <div class="debug-info">
        <h3>🔧 Debug информация</h3>
        <pre>{{ JSON.stringify(debugInfo, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const processing = ref(true)
const success = ref(false)
const error = ref(null)
const debugInfo = ref({})

const goHome = () => {
  router.push('/')
}

onMounted(async () => {
  try {
    // Получаем параметры из URL query
    const urlParams = new URLSearchParams(window.location.search)
    const telegramData = {}
    
    // Извлекаем все параметры Telegram
    for (const [key, value] of urlParams.entries()) {
      telegramData[key] = value
    }
    
    debugInfo.value = {
      urlParams: Object.fromEntries(urlParams.entries()),
      telegramData
    }
    
    // Проверяем наличие обязательных данных
    if (!telegramData.id || !telegramData.auth_date || !telegramData.hash) {
      throw new Error(`Отсутствуют обязательные параметры Telegram. Получено: ${JSON.stringify(telegramData)}`)
    }
    
    // Преобразуем id в число
    telegramData.id = parseInt(telegramData.id)
    telegramData.auth_date = parseInt(telegramData.auth_date)
    
    console.log('🔐 Processing Telegram callback with data:', telegramData)
    
    // Вызываем авторизацию через auth store
    const result = await authStore.loginWithTelegram(telegramData)
    
    if (result.success || !result.error) {
      success.value = true
      processing.value = false
      
      // Через 2 секунды перенаправляем на главную
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      throw new Error(result.error || 'Неизвестная ошибка авторизации')
    }
    
  } catch (err) {
    console.error('Telegram callback error:', err)
    error.value = err.message
    processing.value = false
  }
})
</script>

<style scoped>
.telegram-callback {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 1rem;
}

.callback-info p {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.processing {
  text-align: center;
  padding: 2rem 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0088cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 1rem;
  background: #f8d7da;
  border-radius: 8px;
  color: #721c24;
  margin-bottom: 2rem;
}

.success {
  text-align: center;
  padding: 1rem;
  background: #d4edda;
  border-radius: 8px;
  color: #155724;
  margin-bottom: 2rem;
}

.btn {
  background: #0088cc;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

.btn:hover {
  background: #0077bb;
}

.debug-info {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
  margin-top: 2rem;
}

.debug-info h3 {
  color: #666;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.debug-info pre {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 1rem;
  font-size: 0.8rem;
  color: #333;
  overflow-x: auto;
}
</style>
