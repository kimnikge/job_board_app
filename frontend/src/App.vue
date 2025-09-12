<template>
  <div id="app">
    <!-- Страница авторизации -->
    <AuthPage 
      v-if="!isAuthenticated" 
      @authenticated="onAuthenticated"
    />
    
    <!-- Основное приложение -->
    <MainApp 
      v-else 
      :user="currentUser"
      @logout="onLogout"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import AuthPage from './components/AuthPage.vue'
import MainApp from './components/MainApp.vue'

export default {
  name: 'App',
  components: {
    AuthPage,
    MainApp
  },
  setup() {
    const isAuthenticated = ref(false)
    const currentUser = ref(null)

    // Обработка успешной авторизации
    const onAuthenticated = (user) => {
      console.log('✅ Пользователь авторизован:', user)
      currentUser.value = user
      isAuthenticated.value = true
    }

    // Обработка выхода из системы
    const onLogout = () => {
      console.log('👋 Выход из системы')
      currentUser.value = null
      isAuthenticated.value = false
    }

    // Проверка сохранённой авторизации при загрузке
    onMounted(() => {
      try {
        console.log('🚀 App.vue загружается')
        
        const savedUser = localStorage.getItem('shiftwork_user')
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser)
            onAuthenticated(user)
            console.log('✅ Найден сохранённый пользователь')
          } catch (e) {
            console.log('❌ Ошибка парсинга сохранённого пользователя')
            localStorage.removeItem('shiftwork_user')
          }
        }
      } catch (error) {
        console.error('❌ Ошибка инициализации App:', error)
      }
    })

    return {
      isAuthenticated,
      currentUser,
      onAuthenticated,
      onLogout
    }
  }
}
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
</style>
