<template>
  <div class="job-details">
    <div v-if="job" class="job-details__content">
      <div class="job-details__header">
        <h1 class="job-details__title">{{ job.title }}</h1>
        <div class="job-details__company">{{ job.company.name }}</div>
        <div class="job-details__meta">
          <span class="job-details__location">{{ job.location }}</span>
          <span class="job-details__salary">{{ formatSalary(job.salary) }}</span>
        </div>
      </div>

      <div class="job-details__description">
        <h2>Описание</h2>
        <p>{{ job.description }}</p>
      </div>

      <div class="job-details__requirements">
        <h2>Требования</h2>
        <ul>
          <li v-for="(req, index) in job.requirements" :key="index">
            {{ req }}
          </li>
        </ul>
      </div>

      <div class="job-details__actions">
        <button
          v-if="isAuthenticated"
          @click="handleApply"
          class="btn btn--primary"
          :disabled="hasApplied"
        >
          {{ hasApplied ? 'Отклик отправлен' : 'Откликнуться' }}
        </button>
        <button
          v-else
          @click="handleAuthRequired"
          class="btn btn--primary"
        >
          Войти для отклика
        </button>
      </div>
    </div>
    <div v-else class="job-details__loading">
      Загрузка...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth'
import { showSuccess, showError } from '@/shared/services/notificationService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const job = ref(null)
const hasApplied = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)

const formatSalary = (salary) => {
  if (!salary) return 'Зарплата не указана'
  const { min, max, currency } = salary
  return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`
}

const handleAuthRequired = () => {
  router.push({
    name: 'auth',
    query: { redirect: route.fullPath }
  })
}

const handleApply = async () => {
  try {
    // Здесь будет логика отправки отклика
    hasApplied.value = true
    showSuccess('Отклик отправлен', 'Ваш отклик успешно отправлен работодателю')
  } catch (error) {
    showError('Ошибка', 'Не удалось отправить отклик')
    console.error('Ошибка при отправке отклика:', error)
  }
}

onMounted(async () => {
  try {
    // Здесь будет загрузка данных вакансии
    job.value = {
      id: 1,
      title: 'Frontend Developer',
      company: { name: 'Tech Solutions' },
      location: 'Москва',
      salary: { min: 150000, max: 200000, currency: 'RUB' },
      description: 'Мы ищем опытного Frontend разработчика...',
      requirements: [
        'Опыт работы с Vue.js от 2 лет',
        'Знание HTML, CSS, JavaScript',
        'Опыт работы с REST API'
      ]
    }
  } catch (error) {
    showError('Ошибка', 'Не удалось загрузить данные вакансии')
    console.error('Ошибка при загрузке вакансии:', error)
  }
})
</script>

<style scoped>
.job-details {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.job-details__content {
  background: var(--color-card);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--color-shadow);
}

.job-details__header {
  margin-bottom: 2rem;
}

.job-details__title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.job-details__company {
  font-size: 1.25rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.job-details__meta {
  display: flex;
  gap: 1rem;
  color: var(--color-text-light);
}

.job-details__description,
.job-details__requirements {
  margin-bottom: 2rem;
}

.job-details__description h2,
.job-details__requirements h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.job-details__requirements ul {
  list-style: disc;
  padding-left: 1.5rem;
}

.job-details__requirements li {
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.job-details__actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.job-details__loading {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-light);
}
</style> 