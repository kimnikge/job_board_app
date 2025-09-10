<template>
  <div class="jobs-main-page">
    <!-- Header -->
    <AppHeader />
    <PageHeader 
      title="Все вакансии"
      subtitle="Найдите идеальную работу в сфере общественного питания"
    />
    <!-- Фильтры -->
    <div class="filters-section">
      <div class="filters-row">
        <!-- Поиск -->
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Поиск по названию, компании..."
            class="search-input"
          </div>
          />
          <button class="search-btn">🔍</button>
        </div>

        <!-- Фильтр по специализации -->
        <select v-model="selectedSpecialization" class="filter-select">
          <option value="">Все специализации</option>
          <option value="cook">Повар</option>
          <option value="waiter">Официант</option>
            <option value="bartender">Бармен</option>
            <option value="manager">Менеджер</option>
          </select>

          <!-- Фильтр по городу -->
          <div class="city-filter">
            <CitySelector 
              v-model="selectedCity"
              @city-selected="onCitySelected"
              placeholder="Все города"
              compact
            />
          </div>

          <!-- Фильтр по зарплате -->
          <select v-model="salaryRange" class="filter-select">
            <option value="">Любая зарплата</option>
            <option value="0-100000">До 100 000 ₸</option>
            <option value="100000-200000">100 000 - 200 000 ₸</option>
            <option value="200000-300000">200 000 - 300 000 ₸</option>
            <option value="300000+">Свыше 300 000 ₸</option>
          </select>
        </div>
        
        <!-- Быстрые фильтры (чипы) -->
        <div class="quick-filters">
          <div class="quick-filter-chip" 
               :class="{ active: urgentOnly }"
               @click="toggleUrgentFilter">
            🚨 Срочные вакансии
          </div>
          <div class="quick-filter-chip" 
               :class="{ active: todayOnly }"
               @click="toggleTodayFilter">
            📅 Сегодня
          </div>
          <div class="quick-filter-chip" 
               :class="{ active: highSalaryOnly }"
               @click="toggleHighSalaryFilter">
            💰 Высокая зарплата
          </div>
          <div class="quick-filter-chip" 
               :class="{ active: popularOnly }"
               @click="togglePopularFilter">
            ⭐ Популярные
          </div>
        </div>
        
        <!-- Активные фильтры -->
        <div v-if="activeFiltersCount > 0" class="active-filters">
          <span class="active-filters-label">Активные фильтры:</span>
          <div class="active-filter-tags">
            <span v-if="searchQuery" class="filter-tag">
              🔍 "{{ searchQuery }}"
              <button @click="searchQuery = ''" class="remove-filter">×</button>
            </span>
            <span v-if="selectedSpecialization" class="filter-tag">
              💼 {{ getSpecializationName(selectedSpecialization) }}
              <button @click="selectedSpecialization = ''" class="remove-filter">×</button>
            </span>
            <span v-if="selectedCity" class="filter-tag">
              📍 {{ selectedCity.name }}
              <button @click="selectedCity = null" class="remove-filter">×</button>
            </span>
            <span v-if="salaryRange" class="filter-tag">
              💰 {{ getSalaryRangeName(salaryRange) }}
              <button @click="salaryRange = ''" class="remove-filter">×</button>
            </span>
          </div>
          <button @click="clearAllFilters" class="clear-all-btn">Очистить все</button>
        </div>
  <!-- удалён лишний закрывающий тег -->

    <!-- Быстрые ссылки -->
    <div class="quick-links">
      <div class="container">
        <div class="quick-links-grid">
          <router-link to="/urgent" class="quick-link urgent">
            <span class="icon">🚨</span>
            <span class="text">Срочные вакансии</span>
            <span class="badge">{{ urgentJobsCount }}</span>
          </router-link>
          
          <div class="quick-link" @click="filterByToday">
            <span class="icon">📅</span>
            <span class="text">На сегодня</span>
            <span class="badge">{{ todayJobsCount }}</span>
          </div>
          
          <div class="quick-link" @click="filterByHighSalary">
            <span class="icon">💰</span>
            <span class="text">Высокая оплата</span>
            <span class="badge">{{ highSalaryCount }}</span>
        </div>
      </div>
    </div>
    </div>

    <!-- Список вакансий -->
    <div class="jobs-section">
      <div class="container">
        <!-- Счетчик результатов -->
        <div v-if="!loading && !error" class="results-header">
          <h2 class="results-count">
            Найдено {{ filteredJobs.length }} 
            {{ getJobsWord(filteredJobs.length) }}
          </h2>
          <div class="sort-options">
            <select v-model="sortBy" class="sort-select">
              <option value="date">Сначала новые</option>
              <option value="salary">По зарплате</option>
              <option value="urgent">Сначала срочные</option>
              <option value="popular">По популярности</option>
            </select>
          </div>
        </div>

        <!-- Состояние загрузки -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Загружаем вакансии...</p>
        </div>

        <!-- Ошибка -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Упс! Что-то пошло не так</h3>
          <p>{{ error }}</p>
          <button @click="loadJobs" class="retry-btn">Попробовать снова</button>
        </div>

        <!-- Список вакансий -->
        <div v-else class="jobs-grid">
            v-for="job in filteredJobs" 
            :key="job.id" 
            class="job-card"
            @click="openJob(job.id)"
    </div>
          >
            <!-- Бейдж срочности -->
            <div v-if="job.is_urgent" class="urgent-badge">🚨 СРОЧНО</div>
            
            <!-- Логотип компании -->
            <div class="job-header">
              <img 
                :src="job.company_logo || '/images/default-company.png'" 
                :alt="job.company_name"
                class="company-logo"
              />
              <div class="job-title-section">
                <h3 class="job-title">{{ job.title }}</h3>
                <p class="company-name">{{ job.company_name }}</p>
              </div>
            </div>

            <!-- Информация о работе -->
            <div class="job-info">
              <div class="info-item">
                <span class="icon">📍</span>
                <span>{{ job.location || 'Астана' }}</span>
              </div>
              <div class="info-item">
                <span class="icon">💰</span>
                <span>{{ formatSalary(job) }}</span>
              </div>
              <div v-if="job.employment_type" class="info-item">
                <span class="icon">⏰</span>
                <span>{{ getEmploymentTypeText(job.employment_type) }}</span>
              </div>
            </div>

            <!-- Описание -->
            <div v-if="job.description" class="job-description">
              {{ truncateText(job.description, 100) }}
            </div>

            <!-- Теги -->
            <div v-if="job.tags" class="job-tags">
              <span 
                v-for="tag in job.tags.slice(0, 3)" 
                :key="tag" 
                class="tag"
              >
                {{ tag }}
              </span>
            </div>

            <!-- Дата публикации -->
            <div class="job-footer">
              <span class="publish-date">{{ formatDate(job.created_at) }}</span>
              <button class="view-btn">Подробнее</button>
            </div>
          </div>

          <!-- Пустое состояние -->
          <div v-if="filteredJobs.length === 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>Вакансии не найдены</h3>
            <p>Попробуйте изменить параметры поиска</p>
            <button @click="clearFilters" class="clear-filters-btn">Очистить фильтры</button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import AppHeader from '@/components/AppHeader.vue'
