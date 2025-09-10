<template>
  <div class="search-results">
    <!-- Заголовок результатов -->
    <div class="results-header">
      <h1>🔍 Результаты поиска</h1>
      <div class="search-info">
        <p v-if="searchQuery">
          По запросу: <strong>"{{ searchQuery }}"</strong>
        </p>
        <p class="results-count">
          Найдено {{ filteredJobs.length }} {{ getJobsWord(filteredJobs.length) }}
        </p>
      </div>
    </div>

    <!-- Фильтры (компактный вид) -->
    <div class="active-filters" v-if="hasActiveFilters">
      <h3>Активные фильтры:</h3>
      <div class="filter-tags">
        <span v-if="filters.cityId" class="filter-tag">
          📍 {{ getCityName(filters.cityId) }}
          <button @click="clearFilter('cityId')">×</button>
        </span>
        <span v-if="filters.specializationId" class="filter-tag">
          🎯 {{ getSpecializationName(filters.specializationId) }}
          <button @click="clearFilter('specializationId')">×</button>
        </span>
        <span v-if="filters.salaryFrom" class="filter-tag">
          💰 От {{ formatSalary(filters.salaryFrom) }}
          <button @click="clearFilter('salaryFrom')">×</button>
        </span>
        <span v-if="filters.salaryTo" class="filter-tag">
          💰 До {{ formatSalary(filters.salaryTo) }}
          <button @click="clearFilter('salaryTo')">×</button>
        </span>
        <span v-if="filters.workType" class="filter-tag">
          🕒 {{ getWorkTypeName(filters.workType) }}
          <button @click="clearFilter('workType')">×</button>
        </span>
        <span v-if="filters.urgent" class="filter-tag">
          🚨 Срочные вакансии
          <button @click="clearFilter('urgent')">×</button>
        </span>
        <button @click="clearAllFilters" class="clear-all-btn">
          Очистить все
        </button>
      </div>
    </div>

    <!-- Сортировка -->
    <div class="sort-controls">
      <label for="sortBy">Сортировать по:</label>
      <select id="sortBy" v-model="sortBy" @change="applySorting" class="sort-select">
        <option value="created_desc">Сначала новые</option>
        <option value="created_asc">Сначала старые</option>
        <option value="salary_desc">Зарплата: по убыванию</option>
        <option value="salary_asc">Зарплата: по возрастанию</option>
        <option value="relevance">По релевантности</option>
        <option value="urgent">Срочные вначале</option>
      </select>
    </div>

    <!-- Результаты поиска -->
    <div class="search-results-content">
      <!-- Если есть результаты -->
      <div v-if="sortedJobs.length > 0" class="jobs-grid">
        <JobCard 
          v-for="job in paginatedJobs" 
          :key="job.id" 
          :job="job"
          :search-query="searchQuery"
          @favorite="toggleFavorite"
          @apply="applyToJob"
        />
      </div>

      <!-- Если нет результатов -->
      <div v-else class="no-results">
        <div class="no-results-icon">🔍</div>
        <h2>Ничего не найдено</h2>
        <p>По вашему запросу не найдено подходящих вакансий</p>
        
        <div class="suggestions">
          <h3>Попробуйте:</h3>
          <ul>
            <li>Изменить критерии поиска</li>
            <li>Проверить правильность написания</li>
            <li>Использовать более общие термины</li>
            <li>Убрать часть фильтров</li>
          </ul>
        </div>
        
        <div class="quick-actions">
          <button @click="clearAllFilters" class="btn-secondary">
            Очистить фильтры
          </button>
          <router-link to="/jobs" class="btn-primary">
            Все вакансии
          </router-link>
        </div>
      </div>
    </div>

    <!-- Пагинация -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="currentPage = 1" 
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        ««
      </button>
      <button 
        @click="currentPage--" 
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        «
      </button>
      
      <span class="pagination-info">
        Страница {{ currentPage }} из {{ totalPages }}
      </span>
      
      <button 
        @click="currentPage++" 
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        »
      </button>
      <button 
        @click="currentPage = totalPages" 
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        »»
      </button>
    </div>

    <!-- Кнопка "Назад к поиску" -->
    <div class="back-to-search">
      <router-link to="/search" class="btn-secondary">
        ← Изменить поиск
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import { useReferenceStore } from '@/stores/reference'
import { useAuthStore } from '@/stores/auth'
import JobCard from '@/components/jobs/JobCard.vue'

