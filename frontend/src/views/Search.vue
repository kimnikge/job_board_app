<template>
  <div class="search-page">
    <!-- Шапка поиска -->
    <div class="search-header">
      <div class="search-container">
        <div class="search-input-wrapper">
          <input 
            v-model="searchQuery" 
            @input="performSearch"
            @keyup.enter="performSearch"
            placeholder="Поиск вакансий, компаний, должностей..."
            class="search-input"
            ref="searchInput"
          />
          <button @click="performSearch" class="search-btn">
            🔍
          </button>
        </div>
        
        <button 
          @click="toggleFilters" 
          :class="['filter-toggle', { active: showFilters }]"
        >
          🔧 Фильтры
          <span v-if="activeFiltersCount > 0" class="filter-count">{{ activeFiltersCount }}</span>
        </button>
      </div>
    </div>

    <!-- Панель фильтров -->
    <div v-if="showFilters" class="filters-panel">
      <div class="filters-content">
        <h3>🎯 Настройки поиска</h3>
        
        <div class="filters-grid">
          <!-- Город -->
          <div class="filter-group">
            <label>📍 Город</label>
            <CitySelector 
              v-model="filters.cityId" 
              placeholder="Все города"
              @update:modelValue="applyFilters"
            />
          </div>
          
          <!-- Специализация -->
          <div class="filter-group">
            <label>🎯 Специализация</label>
            <select v-model="filters.specializationId" @change="applyFilters" class="filter-select">
              <option value="">Все специализации</option>
              <option v-for="spec in specializations" :key="spec.id" :value="spec.id">
                {{ spec.name }}
              </option>
            </select>
          </div>
          
          <!-- Зарплата -->
          <div class="filter-group">
            <label>💰 Зарплата</label>
            <div class="salary-inputs">
              <input 
                v-model="filters.salaryFrom" 
                @input="applyFilters"
                type="number" 
                placeholder="От"
                class="salary-input"
              />
              <span>—</span>
              <input 
                v-model="filters.salaryTo" 
                @input="applyFilters"
                type="number" 
                placeholder="До"
                class="salary-input"
              />
              <span class="currency">₸</span>
            </div>
          </div>
          
          <!-- Тип работы -->
          <div class="filter-group">
            <label>⏰ Тип работы</label>
            <div class="checkbox-filters">
              <label class="checkbox-item">
                <input 
                  type="checkbox" 
                  v-model="filters.workTypes.fullTime"
                  @change="applyFilters"
                />
                Полная занятость
              </label>
              <label class="checkbox-item">
                <input 
                  type="checkbox" 
                  v-model="filters.workTypes.partTime"
                  @change="applyFilters"
                />
                Частичная занятость
              </label>
              <label class="checkbox-item">
                <input 
                  type="checkbox" 
                  v-model="filters.workTypes.temporary"
                  @change="applyFilters"
                />
                Временная работа
              </label>
            </div>
          </div>
          
          <!-- Срочные вакансии -->
          <div class="filter-group">
            <label class="checkbox-item urgent-filter">
              <input 
                type="checkbox" 
                v-model="filters.urgentOnly"
                @change="applyFilters"
              />
              ⚡ Только срочные вакансии
            </label>
          </div>
        </div>
        
        <!-- Действия с фильтрами -->
        <div class="filter-actions">
          <button @click="clearFilters" class="clear-filters-btn">
            🗑️ Очистить фильтры
          </button>
          <button @click="showFilters = false" class="apply-filters-btn">
            ✅ Применить ({{ filteredJobs.length }})
          </button>
        </div>
      </div>
    </div>

    <!-- Результаты поиска -->
    <div class="search-results">
      <!-- Статистика -->
      <div class="results-header">
        <div class="results-info">
          <h2>📋 Результаты поиска</h2>
          <p>
            <span v-if="searchQuery">По запросу "<strong>{{ searchQuery }}</strong>"</span>
            найдено <strong>{{ filteredJobs.length }}</strong> 
            {{ pluralize(filteredJobs.length, 'вакансия', 'вакансии', 'вакансий') }}
          </p>
        </div>
        
        <!-- Сортировка -->
        <div class="sort-controls">
          <label>Сортировать:</label>
          <select v-model="sortBy" @change="applySorting" class="sort-select">
            <option value="date">По дате</option>
            <option value="salary">По зарплате</option>
            <option value="relevance">По релевантности</option>
            <option value="company">По компании</option>
          </select>
        </div>
      </div>

      <!-- Загрузка -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Поиск вакансий...</p>
      </div>

      <!-- Список вакансий -->
      <div v-else-if="filteredJobs.length > 0" class="jobs-list">
        <JobCard 
          v-for="job in paginatedJobs" 
          :key="job.id" 
          :job="job"
          :highlight="searchQuery"
          @click="openJob(job.id)"
        />
        
        <!-- Пагинация -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="page-btn"
          >
            ← Предыдущая
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              @click="currentPage = page"
              :class="['page-number', { active: page === currentPage }]"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="page-btn"
          >
            Следующая →
          </button>
        </div>
      </div>

      <!-- Пустое состояние -->
      <div v-else class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Вакансии не найдены</h3>
        <p v-if="searchQuery">
          По запросу "<strong>{{ searchQuery }}</strong>" с выбранными фильтрами ничего не найдено
        </p>
        <p v-else>
          С выбранными фильтрами вакансии не найдены
        </p>
        <div class="empty-actions">
          <button @click="clearFilters" class="clear-btn">
            Очистить фильтры
          </button>
          <router-link to="/jobs" class="view-all-btn">
            Смотреть все вакансии
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import CitySelector from '@/components/CitySelector.vue'
import JobCard from '@/components/jobs/JobCard.vue'

