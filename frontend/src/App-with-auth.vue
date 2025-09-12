<template>
  <div id="app">
    <!-- Авторизация или главная страница -->
    <component :is="currentComponent" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import AuthPage from './components/AuthPage.vue'
import MainPage from './components/MainPage.vue'

export default {
  name: 'App',
  components: {
    AuthPage,
    MainPage
  },
  setup() {
    const currentComponent = ref('AuthPage')
    const isAuthenticated = ref(false)
    
    onMounted(() => {
      try {
        console.log('🚀 App с авторизацией')
        
        // Проверяем авторизацию
        checkAuth()
        
      } catch (error) {
        console.error('Ошибка при запуске:', error)
      }
    })
    
    const checkAuth = () => {
      try {
        // Простая проверка - есть ли сохраненный пользователь
        const savedUser = localStorage.getItem('telegram_user')
        if (savedUser) {
          isAuthenticated.value = true
          currentComponent.value = 'MainPage'
          console.log('✅ Пользователь уже авторизован')
        } else {
          currentComponent.value = 'AuthPage'
          console.log('🔑 Нужна авторизация')
        }
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error)
        currentComponent.value = 'AuthPage'
      }
    }

    return {
      currentComponent
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  background: #1a1a2e;
  color: white;
  font-family: Arial, sans-serif;
}
</style>
