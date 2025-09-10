<template>
  <div class="auth-page">
    <div class="auth-page__container">
      <div class="auth-page__logo">
        <h1 class="auth-page__title">ShiftworkKZ</h1>
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

      <div class="auth-page__instructions">
        <div class="instruction-card">
          <h3>💡 Как войти в приложение</h3>
          <p>Для авторизации нажмите кнопку <strong>"Войти через Telegram"</strong> в верхней части экрана</p>
          <div class="arrow-up">
            ↗️ Кнопка находится в правом верхнем углу
          </div>
        </div>
      </div>

      <div class="auth-page__info">
        <h3>Что произойдет после авторизации:</h3>
        <ul>
          <li>✅ Автоматическое создание профиля (если вход первый)</li>
          <li>✅ Подтягивание данных из Telegram (имя, фото, username)</li>
          <li>✅ Доступ к вакансиям и функционалу платформы</li>
          <li>✅ Получение уведомлений о новых вакансиях</li>
        </ul>
      </div>

      <!-- Состояние загрузки -->
      <div v-if="loading" class="auth-page__loading">
        <div class="loading-spinner"></div>
        <p>Авторизация через Telegram...</p>
      </div>

      <!-- Ошибка -->
      <div v-if="error" class="auth-page__error">
        <p>{{ error }}</p>
        <button @click="clearError" class="retry-btn">Попробовать снова</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Состояние компонента
const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)

const clearError = () => {
  authStore.clearError()
}

// Проверяем, не авторизован ли уже пользователь
if (authStore.isAuthenticated) {
  router.push('/')
}
</script>

const showSuccess = (title, message) => {
  notificationsStore.addNotification({
    type: 'success',
    title,
    message
  })
}

const showError = (title, message) => {
  notificationsStore.addNotification({
    type: 'error',
    title,
    message
  })
}

const clearError = () => {
  authStore.clearError()
}

// Обработчик успешной авторизации Telegram
const onTelegramAuth = async (userData) => {
  console.log('🔧 onTelegramAuth called with:', userData)
  
  try {
    console.log('🔧 Calling authStore.loginWithTelegram...')
    const result = await authStore.loginWithTelegram(userData)
    console.log('🔧 Auth result:', result)
    
    if (result.success) {
      console.log('🔧 Login successful!')
      showSuccess(
        'Добро пожаловать!', 
        `Привет, ${userData.first_name}! Вы успешно авторизованы через Telegram`
      )
      
      // Перенаправление на страницу, с которой пользователь пришел, или на главную
      const redirect = route.query.redirect || '/'
      console.log('🔧 Redirecting to:', redirect)
      router.push(redirect)
    } else {
      console.log('🔧 Login failed:', result.error)
      showError('Ошибка авторизации', result.error || 'Не удалось войти через Telegram')
    }
  } catch (error) {
    console.error('🔧 Auth error:', error)
    showError('Ошибка авторизации', 'Произошла ошибка при авторизации')
  }
}

// Fallback авторизация (для разработки/тестирования)
const handleFallbackLogin = async () => {
  console.log('🔧 Fallback login clicked!')
  console.log('🔧 Demo mode:', isDemoMode)
  console.log('🔧 Widget loaded:', telegramWidgetLoaded.value)
  
  const demoTelegramData = {
    id: 123456789,
    first_name: 'Demo',
    last_name: 'User',
    username: 'demouser',
    photo_url: 'https://via.placeholder.com/150',
    auth_date: Math.floor(Date.now() / 1000),
    hash: 'demo_hash_for_testing'
  }
  
  console.log('🔧 Demo data:', demoTelegramData)
  await onTelegramAuth(demoTelegramData)
}

// Авторизация через Telegram Web App (для Mini App)
const handleTelegramWebAppLogin = async () => {
  console.log('🔧 Telegram Web App login started')
  
  if (!window.Telegram?.WebApp) {
    console.error('Telegram Web App not available')
    showError('Ошибка', 'Приложение должно быть открыто в Telegram')
    return
  }
  
  try {
    const webApp = window.Telegram.WebApp
    const initData = webApp.initData
    
    if (!initData) {
      console.error('No init data from Telegram')
      showError('Ошибка', 'Не удалось получить данные от Telegram')
      return
    }
    
    console.log('🔧 Telegram Web App init data:', initData)
    
    // Парсим данные от Telegram Web App
    const urlParams = new URLSearchParams(initData)
    const userParam = urlParams.get('user')
    
    if (!userParam) {
      console.error('No user data in init data')
      showError('Ошибка', 'Не удалось получить данные пользователя')
      return
    }
    
    const userData = JSON.parse(userParam)
    console.log('🔧 Telegram user data:', userData)
    
    // Добавляем дополнительные данные для валидации
    const telegramData = {
      id: userData.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.username,
      photo_url: userData.photo_url,
      auth_date: Math.floor(Date.now() / 1000),
      hash: urlParams.get('hash') || 'telegram_web_app_hash'
    }
    
    await onTelegramAuth(telegramData)
    
  } catch (error) {
    console.error('🔧 Telegram Web App auth error:', error)
    showError('Ошибка авторизации', 'Произошла ошибка при авторизации через Telegram')
  }
}

