<template>
  <div class="notification-panel">
    <h3 class="notification-panel__title">
      📱 Push-уведомления
      <span v-if="isLoading" class="loading-indicator">⏳</span>
    </h3>
    
    <!-- Статус последнего уведомления -->
    <div v-if="lastNotificationSent" class="last-notification">
      <div class="notification-status success">
        ✅ Последнее уведомление отправлено
      </div>
      <div class="notification-details">
        <strong>{{ getNotificationTypeLabel(lastNotificationSent.type) }}</strong>
        <div class="notification-meta">
          {{ formatTimestamp(lastNotificationSent.timestamp) }}
        </div>
        <div v-if="lastNotificationSent.jobTitle" class="notification-content">
          Вакансия: {{ lastNotificationSent.jobTitle }}
        </div>
        <div v-if="lastNotificationSent.badgeName" class="notification-content">
          Бейдж: {{ lastNotificationSent.badgeName }}
        </div>
        <div v-if="lastNotificationSent.userName" class="notification-content">
          Пользователь: {{ lastNotificationSent.userName }}
        </div>
      </div>
    </div>

    <!-- Ошибка -->
    <div v-if="error" class="notification-status error">
      ❌ {{ error }}
      <button @click="clearError" class="clear-error-btn">Закрыть</button>
    </div>

    <!-- Кнопки тестирования -->
    <div class="test-actions">
      <h4>Тестирование уведомлений:</h4>
      
      <button 
        @click="testJobNotification" 
        :disabled="isLoading"
        class="test-btn test-btn--job"
      >
        📋 Тест вакансии
      </button>
      
      <button 
        @click="testBadgeNotification" 
        :disabled="isLoading"
        class="test-btn test-btn--badge"
      >
        🏅 Тест бейджа
      </button>
      
      <button 
        @click="testWelcomeNotification" 
        :disabled="isLoading"
        class="test-btn test-btn--welcome"
      >
        🎉 Тест приветствия
      </button>

      <button 
        @click="testCustomNotification" 
        :disabled="isLoading"
        class="test-btn test-btn--custom"
      >
        💬 Тест сообщения
      </button>
    </div>

    <!-- Локальные уведомления -->
    <div v-if="notifications.length > 0" class="local-notifications">
      <h4>Локальные уведомления:</h4>
      <div 
        v-for="(notification, index) in notifications.slice(-3)" 
        :key="index"
        :class="['local-notification', notification.type]"
      >
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNotifications } from '@/composables/useNotifications.js'

const {
  notifications,
  isLoading,
  error,
  lastNotificationSent,
  notifyUser,
  notifyNewJob,
  notifyBadgeAwarded,
  notifyWelcome,
  clearError
} = useNotifications()

// Тестовые функции
const testJobNotification = async () => {
  const testJob = {
    title: 'Повар итальянской кухни (ТЕСТ)',
    location: 'Есильский район, Астана',
    salary_from: 350000,
    salary_to: 500000,
    company_name: 'Ristorante Bella Vista'
  }
  
  await notifyNewJob(testJob)
}

const testBadgeNotification = async () => {
  const testBadge = {
    name: 'Тестовый бейдж',
    description: 'Бейдж для тестирования уведомлений',
    icon_url: '🧪'
  }
  
  await notifyBadgeAwarded('test-user', testBadge, 'За участие в тестировании')
}

const testWelcomeNotification = async () => {
  const testUser = {
    full_name: 'Тестовый Пользователь'
  }
  
  await notifyWelcome('test-user', testUser)
}

const testCustomNotification = async () => {
  await notifyUser('test-user', 'Это тестовое уведомление от ShiftworkKZ App!', 'info')
}

// Утилиты
const getNotificationTypeLabel = (type) => {
  const labels = {
    job: '💼 Новая вакансия',
    urgent: '🚨 Срочная вакансия',
    badge: '🏅 Получен бейдж',
    welcome: '🎉 Приветствие',
    info: 'ℹ️ Информация',
    application: '📝 Статус заявки'
  }
  return labels[type] || type
}

const formatTimestamp = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  })
}
</script>

<style scoped>
.notification-panel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 12px;
  color: white;
  margin: 20px 0;
}

.notification-panel__title {
  margin: 0 0 15px 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading-indicator {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.last-notification {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.notification-status {
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notification-status.success {
  background: rgba(76, 175, 80, 0.3);
  border: 1px solid rgba(76, 175, 80, 0.5);
}

.notification-status.error {
  background: rgba(244, 67, 54, 0.3);
  border: 1px solid rgba(244, 67, 54, 0.5);
}

.notification-details {
  font-size: 14px;
}

.notification-meta {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  margin: 5px 0;
}

.notification-content {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

.test-actions {
  margin: 20px 0;
}

.test-actions h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.test-btn {
  display: inline-block;
  padding: 8px 12px;
  margin: 5px 5px 5px 0;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.test-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.test-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-error-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
}

.local-notifications {
  margin-top: 15px;
}

.local-notifications h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.local-notification {
  padding: 8px 12px;
  margin: 5px 0;
  border-radius: 6px;
  font-size: 13px;
}

.local-notification.success {
  background: rgba(76, 175, 80, 0.3);
  border-left: 3px solid #4CAF50;
}

.local-notification.error {
  background: rgba(244, 67, 54, 0.3);
  border-left: 3px solid #f44336;
}
</style>
