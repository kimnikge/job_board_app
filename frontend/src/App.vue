<template>
  <div id="app">
    <!-- Header для всех страниц -->
    <AppHeader />
    
    <!-- Основной контент -->
    <main class="page-content">
      <router-view />
    </main>
    
    <!-- Нижняя навигация для всех страниц -->
    <BottomNavigation />
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import { telegramWebApp } from '@/utils/telegram-web-app.js'
import { useAuthStore } from '@/stores/auth.js'
import { onMounted } from 'vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    BottomNavigation
  },
  setup() {
    const authStore = useAuthStore()

    onMounted(async () => {
      console.log('🚀 App.vue mounted')
      
      // Проверяем если мы в Telegram Web App
      if (telegramWebApp.isTelegramWebApp()) {
        console.log('📱 Обнаружен Telegram Web App')
        
        // Инициализируем Telegram Web App
        const initSuccess = telegramWebApp.init()
        
        if (initSuccess) {
          // Получаем данные пользователя
          const userData = telegramWebApp.getUserData()
          
          if (userData && !authStore.isAuthenticated) {
            console.log('👤 Автоматическая авторизация через Telegram Web App')
            console.log('📊 User data:', userData)
            
            try {
              const result = await authStore.loginWithTelegram(userData)
              if (result.success) {
                console.log('✅ Автоматическая авторизация успешна!')
                telegramWebApp.haptic('light')
              } else {
                console.error('❌ Ошибка авторизации:', result.error)
                telegramWebApp.showAlert('Ошибка авторизации: ' + result.error)
              }
            } catch (error) {
              console.error('❌ Исключение при авторизации:', error)
              telegramWebApp.showAlert('Произошла ошибка при входе в приложение')
            }
          }
        }
      } else {
        console.log('🌐 Обычный браузер (не Telegram Web App)')
      }
    })
  }
}
</script>

<style>
/* === Глобальные стили приложения === */
#app {
  position: relative;
  background-color: var(--bg-page);
  min-height: 100vh;
}

/* === Отступы под навигацию === */
.page-content {
  margin-top: var(--header-height);
  margin-bottom: var(--nav-height);
  min-height: calc(100vh - var(--header-height) - var(--nav-height));
}
</style>