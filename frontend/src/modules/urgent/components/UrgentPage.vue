<template>
  <BasePageLayout>
    <h1 class="page-title">Срочные вакансии</h1>
    <p class="page-subtitle">Вакансии, требующие срочного закрытия с повышенной оплатой</p>

    <div class="search-container">
      <SearchIcon class="w-6 h-6 text-gray-400" />
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Поиск срочных вакансий..." 
        class="search-input"
      />
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="urgentJobs.length === 0" class="text-center mt-12">
      <div class="mb-4">
        <AlertCircleIcon class="w-16 h-16 mx-auto opacity-50" />
      </div>
      <h3 class="text-xl font-semibold mb-2">Срочных вакансий пока нет</h3>
      <p class="text-white/70">Загляните позже или посмотрите все вакансии</p>
      <router-link 
        to="/jobs"
        class="inline-flex items-center mt-4 text-white hover:opacity-80 transition-opacity"
      >
        Все вакансии
        <ArrowRightIcon class="w-4 h-4 ml-2" />
      </router-link>
    </div>

    <div v-else class="grid-container">
      <UrgentJobCard 
        v-for="job in filteredJobs" 
        :key="job.id" 
        :job="job" 
      />
    </div>
  </BasePageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { SearchIcon, AlertCircleIcon, ArrowRightIcon } from 'lucide-vue-next'
import BasePageLayout from '@/layouts/BasePageLayout.vue'
import UrgentJobCard from '@/components/UrgentJobCard.vue'
import { jobsService } from '@/modules/jobs/services/jobsService'

const loading = ref(true)
const searchQuery = ref('')
const urgentJobs = ref([])

const filteredJobs = computed(() => {
  if (!searchQuery.value) return urgentJobs.value

  const query = searchQuery.value.toLowerCase()
  return urgentJobs.value.filter(job => 
    job.title.toLowerCase().includes(query) ||
    job.company_name.toLowerCase().includes(query) ||
    job.location.toLowerCase().includes(query) ||
    job.tags.some(tag => tag.toLowerCase().includes(query))
  )
})

onMounted(async () => {
  try {
    urgentJobs.value = await jobsService.getUrgentJobs()
  } catch (error) {
    console.error('Error fetching urgent jobs:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  text-align: center;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 2rem;
  text-align: center;
}

.search-container {
  position: relative;
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  color: #111827;
  background-color: #fff;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #4f46e5;
  outline: none;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.loading-spinner {
  border: 4px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
</style>