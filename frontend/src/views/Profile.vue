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
              loading="lazy"
              decoding="async"
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

        <!-- R2: Видео-приветствие -->
        <div v-if="isFeatureEnabled('videoProfile')" class="profile-section">
          <Suspense>
            <DynamicVideoProfile 
              :user-id="userProfile.id"
              :initial-video-url="userProfile.video_url"
              @video-uploaded="handleVideoUploaded"
              @video-removed="handleVideoRemoved"
              @upload-error="handleVideoError"
            />
          </Suspense>
        </div>

        <!-- R2: Интерактивные секции профиля -->
        <!-- Навыки с прогресс-барами -->
        <div v-if="skills.length && isFeatureEnabled('skillBars')" class="profile-section">
          <h3 class="section-title">🎯 Навыки и уровни</h3>
          <div class="skills-container">
            <Suspense>
              <DynamicSkillBar 
                v-for="skill in skills" 
                :key="skill.id"
                :skill="skill"
              />
            </Suspense>
          </div>
        </div>

        <!-- Бейджи и достижения -->
        <div class="profile-section">
          <template v-if="isFeatureEnabled('badgeCarousel')">
            <template v-if="badges.length">
              <Suspense>
                <DynamicBadgeCarousel :badges="badges" />
              </Suspense>
            </template>
            <template v-else>
              <div class="badge-empty-state">
                <p>🏅 Бейджи ещё не получены.</p>
                <ul class="badge-troubleshoot">
                  <li>Фича-флаг badgeCarousel: <strong>{{ isFeatureEnabled('badgeCarousel') ? 'ON' : 'OFF' }}</strong></li>
                  <li>Mock режим (useMockData): <strong>{{ isFeatureEnabled('useMockData') ? 'ON' : 'OFF' }}</strong></li>
                  <li>Количество загруженных бейджей: <strong>{{ badges.length }}</strong></li>
                  <li><button type="button" class="profile-page__button" @click="reloadBadges">🔄 Перезагрузить бейджи</button></li>
                </ul>
              </div>
            </template>
          </template>
          <template v-else>
            <div class="badge-empty-state">
              <p>Фича отображения бейджей отключена.</p>
            </div>
          </template>
        </div>

        <!-- Опыт работы -->
        <div v-if="experience.length && isFeatureEnabled('experienceTimeline')" class="profile-section">
          <Suspense>
            <DynamicExperienceTimeline :work-logs="experience" />
          </Suspense>
        </div>

        <!-- Навыки (старый формат для совместимости) -->
        <div v-if="userProfile.skills && userProfile.skills.length && !isFeatureEnabled('skillBars')" class="profile-section">
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

        <!-- Действия -->
        <div class="profile-page__actions">
                  <button 
          @click="handleEdit" 
          @click.native="handleEdit"
          data-test="edit-button"
          class="profile-page__button"
          type="button"
        >
          Редактировать профиль
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
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { useProfileStore } from '@/stores/profile'
import { getCurrentUserProfile } from '@/data/index.js'
// R2: Импорт новых компонентов и утилит
import { isFeatureEnabled, debugLog } from '@/utils/featureFlags.js'
// Ленивая загрузка или обычная в зависимости от флага
import { 
  LazySkillBar, 
  LazyBadgeCarousel, 
  LazyExperienceTimeline, 
  LazyVideoProfile,
  shouldUseLazyLoading 
} from '@/utils/lazyComponents.js'
import SkillBar from '@/components/profile/SkillBar.vue'
import BadgeCarousel from '@/components/profile/BadgeCarousel.vue'
import ExperienceTimeline from '@/components/profile/ExperienceTimeline.vue'
import VideoProfile from '@/components/profile/VideoProfile.vue'

// Выбираем компоненты в зависимости от настроек
const DynamicSkillBar = shouldUseLazyLoading() && isFeatureEnabled('lazyProfileSections') ? LazySkillBar : SkillBar
const DynamicBadgeCarousel = shouldUseLazyLoading() && isFeatureEnabled('lazyProfileSections') ? LazyBadgeCarousel : BadgeCarousel  
const DynamicExperienceTimeline = shouldUseLazyLoading() && isFeatureEnabled('lazyProfileSections') ? LazyExperienceTimeline : ExperienceTimeline
const DynamicVideoProfile = shouldUseLazyLoading() && isFeatureEnabled('lazyProfileSections') ? LazyVideoProfile : VideoProfile

const router = useRouter()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
// R2: Добавляем profile store
const profileStore = useProfileStore()

const loading = ref(true)
const error = ref(null)
const userProfile = ref(null)

// R2: Реактивные данные из store
const skills = computed(() => profileStore.skills)
const badges = computed(() => profileStore.badges)
const experience = computed(() => profileStore.experience)

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
    
    // R2: Загружаем расширенные данные профиля
    if (isFeatureEnabled('useMockData')) {
      debugLog('profile', 'Загружаем расширенные данные профиля для пользователя', profile.id)
      
      // Загружаем навыки, бейджи и опыт параллельно
      await Promise.all([
        profileStore.fetchSkills(profile.id),
        profileStore.fetchBadges(profile.id), 
        profileStore.fetchExperience(profile.id)
      ])
      
      debugLog('profile', 'Расширенные данные загружены', {
        skills: skills.value.length,
        badges: badges.value.length,
        experience: experience.value.length
      })
    }
    
    console.log('✅ Профиль загружен:', profile.full_name)
  } catch (e) {
    error.value = 'Ошибка загрузки профиля: ' + e.message
    console.error('❌ Ошибка загрузки профиля:', e)
  } finally {
    loading.value = false
  }
}

