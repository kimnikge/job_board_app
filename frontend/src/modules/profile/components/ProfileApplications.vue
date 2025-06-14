<template>
  <div class="profile-applications">
    <div class="container mx-auto px-4 py-8">
      <div v-if="loading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <div v-else>
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Мои отклики</h1>

        <div v-if="applications.length === 0" class="text-center py-12">
          <p class="text-gray-600 mb-4">У вас пока нет откликов на вакансии</p>
          <router-link 
            to="/jobs"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
          >
            Найти вакансии
          </router-link>
        </div>

        <div v-else class="space-y-6">
          <div 
            v-for="application in applications" 
            :key="application.id"
            class="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-4">
                  <img 
                    :src="application.company.logo || '/default-company.png'" 
                    :alt="application.company.name"
                    class="w-12 h-12 rounded-full object-cover"
                  >
                  <div>
                    <h2 class="text-xl font-semibold text-gray-900">{{ application.job.title }}</h2>
                    <p class="text-gray-600">{{ application.company.name }}</p>
                  </div>
                </div>

                <div class="flex items-center space-x-2">
                  <span 
                    :class="{
                      'bg-green-100 text-green-800': application.status === 'accepted',
                      'bg-yellow-100 text-yellow-800': application.status === 'pending',
                      'bg-red-100 text-red-800': application.status === 'rejected'
                    }"
                    class="px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {{ statusText[application.status] }}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="flex items-center text-gray-600">
                  <i class="fas fa-map-marker-alt w-5"></i>
                  <span>{{ application.job.location }}</span>
                </div>

                <div class="flex items-center text-gray-600">
                  <i class="fas fa-money-bill-wave w-5"></i>
                  <span>{{ application.job.salary }}</span>
                </div>

                <div class="flex items-center text-gray-600">
                  <i class="fas fa-clock w-5"></i>
                  <span>{{ application.job.employmentType }}</span>
                </div>

                <div class="flex items-center text-gray-600">
                  <i class="fas fa-calendar w-5"></i>
                  <span>Отклик: {{ formatDate(application.createdAt) }}</span>
                </div>
              </div>

              <div class="border-t border-gray-200 pt-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Сопроводительное письмо</h3>
                <p class="text-gray-600 whitespace-pre-line">{{ application.coverLetter }}</p>
              </div>

              <div class="mt-4 flex justify-between items-center">
                <router-link 
                  :to="`/jobs/${application.job.id}`"
                  class="text-primary hover:text-primary-dark font-medium"
                >
                  Просмотреть вакансию
                </router-link>

                <button 
                  v-if="application.status === 'pending'"
                  @click="cancelApplication(application.id)"
                  class="text-red-500 hover:text-red-700 font-medium"
                >
                  Отменить отклик
                </button>
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
import { useProfileStore } from '../store/profile'

const profileStore = useProfileStore()
const { applications, loading, error } = profileStore

const statusText = {
  pending: 'На рассмотрении',
  accepted: 'Принято',
  rejected: 'Отклонено'
}

onMounted(async () => {
  await profileStore.fetchApplications()
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function cancelApplication(applicationId) {
  try {
    await profileStore.cancelApplication(applicationId)
    await profileStore.fetchApplications()
  } catch (err) {
    console.error('Ошибка при отмене отклика:', err)
  }
}
</script> 