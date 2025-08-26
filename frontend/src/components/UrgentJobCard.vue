<template>
  <div class="urgent-job-card" @click="openJobDetails">
    <!-- Бейдж срочности -->
    <div class="urgent-badge">
      <span class="urgent-text">🚨 СРОЧНО</span>
      <div v-if="job.auto_close_at" class="timer">
        ⏰ {{ formatTimeLeft(job.auto_close_at) }}
      </div>
    </div>

    <!-- Основная информация -->
    <div class="job-header">
      <h3 class="job-title">{{ job.title }}</h3>
      <div class="company-info">
        <img 
          :src="job.company_logo || '/images/default-company.png'" 
          :alt="job.company_name || job.venue_name"
          class="company-logo"
        />
        <span class="company-name">{{ job.company_name || job.venue_name }}</span>
      </div>
    </div>

    <!-- Детали работы -->
    <div class="job-details">
      <div class="detail-row">
        <span class="detail-icon">📍</span>
        <span class="detail-text">{{ job.location || 'Астана' }}</span>
      </div>
      
      <div v-if="job.needed_date" class="detail-row">
        <span class="detail-icon">📅</span>
        <span class="detail-text">
          {{ formatDate(job.needed_date) }}
          <span v-if="job.needed_time" class="time">в {{ job.needed_time }}</span>
        </span>
      </div>
      
      <div v-if="job.shift_duration" class="detail-row">
        <span class="detail-icon">⏱️</span>
        <span class="detail-text">{{ job.shift_duration }}</span>
      </div>

      <div class="detail-row salary-row">
        <span class="detail-icon">💰</span>
        <span class="salary">{{ formatSalary(job.salary_min, job.salary_max, job.pay_per_shift) }}</span>
      </div>
    </div>

    <!-- Описание -->
    <div v-if="job.description" class="job-description">
      {{ job.description }}
    </div>

    <!-- Действия -->
    <div class="card-actions">
      <button 
        class="ready-btn"
        @click.stop="handleReadyClick"
        :disabled="loading || userResponse"
        :class="{ 'responded': userResponse }"
      >
        <span class="ready-icon">🙋‍♂️</span>
        <span>{{ userResponse ? 'УЖЕ ГОТОВ' : 'ГОТОВ ВЫЙТИ!' }}</span>
        <span v-if="job.ready_responses_count" class="count">
          +{{ job.ready_responses_count }}
        </span>
      </button>

      <button class="share-btn" @click.stop="shareJob">
        📤
      </button>
    </div>

    <!-- Контактная информация (показывается после отклика) -->
    <div v-if="showContacts" class="contact-info">
      <h4>📞 Контакты для связи:</h4>
      <div v-if="job.contact_phone" class="contact-item">
        <span class="contact-icon">📱</span>
        <a :href="`tel:${job.contact_phone}`" class="contact-link">
          {{ job.contact_phone }}
        </a>
      </div>
      <div v-if="job.contact_telegram" class="contact-item">
        <span class="contact-icon">💬</span>
        <a :href="`https://t.me/${job.contact_telegram}`" class="contact-link">
          @{{ job.contact_telegram }}
        </a>
      </div>
      <div v-if="job.contact_person" class="contact-item">
        <span class="contact-icon">👤</span>
        <span>{{ job.contact_person }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  job: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['ready-click', 'share'])

const router = useRouter()
const loading = ref(false)
const userResponse = ref(false)
const showContacts = ref(false)

const handleReadyClick = async () => {
  try {
    loading.value = true
    
    // Эмуляция API-запроса
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    userResponse.value = true
    showContacts.value = true
    
    console.log('🙋‍♂️ Отклик на срочную вакансию:', props.job.id)
    emit('ready-click', props.job.id)
  } catch (error) {
    console.error('❌ Ошибка отклика:', error)
  } finally {
    loading.value = false
  }
}

