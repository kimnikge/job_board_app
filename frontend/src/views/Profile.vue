<template>
  <div class="profile-page">
    <!-- Header -->
    <AppHeader />
    <PageHeader 
      title="Мой профиль"
      subtitle="Управление личными данными и настройками"
    />
    
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">⏳</div>
      <p>Загрузка профиля...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <p>{{ error }}</p>
    </div>

    <template v-else-if="userProfile">
      <!-- Основная карточка профиля -->
      <BaseCard title="Основная информация" elevated class="profile-main-card">
        <div class="profile-content">
          <div class="profile-avatar">
            <img 
              :src="userProfile.avatar_url || '/images/default-company.png'" 
              :alt="`Аватар ${userProfile.full_name}`" 
              class="avatar-image"
              loading="lazy"
              decoding="async"
            >
          </div>

          <div class="profile-details">
            <h2 class="profile-name">{{ userProfile.full_name }}</h2>
            <div class="profile-contacts">
              <div class="contact-item">
                <span class="contact-icon">📧</span>
                <span>{{ userProfile.email }}</span>
              </div>
              <div class="contact-item" v-if="userProfile.phone">
                <span class="contact-icon">📱</span>
                <span>{{ userProfile.phone }}</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">👤</span>
                <span>{{ userProfile.user_type === 'candidate' ? 'Соискатель' : 'Работодатель' }}</span>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Карточка для соискателя -->
      <BaseCard 
        v-if="userProfile.user_type === 'candidate'" 
        title="Профессиональная информация"
        :badge="userProfile.ready_for_urgent ? { text: 'Готов к срочным вызовам', type: 'success' } : null"
        elevated
        class="candidate-card"
      >
        <div class="candidate-info">
          <div class="info-item" v-if="userProfile.specializations">
            <span class="info-icon">{{ userProfile.specializations.icon }}</span>
            <span class="info-label">Специализация:</span>
            <span class="info-value">{{ userProfile.specializations.name }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-icon">💼</span>
            <span class="info-label">Опыт работы:</span>
            <span class="info-value">{{ userProfile.experience_years }} лет</span>
          </div>
          
          <div class="info-item">
            <span class="info-icon">📍</span>
            <span class="info-label">Город:</span>
            <CitySelector 
              v-model="userProfile.selectedCity"
              @city-selected="updateCity"
              placeholder="Выберите город"
            />
          </div>
          
          <div class="info-item" v-if="userProfile.salary_expectation">
            <span class="info-icon">💰</span>
            <span class="info-label">Ожидаемая зарплата:</span>
            <span class="info-value">{{ formatSalary(userProfile.salary_expectation) }}</span>
          </div>
        </div>
      </BaseCard>

      <!-- Карточка для работодателя -->
      <BaseCard 
        v-if="userProfile.user_type === 'employer'" 
        title="Информация о работодателе"
        elevated
        class="employer-card"
      >
        <div class="employer-info">
          <div class="info-item" v-if="userProfile.company">
            <span class="info-icon">🏢</span>
            <span class="info-label">Компания:</span>
            <span class="info-value">{{ userProfile.company.name }}</span>
          </div>
          
          <div class="info-item" v-if="userProfile.position">
            <span class="info-icon">👔</span>
            <span class="info-label">Должность:</span>
            <span class="info-value">{{ userProfile.position }}</span>
          </div>
        </div>
      </BaseCard>

      <!-- О себе -->
      <BaseCard 
        v-if="userProfile.about" 
        title="📝 О себе"
        elevated
      >
        <p class="about-text">{{ userProfile.about }}</p>
      </BaseCard>

      <!-- Навыки -->
      <BaseCard 
        v-if="userProfile.skills && userProfile.skills.length" 
        title="🎯 Навыки"
        elevated
      >
        <div class="skills-grid">
          <span 
            v-for="skill in userProfile.skills" 
            :key="skill" 
            class="skill-tag"
          >
            {{ skill }}
          </span>
        </div>
      </BaseCard>

      <!-- Push-уведомления -->
      <BaseCard title="🔔 Настройки уведомлений" elevated>
        <PushNotificationsSettings />
      </BaseCard>

      <!-- Подписка и тарифы -->
      <BaseCard 
        v-if="userProfile.user_type === 'employer'" 
        title="💳 Подписка и тарифы" 
        elevated
      >
        <SubscriptionSettings />
      </BaseCard>

      <!-- Действия -->
      <BaseCard title="⚙️ Действия" elevated>
        <div class="actions-grid">
          <button 
            @click="handleEdit" 
            class="btn-primary"
            type="button"
          >
            ✏️ Редактировать профиль
          </button>
          
          <button 
            v-if="userProfile.user_type === 'candidate'" 
            @click="toggleUrgentMode" 
            :class="userProfile.ready_for_urgent ? 'btn-urgent-active' : 'btn-urgent-inactive'"
          >
            {{ userProfile.ready_for_urgent ? '⚡ Отключить срочные вызовы' : '⚡ Включить срочные вызовы' }}
          </button>
          
          <button @click="handleLogout" class="btn-danger">
            🚪 Выйти из аккаунта
          </button>
        </div>
      </BaseCard>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useNotificationsStore } from '@/stores/notifications'
