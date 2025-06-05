<template>
  <div class="resume-details">
    <div class="pt-4 pb-16">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="text-gray-600">Загрузка резюме...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <AlertCircleIcon class="w-8 h-8 text-red-500 mb-2" />
        <p class="text-red-500">{{ error }}</p>
      </div>
      
      <div v-else-if="resume" class="resume-content">
        <div class="resume-header">
          <div class="avatar-container">
            <img 
              v-if="resume.avatar_url || resume.avatar" 
              :src="resume.avatar_url || resume.avatar" 
              class="resume-avatar" 
              alt="avatar"
            >
            <div v-else class="resume-avatar-placeholder">
              {{ getInitials(resume.full_name) }}
            </div>
          </div>
          <div class="resume-info">
            <h2 class="text-2xl font-bold text-gray-900">{{ resume.full_name }}</h2>
            <div class="resume-meta">
              <div class="meta-item">
                <MapPinIcon class="w-5 h-5 text-gray-400" />
                <span class="text-gray-600">{{ resume.city }}</span>
              </div>
              <div class="meta-item">
                <PhoneIcon class="w-5 h-5 text-gray-400" />
                <span class="text-gray-600">{{ resume.phone }}</span>
              </div>
              <div class="meta-item">
                <MailIcon class="w-5 h-5 text-gray-400" />
                <span class="text-gray-600">{{ resume.email }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="resume-sections">
          <div v-if="resume.languages?.length" class="resume-section">
            <h4 class="section-title">
              <LanguagesIcon class="w-5 h-5 text-gray-400" />
              Языки
            </h4>
            <ul class="section-content">
              <li v-for="lang in resume.languages" :key="lang" class="list-item">
                {{ lang }}
              </li>
            </ul>
          </div>

          <div v-if="resume.hard_skills?.length" class="resume-section">
            <h4 class="section-title">
              <WrenchIcon class="w-5 h-5 text-gray-400" />
              Навыки
            </h4>
            <ul class="section-content">
              <li v-for="skill in resume.hard_skills" :key="skill.name" class="list-item">
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

          <div v-if="resume.education?.length" class="resume-section">
            <h4 class="section-title">
              <GraduationCapIcon class="w-5 h-5 text-gray-400" />
              Образование
            </h4>
            <ul class="section-content">
              <li v-for="edu in resume.education" :key="edu.name + edu.year" class="list-item">
                <div class="education-item">
                  <span class="education-name">{{ edu.name }}</span>
                  <span class="education-org">{{ edu.organization }}</span>
                  <span class="education-year">({{ edu.year }})</span>
                </div>
              </li>
            </ul>
          </div>

          <div v-if="resume.work_experience?.length" class="resume-section">
            <h4 class="section-title">
              <BriefcaseIcon class="w-5 h-5 text-gray-400" />
              Опыт работы
            </h4>
            <ul class="section-content">
              <li v-for="exp in resume.work_experience" :key="exp.place + exp.period" class="list-item">
                <div class="experience-item">
                  <span class="experience-position">{{ exp.position }}</span>
                  <span class="experience-place">{{ exp.place }}</span>
                  <span class="experience-period">{{ exp.period }}</span>
                </div>
              </li>
            </ul>
          </div>

          <div v-if="resume.social_links && Object.values(resume.social_links).some(Boolean)" class="resume-section">
            <h4 class="section-title">
              <Share2Icon class="w-5 h-5 text-gray-400" />
              Соцсети
            </h4>
            <div class="social-links">
              <a v-if="resume.social_links.instagram" 
                 :href="resume.social_links.instagram" 
                 target="_blank" 
                 class="social-link instagram">
                <InstagramIcon class="w-5 h-5" />
              </a>
              <a v-if="resume.social_links.telegram" 
                 :href="'https://t.me/' + resume.social_links.telegram.replace('@', '')" 
                 target="_blank" 
                 class="social-link telegram">
                <SendIcon class="w-5 h-5" />
              </a>
              <a v-if="resume.social_links.linkedin" 
                 :href="resume.social_links.linkedin" 
                 target="_blank" 
                 class="social-link linkedin">
                <LinkedinIcon class="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div class="resume-actions">
          <button class="contact-btn">
            <MailIcon class="w-5 h-5" />
            Связаться
          </button>
          <button class="share-btn">
            <Share2Icon class="w-5 h-5" />
            Поделиться
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { AlertCircleIcon, MapPinIcon, PhoneIcon, MailIcon, LanguagesIcon, WrenchIcon, GraduationCapIcon, BriefcaseIcon, Share2Icon, InstagramIcon, SendIcon, LinkedinIcon } from 'lucide-vue-next'
import resumeApi from '../services/resumeApi.js'

export default {
  name: 'ResumeDetails',
  components: {
    AlertCircleIcon,
    MapPinIcon,
    PhoneIcon,
    MailIcon,
    LanguagesIcon,
    WrenchIcon,
    GraduationCapIcon,
    BriefcaseIcon,
    Share2Icon,
    InstagramIcon,
    SendIcon,
    LinkedinIcon
  },
  setup() {
    const resume = ref(null)
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
        const res = await resumeApi.getResumeDetails()
        resume.value = res.data
      } catch (e) {
        error.value = 'Ошибка загрузки резюме'
      } finally {
        loading.value = false
      }
    })

    return {
      resume,
      loading,
      error,
      getInitials
    }
  }
}
</script>

<style scoped>
.resume-details {
  padding: 0;
}

.loading-state {
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

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.resume-content {
  padding: 1rem 0;
}

.resume-header {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.avatar-container {
  margin-bottom: 1rem;
}

.resume-avatar {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #667eea;
}

.resume-avatar-placeholder {
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

.resume-meta {
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

.resume-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.resume-section {
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

.education-item, .experience-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.education-name, .experience-position {
  font-weight: 500;
  color: #1f2937;
}

.education-org, .experience-place {
  color: #6b7280;
}

.education-year, .experience-period {
  font-size: 0.875rem;
  color: #9ca3af;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  color: #4b5563;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.social-link:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.resume-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.contact-btn, .share-btn {
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

.contact-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.share-btn {
  background: white;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.contact-btn:hover, .share-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
