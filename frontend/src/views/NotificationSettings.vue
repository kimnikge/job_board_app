<template>
  <div class="notification-settings">
    <div class="settings-header">
      <button @click="goBack" class="back-btn">← Назад</button>
      <h1>🔔 Настройки уведомлений</h1>
      <p>Управление способами получения уведомлений</p>
    </div>

    <div class="settings-content">
      <!-- Push-уведомления в браузере -->
      <div class="settings-section">
        <div class="section-header">
          <h2>📱 Push-уведомления</h2>
          <p>Уведомления в браузере</p>
        </div>
        
        <!-- Статус браузерных уведомлений -->
        <div class="notification-status">
          <div class="status-card" :class="pushPermissionStatus">
            <div class="status-icon">
              <span v-if="pushPermissionStatus === 'granted'">✅</span>
              <span v-else-if="pushPermissionStatus === 'denied'">❌</span>
              <span v-else>⚠️</span>
            </div>
            <div class="status-content">
              <h3>{{ pushStatusTitle }}</h3>
              <p>{{ pushStatusDescription }}</p>
              <button 
                v-if="pushPermissionStatus === 'default'" 
                @click="requestPushPermission"
                class="enable-btn"
                :disabled="isRequestingPermission"
              >
                <span v-if="isRequestingPermission">⏳ Запрос разрешения...</span>
                <span v-else">🔔 Включить уведомления</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Настройки типов уведомлений -->
        <div v-if="pushPermissionStatus === 'granted'" class="notification-types">
          <h3>Типы уведомлений</h3>
          
          <div class="notification-type-item">
            <div class="type-info">
              <div class="type-icon">💼</div>
              <div class="type-content">
                <h4>Новые вакансии</h4>
                <p>Уведомления о подходящих вакансиях</p>
              </div>
            </div>
            <div class="type-controls">
              <input 
                type="checkbox" 
                v-model="notificationSettings.newJobs"
                @change="saveSettings"
                class="notification-toggle"
              />
            </div>
          </div>

          <div class="notification-type-item">
            <div class="type-info">
              <div class="type-icon">⚡</div>
              <div class="type-content">
                <h4>Срочные вакансии</h4>
                <p>Уведомления о срочных предложениях</p>
              </div>
            </div>
            <div class="type-controls">
              <input 
                type="checkbox" 
                v-model="notificationSettings.urgentJobs"
                @change="saveSettings"
                class="notification-toggle"
              />
            </div>
          </div>

          <div class="notification-type-item">
            <div class="type-info">
              <div class="type-icon">💬</div>
              <div class="type-content">
                <h4>Отклики на вакансии</h4>
                <p>Уведомления об откликах соискателей</p>
              </div>
            </div>
            <div class="type-controls">
              <input 
                type="checkbox" 
                v-model="notificationSettings.jobResponses"
                @change="saveSettings"
                class="notification-toggle"
              />
            </div>
          </div>

          <div class="notification-type-item">
            <div class="type-info">
              <div class="type-icon">🏅</div>
              <div class="type-content">
                <h4>Бейджи и достижения</h4>
                <p>Уведомления о получении новых бейджей</p>
              </div>
            </div>
            <div class="type-controls">
              <input 
                type="checkbox" 
                v-model="notificationSettings.badges"
                @change="saveSettings"
                class="notification-toggle"
              />
            </div>
          </div>

          <div class="notification-type-item">
            <div class="type-info">
              <div class="type-icon">📢</div>
              <div class="type-content">
                <h4>Системные уведомления</h4>
                <p>Важные обновления и изменения</p>
              </div>
            </div>
            <div class="type-controls">
              <input 
                type="checkbox" 
                v-model="notificationSettings.system"
                @change="saveSettings"
                class="notification-toggle"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Telegram уведомления -->
      <div class="settings-section">
        <div class="section-header">
          <h2>📲 Telegram уведомления</h2>
          <p>Получение уведомлений в Telegram</p>
        </div>
        
        <div class="telegram-settings">
          <div class="telegram-status">
            <div class="telegram-info">
              <div class="telegram-avatar">
                <span v-if="telegramConnected">✅</span>
                <span v-else>📲</span>
              </div>
              <div class="telegram-details">
                <h3>{{ telegramConnected ? 'Telegram подключен' : 'Подключить Telegram' }}</h3>
                <p v-if="telegramConnected">
                  Аккаунт: @{{ telegramUsername }}
                </p>
                <p v-else>
                  Получайте уведомления прямо в Telegram
                </p>
              </div>
            </div>
            <button 
              v-if="!telegramConnected" 
              @click="connectTelegram"
              class="connect-telegram-btn"
              :disabled="isConnectingTelegram"
            >
              <span v-if="isConnectingTelegram">⏳ Подключение...</span>
              <span v-else">🔗 Подключить</span>
            </button>
            <button 
              v-else 
              @click="disconnectTelegram"
              class="disconnect-telegram-btn"
            >
              ❌ Отключить
            </button>
          </div>

          <!-- Настройки Telegram уведомлений -->
          <div v-if="telegramConnected" class="telegram-notification-settings">
            <h4>Типы Telegram уведомлений</h4>
            
            <div class="telegram-type-item">
              <span class="telegram-type-label">💼 Новые вакансии</span>
              <input 
                type="checkbox" 
                v-model="telegramSettings.newJobs"
                @change="saveTelegramSettings"
              />
            </div>
            
            <div class="telegram-type-item">
              <span class="telegram-type-label">⚡ Срочные вакансии</span>
              <input 
                type="checkbox" 
                v-model="telegramSettings.urgentJobs"
                @change="saveTelegramSettings"
              />
            </div>
            
            <div class="telegram-type-item">
              <span class="telegram-type-label">💬 Отклики</span>
              <input 
                type="checkbox" 
                v-model="telegramSettings.responses"
                @change="saveTelegramSettings"
              />
            </div>
            
            <div class="telegram-type-item">
              <span class="telegram-type-label">🏅 Бейджи</span>
              <input 
                type="checkbox" 
                v-model="telegramSettings.badges"
                @change="saveTelegramSettings"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Расписание уведомлений -->
      <div class="settings-section">
        <div class="section-header">
          <h2>⏰ Время уведомлений</h2>
          <p>Настройка времени получения уведомлений</p>
        </div>
        
        <div class="schedule-settings">
          <div class="schedule-item">
            <label class="schedule-toggle">
              <input 
                type="checkbox" 
                v-model="scheduleSettings.enabled"
                @change="saveScheduleSettings"
              />
              <span>Ограничить время уведомлений</span>
            </label>
          </div>
          
          <div v-if="scheduleSettings.enabled" class="time-range">
            <div class="time-input-group">
              <label>С</label>
              <input 
                type="time" 
                v-model="scheduleSettings.startTime"
                @change="saveScheduleSettings"
                class="time-input"
              />
            </div>
            <div class="time-input-group">
              <label>До</label>
              <input 
                type="time" 
                v-model="scheduleSettings.endTime"
                @change="saveScheduleSettings"
                class="time-input"
              />
            </div>
          </div>
          
          <div v-if="scheduleSettings.enabled" class="weekdays">
            <h4>Дни недели</h4>
            <div class="weekday-toggles">
              <label v-for="(day, index) in weekdays" :key="index" class="weekday-item">
                <input 
                  type="checkbox" 
                  v-model="scheduleSettings.weekdays[index]"
                  @change="saveScheduleSettings"
                />
                <span>{{ day }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Тестирование уведомлений -->
      <div class="settings-section">
        <div class="section-header">
          <h2>🧪 Тестирование</h2>
          <p>Проверка работы уведомлений</p>
        </div>
        
        <div class="test-notifications">
          <button 
            @click="testPushNotification"
            :disabled="isTestingPush || pushPermissionStatus !== 'granted'"
            class="test-btn"
          >
            <span v-if="isTestingPush">⏳ Отправка...</span>
            <span v-else">📱 Тестовое push-уведомление</span>
          </button>
          
          <button 
            @click="testTelegramNotification"
            :disabled="isTestingTelegram || !telegramConnected"
            class="test-btn"
          >
            <span v-if="isTestingTelegram">⏳ Отправка...</span>
            <span v-else">📲 Тестовое Telegram уведомление</span>
          </button>
        </div>
        
        <div v-if="testResult" class="test-result" :class="testResult.type">
          {{ testResult.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { pushNotificationsService } from '@/services/pushNotifications.service'

const router = useRouter()
const authStore = useAuthStore()

// Состояние разрешений
const pushPermissionStatus = ref('default') // 'default', 'granted', 'denied'
const isRequestingPermission = ref(false)

// Настройки уведомлений
const notificationSettings = ref({
  newJobs: true,
  urgentJobs: true,
  jobResponses: true,
  badges: true,
  system: true
})

// Telegram настройки
const telegramConnected = ref(true) // TODO: Получать из профиля пользователя
const telegramUsername = ref('user123') // TODO: Получать из Telegram данных
const isConnectingTelegram = ref(false)

const telegramSettings = ref({
  newJobs: true,
  urgentJobs: true,
  responses: true,
  badges: false
})

// Настройки расписания
const scheduleSettings = ref({
  enabled: false,
  startTime: '09:00',
  endTime: '21:00',
  weekdays: [true, true, true, true, true, false, false] // Пн-Пт
})

// Тестирование
const isTestingPush = ref(false)
const isTestingTelegram = ref(false)
const testResult = ref(null)

// Дни недели
const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// Вычисляемые свойства
const pushStatusTitle = computed(() => {
  switch (pushPermissionStatus.value) {
    case 'granted':
      return 'Push-уведомления включены'
    case 'denied':
      return 'Push-уведомления заблокированы'
    default:
      return 'Push-уведомления не настроены'
  }
})

const pushStatusDescription = computed(() => {
  switch (pushPermissionStatus.value) {
    case 'granted':
      return 'Вы будете получать уведомления в браузере'
    case 'denied':
      return 'Разрешения заблокированы в настройках браузера'
    default:
      return 'Разрешите уведомления для получения важных обновлений'
  }
})

// Методы
const goBack = () => {
  router.go(-1)
}

const checkPushPermission = async () => {
  if (!pushNotificationsService.isSupported()) {
    pushPermissionStatus.value = 'denied'
    return
  }
  
  pushPermissionStatus.value = pushNotificationsService.getPermissionStatus()
}

const requestPushPermission = async () => {
  isRequestingPermission.value = true
  
  try {
    await pushNotificationsService.requestPermission()
    await pushNotificationsService.subscribe()
    pushPermissionStatus.value = 'granted'
    
    showTestResult('success', '✅ Push-уведомления успешно включены!')
  } catch (error) {
    console.error('Ошибка запроса разрешений:', error)
    pushPermissionStatus.value = 'denied'
    showTestResult('error', '❌ Не удалось включить уведомления')
  } finally {
    isRequestingPermission.value = false
  }
}

const saveSettings = async () => {
  try {
    // Сохраняем настройки в localStorage
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings.value))
    
    // TODO: Сохранить в базе данных
    console.log('Notification settings saved:', notificationSettings.value)
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error)
  }
}

