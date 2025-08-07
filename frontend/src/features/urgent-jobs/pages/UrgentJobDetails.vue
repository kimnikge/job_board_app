<template>
  <div class="urgent-job-details-page">
    <div class="container">
      <!-- Индикатор загрузки -->
      <div v-if="loading" class="loading-container">
        <LoadingSpinner />
        <p>Загружаем информацию о вакансии...</p>
      </div>

      <!-- Ошибка загрузки -->
      <div v-else-if="error" class="error-container glass-card">
        <h2>❌ Ошибка загрузки</h2>
        <p>{{ error }}</p>
        <BaseButton @click="goBack">Вернуться назад</BaseButton>
      </div>

      <!-- Детали вакансии -->
      <div v-else-if="job" class="job-details">
        <!-- Заголовок вакансии -->
        <header class="job-header glass-card">
          <div class="job-status">
            <span class="urgent-badge">🚨 СРОЧНО</span>
            <span class="status-badge" :class="job.status">
              {{ getStatusText(job.status) }}
            </span>
          </div>

          <h1 class="job-title">{{ job.title }}</h1>
          
          <div class="job-meta">
            <div class="meta-item">
              <span class="meta-icon">{{ job.specializations?.icon }}</span>
              <span class="meta-text">{{ job.specializations?.name }}</span>
            </div>
            
            <div class="meta-item">
              <span class="meta-icon">🏪</span>
              <span class="meta-text">{{ job.venue_name }}</span>
            </div>
            
            <div class="meta-item">
              <span class="meta-icon">📍</span>
              <span class="meta-text">{{ job.city_districts?.name }}, Астана</span>
            </div>
            
            <div class="meta-item salary">
              <span class="meta-icon">��</span>
              <span class="meta-text">{{ formatSalary(job) }}</span>
            </div>
          </div>

          <div class="timing-info">
            <div class="timing-item">
              <span class="timing-label">Нужен к:</span>
              <span class="timing-value urgent">{{ formatDate(job.needed_by) }}</span>
            </div>
            
            <div v-if="job.is_immediate" class="immediate-flag">
              🔥 Требуется немедленно
            </div>
            
            <div v-if="job.auto_close_at" class="auto-close">
              ⏰ Автозакрытие: {{ formatDateTime(job.auto_close_at) }}
            </div>
          </div>
        </header>

        <!-- Основная информация -->
        <div class="job-content">
          <div class="content-left">
            <!-- Описание -->
            <section class="job-section glass-card">
              <h3>📝 Описание вакансии</h3>
              <div class="section-content">
                <p class="job-description">{{ job.description }}</p>
              </div>
            </section>

            <!-- Требования -->
            <section v-if="job.requirements" class="job-section glass-card">
              <h3>✅ Требования</h3>
              <div class="section-content">
                <p class="job-requirements">{{ job.requirements }}</p>
              </div>
            </section>

            <!-- Что предлагаем -->
            <section v-if="job.benefits" class="job-section glass-card">
              <h3>🎁 Что предлагаем</h3>
              <div class="section-content">
                <p class="job-benefits">{{ job.benefits }}</p>
              </div>
            </section>
          </div>

          <div class="content-right">
            <!-- Действия -->
            <section class="action-section glass-card">
              <h3>⚡ Быстрый отклик</h3>
              
              <div v-if="!hasResponded" class="action-content">
                <p class="action-description">
                  Готовы приступить к работе? Нажмите кнопку ниже для быстрого отклика.
                </p>
                
                <BaseButton
                  @click="respondToJob"
                  variant="danger"
                  size="large"
                  :loading="responding"
                  :disabled="job.status !== 'active'"
                  class="respond-button"
                >
                  {{ responding ? 'Отправляем...' : '✋ ГОТОВ ВЫЙТИ' }}
                </BaseButton>
                
                <p class="action-note">
                  Ваш отклик будет отправлен работодателю мгновенно
                </p>
              </div>

              <div v-else class="responded-state">
                <div class="success-icon">✅</div>
                <h4>Отклик отправлен!</h4>
                <p>Ваш отклик получен. Работодатель свяжется с вами в ближайшее время.</p>
                
                <div class="response-time">
                  Отклик отправлен: {{ formatDateTime(userResponse.created_at) }}
                </div>
              </div>
            </section>

            <!-- Условия работы -->
            <section class="conditions-section glass-card">
              <h3>📋 Условия работы</h3>
              
              <div class="conditions-content">
                <div class="condition-item">
                  <span class="condition-label">График:</span>
                  <span class="condition-value">{{ getScheduleText(job.work_schedule) }}</span>
                </div>
                
                <div class="condition-item">
                  <span class="condition-label">Тип заведения:</span>
                  <span class="condition-value">{{ job.venue_types?.name }}</span>
                </div>
                
                <div v-if="job.address" class="condition-item">
                  <span class="condition-label">Адрес:</span>
                  <span class="condition-value">{{ job.address }}</span>
                </div>
              </div>
            </section>

            <!-- Контакты -->
            <section class="contact-section glass-card">
              <h3>📞 Контакты</h3>
              
              <div class="contact-content">
                <div class="contact-item">
                  <span class="contact-label">Контактное лицо:</span>
                  <span class="contact-value">{{ job.contact_person }}</span>
                </div>
                
                <div class="contact-item">
                  <span class="contact-label">Телефон:</span>
                  <a :href="`tel:${job.contact_phone}`" class="contact-phone">
                    {{ job.contact_phone }}
                  </a>
                </div>
              </div>
            </section>

            <!-- Статистика -->
            <section class="stats-section glass-card">
              <h3>📊 Статистика</h3>
              
              <div class="stats-content">
                <div class="stat-item">
                  <span class="stat-value">{{ job.response_count || 0 }}</span>
                  <span class="stat-label">откликов</span>
                </div>
                
                <div class="stat-item">
                  <span class="stat-value">{{ timeAgo(job.created_at) }}</span>
                  <span class="stat-label">назад</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <!-- Навигация -->
        <div class="job-navigation">
          <BaseButton @click="goBack" variant="secondary">
            ← Вернуться к списку
          </BaseButton>
          
          <BaseButton @click="shareJob" variant="outline">
            📤 Поделиться
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/shared/ui/BaseButton.vue'
import LoadingSpinner from '@/shared/ui/LoadingSpinner.vue'
import { useUrgentJobs } from '../composables/useUrgentJobs'
import { useNotifications } from '@/shared/composables/useNotifications'
import { useAuth } from '@/shared/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { getUrgentJobById, respondToUrgentJob, getUserResponse } = useUrgentJobs()
const { showNotification } = useNotifications()
const { user } = useAuth()

