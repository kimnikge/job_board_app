<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1>🏨 ShiftWork KZ</h1>
        <p>Работа в HoReCa сфере Казахстана</p>
      </div>

      <!-- Статус авторизации -->
      <div class="auth-status">
        <div v-if="authStore.loading" class="loading">
          <div class="spinner"></div>
          <p>Проверяем авторизацию...</p>
        </div>

        <div v-else-if="authStore.error" class="error">
          <p>❌ Ошибка авторизации</p>
          <p class="error-message">{{ authStore.error }}</p>
          <button @click="retryAuth" class="retry-btn">Попробовать ещё раз</button>
        </div>

        <div v-else-if="!authStore.isAuthenticated" class="login-form">
          <h2>Вход через Telegram</h2>
          <p>Для продолжения необходимо авторизоваться</p>
          
          <!-- Информация о Telegram Web App -->
          <div class="telegram-info">
            <p><strong>Telegram Web App:</strong> {{ isTelegramWebApp ? 'ДА ✅' : 'НЕТ ❌' }}</p>
            <p><strong>Demo Mode:</strong> {{ isDemoMode ? 'ДА 🎭' : 'НЕТ 🔒' }}</p>
            <p v-if="isTelegramWebApp && telegramUser"><strong>User ID:</strong> {{ telegramUser.id }}</p>
            <p v-if="isTelegramWebApp && telegramUser"><strong>Username:</strong> {{ telegramUser.username || 'не указан' }}</p>
          </div>

          <!-- Кнопка авторизации -->
          <button 
            @click="handleLogin" 
            :disabled="!canLogin || authStore.loading"
            class="login-btn"
          >
            {{ loginButtonText }}
          </button>

          <!-- Demo режим кнопка -->
          <div v-if="!isDemoMode" class="demo-section">
            <p>Для разработчиков:</p>
            <button @click="enableDemoMode" class="demo-btn">
              🎭 Включить Demo Mode
            </button>
          </div>

          <!-- Отладочная информация -->
          <div class="debug-info" v-if="showDebug">
            <h3>Отладка:</h3>
            <pre>{{ debugInfo }}</pre>
          </div>
          <button @click="showDebug = !showDebug" class="debug-toggle">
            {{ showDebug ? 'Скрыть отладку' : 'Показать отладку' }}
          </button>
        </div>

        <div v-else class="success">
          <p>✅ Авторизация прошла успешно!</p>
          <p>Добро пожаловать, {{ authStore.user?.user_metadata?.full_name || authStore.user?.user_metadata?.first_name || 'пользователь' }}!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import WebApp from '@twa-dev/sdk'

const authStore = useAuthStore()
const router = useRouter()

const isTelegramWebApp = ref(false)
const telegramUser = ref(null)
const showDebug = ref(false)

// Demo режим
const isDemoMode = computed(() => {
  return localStorage.getItem('force-demo-mode') === 'true' ||
         import.meta.env.VITE_USE_DEMO_MODE === 'true'
})

// Можно ли авторизоваться
const canLogin = computed(() => {
  return isTelegramWebApp.value || isDemoMode.value
})

// Текст кнопки
const loginButtonText = computed(() => {
  if (authStore.loading) return 'Авторизация...'
  if (!canLogin.value) return 'Откройте в Telegram'
  if (isDemoMode.value) return 'Войти в Demo режиме'
  return 'Войти через Telegram'
})

const debugInfo = computed(() => {
  return {
    sdk_available: !!WebApp,
    initDataUnsafe: WebApp?.initDataUnsafe,
    user: telegramUser.value,
    platform: WebApp?.platform,
    version: WebApp?.version,
    isExpanded: WebApp?.isExpanded,
    colorScheme: WebApp?.colorScheme,
    isDemoMode: isDemoMode.value,
    canLogin: canLogin.value
  }
})