const router = useRouter()
const route = useRoute()
const jobsStore = useJobsStore()

// Состояние поиска
const searchQuery = ref('')
const showFilters = ref(false)
const isLoading = ref(false)
const searchInput = ref(null)

// Фильтры
const filters = ref({
  cityId: null,
  specializationId: '',
  salaryFrom: '',
  salaryTo: '',
  workTypes: {
    fullTime: false,
    partTime: false,
    temporary: false
  },
  urgentOnly: false
})

// Сортировка и пагинация
const sortBy = ref('date')
const currentPage = ref(1)
const itemsPerPage = 10

// Специализации
const specializations = ref([
  { id: 1, name: 'Повар' },
  { id: 2, name: 'Официант' },
  { id: 3, name: 'Бармен' },
  { id: 4, name: 'Курьер' },
  { id: 5, name: 'Хостес' },
  { id: 6, name: 'Кассир' },
  { id: 7, name: 'Уборщик' },
  { id: 8, name: 'Администратор' }
])

// Вычисляемые свойства
const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.cityId) count++
  if (filters.value.specializationId) count++
  if (filters.value.salaryFrom || filters.value.salaryTo) count++
  if (Object.values(filters.value.workTypes).some(v => v)) count++
  if (filters.value.urgentOnly) count++
  return count
})

const filteredJobs = computed(() => {
  let jobs = [...jobsStore.allJobs]
  
  // Поиск по тексту
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    jobs = jobs.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.description?.toLowerCase().includes(query) ||
      job.company_name?.toLowerCase().includes(query) ||
      job.location?.toLowerCase().includes(query)
    )
  }
  
  // Фильтр по городу
  if (filters.value.cityId) {
    jobs = jobs.filter(job => job.city_id === filters.value.cityId)
  }
  
  // Фильтр по специализации
  if (filters.value.specializationId) {
    jobs = jobs.filter(job => job.specialization_id === parseInt(filters.value.specializationId))
  }
  
  // Фильтр по зарплате
  if (filters.value.salaryFrom) {
    jobs = jobs.filter(job => job.salary_from >= parseInt(filters.value.salaryFrom))
  }
  if (filters.value.salaryTo) {
    jobs = jobs.filter(job => job.salary_to <= parseInt(filters.value.salaryTo))
  }
  
  // Фильтр по типу работы
  const selectedWorkTypes = Object.entries(filters.value.workTypes)
    .filter(([_, selected]) => selected)
    .map(([type, _]) => type)
  
  if (selectedWorkTypes.length > 0) {
    jobs = jobs.filter(job => selectedWorkTypes.includes(job.work_type))
  }
  
  // Фильтр срочных вакансий
  if (filters.value.urgentOnly) {
    jobs = jobs.filter(job => job.is_urgent)
  }
  
  return jobs
})

const sortedJobs = computed(() => {
  const jobs = [...filteredJobs.value]
  
  switch (sortBy.value) {
    case 'salary':
      return jobs.sort((a, b) => (b.salary_to || 0) - (a.salary_to || 0))
    case 'company':
      return jobs.sort((a, b) => (a.company_name || '').localeCompare(b.company_name || ''))
    case 'relevance':
      // TODO: Реализовать сортировку по релевантности
      return jobs
    case 'date':
    default:
      return jobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
})

const totalPages = computed(() => Math.ceil(sortedJobs.value.length / itemsPerPage))

const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedJobs.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  // Показываем до 5 страниц
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)
  
  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Методы
const performSearch = async () => {
  isLoading.value = true
  currentPage.value = 1
  
  // Имитация задержки поиска
  setTimeout(() => {
    isLoading.value = false
  }, 500)
  
  // Обновляем URL с параметрами поиска
  updateUrlParams()
}

const applyFilters = () => {
  currentPage.value = 1
  updateUrlParams()
}

