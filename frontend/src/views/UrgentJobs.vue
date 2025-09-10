<template>
  <div class="urgent-jobs-page">
    <!-- Header -->
    <AppHeader />
    
    <!-- Page Header -->
    <PageHeader 
      title="Срочные вакансии" 
      subtitle="Найдите работу уже сегодня"
    />
    
    <!-- Фильтры -->
    <section class="filters-section mb">
      <div class="filters-grid">
        <button 
          v-for="filter in filters" 
          :key="filter.value"
          class="btn-secondary filter-btn"
          :class="{ 'btn-primary': activeFilter === filter.value }"
          @click="setActiveFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>
    </section>

    <!-- Список вакансий -->
    <div class="jobs-list">
      <div 
        v-for="job in filteredJobs" 
        :key="job.id"
        class="card job-card urgent-job animate-hover"
        @click="openJobDetail(job)"
      >
        <!-- Индикатор срочности -->
        <div class="urgent-badge">🔥 СРОЧНО</div>
        
        <!-- Основная информация -->
        <div class="job-header">
          <div class="job-title">{{ job.title }}</div>
          <div class="job-salary text-accent">{{ formatSalary(job.salary_min, job.salary_max) }}</div>
        </div>
        
        <div class="job-company text-secondary mb">{{ job.company_name }}</div>
        
        <!-- Детали -->
        <div class="job-details">
          <div class="job-location text-secondary">📍 {{ job.location }}</div>
          <div class="job-schedule text-secondary">⏰ {{ job.schedule_type || 'Полный день' }}</div>
        </div>
        
        <!-- Время публикации -->
        <div class="job-time text-secondary">
          {{ formatTimeAgo(job.created_at) }}
        </div>
      </div>
      
      <!-- Пустое состояние -->
      <div v-if="filteredJobs.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Нет срочных вакансий</h3>
        <p class="text-secondary">Попробуйте изменить фильтры</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import PageHeader from '@/components/PageHeader.vue'

const router = useRouter()

const activeFilter = ref('all')

const filters = [
      { value: 'all', label: 'Все' },
      { value: 'today', label: 'Сегодня' },
      { value: 'high_salary', label: 'Высокая оплата' },
      { value: 'nearby', label: 'Рядом' }
    ]
    
    // Тестовые данные
    const urgentJobs = ref([
      {
        id: 1,
        title: 'СРОЧНО! Повар на кухню',
        company_name: 'Ресторан "Алатау"',
        salary_min: 180000,
        salary_max: 220000,
        location: 'Есильский район',
        schedule_type: 'Полный день',
        created_at: new Date().toISOString(),
        is_urgent: true
      },
      {
        id: 2,
        title: 'СРОЧНО! Официант',
        company_name: 'Кафе "Астана"',
        salary_min: 150000,
        salary_max: null,
        location: 'Алматинский район',
        schedule_type: 'Смена 2/2',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        is_urgent: true
      },
      {
        id: 3,
        title: 'СРОЧНО! Менеджер зала',
        company_name: 'FastFood Plus',
        salary_min: 200000,
        salary_max: 280000,
        location: 'Сарыаркинский район',
        schedule_type: 'Полный день',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        is_urgent: true
      }
    ])
    
    const filteredJobs = computed(() => {
      let jobs = urgentJobs.value
      
      switch (activeFilter.value) {
        case 'today':
          const today = new Date().toDateString()
          jobs = jobs.filter(job => new Date(job.created_at).toDateString() === today)
          break
        case 'high_salary':
          jobs = jobs.filter(job => (job.salary_min || 0) >= 200000)
          break
        case 'nearby':
          // TODO: Реализовать фильтр по геолокации
          break
      }
      
      return jobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    })
    
    const setActiveFilter = (filterValue) => {
      activeFilter.value = filterValue
    }
    
    const formatSalary = (min, max) => {
      if (!min && !max) return 'По договоренности'
      if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ₸`
      if (min) return `от ${min.toLocaleString()} ₸`
      if (max) return `до ${max.toLocaleString()} ₸`
    }
    
    const formatTimeAgo = (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return 'только что'
      if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`
      return date.toLocaleDateString()
    }
    
    const openJobDetail = (job) => {
      router.push(`/jobs/${job.id}`)
    }
</script>

<style scoped>
/* === URGENT JOBS PAGE === */
.urgent-jobs-page {
  min-height: 100vh;
  background: #1e1e2e;
  color: #ffffff;
  padding-bottom: 80px;
  max-width: 400px;
  margin: 0 auto;
}

/* === ФИЛЬТРЫ === */
.filters-section {
  padding: 0 20px 20px;
}

.filters-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  white-space: nowrap;
  padding: 8px 16px;
}

/* === КАРТОЧКИ ВАКАНСИЙ === */
.jobs-list {
  display: flex;
  flex-direction: column;
  gap: var(--gap-medium);
}

.urgent-job {
  position: relative;
  border-left: 4px solid var(--color-error);
  cursor: pointer;
}

.urgent-badge {
  position: absolute;
  top: var(--gap-small);
  right: var(--gap-small);
  background: var(--color-error);
  color: var(--text-primary);
  font-size: var(--font-tiny);
  font-weight: var(--weight-bold);
  padding: 4px 8px;
  border-radius: var(--radius-small);
  text-transform: uppercase;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--gap-small);
  padding-right: 80px; /* Место для urgent-badge */
}

.job-title {
  font-weight: var(--weight-medium);
  font-size: var(--font-base);
  color: var(--text-primary);
}

.job-salary {
  font-weight: var(--weight-medium);
  white-space: nowrap;
}

.job-company {
  font-size: var(--font-small);
  margin-bottom: var(--gap-small);
}

.job-details {
  display: flex;
  gap: var(--gap-medium);
  margin-bottom: var(--gap-small);
}

.job-location,
.job-schedule {
  font-size: var(--font-small);
}

.job-time {
  font-size: var(--font-tiny);
  margin-top: var(--gap-small);
  padding-top: var(--gap-small);
  border-top: 1px solid var(--border-color);
}

/* === ПУСТОЕ СОСТОЯНИЕ === */
.empty-state {
  text-align: center;
  padding: var(--gap-large);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--gap-medium);
}

/* === АДАПТИВНОСТЬ === */
@media (max-width: 350px) {
  .job-header {
    flex-direction: column;
    gap: var(--gap-small);
    padding-right: var(--gap-small);
  }
  
  .urgent-badge {
    position: static;
    align-self: flex-start;
    margin-bottom: var(--gap-small);
  }
  
  .job-details {
    flex-direction: column;
    gap: var(--gap-small);
  }
}
</style>