const connectTelegram = async () => {
  isConnectingTelegram.value = true
  
  try {
    // TODO: Реализовать подключение Telegram
    // Временная имитация
    setTimeout(() => {
      telegramConnected.value = true
      telegramUsername.value = authStore.user?.user_metadata?.telegram_username || 'user123'
      isConnectingTelegram.value = false
      showTestResult('success', '✅ Telegram успешно подключен!')
    }, 2000)
  } catch (error) {
    console.error('Ошибка подключения Telegram:', error)
    isConnectingTelegram.value = false
    showTestResult('error', '❌ Не удалось подключить Telegram')
  }
}

const disconnectTelegram = () => {
  telegramConnected.value = false
  telegramUsername.value = ''
  showTestResult('info', 'ℹ️ Telegram отключен')
}

const saveTelegramSettings = async () => {
  try {
    localStorage.setItem('telegramSettings', JSON.stringify(telegramSettings.value))
    console.log('Telegram settings saved:', telegramSettings.value)
  } catch (error) {
    console.error('Ошибка сохранения Telegram настроек:', error)
  }
}

const saveScheduleSettings = async () => {
  try {
    localStorage.setItem('scheduleSettings', JSON.stringify(scheduleSettings.value))
    console.log('Schedule settings saved:', scheduleSettings.value)
  } catch (error) {
    console.error('Ошибка сохранения настроек расписания:', error)
  }
}

