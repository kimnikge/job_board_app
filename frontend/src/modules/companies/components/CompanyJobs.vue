<template>
  <div class="company-jobs">
    <div class="container mx-auto px-4 py-8">
      <div v-if="loading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <div v-else>
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Вакансии компании</h1>
          <router-link 
            to="/jobs/create"
            class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Разместить вакансию
          </router-link>
        </div>

        <div v-if="jobs.length === 0" class="text-center py-12">
          <p class="text-gray-600 mb-4">У вас пока нет активных вакансий</p>
          <router-link 
            to="/jobs/create"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
          >
            Разместить вакансию
          </router-link>
        </div>

        <div v-else class="space-y-6">
          <div 
            v-for="job in jobs" 
            :key="job.id"
            class="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h2 class="text-xl font-semibold text-gray-900">{{ job.title }}</h2>
                  <p class="text-gray-600">{{ job.employmentType }}</p>
                </div>
                <span class="text-lg font-semibold text-primary">{{ job.salary }}</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="flex items-center text-gray-600">
                  <i class="fas fa-map-marker-alt w-5"></i>
                  <span>{{ job.location }}</span>
                </div>

                <div class="flex items-center text-gray-600">
                  <i class="fas fa-clock w-5"></i>
                  <span>{{ job.employmentType }}</span>
                </div>

                <div class="flex items-center text-gray-600">
                  <i class="fas fa-calendar w-5"></i>
                  <span>Опубликовано {{ formatDate(job.createdAt) }}</span>
                </div>

                <div class="flex items-center text-gray-600">
                  <i class="fas fa-users w-5"></i>
                  <span>{{ job.applicationsCount }} откликов</span>
                </div>
              </div>

              <p class="text-gray-600 mb-4 line-clamp-3">{{ job.description }}</p>

              <div class="flex flex-wrap gap-2 mb-4">
                <span 
                  v-for="skill in job.skills" 
                  :key="skill"
                  class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {{ skill }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <div class="flex space-x-4">
                  <router-link 
                    :to="`/jobs/${job.id}`"
                    class="text-primary hover:text-primary-dark font-medium"
                  >
                    Подробнее
                  </router-link>

                  <router-link 
                    :to="`/jobs/${job.id}/applications`"
                    class="text-primary hover:text-primary-dark font-medium"
                  >
                    Отклики ({{ job.applicationsCount }})
                  </router-link>
                </div>

                <div class="flex space-x-4">
                  <button 
                    @click="editJob(job.id)"
                    class="text-primary hover:text-primary-dark font-medium"
                  >
                    Редактировать
                  </button>

                  <button 
                    @click="deleteJob(job.id)"
                    class="text-red-500 hover:text-red-700 font-medium"
                  >
                    Удалить
                  </button>
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
import { useRouter } from 'vue-router'
import { useCompaniesStore } from '../store/companies'

const router = useRouter()
const companiesStore = useCompaniesStore()
const { jobs, loading, error } = companiesStore

onMounted(async () => {
  await companiesStore.fetchCompanyJobs()
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function editJob(jobId) {
  router.push(`/jobs/${jobId}/edit`)
}

async function deleteJob(jobId) {
  if (!confirm('Вы уверены, что хотите удалить эту вакансию?')) return

  try {
    await companiesStore.deleteJob(jobId)
    await companiesStore.fetchCompanyJobs()
  } catch (err) {
    console.error('Ошибка при удалении вакансии:', err)
  }
}
</script> 