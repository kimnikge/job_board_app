<template>
  <div class="urgent-jobs-page">
    <div class="page-header">
      <h1>⚡ Срочные вакансии</h1>
      <p>Найди работу на сегодня!</p>
    </div>
    
    <div class="page-content">
      <div class="loading-state" v-if="isLoading">
        <div class="loading-spinner"></div>
        <p>Загружаем срочные вакансии...</p>
      </div>
      
      <div class="error-state" v-else-if="error">
        <div class="error-icon">⚠️</div>
        <h3>Упс! Что-то пошло не так</h3>
        <p>{{ error }}</p>
        <button @click="loadUrgentJobs" class="retry-btn">Попробовать снова</button>
      </div>
      
      <div class="jobs-list" v-else>
        <UrgentJobCard 
          v-for="job in urgentJobs" 
          :key="job.id" 
          :job="job"
          @ready-click="handleReadyClick"
          @share="handleShare"
          class="job-item"
        />
        
        <div v-if="urgentJobs.length === 0" class="empty-state">
          <div class="empty-icon">🎯</div>
          <h3>Пока нет срочных вакансий</h3>
          <p>Заходи позже или создай свою вакансию</p>
          <router-link to="/jobs" class="explore-btn">Посмотреть все вакансии</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useJobsStore } from '@/stores/jobs'
import UrgentJobCard from '@/components/UrgentJobCard.vue'
import { getUrgentJobs } from '@/data'

const jobsStore = useJobsStore()
const urgentJobs = ref([])
const isLoading = ref(true)
const error = ref(null)

const loadUrgentJobs = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    // Загружаем из локальных тестовых данных
    urgentJobs.value = getUrgentJobs()
    
    console.log('✅ Загружено срочных вакансий:', urgentJobs.value.length)
    console.log('📋 Данные:', urgentJobs.value)
    
  } catch (err) {
    console.error('❌ Ошибка загрузки срочных вакансий:', err)
    error.value = err.message || 'Не удалось загрузить вакансии'
    
    // Fallback на встроенные демо данные
    urgentJobs.value = getDemoUrgentJobs()
    
  } finally {
    isLoading.value = false
  }
}

const handleReadyClick = async (jobId) => {
  try {
    console.log('🙋‍♂️ Отклик на срочную вакансию:', jobId)
    // TODO: Реализовать отклик через API
    // await jobsStore.applyToUrgentJob(jobId)
  } catch (err) {
    console.error('❌ Ошибка отклика:', err)
  }
}

const handleShare = (job) => {
  // Простое копирование ссылки в буфер обмена
  const url = `${window.location.origin}/jobs/${job.id}`
  navigator.clipboard.writeText(url).then(() => {
    console.log('📋 Ссылка скопирована:', url)
  }).catch(() => {
    console.log('📋 Ссылка для копирования:', url)
  })
}

const getDemoUrgentJobs = () => [
  {
    id: 1,
    title: 'СРОЧНО! Повар в банкетный зал',
    company_name: 'Golden Palace',
    venue_name: 'Golden Palace',
    company_logo: '/images/default-company.png',
    location: 'ул. Кунаева, 12/1',
    salary_min: 15000,
    salary_max: 25000,
    pay_per_shift: 20000,
    needed_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    needed_time: '18:00',
    shift_duration: '6 часов',
    contact_phone: '+77172505678',
    contact_telegram: 'aigul_chef',
    contact_person: 'Айгуль Сулейманова',
    specialization_id: 1,
    notification_priority: 1,
    description: 'Требуется опытный повар для работы в банкетном зале на корпоратив. Знание казахской и европейской кухни обязательно.',
    tags: ['срочно', 'банкет', 'высокая_оплата'],
    auto_close_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_urgent: true
  },
  {
    id: 2, 
    title: 'Официант на вечернюю смену СЕГОДНЯ',
    company_name: 'Ресторан "Астана"',
    venue_name: 'Ресторан "Астана"',
    company_logo: '/images/default-company.png',
    location: 'пр. Республики, 15',
    salary_min: 8000,
    salary_max: 12000,
    pay_per_shift: 10000,
    needed_date: new Date().toISOString(),
    needed_time: '17:00',
    shift_duration: '8 часов',
    contact_phone: '+77011234567',
    contact_telegram: 'arman_astana',
    contact_person: 'Арман Назарбаев',
    specialization_id: 8,
    notification_priority: 1,
    description: 'Заболел официант, срочно нужна замена на вечернюю смену. Опыт работы в ресторанах обязателен.',
    tags: ['срочно', 'вечерняя_смена', 'опыт_в_ресторане'],
    auto_close_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    is_urgent: true
  },
  {
    id: 3,
    title: 'Кассир-администратор на выходные', 
    company_name: 'Pizza Master',
    venue_name: 'Pizza Master',
    company_logo: '/images/default-company.png',
    location: 'ул. Абая, 25',
    salary_min: 6000,
    salary_max: 10000,
    pay_per_shift: 8000,
    needed_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    needed_time: '10:00',
    shift_duration: '12 часов',
    contact_phone: '+77015678901',
    contact_telegram: 'aibek_pizza',
    contact_person: 'Айбек Жакенов',
    specialization_id: 17,
    notification_priority: 2,
    description: 'Нужен кассир на выходные дни в пиццерию. Работа с кассовым аппаратом, прием заказов.',
    tags: ['выходные', 'касса', 'клиенты'],
    auto_close_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    is_urgent: true
  }
]

onMounted(() => {
  loadUrgentJobs()
})
</script>

<style scoped>
.urgent-jobs-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding-top: 60px; /* Отступ для фиксированного заголовка */
  padding-bottom: 80px; /* Отступ для нижней навигации */
}

.page-header {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  padding: 24px 16px;
  color: white;
  text-align: center;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
}

.page-content {
  padding: 16px;
  max-width: 400px;
  margin: 0 auto;
}

/* Состояние загрузки */
.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e3e3e3;
  border-top: 3px solid #ff6b6b;
  border-radius: 50%;
  margin: 0 auto 16px auto;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #666;
  font-size: 14px;
}

/* Состояние ошибки */
.error-state {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 16px;
  margin: 16px 0;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h3 {
  color: #333;
  font-size: 18px;
  margin: 0 0 8px 0;
}

.error-state p {
  color: #666;
  font-size: 14px;
  margin: 0 0 20px 0;
}

.retry-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #ff5252;
  transform: translateY(-1px);
}

/* Список вакансий */
.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.job-item {
  animation: slideInUp 0.4s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Пустое состояние */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  margin: 16px 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #333;
  font-size: 20px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.empty-state p {
  color: #666;
  font-size: 14px;
  margin: 0 0 24px 0;
}

.explore-btn {
  display: inline-block;
  background: #1976d2;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.explore-btn:hover {
  background: #1565c0;
  transform: translateY(-1px);
}

/* Мобильная адаптация */
@media (max-width: 480px) {
  .page-content {
    padding: 12px;
  }

  .page-header {
    padding: 20px 16px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .loading-state,
  .error-state,
  .empty-state {
    margin: 12px 0;
    padding: 32px 16px;
  }

  .empty-icon {
    font-size: 48px;
  }

  .empty-state h3 {
    font-size: 18px;
  }

  .jobs-list {
    gap: 8px;
  }
}

/* Очень маленькие экраны */
@media (max-width: 320px) {
  .page-content {
    padding: 8px;
  }

  .page-header {
    padding: 16px 12px;
  }

  .page-header h1 {
    font-size: 18px;
  }

  .empty-state,
  .error-state,
  .loading-state {
    padding: 24px 12px;
  }
}
</style>
