<template>
  <div class="telegram-url-auth-demo">
    <div class="demo-container">
      <h2>🔗 Telegram URL Authorization Demo</h2>
      
      <div class="demo-section">
        <h3>📱 Текущий статус</h3>
        <div class="status-card">
          <div class="status-item">
            <span class="label">Autologin Token:</span>
            <span class="value" :class="{ valid: isTokenValid, invalid: !isTokenValid }">
              {{ autologinToken || 'Не получен' }}
            </span>
          </div>
          <div class="status-item">
            <span class="label">Токен действителен:</span>
            <span class="value" :class="{ valid: isTokenValid, invalid: !isTokenValid }">
              {{ isTokenValid ? '✅ Да' : '❌ Нет' }}
            </span>
          </div>
          <div class="status-item">
            <span class="label">Истекает:</span>
            <span class="value">
              {{ tokenExpiration ? new Date(tokenExpiration * 1000).toLocaleString() : 'Не установлено' }}
            </span>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h3>🛠 Действия</h3>
        
        <div class="action-buttons">
          <button @click="refreshToken" class="btn primary">
            🔄 Обновить токен
          </button>
          
          <button @click="generateDemoURL" class="btn secondary">
            🔗 Создать URL с токеном
          </button>
          
          <button @click="testCurrentURL" class="btn secondary">
            🧪 Проверить текущий URL
          </button>
        </div>
      </div>

      <div class="demo-section" v-if="generatedURL">
        <h3>🔗 Сгенерированная ссылка</h3>
        <div class="url-display">
          <div class="url-text">{{ generatedURL }}</div>
          <button @click="copyURL" class="btn copy">📋 Копировать</button>
          <button @click="openURL" class="btn primary">🚀 Открыть</button>
        </div>
      </div>

      <div class="demo-section" v-if="processResult">
        <h3>📊 Результат обработки URL</h3>
        <div class="result-card">
          <pre>{{ JSON.stringify(processResult, null, 2) }}</pre>
        </div>
      </div>

      <div class="demo-section">
        <h3>📖 Как это работает</h3>
        <div class="info-card">
          <p><strong>Telegram URL Authorization</strong> позволяет автоматически авторизовать пользователей при переходе по ссылкам.</p>
          
          <h4>Алгоритм:</h4>
          <ol>
            <li>Получение <code>autologin_token</code> из MTProto конфигурации</li>
            <li>Добавление токена к URL: <code>?autologin_token=...</code></li>
            <li>Проверка валидности токена (не старше 10000 секунд)</li>
            <li>Автоматическая авторизация при переходе по ссылке</li>
          </ol>
          
          <h4>Поддерживаемые домены:</h4>
          <ul>
            <li v-for="domain in trustedDomains" :key="domain">
              <code>{{ domain }}</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { telegramURLAuth } from '@/utils/telegram-url-auth.js'

// Реактивные данные
const autologinToken = ref(null)
const tokenExpiration = ref(null)
const generatedURL = ref('')
const processResult = ref(null)

// Вычисляемые свойства
const isTokenValid = computed(() => {
  return telegramURLAuth.isTokenValid()
})

const trustedDomains = computed(() => {
  return telegramURLAuth.trustedDomains
})

// Методы
const refreshToken = async () => {
  console.log('🔄 Обновление autologin_token...')
  
  try {
    const config = await telegramURLAuth.getMTProtoConfig()
    
    if (config) {
      autologinToken.value = config.autologin_token
      tokenExpiration.value = config.token_expires
      
      console.log('✅ Токен обновлен:', autologinToken.value)
    } else {
      console.error('❌ Не удалось получить конфигурацию')
    }
  } catch (error) {
    console.error('❌ Ошибка обновления токена:', error)
  }
}

const generateDemoURL = async () => {
  console.log('🔗 Генерация URL с autologin_token...')
  
  try {
    const baseURL = `${window.location.origin}/jobs`
    const params = {
      utm_source: 'telegram_url_auth_demo',
      demo: 'true'
    }
    
    const urlWithToken = await telegramURLAuth.createAutologinURL(baseURL, params)
    generatedURL.value = urlWithToken
    
    console.log('✅ URL сгенерирован:', urlWithToken)
  } catch (error) {
    console.error('❌ Ошибка генерации URL:', error)
  }
}

const testCurrentURL = async () => {
  console.log('🧪 Тестирование текущего URL...')
  
  try {
    const currentURL = window.location.href
    const result = await telegramURLAuth.processIncomingURL(currentURL)
    
    processResult.value = {
      originalURL: currentURL,
      ...result,
      timestamp: new Date().toISOString()
    }
    
    console.log('✅ URL обработан:', result)
  } catch (error) {
    console.error('❌ Ошибка обработки URL:', error)
    processResult.value = {
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

const copyURL = async () => {
  try {
    await navigator.clipboard.writeText(generatedURL.value)
    console.log('📋 URL скопирован в буфер обмена')
    
    // Показываем уведомление
    const notification = document.createElement('div')
    notification.textContent = '✅ Ссылка скопирована!'
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 1000;
    `
    document.body.appendChild(notification)
    
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 2000)
    
  } catch (error) {
    console.error('❌ Ошибка копирования:', error)
  }
}

const openURL = () => {
  window.open(generatedURL.value, '_blank')
}

// Инициализация
onMounted(async () => {
  console.log('🔗 Инициализация Telegram URL Auth Demo')
  
  // Получаем начальную конфигурацию
  await refreshToken()
  
  // Проверяем текущий URL
  await testCurrentURL()
})
</script>

<style scoped>
.telegram-url-auth-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.demo-container {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.demo-section {
  margin-bottom: 30px;
}

.demo-section h3 {
  margin-bottom: 15px;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 8px;
}

.status-card, .result-card, .info-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #007bff;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.status-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.label {
  font-weight: 600;
  color: #666;
}

.value {
  font-family: monospace;
  padding: 2px 6px;
  border-radius: 4px;
  background: #fff;
}

.value.valid {
  color: #28a745;
  background: #d4edda;
}

.value.invalid {
  color: #dc3545;
  background: #f8d7da;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn.primary {
  background: #007bff;
  color: white;
}

.btn.primary:hover {
  background: #0056b3;
}

.btn.secondary {
  background: #6c757d;
  color: white;
}

.btn.secondary:hover {
  background: #545b62;
}

.btn.copy {
  background: #28a745;
  color: white;
}

.btn.copy:hover {
  background: #1e7e34;
}

.url-display {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #dee2e6;
}

.url-text {
  font-family: monospace;
  word-break: break-all;
  margin-bottom: 15px;
  padding: 10px;
  background: white;
  border-radius: 4px;
  font-size: 12px;
}

.result-card pre {
  margin: 0;
  font-size: 12px;
  color: #495057;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.info-card h4 {
  margin-top: 15px;
  margin-bottom: 10px;
  color: #495057;
}

.info-card ul, .info-card ol {
  margin-left: 20px;
}

.info-card li {
  margin-bottom: 5px;
}

.info-card code {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 12px;
}

@media (max-width: 768px) {
  .telegram-url-auth-demo {
    padding: 10px;
  }
  
  .demo-container {
    padding: 20px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .status-item {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
