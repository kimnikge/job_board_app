<template>
  <div id="app">
    <!-- Загрузка авторизации -->
    <div v-if="authLoading" class="auth-loading">
      <div class="spinner"></div>
      <p>Загрузка...</p>
    </div>
    
    <!-- Telegram Required страница для обычных браузеров -->
    <router-view v-else-if="!isTelegramWebApp && !isDemoMode" />
    
    <!-- Основное приложение через router -->
    <router-view v-else />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'
import WebApp from '@twa-dev/sdk'

const authStore = useAuthStore()
const router = useRouter()

// Состояние загрузки
const authLoading = ref(true)
const isTelegramWebApp = ref(false)

// Demo режим из localStorage или env
const isDemoMode = computed(() => {
  return localStorage.getItem('force-demo-mode') === 'true' ||
         import.meta.env.VITE_USE_DEMO_MODE === 'true'
})

// Проверка Telegram Web App среды
const checkTelegramWebApp = () => {
  try {
    // Инициализируем Telegram Web App
    WebApp.ready()
    
    // Проверяем наличие данных пользователя
    const hasUser = WebApp.initDataUnsafe?.user
    const hasInitData = WebApp.initData
    
    console.log('🔍 Telegram Web App check:', {
      hasUser: !!hasUser,
      hasInitData: !!hasInitData,
      platform: WebApp.platform,
      version: WebApp.version
    })
    
    return hasUser || hasInitData
  } catch (error) {
    console.log('❌ Not in Telegram Web App:', error.message)
    return false
  }
}

// Автоматическая авторизация в Telegram Web App
const autoAuthInTelegram = async () => {
  try {
    if (!isTelegramWebApp.value) return false
    
    // Получаем данные пользователя из Telegram
    const telegramUser = WebApp.initDataUnsafe?.user
    if (!telegramUser) {
      console.log('❌ Нет данных пользователя в Telegram Web App')
      return false
    }
    
    console.log('🚀 Автоматическая авторизация в Telegram Web App:', telegramUser)
    
    // Используем auth store для авторизации
    const result = await authStore.loginWithWebApp(telegramUser)
    
    if (result.success) {
      console.log('✅ Автоматическая авторизация успешна')
      // Перенаправляем на главную страницу
      router.push('/')
      return true
    } else {
      console.error('❌ Автоматическая авторизация не удалась:', result.error)
      return false
    }
  } catch (error) {
    console.error('❌ Ошибка автоматической авторизации:', error)
    return false
  }
}

// Инициализация приложения
const initApp = async () => {
  try {
    console.log('🚀 Инициализация App.vue')
    
    // Инициализируем auth store
    authStore.init()
    
    // Проверяем среду выполнения
    isTelegramWebApp.value = checkTelegramWebApp()
    
    console.log('🔍 Среда выполнения:', {
      isTelegramWebApp: isTelegramWebApp.value,
      isDemoMode: isDemoMode.value,
      currentPath: router.currentRoute.value.path
    })
    
    // Если не в Telegram Web App и не demo режим, перенаправляем
    if (!isTelegramWebApp.value && !isDemoMode.value) {
      console.log('🔄 Перенаправление на /telegram-required')
      router.push('/telegram-required')
      return
    }
    
    // Проверяем существующую авторизацию
    await authStore.fetchUser()
    
    // Если пользователь не авторизован и мы в Telegram Web App
    if (!authStore.isAuthenticated && isTelegramWebApp.value) {
      console.log('👤 Пользователь не авторизован, пробуем автоматическую авторизацию')
      await autoAuthInTelegram()
    }
    
    // Если пользователь не авторизован и мы в demo режиме
    if (!authStore.isAuthenticated && isDemoMode.value) {
      console.log('🎭 Demo режим, перенаправляем на /auth')
      router.push('/auth')
    }
    
    console.log('✅ Инициализация завершена')
  } catch (error) {
    console.error('❌ Ошибка инициализации App:', error)
    // В случае критической ошибки показываем страницу ошибки
    router.push('/error')
  } finally {
    authLoading.value = false
  }
}

onMounted(initApp)
</script>

<style>
/* Глобальные стили */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

#app {
  min-height: 100vh;
}

/* Убираем стили скрола для мобильных */
html, body {
  overflow-x: hidden;
}

/* Анимации переходов */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Стили загрузки авторизации */
.auth-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.auth-loading p {
  font-size: 18px;
  font-weight: 500;
}
</style>