// Состояние
const loading = ref(true)
const error = ref(null)
const job = ref(null)
const responding = ref(false)
const userResponse = ref(null)

// Вычисляемые свойства
const hasResponded = computed(() => {
  return userResponse.value !== null
})

// Методы форматирования
const formatSalary = (job) => {
  if (job.salary_max && job.salary_max > job.salary_min) {
    return `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ₸`
  }
  return `от ${job.salary_min.toLocaleString()} ₸`
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const timeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins} мин`
  if (diffHours < 24) return `${diffHours} ч`
  return `${diffDays} дн`
}

const getStatusText = (status) => {
  const statusMap = {
    active: 'Активна',
    closed: 'Закрыта',
    filled: 'Заполнена',
    expired: 'Истекла'
  }
  return statusMap[status] || status
}

const getScheduleText = (schedule) => {
  const scheduleMap = {
    full_time: 'Полный день',
    part_time: 'Неполный день', 
    shift_work: 'Сменный график',
    flexible: 'Гибкий график'
  }
  return scheduleMap[schedule] || schedule
}

// Методы действий
const respondToJob = async () => {
  if (!user.value) {
    showNotification('Для отклика необходимо войти в систему', 'error')
    router.push('/auth/login')
    return
  }

  responding.value = true

  try {
    await respondToUrgentJob(job.value.id)
    userResponse.value = { created_at: new Date().toISOString() }
    showNotification('Отклик успешно отправлен!', 'success')
  } catch (error) {
    console.error('Ошибка отклика:', error)
    showNotification('Ошибка при отправке отклика', 'error')
  } finally {
    responding.value = false
  }
}

const goBack = () => {
  router.push('/urgent')
}

const shareJob = async () => {
  const url = window.location.href
  const text = `🚨 Срочная вакансия: ${job.value.title} в ${job.value.venue_name}`

  if (navigator.share) {
    try {
      await navigator.share({ title: text, url })
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(`${text}\n${url}`)
      showNotification('Ссылка скопирована в буфер обмена', 'success')
    }
  } else {
    await navigator.clipboard.writeText(`${text}\n${url}`)
    showNotification('Ссылка скопирована в буфер обмена', 'success')
  }
}

// Инициализация
const loadJobData = async () => {
  try {
    loading.value = true
    const jobId = route.params.id

    // Загружаем данные вакансии
    job.value = await getUrgentJobById(jobId)

    // Если пользователь авторизован, проверяем наличие отклика
    if (user.value) {
      userResponse.value = await getUserResponse(jobId)
    }

  } catch (err) {
    console.error('Ошибка загрузки вакансии:', err)
    error.value = 'Не удалось загрузить информацию о вакансии'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadJobData()
})
</script>

<style scoped>
.urgent-job-details-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.error-container {
  text-align: center;
  padding: 2rem;
  max-width: 500px;
  margin: 2rem auto;
}

.job-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.job-header {
  padding: 2rem;
  border-radius: 20px;
}

.job-status {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.urgent-badge {
  background: var(--color-danger);
  color: #fff;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: var(--color-primary);
  color: #fff;
}

.job-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 1.5rem 0;
  line-height: 1.2;
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.meta-item.salary {
  font-weight: 600;
  color: var(--color-primary);
  font-size: 1.1rem;
}

.meta-icon {
  font-size: 1.2rem;
}

.timing-info {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: center;
  padding: 1rem;
  background: rgba(245, 87, 108, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(245, 87, 108, 0.3);
}

.timing-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.timing-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.timing-value.urgent {
  font-weight: 600;
  color: var(--color-danger);
  font-size: 1.1rem;
}

.immediate-flag {
  color: var(--color-danger);
  font-weight: 600;
  background: rgba(245, 87, 108, 0.2);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.auto-close {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.job-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.content-left {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.content-right {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.job-section, .action-section, .conditions-section, .contact-section, .stats-section {
  padding: 1.5rem;
  border-radius: 16px;
}

.job-section h3, .action-section h3, .conditions-section h3, .contact-section h3, .stats-section h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 1rem 0;
}

.section-content {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.action-content {
  text-align: center;
}

.action-description {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.respond-button {
  width: 100%;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 1rem;
  margin-bottom: 1rem;
}

.action-note {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.responded-state {
  text-align: center;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.responded-state h4 {
  color: var(--color-primary);
  margin: 0 0 0.5rem 0;
}

.response-time {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 1rem;
}

.conditions-content, .contact-content {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.condition-item, .contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.condition-label, .contact-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.condition-value, .contact-value {
  color: #fff;
  font-weight: 500;
  text-align: right;
}

.contact-phone {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.contact-phone:hover {
  text-decoration: underline;
}

.stats-content {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.job-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }

  .job-title {
    font-size: 2rem;
  }

  .job-meta {
    flex-direction: column;
    gap: 1rem;
  }

  .timing-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .job-content {
    grid-template-columns: 1fr;
  }

  .job-navigation {
    flex-direction: column;
  }

  .condition-item, .contact-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }

  .condition-value, .contact-value {
    text-align: left;
  }
}
</style>
