<template>
  <div class="company-reviews">
    <div class="container mx-auto px-4 py-8">
      <div v-if="loading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <div v-else>
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Отзывы о компании</h1>

        <div v-if="reviews.length === 0" class="text-center py-12">
          <p class="text-gray-600">Пока нет отзывов о компании</p>
        </div>

        <div v-else class="space-y-6">
          <div 
            v-for="review in reviews" 
            :key="review.id"
            class="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div class="p-6">
              <div class="flex items-center space-x-4 mb-4">
                <img 
                  :src="review.author.photo || '/default-avatar.png'" 
                  :alt="review.author.fullName"
                  class="w-12 h-12 rounded-full object-cover"
                >
                <div>
                  <h2 class="text-xl font-semibold text-gray-900">{{ review.author.fullName }}</h2>
                  <p class="text-sm text-gray-500">{{ formatDate(review.createdAt) }}</p>
                </div>
              </div>

              <div class="flex items-center mb-4">
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

              <p class="text-gray-600 whitespace-pre-line">{{ review.comment }}</p>

              <div v-if="isOwner" class="mt-4 flex justify-end">
                <button 
                  @click="deleteReview(review.id)"
                  class="text-red-500 hover:text-red-700 font-medium"
                >
                  Удалить отзыв
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Форма добавления отзыва -->
        <div v-if="isAuthenticated && userType === 'specialist'" class="mt-8">
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Оставить отзыв</h2>
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
import { useRoute } from 'vue-router'
import { useCompaniesStore } from '../store/companies'
import { useAuthStore } from '@/modules/auth/store/auth'

const route = useRoute()
const companiesStore = useCompaniesStore()
const authStore = useAuthStore()

const { reviews, loading, error } = companiesStore
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userType = computed(() => authStore.userType)
const isOwner = computed(() => companiesStore.company?.userId === authStore.userId)

const newReview = ref({
  rating: 0,
  comment: ''
})

onMounted(async () => {
  await companiesStore.fetchCompanyReviews(route.params.id)
})

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

async function submitReview() {
  try {
    const review = await companiesStore.createReview(route.params.id, newReview.value)
    reviews.value.unshift(review)
    newReview.value = { rating: 0, comment: '' }
  } catch (err) {
    console.error('Ошибка при отправке отзыва:', err)
  }
}

async function deleteReview(reviewId) {
  if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return

  try {
    await companiesStore.deleteReview(reviewId)
    reviews.value = reviews.value.filter(review => review.id !== reviewId)
  } catch (err) {
    console.error('Ошибка при удалении отзыва:', err)
  }
}
</script> 