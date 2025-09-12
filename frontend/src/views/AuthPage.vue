<template>
  <div class="auth-page">
    <div class="auth-page__container">
      <div class="auth-page__logo">
        <h1 class="auth-page__title">
          <span class="logo-text">Shiftwork</span>
          <span class="beta-badge">BETA</span>
        </h1>
        <p class="auth-page__subtitle">Первая в Казахстане платформа мгновенных смен</p>
      </div>

      <div class="auth-page__description">
        <p class="auth-page__main-text">
          🚀 <strong>Найди работу в своем городе за 5 минут</strong>
        </p>
        <ul class="auth-page__benefits">
          <li>📱 Мгновенные уведомления о работе рядом с домом</li>
          <li>💰 Быстрая оплата сразу после смены</li>
          <li>⚡ От уведомления до начала работы — 30 минут</li>
        </ul>
      </div>

      <!-- Состояние загрузки -->
      <div v-if="authStore.loading" class="auth-page__loading">
        <div class="loading-spinner"></div>
        <p>Авторизация через Telegram...</p>
      </div>

      <!-- Ошибка -->
      <div v-else-if="authStore.error" class="auth-page__error">
        <p>❌ {{ authStore.error }}</p>
        <button @click="retryAuth" class="retry-btn">Попробовать снова</button>
      </div>

      <!-- Формы авторизации -->
      <div v-else-if="!authStore.isAuthenticated" class="auth-page__auth-section">
        
        <!-- Информация о среде -->
        <div class="auth-page__info-card">
          <h3>🔍 Информация о среде</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Telegram Web App:</span>
              <span class="value" :class="{ 'success': isTelegramWebApp, 'error': !isTelegramWebApp }">
                {{ isTelegramWebApp ? 'ДА ✅' : 'НЕТ ❌' }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">Demo Mode:</span>
              <span class="value" :class="{ 'success': isDemoMode, 'warning': !isDemoMode }">
                {{ isDemoMode ? 'ДА 🎭' : 'НЕТ 🔒' }}
              </span>
            </div>
            <div v-if="isTelegramWebApp && telegramUser" class="info-item">
              <span class="label">User ID:</span>
              <span class="value">{{ telegramUser.id }}</span>
            </div>
            <div v-if="isTelegramWebApp && telegramUser" class="info-item">
              <span class="label">Username:</span>
              <span class="value">{{ telegramUser.username || 'не указан' }}</span>
            </div>
          </div>
        </div>

        <!-- Кнопки авторизации -->
        <div class="auth-page__actions">
          <button 
            @click="handleLogin" 
            :disabled="!canLogin || authStore.loading"
            class="auth-btn"
            :class="{ 'auth-btn--disabled': !canLogin }"
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
        </div>

        <!-- Инструкции -->
        <div class="auth-page__instructions">
          <div class="instruction-card">
            <h3>💡 Как использовать приложение</h3>
            <div v-if="!isTelegramWebApp && !isDemoMode">
              <p>Откройте это приложение через <strong>Telegram Web App</strong> для полного функционала</p>
              <p>Или включите <strong>Demo Mode</strong> для тестирования</p>
            </div>
            <div v-else-if="isDemoMode">
              <p>Вы используете <strong>Demo Mode</strong> - нажмите кнопку выше для входа с тестовыми данными</p>
            </div>
            <div v-else>
              <p>Нажмите кнопку <strong>"Войти через Telegram"</strong> для авторизации</p>
            </div>
          </div>
        </div>

        <!-- Что произойдет после авторизации -->
        <div class="auth-page__info">
          <h3>Что произойдет после авторизации:</h3>
          <ul>
            <li>✅ Автоматическое создание профиля (если вход первый)</li>
            <li>✅ Подтягивание данных из Telegram (имя, фото, username)</li>
            <li>✅ Доступ к вакансиям и функционалу платформы</li>
            <li>✅ Получение уведомлений о новых вакансиях</li>
          </ul>
        </div>

        <!-- Отладочная информация -->
        <div class="debug-section" v-if="showDebug">
          <h4>🔧 Отладочная информация:</h4>
          <pre class="debug-info">{{ debugInfo }}</pre>
        </div>
        <button @click="showDebug = !showDebug" class="debug-toggle">
          {{ showDebug ? '🔼 Скрыть отладку' : '🔽 Показать отладку' }}
        </button>
      </div>

      <!-- Успешная авторизация -->
      <div v-else class="auth-page__success">
        <div class="success-icon">✅</div>
        <h3>Добро пожаловать!</h3>
        <p>{{ authStore.user?.user_metadata?.full_name || authStore.user?.user_metadata?.first_name || 'Пользователь' }}</p>
        <p>Перенаправляем на главную страницу...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import WebApp from '@twa-dev/sdk'

const router = useRouter()
const authStore = useAuthStore()

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
  if (authStore.loading) return '🔄 Авторизация...'
  if (!canLogin.value) return '❌ Откройте в Telegram'
  if (isDemoMode.value) return '🎭 Войти в Demo режиме'
  return '🚀 Войти через Telegram'
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
    canLogin: canLogin.value,
    authStore: {
      isAuthenticated: authStore.isAuthenticated,
      loading: authStore.loading,
      error: authStore.error,
      user: authStore.user
    }
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
        setTimeout(() => router.push('/'), 1500) // Небольшая задержка для показа успеха
      }
    } else if (isTelegramWebApp.value && telegramUser.value) {
      // Telegram Web App авторизация
      console.log('🚀 Telegram Web App авторизация')
      
      const result = await authStore.loginWithWebApp(telegramUser.value)
      
      if (result.success) {
        console.log('✅ Telegram авторизация успешна')
        setTimeout(() => router.push('/'), 1500) // Небольшая задержка для показа успеха
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
  console.log('🚀 AuthPage (views) смонтирован')
  
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
  padding: 1rem;
}

.auth-page__container {
  width: 100%;
  max-width: 500px;
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.auth-page__logo {
  margin-bottom: 2rem;
}

.auth-page__title {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
  position: relative;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.logo-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.beta-badge {
  position: absolute;
  top: -8px;
  right: -20px;
  font-size: 0.6rem;
  font-weight: 700;
  color: #fff;
  background: #ef4444;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.auth-page__subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.auth-page__description {
  margin-bottom: 2rem;
}

.auth-page__main-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.auth-page__benefits {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.auth-page__benefits li {
  padding: 0.5rem 0;
  color: #475569;
  font-size: 0.9rem;
}

.auth-page__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.auth-page__error {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.retry-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.retry-btn:hover {
  background: #b91c1c;
}

/* Новые стили для функциональности авторизации */
.auth-page__auth-section {
  margin: 2rem 0;
}

.auth-page__info-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.auth-page__info-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #1e293b;
}

.info-grid {
  display: grid;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
}

.label {
  font-weight: 500;
  color: #475569;
}

.value {
  font-family: monospace;
  font-size: 0.9rem;
}

.value.success {
  color: #059669;
  font-weight: 600;
}

.value.error {
  color: #dc2626;
  font-weight: 600;
}

.value.warning {
  color: #d97706;
  font-weight: 600;
}

.auth-page__actions {
  margin: 1.5rem 0;
}

.auth-btn {
  width: 100%;
  background: #667eea;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s;
  margin-bottom: 1rem;
}

.auth-btn:hover:not(.auth-btn--disabled) {
  background: #5a6fd8;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.auth-btn--disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
}

.demo-section {
  margin: 1rem 0;
  padding: 1rem;
  background: #ecfdf5;
  border-radius: 8px;
  border-left: 4px solid #10b981;
}

.demo-section p {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #065f46;
}

.demo-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
}

.demo-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

.auth-page__instructions {
  margin: 1.5rem 0;
}

.instruction-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px dashed #0088cc;
  text-align: center;
}

.instruction-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #1e293b;
}

.instruction-card p {
  margin: 0.5rem 0;
  color: #475569;
  font-size: 0.95rem;
}

.auth-page__info {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: left;
  margin: 1.5rem 0;
}

.auth-page__info h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #1e293b;
}

