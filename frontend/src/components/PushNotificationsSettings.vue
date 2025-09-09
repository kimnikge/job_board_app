<template>
  <div class="push-notifications-settings">
    <h3>🔔 Push-уведомления</h3>
    
    <!-- Статус поддержки -->
    <div v-if="!isSupported" class="status-card unsupported">
      <div class="status-icon">❌</div>
      <div class="status-content">
        <h4>Не поддерживается</h4>
        <p>Ваш браузер не поддерживает push-уведомления</p>
      </div>
    </div>

    <!-- Основной интерфейс -->
    <div v-else class="notification-controls">
      <!-- Текущий статус -->
      <div class="status-card" :class="statusClass">
        <div class="status-icon">{{ statusIcon }}</div>
        <div class="status-content">
          <h4>{{ statusTitle }}</h4>
          <p>{{ statusDescription }}</p>
        </div>
      </div>

      <!-- Ошибка -->
      <div v-if="error" class="error-card">
        <div class="error-icon">⚠️</div>
        <div class="error-content">
          <strong>Ошибка:</strong> {{ error }}
          <button @click="clearError" class="clear-btn">×</button>
        </div>
      </div>

      <!-- Кнопки управления -->
      <div class="control-buttons">
        <button 
          v-if="!isSubscribed"
          @click="subscribe"
          :disabled="loading || permission === 'denied'"
          class="btn-primary"
        >
          <span v-if="loading">⏳</span>
          <span v-else>🔔</span>
          {{ loading ? 'Подключение...' : 'Включить уведомления' }}
        </button>

        <button 
          v-if="isSubscribed"
          @click="unsubscribe"
          :disabled="loading"
          class="btn-secondary"
        >
          <span v-if="loading">⏳</span>
          <span v-else>🔕</span>
          {{ loading ? 'Отключение...' : 'Отключить уведомления' }}
        </button>

        <button 
          v-if="isSubscribed"
          @click="sendTest"
          :disabled="loading"
          class="btn-test"
        >
          🧪 Тест
        </button>
      </div>

      <!-- Настройки типов уведомлений -->
      <div v-if="isSubscribed" class="notification-types">
        <h4>Типы уведомлений:</h4>
        <div class="type-options">
          <label class="type-option">
            <input type="checkbox" v-model="settings.urgentJobs" />
            <span class="checkbox-custom"></span>
            <div class="option-content">
              <strong>🚨 Срочные вакансии</strong>
              <p>Уведомления о новых срочных вакансиях в вашем районе</p>
            </div>
          </label>

          <label class="type-option">
            <input type="checkbox" v-model="settings.jobResponses" />
            <span class="checkbox-custom"></span>
            <div class="option-content">
              <strong>📝 Отклики на вакансии</strong>
              <p>Уведомления о новых откликах на ваши вакансии</p>
            </div>
          </label>

          <label class="type-option">
            <input type="checkbox" v-model="settings.badges" />
            <span class="checkbox-custom"></span>
            <div class="option-content">
              <strong>🏅 Новые бейджи</strong>
              <p>Уведомления о получении новых достижений</p>
            </div>
          </label>

          <label class="type-option">
            <input type="checkbox" v-model="settings.system" />
            <span class="checkbox-custom"></span>
            <div class="option-content">
              <strong>⚙️ Системные</strong>
              <p>Важные системные уведомления и обновления</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePushNotifications } from '@/composables/usePushNotifications.js'

const {
  isSupported,
  permission,
  isSubscribed,
  loading,
  error,
  subscribe,
  unsubscribe,
  sendTest,
  clearError
} = usePushNotifications()

// Настройки типов уведомлений
const settings = ref({
  urgentJobs: true,
  jobResponses: true,
  badges: true,
  system: true
})

// Вычисляемые свойства для статуса
const statusClass = computed(() => {
  if (permission.value === 'denied') return 'denied'
  if (isSubscribed.value) return 'granted'
  return 'default'
})

const statusIcon = computed(() => {
  if (permission.value === 'denied') return '🚫'
  if (isSubscribed.value) return '✅'
  return '🔔'
})

const statusTitle = computed(() => {
  if (permission.value === 'denied') return 'Уведомления заблокированы'
  if (isSubscribed.value) return 'Уведомления включены'
  return 'Уведомления отключены'
})

const statusDescription = computed(() => {
  if (permission.value === 'denied') {
    return 'Разрешите уведомления в настройках браузера'
  }
  if (isSubscribed.value) {
    return 'Вы будете получать push-уведомления о важных событиях'
  }
  return 'Включите уведомления, чтобы не пропустить важные события'
})
</script>

<style scoped>
.push-notifications-settings {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.status-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.status-card.granted {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-card.denied {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-card.default {
  background: rgba(156, 163, 175, 0.1);
  border: 1px solid rgba(156, 163, 175, 0.2);
}

.status-card.unsupported {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.status-content h4 {
  margin: 0 0 4px 0;
  color: var(--color-text-primary);
}

.status-content p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.error-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  margin-bottom: 16px;
}

.error-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.error-content {
  flex: 1;
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  margin-left: 8px;
}

.control-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.btn-primary,
.btn-secondary,
.btn-test {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--gradient-ready);
  color: white;
  flex: 1;
}

.btn-secondary {
  background: var(--glass-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--glass-border);
  flex: 1;
}

.btn-test {
  background: var(--glass-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--glass-border);
}

.btn-primary:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-secondary:not(:disabled):hover,
.btn-test:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-primary:disabled,
.btn-secondary:disabled,
.btn-test:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.notification-types h4 {
  margin: 0 0 16px 0;
  color: var(--color-text-primary);
}

.type-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.type-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background 0.3s ease;
}

.type-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.type-option input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid var(--glass-border);
  border-radius: 4px;
  flex-shrink: 0;
  position: relative;
  margin-top: 2px;
}

.type-option input:checked + .checkbox-custom {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.type-option input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.option-content {
  flex: 1;
}

.option-content strong {
  display: block;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.option-content p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .control-buttons {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    flex: none;
  }
}
</style>
