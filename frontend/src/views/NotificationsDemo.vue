<template>
  <div class="notifications-demo-page">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold text-white mb-8 text-center">
          📱 Демо Push-уведомлений Shiftwork BETA
        </h1>
        
        <div class="demo-grid">
          <!-- Панель управления уведомлениями -->
          <div class="demo-section glass-effect">
            <h2 class="section-title">🎮 Панель управления</h2>
            <NotificationPanel />
          </div>

          <!-- Быстрые действия -->
          <div class="demo-section glass-effect">
            <h2 class="section-title">⚡ Быстрые действия</h2>
            
            <div class="quick-actions">
              <!-- Имитация регистрации -->
              <div class="action-group">
                <h3 class="action-title">👤 Регистрация пользователя</h3>
                <button @click="simulateRegistration" :disabled="isLoading" class="action-btn registration">
                  Имитировать регистрацию
                </button>
                <p class="action-desc">Отправит приветственное уведомление новому пользователю</p>
              </div>

              <!-- Создание вакансии -->
              <div class="action-group">
                <h3 class="action-title">💼 Создание вакансии</h3>
                <button @click="simulateJobCreation" :disabled="isLoading" class="action-btn job">
                  Создать тестовую вакансию
                </button>
                <button @click="simulateUrgentJob" :disabled="isLoading" class="action-btn urgent">
                  Создать СРОЧНУЮ вакансию
                </button>
                <p class="action-desc">Отправит уведомления соискателям о новых возможностях</p>
              </div>

              <!-- Выдача бейджей -->
              <div class="action-group">
                <h3 class="action-title">🏅 Система достижений</h3>
                <button @click="simulateBadgeAward" :disabled="isLoading" class="action-btn badge">
                  Выдать бейдж
                </button>
                <button @click="simulateCorpBadge" :disabled="isLoading" class="action-btn corp-badge">
                  Корпоративный бейдж
                </button>
                <p class="action-desc">Поздравит пользователя с новым достижением</p>
              </div>

              <!-- Статус заявок -->
              <div class="action-group">
                <h3 class="action-title">📝 Статусы заявок</h3>
                <div class="status-buttons">
                  <button @click="simulateApplicationStatus('shortlisted')" :disabled="isLoading" class="action-btn status success">
                    Прошел отбор
                  </button>
                  <button @click="simulateApplicationStatus('interview')" :disabled="isLoading" class="action-btn status interview">
                    Приглашение на собеседование
                  </button>
                  <button @click="simulateApplicationStatus('hired')" :disabled="isLoading" class="action-btn status hired">
                    Принят на работу!
                  </button>
                </div>
                <p class="action-desc">Уведомления об изменении статуса заявки на работу</p>
              </div>
            </div>
          </div>

          <!-- Статистика -->
          <div class="demo-section glass-effect">
            <h2 class="section-title">📊 Статистика</h2>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">{{ stats.totalNotifications }}</div>
                <div class="stat-label">Уведомлений отправлено</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ stats.successRate }}%</div>
                <div class="stat-label">Успешных доставок</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ stats.avgResponseTime }}мс</div>
                <div class="stat-label">Среднее время отклика</div>
              </div>
            </div>

            <div class="recent-notifications">
              <h4 class="recent-title">Последние уведомления:</h4>
              <div v-if="recentNotifications.length === 0" class="no-notifications">
                Уведомлений пока нет
              </div>
              <div 
                v-for="(notification, index) in recentNotifications.slice(-5)" 
                :key="index"
                class="notification-item"
              >
                <div class="notification-type">{{ getTypeIcon(notification.type) }}</div>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
                </div>
                <div class="notification-status">✅</div>
              </div>
            </div>
          </div>

          <!-- Настройки -->
          <div class="demo-section glass-effect">
            <h2 class="section-title">⚙️ Настройки</h2>
            
            <div class="settings">
              <div class="setting-item">
                <label class="setting-label">
                  <input v-model="settings.enableSound" type="checkbox" class="setting-checkbox">
                  🔊 Звуковые уведомления
                </label>
              </div>

              <div class="setting-item">
                <label class="setting-label">
                  <input v-model="settings.enableBadges" type="checkbox" class="setting-checkbox">
                  🏅 Уведомления о бейджах
                </label>
              </div>

              <div class="setting-item">
                <label class="setting-label">
                  <input v-model="settings.enableJobs" type="checkbox" class="setting-checkbox">
                  💼 Уведомления о вакансиях
                </label>
              </div>

              <div class="setting-item">
                <label class="setting-label">
                  Chat ID для тестирования:
                  <input v-model="settings.testChatId" type="text" class="setting-input" placeholder="763612632">
                </label>
              </div>

              <button @click="resetStats" class="reset-btn">
                🔄 Сбросить статистику
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotifications } from '@/composables/useNotifications.js'
import { useSubscription } from '@/composables/useSubscription.js'
import { authService } from '@/services/auth.service.js'
import { jobsService } from '@/services/jobs.service.js'
import { badgesService } from '@/services/badges.service.js'
import { notificationsService } from '@/services/notifications.service.js'
import NotificationPanel from '@/components/NotificationPanel.vue'

