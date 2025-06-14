<template>
  <div class="profile-subscriptions">
    <div class="container mx-auto px-4 py-8">
      <div v-if="loading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <div v-else>
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Мои подписки</h1>

        <div v-if="subscriptions.length === 0" class="text-center py-12">
          <p class="text-gray-600 mb-4">У вас пока нет подписок на компании</p>
          <router-link 
            to="/companies"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
          >
            Найти компании
          </router-link>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="company in subscriptions" 
            :key="company.id"
            class="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div class="p-6">
              <div class="flex items-center space-x-4 mb-4">
                <img 
                  :src="company.logo || '/default-company.png'" 
                  :alt="company.name"
                  class="w-16 h-16 rounded-full object-cover"
                >
                <div>
                  <h2 class="text-xl font-semibold text-gray-900">{{ company.name }}</h2>
                  <p class="text-gray-600">{{ company.industry }}</p>
                </div>
              </div>

              <p class="text-gray-600 mb-4 line-clamp-3">{{ company.description }}</p>

              <div class="flex items-center text-gray-500 text-sm mb-4">
                <i class="fas fa-map-marker-alt w-5"></i>
                <span>{{ company.location }}</span>
              </div>

              <div class="flex items-center text-gray-500 text-sm mb-4">
                <i class="fas fa-briefcase w-5"></i>
                <span>{{ company.employeesCount }} сотрудников</span>
              </div>

              <div class="flex items-center text-gray-500 text-sm mb-4">
                <i class="fas fa-globe w-5"></i>
                <a 
                  :href="company.website" 
                  target="_blank"
                  class="text-primary hover:text-primary-dark"
                >
                  {{ company.website }}
                </a>
              </div>

              <div class="flex justify-between items-center">
                <router-link 
                  :to="`/companies/${company.id}`"
                  class="text-primary hover:text-primary-dark font-medium"
                >
                  Подробнее
                </router-link>

                <button 
                  @click="unsubscribe(company.id)"
                  class="text-red-500 hover:text-red-700 font-medium"
                >
                  Отписаться
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
const { subscriptions, loading, error } = profileStore

onMounted(async () => {
  await profileStore.fetchSubscriptions()
})

async function unsubscribe(companyId) {
  try {
    await profileStore.unsubscribeFromCompany(companyId)
    await profileStore.fetchSubscriptions()
  } catch (err) {
    console.error('Ошибка при отписке от компании:', err)
  }
}
</script> 