import { getCurrentUserProfile } from '@/data/index.js'
import AppHeader from '@/components/AppHeader.vue'
import PageHeader from '@/components/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import PushNotificationsSettings from '@/components/PushNotificationsSettings.vue'
import CitySelector from '@/components/CitySelector.vue'
import SubscriptionSettings from '@/components/SubscriptionSettings.vue'

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const notificationsStore = useNotificationsStore()

const userProfile = ref(null)
const loading = ref(true)
const error = ref('')
const selectedDistrict = ref('')

// Список районов Астаны
const districts = ref([
  { id: 1, name: 'Есиль' },
  { id: 2, name: 'Алматы' },
  { id: 3, name: 'Сарыарка' },
  { id: 4, name: 'Байконыр' },
  { id: 5, name: 'Центральный' }
])

const updateDistrict = async () => {
  try {
    await profileStore.updateProfile({
      ...userProfile.value,
      preferred_district_id: selectedDistrict.value
    })
    notificationsStore.showSuccess('Район успешно обновлен')
  } catch (error) {
    notificationsStore.showError('Ошибка при обновлении района', error.message)
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    notificationsStore.showSuccess('Вы успешно вышли из системы')
    router.push('/auth/login')
  } catch (e) {
    notificationsStore.showError('Ошибка при выходе', e.message)
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

const toggleUrgentMode = () => {
  if (userProfile.value) {
    userProfile.value.ready_for_urgent = !userProfile.value.ready_for_urgent
    
    const message = userProfile.value.ready_for_urgent 
      ? 'Режим срочных вызовов включен' 
      : 'Режим срочных вызовов отключен'
    
    notificationsStore.showSuccess(message)
  }
}

const updateCity = (city) => {
  if (userProfile.value) {
    userProfile.value.selectedCity = city
    userProfile.value.city = city ? `${city.name}, ${city.region}` : ''
    notificationsStore.showSuccess('Город обновлен')
  }
}

onMounted(async () => {
  try {
    loading.value = true
    const profile = getCurrentUserProfile()
    
    if (!profile) {
      throw new Error('Профиль не найден')
    }
    
    userProfile.value = profile
    selectedDistrict.value = profile.preferred_district_id || ''
  } catch (e) {
    error.value = 'Ошибка загрузки профиля: ' + e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* === PROFILE PAGE === */
.profile-page {
  min-height: 100vh;
  background: #1e1e2e;
  color: #ffffff;
  padding-bottom: 80px;
  max-width: 400px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner,
.error-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.loading-spinner {
  animation: spin 2s linear infinite;
}

.error-icon {
  color: var(--color-error);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.profile-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.profile-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--glass-border);
}

.profile-details {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 16px 0;
}

.profile-contacts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.contact-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.candidate-info,
.employer-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.info-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.info-label {
  font-weight: 500;
  color: var(--color-text-muted);
  min-width: 120px;
}

.info-value {
  color: var(--color-text-primary);
  font-weight: 500;
}

.about-text {
  line-height: 1.6;
  color: var(--color-text-primary);
  margin: 0;
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  padding: 6px 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--color-text-primary);
  transition: all 0.3s ease;
}

.skill-tag:hover {
  background: var(--color-accent);
  color: white;
  transform: translateY(-1px);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.btn-primary,
.btn-danger,
.btn-urgent-active,
.btn-urgent-inactive {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  font-size: 0.9rem;
}

.btn-primary {
  background: var(--gradient-ready);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-danger {
  background: var(--gradient-urgent);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}

.btn-urgent-active {
  background: var(--gradient-ready);
  color: white;
}

.btn-urgent-inactive {
  background: var(--glass-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--glass-border);
}

.btn-urgent-active:hover,
.btn-urgent-inactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.district-select {
  margin-left: 8px;
  padding: 4px 8px;
  border: 1px solid var(--glass-border);
  border-radius: 4px;
  background: var(--glass-bg);
  color: var(--color-text-primary);
  font-size: 0.9rem;
}

.district-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

@media (max-width: 768px) {
  .info-item {
    flex-direction: column;
    text-align: center;
    gap: 4px;
  }
  
  .info-label {
    min-width: unset;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .avatar-image {
    width: 80px;
    height: 80px;
  }
  
  .profile-name {
    font-size: 1.25rem;
  }
  
  .contact-item {
    justify-content: center;
  }
  
  .district-select {
    margin-left: 8px;
    padding: 4px 8px;
    border: 1px solid var(--glass-border);
    border-radius: 4px;
    background: var(--glass-bg);
    color: var(--color-text-primary);
    font-size: 0.9rem;
  }

  .district-select:focus {
    outline: none;
    border-color: var(--color-primary);
  }
}
</style>