const route = useRoute()
const router = useRouter()
const jobsStore = useJobsStore()
const referenceStore = useReferenceStore()
const authStore = useAuthStore()

// Реактивные данные
const searchQuery = ref('')
const sortBy = ref('created_desc')
const currentPage = ref(1)
const jobsPerPage = 12

// Фильтры из query параметров
const filters = ref({
  cityId: '',
  specializationId: '',
  salaryFrom: null,
  salaryTo: null,
  workType: '',
  urgent: false
})

// Инициализация
onMounted(async () => {
  // Загружаем справочные данные
  await Promise.all([
    referenceStore.loadCities(),
    referenceStore.loadSpecializations(),
    jobsStore.loadJobs()
  ])

  // Получаем параметры из URL
  searchQuery.value = route.query.q || ''
  filters.value = {
    cityId: route.query.city || '',
    specializationId: route.query.specialization || '',
    salaryFrom: route.query.salary_from ? parseInt(route.query.salary_from) : null,
    salaryTo: route.query.salary_to ? parseInt(route.query.salary_to) : null,
    workType: route.query.work_type || '',
    urgent: route.query.urgent === 'true'
  }
  sortBy.value = route.query.sort || 'created_desc'
  currentPage.value = parseInt(route.query.page) || 1
})

// Вычисляемые свойства
const filteredJobs = computed(() => {
  let jobs = [...jobsStore.jobs]

  // Поиск по тексту
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    jobs = jobs.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.company?.name.toLowerCase().includes(query)
    )
  }

  // Фильтр по городу
  if (filters.value.cityId) {
    jobs = jobs.filter(job => job.city_id === filters.value.cityId)
  }

  // Фильтр по специализации
  if (filters.value.specializationId) {
    jobs = jobs.filter(job => job.specialization_id === filters.value.specializationId)
  }

  // Фильтр по зарплате
  if (filters.value.salaryFrom) {
    jobs = jobs.filter(job => job.salary_from >= filters.value.salaryFrom)
  }
  if (filters.value.salaryTo) {
    jobs = jobs.filter(job => job.salary_to <= filters.value.salaryTo)
  }

  // Фильтр по типу работы
  if (filters.value.workType) {
    jobs = jobs.filter(job => job.work_type === filters.value.workType)
  }

  // Фильтр срочных вакансий
  if (filters.value.urgent) {
    jobs = jobs.filter(job => job.is_urgent)
  }

  return jobs
})

const sortedJobs = computed(() => {
  const jobs = [...filteredJobs.value]
  
  switch (sortBy.value) {
    case 'created_desc':
      return jobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    case 'created_asc':
      return jobs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    case 'salary_desc':
      return jobs.sort((a, b) => (b.salary_to || 0) - (a.salary_to || 0))
    case 'salary_asc':
      return jobs.sort((a, b) => (a.salary_from || 0) - (b.salary_from || 0))
    case 'urgent':
      return jobs.sort((a, b) => (b.is_urgent ? 1 : 0) - (a.is_urgent ? 1 : 0))
    case 'relevance':
    default:
      return jobs
  }
})

const totalPages = computed(() => Math.ceil(sortedJobs.value.length / jobsPerPage))

const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * jobsPerPage
  const end = start + jobsPerPage
  return sortedJobs.value.slice(start, end)
})

const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value => 
    value !== '' && value !== null && value !== false
  )
})

// Методы
const getJobsWord = (count) => {
  const cases = [2, 0, 1, 1, 1, 2]
  const words = ['вакансия', 'вакансии', 'вакансий']
  return words[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]]
}

