<template>
  <BasePageLayout>
    <h1 class="page-title">Резюме</h1>
    <p class="page-subtitle">Найдите талантливых специалистов для вашей команды</p>

    <div class="search-container">
      <SearchIcon class="w-6 h-6 text-gray-400" />
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Поиск специалистов..." 
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
        v-for="resume in filteredResumes" 
        :key="resume.id" 
        class="content-card"
      >
        <div class="flex items-start gap-4 mb-4">
          <img 
            :src="resume.avatar || '/images/default-avatar.png'" 
            :alt="resume.full_name"
            class="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <h3 class="text-xl font-semibold mb-1">{{ resume.full_name }}</h3>
            <p class="text-white/80">{{ resume.position }}</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-4 mb-4">
          <div class="flex items-center">
            <MapPinIcon class="w-4 h-4 mr-2 opacity-70" />
            <span class="text-sm">{{ resume.location }}</span>
          </div>
          <div class="flex items-center">
            <GraduationCapIcon class="w-4 h-4 mr-2 opacity-70" />
            <span class="text-sm">{{ resume.education_level }}</span>
          </div>
          <div class="flex items-center">
            <BriefcaseIcon class="w-4 h-4 mr-2 opacity-70" />
            <span class="text-sm">{{ resume.experience_years }} лет опыта</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
          <span 
            v-for="skill in resume.skills" 
            :key="skill"
            class="px-3 py-1 text-xs rounded-full bg-white/10"
          >
            {{ skill }}
          </span>
        </div>

        <p class="text-white/80 mb-4 line-clamp-2">{{ resume.summary }}</p>

        <div class="flex justify-between items-center">
          <router-link 
            :to="{ name: 'resume-details', params: { id: resume.id }}" 
            class="flex items-center text-white hover:opacity-80 transition-opacity"
          >
            Подробнее
            <ArrowRightIcon class="w-4 h-4 ml-2" />
          </router-link>
          <span class="text-sm opacity-60">
            Обновлено {{ formatDate(resume.updated_at) }}
          </span>
        </div>
      </div>
    </div>
  </BasePageLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { MapPinIcon, BriefcaseIcon, GraduationCapIcon, ArrowRightIcon, SearchIcon } from 'lucide-vue-next'
import BasePageLayout from '@/layouts/BasePageLayout.vue'

const loading = ref(false)
const searchQuery = ref('')
const activeFilters = ref([])

const filters = [
  { id: 'remote', name: 'Удаленная работа' },
  { id: 'relocation', name: 'Готов к релокации' },
  { id: 'student', name: 'Студенты' },
  { id: 'experienced', name: 'Опыт от 3 лет' }
]

const resumes = ref([])
// Здесь будет логика загрузки резюме

const filteredResumes = computed(() => {
  let result = resumes.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(resume => 
      resume.full_name.toLowerCase().includes(query) ||
      resume.position.toLowerCase().includes(query) ||
      resume.skills.some(skill => skill.toLowerCase().includes(query))
    )
  }

  if (activeFilters.value.length > 0) {
    result = result.filter(resume => {
      if (activeFilters.value.includes('remote') && !resume.is_remote_ready) return false
      if (activeFilters.value.includes('relocation') && !resume.is_relocation_ready) return false
      if (activeFilters.value.includes('student') && resume.experience_years > 2) return false
      if (activeFilters.value.includes('experienced') && resume.experience_years < 3) return false
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

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}
</script>

<style scoped>
.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  font-weight: 400;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.search-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: #fff;
  font-size: 1rem;
  color: #111827;
}

.search-input::placeholder {
  color: #9ca3af;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.filter-button {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  background-color: #f3f4f6;
  color: #111827;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-button.active {
  background-color: #4f46e5;
  color: #fff;
  border-color: #4f46e5;
}

.filter-button:hover {
  opacity: 0.9;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 4px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
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

.content-card {
  background-color: #fff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.content-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.opacity-70 {
  opacity: 0.7;
}

.hover\:opacity-80:hover {
  opacity: 0.8;
}

.transition-opacity {
  transition: opacity 0.2s ease;
}
</style>