<template>
  <div class="job-card" :class="{ urgent: job.is_urgent }">
    <!-- Заголовок карточки -->
    <div class="job-header">
      <div class="job-title-section">
        <h3 class="job-title">{{ job.title }}</h3>
        <div class="job-badges">
          <span v-if="job.is_urgent" class="urgent-badge">🚨 Срочно</span>
          <span v-if="job.is_remote" class="remote-badge">🏠 Удаленно</span>
          <span v-if="job.work_type" class="work-type-badge">{{ getWorkTypeText(job.work_type) }}</span>
        </div>
      </div>
      
      <button 
        @click="$emit('favorite', job.id)" 
        :class="['favorite-btn', { active: job.is_favorite }]"
        :title="job.is_favorite ? 'Убрать из избранного' : 'Добавить в избранное'"
      >
        {{ job.is_favorite ? '❤️' : '🤍' }}
      </button>
    </div>

    <!-- Компания -->
    <div class="company-info">
      <div class="company-logo">
        <img 
          v-if="job.company?.logo_url" 
          :src="job.company.logo_url" 
          :alt="job.company.name"
          class="company-logo-img"
        />
        <div v-else class="company-logo-placeholder">
          {{ getCompanyInitials(job.company?.name) }}
        </div>
      </div>
      <div class="company-details">
        <h4 class="company-name">{{ job.company?.name || 'Компания не указана' }}</h4>
        <p class="company-location">📍 {{ getCityName(job.city_id) }}</p>
      </div>
    </div>

    <!-- Описание -->
    <div class="job-description">
      <p>{{ getShortDescription(job.description) }}</p>
    </div>

    <!-- Зарплата -->
    <div v-if="job.salary_from || job.salary_to" class="salary-info">
      <span class="salary-text">💰 {{ formatSalary(job.salary_from, job.salary_to) }}</span>
    </div>

    <!-- Теги специализации -->
    <div v-if="job.specialization" class="job-tags">
      <span class="specialization-tag">🎯 {{ job.specialization.name }}</span>
    </div>

    <!-- Нижняя часть карточки -->
    <div class="job-footer">
      <div class="job-meta">
        <span class="published-date">📅 {{ formatDate(job.created_at) }}</span>
        <span v-if="job.applications_count" class="applications-count">
          👥 {{ job.applications_count }} откликов
        </span>
      </div>
      
      <div class="job-actions">
        <router-link 
          :to="`/jobs/${job.id}`" 
          class="btn-view"
        >
          Подробнее
        </router-link>
        
        <button 
          v-if="userType === 'candidate' && !job.has_applied"
          @click="$emit('apply', job.id)"
          class="btn-apply"
          :disabled="job.is_closed"
        >
          {{ job.is_closed ? 'Закрыта' : 'Откликнуться' }}
        </button>
        
        <span v-else-if="job.has_applied" class="applied-status">
          ✅ Отклик отправлен
        </span>
      </div>
    </div>

    <!-- Подсветка поисковых терминов -->
    <div v-if="searchQuery" class="search-highlight">
      <small>Найдено по запросу: "{{ searchQuery }}"</small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useReferenceStore } from '@/stores/reference'

const props = defineProps({
  job: {
    type: Object,
    required: true
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['favorite', 'apply'])

const authStore = useAuthStore()
const referenceStore = useReferenceStore()

// Вычисляемые свойства
const userType = computed(() => authStore.user?.user_metadata?.user_type)

// Методы
const getWorkTypeText = (workType) => {
  const types = {
    'full_time': 'Полная',
    'part_time': 'Частичная',
    'remote': 'Удаленно',
    'freelance': 'Фриланс'
  }
  return types[workType] || workType
}

const getCompanyInitials = (companyName) => {
  if (!companyName) return '?'
  return companyName
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
}

const getCityName = (cityId) => {
  const city = referenceStore.cities.find(c => c.id === cityId)
  return city ? city.name : 'Не указан'
}

const getShortDescription = (description) => {
  if (!description) return 'Описание отсутствует'
  return description.length > 150 
    ? description.substring(0, 150) + '...' 
    : description
}

const formatSalary = (from, to) => {
  const formatter = new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0
  })
  
  if (from && to) {
    return `${formatter.format(from)} - ${formatter.format(to)}`
  } else if (from) {
    return `от ${formatter.format(from)}`
  } else if (to) {
    return `до ${formatter.format(to)}`
  }
  return 'По договоренности'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'Меньше часа назад'
  } else if (diffInHours < 24) {
    return `${diffInHours} ч. назад`
  } else if (diffInHours < 48) {
    return 'Вчера'
  } else {
    return date.toLocaleDateString('ru-KZ', {
      day: 'numeric',
      month: 'short'
    })
  }
}
</script>

<style scoped>
.job-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e3e8ee;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.job-card.urgent {
  border-left: 4px solid #dc2626;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.job-title-section {
  flex: 1;
}

.job-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.job-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.urgent-badge {
  background: #fee2e2;
  color: #dc2626;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.remote-badge,
.work-type-badge {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.favorite-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.company-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.company-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.company-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-logo-placeholder {
  width: 100%;
  height: 100%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-weight: 500;
  font-size: 14px;
}

.company-name {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin: 0 0 4px 0;
}

.company-location {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.job-description {
  margin-bottom: 16px;
}

.job-description p {
  color: #4b5563;
  line-height: 1.5;
  margin: 0;
}

.salary-info {
  margin-bottom: 16px;
}

.salary-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #059669;
}

.job-tags {
  margin-bottom: 16px;
}

.specialization-tag {
  background: #f0f9ff;
  color: #0284c7;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.job-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.published-date,
.applications-count {
  font-size: 13px;
  color: #6b7280;
}

.job-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-view,
.btn-apply {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-view {
  background: #f3f4f6;
  color: #374151;
}

.btn-view:hover {
  background: #e5e7eb;
}

.btn-apply {
  background: #3b82f6;
  color: white;
}

.btn-apply:hover:not(:disabled) {
  background: #2563eb;
}

.btn-apply:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.applied-status {
  color: #059669;
  font-size: 14px;
  font-weight: 500;
}

.search-highlight {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #fef3c7;
  color: #92400e;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

@media (max-width: 768px) {
  .job-card {
    padding: 16px;
  }
  
  .job-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .favorite-btn {
    align-self: flex-end;
  }
  
  .job-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .job-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
