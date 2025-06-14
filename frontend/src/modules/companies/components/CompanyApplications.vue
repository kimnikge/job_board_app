<template>
  <div class="company-applications">
    <div class="container mx-auto px-4 py-8">
      <div v-if="loading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <div v-else>
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Отклики на вакансии</h1>

        <div v-if="applications.length === 0" class="text-center py-12">
          <p class="text-gray-600">У вас пока нет откликов на вакансии</p>
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
                    :src="application.specialist.photo || '/default-avatar.png'" 
                    :alt="application.specialist.fullName"
                    class="w-12 h-12 rounded-full object-cover"
                  >
                  <div>
                    <h2 class="text-xl font-semibold text-gray-900">{{ application.specialist.fullName }}</h2>
                    <p class="text-gray-600">{{ application.job.title }}</p>
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
                  <i class="fas fa-envelope w-5"></i>
                  <a 
                    :href="`mailto:${application.specialist.email}`"
                    class="text-primary hover:text-primary-dark"
                  >
                    {{ application.specialist.email }}
                  </a>
                </div>

                <div class="flex items-center text-gray-600">
                  <i class="fas fa-phone w-5"></i>
                  <a 
                    :href="`tel:${application.specialist.phone}`"
                    class="text-primary hover:text-primary-dark"
                  >
                    {{ application.specialist.phone }}
                  </a>
                </div>

                <div class="flex items-center text-gray-600">
                  <i class="fas fa-calendar w-5"></i>
                  <span>Отклик: {{ formatDate(application.createdAt) }}</span>
                </div>

                <div class="flex items-center text-gray-600">
                  <i class="fas fa-file-alt w-5"></i>
                  <a 
                    :href="application.resume"
                    target="_blank"
                    class="text-primary hover:text-primary-dark"
                  >
                    Скачать резюме
                  </a>
                </div>
              </div>

              <div class="border-t border-gray-200 pt-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Сопроводительное письмо</h3>
                <p class="text-gray-600 whitespace-pre-line">{{ application.coverLetter }}</p>
              </div>

              <div class="mt-4 flex justify-end space-x-4">
                <button 
                  v-if="application.status === 'pending'"
                  @click="rejectApplication(application.id)"
                  class="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50"
                >
                  Отклонить
                </button>

                <button 
                  v-if="application.status === 'pending'"
                  @click="acceptApplication(application.id)"
                  class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Принять
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
import { useCompaniesStore } from '../store/companies'

const companiesStore = useCompaniesStore()
const { applications, loading, error } = companiesStore

const statusText = {
  pending: 'На рассмотрении',
  accepted: 'Принято',
  rejected: 'Отклонено'
}

onMounted(async () => {
  await companiesStore.fetchApplications()
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function acceptApplication(applicationId) {
  try {
    await companiesStore.acceptApplication(applicationId)
    await companiesStore.fetchApplications()
  } catch (err) {
    console.error('Ошибка при принятии отклика:', err)
  }
}

async function rejectApplication(applicationId) {
  try {
    await companiesStore.rejectApplication(applicationId)
    await companiesStore.fetchApplications()
  } catch (err) {
    console.error('Ошибка при отклонении отклика:', err)
  }
}
</script> 