import PageHeader from '@/components/PageHeader.vue'
import CitySelector from '@/components/CitySelector.vue'

const router = useRouter()
const route = useRoute()
const jobsStore = useJobsStore()

// Состояние
const loading = computed(() => jobsStore.loading)
const error = computed(() => jobsStore.error)

// Фильтры (инициализируем из URL параметров)
const searchQuery = ref(route.query.search || '')
const selectedSpecialization = ref(route.query.spec || '')
const selectedCity = ref(null) // Будет инициализирован позже
const salaryRange = ref(route.query.salary || '')

// Быстрые фильтры
const urgentOnly = ref(route.query.urgent === 'true')
const todayOnly = ref(route.query.today === 'true')
const highSalaryOnly = ref(route.query.highSalary === 'true')
const popularOnly = ref(route.query.popular === 'true')

// Сортировка
const sortBy = ref(route.query.sort || 'date')

// Обновление URL при изменении фильтров
const updateUrl = () => {
  const query = {}
  
  if (searchQuery.value) query.search = searchQuery.value
  if (selectedSpecialization.value) query.spec = selectedSpecialization.value
  if (selectedCity.value?.id) query.city = selectedCity.value.id
  if (salaryRange.value) query.salary = salaryRange.value
  if (urgentOnly.value) query.urgent = 'true'
  if (todayOnly.value) query.today = 'true'
  if (highSalaryOnly.value) query.highSalary = 'true'
  if (popularOnly.value) query.popular = 'true'
  if (sortBy.value !== 'date') query.sort = sortBy.value
  
  // Обновляем URL без перезагрузки страницы
  router.replace({ query })
}

