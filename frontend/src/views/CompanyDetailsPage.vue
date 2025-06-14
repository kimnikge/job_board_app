<template>
  <div class="company-details">
    <div v-if="company" class="company-details__content">
      <div class="company-details__header">
        <h1 class="company-details__title">{{ company.name }}</h1>
        <div class="company-details__meta">
          <span class="company-details__location">{{ company.location }}</span>
          <span class="company-details__size">{{ company.size }} сотрудников</span>
        </div>
      </div>

      <div class="company-details__description">
        <h2>О компании</h2>
        <p>{{ company.description }}</p>
      </div>

      <div class="company-details__jobs">
        <h2>Вакансии компании</h2>
        <div class="company-details__jobs-list">
          <div
            v-for="job in company.jobs"
            :key="job.id"
            class="company-details__job-card"
            @click="navigateToJob(job.id)"
          >
            <h3 class="company-details__job-title">{{ job.title }}</h3>
            <div class="company-details__job-meta">
              <span class="company-details__job-location">{{ job.location }}</span>
              <span class="company-details__job-salary">{{ formatSalary(job.salary) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="company-details__loading">
      Загрузка...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showError } from '@/shared/services/notificationService'

const route = useRoute()
const router = useRouter()

const company = ref(null)

const formatSalary = (salary) => {
  if (!salary) return 'Зарплата не указана'
  const { min, max, currency } = salary
  return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`
}

const navigateToJob = (jobId) => {
  router.push({ name: 'job-details', params: { id: jobId } })
}

onMounted(async () => {
  try {
    // Здесь будет загрузка данных компании
    company.value = {
      id: 1,
      name: 'Tech Solutions',
      location: 'Москва',
      size: '50-100',
      description: 'Мы - инновационная IT-компания, специализирующаяся на разработке современных веб-приложений...',
      jobs: [
        {
          id: 1,
          title: 'Frontend Developer',
          location: 'Москва',
          salary: { min: 150000, max: 200000, currency: 'RUB' }
        },
        {
          id: 2,
          title: 'Backend Developer',
          location: 'Москва',
          salary: { min: 180000, max: 250000, currency: 'RUB' }
        }
      ]
    }
  } catch (error) {
    showError('Ошибка', 'Не удалось загрузить данные компании')
    console.error('Ошибка при загрузке компании:', error)
  }
})
</script>

<style scoped>
.company-details {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.company-details__content {
  background: var(--color-card);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--color-shadow);
}

.company-details__header {
  margin-bottom: 2rem;
}

.company-details__title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.company-details__meta {
  display: flex;
  gap: 1rem;
  color: var(--color-text-light);
}

.company-details__description {
  margin-bottom: 2rem;
}

.company-details__description h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.company-details__jobs h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.company-details__jobs-list {
  display: grid;
  gap: 1rem;
}

.company-details__job-card {
  background: var(--color-bg);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.company-details__job-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--color-shadow);
}

.company-details__job-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.company-details__job-meta {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-light);
  font-size: 0.875rem;
}

.company-details__loading {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-light);
}
</style> 