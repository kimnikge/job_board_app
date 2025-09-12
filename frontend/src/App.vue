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
import { telegramURLAuth } from '@/utils/telegram-url-auth.js'
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
        
        // Инициализируем Telegram Web App с официальным SDK
        const initSuccess = telegramWebApp.init()
        
        if (initSuccess) {
          // Применяем цветовую схему Job Board
          telegramWebApp.applyJobBoardTheme()
          
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
                
                // Перенаправляем на главную страницу, если находимся на странице авторизации
                const currentPath = window.location.pathname
                if (currentPath === '/auth' || currentPath === '/telegram-required') {
                  window.location.href = '/'
                }
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
        // Перенаправляем на страницу с инструкцией для Telegram
        if (window.location.pathname !== '/telegram-required') {
          window.location.href = '/telegram-required'
        }
      }

      // Инициализируем Telegram URL авторизацию
      telegramURLAuth.init()
      
      // Подписываемся на события URL авторизации
      window.addEventListener('telegram-url-auth', async (event) => {
        console.log('🔗 Получено событие URL авторизации:', event.detail)
        
        if (!authStore.isAuthenticated) {
          try {
            // Попытка автоматической авторизации через URL токен
            console.log('🔑 Попытка авторизации через URL токен...')
            
            const result = await authStore.loginWithURLToken(event.detail.token, {
              timestamp: event.detail.timestamp,
              url_auth: true
            })
            
            if (result.success) {
              console.log('✅ URL авторизация успешна!')
              
              if (telegramWebApp.isTelegramWebApp()) {
                telegramWebApp.haptic('light')
                telegramWebApp.showAlert('✅ Авторизация через URL выполнена!')
              } else {
                alert('✅ Авторизация через URL выполнена!')
              }
              
              // Перенаправляем на главную страницу
              setTimeout(() => {
                window.location.href = '/'
              }, 2000)
              
            } else {
              console.error('❌ Ошибка URL авторизации:', result.error)
              
              if (telegramWebApp.isTelegramWebApp()) {
                telegramWebApp.showAlert('❌ Ошибка авторизации через URL: ' + result.error)
              } else {
                alert('❌ Ошибка авторизации через URL: ' + result.error)
              }
            }
            
          } catch (error) {
            console.error('❌ Исключение при URL авторизации:', error)
          }
        }
      })
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