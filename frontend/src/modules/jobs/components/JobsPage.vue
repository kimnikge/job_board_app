<template>
  <div class="jobs-page">
    <div class="container mx-auto px-4 py-8">
      <!-- Фильтры -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Поиск
            </label>
            <input 
              v-model="filters.search"
              type="text"
              placeholder="Название вакансии или навыки"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              @input="handleSearch"
            >
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Город
            </label>
            <input 
              v-model="filters.location"
              type="text"
              placeholder="Введите город"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              @input="handleSearch"
            >
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Тип занятости
            </label>
            <select 
              v-model="filters.employmentType"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              @change="handleSearch"
            >
              <option value="">Все типы</option>
              <option value="full-time">Полная занятость</option>
              <option value="part-time">Частичная занятость</option>
              <option value="contract">Контракт</option>
              <option value="internship">Стажировка</option>
            </select>
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Опыт работы
            </label>
            <select 
              v-model="filters.experience"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              @change="handleSearch"
            >
              <option value="">Любой опыт</option>
              <option value="no-experience">Без опыта</option>
              <option value="1-3">1-3 года</option>
              <option value="3-5">3-5 лет</option>
              <option value="5+">Более 5 лет</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Список вакансий -->
      <div v-if="loading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <div v-else>
        <div v-if="jobs && jobs.length === 0" class="text-center py-12">
          <p class="text-gray-600 mb-4">Вакансии не найдены</p>
        </div>

        <div v-else-if="jobs" class="space-y-6">
          <UrgentJobCard
            v-for="job in jobs"
            :key="job.id"
            :title="job.title"
            :company="job.company.name"
            :salary="job.salary_range"
            :city="job.location"
            :deadline="job.deadline"
            :description="job.description"
            :tags="job.tags"
            :benefits="job.benefits"
            :published="formatDate(job.created_at)"
            :companyLogo="job.company.logo || '🏢'"
            :isUrgent="job.is_urgent"
            :isRegular="!job.is_urgent"
            @apply="applyForJob(job)"
          />
        </div>

        <!-- Пагинация -->
        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
          <div class="flex space-x-2">
            <button 
              v-for="page in totalPages" 
              :key="page"
              @click="changePage(page)"
              :class="{
                'bg-primary text-white': currentPage === page,
                'bg-white text-gray-700 hover:bg-gray-50': currentPage !== page
              }"
              class="px-4 py-2 border border-gray-300 rounded-md"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно отклика -->
    <div 
      v-if="showApplyModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Отклик на вакансию</h2>
          
          <form @submit.prevent="submitApplication" class="space-y-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Сопроводительное письмо
              </label>
              <textarea 
                v-model="application.coverLetter"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              ></textarea>
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">
                Резюме
              </label>
              <input 
                type="file"
                accept=".pdf,.doc,.docx"
                @change="handleResumeChange"
                class="w-full"
                required
              >
              <p class="text-sm text-gray-500 mt-1">
                Поддерживаемые форматы: PDF, DOC, DOCX
              </p>
            </div>

            <div class="flex justify-end space-x-4">
              <button 
                type="button"
                @click="showApplyModal = false"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Отмена
              </button>
              <button 
                type="submit"
                class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                :disabled="!application.coverLetter || !application.resume"
              >
                Отправить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useJobsStore } from '../store/jobs'
import { useAuthStore } from '@/modules/auth/store/auth'
import UrgentJobCard from '@/components/UrgentJobCard.vue'
import debounce from 'lodash/debounce'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const jobsStore = useJobsStore()
const authStore = useAuthStore()

const { jobs, loading, error } = storeToRefs(jobsStore)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userType = computed(() => authStore.userType)

const filters = ref({
  search: '',
  location: '',
  employmentType: '',
  experience: ''
})

const currentPage = ref(1)
const totalPages = ref(1)
const showApplyModal = ref(false)
const selectedJob = ref(null)

const application = ref({
  coverLetter: '',
  resume: null
})

// Обработка поиска с задержкой
const handleSearch = debounce(async () => {
  currentPage.value = 1
  await fetchJobs()
}, 300)

// Загрузка вакансий
async function fetchJobs() {
  try {
    const response = await jobsStore.fetchJobs({
      page: currentPage.value,
      is_urgent: false,
      ...filters.value
    })
    totalPages.value = Math.ceil(response.total / response.perPage)
  } catch (err) {
    console.error('Ошибка при загрузке вакансий:', err)
  }
}

// Смена страницы
async function changePage(page) {
  currentPage.value = page
  await fetchJobs()
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function applyForJob(job) {
  if (!isAuthenticated.value) {
    router.push('/auth/login')
    return
  }

  selectedJob.value = job
  showApplyModal.value = true
}

function handleResumeChange(event) {
  const file = event.target.files[0]
  if (file) {
    application.value.resume = file
  }
}

async function submitApplication() {
  try {
    const formData = new FormData()
    formData.append('coverLetter', application.value.coverLetter)
    formData.append('resume', application.value.resume)

    await jobsStore.applyForJob(selectedJob.value.id, formData)
    selectedJob.value.hasApplied = true
    showApplyModal.value = false
    application.value = { coverLetter: '', resume: null }
  } catch (err) {
    console.error('Ошибка при отправке отклика:', err)
  }
}

onMounted(() => {
  fetchJobs()
})

watch(route, () => {
  fetchJobs()
})
</script> 