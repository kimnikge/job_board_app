<template>
  <div class="profile-page">
    <div class="pt-4">
      <!-- Профиль -->
      <div class="profile-section">
        <div v-if="isAuthenticated">
          <!-- Профиль пользователя -->
          <div class="profile-header">
            <div class="avatar-container">
              <img 
                v-if="currentUser?.user_metadata?.avatar_url" 
                :src="currentUser.user_metadata.avatar_url" 
                class="avatar" 
                alt="avatar"
              >
              <div v-else class="avatar-placeholder">
                {{ initials }}
              </div>
              <button class="change-avatar-btn" @click="editAvatar">
                <CameraIcon class="w-5 h-5" />
              </button>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <component :is="isSeeker ? 'UserIcon' : 'BuildingIcon'" class="w-5 h-5 text-gray-400" />
              {{ currentUser?.email }}
            </h1>
            <p class="text-gray-600 flex items-center justify-center gap-2">
              <component :is="isSeeker ? 'UserIcon' : 'BuildingIcon'" class="w-4 h-4 text-gray-400" />
              {{ userRoleText }}
            </p>
          </div>

          <!-- Форма создания (зависит от роли) -->
          <div class="create-form-section">
            <h2 class="text-xl font-bold mb-4">{{ isSeeker ? 'Создать резюме' : 'Создать объявление' }}</h2>
            <ResumeForm v-if="isSeeker" />
            <JobCreateForm v-if="isEmployer" />
          </div>

          <!-- Списки созданных (зависит от роли) -->
          <div class="my-items-section">
            <h2 class="text-xl font-bold mb-4">{{ isSeeker ? 'Мои резюме' : 'Мои объявления' }}</h2>
            <div v-if="isSeeker" class="my-resumes-list">
              <!-- Здесь будет список резюме соискателя -->
              <div v-for="resume in userResumes" :key="resume.id" class="my-item-card">
                <h3>{{ resume.position }}</h3>
                <p>{{ resume.location }}</p>
                <button @click="toggleResumeStatus(resume)">{{ resume.isAvailable ? 'Скрыть из поиска' : 'Показать в поиске' }}</button>
                <button @click="deleteResume(resume)">Удалить</button>
              </div>
              <p v-if="userResumes.length === 0">У вас пока нет резюме.</p>
            </div>
            <div v-if="isEmployer" class="my-jobs-list">
              <!-- Здесь будет список объявлений работодателя -->
               <div v-for="job in userJobs" :key="job.id" class="my-item-card">
                <h3>{{ job.title }}</h3>
                <p>{{ job.location }}</p>
                <p>Статус: {{ job.isActive ? 'Активно' : 'Неактивно' }}</p>
                <button @click="toggleJobStatus(job)">{{ job.isActive ? 'Деактивировать' : 'Активировать' }}</button>
                <button @click="deleteJob(job)">Удалить</button>
              </div>
              <p v-if="userJobs.length === 0">У вас пока нет объявлений.</p>
            </div>
          </div>

          <!-- Меню действий -->
          <div class="menu-section">
            <div v-if="isSeeker" class="menu-item" @click="goToResume">
              <IdCardIcon class="w-5 h-5 menu-icon" />
              <span class="menu-text">Моё резюме</span>
              <ChevronRightIcon class="w-5 h-5 menu-arrow" />
            </div>
            <div v-if="isEmployer" class="menu-item" @click="goToVacancies">
              <BriefcaseIcon class="w-5 h-5 menu-icon" />
              <span class="menu-text">Мои вакансии</span>
              <ChevronRightIcon class="w-5 h-5 menu-arrow" />
            </div>
            <div class="menu-item" @click="goToResponses">
              <MailIcon class="w-5 h-5 menu-icon" />
              <span class="menu-text">Отклики</span>
              <ChevronRightIcon class="w-5 h-5 menu-arrow" />
            </div>
            <div v-if="isSeeker" class="menu-item" @click="goToFavorites">
              <HeartIcon class="w-5 h-5 menu-icon" />
              <span class="menu-text">Избранное</span>
              <ChevronRightIcon class="w-5 h-5 menu-arrow" />
            </div>
            <div class="menu-item" @click="goToSettings">
              <SettingsIcon class="w-5 h-5 menu-icon" />
              <span class="menu-text">Настройки</span>
              <ChevronRightIcon class="w-5 h-5 menu-arrow" />
            </div>
            <div class="menu-item" @click="handleLogout">
              <LogOutIcon class="w-5 h-5 menu-icon" />
              <span class="menu-text">Выйти</span>
            </div>
          </div>
        </div>

        <div v-else class="auth-prompt">
          <h2>Добро пожаловать!</h2>
          <p>Чтобы просмотреть профиль и получить доступ ко всем функциям, пожалуйста, войдите или зарегистрируйтесь.</p>
          <router-link to="/auth/login" class="auth-button">Войти</router-link>
          <router-link to="/auth/register" class="auth-button">Зарегистрироваться</router-link>
        </div>
      </div>

      <!-- Настройки -->
      <div class="settings-section">
        <!-- ... existing code ... -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { CameraIcon, IdCardIcon, BriefcaseIcon, MailIcon, HeartIcon, SettingsIcon, LogOutIcon, ChevronRightIcon, UserIcon, BuildingIcon } from 'lucide-vue-next'

// Импортируем формы и, возможно, сервисы API
import ResumeForm from '../../resume/components/ResumeForm.vue'
import JobCreateForm from '@/modules/job/components/JobCreateForm.vue'
import resumeApi from '../../resume/services/resumeApi'
import jobApi from '../../job/services/jobApi'