.auth-page__info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.auth-page__info li {
  padding: 0.25rem 0;
  font-size: 0.9rem;
  color: #475569;
}

.auth-page__success {
  text-align: center;
  padding: 2rem;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.auth-page__success h3 {
  color: #059669;
  margin: 0 0 1rem 0;
}

.auth-page__success p {
  color: #475569;
  margin: 0.5rem 0;
}

.debug-section {
  margin: 1rem 0;
  padding: 1rem;
  background: #f1f5f9;
  border-radius: 8px;
  text-align: left;
}

.debug-section h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #334155;
}

.debug-info {
  background: #1e293b;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  overflow-x: auto;
  margin: 0;
}

.debug-toggle {
  background: #e2e8f0;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #475569;
  margin: 1rem 0;
}

.debug-toggle:hover {
  background: #cbd5e1;
}

/* Мобильная адаптация */
@media (max-width: 480px) {
  .auth-page {
    padding: 0.5rem;
  }
  
  .auth-page__container {
    padding: 1.5rem;
  }
  
  .auth-page__title {
    font-size: 2rem;
  }
  
  .beta-badge {
    font-size: 0.5rem;
    padding: 1px 4px;
    right: -15px;
    top: -6px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .auth-btn {
    font-size: 1rem;
    padding: 0.875rem 1.5rem;
  }
}
</style>
