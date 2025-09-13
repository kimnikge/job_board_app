import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

console.log('🚀 Инициализация приложения с router и Pinia')

try {
  const app = createApp(App)
  
  // Добавляем Pinia для управления состоянием
  const pinia = createPinia()
  app.use(pinia)
  
  // Добавляем Router для навигации
  app.use(router)
  
  app.mount('#app')
  console.log('✅ Приложение смонтировано с router и Pinia store')
} catch (error) {
  console.error('💥 Критическая ошибка:', error)
  // Показываем ошибку в DOM если возможно
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: monospace;">
      <h2>❌ Ошибка загрузки приложения</h2>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    </div>
  `
}
