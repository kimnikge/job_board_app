<template>
  <BasePageLayout>
    <h1 class="page-title">Вакансии</h1>
    <p class="page-subtitle">Найдите работу своей мечты среди тысяч предложений</p>

    <div class="search-container">
      <SearchIcon class="w-6 h-6 text-gray-400" />
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Поиск вакансий..." 
        class="search-input"
      />
    </div>

    <div class="filter-container">
      <button 
        v-for="filter in filters" 
        :key="filter.id"
        :class="['filter-button', { active: activeFilters.includes(filter.id) }]"
        @click="toggleFilter(filter.id)"
      >
        {{ filter.name }}
      </button>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
    </div>

    <div v-else class="grid-container">
      <div 
        v-for="job in filteredJobs" 
        :key="job.id" 
        class="content-card"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-semibold">{{ job.title }}</h3>
          <span v-if="job.is_urgent" class="urgent-badge">Срочно</span>
        </div>

        <div class="company-info mb-4">
          <img 
            :src="job.company_logo || '/images/default-company.png'" 
            :alt="job.company_name"
            class="w-10 h-10 rounded-lg mr-3"
          />
          <span class="text-white/90">{{ job.company_name }}</span>
        </div>

        <div class="flex flex-wrap gap-4 mb-4">
          <div class="flex items-center">
            <MapPinIcon class="w-4 h-4 mr-2 opacity-70" />
            <span class="text-sm">{{ job.location }}</span>
          </div>
          <div class="flex items-center">
            <BriefcaseIcon class="w-4 h-4 mr-2 opacity-70" />
            <span class="text-sm">{{ job.employment_type }}</span>
          </div>
          <div class="flex items-center">
            <BanknoteIcon class="w-4 h-4 mr-2 opacity-70" />
            <span class="text-sm">{{ formatSalary(job.salary_min, job.salary_max) }}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
          <span 
            v-for="tag in job.tags" 
            :key="tag"
            class="px-3 py-1 text-xs rounded-full bg-white/10"
          >
            {{ tag }}
          </span>
        </div>

        <div class="flex justify-between items-center">
          <router-link 
            :to="{ name: 'job-details', params: { id: job.id }}" 
            class="flex items-center text-white hover:opacity-80 transition-opacity"
          >
            Подробнее
            <ArrowRightIcon class="w-4 h-4 ml-2" />
          </router-link>
          <span class="text-sm opacity-60">
            {{ formatDate(job.created_at) }}
          </span>
        </div>
      </div>
    </div>
  </BasePageLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { MapPinIcon, BriefcaseIcon, BanknoteIcon, ArrowRightIcon, SearchIcon } from 'lucide-vue-next'
import BasePageLayout from '@/layouts/BasePageLayout.vue'

const loading = ref(false)
const searchQuery = ref('')
const activeFilters = ref([])

const filters = [
  { id: 'remote', name: 'Удаленная работа' },
  { id: 'fulltime', name: 'Полный день' },
  { id: 'parttime', name: 'Частичная занятость' },
  { id: 'internship', name: 'Стажировка' }
]

const jobs = ref([])
// Здесь будет логика загрузки вакансий

const filteredJobs = computed(() => {
  let result = jobs.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.company_name.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    )
  }

  if (activeFilters.value.length > 0) {
    result = result.filter(job => {
      if (activeFilters.value.includes('remote') && !job.is_remote) return false
      if (activeFilters.value.includes('fulltime') && job.employment_type !== 'Полный день') return false
      if (activeFilters.value.includes('parttime') && job.employment_type !== 'Частичная занятость') return false
      if (activeFilters.value.includes('internship') && job.employment_type !== 'Стажировка') return false
      return true
    })
  }

  return result
})

const toggleFilter = (filterId) => {
  const index = activeFilters.value.indexOf(filterId)
  if (index === -1) {
    activeFilters.value.push(filterId)
  } else {
    activeFilters.value.splice(index, 1)
  }
}

const formatSalary = (min, max) => {
  if (!min && !max) return 'По договоренности'
  if (!max) return `от ${min.toLocaleString()} ₽`
  if (!min) return `до ${max.toLocaleString()} ₽`
  return `${min.toLocaleString()} - ${max.toLocaleString()} ₽`
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}
</script>

<style scoped>
.urgent-badge {
  background: linear-gradient(45deg, #FF6B6B, #FF8E53);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}
</style>