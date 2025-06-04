<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import EmptyState from '@/shared/ui/EmptyState.vue'
import LoadingSpinner from '@/shared/ui/LoadingSpinner.vue'

const resumes = ref([])
const loading = ref(true)

const hasAnySocialLink = (links) => {
  return links && Object.values(links).some(link => link)
}

onMounted(async () => {
  try {
    const res = await api.getResumes()
    resumes.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="resumes-list">
    <LoadingSpinner v-if="loading" />
    <EmptyState v-else-if="!resumes.length" message="Нет резюме" />
    <div v-else>
      <div v-for="resume in resumes" :key="resume.id" class="resume-card">
        <div class="resume-header">
          <div class="avatar" v-if="resume.avatar">
            <img :src="resume.avatar" :alt="resume.full_name">
          </div>
          <div class="avatar" v-else-if="resume.avatar_url">
            <img :src="resume.avatar_url" :alt="resume.full_name">
          </div>
          <div class="avatar placeholder" v-else>
            {{ resume.full_name[0] }}
          </div>
          <div class="basic-info">
            <h3>{{ resume.full_name }}</h3>
            <p class="city">{{ resume.city }}</p>
            <a :href="'tel:' + resume.phone" class="phone-button">
              <i class="phone-icon">📞</i>
              {{ resume.phone }}
            </a>
          </div>
        </div>

        <div class="resume-section" v-if="resume.languages && resume.languages.length">
          <h4>Языки</h4>
          <ul class="languages">
            <li v-for="lang in resume.languages" :key="lang">{{ lang }}</li>
          </ul>
        </div>

        <div class="resume-section" v-if="resume.hard_skills && resume.hard_skills.length">
          <h4>Профессиональные навыки</h4>
          <ul class="hard-skills">
            <li v-for="skill in resume.hard_skills" :key="skill.name">
              <span class="skill-name">{{ skill.name }}</span>
              <span class="skill-level">({{ skill.level }}/5)</span>
            </li>
          </ul>
        </div>

        <div class="resume-section" v-if="resume.education && resume.education.length">
          <h4>Образование</h4>
          <ul class="education">
            <li v-for="edu in resume.education" :key="edu.name + edu.year">
              <strong>{{ edu.name }}</strong>, {{ edu.organization }} ({{ edu.year }})
            </li>
          </ul>
        </div>

        <div class="resume-section" v-if="resume.work_experience?.length">
          <h4>Опыт работы</h4>
          <div v-for="(exp, index) in resume.work_experience" :key="index" class="work-experience">
            <div class="work-header">
              <strong>{{ exp.place }}</strong>
              <span class="period">{{ exp.period }}</span>
            </div>
            <p class="position">{{ exp.position }}</p>
            <p class="description" v-if="exp.description">{{ exp.description }}</p>
          </div>
        </div>

        <div class="resume-section" v-if="hasAnySocialLink(resume.social_links)">
          <h4>Социальные сети</h4>
          <div class="social-links">
            <a v-if="resume.social_links.instagram" 
               :href="resume.social_links.instagram" 
               target="_blank" 
               class="social-link instagram">
              Instagram
            </a>
            <a v-if="resume.social_links.telegram" 
               :href="'https://t.me/' + resume.social_links.telegram.replace('@', '')" 
               target="_blank" 
               class="social-link telegram">
              Telegram
            </a>
            <a v-if="resume.social_links.linkedin" 
               :href="resume.social_links.linkedin" 
               target="_blank" 
               class="social-link linkedin">
              LinkedIn
            </a>
            <a v-if="resume.social_links.portfolio" 
               :href="resume.social_links.portfolio" 
               target="_blank" 
               class="social-link portfolio">
              Портфолио
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.resumes-list {
  max-width: 1200px;
  margin: 20px auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  padding: 20px;
}

.resume-card {
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.resume-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-right: 20px;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar.placeholder {
  background-color: #4CAF50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
}

.basic-info {
  flex: 1;
}

.basic-info h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.city {
  color: #666;
  margin: 0 0 12px 0;
}

.phone-button {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
}

.phone-icon {
  margin-right: 8px;
}

.resume-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.resume-section h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
}

.languages, .hard-skills, .education {
  list-style: none;
  padding: 0;
  margin: 0 0 10px 0;
}

.languages li, .hard-skills li, .education li {
  margin-bottom: 6px;
}

.skill-name {
  font-weight: 500;
}

.skill-level {
  color: #888;
  margin-left: 6px;
}

.work-experience {
  margin-bottom: 16px;
}

.work-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.period {
  color: #666;
  font-size: 14px;
}

.position {
  color: #2c3e50;
  margin: 4px 0;
}

.description {
  color: #666;
  font-size: 14px;
  margin: 4px 0;
}

.social-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.social-link {
  padding: 6px 12px;
  border-radius: 20px;
  color: white;
  text-decoration: none;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
}

.social-link.instagram {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
}

.social-link.telegram {
  background-color: #0088cc;
}

.social-link.linkedin {
  background-color: #0077b5;
}

.social-link.portfolio {
  background-color: #2c3e50;
}

@media (max-width: 768px) {
  .resumes-list {
    grid-template-columns: 1fr;
  }
  
  .resume-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .avatar {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .work-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>