<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-icon">🚨</div>
      <h1>Что-то пошло не так</h1>
      <p class="error-message">{{ errorMessage }}</p>
      
      <div class="error-details" v-if="showDetails">
        <h3>Подробности ошибки:</h3>
        <pre>{{ errorDetails }}</pre>
      </div>
      
      <div class="error-actions">
        <button @click="reloadPage" class="btn-primary">
          🔄 Перезагрузить страницу
        </button>
        
        <button @click="goHome" class="btn-secondary">
          🏠 На главную
        </button>
        
        <button @click="toggleDetails" class="btn-link">
          {{ showDetails ? 'Скрыть' : 'Показать' }} подробности
        </button>
      </div>
      
      <div class="error-help">
        <h3>Что можно попробовать:</h3>
        <ul>
          <li>Проверьте интернет-соединение</li>
          <li>Попробуйте перезагрузить страницу</li>
          <li>Очистите кэш браузера</li>
          <li>Попробуйте зайти позднее</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  error: {
    type: [Error, String, Object],
    default: null
  }
})

const showDetails = ref(false)
const errorMessage = ref('Произошла неожиданная ошибка')
const errorDetails = ref('')

onMounted(() => {
  if (props.error) {
    if (typeof props.error === 'string') {
      errorMessage.value = props.error
    } else if (props.error instanceof Error) {
      errorMessage.value = props.error.message || 'Произошла ошибка'
      errorDetails.value = props.error.stack || props.error.toString()
    } else if (typeof props.error === 'object') {
      errorMessage.value = props.error.message || 'Произошла ошибка'
      errorDetails.value = JSON.stringify(props.error, null, 2)
    }
  }
  
  // Логируем ошибку для отладки
  console.error('Error page mounted with error:', props.error)
})

const reloadPage = () => {
  window.location.reload()
}

const goHome = () => {
  router.push('/')
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-container {
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 16px;
  font-size: 2rem;
}

.error-message {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-bottom: 30px;
  line-height: 1.5;
}

.error-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  text-align: left;
}

.error-details h3 {
  margin-top: 0;
  color: #495057;
}

.error-details pre {
  background: #e9ecef;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  font-size: 12px;
  color: #dc3545;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.btn-primary,
.btn-secondary,
.btn-link {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-link {
  background: none;
  color: #6b7280;
  text-decoration: underline;
}

.btn-link:hover {
  color: #374151;
}

.error-help {
  text-align: left;
}

.error-help h3 {
  color: #374151;
  margin-bottom: 12px;
}

.error-help ul {
  color: #6b7280;
  line-height: 1.6;
  padding-left: 20px;
}

.error-help li {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .error-container {
    padding: 20px;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  h1 {
    font-size: 1.5rem;
  }
}
</style>
