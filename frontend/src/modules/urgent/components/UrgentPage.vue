<template>
  <div class="urgent-page">
    <div class="pt-4 pb-16">
      <!-- Заголовок -->
      <div class="page-header">
        <h1 class="text-2xl font-bold text-gray-900">Срочные вакансии</h1>
        <p class="text-gray-600 mt-2">Актуальные предложения, требующие быстрого отклика</p>
      </div>

      <!-- Фильтры -->
      <div class="filters" ref="filtersContainer">
        <div class="search-box">
          <SearchIcon class="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Поиск срочных вакансий..."
            v-model="searchQuery"
            @input="handleSearch"
            class="w-full bg-transparent border-none outline-none text-gray-700"
          >
        </div>
        
        <div class="filter-grid">
          <div 
            class="filter-button"
            :class="{ active: !selectedCategory }"
            @click="toggleDropdown('category')"
          >
            Все категории
          </div>
           <div 
            class="filter-button"
            :class="{ active: !selectedLocation }"
            @click="toggleDropdown('location')"
          >
            Все города
          </div>
        </div>

        <div v-if="showCategoryDropdown" class="dropdown-options">
           <div 
            class="dropdown-item"
            :class="{ active: !selectedCategory }"
            @click="selectOption('category', '')"
          >
            Все категории
          </div>
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="dropdown-item"
            :class="{ active: selectedCategory === category.id }"
            @click="selectOption('category', category.id)"
          >
            {{ category.name }}
          </div>
        </div>

        <div v-if="showLocationDropdown" class="dropdown-options">
           <div 
            class="dropdown-item"
            :class="{ active: !selectedLocation }"
            @click="selectOption('location', '')"
          >
            Все города
          </div>
          <div 
            v-for="loc in locationOptions" 
            :key="loc.value"
            class="dropdown-item"
            :class="{ active: selectedLocation === loc.value }"
            @click="selectOption('location', loc.value)"
          >
            {{ loc.text }}
          </div>
        </div>
      </div>

      <!-- Список срочных вакансий -->
      <div v-if="loading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <div v-else>
        <div v-if="filteredJobs && filteredJobs.length === 0" class="text-center py-12">
          <p class="text-gray-600 mb-4">Срочные вакансии не найдены</p>
        </div>

        <div v-else-if="filteredJobs" class="urgent-jobs">
          <UrgentJobCard
            v-for="job in filteredJobs"
            :key="job.id"
            :title="job.title"
            :company="job.company.name"
            :salary="job.salary_range"
            :city="job.location"
            :deadline="job.deadline"
            :description="job.description"
            :tags="job.tags"
            :benefits="job.benefits"
            :published="job.created_at"
            :companyLogo="job.company.logo || '🏢'"
            :isUrgent="job.is_urgent"
            :isRegular="!job.is_urgent"
            @apply="applyForJob(job)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { SearchIcon, ZapIcon, BanknoteIcon, MapPinIcon, ClockIcon, CheckIcon } from 'lucide-vue-next'
import UrgentJobCard from '@/components/UrgentJobCard.vue'
import { useJobsStore } from '@/modules/jobs/store/jobs'
import { storeToRefs } from 'pinia'

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

const jobsStore = useJobsStore()
const { urgentJobs, loading, error } = storeToRefs(jobsStore)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedLocation = ref('')
const showCategoryDropdown = ref(false)
const showLocationDropdown = ref(false)

const categories = ref([
  { id: 1, name: 'Повар' },
  { id: 2, name: 'Официант/Бармен' },
  { id: 3, name: 'Администратор/Хостес' },
  { id: 4, name: 'Кухонный работник' },
  { id: 5, name: 'Уборщик/Посудомойщик' },
  { id: 6, name: 'Менеджер зала' }
])
const locationOptions = ref([
  { value: '', text: 'Все города' },
  { value: 'алматы', text: 'Алматы' },
  { value: 'астана', text: 'Астана' },
  { value: 'шымкент', text: 'Шымкент' },
  { value: 'караганда', text: 'Караганда' },
  { value: 'актобе', text: 'Актобе' }
])

const filteredJobs = computed(() => {
  if (!urgentJobs.value) {
    return []
  }
  return urgentJobs.value.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          job.company.name.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesCategory = true // Временно всегда true
    const matchesLocation = !selectedLocation.value || job.location.toLowerCase().includes(selectedLocation.value)
    
    return matchesSearch && matchesCategory && matchesLocation
  })
})

const fetchUrgentJobs = async () => {
  try {
    await jobsStore.fetchUrgentJobs({
      search: searchQuery.value,
      location: selectedLocation.value,
    })
  } catch (err) {
    console.error('Ошибка при загрузке срочных вакансий:', err)
  }
}

onMounted(() => {
  fetchUrgentJobs()
  document.addEventListener('click', closeAllDropdowns)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeAllDropdowns)
})

const handleSearch = () => {
  fetchUrgentJobs()
}

const selectOption = (type, value) => {
  if (type === 'category') {
    selectedCategory.value = value
  } else if (type === 'location') {
    selectedLocation.value = value
  }
  fetchUrgentJobs()
  closeAllDropdowns()
}

const toggleDropdown = (type) => {
  if (type === 'category') {
    showCategoryDropdown.value = !showCategoryDropdown.value
    showLocationDropdown.value = false
  } else if (type === 'location') {
    showLocationDropdown.value = !showLocationDropdown.value
    showCategoryDropdown.value = false
  }
}

const closeAllDropdowns = (event) => {
  const filtersContainer = document.querySelector('.filters')
  if (filtersContainer && !filtersContainer.contains(event.target)) {
    showCategoryDropdown.value = false
    showLocationDropdown.value = false
  }
}

const applyForJob = (job) => {
  console.log('Откликнуться на вакансию:', job.title)
}
</script>

<style scoped>
.urgent-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.filters {
  position: relative;
  margin-bottom: 2rem;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-button {
  background: white;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.filter-button.active {
  background: #4F46E5;
  color: white;
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin-top: 0.5rem;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropdown-item:hover {
  background: #F3F4F6;
}

.dropdown-item.active {
  background: #4F46E5;
  color: white;
}

.urgent-jobs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
/* Удаляем все старые стили, относящиеся к .urgent-job-card и его внутренним элементам */
/* Эти стили теперь будут управляться компонентом UrgentJobCard.vue */
</style> 