const getCityName = (cityId) => {
  const city = referenceStore.cities.find(c => c.id === cityId)
  return city ? city.name : 'Город'
}

const getSpecializationName = (specId) => {
  const spec = referenceStore.specializations.find(s => s.id === specId)
  return spec ? spec.name : 'Специализация'
}

const getWorkTypeName = (workType) => {
  const types = {
    'full_time': 'Полная занятость',
    'part_time': 'Частичная занятость',
    'remote': 'Удаленная работа',
    'freelance': 'Фриланс'
  }
  return types[workType] || workType
}

const formatSalary = (amount) => {
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0
  }).format(amount)
}

const clearFilter = (filterKey) => {
  if (filterKey === 'salaryFrom' || filterKey === 'salaryTo') {
    filters.value[filterKey] = null
  } else if (filterKey === 'urgent') {
    filters.value[filterKey] = false
  } else {
    filters.value[filterKey] = ''
  }
  updateURL()
}

const clearAllFilters = () => {
  filters.value = {
    cityId: '',
    specializationId: '',
    salaryFrom: null,
    salaryTo: null,
    workType: '',
    urgent: false
  }
  currentPage.value = 1
  updateURL()
}

const applySorting = () => {
  currentPage.value = 1
  updateURL()
}

const updateURL = () => {
  const query = {}
  
  if (searchQuery.value) query.q = searchQuery.value
  if (filters.value.cityId) query.city = filters.value.cityId
  if (filters.value.specializationId) query.specialization = filters.value.specializationId
  if (filters.value.salaryFrom) query.salary_from = filters.value.salaryFrom
  if (filters.value.salaryTo) query.salary_to = filters.value.salaryTo
  if (filters.value.workType) query.work_type = filters.value.workType
  if (filters.value.urgent) query.urgent = 'true'
  if (sortBy.value !== 'created_desc') query.sort = sortBy.value
  if (currentPage.value > 1) query.page = currentPage.value

  router.replace({ query })
}

const toggleFavorite = async (jobId) => {
  try {
    await jobsStore.toggleFavorite(jobId)
  } catch (error) {
    console.error('Ошибка при добавлении в избранное:', error)
  }
}

const applyToJob = async (jobId) => {
  try {
    await jobsStore.applyToJob(jobId)
    // Показать уведомление об успешном отклике
  } catch (error) {
    console.error('Ошибка при отклике на вакансию:', error)
  }
}

// Следим за изменениями страницы
watch(currentPage, () => {
  updateURL()
})
</script>

<style scoped>
.search-results {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.results-header {
  margin-bottom: 30px;
}

.results-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.search-info p {
  color: #7f8c8d;
  margin: 5px 0;
}

.results-count {
  font-weight: 500;
  color: #3b82f6;
}

.active-filters {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e3e8ee;
}

.active-filters h3 {
  margin: 0 0 15px 0;
  color: #374151;
  font-size: 1rem;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.filter-tag {
  background: #3b82f6;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-tag button {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-all-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.clear-all-btn:hover {
  background: #b91c1c;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.no-results h2 {
  color: #374151;
  margin-bottom: 10px;
}

.no-results p {
  color: #6b7280;
  margin-bottom: 30px;
}

.suggestions {
  text-align: left;
  max-width: 400px;
  margin: 30px auto;
}

.suggestions h3 {
  color: #374151;
  margin-bottom: 15px;
}

.suggestions ul {
  color: #6b7280;
  padding-left: 20px;
}

.suggestions li {
  margin-bottom: 8px;
}

.quick-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 40px 0;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  margin: 0 15px;
  color: #6b7280;
  font-size: 14px;
}

.back-to-search {
  text-align: center;
  margin-top: 40px;
}

.btn-secondary,
.btn-primary {
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

@media (max-width: 768px) {
  .search-results {
    padding: 15px;
  }
  
  .jobs-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .filter-tags {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .quick-actions {
    flex-direction: column;
  }
  
  .sort-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
