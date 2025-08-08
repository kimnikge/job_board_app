<template>
  <div class="profile-page">
    <div class="profile-page__container">
      <h1 class="profile-page__title">🧑‍💼 Мой профиль</h1>

      <div v-if="loading" class="profile-page__loading">
        ⏳ Загрузка профиля...
      </div>

      <div v-else-if="error" class="profile-page__error">
        ❌ {{ error }}
      </div>

      <template v-else-if="userProfile">
        <!-- Основная информация профиля -->
        <div class="profile-page__info">
          <div class="profile-page__avatar">
            <img 
              :src="userProfile.avatar_url || '/images/default-company.png'" 
              :alt="`Аватар ${userProfile.full_name}`" 
              class="profile-page__avatar-image"
            >
          </div>

          <div class="profile-page__details">
            <h2 class="profile-page__name">{{ userProfile.full_name }}</h2>
            <p class="profile-page__email">📧 {{ userProfile.email }}</p>
            <p class="profile-page__phone">📱 {{ userProfile.phone }}</p>
            <p class="profile-page__role">
              {{ userProfile.user_type === 'candidate' ? '🔍 Соискатель' : '🏢 Работодатель' }}
            </p>
            
            <div v-if="userProfile.user_type === 'candidate'" class="profile-page__candidate-info">
              <p class="profile-page__specialization">
                {{ userProfile.specializations?.icon }} {{ userProfile.specializations?.name }}
              </p>
              <p class="profile-page__experience">
                💼 Опыт: {{ userProfile.experience_years }} лет
              </p>
              <p class="profile-page__location">
                📍 {{ userProfile.city_districts?.name }}
              </p>
              <p class="profile-page__salary">
                💰 Ожидаемая зарплата: {{ formatSalary(userProfile.salary_expectation) }}
              </p>
              <div v-if="userProfile.ready_for_urgent" class="profile-page__urgent-status">
                ⚡ Готов к срочным вызовам
              </div>
            </div>

            <div v-if="userProfile.user_type === 'employer'" class="profile-page__employer-info">
              <p class="profile-page__company">
                🏢 {{ userProfile.company?.name }}
              </p>
              <p class="profile-page__position">
                👔 {{ userProfile.position }}
              </p>
            </div>
          </div>
        </div>

        <!-- О себе -->
        <div v-if="userProfile.about" class="profile-section">
          <h3 class="section-title">📝 О себе</h3>
          <p class="profile-page__about">{{ userProfile.about }}</p>
        </div>

        <!-- Навыки (для соискателей) -->
        <div v-if="userProfile.skills && userProfile.skills.length" class="profile-section">
          <h3 class="section-title">🎯 Навыки</h3>
          <div class="skills-grid">
            <span 
              v-for="skill in userProfile.skills" 
              :key="skill" 
              class="skill-tag"
            >
              {{ skill }}
            </span>
          </div>
        </div>

        <!-- Резюме (для соискателей) -->
        <div v-if="userProfile.resume && userProfile.user_type === 'candidate'" class="profile-section">
          <h3 class="section-title">📄 Резюме</h3>
          <div class="resume-card">
            <h4 class="resume-title">{{ userProfile.resume.title }}</h4>
            <p class="resume-description">{{ userProfile.resume.description }}</p>
            
            <div v-if="userProfile.resume.achievements" class="achievements">
              <h5>🏆 Достижения:</h5>
              <ul>
                <li v-for="achievement in userProfile.resume.achievements" :key="achievement">
                  {{ achievement }}
                </li>
              </ul>
            </div>

            <div v-if="userProfile.resume.work_history" class="work-history">
              <h5>💼 Опыт работы:</h5>
              <div 
                v-for="work in userProfile.resume.work_history" 
                :key="work.company" 
                class="work-item"
              >
                <h6>{{ work.position }} в {{ work.company }}</h6>
                <p class="work-period">{{ work.period }}</p>
                <p class="work-description">{{ work.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Статистика заявок (для соискателей) -->
        <div v-if="userProfile.applications && userProfile.user_type === 'candidate'" class="profile-section">
          <h3 class="section-title">📊 Мои заявки</h3>
          <div class="applications-grid">
            <div 
              v-for="application in userProfile.applications" 
              :key="application.id" 
              class="application-card"
            >
              <h4>{{ application.job_title }}</h4>
              <p>🏢 {{ application.company_name }}</p>
              <p>💰 {{ application.salary }}</p>
              <span :class="`status-badge status-${application.status}`">
                {{ getStatusText(application.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Статистика найма (для работодателей) -->
        <div v-if="userProfile.hiring_statistics && userProfile.user_type === 'employer'" class="profile-section">
          <h3 class="section-title">📈 Статистика найма</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ userProfile.hiring_statistics.jobs_posted }}</div>
              <div class="stat-label">Размещено вакансий</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ userProfile.hiring_statistics.candidates_hired }}</div>
              <div class="stat-label">Нанято кандидатов</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ userProfile.hiring_statistics.urgent_jobs_filled }}</div>
              <div class="stat-label">Срочных позиций закрыто</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ userProfile.hiring_statistics.average_hiring_time }}</div>
              <div class="stat-label">Среднее время найма</div>
            </div>
          </div>
        </div>

        <!-- Действия -->
        <div class="profile-page__actions">
          <button @click="handleEdit" class="profile-page__button">
            ✏️ Редактировать профиль
          </button>
          <button 
            v-if="userProfile.user_type === 'candidate'" 
            @click="toggleUrgentMode" 
            :class="`profile-page__button ${userProfile.ready_for_urgent ? 'urgent-active' : 'urgent-inactive'}`"
          >
            {{ userProfile.ready_for_urgent ? '⚡ Отключить срочные вызовы' : '⚡ Включить срочные вызовы' }}
          </button>
          <button @click="handleLogout" class="profile-page__button profile-page__button--danger">
            🚪 Выйти
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { getCurrentUserProfile } from '@/data/index.js'

