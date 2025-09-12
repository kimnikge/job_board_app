<template>
  <div id="app">
    <!-- Диагностическая информация -->
    <div class="debug-info">
      <p>Telegram Web App: {{ isTelegramWebApp ? 'ДА' : 'НЕТ' }}</p>
    </div>
    
    <!-- Простой контент -->
    <main class="page-content">
      <div class="test-content">
        <h1>🎉 Приложение работает!</h1>
        <p>Тестовая страница без роутера и сложной логики</p>
        <p v-if="isTelegramWebApp">Вы в Telegram Web App!</p>
        <p v-else>Вы в обычном браузере</p>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    const isTelegramWebApp = ref(false)

    onMounted(() => {
      try {
        console.log('🚀 Минимальный App.vue')
        
        // Максимально простая проверка
        const hasTelegram = typeof window !== 'undefined' && window.Telegram
        const hasWebApp = hasTelegram && window.Telegram.WebApp
        const hasInitData = hasWebApp && window.Telegram.WebApp.initData
        
        isTelegramWebApp.value = !!hasInitData
        console.log('📱 Telegram Web App:', isTelegramWebApp.value)
        
      } catch (error) {
        console.error('Ошибка:', error)
        isTelegramWebApp.value = false
      }
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
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  color: white;
  font-family: Arial, sans-serif;
}

.debug-info {
  background: rgba(76, 175, 80, 0.2);
  padding: 10px;
  font-size: 12px;
  border-bottom: 1px solid rgba(76, 175, 80, 0.3);
}

.debug-info p {
  margin: 0;
}

.page-content {
  flex: 1;
  padding: 20px;
}

.test-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  color: #4CAF50;
  margin-bottom: 20px;
}

p {
  margin: 15px 0;
  font-size: 18px;
  line-height: 1.5;
}
</style>
