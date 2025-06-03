<script setup>
import { ref, onMounted } from 'vue'
import userApi from '../services/userApi.js'

const profile = ref(null)
const loading = ref(true)
const error = ref('')

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
  <div class="profile-page">
    <div v-if="loading" class="profile-loading">Загрузка профиля...</div>
    <div v-else-if="error" class="profile-error">{{ error }}</div>
    <div v-else-if="profile" class="profile-content">
      <div class="profile-header">
        <img v-if="profile.avatar_url || profile.avatar" :src="profile.avatar_url || profile.avatar" class="profile-avatar" alt="avatar">
        <div class="profile-info">
          <h2>{{ profile.full_name }}</h2>
          <div class="profile-city">{{ profile.city }}</div>
          <div class="profile-phone">📞 {{ profile.phone }}</div>
        </div>
      </div>
      <div class="profile-section" v-if="profile.languages?.length">
        <h4>Языки</h4>
        <ul>
          <li v-for="lang in profile.languages" :key="lang">{{ lang }}</li>
        </ul>
      </div>
      <div class="profile-section" v-if="profile.hard_skills?.length">
        <h4>Навыки</h4>
        <ul>
          <li v-for="skill in profile.hard_skills" :key="skill.name">{{ skill.name }} ({{ skill.level }}/5)</li>
        </ul>
      </div>
      <div class="profile-section" v-if="profile.education?.length">
        <h4>Образование</h4>
        <ul>
          <li v-for="edu in profile.education" :key="edu.name + edu.year">{{ edu.name }}, {{ edu.organization }} ({{ edu.year }})</li>
        </ul>
      </div>
      <div class="profile-section" v-if="profile.work_experience?.length">
        <h4>Опыт работы</h4>
        <ul>
          <li v-for="exp in profile.work_experience" :key="exp.place + exp.period">{{ exp.place }} — {{ exp.position }} ({{ exp.period }})</li>
        </ul>
      </div>
      <div class="profile-section" v-if="profile.social_links && Object.values(profile.social_links).some(Boolean)">
        <h4>Соцсети</h4>
        <div class="profile-socials">
          <a v-if="profile.social_links.instagram" :href="profile.social_links.instagram" target="_blank">Instagram</a>
          <a v-if="profile.social_links.telegram" :href="'https://t.me/' + profile.social_links.telegram.replace('@','')" target="_blank">Telegram</a>
          <a v-if="profile.social_links.linkedin" :href="profile.social_links.linkedin" target="_blank">LinkedIn</a>
          <a v-if="profile.social_links.portfolio" :href="profile.social_links.portfolio" target="_blank">Портфолио</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 500px;
  margin: 0 auto;
  padding: 24px 0 0 0;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}
.profile-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #00bfae;
  background: #f5f5f5;
}
.profile-info h2 {
  margin: 0 0 6px 0;
  font-size: 1.3rem;
  color: #0088cc;
}
.profile-city, .profile-phone {
  color: #666;
  font-size: 15px;
  margin-bottom: 2px;
}
.profile-section {
  margin-bottom: 18px;
}
.profile-section h4 {
  margin-bottom: 7px;
  color: #00bfae;
  font-size: 1.05rem;
}
.profile-socials a {
  display: inline-block;
  margin-right: 10px;
  color: #0088cc;
  text-decoration: underline;
  font-size: 15px;
}
.profile-loading, .profile-error {
  text-align: center;
  color: #888;
  margin: 40px 0 20px 0;
  font-size: 16px;
}
</style>
