<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1>🏨 ShiftWork KZ</h1>
        <p>Работа в HoReCa сфере Казахстана</p>
      </div>

      <!-- Статус авторизации -->
      <div class="auth-status">
        <div v-if="isLoading" class="loading">
          <div class="spinner"></div>
          <p>Проверяем авторизацию...</p>
        </div>

        <div v-else-if="authError" class="error">
          <p>❌ Ошибка авторизации</p>
          <p class="error-message">{{ authError }}</p>
          <button @click="retryAuth" class="retry-btn">Попробовать ещё раз</button>
        </div>

        <div v-else-if="!isAuthenticated" class="login-form">
          <h2>Вход через Telegram</h2>
          <p>Для продолжения необходимо авторизоваться</p>
          
          <!-- Информация о Telegram Web App -->
          <div class="telegram-info">
            <p><strong>Telegram Web App:</strong> {{ isTelegramWebApp ? 'ДА ✅' : 'НЕТ ❌' }}</p>
            <p v-if="isTelegramWebApp"><strong>User ID:</strong> {{ telegramUser?.id || 'не найден' }}</p>
            <p v-if="isTelegramWebApp"><strong>Username:</strong> {{ telegramUser?.username || 'не указан' }}</p>
          </div>

          <!-- Кнопка авторизации -->
          <button 
            @click="loginWithTelegram" 
            :disabled="!isTelegramWebApp"
            class="login-btn"
          >
            {{ isTelegramWebApp ? 'Войти через Telegram' : 'Откройте в Telegram' }}
          </button>

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
          <p>Добро пожаловать, {{ user?.username || user?.first_name || 'пользователь' }}!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'

export default {
  name: 'AuthPage',
  emits: ['authenticated'],
  setup(props, { emit }) {
    const isLoading = ref(true)
    const isAuthenticated = ref(false)
    const authError = ref(null)
    const user = ref(null)
    const isTelegramWebApp = ref(false)
    const telegramUser = ref(null)
    const showDebug = ref(false)

    const debugInfo = computed(() => {
      return {
        window_Telegram: !!window.Telegram,
        webApp: !!window.Telegram?.WebApp,
        initData: window.Telegram?.WebApp?.initData || 'нет',
        user: telegramUser.value,
        platform: window.Telegram?.WebApp?.platform || 'неизвестно'
      }
    })

    // Проверка Telegram Web App
    const checkTelegramWebApp = () => {
      try {
        console.log('🔍 Проверяем Telegram Web App')
        
        if (typeof window === 'undefined') {
          console.log('❌ Window не найден')
          return false
        }

        if (!window.Telegram) {
          console.log('❌ Telegram объект не найден')
          return false
        }

        if (!window.Telegram.WebApp) {
          console.log('❌ Telegram WebApp не найден')
          return false
        }

        const webApp = window.Telegram.WebApp
        console.log('✅ Telegram WebApp найден:', webApp)

        if (!webApp.initData) {
          console.log('⚠️ initData пустой')
          return false
        }

        // Парсим данные пользователя
        const urlParams = new URLSearchParams(webApp.initData)
        const userParam = urlParams.get('user')
        
        if (userParam) {
          try {
            const parsedUser = JSON.parse(decodeURIComponent(userParam))
            telegramUser.value = parsedUser
            console.log('✅ Пользователь Telegram:', parsedUser)
            return true
          } catch (e) {
            console.error('❌ Ошибка парсинга пользователя:', e)
            return false
          }
        }

        return false
      } catch (error) {
        console.error('❌ Ошибка проверки Telegram:', error)
        return false
      }
    }

    // Авторизация через Telegram
    const loginWithTelegram = async () => {
      try {
        isLoading.value = true
        authError.value = null

        console.log('🚀 Начинаем авторизацию через Telegram')
        
        if (!telegramUser.value) {
          throw new Error('Данные пользователя Telegram не найдены')
        }

        // Отправляем запрос на сервер
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-simple-auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            user: telegramUser.value,
            initData: window.Telegram.WebApp.initData
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Ошибка сервера: ${response.status} ${errorText}`)
        }

        const result = await response.json()
        console.log('✅ Ответ сервера:', result)

        if (result.error) {
          throw new Error(result.error)
        }

        // Успешная авторизация
        user.value = result.user
        isAuthenticated.value = true
        
        // Сохраняем в localStorage для последующих сессий
        localStorage.setItem('shiftwork_user', JSON.stringify(result.user))
        
        console.log('🎉 Авторизация успешна!')
        
        // Уведомляем родительский компонент
        emit('authenticated', result.user)

      } catch (error) {
        console.error('❌ Ошибка авторизации:', error)
        authError.value = error.message
      } finally {
        isLoading.value = false
      }
    }

    // Повторная попытка авторизации
    const retryAuth = () => {
      authError.value = null
      checkAuth()
    }

    // Проверка существующей авторизации
    const checkAuth = async () => {
      try {
        isLoading.value = true
        console.log('🔍 Проверяем существующую авторизацию')

        // Проверяем localStorage
        const savedUser = localStorage.getItem('shiftwork_user')
        if (savedUser) {
          try {
            user.value = JSON.parse(savedUser)
            isAuthenticated.value = true
            console.log('✅ Найден сохранённый пользователь:', user.value)
            emit('authenticated', user.value)
            return
          } catch (e) {
            console.log('❌ Ошибка парсинга сохранённого пользователя')
            localStorage.removeItem('shiftwork_user')
          }
        }

        // Проверяем Telegram Web App
        isTelegramWebApp.value = checkTelegramWebApp()
        
        if (!isTelegramWebApp.value) {
          console.log('⚠️ Не в Telegram Web App, авторизация недоступна')
        }

      } catch (error) {
        console.error('❌ Ошибка проверки авторизации:', error)
        authError.value = error.message
      } finally {
        isLoading.value = false
      }
    }

    onMounted(() => {
      console.log('🚀 AuthPage смонтирован')
      checkAuth()
    })

    return {
      isLoading,
      isAuthenticated,
      authError,
      user,
      isTelegramWebApp,
      telegramUser,
      showDebug,
      debugInfo,
      loginWithTelegram,
      retryAuth
    }
  }
}
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

.retry-btn, .login-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
}

.retry-btn:hover, .login-btn:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
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