// Проверка Telegram Web App
const checkTelegramWebApp = () => {
  try {
    console.log('🔍 Проверяем Telegram Web App через SDK')
    
    if (!WebApp) return false
    
    // Инициализируем WebApp
    WebApp.ready()
    
    console.log('✅ SDK готов к работе')
    console.log('📱 Platform:', WebApp.platform)
    console.log('🎨 Color Scheme:', WebApp.colorScheme)
    console.log('📊 Version:', WebApp.version)
    
    // Проверяем данные пользователя
    if (WebApp.initDataUnsafe?.user) {
      const user = WebApp.initDataUnsafe.user
      telegramUser.value = user
      console.log('✅ Пользователь найден через SDK:', user)
      return true
    }
    
    console.log('⚠️ Пользователь не найден в initDataUnsafe')
    
    // Дополнительная проверка через initData
    if (WebApp.initData) {
      console.log('📋 InitData доступен:', WebApp.initData.length, 'символов')
      
      // Парсим через URLSearchParams
      const urlParams = new URLSearchParams(WebApp.initData)
      const userParam = urlParams.get('user')
      
      if (userParam) {
        try {
          const parsedUser = JSON.parse(decodeURIComponent(userParam))
          telegramUser.value = parsedUser
          console.log('✅ Пользователь найден через initData:', parsedUser)
          return true
        } catch (e) {
          console.error('❌ Ошибка парсинга пользователя:', e)
        }
      }
    }

    console.log('❌ Данные пользователя не найдены')
    return false
    
  } catch (error) {
    console.error('❌ Ошибка SDK:', error)
    return false
  }
}

// Авторизация
const handleLogin = async () => {
  try {
    authStore.clearError()
    
    if (isDemoMode.value) {
      // Demo авторизация
      console.log('🎭 Demo авторизация')
      
      const demoUserData = {
        id: Date.now(),
        first_name: 'Demo',
        last_name: 'User',
        username: 'demouser',
        language_code: 'ru'
      }
      
      const result = await authStore.loginWithWebApp(demoUserData)
      
      if (result.success) {
        console.log('✅ Demo авторизация успешна')
        router.push('/')
      }
    } else if (isTelegramWebApp.value && telegramUser.value) {
      // Telegram Web App авторизация
      console.log('🚀 Telegram Web App авторизация')
      
      const result = await authStore.loginWithWebApp(telegramUser.value)
      
      if (result.success) {
        console.log('✅ Telegram авторизация успешна')
        router.push('/')
      }
    }
  } catch (error) {
    console.error('❌ Ошибка авторизации:', error)
  }
}

// Повторная попытка
const retryAuth = () => {
  authStore.clearError()
  checkTelegramWebApp()
}

// Включить demo режим
const enableDemoMode = () => {
  localStorage.setItem('force-demo-mode', 'true')
  window.location.reload()
}

onMounted(() => {
  console.log('🚀 AuthPage смонтирован')
  
  // Инициализируем auth store если еще не инициализирован
  if (!authStore.user) {
    authStore.init()
  }
  
  // Проверяем Telegram Web App
  isTelegramWebApp.value = checkTelegramWebApp()
  
  // Если уже авторизован, перенаправляем
  if (authStore.isAuthenticated) {
    console.log('✅ Пользователь уже авторизован, перенаправляем на главную')
    router.push('/')
  }
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
  text-align: center;
}

.auth-header h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 2.5em;
}

.auth-header p {
  color: #666;
  margin-bottom: 30px;
}

.loading {
  padding: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  padding: 20px;
  background: #fee;
  border-radius: 10px;
  margin-bottom: 20px;
}

.error-message {
  color: #c33;
  font-size: 14px;
  margin: 10px 0;
}

.retry-btn, .login-btn, .demo-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  margin: 5px;
}

.retry-btn:hover, .login-btn:hover, .demo-btn:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.demo-btn {
  background: #28a745;
}

.demo-btn:hover {
  background: #218838;
}

.demo-section {
  margin: 20px 0;
  padding: 15px;
  background: #e8f5e8;
  border-radius: 10px;
  border-left: 4px solid #28a745;
}

.telegram-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  margin: 20px 0;
  text-align: left;
}

.telegram-info p {
  margin: 5px 0;
  font-family: monospace;
  font-size: 14px;
}

.success {
  padding: 20px;
  background: #efe;
  border-radius: 10px;
  color: #363;
}

.debug-info {
  background: #f0f0f0;
  padding: 15px;
  border-radius: 10px;
  margin: 20px 0;
  text-align: left;
}

.debug-info pre {
  font-size: 12px;
  overflow-x: auto;
}

.debug-toggle {
  background: #eee;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 10px;
}
</style>
