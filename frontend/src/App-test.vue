<template>
  <div id="app">
    <h1>🚀 Тест приложения</h1>
    <p>Если вы видите этот текст, приложение работает!</p>
    <p>Текущий путь: {{ $route.path }}</p>
    <p>Telegram Web App: {{ isTelegramWebApp ? 'ДА' : 'НЕТ' }}</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    const isTelegramWebApp = ref(false)

    onMounted(() => {
      console.log('🚀 Простой App.vue загружен')
      isTelegramWebApp.value = !!(window.Telegram?.WebApp?.initData)
      console.log('📱 Telegram Web App:', isTelegramWebApp.value)
    })

    return {
      isTelegramWebApp
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  padding: 20px;
  background: #1a1a2e;
  color: white;
  font-family: Arial, sans-serif;
}

h1 {
  color: #4CAF50;
  text-align: center;
}

p {
  margin: 10px 0;
  font-size: 18px;
}
</style>
