<template>
  <div class="home-view">
    <main class="main-content">
      <!-- Горячие вакансии -->
      <section class="section">
        <h2 class="section-title">
          🔥 Горячие вакансии
        </h2>
        
        <div class="job-cards-grid">
          <div 
            v-for="job in hotJobs" 
            :key="job.id"
            class="job-card" 
            @click="likeJob($event, job)"
          >
            <div class="job-title">{{ job.title }}</div>
            <div class="job-salary">{{ formatSalary(job.salary) }}</div>
            <div class="job-location">{{ job.location }}</div>
          </div>
        </div>
      </section>

      <!-- Свежие предложения -->
      <section class="section">
        <h2 class="section-title">
          ✨ Свежие предложения
        </h2>
        
        <div class="job-list">
          <div 
            v-for="job in recentJobs" 
            :key="job.id"
            class="job-list-item" 
            @click="applyJob($event, job)"
          >
            <div class="job-content">
              <div 
                class="company-logo" 
                :style="{ background: job.companyGradient }"
              >
                {{ job.companyInitials }}
              </div>
              <div class="job-info">
                <h3>{{ job.title }}</h3>
                <p>{{ job.location }}</p>
              </div>
            </div>
            <div class="job-salary-badge">
              {{ formatSalary(job.salary) }}
            </div>
          </div>
        </div>
      </section>

      <!-- Срочные вакансии -->
      <section class="section">
        <h2 class="section-title">
          ⚡ Срочные вакансии
        </h2>
        
        <div class="urgent-jobs">
          <div 
            v-for="urgentJob in urgentJobs" 
            :key="urgentJob.id"
            class="urgent-job-card" 
            @click="applyUrgentJob($event, urgentJob)"
          >
            <div class="urgent-badge">СРОЧНО</div>
            <div class="job-title">{{ urgentJob.title }}</div>
            <div class="job-location">{{ urgentJob.location }}</div>
            <div class="urgent-details">
              <span class="urgent-time">{{ urgentJob.timeLeft }}</span>
              <span class="urgent-responses">{{ urgentJob.responses }} откликов</span>
            </div>
            <div class="urgent-salary">{{ formatSalary(urgentJob.salary) }}</div>
          </div>
        </div>
      </section>

      <!-- Статистика -->
      <section class="section">
        <h2 class="section-title">
          📊 Твоя статистика
        </h2>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👁️</div>
            <div class="stat-number">{{ userStats.views }}</div>
            <div class="stat-label">Просмотров профиля</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-number">{{ userStats.applications }}</div>
            <div class="stat-label">Откликов отправлено</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💼</div>
            <div class="stat-number">{{ userStats.interviews }}</div>
            <div class="stat-label">Приглашений</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-number">{{ userStats.rating }}</div>
            <div class="stat-label">Рейтинг</div>
          </div>
        </div>
      </section>
    </main>

    <!-- Уведомления -->
    <Transition name="notification">
      <div v-if="notification.show" class="notification">
        {{ notification.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Реактивные данные
const notification = ref({
  show: false,
  message: ''
})

// Горячие вакансии
const hotJobs = ref([
  {
    id: 1,
    title: 'Бармен',
    salary: 200000,
    location: 'Шерлок Холмс Паб'
  },
  {
    id: 2,
    title: 'Шеф-повар',
    salary: 350000,
    location: 'Зеркальный ресторан'
  },
  {
    id: 3,
    title: 'Су-шеф',
    salary: 280000,
    location: 'Beshbarmak & Grill'
  },
  {
    id: 4,
    title: 'Хостес',
    salary: 180000,
    location: 'Sky Bar Almaty'
  }
])

// Свежие предложения
const recentJobs = ref([
  {
    id: 5,
    title: 'Официант',
    location: 'Алматы',
    salary: 150000,
    companyInitials: 'BG',
    companyGradient: 'linear-gradient(135deg, #4facfe, #00f2fe)'
  },
  {
    id: 6,
    title: 'Повар пиццы',
    location: 'Нур-Султан',
    salary: 200000,
    companyInitials: 'CH',
    companyGradient: 'linear-gradient(135deg, #ff6b6b, #ee5a24)'
  },
  {
    id: 7,
    title: 'Бариста',
    location: 'Алматы',
    salary: 180000,
    companyInitials: 'CZ',
    companyGradient: 'linear-gradient(135deg, #a8edea, #fed6e3)'
  },
  {
    id: 8,
    title: 'Администратор зала',
    location: 'Караганда',
    salary: 220000,
    companyInitials: 'ED',
    companyGradient: 'linear-gradient(135deg, #667eea, #764ba2)'
  }
])

// Срочные вакансии
const urgentJobs = ref([
  {
    id: 9,
    title: 'Повар на замену',
    location: 'Центр Алматы',
    salary: 25000,
    timeLeft: 'осталось 2 часа',
    responses: 12
  },
  {
    id: 10,
    title: 'Бармен на выходные',
    location: 'Коктем',
    salary: 30000,
    timeLeft: 'до завтра',
    responses: 8
  }
])

// Статистика пользователя
const userStats = ref({
  views: 47,
  applications: 12,
  interviews: 3,
  rating: 4.8
})

// Методы
const formatSalary = (amount) => {
  return `₸${amount.toLocaleString()}`
}

const likeJob = (event, job) => {
  const element = event.currentTarget
  element.style.transform = 'scale(0.95)'
  element.style.background = 'linear-gradient(135deg, #4facfe, #00f2fe)'
  
  setTimeout(() => {
    element.style.transform = ''
    element.style.background = ''
    showNotification(`Вакансия "${job.title}" добавлена в избранное! 💖`)
  }, 300)
}

const applyJob = (event, job) => {
  const element = event.currentTarget
  element.style.transform = 'translateX(5px)'
  element.style.background = 'rgba(79, 172, 254, 0.1)'
  
  setTimeout(() => {
    element.style.transform = ''
    element.style.background = ''
    showNotification(`Отклик на "${job.title}" отправлен! 🚀`)
  }, 300)
}

const applyUrgentJob = (event, job) => {
  const element = event.currentTarget
  element.style.transform = 'scale(1.02)'
  element.style.boxShadow = '0 8px 25px rgba(255, 68, 68, 0.4)'
  
  setTimeout(() => {
    element.style.transform = ''
    element.style.boxShadow = ''
    showNotification(`Срочный отклик на "${job.title}" отправлен! ⚡`)
  }, 300)
}

const showNotification = (message) => {
  notification.value.message = message
  notification.value.show = true
  
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}
</script>

<style scoped>
.home-view {
  padding-top: 70px; /* Отступ для header */
  padding-bottom: 90px; /* Отступ для bottom navigation */
  background: #f8fafc;
  min-height: 100vh;
}

.main-content {
  padding: 16px;
  max-width: 400px;
  margin: 0 auto;
}

.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Горячие вакансии */
.job-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.job-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
}

.job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.job-title {
  font-weight: 600;
  font-size: 14px;
  color: #1a202c;
  margin-bottom: 8px;
}

.job-salary {
  font-weight: 600;
  font-size: 16px;
  color: #3182ce;
  margin-bottom: 4px;
}

.job-location {
  font-size: 12px;
  color: #718096;
}

/* Свежие предложения */
.job-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.job-list-item {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
}

.job-list-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.job-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
}

.job-info h3 {
  font-size: 14px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
}

.job-info p {
  font-size: 12px;
  color: #718096;
}

.job-salary-badge {
  background: #4facfe;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

/* Срочные вакансии */
.urgent-jobs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.urgent-job-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid #ff4444;
  box-shadow: 0 2px 8px rgba(255, 68, 68, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.urgent-job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 68, 68, 0.2);
}

.urgent-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ff4444;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
}

.urgent-details {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #718096;
}

.urgent-time {
  color: #ff4444;
  font-weight: 600;
}

.urgent-salary {
  font-size: 16px;
  font-weight: 600;
  color: #ff4444;
  margin-top: 8px;
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 20px;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  color: #718096;
  line-height: 1.2;
}

/* Уведомления */
.notification {
  position: fixed;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  background: #4facfe;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
  z-index: 1000;
  max-width: 90%;
  text-align: center;
}

.notification-enter-active, 
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(-50%) translateY(-20px);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(-50%) translateY(-20px);
  opacity: 0;
}

/* Адаптивность */
@media (max-width: 360px) {
  .main-content {
    padding: 12px;
  }
  
  .job-cards-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