const shareJob = () => {
  const url = `${window.location.origin}/jobs/${props.job.id}`
  
  if (navigator.share) {
    navigator.share({
      title: props.job.title,
      text: `Срочная вакансия: ${props.job.title}`,
      url: url
    })
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      console.log('📋 Ссылка скопирована:', url)
    })
  } else {
    console.log('📋 Ссылка для копирования:', url)
  }
  
  emit('share', props.job)
}

const openJobDetails = () => {
  console.log('Полные данные job:', props.job)
  router.push(`/jobs/${props.job.id}`)
}

// Вспомогательные функции
const formatSalary = (min, max, perShift) => {
  if (perShift) return `${perShift.toLocaleString()}₸`
  if (!min && !max) return 'По договоренности'
  if (!max) return `от ${min.toLocaleString()}₸`
  if (!min) return `до ${max.toLocaleString()}₸`
  return `${min.toLocaleString()} - ${max.toLocaleString()}₸`
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}

const formatTimeLeft = (autoCloseAt) => {
  const now = new Date()
  const closeTime = new Date(autoCloseAt)
  const diffMs = closeTime.getTime() - now.getTime()
  
  if (diffMs <= 0) return 'Истекло'
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`
  }
  return `${minutes}м`
}
</script>

<style scoped>
.urgent-job-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  border-left: 4px solid #ff6b6b;
}

.urgent-job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Бейдж срочности */
.urgent-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.urgent-text {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.timer {
  background: #ffeaa7;
  color: #d63031;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
}

/* Заголовок */
.job-header {
  margin-bottom: 12px;
}

.job-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.company-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e0e0e0;
}

.company-name {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* Детали работы */
.job-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.detail-icon {
  width: 16px;
  text-align: center;
  font-size: 14px;
}

.detail-text {
  color: #555;
  flex: 1;
}

.time {
  color: #1976d2;
  font-weight: 500;
}

.salary-row {
  font-weight: 600;
}

.salary {
  color: #2e7d32;
  font-weight: 700;
  font-size: 16px;
}

/* Описание */
.job-description {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 12px;
}

/* Действия */
.card-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ready-btn {
  flex: 1;
  background: linear-gradient(135deg, #1976d2, #1565c0);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.ready-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #1565c0, #0d47a1);
  transform: translateY(-1px);
}

.ready-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.ready-btn.responded {
  background: #4caf50;
}

.ready-icon {
  font-size: 16px;
}

.count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 12px;
}

.share-btn {
  background: #f5f5f5;
  border: none;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
}

.share-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
}

/* Контактная информация */
.contact-info {
  margin-top: 12px;
  padding: 12px;
  background: #e8f5e8;
  border-radius: 8px;
  border-left: 3px solid #4caf50;
}

.contact-info h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.contact-icon {
  width: 16px;
  text-align: center;
}

.contact-link {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
}

.contact-link:hover {
  text-decoration: underline;
}

/* Мобильная адаптация */
@media (max-width: 480px) {
  .urgent-job-card {
    padding: 12px;
    margin-bottom: 8px;
  }

  .job-title {
    font-size: 15px;
  }

  .company-logo {
    width: 28px;
    height: 28px;
  }

  .company-name {
    font-size: 13px;
  }

  .detail-row {
    font-size: 13px;
  }

  .salary {
    font-size: 15px;
  }

  .job-description {
    padding: 10px;
    font-size: 12px;
  }

  .ready-btn {
    padding: 10px 12px;
    font-size: 13px;
  }

  .share-btn {
    padding: 10px;
    font-size: 14px;
  }

  .urgent-text {
    font-size: 11px;
    padding: 3px 8px;
  }

  .timer {
    font-size: 10px;
    padding: 3px 6px;
  }
}

/* Очень маленькие экраны */
@media (max-width: 320px) {
  .urgent-job-card {
    padding: 10px;
  }

  .job-title {
    font-size: 14px;
  }

  .detail-row {
    font-size: 12px;
  }

  .job-description {
    padding: 8px;
    font-size: 11px;
  }

  .card-actions {
    flex-direction: column;
    gap: 6px;
  }

  .ready-btn {
    width: 100%;
  }
}
</style>
