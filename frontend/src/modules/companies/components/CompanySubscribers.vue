<template>
  <div class="company-subscribers">
    <div class="container mx-auto px-4 py-8">
      <div v-if="loading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <div v-else>
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Подписчики компании</h1>

        <div v-if="subscribers.length === 0" class="text-center py-12">
          <p class="text-gray-600">У компании пока нет подписчиков</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="subscriber in subscribers" 
            :key="subscriber.id"
            class="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div class="p-6">
              <div class="flex items-center space-x-4 mb-4">
                <img 
                  :src="subscriber.photo || '/default-avatar.png'" 
                  :alt="subscriber.fullName"
                  class="w-16 h-16 rounded-full object-cover"
                >
                <div>
                  <h2 class="text-xl font-semibold text-gray-900">{{ subscriber.fullName }}</h2>
                  <p class="text-gray-600">{{ subscriber.position }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4 mb-4">
                <div class="flex items-center text-gray-600">
                  <i class="fas fa-envelope w-5"></i>
                  <a 
                    :href="`mailto:${subscriber.email}`"
                    class="text-primary hover:text-primary-dark"
                  >
                    {{ subscriber.email }}
                  </a>
                </div>

                <div class="flex items-center text-gray-600">
                  <i class="fas fa-phone w-5"></i>
                  <a 
                    :href="`tel:${subscriber.phone}`"
                    class="text-primary hover:text-primary-dark"
                  >
                    {{ subscriber.phone }}
                  </a>
                </div>

                <div class="flex items-center text-gray-600">
                  <i class="fas fa-map-marker-alt w-5"></i>
                  <span>{{ subscriber.location }}</span>
                </div>
              </div>

              <div class="flex flex-wrap gap-2 mb-4">
                <span 
                  v-for="skill in subscriber.skills" 
                  :key="skill"
                  class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {{ skill }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <router-link 
                  :to="`/specialists/${subscriber.id}`"
                  class="text-primary hover:text-primary-dark font-medium"
                >
                  Профиль
                </router-link>

                <a 
                  :href="subscriber.resume"
                  target="_blank"
                  class="text-primary hover:text-primary-dark font-medium"
                >
                  Скачать резюме
                </a>
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
import { useRoute } from 'vue-router'
import { useCompaniesStore } from '../store/companies'

const route = useRoute()
const companiesStore = useCompaniesStore()
const { subscribers, loading, error } = companiesStore

onMounted(async () => {
  await companiesStore.fetchCompanySubscribers(route.params.id)
})
</script> 