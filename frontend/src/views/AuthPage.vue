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

      <div class="auth-page__telegram-login">
        <div class="auth-page__telegram-widget">
          <!-- Telegram Login Widget для production -->
          <div v-if="!isDemoMode" id="telegram-login-container" ref="telegramContainer"></div>
          
          <!-- Fallback кнопка для demo режима -->
          <div v-if="isDemoMode" class="auth-page__fallback">
            <button class="telegram-login-btn" @click="handleFallbackLogin">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L9.864 13.63l-2.915-.918c-.635-.2-.658-.635.132-.94L17.822 7.14c.529-.2.992.13.823.781z"/>
              </svg>
              Войти через Telegram (Demo)
            </button>
          </div>
        </div>
        
        <p class="auth-page__security-note">
          🔒 Безопасный вход через официальный API Telegram
        </p>
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
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

// Состояние компонента
const telegramContainer = ref(null)
const telegramWidgetLoaded = ref(false)
const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)

// Проверяем demo режим
const isDemoMode = import.meta.env.VITE_USE_DEMO_MODE === 'true'

console.log('🔧 AuthPage mounted with:', {
  isDemoMode,
  VITE_USE_DEMO_MODE: import.meta.env.VITE_USE_DEMO_MODE,
  TELEGRAM_BOT_USERNAME: import.meta.env.VITE_TELEGRAM_BOT_USERNAME
})

// Конфигурация Telegram Widget
const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'ShiftworkKZBot' // Замените на ваш бот
const WIDGET_CONFIG = {
  size: 'large',
  corner_radius: 20,
  request_access: 'write',
  userpic: true,
  lang: 'ru'
}

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

  // Загружаем Telegram Widget только в production
  if (!isDemoMode) {
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
