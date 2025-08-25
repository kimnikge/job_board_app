<template>
  <div 
    class="urgent-job-card glass-card-hover animate-slide-up animate-urgent-pulse"
    :class="{ 'highlighted': job.is_highlighted }"
    @click="openJobDetails"
    style="cursor: pointer;"
    @click.capture="console.log('Клик зафиксирован на карточке')"
  >
    <!-- Бейдж срочности -->
    <div class="urgent-badge">
      <span class="urgent-icon">🚨</span>
      <span class="urgent-text">СРОЧНО</span>
    </div>

    <!-- Таймер автозакрытия -->
    <div v-if="job.auto_close_at" class="auto-close-timer">
      <span class="timer-icon">⏰</span>
      <span class="timer-text">Закроется через {{ formatTimeLeft(job.auto_close_at) }}</span>
    </div>

    <!-- Основная информация о работе -->
    <div class="card-header">
      <div class="specialization-tag" :class="getSpecializationClass(job.specialization_id)">
        <span class="spec-icon">{{ getSpecializationIcon(job.specialization_id) }}</span>
        <span class="spec-name">{{ job.specializations?.name || job.employment_type }}</span>
      </div>
      <div class="priority-indicator" :class="getPriorityClass(job.notification_priority || 3)">
        Приоритет {{ job.notification_priority || 3 }}
      </div>
    </div>

    <h3 class="job-title">{{ job.title }}</h3>

    <!-- Информация о заведении -->
    <div class="venue-info">
      <img 
        :src="job.company_logo || '/images/default-company.png'" 
        :alt="job.company_name || job.venue_name"
        class="venue-logo"
      />
      <div class="venue-details">
        <span class="venue-name">{{ job.company_name || job.venue_name }}</span>
        <span v-if="job.venue_types?.name" class="venue-type">{{ job.venue_types.name }}</span>
      </div>
    </div>

    <!-- Детали работы -->
    <div class="job-details">
      <div class="detail-item">
        <span class="detail-icon">📍</span>
        <span>{{ job.location || job.city_districts?.name || 'Астана' }}</span>
        <span v-if="job.address" class="address">, {{ job.address }}</span>
      </div>
      
      <div v-if="job.needed_date" class="detail-item">
        <span class="detail-icon">📅</span>
        <span>{{ formatDate(job.needed_date) }}</span>
        <span v-if="job.needed_time" class="needed-time">в {{ job.needed_time }}</span>
      </div>
      
      <div v-if="job.shift_duration" class="detail-item">
        <span class="detail-icon">⏱️</span>
        <span>Смена {{ job.shift_duration }}</span>
      </div>

      <div class="detail-item salary-item">
        <span class="detail-icon">💰</span>
        <span class="salary-amount">{{ formatSalary(job.salary_min, job.salary_max, job.pay_per_shift) }}</span>
        <span class="currency-badge">KZT</span>
      </div>
    </div>

    <!-- Описание работы -->
    <div v-if="job.description && job.description.length > 0" class="job-description">
      {{ job.description }}
    </div>

    <!-- Теги специализаций -->
    <div v-if="job.tags && job.tags.length > 0" class="job-tags">
      <span 
        v-for="tag in job.tags" 
        :key="tag"
        class="tag"
      >
        {{ tag }}
      </span>
    </div>

    <!-- Действия -->
    <div class="card-footer">
      <button 
        class="ready-btn btn-gradient animate-ready-glow"
        @click.stop="handleReadyClick"
        :disabled="loading || userResponse"
      >
        <span class="ready-icon">🙋‍♂️</span>
        <span>{{ userResponse ? 'УЖЕ ГОТОВ' : 'ГОТОВ ВЫЙТИ!' }}</span>
        <span v-if="job.ready_responses_count" class="responses-count">
          +{{ job.ready_responses_count }}
        </span>
      </button>

      <div class="action-buttons">
        <button 
          class="view-details"
          @click.stop="openJobDetails"
        >
          Подробнее
        </button>
        
        <button class="share-btn" @click.stop="shareJob">
          <span>📤</span>
        </button>
      </div>
    </div>

    <!-- Контактная информация (показывается после отклика) -->
    <div v-if="showContacts" class="contact-info glass-card animate-slide-up">
      <h4>📞 Контакты для срочной связи:</h4>
      <div v-if="job.contact_phone" class="contact-item">
        <span class="contact-icon">📱</span>
        <a :href="`tel:${job.contact_phone}`" class="contact-phone">
          {{ job.contact_phone }}
        </a>
      </div>
      <div v-if="job.contact_telegram" class="contact-item">
        <span class="contact-icon">💬</span>
        <a :href="`https://t.me/${job.contact_telegram}`" class="contact-telegram">
          @{{ job.contact_telegram }}
        </a>
      </div>
      <div v-if="job.contact_person" class="contact-person">
        <span class="contact-icon">👤</span>
        <span>{{ job.contact_person }}</span>
      </div>
    </div>

    <!-- Статус отклика -->
    <div v-if="userResponse" class="response-status">
      <div class="status-icon">✅</div>
      <div class="status-text">Вы уже откликнулись на эту вакансию</div>
      <div class="status-time">{{ formatTime(userResponse.created_at) }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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
const showContacts = ref(false)
const userResponse = ref(null) // TODO: загружать из API

// Методы
const handleReadyClick = async () => {
  if (loading.value || userResponse.value) return
  
  loading.value = true
  try {
    emit('ready-click', props.job.id)
    showContacts.value = true
    // Имитация отклика
    userResponse.value = { created_at: new Date() }
  } catch (error) {
    console.error('Ошибка отклика:', error)
  } finally {
    loading.value = false
  }
}

const shareJob = () => {
  emit('share', props.job)
  // TODO: Реализовать шэринг
}

const openJobDetails = () => {
  console.log('openJobDetails вызван для job.id:', props.job.id)
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

const formatTime = (datetime) => {
  return new Date(datetime).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
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

const getSpecializationIcon = (id) => {
  const icons = {
    1: '👨‍🍳', // Повар
    2: '👩‍🍳', // Су-шеф  
    3: '🔥', // Шеф-повар
    4: '🍳', // Повар-универсал
    5: '🥩', // Повар на мангале
    6: '🧁', // Кондитер
    7: '🍕', // Пиццайоло
    8: '🙋‍♂️', // Официант
    9: '🙋‍♀️', // Старший официант
    10: '🍹', // Бармен
    11: '☕', // Бариста
    12: '💁‍♀️', // Хостес
    13: '🍷', // Сомелье
    14: '📋', // Администратор зала
    15: '⚡', // Менеджер смены
    16: '👔', // Управляющий
  }
  return icons[id] || '👤'
}

const getSpecializationClass = (id) => {
  if (!id) return 'spec-support'
  if (id <= 7) return 'spec-kitchen'
  if (id <= 13) return 'spec-service'
  if (id <= 16) return 'spec-management'
  return 'spec-support'
}

const getPriorityClass = (priority) => {
  if (priority >= 4) return 'priority-high'
  if (priority >= 3) return 'priority-medium'
  return 'priority-low'
}
</script>

<style scoped>
.urgent-job-card {
  position: relative;
  padding: 24px;
  margin-bottom: 20px;
  border: 2px solid var(--color-danger);
  border-radius: 20px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  overflow: hidden;
  /* Улучшаем адаптивность */
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  word-wrap: break-word;
  /* Принудительно убираем горизонтальный скролл */
  overflow-x: hidden;
}

.urgent-job-card.highlighted {
  border-color: var(--color-warning);
  box-shadow: 0 0 30px rgba(255, 193, 7, 0.3);
}

/* Бейдж срочности */
.urgent-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--gradient-urgent);
  color: white;
  padding: 8px 16px;
  border-radius: 0 18px 0 18px;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: var(--shadow-md);
}

.urgent-icon {
  font-size: 1.1rem;
  animation: flash 1.5s infinite;
}

/* Таймер */
.auto-close-timer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 12px;
  color: #FFC107;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Заголовок */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.specialization-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
}

