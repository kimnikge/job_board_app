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
      try {
        console.log('🚀 App.vue mounted - простая версия')
        
        // Проверяем Telegram Web App
        const isTelegramWebApp = !!(window.Telegram?.WebApp?.initData)
        console.log('📱 Telegram Web App:', isTelegramWebApp)
        
        if (isTelegramWebApp) {
          console.log('📱 В Telegram Web App - попытка авторизации')
          
          try {
            // Динамический импорт для безопасности
            const telegramAuthModule = await import('./services/telegram-auth.js')
            const telegramAuth = telegramAuthModule.default
            
            const authData = telegramAuth.getAuthData()
            
            if (authData && !authStore.isAuthenticated) {
              console.log('👤 Данные для авторизации получены')
              
              const result = await authStore.loginWithWebApp(authData)
              
              if (result.success || (result.data && result.data.success)) {
                console.log('✅ Авторизация успешна!')
                
                // Перенаправляем на главную если на странице авторизации
                if (window.location.pathname === '/auth' || window.location.pathname === '/telegram-required') {
                  window.location.href = '/'
                }
              } else {
                console.error('❌ Ошибка авторизации:', result.error)
              }
            }
          } catch (authError) {
            console.error('❌ Ошибка при авторизации:', authError)
          }
        } else {
          console.log('🌐 Обычный браузер')
          
          // Перенаправляем на telegram-required если не в демо режиме
          const forceDemoMode = localStorage.getItem('force-demo-mode') === 'true'
          
          if (!forceDemoMode && window.location.pathname !== '/telegram-required' && window.location.pathname !== '/auth') {
            console.log('📝 Перенаправление на /telegram-required')
            window.location.href = '/telegram-required'
          }
        }
        
        // Инициализируем store
        if (authStore?.init) {
          authStore.init()
        }
        
        console.log('✅ Инициализация завершена')
        
      } catch (error) {
        console.error('💥 Критическая ошибка в App.vue:', error)
      }
    })

    return {}
  }
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.page-content {
  flex: 1;
  padding-bottom: 80px; /* Место для нижней навигации */
}
</style>
