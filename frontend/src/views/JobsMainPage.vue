<template>
  <div class="jobs-main-page">
    <!-- ✨ ОБНОВЛЕННАЯ ГЛАВНАЯ СТРАНИЦА - ИСПОЛЬЗУЕТ НОВЫЕ STORES -->
    
    <!-- Animated Background -->
    <div class="bg-animation"></div>

    <!-- Fixed Header -->
    <header class="fixed-header">
      <div class="header-container">
        <div class="logo">
          <DynamicIcon name="Briefcase" class="logo-icon" />
          <span class="logo-text">Job Board Астана</span>
        </div>
        
        <nav class="nav-menu">
          <router-link to="/urgent" class="nav-item urgent-link">
            <DynamicIcon name="AlertCircle" class="nav-icon" />
            Срочные
          </router-link>
          <router-link to="/companies" class="nav-item">
            <DynamicIcon name="Building" class="nav-icon" />
            Заведения
          </router-link>
          <router-link to="/profile" class="nav-item">
            <DynamicIcon name="User" class="nav-icon" />
            Профиль
          </router-link>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          🍽️ Работа в общепите Астаны
        </h1>
        <p class="hero-subtitle">
          Найди идеальную работу в ресторанах, кафе и заведениях города
        </p>
        
        <!-- Статистика -->
        <div class="stats-grid" v-if="!loading">
          <div class="stat-card">
            <div class="stat-number">{{ stats.totalJobs }}</div>
            <div class="stat-label">Вакансий</div>
          </div>
          <div class="stat-card urgent">
            <div class="stat-number">{{ stats.urgentJobs }}</div>
            <div class="stat-label">Срочных</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.totalCompanies }}</div>
            <div class="stat-label">Заведений</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.activeResumes }}</div>
            <div class="stat-label">Резюме</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Срочные вакансии -->
    <section class="urgent-section" v-if="urgentJobs.length > 0">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">
            ⚡ Срочные вакансии
            <span class="urgent-badge">{{ urgentJobs.length }}</span>
          </h2>
          <router-link to="/urgent" class="see-all-link">
            Смотреть все
            <DynamicIcon name="ArrowRight" class="link-icon" />
          </router-link>
        </div>
        
        <div class="urgent-jobs-grid">
          <UrgentJobCard 
            v-for="job in urgentJobs.slice(0, 3)" 
            :key="job.id" 
            :job="job"
            @click="goToJob(job.id)"
          />
        </div>
      </div>
    </section>

    <!-- Все вакансии -->
    <section class="jobs-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">💼 Последние вакансии</h2>
          <div class="filters-quick">
            <select v-model="selectedSpecialization" @change="updateFilters">
              <option value="">Все специализации</option>
              <option value="1">👨‍🍳 Повар</option>
              <option value="2">🤵 Официант</option>
              <option value="3">🧑‍💼 Менеджер</option>
              <option value="4">🧹 Уборщик</option>
            </select>
          </div>
        </div>
        
        <div class="jobs-grid" v-if="!loading">
          <div 
            v-for="job in displayedJobs" 
            :key="job.id" 
            class="job-card"
            @click="goToJob(job.id)"
          >
            <div class="job-header">
              <h3 class="job-title">{{ job.title }}</h3>
              <div class="job-salary">
                {{ formatSalary(job.salary_from, job.salary_to) }}
              </div>
            </div>
            
            <div class="job-info">
              <div class="job-company">
                <DynamicIcon name="Building" class="info-icon" />
                {{ job.companies?.name || 'Компания' }}
              </div>
              <div class="job-location">
                <DynamicIcon name="MapPin" class="info-icon" />
                {{ job.city_districts?.name || 'Астана' }}
              </div>
              <div class="job-specialization">
                <span class="specialization-icon">{{ job.specializations?.icon || '💼' }}</span>
                {{ job.specializations?.name || 'Работа' }}
              </div>
            </div>
            
            <div class="job-description">
              {{ job.description?.substring(0, 100) }}...
            </div>
            
            <div class="job-footer">
              <div class="job-date">
                {{ formatDate(job.created_at) }}
              </div>
              <button class="apply-btn">
                Откликнуться
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Загрузка вакансий...</p>
        </div>
      </div>
    </section>

    <!-- Топ компании -->
    <section class="companies-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">🏆 Топ заведения</h2>
          <router-link to="/companies" class="see-all-link">
            Все заведения
            <DynamicIcon name="ArrowRight" class="link-icon" />
          </router-link>
        </div>
        
        <div class="companies-grid">
          <div 
            v-for="company in topCompanies" 
            :key="company.id" 
            class="company-card"
            @click="goToCompany(company.id)"
          >
            <div class="company-logo">
              <img 
                v-if="company.logo_url" 
                :src="company.logo_url" 
                :alt="company.name"
                class="logo-img"
              />
              <div v-else class="logo-placeholder">
                {{ company.venue_types?.icon || '🍽️' }}
              </div>
            </div>
            
            <div class="company-info">
              <h3 class="company-name">{{ company.name }}</h3>
              <div class="company-type">{{ company.venue_types?.name || 'Заведение' }}</div>
              <div class="company-rating">
                <DynamicIcon name="Star" class="star-icon" />
                {{ company.rating || '0.0' }}
              </div>
              <div class="company-jobs">
                {{ company.active_jobs_count || 0 }} вакансий
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// ✨ НОВЫЙ SCRIPT - ИСПОЛЬЗУЕТ STORES ИЗ ЭТАПА 3
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import { useCompaniesStore } from '@/stores/companies'
import { useNotificationsStore } from '@/stores/notifications'

