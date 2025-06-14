<template>
  <div class="job-details">
    <div class="container mx-auto px-4 py-8">
      <div v-if="loading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <div v-else-if="job" class="max-w-4xl mx-auto">
        <!-- Шапка вакансии -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-start space-x-4">
              <img 
                :src="job.company.logo || '/default-company.png'" 
                :alt="job.company.name"
                class="w-16 h-16 rounded-full object-cover"
              >
              <div>
                <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ job.title }}</h1>
                <router-link 
                  :to="`/companies/${job.company.id}`"
                  class="text-xl text-gray-600 hover:text-primary"
                >
                  {{ job.company.name }}
                </router-link>
              </div>
            </div>
            <span class="text-2xl font-semibold text-primary">{{ job.salary }}</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center text-gray-600">
              <i class="fas fa-map-marker-alt w-5"></i>
              <span>{{ job.location }}</span>
            </div>

            <div class="flex items-center text-gray-600">
              <i class="fas fa-clock w-5"></i>
              <span>{{ job.employmentType }}</span>
            </div>

            <div class="flex items-center text-gray-600">
              <i class="fas fa-briefcase w-5"></i>
              <span>{{ job.experience }}</span>
            </div>

            <div class="flex items-center text-gray-600">
              <i class="fas fa-calendar w-5"></i>
              <span>Опубликовано {{ formatDate(job.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Описание вакансии -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Описание</h2>
          <div class="prose max-w-none">
            <p class="text-gray-600 whitespace-pre-line">{{ job.description }}</p>
          </div>
        </div>

        <!-- Требования -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Требования</h2>
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Навыки</h3>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="skill in job.skills" 
                  :key="skill"
                  class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {{ skill }}
                </span>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Обязанности</h3>
              <ul class="list-disc list-inside text-gray-600 space-y-2">
                <li 
                  v-for="(responsibility, index) in job.responsibilities" 
                  :key="index"
                >
                  {{ responsibility }}
                </li>
              </ul>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Условия</h3>
              <ul class="list-disc list-inside text-gray-600 space-y-2">
                <li 
                  v-for="(benefit, index) in job.benefits" 
                  :key="index"
                >
                  {{ benefit }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Информация о компании -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">О компании</h2>
          <div class="flex items-start space-x-4">
            <img 
              :src="job.company.logo || '/default-company.png'" 
              :alt="job.company.name"
              class="w-16 h-16 rounded-full object-cover"
            >
            <div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ job.company.name }}</h3>
              <p class="text-gray-600 mb-4">{{ job.company.description }}</p>
              <div class="flex items-center text-gray-600">
                <i class="fas fa-users w-5"></i>
                <span>{{ job.company.employeesCount }} сотрудников</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопка отклика -->
        <div class="flex justify-center">
          <button 
            v-if="isAuthenticated && userType === 'specialist'"
            @click="showApplyModal = true"
            class="px-8 py-3 bg-primary text-white rounded-md hover:bg-primary-dark text-lg font-medium"
            :disabled="job.hasApplied"
          >
            {{ job.hasApplied ? 'Отклик отправлен' : 'Откликнуться' }}
          </button>

          <button 
            v-else-if="!isAuthenticated"
            @click="router.push('/auth/login')"
            class="px-8 py-3 bg-primary text-white rounded-md hover:bg-primary-dark text-lg font-medium"
          >
            Войти для отклика
          </button>
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
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobsStore } from '../store/jobs'
import { useAuthStore } from '@/modules/auth/store/auth'

const route = useRoute()
const router = useRouter()
const jobsStore = useJobsStore()
const authStore = useAuthStore()

const { job, loading, error } = jobsStore
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userType = computed(() => authStore.userType)

const showApplyModal = ref(false)
const application = ref({
  coverLetter: '',
  resume: null
})

onMounted(async () => {
  await jobsStore.fetchJobById(route.params.id)
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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

    await jobsStore.applyForJob(job.value.id, formData)
    job.value.hasApplied = true
    showApplyModal.value = false
    application.value = { coverLetter: '', resume: null }
  } catch (err) {
    console.error('Ошибка при отправке отклика:', err)
  }
}
</script> 