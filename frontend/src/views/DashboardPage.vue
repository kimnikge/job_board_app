<template>
  <div class="dashboard-page">
    <div class="dashboard-page__header">
      <h1 class="dashboard-page__title">Панель управления</h1>
      <p class="dashboard-page__welcome">Добро пожаловать, {{ user.name }}!</p>
    </div>

    <div class="dashboard-page__content">
      <div class="dashboard-page__stats">
        <div class="dashboard-page__stat-card">
          <div class="dashboard-page__stat-icon">
            <i class="fas fa-briefcase"></i>
          </div>
          <div class="dashboard-page__stat-info">
            <span class="dashboard-page__stat-value">{{ stats.totalJobs }}</span>
            <span class="dashboard-page__stat-label">Всего вакансий</span>
          </div>
        </div>

        <div class="dashboard-page__stat-card">
          <div class="dashboard-page__stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="dashboard-page__stat-info">
            <span class="dashboard-page__stat-value">{{ stats.totalApplicants }}</span>
            <span class="dashboard-page__stat-label">Откликов</span>
          </div>
        </div>

        <div class="dashboard-page__stat-card">
          <div class="dashboard-page__stat-icon">
            <i class="fas fa-building"></i>
          </div>
          <div class="dashboard-page__stat-info">
            <span class="dashboard-page__stat-value">{{ stats.totalCompanies }}</span>
            <span class="dashboard-page__stat-label">Компаний</span>
          </div>
        </div>
      </div>

      <div class="dashboard-page__sections">
        <section class="dashboard-page__section">
          <h2 class="dashboard-page__section-title">Последние вакансии</h2>
          <div class="dashboard-page__jobs">
            <div
              v-for="job in recentJobs"
              :key="job.id"
              class="dashboard-page__job-card"
            >
              <h3 class="dashboard-page__job-title">{{ job.title }}</h3>
              <div class="dashboard-page__job-company">{{ job.company.name }}</div>
              <div class="dashboard-page__job-meta">
                <span class="dashboard-page__job-location">{{ job.location }}</span>
                <span class="dashboard-page__job-salary">{{ formatSalary(job.salary) }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="dashboard-page__section">
          <h2 class="dashboard-page__section-title">Последние отклики</h2>
          <div class="dashboard-page__applications">
            <div
              v-for="application in recentApplications"
              :key="application.id"
              class="dashboard-page__application-card"
            >
              <div class="dashboard-page__application-info">
                <h3 class="dashboard-page__application-title">{{ application.job.title }}</h3>
                <div class="dashboard-page__application-company">{{ application.job.company.name }}</div>
              </div>
              <div class="dashboard-page__application-status" :class="application.status">
                {{ getStatusText(application.status) }}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth'

const authStore = useAuthStore()
const user = ref({
  name: 'Иван Иванов',
  email: 'ivan@example.com'
})

const stats = ref({
  totalJobs: 150,
  totalApplicants: 45,
  totalCompanies: 25
})

const recentJobs = ref([
  {
    id: 1,
    title: 'Frontend Developer',
    company: { name: 'Tech Solutions' },
    location: 'Москва',
    salary: { min: 150000, max: 200000, currency: 'RUB' }
  },
  {
    id: 2,
    title: 'Backend Developer',
    company: { name: 'Finance Pro' },
    location: 'Санкт-Петербург',
    salary: { min: 180000, max: 250000, currency: 'RUB' }
  }
])

const recentApplications = ref([
  {
    id: 1,
    job: {
      title: 'Frontend Developer',
      company: { name: 'Tech Solutions' }
    },
    status: 'pending'
  },
  {
    id: 2,
    job: {
      title: 'Backend Developer',
      company: { name: 'Finance Pro' }
    },
    status: 'accepted'
  }
])

const formatSalary = (salary) => {
  if (!salary) return 'Зарплата не указана'
  const { min, max, currency } = salary
  return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`
}

const getStatusText = (status) => {
  const statusMap = {
    pending: 'На рассмотрении',
    accepted: 'Принято',
    rejected: 'Отклонено'
  }
  return statusMap[status] || status
}

onMounted(() => {
  // В реальном приложении здесь будет загрузка данных
})
</script>

<style scoped>
.dashboard-page {
  padding: 2rem;
  background: var(--color-bg);
}

.dashboard-page__header {
  margin-bottom: 2rem;
}

.dashboard-page__title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.dashboard-page__welcome {
  color: var(--color-secondary);
}

.dashboard-page__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-page__stat-card {
  background: var(--color-card);
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: var(--color-shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard-page__stat-icon {
  width: 48px;
  height: 48px;
  background: var(--color-accent);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--color-primary);
}

.dashboard-page__stat-info {
  display: flex;
  flex-direction: column;
}

.dashboard-page__stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
}

.dashboard-page__stat-label {
  color: var(--color-secondary);
  font-size: 0.875rem;
}

.dashboard-page__sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.dashboard-page__section {
  background: var(--color-card);
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: var(--color-shadow);
}

.dashboard-page__section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.dashboard-page__jobs,
.dashboard-page__applications {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dashboard-page__job-card,
.dashboard-page__application-card {
  padding: 1rem;
  background: var(--color-bg);
  border-radius: 0.375rem;
  transition: transform 0.2s;
}

.dashboard-page__job-card:hover,
.dashboard-page__application-card:hover {
  transform: translateY(-2px);
}

.dashboard-page__job-title,
.dashboard-page__application-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-text);
}

.dashboard-page__job-company,
.dashboard-page__application-company {
  color: var(--color-primary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.dashboard-page__job-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.dashboard-page__job-location {
  color: var(--color-secondary);
}

.dashboard-page__job-salary {
  font-weight: 500;
  color: var(--color-text);
}

.dashboard-page__application-info {
  margin-bottom: 0.5rem;
}

.dashboard-page__application-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.dashboard-page__application-status.pending {
  background: var(--color-accent);
  color: var(--color-primary);
}

.dashboard-page__application-status.accepted {
  background: #c6f6d5;
  color: #2f855a;
}

.dashboard-page__application-status.rejected {
  background: #fed7d7;
  color: #c53030;
}
</style> 