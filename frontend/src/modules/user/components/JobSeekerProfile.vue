<script setup>
import { ref, onMounted } from 'vue'
import userApi from '../services/userApi.js'
import { 
  AlertCircleIcon,
  MapPinIcon,
  PhoneIcon,
  LanguagesIcon,
  WrenchIcon,
  GraduationCapIcon,
  EditIcon,
  Share2Icon
} from 'lucide-vue-next'

const profile = ref(null)
const loading = ref(true)
const error = ref('')

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

onMounted(async () => {
  try {
    const res = await userApi.getJobSeekerProfile()
    profile.value = res.data
  } catch (e) {
    error.value = 'Ошибка загрузки профиля'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="job-seeker-profile">
    <div class="pt-4">
      <div class="max-w-md mx-auto px-4 pt-4 pb-[60px]">
        <div v-if="loading" class="profile-loading">
          <div class="loading-spinner"></div>
          <p class="text-gray-600">Загрузка профиля...</p>
        </div>
        
        <div v-else-if="error" class="profile-error">
          <AlertCircleIcon class="w-8 h-8 text-red-500 mb-2" />
          <p class="text-red-500">{{ error }}</p>
        </div>
        
        <div v-else-if="profile" class="profile-content">
          <div class="profile-header">
            <div class="avatar-container">
              <img 
                v-if="profile.avatar_url || profile.avatar" 
                :src="profile.avatar_url || profile.avatar" 
                class="profile-avatar" 
                alt="avatar"
              >
              <div v-else class="profile-avatar-placeholder">
                {{ getInitials(profile.full_name) }}
              </div>
            </div>
            <div class="profile-info">
              <h2 class="text-2xl font-bold text-gray-900">{{ profile.full_name }}</h2>
              <div class="profile-meta">
                <div class="meta-item">
                  <MapPinIcon class="w-5 h-5 text-gray-400" />
                  <span class="text-gray-600">{{ profile.city }}</span>
                </div>
                <div class="meta-item">
                  <PhoneIcon class="w-5 h-5 text-gray-400" />
                  <span class="text-gray-600">{{ profile.phone }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="profile-sections">
            <div v-if="profile.languages?.length" class="profile-section">
              <h4 class="section-title">
                <LanguagesIcon class="w-5 h-5 text-gray-400" />
                Языки
              </h4>
              <ul class="section-content">
                <li v-for="lang in profile.languages" :key="lang" class="list-item">
                  {{ lang }}
                </li>
              </ul>
            </div>

            <div v-if="profile.hard_skills?.length" class="profile-section">
              <h4 class="section-title">
                <WrenchIcon class="w-5 h-5 text-gray-400" />
                Навыки
              </h4>
              <ul class="section-content">
                <li v-for="skill in profile.hard_skills" :key="skill.name" class="list-item">
                  <span class="skill-name">{{ skill.name }}</span>
                  <div class="skill-level">
                    <div 
                      class="skill-level-bar"
                      :style="{ width: `${(skill.level / 5) * 100}%` }"
                    ></div>
                  </div>
                  <span class="skill-rating">{{ skill.level }}/5</span>
                </li>
              </ul>
            </div>

            <div v-if="profile.education?.length" class="profile-section">
              <h4 class="section-title">
                <GraduationCapIcon class="w-5 h-5 text-gray-400" />
                Образование
              </h4>
              <ul class="section-content">
                <li v-for="edu in profile.education" :key="edu.name + edu.year" class="list-item">
                  <div class="education-item">
                    <span class="education-name">{{ edu.name }}</span>
                    <span class="education-org">{{ edu.organization }}</span>
                    <span class="education-year">({{ edu.year }})</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div class="profile-actions">
            <button class="edit-btn">
              <EditIcon class="w-5 h-5" />
              Редактировать
            </button>
            <button class="share-btn">
              <Share2Icon class="w-5 h-5" />
              Поделиться
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.job-seeker-profile {
  padding: 0;
}

.profile-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.profile-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.profile-content {
  padding: 1rem 0;
}

.profile-header {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.avatar-container {
  margin-bottom: 1rem;
}

.profile-avatar {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #667eea;
}

.profile-avatar-placeholder {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.profile-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.list-item {
  color: #4b5563;
}

.skill-name {
  display: block;
  margin-bottom: 0.25rem;
}

.skill-level {
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.skill-level-bar {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0.25rem;
  transition: width 0.3s ease;
}

.skill-rating {
  font-size: 0.875rem;
  color: #6b7280;
}

.education-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.education-name {
  font-weight: 500;
  color: #1f2937;
}

.education-org {
  color: #6b7280;
}

.education-year {
  font-size: 0.875rem;
  color: #9ca3af;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.edit-btn, .share-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.edit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.share-btn {
  background: white;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.edit-btn:hover, .share-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