const router = useRouter()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

const loading = ref(true)
const error = ref(null)
const userProfile = ref(null)

const loadUserData = async () => {
  try {
    loading.value = true
    error.value = null
    
    console.log('🔍 Начинаем загрузку профиля...')
    
    // Загружаем профиль из локальных данных
    const profile = getCurrentUserProfile()
    
    console.log('📊 Загруженный профиль:', profile)
    
    if (!profile) {
      throw new Error('Профиль не найден')
    }
    
    userProfile.value = profile
    
    console.log('✅ Профиль загружен:', profile.full_name)
  } catch (e) {
    error.value = 'Ошибка загрузки профиля: ' + e.message
    console.error('❌ Ошибка загрузки профиля:', e)
  } finally {
    loading.value = false
  }
}

const formatSalary = (amount) => {
  if (!amount) return 'Не указана'
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0
  }).format(amount)
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': '⏳ На рассмотрении',
    'interview_scheduled': '📅 Интервью назначено',
    'approved': '✅ Одобрено',
    'rejected': '❌ Отклонено'
  }
  return statusMap[status] || status
}

const toggleUrgentMode = () => {
  if (userProfile.value) {
    userProfile.value.ready_for_urgent = !userProfile.value.ready_for_urgent
    
    const message = userProfile.value.ready_for_urgent 
      ? 'Режим срочных вызовов включен' 
      : 'Режим срочных вызовов отключен'
    
    notificationsStore.showSuccess('Настройки обновлены', message)
  }
}

const handleEdit = () => {
  // В реальном приложении здесь будет переход на страницу редактирования
  notificationsStore.showInfo('Редактирование', 'Страница редактирования в разработке')
  console.log('Редактирование профиля:', userProfile.value?.full_name)
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    notificationsStore.showSuccess('Выход выполнен', 'Вы успешно вышли из системы')
    router.push('/auth')
  } catch (error) {
    console.error('Ошибка при выходе:', error)
    notificationsStore.showError('Ошибка', 'Не удалось выйти из системы')
  }
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
}

.profile-page__container {
  max-width: 1000px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.profile-page__title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #ffffff;
  text-align: center;
}

.profile-page__loading,
.profile-page__error {
  text-align: center;
  padding: 3rem;
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
}

.profile-page__error {
  color: #f5576c;
}

/* Основная информация */
.profile-page__info {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.profile-page__avatar {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.profile-page__avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-page__details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-page__name {
  font-size: 1.8rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.profile-page__email,
.profile-page__phone,
.profile-page__role,
.profile-page__specialization,
.profile-page__experience,
.profile-page__location,
.profile-page__salary,
.profile-page__company,
.profile-page__position {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.3rem;
  font-size: 1rem;
}

.profile-page__candidate-info,
.profile-page__employer-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-page__urgent-status {
  background: linear-gradient(45deg, #f5576c, #ff6b8a);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  margin-top: 0.5rem;
  width: fit-content;
}

/* Секции профиля */
.profile-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 1rem;
}

.profile-page__about {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  font-size: 1rem;
}

/* Навыки */
.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Резюме */
.resume-card {
  background: rgba(255, 255, 255, 0.02);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.resume-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.resume-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.achievements h5,
.work-history h5 {
  color: #ffffff;
  margin: 1rem 0 0.5rem 0;
  font-size: 1rem;
}

.achievements ul {
  color: rgba(255, 255, 255, 0.8);
  padding-left: 1.5rem;
}

.achievements li {
  margin-bottom: 0.3rem;
}

.work-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.work-item:last-child {
  border-bottom: none;
}

.work-item h6 {
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.work-period {
  color: #667eea;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.work-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* Заявки */
.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.application-card {
  background: rgba(255, 255, 255, 0.02);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
}

.application-card h4 {
  color: #ffffff;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.application-card p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-pending {
  background: #ff9800;
  color: white;
}

.status-interview_scheduled {
  background: #2196F3;
  color: white;
}

.status-approved {
  background: #4CAF50;
  color: white;
}

.status-rejected {
  background: #f5576c;
  color: white;
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-number {
  font-size: 2rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* Действия */
.profile-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.profile-page__button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  font-size: 1rem;
}

.profile-page__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.profile-page__button--danger {
  background: linear-gradient(45deg, #f5576c, #ff6b8a);
}

.profile-page__button--danger:hover {
  box-shadow: 0 8px 24px rgba(245, 87, 108, 0.3);
}

.urgent-active {
  background: linear-gradient(45deg, #4CAF50, #66BB6A) !important;
}

.urgent-inactive {
  background: linear-gradient(45deg, #ff9800, #ffb74d) !important;
}

/* Адаптивность */
@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }
  
  .profile-page__container {
    padding: 1.5rem;
  }
  
  .profile-page__info {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .profile-page__avatar {
    width: 150px;
    height: 150px;
    margin: 0 auto;
  }
  
  .applications-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-page__actions {
    flex-direction: column;
  }
}
</style> 