const { 
  isLoading,
  notifyUser,
  notifyNewJob,
  notifyBadgeAwarded,
  notifyWelcome
} = useNotifications()

const { canPerformAction, logUsage } = useSubscription()

// Состояние
const stats = ref({
  totalNotifications: 0,
  successRate: 100,
  avgResponseTime: 450
})

const recentNotifications = ref([])

const settings = ref({
  enableSound: true,
  enableBadges: true,
  enableJobs: true,
  testChatId: '763612632'
})

// Методы имитации
const simulateRegistration = async () => {
  const startTime = Date.now()
  
  try {
    // Имитируем регистрацию через authService
    const userData = {
      full_name: 'Новый Пользователь',
      email: 'newuser@shiftworkkz.com',
      user_type: 'candidate'
    }

    await authService.register('newuser@shiftworkkz.com', 'password123', userData)
    
    addNotificationToHistory({
      type: 'welcome',
      title: 'Приветственное уведомление отправлено',
      timestamp: new Date()
    })

    updateStats(startTime)
  } catch (error) {
    console.error('Registration simulation error:', error)
  }
}

const simulateJobCreation = async () => {
  const startTime = Date.now()
  
  try {
    // Проверяем лимиты подписки
    const canCreate = await canPerformAction('create_job')
    if (!canCreate) {
      console.log('Достигнут лимит создания обычных вакансий')
      return
    }

    const jobData = {
      title: 'Бариста в кофейню',
      company_name: 'Coffee Dreams',
      location: 'Есильский район',
      salary_from: 280000,
      salary_to: 350000,
      description: 'Ищем дружелюбного бариста в нашу уютную кофейню. Обучение, стабильная зарплата.',
      is_urgent: false
    }

    await jobsService.createJob(jobData)
    
    // Логируем использование
    await logUsage('create_job', `Демо: Создана вакансия ${jobData.title}`)
    
    addNotificationToHistory({
      type: 'job',
      title: `Новая вакансия: ${jobData.title}`,
      timestamp: new Date()
    })

    updateStats(startTime)
  } catch (error) {
    console.error('Job creation simulation error:', error)
  }
}

const simulateUrgentJob = async () => {
  const startTime = Date.now()
  
  try {
    // Проверяем лимиты подписки для срочных вакансий
    const canCreate = await canPerformAction('create_urgent_job')
    if (!canCreate) {
      console.log('Достигнут лимит создания срочных вакансий')
      return
    }

    const urgentJobData = {
      title: 'СРОЧНО: Повар на замену',
      company_name: 'Ресторан Арман',
      location: 'Алматинский район', 
      salary_from: 400000,
      salary_to: 600000,
      description: 'Срочно требуется опытный повар на замену заболевшего сотрудника.',
      is_urgent: true,
      needed_date: new Date(Date.now() + 86400000).toISOString().split('T')[0] // завтра
    }

    await jobsService.createJob(urgentJobData)
    
    // Логируем использование
    await logUsage('create_urgent_job', `Демо: Создана срочная вакансия ${urgentJobData.title}`)
    
    addNotificationToHistory({
      type: 'urgent',
      title: `СРОЧНАЯ вакансия: ${urgentJobData.title}`,
      timestamp: new Date()
    })

    updateStats(startTime)
  } catch (error) {
    console.error('Urgent job simulation error:', error)
  }
}