const reloadBadges = async () => {
  if (!userProfile.value) return
  await profileStore.fetchBadges(userProfile.value.id)
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
    
    notificationsStore.showSuccess('Настройки обновлены', message)
  }
}

const handleEdit = (event) => {
  console.log('🔧 CLICK EVENT TRIGGERED!', event)
  console.log('� Event target:', event?.target)
  console.log('🔧 Event type:', event?.type)
  console.log('🔧 Текущий пользователь:', userProfile.value)
  
  // Immediate visual feedback
  if (event?.target) {
    event.target.style.transform = 'scale(0.95)'
    setTimeout(() => {
      event.target.style.transform = ''
    }, 150)
  }
  
  try {
    // Используем уведомления из store
    notificationsStore.showSuccess('Функция в разработке', 'Редактирование профиля будет доступно в следующей версии')
    console.log('🔧 Уведомление добавлено через store')
  } catch (error) {
    console.error('🔧 Ошибка при добавлении уведомления:', error)
    // Fallback alert
    alert('Функция редактирования профиля находится в разработке')
  }
}

const handleLogout = () => {
  console.log('🚪 Выполняем выход...')
  authStore.logout()
  router.push('/auth/login')
}

// R2: Обработчики событий видео
const handleVideoUploaded = (videoUrl) => {
  if (userProfile.value) {
    userProfile.value.video_url = videoUrl
    notificationsStore.showSuccess('Видео загружено', 'Видео-приветствие успешно добавлено в профиль')
  }
}

const handleVideoRemoved = () => {
  if (userProfile.value) {
    userProfile.value.video_url = null
    notificationsStore.showSuccess('Видео удалено', 'Видео-приветствие удалено из профиля')
  }
}

const handleVideoError = (error) => {
  notificationsStore.showError('Ошибка видео', error)
}

onMounted(async () => {
  console.log('🔧 Profile.vue смонтирован')
  
  // Получаем данные пользователя
  try {
    const userData = getCurrentUserProfile()
    if (userData) {
      userProfile.value = userData
      console.log('🔧 Данные пользователя загружены:', userData)
    } else {
      error.value = 'Профиль пользователя не найден'
    }
  } catch (err) {
    console.error('🔧 Ошибка загрузки профиля:', err)
    error.value = 'Ошибка загрузки профиля'
  } finally {
    loading.value = false
  }
  
  // Debugging functions
  window.profileDebug = {
    userProfile: userProfile,
    handleEdit: handleEdit,
    testClick: () => {
      console.log('🔧 Test click работает!')
      alert('Test click - OK!')
    }
  }
  console.log('🔧 Отладка профиля доступна в window.profileDebug')
  
  // Альтернативная привязка события для кнопки редактирования
  nextTick(() => {
    const editButton = document.querySelector('[data-test="edit-button"]')
    if (editButton) {
      console.log('🔧 Кнопка редактирования найдена, добавляем слушатель')
      editButton.addEventListener('click', (e) => {
        console.log('🔧 Native event listener сработал!', e)
        handleEdit(e)
      })
    } else {
      console.log('🔧 Кнопка редактирования НЕ найдена')
    }
  })
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
@media (max-width: 680px) {
  .profile-page__info { grid-template-columns: 1fr; text-align:center; }
  .profile-page__avatar { margin: 0 auto; }
  .profile-page__details { align-items:center; }
}

@media (max-width: 680px) {
  .profile-page__info { grid-template-columns: 1fr; text-align: center; }
  .profile-page__avatar { margin: 0 auto; }
  .profile-page__details { align-items: center; }
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
  pointer-events: auto;
  position: relative;
  z-index: 10;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
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
    padding-bottom: 5rem; /* Space for bottom navigation */
  }
  
  .profile-page__container {
    padding: 1rem;
  }
  
  .profile-page__title {
    font-size: 1.6rem;
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .profile-page__info {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1.5rem;
  }
  
  .profile-page__avatar {
    width: 120px;
    height: 120px;
    margin: 0 auto;
  }
  
  .profile-page__name {
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }
  
  .profile-page__details p {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .profile-section {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .section-title {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
  
  .skills-grid {
    justify-content: center;
    gap: 0.4rem;
  }
  
  .skill-tag {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }
  
  .profile-page__actions {
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
  
  .profile-page__button {
    width: 100%;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    min-height: 48px; /* Touch target */
  }
}

@media (max-width: 480px) {
  .profile-page {
    padding: 0.75rem;
  }
  
  .profile-page__container {
    padding: 0.75rem;
  }
  
  .profile-page__title {
    font-size: 1.4rem;
  }
  
  .profile-page__avatar {
    width: 100px;
    height: 100px;
  }
  
  .profile-page__name {
    font-size: 1.2rem;
  }
  
  .profile-section {
    padding: 0.75rem;
  }
  
  .section-title {
    font-size: 1.1rem;
  }
  
  .profile-page__button {
    padding: 0.875rem 1.25rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 1024px) {
  .profile-page__info {
    grid-template-columns: auto 1fr;
    text-align: left;
    gap: 2rem;
  }
  
  .profile-page__avatar {
    width: 160px;
    height: 160px;
  }
}

/* R2: Стили для интерактивных секций профиля */
.skills-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-section .profile-section {
  margin-top: 2rem;
}

/* Анимация появления секций */
@media (prefers-reduced-motion: no-preference) {
  .skills-container,
  .badge-carousel,
  .experience-timeline {
    animation: fadeInUp 0.6s ease-out;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Мобильная оптимизация для новых секций */
@media (max-width: 768px) {
  .skills-container {
    gap: 6px;
  }
}
</style>