import DynamicIcon from '@/components/DynamicIcon.vue'
import UrgentJobCard from '@/components/jobs/UrgentJobCard.vue'

const router = useRouter()

// Stores
const jobsStore = useJobsStore()
const companiesStore = useCompaniesStore()
const notificationsStore = useNotificationsStore()

// Reactive state
const loading = ref(true)
const selectedSpecialization = ref('')

// Computed properties
const urgentJobs = computed(() => jobsStore.urgentJobsList)
const regularJobs = computed(() => jobsStore.regularJobs)
const topCompanies = computed(() => companiesStore.topCompanies)

const displayedJobs = computed(() => {
  if (selectedSpecialization.value) {
    return jobsStore.filteredJobs
  }
  return regularJobs.value.slice(0, 6)
})

const stats = computed(() => ({
  totalJobs: regularJobs.value.length,
  urgentJobs: urgentJobs.value.length,
  totalCompanies: companiesStore.companies.length,
  activeResumes: 156 // Fallback число
}))

// Methods
const updateFilters = () => {
  jobsStore.updateFilters({
    specialization: selectedSpecialization.value ? parseInt(selectedSpecialization.value) : null
  })
}

const goToJob = (jobId) => {
  router.push(`/jobs/${jobId}`)
}

const goToCompany = (companyId) => {
  router.push(`/companies/${companyId}`)
}

const formatSalary = (from, to) => {
  if (!from && !to) return 'По договоренности'
  if (from && to) return `${from.toLocaleString()} - ${to.toLocaleString()} тг`
  if (from) return `от ${from.toLocaleString()} тг`
  if (to) return `до ${to.toLocaleString()} тг`
  return 'Не указано'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Сегодня'
  if (diffDays === 2) return 'Вчера'
  if (diffDays <= 7) return `${diffDays} дней назад`
  
  return date.toLocaleDateString('ru-KZ')
}

// Lifecycle
onMounted(async () => {
  try {
    // Загружаем все данные параллельно
    await Promise.all([
      jobsStore.loadAll(),
      companiesStore.fetchCompanies()
    ])
    
    notificationsStore.showSuccess('Данные загружены! 🍽️')
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    notificationsStore.showError('Ошибка загрузки данных')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* ✨ ОБНОВЛЕННЫЕ СТИЛИ */
.jobs-main-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
}

/* Background Animation */
.bg-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, 
    rgba(102, 126, 234, 0.1),
    rgba(118, 75, 162, 0.1)
  );
  z-index: -1;
}

/* Header */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

.logo-icon {
  width: 24px;
  height: 24px;
}

.nav-menu {
  display: flex;
  gap: 2rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.urgent-link {
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.urgent-link:hover {
  background: rgba(255, 107, 107, 0.3);
}

.nav-icon {
  width: 16px;
  height: 16px;
}

/* Hero Section */
.hero {
  padding: 120px 2rem 80px;
  text-align: center;
  color: white;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 3rem;
  opacity: 0.9;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.stat-card.urgent {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.3);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Sections */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.urgent-section, .jobs-section, .companies-section {
  padding: 4rem 0;
}

.urgent-section {
  background: rgba(255, 107, 107, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title {
  color: white;
  font-size: 1.8rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.urgent-badge {
  background: rgba(255, 107, 107, 0.8);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.see-all-link {
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.see-all-link:hover {
  opacity: 1;
}

.link-icon {
  width: 16px;
  height: 16px;
}

/* Grids */
.urgent-jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.companies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

/* Job Cards */
.job-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.job-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.15);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.job-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
}

.job-salary {
  background: rgba(76, 175, 80, 0.8);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  white-space: nowrap;
}

.job-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.job-company, .job-location, .job-specialization {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.info-icon {
  width: 14px;
  height: 14px;
}

.specialization-icon {
  font-size: 0.9rem;
}

.job-description {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.job-date {
  font-size: 0.8rem;
  opacity: 0.7;
}

.apply-btn {
  background: rgba(33, 150, 243, 0.8);
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.apply-btn:hover {
  background: rgba(33, 150, 243, 1);
}

/* Company Cards */
.company-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.company-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.15);
}

.company-logo {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
}

.logo-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.logo-placeholder {
  font-size: 1.5rem;
}

.company-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
}

.company-type {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.company-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
}

.star-icon {
  width: 14px;
  height: 14px;
  color: #FFD700;
}

.company-jobs {
  font-size: 0.8rem;
  opacity: 0.7;
}

/* Filters */
.filters-quick select {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.filters-quick select option {
  background: #2D3748;
  color: white;
}

/* Loading */
.loading-state {
  text-align: center;
  color: white;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-left-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .urgent-jobs-grid,
  .jobs-grid,
  .companies-grid {
    grid-template-columns: 1fr;
  }
}
</style>