// Обработчики
const onCitySelected = (city) => {
  selectedCity.value = city
  // Применяем фильтр по городу
  applyFilters()
}

const applyFilters = () => {
  // Фильтры теперь применяются автоматически через computed
  console.log('Фильтры обновлены:', {
    search: searchQuery.value,
    specialization: selectedSpecialization.value,
    city: selectedCity.value?.name || '',
    salaryRange: salaryRange.value,
    resultCount: filteredJobs.value.length
  })
}

// Автоматическое применение фильтров при изменении
watch([searchQuery, selectedSpecialization, selectedCity, salaryRange, urgentOnly, todayOnly, highSalaryOnly, popularOnly, sortBy], () => {
  applyFilters()
  updateUrl()
}, { deep: true })

// Счетчик активных фильтров
const activeFiltersCount = computed(() => {
  let count = 0
  if (searchQuery.value) count++
  if (selectedSpecialization.value) count++
  if (selectedCity.value) count++
  if (salaryRange.value) count++
  if (urgentOnly.value) count++
  if (todayOnly.value) count++
  if (highSalaryOnly.value) count++
  if (popularOnly.value) count++
  return count
})

// Методы для быстрых фильтров
const toggleUrgentFilter = () => {
  urgentOnly.value = !urgentOnly.value
}

const toggleTodayFilter = () => {
  todayOnly.value = !todayOnly.value
}

const toggleHighSalaryFilter = () => {
  highSalaryOnly.value = !highSalaryOnly.value
}

const togglePopularFilter = () => {
  popularOnly.value = !popularOnly.value
}

// Очистка фильтров
const clearAllFilters = () => {
  searchQuery.value = ''
  selectedSpecialization.value = ''
  selectedCity.value = null
  salaryRange.value = ''
  urgentOnly.value = false
  todayOnly.value = false
  highSalaryOnly.value = false
  popularOnly.value = false
}

// Вспомогательные методы для отображения
const getSpecializationName = (spec) => {
  const names = {
    'cook': 'Повар',
    'waiter': 'Официант',
    'bartender': 'Бармен',
    'manager': 'Менеджер'
  }
  return names[spec] || spec
}

const getSalaryRangeName = (range) => {
  const names = {
    '0-100000': 'До 100 000 ₸',
    '100000-200000': '100 000 - 200 000 ₸',
    '200000-300000': '200 000 - 300 000 ₸',
    '300000+': 'Свыше 300 000 ₸'
  }
  return names[range] || range
}

// Склонение слова "вакансии"
const getJobsWord = (count) => {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'вакансий'
  }
  
  if (lastDigit === 1) {
    return 'вакансию'
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return 'вакансии'
  } else {
    return 'вакансий'
  }
}