const testPushNotification = async () => {
  isTestingPush.value = true
  
  try {
    // Отправляем тестовое уведомление
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification('🧪 Тестовое уведомление', {
      body: 'Push-уведомления работают корректно!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'test-notification'
    })
    
    showTestResult('success', '✅ Push-уведомление отправлено!')
  } catch (error) {
    console.error('Ошибка тестового уведомления:', error)
    showTestResult('error', '❌ Ошибка отправки уведомления')
  } finally {
    isTestingPush.value = false
  }
}

const testTelegramNotification = async () => {
  isTestingTelegram.value = true
  
  try {
    // TODO: Отправить тестовое Telegram уведомление
    // Имитация отправки
    setTimeout(() => {
      showTestResult('success', '✅ Telegram уведомление отправлено!')
      isTestingTelegram.value = false
    }, 1500)
  } catch (error) {
    console.error('Ошибка тестового Telegram уведомления:', error)
    showTestResult('error', '❌ Ошибка отправки Telegram уведомления')
    isTestingTelegram.value = false
  }
}

const showTestResult = (type, message) => {
  testResult.value = { type, message }
  setTimeout(() => {
    testResult.value = null
  }, 5000)
}

const loadSettings = () => {
  try {
    // Загружаем настройки из localStorage
    const savedNotificationSettings = localStorage.getItem('notificationSettings')
    if (savedNotificationSettings) {
      notificationSettings.value = { ...notificationSettings.value, ...JSON.parse(savedNotificationSettings) }
    }
    
    const savedTelegramSettings = localStorage.getItem('telegramSettings')
    if (savedTelegramSettings) {
      telegramSettings.value = { ...telegramSettings.value, ...JSON.parse(savedTelegramSettings) }
    }
    
    const savedScheduleSettings = localStorage.getItem('scheduleSettings')
    if (savedScheduleSettings) {
      scheduleSettings.value = { ...scheduleSettings.value, ...JSON.parse(savedScheduleSettings) }
    }
    
    // TODO: Загружать настройки из базы данных
  } catch (error) {
    console.error('Ошибка загрузки настроек:', error)
  }
}

