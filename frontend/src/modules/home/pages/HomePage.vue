<template>
  <div class="home-page">
    <!-- Animated Background -->
    <div class="bg-animation"></div>

    <!-- Fixed Header -->
    <header class="fixed-header">
      <div class="header-container">
        <div class="logo">
          <DynamicIcon name="Briefcase" class="logo-icon" />
          <span class="logo-text">JobBoard</span>
        </div>
        
        <nav class="nav-menu">
          <router-link to="/app/jobs" class="nav-item">
            <DynamicIcon name="Search" class="nav-icon" />
            Вакансии
          </router-link>
          <router-link to="/app/companies" class="nav-item">
            <DynamicIcon name="Building" class="nav-icon" />
            Компании
          </router-link>
          <router-link to="/app/profile" class="nav-item">
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
          Твоя карьера начинается здесь
        </h1>
        <p class="hero-subtitle">
          Найди идеальную работу или лучшие таланты для своей команды
        </p>
        <div class="hero-actions">
          <router-link to="/app/jobs" class="btn btn-primary">
            <DynamicIcon name="Search" class="btn-icon" />
            Найти работу
          </router-link>
          <router-link to="/app/companies" class="btn btn-secondary">
            <DynamicIcon name="Building" class="btn-icon" />
            Разместить вакансию
          </router-link>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="dashboard">
      <div class="dashboard-container">
        <h2 class="dashboard-title">Наша платформа в цифрах</h2>
        <p class="dashboard-subtitle">Актуальная статистика в реальном времени</p>
        
        <div class="stats-grid">
          <div class="stat-card" @click="scrollToSection('jobs')">
            <span class="stat-number">{{ stats.jobs }}</span>
            <span class="stat-label">Активных вакансий</span>
          </div>
          <div class="stat-card" @click="scrollToSection('companies')">
            <span class="stat-number">{{ stats.companies }}</span>
            <span class="stat-label">Компаний</span>
          </div>
          <div class="stat-card" @click="scrollToSection('resumes')">
            <span class="stat-number">{{ stats.resumes }}</span>
            <span class="stat-label">Резюме</span>
          </div>
          <div class="stat-card" @click="scrollToSection('users')">
            <span class="stat-number">{{ stats.users }}</span>
            <span class="stat-label">Пользователей</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Urgent Jobs Section -->
    <section id="jobs" class="content-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">
            <DynamicIcon name="Zap" class="section-icon urgent-icon" />
            Срочные вакансии
          </h2>
          <router-link to="/app/jobs" class="see-all-btn">
            Все вакансии
            <DynamicIcon name="ArrowRight" class="arrow-icon" />
          </router-link>
        </div>
        
        <div class="jobs-carousel" v-if="urgentJobs.length > 0">
          <div class="carousel-container" ref="jobsCarousel">
            <div class="job-card" 
                 v-for="job in urgentJobs" 
                 :key="job.id"
                 @click="goToJob(job.id)">
              <div class="job-header">
                <div class="job-company">
                  {{ getCompanyInitials(job.company_name) }}
                </div>
                <span class="job-status urgent">СРОЧНО</span>
              </div>
              <h3 class="job-title">{{ job.title }}</h3>
              <p class="job-company-name">{{ job.company_name }}</p>
              <div class="job-details">
                <span class="job-detail">
                  <DynamicIcon name="MapPin" class="detail-icon" />
                  {{ job.location }}
                </span>
                <span class="job-detail">
                  <DynamicIcon name="Clock" class="detail-icon" />
                  {{ job.employment_type }}
                </span>
                <span class="job-detail">
                  <DynamicIcon name="Briefcase" class="detail-icon" />
                  {{ job.experience_level }}
                </span>
              </div>
              <div class="job-salary">
                {{ formatSalary(job.salary_min, job.salary_max) }}
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="loadingJobs" class="loading-state">
          <DynamicIcon name="Loader" class="loading-icon" />
          Загрузка вакансий...
        </div>
        
        <div v-else class="empty-state">
          <DynamicIcon name="Search" class="empty-icon" />
          <p>Срочных вакансий пока нет</p>
        </div>
      </div>
    </section>

    <!-- Companies Section -->
    <section id="companies" class="content-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">
            <DynamicIcon name="Building" class="section-icon" />
            Топ компании
          </h2>
          <router-link to="/app/companies" class="see-all-btn">
            Все компании
            <DynamicIcon name="ArrowRight" class="arrow-icon" />
          </router-link>
        </div>
        
        <div class="companies-grid" v-if="topCompanies.length > 0">
          <div class="company-card" 
               v-for="company in topCompanies" 
               :key="company.id"
               @click="goToCompany(company.id)">
            <div class="company-avatar">
              <img v-if="company.logo" 
                   :src="company.logo" 
                   :alt="company.name"
                   class="company-logo">
              <span v-else class="company-initials">
                {{ getCompanyInitials(company.name) }}
              </span>
            </div>
            <div class="company-info">
              <h3 class="company-name">{{ company.name }}</h3>
              <p class="company-industry">{{ company.industry }}</p>
              <div class="company-stats">
                <span class="stat-item">
                  <DynamicIcon name="Users" class="stat-icon" />
                  {{ company.employees_count || 'Не указано' }}
                </span>
                <span class="stat-item">
                  <DynamicIcon name="MapPin" class="stat-icon" />
                  {{ company.location }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="loadingCompanies" class="loading-state">
          <DynamicIcon name="Loader" class="loading-icon" />
          Загрузка компаний...
        </div>
        
        <div v-else class="empty-state">
          <DynamicIcon name="Building" class="empty-icon" />
          <p>Компании не найдены</p>
        </div>
      </div>
    </section>

    <!-- Resumes Section -->
    <section id="resumes" class="content-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">
            <DynamicIcon name="FileText" class="section-icon" />
            Свежие резюме
          </h2>
          <router-link to="/app/resumes" class="see-all-btn">
            Все резюме
            <DynamicIcon name="ArrowRight" class="arrow-icon" />
          </router-link>
        </div>
        
        <div class="resumes-carousel" v-if="freshResumes.length > 0">
          <div class="carousel-container" ref="resumesCarousel">
            <div class="resume-card" 
                 v-for="resume in freshResumes" 
                 :key="resume.id"
                 @click="goToResume(resume.id)">
              <div class="resume-avatar">
                <img v-if="resume.profiles?.avatar_url" 
                     :src="resume.profiles.avatar_url" 
                     :alt="resume.profiles?.full_name || resume.full_name"
                     class="avatar-img">
                <span v-else class="avatar-initials">
                  {{ getNameInitials(resume.profiles?.full_name || resume.full_name) }}
                </span>
              </div>
              <h3 class="resume-name">{{ resume.profiles?.full_name || resume.full_name }}</h3>
              <p class="resume-position">{{ resume.position }}</p>
              <div class="resume-details">
                <span class="resume-detail">
                  <DynamicIcon name="MapPin" class="detail-icon" />
                  {{ resume.location }}
                </span>
                <span class="resume-detail">
                  <DynamicIcon name="Calendar" class="detail-icon" />
                  {{ resume.experience_years }} лет опыта
                </span>
              </div>
              <div class="resume-skills">
                <span class="skill-tag" 
                      v-for="skill in resume.skills?.slice(0, 3)" 
                      :key="skill">
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="loadingResumes" class="loading-state">
          <DynamicIcon name="Loader" class="loading-icon" />
          Загрузка резюме...
        </div>
        
        <div v-else class="empty-state">
          <DynamicIcon name="FileText" class="empty-icon" />
          <p>Резюме не найдены</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-container">
        <h2 class="cta-title">Готов начать свой путь?</h2>
        <p class="cta-subtitle">Присоединяйся к тысячам профессионалов уже сегодня</p>
        <div class="cta-actions">
          <router-link to="/auth/register" class="btn btn-primary">
            <DynamicIcon name="UserPlus" class="btn-icon" />
            Создать аккаунт
          </router-link>
          <router-link to="/auth/login" class="btn btn-secondary">
            <DynamicIcon name="LogIn" class="btn-icon" />
            Войти
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import DynamicIcon from '@/components/DynamicIcon.vue'
import { jobsService } from '@/modules/jobs/services/jobsService'
import { useCompaniesStore } from '@/modules/companies/store/companies'
import resumeApi from '@/modules/resume/services/resumeApi'
import userApi from '@/modules/user/services/userApi'
import { supabase } from '@/lib/supabase'

export default {
  name: 'HomePage',
  components: {
    DynamicIcon
  },
  setup() {
    const router = useRouter()
    const companiesStore = useCompaniesStore()
    
    // Reactive data
    const stats = ref({
      jobs: 0,
      companies: 0,
      resumes: 0,
      users: 0
    })
    
    const urgentJobs = ref([])
    const topCompanies = ref([])
    const freshResumes = ref([])
    
    const loadingJobs = ref(false)
    const loadingCompanies = ref(false)
    const loadingResumes = ref(false)
    
    // Refs for carousel
    const jobsCarousel = ref(null)
    const resumesCarousel = ref(null)
    
    let realtimeSubscription = null
    
    // Methods
    const loadStats = async () => {
      try {
        // Load jobs count
        const { count: jobsCount } = await supabase
          .from('job_postings')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
        
        // Load companies count
        const { count: companiesCount } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true })
        
        // Load resumes count
        const { count: resumesCount } = await supabase
          .from('resumes')
          .select('*', { count: 'exact', head: true })
          .eq('is_available', true)
        
        // Load users count
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
        
        stats.value = {
          jobs: jobsCount || 0,
          companies: companiesCount || 0,
          resumes: resumesCount || 0,
          users: usersCount || 0
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }
    
    const loadUrgentJobs = async () => {
      loadingJobs.value = true
      try {
        const jobs = await jobsService.getUrgentJobs(8)
        urgentJobs.value = jobs || []
      } catch (error) {
        console.error('Error loading urgent jobs:', error)
        urgentJobs.value = []
      } finally {
        loadingJobs.value = false
      }
    }
    
    const loadTopCompanies = async () => {
      loadingCompanies.value = true
      try {
        const companies = await companiesStore.fetchCompanies({ limit: 8 })
        topCompanies.value = companies || []
      } catch (error) {
        console.error('Error loading companies:', error)
        topCompanies.value = []
      } finally {
        loadingCompanies.value = false
      }
    }
    
    const loadFreshResumes = async () => {
      loadingResumes.value = true
      try {
        const resumes = await resumeApi.getPublicResumes(8)
        freshResumes.value = resumes || []
      } catch (error) {
        console.error('Error loading resumes:', error)
        freshResumes.value = []
      } finally {
        loadingResumes.value = false
      }
    }
    
    // Navigation methods
    const goToJob = (jobId) => {
      router.push(`/app/jobs/${jobId}`)
    }
    
    const goToCompany = (companyId) => {
      router.push(`/app/companies/${companyId}`)
    }
    
    const goToResume = (resumeId) => {
      router.push(`/app/resumes/${resumeId}`)
    }
    
    // Utility methods
    const getCompanyInitials = (name) => {
      if (!name) return '?'
      return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
    }
    
    const getNameInitials = (name) => {
      if (!name) return '?'
      return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
    }
    
    const formatSalary = (min, max) => {
      if (!min && !max) return 'Зарплата не указана'
      if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ₽`
      if (min) return `от ${min.toLocaleString()} ₽`
      if (max) return `до ${max.toLocaleString()} ₽`
      return 'Зарплата не указана'
    }
    
    const scrollToSection = (sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    
    // Realtime updates
    const setupRealtimeSubscription = () => {
      realtimeSubscription = supabase
        .channel('homepage-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'job_postings' }, () => {
          loadStats()
          loadUrgentJobs()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, () => {
          loadStats()
          loadTopCompanies()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'resumes' }, () => {
          loadStats()
          loadFreshResumes()
        })
        .subscribe()
    }
    
    // Lifecycle
    onMounted(async () => {
      await Promise.all([
        loadStats(),
        loadUrgentJobs(),
        loadTopCompanies(),
        loadFreshResumes()
      ])
      
      setupRealtimeSubscription()
    })
    
    onUnmounted(() => {
      if (realtimeSubscription) {
        supabase.removeChannel(realtimeSubscription)
      }
    })
    
    return {
      stats,
      urgentJobs,
      topCompanies,
      freshResumes,
      loadingJobs,
      loadingCompanies,
      loadingResumes,
      jobsCarousel,
      resumesCarousel,
      goToJob,
      goToCompany,
      goToResume,
      getCompanyInitials,
      getNameInitials,
      formatSalary,
      scrollToSection
    }
  }
}
</script>

<style scoped>
/* Base styles */
.home-page {
  min-height: 100vh;
  overflow-x: hidden;
}

/* Animated Background */
.bg-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

.bg-animation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* Fixed Header */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 24px;
  font-weight: 900;
  text-decoration: none;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: #667eea;
}

.nav-menu {
  display: flex;
  gap: 30px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-item:hover {
  color: white;
}

.nav-icon {
  width: 18px;
  height: 18px;
}

/* Hero Section */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 100px 20px 50px;
  color: white;
}

.hero-content {
  max-width: 800px;
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 30px;
  line-height: 1.1;
  animation: slideUp 1s ease-out;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 50px;
  opacity: 0.9;
  animation: slideUp 1s ease-out 0.2s both;
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  animation: slideUp 1s ease-out 0.4s both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 18px 36px;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.btn-icon {
  width: 20px;
  height: 20px;
}

/* Dashboard Stats */
.dashboard {
  padding: 100px 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  color: white;
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.dashboard-title {
  text-align: center;
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 20px;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-subtitle {
  text-align: center;
  font-size: 1.2rem;
  opacity: 0.8;
  margin-bottom: 60px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.stat-number {
  font-size: 3rem;
  font-weight: 900;
  display: block;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.8;
}

/* Content Sections */
.content-section {
  padding: 80px 0;
  color: white;
}

.content-section:nth-child(even) {
  background: rgba(255, 255, 255, 0.03);
}

.section-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 50px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 2.5rem;
  font-weight: 900;
}

.section-icon {
  width: 40px;
  height: 40px;
}

.urgent-icon {
  color: #ffd700;
}

.see-all-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.see-all-btn:hover {
  color: white;
}

.arrow-icon {
  width: 16px;
  height: 16px;
}

/* Jobs Carousel */
.jobs-carousel {
  overflow: hidden;
}

.carousel-container {
  display: flex;
  gap: 30px;
  overflow-x: auto;
  padding: 20px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.carousel-container::-webkit-scrollbar {
  display: none;
}

.job-card {
  min-width: 320px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
  cursor: pointer;
  flex-shrink: 0;
}

.job-card:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.job-company {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.job-status {
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.job-status.urgent {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.job-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: white;
}

.job-company-name {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
}

.job-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.job-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.detail-icon {
  width: 16px;
  height: 16px;
}

.job-salary {
  font-size: 1.5rem;
  font-weight: 800;
  color: #00ff88;
}

/* Companies Grid */
.companies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.company-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  gap: 20px;
  align-items: center;
}

.company-card:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.company-avatar {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  overflow: hidden;
  flex-shrink: 0;
}

.company-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-initials {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.company-name {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 5px;
  color: white;
}

.company-industry {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
}

.company-stats {
  display: flex;
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.stat-icon {
  width: 14px;
  height: 14px;
}

/* Resumes Carousel */
.resumes-carousel {
  overflow: hidden;
}

.resume-card {
  min-width: 280px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
  cursor: pointer;
  text-align: center;
  flex-shrink: 0;
}

.resume-card:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.resume-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 20px;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.resume-name {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 5px;
  color: white;
}

.resume-position {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
}

.resume-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.resume-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.resume-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.skill-tag {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

/* Loading and Empty States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.8);
}

.loading-icon,
.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* CTA Section */
.cta-section {
  padding: 100px 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  text-align: center;
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.cta-title {
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 20px;
}

.cta-subtitle {
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.cta-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 300px;
  }
  
  .dashboard-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
  }
  
  .companies-grid {
    grid-template-columns: 1fr;
  }
  
  .company-card {
    flex-direction: column;
    text-align: center;
  }
  
  .cta-title {
    font-size: 2rem;
  }
  
  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .nav-menu {
    display: none;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .section-container {
    padding: 0 15px;
  }
  
  .job-card,
  .resume-card {
    min-width: 280px;
  }
}
</style>