// Вычисляемые свойства
const allJobs = computed(() => jobsStore.jobs)

const filteredJobs = computed(() => {
  let jobs = allJobs.value || []
  
  // Фильтр по поиску
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    jobs = jobs.filter(job => 
      job.title?.toLowerCase().includes(query) ||
      job.company_name?.toLowerCase().includes(query) ||
      job.description?.toLowerCase().includes(query)
    )
  }
  
  // Фильтр по специализации
  if (selectedSpecialization.value) {
    jobs = jobs.filter(job => {
      const spec = selectedSpecialization.value
      const title = job.title?.toLowerCase() || ''
      switch(spec) {
        case 'cook':
          return title.includes('повар') || title.includes('кук')
        case 'waiter':
          return title.includes('официант') || title.includes('сервис')
        case 'bartender':
          return title.includes('бармен') || title.includes('бар')
        case 'manager':
          return title.includes('менеджер') || title.includes('управ')
        default:
          return true
      }
    })
  }
  
  // Фильтр по городу
  if (selectedCity.value) {
    jobs = jobs.filter(job => {
      const jobLocation = job.location?.toLowerCase() || ''
      const cityName = selectedCity.value.name?.toLowerCase() || ''
      return jobLocation.includes(cityName)
    })
  }
  
  // Фильтр по зарплате
  if (salaryRange.value) {
    jobs = jobs.filter(job => {
      const salary = job.salary_from || 0
      switch(salaryRange.value) {
        case '0-100000':
          return salary <= 100000
        case '100000-200000':
          return salary >= 100000 && salary <= 200000
        case '200000-300000':
          return salary >= 200000 && salary <= 300000
        case '300000+':
          return salary >= 300000
        default:
          return true
      }
    })
  }
  
  // Быстрые фильтры
  if (urgentOnly.value) {
    jobs = jobs.filter(job => job.is_urgent)
  }
  
  if (todayOnly.value) {
    const today = new Date().toDateString()
    jobs = jobs.filter(job => {
      const jobDate = new Date(job.created_at).toDateString()
      return jobDate === today
    })
  }
  
  if (highSalaryOnly.value) {
    jobs = jobs.filter(job => (job.salary_from || 0) >= 300000)
  }
  
  if (popularOnly.value) {
    // Примерная логика популярности - много откликов или недавно создана
    jobs = jobs.filter(job => 
      job.applications_count > 5 || 
      new Date(job.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    )
  }
  
  // Сортировка
  switch(sortBy.value) {
    case 'date':
      jobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
    case 'salary':
      jobs.sort((a, b) => (b.salary_from || 0) - (a.salary_from || 0))
      break
    case 'urgent':
      jobs.sort((a, b) => (b.is_urgent ? 1 : 0) - (a.is_urgent ? 1 : 0))
      break
    case 'popular':
      jobs.sort((a, b) => (b.applications_count || 0) - (a.applications_count || 0))
      break
  }
  
  return jobs
})

const urgentJobsCount = computed(() => 
  jobsStore.jobs.filter(job => job.is_urgent).length
)

const todayJobsCount = computed(() => {
  const today = new Date().toDateString()
  return jobsStore.jobs.filter(job => 
    job.needed_date && new Date(job.needed_date).toDateString() === today
  ).length
})

const highSalaryCount = computed(() => 
  jobsStore.jobs.filter(job => 
    (job.salary_max || job.salary_min || job.pay_per_shift || 0) >= 200000
  ).length
)

// Watchers для синхронизации фильтров с store
watch(searchQuery, (newValue) => {
  jobsStore.filters.search = newValue
})

watch(selectedSpecialization, (newValue) => {
  jobsStore.filters.specialization = newValue
})

// Методы
const loadJobs = async () => {
  await jobsStore.fetchJobs()
}

const openJob = (jobId) => {
  router.push(`/jobs/${jobId}`)
}

