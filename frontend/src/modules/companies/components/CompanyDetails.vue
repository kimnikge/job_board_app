<template>
  <div class="company-details">
    <div class="container mx-auto px-4 py-8">
      <div v-if="loading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <div v-else-if="company" class="max-w-4xl mx-auto">
        <!-- Шапка компании -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div class="flex items-start space-x-6">
            <img 
              :src="company.logo || '/default-company.png'" 
              :alt="company.name"
              class="w-32 h-32 rounded-full object-cover"
            >
            <div class="flex-grow">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ company.name }}</h1>
              <p class="text-xl text-gray-600 mb-4">{{ company.industry }}</p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center text-gray-600">
                  <i class="fas fa-map-marker-alt w-5"></i>
                  <span>{{ company.location }}</span>
                </div>

                <div class="flex items-center text-gray-600">
                  <i class="fas fa-briefcase w-5"></i>
                  <span>{{ company.employeesCount }} сотрудников</span>
                </div>

                <div class="flex items-center text-gray-600">
                  <i class="fas fa-globe w-5"></i>
                  <a 
                    :href="company.website" 
                    target="_blank"
                    class="text-primary hover:text-primary-dark"
                  >
                    {{ company.website }}
                  </a>
                </div>

                <div class="flex items-center text-gray-600">
                  <i class="fas fa-envelope w-5"></i>
                  <a 
                    :href="`mailto:${company.email}`"
                    class="text-primary hover:text-primary-dark"
                  >
                    {{ company.email }}
                  </a>
                </div>
              </div>

              <div class="mt-4 flex space-x-4">
                <button 
                  v-if="isAuthenticated && userType === 'specialist'"
                  @click="toggleSubscription"
                  class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white"
                  :class="company.isSubscribed ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-dark'"
                >
                  {{ company.isSubscribed ? 'Отписаться' : 'Подписаться' }}
                </button>

                <router-link 
                  v-if="isAuthenticated && userType === 'company' && isOwner"
                  :to="`/company/setup`"
                  class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Редактировать
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Описание компании -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">О компании</h2>
          <p class="text-gray-600 whitespace-pre-line">{{ company.description }}</p>
        </div>

        <!-- Вакансии компании -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-gray-900">Вакансии</h2>
            <router-link 
              v-if="isAuthenticated && userType === 'company' && isOwner"
              to="/jobs/create"
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Разместить вакансию
            </router-link>
          </div>

          <div v-if="company.jobs.length === 0" class="text-center py-8">
            <p class="text-gray-600">У компании пока нет активных вакансий</p>
          </div>

          <div v-else class="space-y-4">
            <div 
              v-for="job in company.jobs" 
              :key="job.id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ job.title }}</h3>
                  <p class="text-gray-600">{{ job.employmentType }}</p>
                </div>
                <span class="text-lg font-semibold text-primary">{{ job.salary }}</span>
              </div>

              <div class="mt-4 flex items-center text-gray-500 text-sm space-x-4">
                <div class="flex items-center">
                  <i class="fas fa-map-marker-alt w-4"></i>
                  <span class="ml-1">{{ job.location }}</span>
                </div>
                <div class="flex items-center">
                  <i class="fas fa-clock w-4"></i>
                  <span class="ml-1">{{ job.employmentType }}</span>
                </div>
                <div class="flex items-center">
                  <i class="fas fa-calendar w-4"></i>
                  <span class="ml-1">Опубликовано {{ formatDate(job.createdAt) }}</span>
                </div>
              </div>

              <div class="mt-4 flex justify-between items-center">
                <router-link 
                  :to="`/jobs/${job.id}`"
                  class="text-primary hover:text-primary-dark font-medium"
                >
                  Подробнее
                </router-link>

                <button 
                  v-if="isAuthenticated && userType === 'company' && isOwner"
                  @click="deleteJob(job.id)"
                  class="text-red-500 hover:text-red-700 font-medium"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Отзывы о компании -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Отзывы</h2>

          <div v-if="company.reviews.length === 0" class="text-center py-8">
            <p class="text-gray-600">Пока нет отзывов о компании</p>
          </div>

          <div v-else class="space-y-6">
            <div 
              v-for="review in company.reviews" 
              :key="review.id"
              class="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
            >
              <div class="flex items-center space-x-4 mb-4">
                <img 
                  :src="review.author.photo || '/default-avatar.png'" 
                  :alt="review.author.fullName"
                  class="w-12 h-12 rounded-full object-cover"
                >
                <div>
                  <h3 class="font-semibold text-gray-900">{{ review.author.fullName }}</h3>
                  <p class="text-sm text-gray-500">{{ formatDate(review.createdAt) }}</p>
                </div>
              </div>

              <div class="flex items-center mb-2">
                <div class="flex items-center">
                  <i 
                    v-for="star in 5" 
                    :key="star"
                    class="fas fa-star"
                    :class="star <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                  ></i>
                </div>
                <span class="ml-2 text-sm text-gray-500">{{ review.rating }}/5</span>
              </div>

              <p class="text-gray-600">{{ review.comment }}</p>
            </div>
          </div>

          <!-- Форма добавления отзыва -->
          <div v-if="isAuthenticated && userType === 'specialist'" class="mt-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Оставить отзыв</h3>
            <form @submit.prevent="submitReview" class="space-y-4">
              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Оценка
                </label>
                <div class="flex items-center">
                  <button 
                    v-for="star in 5" 
                    :key="star"
                    type="button"
                    @click="newReview.rating = star"
                    class="text-2xl"
                    :class="star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'"
                  >
                    ★
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-gray-700 text-sm font-bold mb-2">
                  Комментарий
                </label>
                <textarea 
                  v-model="newReview.comment"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                ></textarea>
              </div>

              <button 
                type="submit"
                class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                :disabled="!newReview.rating || !newReview.comment"
              >
                Отправить отзыв
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCompaniesStore } from '../store/companies'
import { useAuthStore } from '@/modules/auth/store/auth'

const route = useRoute()
const router = useRouter()
const companiesStore = useCompaniesStore()
const authStore = useAuthStore()

const { company, loading, error } = companiesStore
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userType = computed(() => authStore.userType)
const isOwner = computed(() => company.value?.userId === authStore.userId)

const newReview = ref({
  rating: 0,
  comment: ''
})

onMounted(async () => {
  await companiesStore.fetchCompanyById(route.params.id)
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function toggleSubscription() {
  try {
    if (company.value.isSubscribed) {
      await companiesStore.unsubscribeFromCompany(company.value.id)
    } else {
      await companiesStore.subscribeToCompany(company.value.id)
    }
    company.value.isSubscribed = !company.value.isSubscribed
  } catch (err) {
    console.error('Ошибка при изменении подписки:', err)
  }
}

async function deleteJob(jobId) {
  if (!confirm('Вы уверены, что хотите удалить эту вакансию?')) return

  try {
    await companiesStore.deleteJob(jobId)
    company.value.jobs = company.value.jobs.filter(job => job.id !== jobId)
  } catch (err) {
    console.error('Ошибка при удалении вакансии:', err)
  }
}

async function submitReview() {
  try {
    const review = await companiesStore.createReview(company.value.id, newReview.value)
    company.value.reviews.unshift(review)
    newReview.value = { rating: 0, comment: '' }
  } catch (err) {
    console.error('Ошибка при отправке отзыва:', err)
  }
}
</script> 