// Загрузка Telegram Login Widget
const loadTelegramWidget = () => {
  try {
    // Проверяем, загружен ли скрипт Telegram
    if (window.TelegramLoginWidget) {
      createTelegramWidget()
      return
    }

    // Создаем скрипт для загрузки Telegram Login Widget
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://telegram.org/js/telegram-widget.js?19'
    script.setAttribute('data-telegram-login', TELEGRAM_BOT_USERNAME)
    script.setAttribute('data-size', WIDGET_CONFIG.size)
    script.setAttribute('data-corner-radius', WIDGET_CONFIG.corner_radius)
    script.setAttribute('data-request-access', WIDGET_CONFIG.request_access)
    script.setAttribute('data-userpic', WIDGET_CONFIG.userpic)
    script.setAttribute('data-lang', WIDGET_CONFIG.lang)
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')

    // Устанавливаем глобальную функцию для callback
    window.onTelegramAuth = onTelegramAuth

    script.onload = () => {
      console.log('Telegram widget script loaded')
      telegramWidgetLoaded.value = true
    }

    script.onerror = () => {
      console.error('Failed to load Telegram widget script')
      telegramWidgetLoaded.value = false
    }

    // Добавляем скрипт в контейнер
    if (telegramContainer.value) {
      telegramContainer.value.appendChild(script)
    }
  } catch (error) {
    console.error('Error loading Telegram widget:', error)
    telegramWidgetLoaded.value = false
  }
}

// Альтернативный способ создания виджета
const createTelegramWidget = () => {
  if (telegramContainer.value && window.TelegramLoginWidget) {
    window.TelegramLoginWidget.create(telegramContainer.value, {
      bot_id: TELEGRAM_BOT_USERNAME,
      ...WIDGET_CONFIG,
      callback: onTelegramAuth
    })
    telegramWidgetLoaded.value = true
  }
}

onMounted(() => {
  // Проверяем, не авторизован ли уже пользователь
  if (authStore.isAuthenticated) {
    router.push('/')
    return
  }

  // Если мы в Telegram Mini App - инициализируем Telegram Web App
  if (isTelegramMiniApp) {
    console.log('🔧 Initializing Telegram Web App...')
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
      console.log('🔧 Telegram Web App initialized')
    }
    return
  }

  // Загружаем Telegram Widget только для внешних сайтов и не в demo режиме
  if (!isDemoMode && !isTelegramMiniApp) {
    console.log('🔧 Loading Telegram Login Widget for external site...')
    loadTelegramWidget()
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
  max-width: 420px;
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
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
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

.auth-page__telegram-login {
  margin: 2rem 0;
}

.auth-page__telegram-widget {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.auth-page__fallback {
  width: 100%;
}

.telegram-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background: #0088cc;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.telegram-login-btn:hover {
  background: #006699;
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(0, 136, 204, 0.3);
}

.telegram-mini-app-btn {
  background: linear-gradient(135deg, #0088cc 0%, #006699 100%);
  font-size: 1.1rem;
  padding: 1.2rem 1.5rem;
  position: relative;
  overflow: hidden;
}

.telegram-mini-app-btn:hover {
  background: linear-gradient(135deg, #006699 0%, #004466 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 136, 204, 0.4);
}

.telegram-mini-app-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.telegram-mini-app-btn:hover::before {
  left: 100%;
}

.auth-page__mini-app-note {
  font-size: 0.9rem;
  color: #0088cc;
  margin: 0.5rem 0 0 0;
  font-weight: 500;
  text-align: center;
}

.auth-page__security-note {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.auth-page__info {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: left;
  margin-top: 2rem;
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
  margin-top: 1rem;
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
}
</style>