const store = useStore()
const router = useRouter()

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const currentUser = computed(() => store.getters['auth/currentUser'])

const isSeeker = computed(() => currentUser.value?.user_metadata?.role === 'seeker')
const isEmployer = computed(() => currentUser.value?.user_metadata?.role === 'employer')

const userRoleText = computed(() => isSeeker.value ? 'Соискатель' : 'Работодатель')
const userRoleIcon = computed(() => isSeeker.value ? 'fas fa-user' : 'fas fa-building')

const initials = computed(() => {
  if (currentUser.value?.email) {
    return currentUser.value.email.charAt(0).toUpperCase()
  }
  return ''
})

// Данные для списков резюме/объявлений пользователя
const userResumes = ref([])
const userJobs = ref([])

// Функция для загрузки резюме или объявлений пользователя
const fetchUserItems = async () => {
  if (!isAuthenticated.value || !currentUser.value) return;

  try {
    if (isSeeker.value) {
      const response = await resumeApi.getUserResumes();
      userResumes.value = response.data;
    } else if (isEmployer.value) {
      const response = await jobApi.getUserJobs();
      userJobs.value = response.data;
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных пользователя:', error);
    // TODO: Отобразить ошибку пользователю
  }
};

// Методы для действий с резюме/объявлениями
function editAvatar() {
  alert('Изменить аватар (заглушка)')
}

function goToResume(resumeId) {
  // TODO: Переход на страницу просмотра/редактирования резюме
  alert('Переход к моему резюме (заглушка)');
  // router.push({ name: 'resume-details', params: { id: resumeId } });
}

function goToVacancies(jobId) {
   // TODO: Переход на страницу просмотра/редактирования вакансии
  alert('Переход к моим вакансиям (заглушка)');
  // router.push({ name: 'job-details', params: { id: jobId } });
}

function goToResponses() {
  alert('Переход к откликам (заглушка)')
}
function goToFavorites() {
  alert('Переход к избранному (заглушка)')
}
function goToSettings() {
  alert('Переход к настройкам (заглушка)')
}

async function handleLogout() {
  await store.dispatch('auth/logout')
  router.push('/') 
}

// Методы для управления резюме/объявлениями
async function toggleResumeStatus(resume) {
  try {
    const newStatus = !resume.isAvailable;
    await resumeApi.toggleResumeStatus(resume.id, newStatus);
    resume.isAvailable = newStatus;
  } catch (error) {
    console.error('Ошибка при переключении статуса резюме:', error);
    // TODO: Отобразить ошибку пользователю
  }
}

async function deleteResume(resume) {
  try {
    await resumeApi.deleteResume(resume.id);
    userResumes.value = userResumes.value.filter(r => r.id !== resume.id);
  } catch (error) {
    console.error('Ошибка при удалении резюме:', error);
    // TODO: Отобразить ошибку пользователю
  }
}

async function toggleJobStatus(job) {
  try {
    const newStatus = !job.isActive;
    await jobApi.toggleJobStatus(job.id, newStatus);
    job.isActive = newStatus;
  } catch (error) {
    console.error('Ошибка при переключении статуса объявления:', error);
    // TODO: Отобразить ошибку пользователю
  }
}

async function deleteJob(job) {
  try {
    await jobApi.deleteJob(job.id);
    userJobs.value = userJobs.value.filter(j => j.id !== job.id);
  } catch (error) {
    console.error('Ошибка при удалении объявления:', error);
    // TODO: Отобразить ошибку пользователю
  }
}

onMounted(() => {
  // Загрузка резюме или объявлений пользователя при монтировании компонента
  fetchUserItems();
})

</script>

<style scoped>
.profile-page {
  max-width: 414px;
  margin: 0 auto;
  padding: 0 20px;
}
.profile-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px 20px 18px 20px;
  text-align: center;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 15px;
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  font-weight: bold;
  overflow: hidden;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.change-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 15px;
  border: 2px solid #fff;
}
.user-name {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}
.user-role {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 7px;
  justify-content: center;
}
.menu-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-item:hover {
  background: rgba(102, 126, 234, 0.05);
  transform: translateX(5px);
}
.menu-icon {
  width: 24px;
  height: 24px;
  color: #667eea;
  margin-right: 12px;
}
.menu-text {
  flex-grow: 1;
  font-size: 16px;
  color: #333;
}
.menu-arrow {
  width: 20px;
  height: 20px;
  color: #ccc;
}
.auth-prompt {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.auth-prompt h2 {
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #333;
}
.auth-prompt p {
  font-size: 1rem;
  color: #666;
  margin-bottom: 25px;
}
.auth-button {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 25px;
  border-radius: 8px;
  text-decoration: none;
  margin: 0 10px;
  transition: opacity 0.2s;
}
.auth-button:hover {
  opacity: 0.9;
}
.settings-section {
  /* Стили для секции настроек, если есть */
}

/* Новые стили для форм и списков */
.create-form-section, .my-items-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.my-item-card {
    background: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
    box-shadow: 0 1px 5px rgba(0,0,0,0.05);
}

.my-item-card h3 {
    font-size: 1.1rem;
    margin-bottom: 5px;
    color: #333;
}

.my-item-card p {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 10px;
}

.my-item-card button {
    margin-right: 10px;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.2s;
}

.my-item-card button:hover {
    opacity: 0.9;
}

.my-item-card button:first-of-type {
    background: #4CAF50;
    color: white;
}

.my-item-card button:last-of-type {
    background: #f44336;
    color: white;
}

</style> 