const filterByToday = () => {
  // TODO: Реализовать фильтрацию по сегодняшнему дню
  console.log('Фильтр по сегодня')
}

const filterByHighSalary = () => {
  salaryRange.value = '200000+'
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedSpecialization.value = ''
  salaryRange.value = ''
}

const formatSalary = (job) => {
  if (job.pay_per_shift) return `${job.pay_per_shift.toLocaleString()} ₸/смена`
  if (job.salary_min && job.salary_max) {
    return `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ₸`
  }
  if (job.salary_min) return `от ${job.salary_min.toLocaleString()} ₸`
  if (job.salary_max) return `до ${job.salary_max.toLocaleString()} ₸`
  return 'По договоренности'
}

const getEmploymentTypeText = (type) => {
  const types = {
    'full_time': 'Полная занятость',
    'part_time': 'Частичная занятость',
    'temporary': 'Временная работа',
    'replacement': 'Подмена',
    'shift': 'Сменная работа'
  }
  return types[type] || type
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Демо данные
const getDemoJobs = () => [
  {
    id: 1,
    title: 'Повар европейской кухни',
    company_name: 'Ресторан "Астана Плаза"',
    company_logo: '/images/default-company.png',
    location: 'ул. Кунаева, 12/1',
    salary_min: 150000,
    salary_max: 250000,
    employment_type: 'full_time',
    description: 'Требуется опытный повар для работы в премиум ресторане. Знание европейской кухни обязательно.',
    tags: ['европейская_кухня', 'премиум', 'опыт_3_года'],
    created_at: new Date().toISOString(),
    is_urgent: false
  },
  {
    id: 2,
    title: 'Официант в банкетный зал',
    company_name: 'Golden Palace',
    company_logo: '/images/default-company.png',
    location: 'пр. Республики, 15',
    salary_min: 80000,
    salary_max: 120000,
    employment_type: 'part_time',
    description: 'Ищем дружелюбного и ответственного официанта для работы в банкетном зале.',
    tags: ['банкеты', 'выходные', 'чаевые'],
    created_at: new Date(Date.now() - 24*60*60*1000).toISOString(),
    is_urgent: false
  },
  {
    id: 3,
    title: 'СРОЧНО! Бармен на подмену',
    company_name: 'Бар "Небо"',
    company_logo: '/images/default-company.png',
    location: 'ТЦ "Мега"',
    pay_per_shift: 15000,
    employment_type: 'replacement',
    description: 'Заболел бармен, срочно нужна замена на несколько дней. Опыт работы с коктейлями обязателен.',
    tags: ['срочно', 'коктейли', 'подмена'],
    created_at: new Date().toISOString(),
    is_urgent: true
  },
  {
    id: 4,
    title: 'Су-шеф',
    company_name: 'Ресторан "Алатау"',
    company_logo: '/images/default-company.png',
    location: 'ул. Достык, 240',
    salary_min: 300000,
    salary_max: 400000,
    employment_type: 'full_time',
    description: 'Приглашаем опытного су-шефа в команду ресторана казахской кухни.',
    tags: ['су_шеф', 'казахская_кухня', 'руководство'],
    created_at: new Date(Date.now() - 48*60*60*1000).toISOString(),
    is_urgent: false
  }
]

// Инициализация
onMounted(async () => {
  // Загружаем вакансии
  await loadJobs()
  
  // Инициализируем город из URL, если указан
  if (route.query.city) {
    try {
      // Здесь должна быть логика поиска города по ID
      // selectedCity.value = await findCityById(route.query.city)
    } catch (error) {
      console.warn('Не удалось загрузить город из URL:', error)
    }
  }
})
</script>

<style scoped>
.jobs-main-page {
  min-height: 100vh;
  background: #1e1e2e;
  color: #ffffff;
  padding-bottom: 80px;
  max-width: 400px;
  margin: 0 auto;
}

/* Фильтры */
.filters-section {
  padding: 0 20px 24px;
}

.filters-row {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  flex: 1;
  min-width: 300px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 10px 0 0 10px;
  font-size: 16px;
  outline: none;
}

.search-btn {
  padding: 12px 16px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 0 10px 10px 0;
  cursor: pointer;
  transition: background 0.3s;
}

.search-btn:hover {
  background: #ff5252;
}

.filter-select {
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  background: white;
  cursor: pointer;
  min-width: 200px;
}

.city-filter {
  min-width: 200px;
}

.city-filter .city-selector {
  width: 100%;
}

/* Быстрые фильтры */
.quick-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.quick-filter-chip {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  user-select: none;
}

.quick-filter-chip:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.quick-filter-chip.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

/* Активные фильтры */
.active-filters {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f8f9ff;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.active-filters-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-right: 12px;
}

.active-filter-tags {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-right: 12px;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 12px;
  color: #333;
}

.remove-filter {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  margin-left: 4px;
}

.remove-filter:hover {
  color: #666;
}

.clear-all-btn {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 12px;
  text-decoration: underline;
  padding: 0;
}

.clear-all-btn:hover {
  color: #5a6fd8;
}

/* Заголовок результатов */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.results-count {
  margin: 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

/* Быстрые ссылки */
.quick-links {
  padding: 30px 0;
}

.quick-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  text-decoration: none;
  color: #333;
  transition: all 0.3s ease;
  cursor: pointer;
}

.quick-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.quick-link.urgent {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
}

.quick-link .icon {
  font-size: 24px;
}

.quick-link .text {
  flex: 1;
  font-weight: 600;
}

.quick-link .badge {
  background: rgba(0, 0, 0, 0.1);
  color: inherit;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

/* Секция вакансий */
.jobs-section {
  padding: 40px 0;
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.job-card {
  background: white;
  border-radius: 15px;
  padding: 24px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.job-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.urgent-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ff6b6b;
  color: white;
  padding: 8px 12px;
  border-radius: 0 15px 0 15px;
  font-size: 12px;
  font-weight: 700;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.job-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.company-logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid #e0e0e0;
}

.job-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.company-name {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.job-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
}

.info-item .icon {
  width: 16px;
  text-align: center;
}

.job-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.job-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.tag {
  background: #f0f0f0;
  color: #666;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.publish-date {
  color: #999;
  font-size: 12px;
}

.view-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.view-btn:hover {
  background: #5a6fd8;
}

/* Состояния */
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 15px;
  grid-column: 1 / -1;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-left: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon, .empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn, .clear-filters-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 16px;
}

.retry-btn:hover, .clear-filters-btn:hover {
  background: #5a6fd8;
}

/* Адаптивность */
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .search-box, .filter-select {
    min-width: auto;
    width: 100%;
  }

  .search-input {
    font-size: 16px; /* Предотвращает зум на iOS */
  }

  .city-filter {
    width: 100%;
  }

  /* Быстрые фильтры на мобильных */
  .quick-filters {
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
  }

  .quick-filter {
    font-size: 12px;
    padding: 6px 10px;
    flex: 0 0 auto;
  }

  /* Активные фильтры */
  .active-filters {
    margin: 12px 0;
    flex-wrap: wrap;
    gap: 6px;
  }

  .filter-tag {
    font-size: 11px;
    padding: 4px 8px;
  }

  /* Сортировка */
  .sorting-controls {
    flex-wrap: wrap;
    gap: 8px;
    align-items: stretch;
    margin-top: 12px;
  }

  .sort-group {
    width: 100%;
  }

  .sort-group select {
    width: 100%;
    min-width: unset;
  }

  .results-summary {
    font-size: 13px;
    text-align: center;
    margin: 12px 0;
  }

  .clear-filters-btn {
    width: 100%;
    margin-top: 12px;
  }
  
  .quick-links-grid {
    grid-template-columns: 1fr;
  }
  
  .jobs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