const simulateBadgeAward = async () => {
  const startTime = Date.now()
  
  try {
    const badgeData = {
      name: 'Первые шаги',
      description: 'За успешную регистрацию и заполнение профиля',
      icon_url: '🎯',
      category: 'Achievement',
      level: 'Bronze'
    }

    await badgesService.awardBadge('demo-user', 'badge-first-steps', 'За активность на платформе')
    
    addNotificationToHistory({
      type: 'badge',
      title: `Получен бейдж: ${badgeData.name}`,
      timestamp: new Date()
    })

    updateStats(startTime)
  } catch (error) {
    console.error('Badge award simulation error:', error)
  }
}

const simulateCorpBadge = async () => {
  const startTime = Date.now()
  
  try {
    const corpBadgeData = {
      name: 'Сотрудник месяца',
      description: 'Лучший сотрудник месяца в ресторане',
      icon_url: '👑',
      category: 'Corporate',
      level: 'Gold'
    }

    await notifyBadgeAwarded('demo-user', corpBadgeData, 'За выдающиеся результаты в декабре')
    
    addNotificationToHistory({
      type: 'corp-badge',
      title: `Корпоративный бейдж: ${corpBadgeData.name}`,
      timestamp: new Date()
    })

    updateStats(startTime)
  } catch (error) {
    console.error('Corp badge simulation error:', error)
  }
}

const simulateApplicationStatus = async (status) => {
  const startTime = Date.now()
  
  try {
    const jobTitle = 'Повар итальянской кухни'
    
    await notificationsService.notifyApplicationStatus('demo-user', jobTitle, status)
    
    const statusLabels = {
      'shortlisted': 'Прошел в короткий список',
      'interview': 'Приглашение на собеседование',
      'hired': 'Принят на работу'
    }

    addNotificationToHistory({
      type: 'application',
      title: `${statusLabels[status]}: ${jobTitle}`,
      timestamp: new Date()
    })

    updateStats(startTime)
  } catch (error) {
    console.error('Application status simulation error:', error)
  }
}

// Утилиты
const addNotificationToHistory = (notification) => {
  recentNotifications.value.push(notification)
  
  // Ограничиваем историю 20 записями
  if (recentNotifications.value.length > 20) {
    recentNotifications.value = recentNotifications.value.slice(-20)
  }
}

const updateStats = (startTime) => {
  stats.value.totalNotifications++
  
  const responseTime = Date.now() - startTime
  stats.value.avgResponseTime = Math.round((stats.value.avgResponseTime + responseTime) / 2)
  
  // Имитируем высокую успешность
  if (Math.random() > 0.95) {
    stats.value.successRate = Math.max(95, stats.value.successRate - 1)
  }
}

const resetStats = () => {
  stats.value = {
    totalNotifications: 0,
    successRate: 100,
    avgResponseTime: 450
  }
  recentNotifications.value = []
}

const getTypeIcon = (type) => {
  const icons = {
    welcome: '🎉',
    job: '💼',
    urgent: '🚨',
    badge: '🏅',
    'corp-badge': '👑',
    application: '📝'
  }
  return icons[type] || '📱'
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  console.log('📱 Демо страница push-уведомлений загружена')
})
</script>

<style scoped>
.notifications-demo-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (max-width: 1200px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
}

.demo-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
}

.section-title {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-title {
  color: white;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.action-btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  text-align: center;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn.registration {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
}

.action-btn.job {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
}

.action-btn.urgent {
  background: linear-gradient(135deg, #FF5722 0%, #D84315 100%);
  animation: pulse 2s infinite;
}

.action-btn.badge {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
}

.action-btn.corp-badge {
  background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
}

.action-btn.status {
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.action-btn.status.success {
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
}

.action-btn.status.interview {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
}

.action-btn.status.hired {
  background: linear-gradient(135deg, #E91E63 0%, #C2185B 100%);
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.action-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  line-height: 1.4;
}

.status-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.recent-notifications {
  margin-top: 1rem;
}

.recent-title {
  color: white;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.no-notifications {
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 1rem;
  font-style: italic;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.notification-type {
  font-size: 1.25rem;
}

.notification-content {
  flex: 1;
}

.notification-title {
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
}

.notification-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
}

.notification-status {
  font-size: 1rem;
}

.settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  color: white;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.setting-checkbox {
  width: auto;
}

.setting-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  margin-top: 0.5rem;
}

.setting-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.reset-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 87, 34, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 87, 34, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 87, 34, 0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.demo-section {
  animation: slideInUp 0.6s ease-out;
}

.demo-section:nth-child(even) {
  animation-delay: 0.2s;
}
</style>