const applySorting = () => {
  currentPage.value = 1
  updateUrlParams()
}

const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const clearFilters = () => {
  filters.value = {
    cityId: null,
    specializationId: '',
    salaryFrom: '',
    salaryTo: '',
    workTypes: {
      fullTime: false,
      partTime: false,
      temporary: false
    },
    urgentOnly: false
  }
  currentPage.value = 1
  updateUrlParams()
}

const updateUrlParams = () => {
  const params = new URLSearchParams()
  
  if (searchQuery.value.trim()) {
    params.set('q', searchQuery.value.trim())
  }
  
  if (filters.value.cityId) {
    params.set('city', filters.value.cityId.toString())
  }
  
  if (filters.value.specializationId) {
    params.set('spec', filters.value.specializationId)
  }
  
  if (filters.value.salaryFrom) {
    params.set('salary_from', filters.value.salaryFrom)
  }
  
  if (filters.value.salaryTo) {
    params.set('salary_to', filters.value.salaryTo)
  }
  
  if (filters.value.urgentOnly) {
    params.set('urgent', '1')
  }
  
  if (sortBy.value !== 'date') {
    params.set('sort', sortBy.value)
  }
  
  if (currentPage.value > 1) {
    params.set('page', currentPage.value.toString())
  }
  
  const newUrl = params.toString() ? `${route.path}?${params.toString()}` : route.path
  router.replace(newUrl)
}

const loadFromUrlParams = () => {
  const params = route.query
  
  if (params.q) {
    searchQuery.value = params.q
  }
  
  if (params.city) {
    filters.value.cityId = parseInt(params.city)
  }
  
  if (params.spec) {
    filters.value.specializationId = params.spec
  }
  
  if (params.salary_from) {
    filters.value.salaryFrom = params.salary_from
  }
  
  if (params.salary_to) {
    filters.value.salaryTo = params.salary_to
  }
  
  if (params.urgent === '1') {
    filters.value.urgentOnly = true
  }
  
  if (params.sort) {
    sortBy.value = params.sort
  }
  
  if (params.page) {
    currentPage.value = parseInt(params.page)
  }
}

const openJob = (jobId) => {
  router.push(`/jobs/${jobId}`)
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    updateUrlParams()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    updateUrlParams()
  }
}

const pluralize = (count, one, few, many) => {
  if (count % 10 === 1 && count % 100 !== 11) return one
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return few
  return many
}

// Lifecycle
onMounted(async () => {
  loadFromUrlParams()
  await jobsStore.fetchJobs()
  
  // Фокус на поле поиска
  if (searchInput.value) {
    searchInput.value.focus()
  }
})

// Отслеживание изменений в URL
watch(() => route.query, () => {
  loadFromUrlParams()
})
</script>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

.search-header {
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-container {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-btn {
  position: absolute;
  right: 8px;
  padding: 8px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background 0.3s ease;
}

.search-btn:hover {
  background: #5a6fd8;
}

.filter-toggle {
  position: relative;
  padding: 15px 20px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-toggle:hover,
.filter-toggle.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.filter-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff6b35;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
}

.filters-panel {
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filters-content h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 1.3rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #555;
}

.filter-select,
.salary-input {
  padding: 10px 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
}

.salary-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.salary-input {
  flex: 1;
}

.currency {
  font-weight: 600;
  color: #666;
}

.checkbox-filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #667eea;
}

.urgent-filter {
  font-weight: 500;
  color: #ff6b35;
}

.filter-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  border-top: 1px solid #e9ecef;
  padding-top: 20px;
}

.clear-filters-btn,
.apply-filters-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-filters-btn {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e9ecef;
}

.clear-filters-btn:hover {
  background: #e9ecef;
}

.apply-filters-btn {
  background: #667eea;
  color: white;
}

.apply-filters-btn:hover {
  background: #5a6fd8;
}

.search-results {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  gap: 20px;
}

.results-info h2 {
  margin-bottom: 8px;
  color: #333;
}

.results-info p {
  color: #666;
  font-size: 1rem;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-select {
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e9ecef;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.jobs-list {
  display: grid;
  gap: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #e9ecef;
}

.page-btn {
  padding: 10px 15px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-number {
  width: 40px;
  height: 40px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.page-number:hover,
.page-number.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #333;
}

.empty-actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.clear-btn,
.view-all-btn {
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.clear-btn {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e9ecef;
}

.view-all-btn {
  background: #667eea;
  color: white;
  border: 2px solid #667eea;
}

.clear-btn:hover,
.view-all-btn:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .search-page {
    padding: 15px;
  }
  
  .search-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .search-input-wrapper {
    width: 100%;
  }
  
  .filter-toggle {
    width: 100%;
    text-align: center;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .results-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .filter-actions {
    flex-direction: column;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
