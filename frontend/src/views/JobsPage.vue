<template>
  <div class="jobs-page">
    <div class="jobs-page__header">
      <h1 class="jobs-page__title">Вакансии</h1>
      <div class="jobs-page__filters">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск вакансий..."
          class="jobs-page__search"
        >
        <select v-model="selectedCategory" class="jobs-page__select">
          <option value="">Все категории</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="jobs-page__loading">
      Загрузка...
    </div>

    <div v-else-if="error" class="jobs-page__error">
      {{ error }}
    </div>

    <template v-else>
      <div class="jobs-page__grid">
        <div
          v-for="job in filteredJobs"
          :key="job.id"
          class="jobs-page__card"
        >
          <h3 class="jobs-page__job-title">{{ job.title }}</h3>
          <div class="jobs-page__company">{{ job.company.name }}</div>
          <div class="jobs-page__location">{{ job.location }}</div>
          <div class="jobs-page__salary">{{ formatSalary(job.salary) }}</div>
          <div class="jobs-page__tags">
            <span
              v-for="tag in job.tags"
              :key="tag"
              class="jobs-page__tag"
            >
              {{ tag }}
            </span>
          </div>
          <button @click="handleApply(job)" class="jobs-page__apply">
            Откликнуться
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { mockJobs } from '@/shared/mocks/testData'
import { realtimeService } from '@/services/realtimeService'
import jobApi from '@/modules/job/services/jobApi'

const loading = ref(true)
const error = ref(null)
const jobs = ref([])
const searchQuery = ref('')
const selectedCategory = ref('')

const categories = ref([
  { id: 1, name: 'Разработка' },
  { id: 2, name: 'Дизайн' },
  { id: 3, name: 'Маркетинг' },
  { id: 4, name: 'Продажи' }
])

let jobsChannel = null

const loadJobs = async () => {
  try {
    loading.value = true
    error.value = null
    // В реальном приложении здесь будет API запрос
    const { data } = await jobApi.getJobs()
    jobs.value = data
  } catch (e) {
    error.value = 'Ошибка загрузки вакансий'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleNewJob = (newJob) => {
  jobs.value = [newJob, ...jobs.value]
}

const filteredJobs = computed(() => {
  return jobs.value.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         job.company.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !selectedCategory.value || job.categoryId === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const formatSalary = (salary) => {
  if (!salary) return 'Зарплата не указана'
  const { min, max, currency } = salary
  return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`
}

const handleApply = (job) => {
  // В реальном приложении здесь будет логика отклика на вакансию
  console.log('Отклик на вакансию:', job)
}

onMounted(async () => {
  await loadJobs()
  // Подписываемся на новые вакансии
  jobsChannel = realtimeService.subscribeToNewJobs(handleNewJob)
})

onBeforeUnmount(() => {
  // Отписываемся при уничтожении компонента
  if (jobsChannel) {
    realtimeService.unsubscribe(jobsChannel)
  }
})
</script>

<style scoped>
.jobs-page {
  padding: 2rem;
  background: var(--color-bg);
}

.jobs-page__header {
  margin-bottom: 2rem;
}

.jobs-page__title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.jobs-page__filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.jobs-page__search,
.jobs-page__select {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: var(--color-card);
  color: var(--color-text);
  transition: border-color 0.2s;
}

.jobs-page__search {
  flex: 1;
}

.jobs-page__search:focus,
.jobs-page__select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.jobs-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.jobs-page__card {
  background: var(--color-card);
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: var(--color-shadow);
  transition: transform 0.2s;
}

.jobs-page__card:hover {
  transform: translateY(-2px);
}

.jobs-page__job-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.jobs-page__company {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.jobs-page__location {
  color: var(--color-secondary);
  margin-bottom: 0.5rem;
}

.jobs-page__salary {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.jobs-page__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.jobs-page__tag {
  padding: 0.25rem 0.75rem;
  background: var(--color-accent);
  color: var(--color-primary);
  border-radius: 1rem;
  font-size: 0.875rem;
}

.jobs-page__apply {
  width: 100%;
  padding: 0.75rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.jobs-page__apply:hover {
  background: var(--color-secondary);
}

.jobs-page__loading,
.jobs-page__error {
  text-align: center;
  padding: 2rem;
  font-size: 1.25rem;
  color: var(--color-text);
}

.jobs-page__error {
  color: #e53e3e;
}
</style>