import { createApp } from 'vue'
import App from './App.vue'

console.log('🚀 Максимально простой main.js')

try {
  const app = createApp(App)
  app.mount('#app')
  console.log('✅ Приложение смонтировано без router и store')
} catch (error) {
  console.error('💥 Критическая ошибка:', error)
}
