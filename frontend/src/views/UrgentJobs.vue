<template>
  <div class="urgent-jobs-page">
    <div class="page-container">
      <header class="urgent-header">
        <h1>⚡ Срочные вакансии</h1>
        <p>Требуются сотрудники срочно в заведения Астаны!</p>
      </header>
      
      <div class="loading" v-if="isLoading">
        Загружаю срочные вакансии...
      </div>
      
      <div class="error" v-else-if="error">
        Ошибка загрузки: {{ error }}
      </div>
      
      <div class="urgent-jobs-list" v-else>
        <UrgentJobCard 
          v-for="job in urgentJobs" 
          :key="job.id" 
          :job="job"
          @ready-click="handleReadyClick"
          @share="handleShare"
        />
        
        <div v-if="urgentJobs.length === 0" class="no-jobs">
          <h3>🎯 Срочных вакансий сейчас нет</h3>
          <p>Проверьте позже или создайте свою срочную вакансию</p>
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
  padding: 2rem;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.urgent-header {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.urgent-header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.urgent-header p {
  font-size: 1.2rem;
  opacity: 0.8;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
  color: white;
  font-size: 1.2rem;
}

.error {
  color: #ff6b6b;
}

.urgent-jobs-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.no-jobs {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: white;
}

.no-jobs h3 {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.no-jobs p {
  font-size: 1.1rem;
  opacity: 0.6;
}

/* Анимации появления */
.urgent-job-card {
  animation: slideUpFade 0.6s ease-out;
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .urgent-jobs-page {
    padding: 1rem;
  }
  
  .urgent-header h1 {
    font-size: 2rem;
  }
  
  .urgent-jobs-list {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
