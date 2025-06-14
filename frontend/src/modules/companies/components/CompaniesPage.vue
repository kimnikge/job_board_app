<template>
  <div class="companies-page">
    <div class="container mx-auto px-4 py-8">
      <!-- Фильтры -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Поиск
            </label>
            <input 
              v-model="filters.search"
              type="text"
              placeholder="Название компании или отрасль"
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
              Отрасль
            </label>
            <select 
              v-model="filters.industry"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              @change="handleSearch"
            >
              <option value="">Все отрасли</option>
              <option 
                v-for="industry in industries" 
                :key="industry"
                :value="industry"
              >
                {{ industry }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Список компаний -->
      <div v-if="loading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <div v-else>
        <div v-if="companies.length === 0" class="text-center py-12">
          <p class="text-gray-600 mb-4">Компании не найдены</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="company in companies" 
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
                  v-if="isAuthenticated && userType === 'specialist'"
                  @click="toggleSubscription(company)"
                  class="text-primary hover:text-primary-dark font-medium"
                >
                  {{ company.isSubscribed ? 'Отписаться' : 'Подписаться' }}
                </button>
              </div>
            </div>
          </div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCompaniesStore } from '../store/companies'
import { useAuthStore } from '@/modules/auth/store/auth'
import debounce from 'lodash/debounce'

const companiesStore = useCompaniesStore()
const authStore = useAuthStore()

const { companies, loading, error } = companiesStore
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userType = computed(() => authStore.userType)

const filters = ref({
  search: '',
  location: '',
  industry: ''
})

const currentPage = ref(1)
const totalPages = ref(1)

const industries = [
  'IT и разработка',
  'Маркетинг',
  'Продажи',
  'Финансы',
  'HR',
  'Дизайн',
  'Медиа',
  'Образование',
  'Медицина',
  'Производство',
  'Строительство',
  'Торговля',
  'Транспорт',
  'Другое'
]

// Обработка поиска с задержкой
const handleSearch = debounce(async () => {
  currentPage.value = 1
  await fetchCompanies()
}, 300)

// Загрузка компаний
async function fetchCompanies() {
  try {
    const response = await companiesStore.fetchCompanies({
      page: currentPage.value,
      ...filters.value
    })
    totalPages.value = Math.ceil(response.total / response.perPage)
  } catch (err) {
    console.error('Ошибка при загрузке компаний:', err)
  }
}

// Смена страницы
async function changePage(page) {
  currentPage.value = page
  await fetchCompanies()
}

// Подписка/отписка от компании
async function toggleSubscription(company) {
  try {
    if (company.isSubscribed) {
      await companiesStore.unsubscribeFromCompany(company.id)
    } else {
      await companiesStore.subscribeToCompany(company.id)
    }
    company.isSubscribed = !company.isSubscribed
  } catch (err) {
    console.error('Ошибка при изменении подписки:', err)
  }
}

onMounted(() => {
  fetchCompanies()
})
</script> 