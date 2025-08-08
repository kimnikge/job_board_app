<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <h1>🚨 Что-то пошло не так</h1>
      <p>Произошла ошибка при загрузке приложения</p>
      <button @click="reload" class="retry-button">
        Перезагрузить страницу
      </button>
      <details class="error-details">
        <summary>Подробности ошибки</summary>
        <pre>{{ errorMessage }}</pre>
      </details>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((error) => {
  console.error('Error captured:', error)
  hasError.value = true
  errorMessage.value = error.toString()
  return false
})

const reload = () => {
  window.location.reload()
}

// Глобальный обработчик ошибок
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  hasError.value = true
  errorMessage.value = event.error?.toString() || 'Unknown error'
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  hasError.value = true
  errorMessage.value = event.reason?.toString() || 'Promise rejection'
})
</script>

<style scoped>
.error-boundary {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 2rem;
}

.error-container {
  text-align: center;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.error-container h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #ff6b6b;
}

.error-container p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.retry-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.retry-button:hover {
  transform: translateY(-2px);
}

.error-details {
  margin-top: 2rem;
  text-align: left;
}

.error-details summary {
  cursor: pointer;
  margin-bottom: 1rem;
  color: #ffd93d;
}

.error-details pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  overflow-x: auto;
}
</style>
