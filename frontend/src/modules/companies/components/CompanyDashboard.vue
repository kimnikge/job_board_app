<template>
  <div class="company-dashboard">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Панель управления</h1>

        <!-- Статистика -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm">Активные вакансии</p>
                <h3 class="text-2xl font-bold text-gray-900">{{ stats.activeJobs }}</h3>
              </div>
              <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <i class="fas fa-briefcase text-primary text-xl"></i>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm">Новые отклики</p>
                <h3 class="text-2xl font-bold text-gray-900">{{ stats.newApplications }}</h3>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i class="fas fa-user-plus text-green-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm">Просмотры профиля</p>
                <h3 class="text-2xl font-bold text-gray-900">{{ stats.profileViews }}</h3>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="fas fa-eye text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm">Подписчики</p>
                <h3 class="text-2xl font-bold text-gray-900">{{ stats.subscribers }}</h3>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <i class="fas fa-users text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Последние отклики -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Последние отклики</h2>
            <router-link 
              to="/company/applications"
              class="text-primary hover:text-primary-dark font-medium"
            >
              Все отклики
            </router-link>
          </div>

          <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>

          <div v-else-if="error" class="text-red-600 text-center py-8">
            {{ error }}
          </div>

          <div v-else-if="applications.length === 0" class="text-center py-8 text-gray-600">
            Нет новых откликов
          </div>

          <div v-else class="space-y-4">
            <div 
              v-for="application in applications" 
              :key="application.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-start space-x-4">
                  <img 
                    :src="application.specialist.avatar || '/default-avatar.png'" 
                    :alt="application.specialist.name"
                    class="w-12 h-12 rounded-full object-cover"
                  >
                  <div>
                    <h3 class="font-medium text-gray-900">
                      {{ application.specialist.name }}
                    </h3>
                    <p class="text-gray-600 text-sm">
                      {{ application.job.title }}
                    </p>
                  </div>
                </div>
                <span 
                  :class="{
                    'bg-yellow-100 text-yellow-800': application.status === 'pending',
                    'bg-green-100 text-green-800': application.status === 'accepted',
                    'bg-red-100 text-red-800': application.status === 'rejected'
                  }"
                  class="px-3 py-1 rounded-full text-sm font-medium"
                >
                  {{ getStatusText(application.status) }}
                </span>
              </div>

              <div class="mt-4 flex justify-end space-x-4">
                <button 
                  v-if="application.status === 'pending'"
                  @click="updateApplicationStatus(application.id, 'accepted')"
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Принять
                </button>
                <button 
                  v-if="application.status === 'pending'"
                  @click="updateApplicationStatus(application.id, 'rejected')"
                  class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Отклонить
                </button>
                <router-link 
                  :to="`/resumes/${application.resumeId}`"
                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Просмотреть резюме
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Активные вакансии -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Активные вакансии</h2>
            <router-link 
              to="/company/jobs"
              class="text-primary hover:text-primary-dark font-medium"
            >
              Все вакансии
            </router-link>
          </div>

          <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>

          <div v-else-if="error" class="text-red-600 text-center py-8">
            {{ error }}
          </div>

          <div v-else-if="jobs.length === 0" class="text-center py-8 text-gray-600">
            Нет активных вакансий
          </div>

          <div v-else class="space-y-4">
            <div 
              v-for="job in jobs" 
              :key="job.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-medium text-gray-900">{{ job.title }}</h3>
                  <p class="text-gray-600 text-sm">
                    {{ job.applicationsCount }} откликов
                  </p>
                </div>
                <div class="flex items-center space-x-4">
                  <span class="text-gray-600">
                    {{ job.salary }}
                  </span>
                  <router-link 
                    :to="`/jobs/${job.id}`"
                    class="text-primary hover:text-primary-dark font-medium"
                  >
                    Просмотреть
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCompaniesStore } from '../store/companies'

const companiesStore = useCompaniesStore()
const loading = ref(false)
const error = ref(null)

const stats = ref({
  activeJobs: 0,
  newApplications: 0,
  profileViews: 0,
  subscribers: 0
})

const applications = ref([])
const jobs = ref([])

onMounted(async () => {
  await Promise.all([
    fetchStats(),
    fetchApplications(),
    fetchJobs()
  ])
})

async function fetchStats() {
  try {
    const response = await companiesStore.fetchCompanyStats()
    stats.value = response
  } catch (err) {
    console.error('Ошибка при загрузке статистики:', err)
  }
}

async function fetchApplications() {
  loading.value = true
  error.value = null

  try {
    const response = await companiesStore.fetchCompanyApplications({ limit: 5 })
    applications.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Ошибка при загрузке откликов'
    console.error('Ошибка при загрузке откликов:', err)
  } finally {
    loading.value = false
  }
}

async function fetchJobs() {
  loading.value = true
  error.value = null

  try {
    const response = await companiesStore.fetchCompanyJobs({ status: 'active', limit: 5 })
    jobs.value = response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Ошибка при загрузке вакансий'
    console.error('Ошибка при загрузке вакансий:', err)
  } finally {
    loading.value = false
  }
}

async function updateApplicationStatus(applicationId, status) {
  try {
    await companiesStore.updateApplicationStatus(applicationId, status)
    await fetchApplications()
  } catch (err) {
    console.error('Ошибка при обновлении статуса отклика:', err)
  }
}

function getStatusText(status) {
  const statusMap = {
    pending: 'На рассмотрении',
    accepted: 'Принят',
    rejected: 'Отклонен'
  }
  return statusMap[status] || status
}
</script> 