.spec-kitchen { background: rgba(255, 107, 53, 0.2); color: #ff6b35; }
.spec-service { background: rgba(78, 205, 196, 0.2); color: #4ecdc4; }
.spec-management { background: rgba(69, 183, 209, 0.2); color: #45b7d1; }
.spec-support { background: rgba(150, 206, 180, 0.2); color: #96ceb4; }

.priority-indicator {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.priority-high { background: rgba(245, 87, 108, 0.2); color: var(--color-danger); }
.priority-medium { background: rgba(255, 152, 0, 0.2); color: #ff9800; }
.priority-low { background: rgba(158, 158, 158, 0.2); color: #9e9e9e; }

/* Заголовок работы */
.job-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 16px;
  /* Улучшаем переносы для заголовка */
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.3;
  max-width: 100%;
}

/* Информация о заведении */
.venue-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.venue-logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid var(--glass-border);
}

.venue-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.venue-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 1.1rem;
}

.venue-type {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

/* Детали работы */
.job-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.detail-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.salary-item {
  font-weight: 600;
  font-size: 1.05rem;
}

.salary-amount {
  color: var(--color-salary-kzt);
  font-weight: 700;
  font-size: 1.2rem;
}

.currency-badge {
  background: var(--color-salary-kzt);
  color: black;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-left: 6px;
}

.needed-time {
  color: var(--color-primary);
  font-weight: 600;
}

.address {
  opacity: 0.8;
}

/* Описание */
.job-description {
  background: var(--glass-bg-hover);
  padding: 12px;
  border-radius: 12px;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 16px;
  border: 1px solid var(--glass-border);
  /* Исправляем переносы текста */
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  max-width: 100%;
  box-sizing: border-box;
}

/* Теги */
.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag {
  background: var(--glass-bg-hover);
  color: var(--color-text-secondary);
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.8rem;
  border: 1px solid var(--glass-border);
}

/* Действия */
.card-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ready-btn {
  padding: 16px 24px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
  border: none;
  cursor: pointer;
}

.ready-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ready-icon {
  font-size: 1.2rem;
}

.responses-count {
  background: white;
  color: var(--color-success);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 900;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.view-details,
.share-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--color-text-primary);
  border-radius: 12px;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.view-details:hover,
.share-btn:hover {
  background: var(--glass-bg-hover);
  transform: translateY(-2px);
  text-decoration: none;
}

.share-btn {
  font-size: 1.1rem;
  cursor: pointer;
}

/* Контакты */
.contact-info {
  margin-top: 16px;
  padding: 16px;
  border-radius: 12px;
}

.contact-info h4 {
  margin-bottom: 12px;
  color: var(--color-text-primary);
  font-size: 1rem;
}

.contact-item,
.contact-person {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.contact-phone,
.contact-telegram {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.contact-phone:hover,
.contact-telegram:hover {
  text-decoration: underline;
}

/* Статус отклика */
.response-status {
  margin-top: 16px;
  padding: 12px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-success);
}

.status-text {
  flex: 1;
  font-weight: 600;
}

.status-time {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Адаптивность */
@media (max-width: 768px) {
  .urgent-job-card {
    padding: 16px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .job-title {
    font-size: 1.2rem;
  }
  
  .venue-info {
    flex-direction: column;
    align-items: flex-start;
  }
}

.tag {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-details {
  display: flex;
  align-items: center;
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  margin-left: 6px;
  transition: transform 0.3s;
}

.view-details:hover .arrow-icon {
  transform: translateX(4px);
}

.posted-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

/* Responsive Design согласно плану разработки */
@media (max-width: 480px) {
  .urgent-job-card {
    padding: 12px;
    margin: 8px 0;
    border-radius: 16px;
    /* Убираем ограничения ширины */
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
  }

  .specialization-tag {
    padding: 4px 8px;
    font-size: 0.7rem;
  }

  .priority-indicator {
    padding: 3px 6px;
    font-size: 0.65rem;
  }

  .job-title {
    font-size: 1rem;
    line-height: 1.3;
    margin: 10px 0;
    /* Добавляем перенос слов */
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  }

  .venue-info {
    flex-direction: row;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .venue-logo {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .venue-details {
    flex: 1;
    min-width: 0;
  }

  .venue-name {
    font-size: 0.85rem;
    word-wrap: break-word;
  }

  .venue-type {
    font-size: 0.75rem;
  }

  .job-details {
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .detail-item {
    gap: 6px;
    font-size: 0.8rem;
    width: 100%;
    /* Обеспечиваем перенос */
    word-wrap: break-word;
  }

  .detail-icon {
    flex-shrink: 0;
    font-size: 0.9rem;
  }

  .salary-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .salary-amount {
    font-size: 1.1rem;
  }

  .card-footer {
    flex-direction: column;
    gap: 12px;
  }

  .ready-btn {
    width: 100%;
    padding: 14px;
    font-size: 0.9rem;
  }

  .action-buttons {
    width: 100%;
    justify-content: space-between;
  }

  .view-details {
    flex: 1;
    justify-content: center;
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }

  .share-btn {
    padding: 10px 12px;
  }

  .contact-info {
    margin-top: 12px;
    padding: 12px;
  }

  .contact-info h4 {
    font-size: 0.9rem;
    margin-bottom: 8px;
  }

  .contact-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin-bottom: 8px;
  }

  .urgent-badge {
    padding: 6px 10px;
    font-size: 0.75rem;
  }

  .auto-close-timer {
    padding: 6px 10px;
    font-size: 0.75rem;
  }

  .job-tags {
    gap: 6px;
  }

  .tag {
    padding: 3px 8px;
    font-size: 0.7rem;
  }

  /* ВАЖНО: Стили для описания работы на мобильных */
  .job-description {
    padding: 8px;
    font-size: 0.8rem;
    line-height: 1.4;
    margin-bottom: 12px;
    /* Принудительные переносы */
    word-wrap: break-word !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
    white-space: pre-wrap !important;
    max-width: 100% !important;
    width: 100% !important;
    box-sizing: border-box !important;
    /* Убираем ограничения высоты */
    max-height: none !important;
    overflow: visible !important;
    /* Улучшаем перенос */
    hyphens: auto;
    -webkit-hyphens: auto;
    -moz-hyphens: auto;
    -ms-hyphens: auto;
  }
}

@media (max-width: 768px) {
  .urgent-job-card {
    padding: 16px;
    margin-bottom: 16px;
  }

  .urgent-badge {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .job-title {
    font-size: 1.1rem;
    line-height: 1.3;
  }

  .venue-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .venue-name {
    font-size: 1rem;
  }

  .job-details {
    flex-direction: column;
    gap: 8px;
  }

  .detail-item {
    font-size: 0.9rem;
  }

  .salary-amount {
    font-size: 1.1rem;
  }

  .job-description {
    padding: 10px;
    font-size: 0.85rem;
    /* Дополнительные правила для мобильных */
    line-height: 1.4;
    word-spacing: normal;
    letter-spacing: 0;
  }

  .job-tags {
    gap: 6px;
  }

  .tag {
    padding: 3px 6px;
    font-size: 0.75rem;
  }

  .card-footer {
    flex-direction: column;
    gap: 10px;
  }

  .ready-btn {
    width: 100%;
    padding: 14px 20px;
    font-size: 1rem;
    min-height: 48px; /* Touch target */
  }

  .action-buttons {
    justify-content: space-between;
    width: 100%;
    gap: 8px;
  }

  .action-buttons .action-btn {
    flex: 1;
    min-height: 44px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .urgent-job-card {
    padding: 12px;
    border-radius: 16px;
    /* Исправляем проблемы с шириной на маленьких экранах */
    min-width: 0;
    overflow-wrap: break-word;
  }

  .job-title {
    font-size: 1rem;
    line-height: 1.2;
    margin-bottom: 12px;
  }

  .venue-name {
    font-size: 0.9rem;
  }

  .detail-item {
    font-size: 0.85rem;
    word-break: break-all;
  }

  .salary-amount {
    font-size: 1rem;
  }

  .job-description {
    padding: 8px;
    font-size: 0.8rem;
    line-height: 1.3;
    margin-bottom: 12px;
    /* Дополнительно улучшаем для маленьких экранов */
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    max-height: 4.8em; /* примерно 4 строки */
  }

  .ready-btn {
    padding: 12px 16px;
    font-size: 0.9rem;
  }

  .action-buttons .action-btn {
    padding: 8px 12px;
    font-size: 0.8rem;
  }

  /* Улучшаем отображение бейджа срочности */
  .urgent-badge {
    padding: 4px 8px;
    font-size: 0.7rem;
    border-radius: 0 16px 0 16px;
  }

  .urgent-text {
    font-size: 0.65rem;
  }
}

/* Дополнительные стили для очень маленьких экранов */
@media (max-width: 360px) {
  .urgent-job-card {
    padding: 8px;
    margin-bottom: 12px;
  }

  .job-title {
    font-size: 0.95rem;
    line-height: 1.2;
  }

  .job-description {
    padding: 6px;
    font-size: 0.75rem;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    max-height: 3.6em;
  }

  .detail-item {
    font-size: 0.8rem;
  }

  .venue-info {
    gap: 6px;
  }

  .venue-logo {
    width: 30px;
    height: 30px;
  }

  .venue-name {
    font-size: 0.85rem;
  }
}

@media (max-width: 1024px) {
  .urgent-job-card {
    padding: 20px;
  }

  .venue-info {
    flex-direction: row;
    gap: 12px;
  }

  .job-details {
    flex-wrap: wrap;
    gap: 12px;
  }

  .detail-item {
    min-width: calc(50% - 6px);
  }
}

/* Дополнительные стили для iPhone Pro Max и больших мобильных экранов */
@media (max-width: 430px) {
  .urgent-job-card {
    padding: 10px;
    margin: 6px 0;
    border-radius: 12px;
  }

  .job-title {
    font-size: 0.95rem;
    line-height: 1.25;
    margin: 8px 0;
  }

  .job-description {
    padding: 6px;
    font-size: 0.75rem;
    line-height: 1.3;
    margin-bottom: 10px;
    border-radius: 8px;
  }

  .urgent-badge {
    padding: 4px 8px;
    font-size: 0.7rem;
    border-radius: 0 12px 0 12px;
  }

  .venue-info {
    gap: 8px;
    margin-bottom: 10px;
  }

  .venue-logo {
    width: 32px;
    height: 32px;
  }

  .venue-name {
    font-size: 0.8rem;
  }

  .venue-type {
    font-size: 0.7rem;
  }

  .detail-item {
    font-size: 0.75rem;
    gap: 4px;
  }

  .detail-icon {
    font-size: 0.8rem;
  }
}
</style>