onMounted(() => {
  checkPushPermission()
  loadSettings()
  
  // Получаем информацию о Telegram пользователе
  if (authStore.user?.user_metadata?.telegram_username) {
    telegramUsername.value = authStore.user.user_metadata.telegram_username
  }
})
</script>

<style scoped>
.notification-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

.settings-header {
  position: relative;
  text-align: center;
  margin-bottom: 30px;
  padding: 30px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
}

.back-btn {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.settings-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.settings-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.settings-content {
  display: grid;
  gap: 25px;
}

.settings-section {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f1f3f4;
}

.section-header h2 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.section-header p {
  color: #666;
  font-size: 0.95rem;
}

.notification-status {
  margin-bottom: 25px;
}

.status-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid;
  transition: all 0.3s ease;
}

.status-card.granted {
  background: #f0fff4;
  border-color: #68d391;
}

.status-card.denied {
  background: #fff5f5;
  border-color: #fc8181;
}

.status-card.default {
  background: #fffaf0;
  border-color: #f6ad55;
}

.status-icon {
  font-size: 2rem;
  margin-right: 15px;
}

.status-content {
  flex: 1;
}

.status-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.status-content p {
  color: #666;
  margin-bottom: 15px;
}

.enable-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.enable-btn:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.enable-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.notification-types h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 1.1rem;
}

.notification-type-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #f1f3f4;
}

.notification-type-item:last-child {
  border-bottom: none;
}

.type-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.type-icon {
  font-size: 1.5rem;
  margin-right: 12px;
  width: 30px;
  text-align: center;
}

.type-content h4 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 3px;
  color: #333;
}

.type-content p {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.notification-toggle {
  width: 20px;
  height: 20px;
  accent-color: #667eea;
  cursor: pointer;
}

.telegram-settings {
  display: grid;
  gap: 20px;
}

.telegram-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

.telegram-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.telegram-avatar {
  font-size: 2rem;
  margin-right: 15px;
}

.telegram-details h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 3px;
  color: #333;
}

.telegram-details p {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.connect-telegram-btn,
.disconnect-telegram-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.connect-telegram-btn {
  background: #0088cc;
  color: white;
}

.connect-telegram-btn:hover:not(:disabled) {
  background: #006ba3;
}

.disconnect-telegram-btn {
  background: #dc3545;
  color: white;
}

.disconnect-telegram-btn:hover {
  background: #c82333;
}

.telegram-notification-settings h4 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1rem;
}

.telegram-type-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f3f4;
}

.telegram-type-item:last-child {
  border-bottom: none;
}

.telegram-type-label {
  font-size: 0.95rem;
  color: #333;
}

.schedule-settings {
  display: grid;
  gap: 20px;
}

.schedule-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  cursor: pointer;
}

.schedule-toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
}

.time-range {
  display: flex;
  gap: 20px;
  align-items: center;
}

.time-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-input-group label {
  font-weight: 500;
  color: #555;
}

.time-input {
  padding: 8px 10px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
}

.weekdays h4 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1rem;
}

.weekday-toggles {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.weekday-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.weekday-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #667eea;
}

.test-notifications {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.test-btn {
  flex: 1;
  padding: 12px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.test-btn:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.test-result {
  padding: 12px 15px;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
}

.test-result.success {
  background: #f0fff4;
  color: #38a169;
  border: 2px solid #68d391;
}

.test-result.error {
  background: #fff5f5;
  color: #e53e3e;
  border: 2px solid #fc8181;
}

.test-result.info {
  background: #ebf8ff;
  color: #3182ce;
  border: 2px solid #63b3ed;
}

@media (max-width: 768px) {
  .notification-settings {
    padding: 15px;
  }
  
  .settings-header {
    padding: 25px 15px;
  }
  
  .back-btn {
    left: 15px;
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  .settings-section {
    padding: 20px;
  }
  
  .status-card {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .telegram-status {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .time-range {
    flex-direction: column;
    gap: 15px;
  }
  
  .test-notifications {
    flex-direction: column;
  }
  
  .weekday-toggles {
    justify-content: center;
  }
}
</style>
