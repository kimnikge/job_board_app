<script setup>
import { ref, onMounted } from 'vue'
import userApi from '../services/userApi.js'

const profile = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const res = await userApi.getEmployerProfile()
    profile.value = res.data
  } catch (e) {
    error.value = 'Ошибка загрузки профиля компании'
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
        <img v-if="profile.company_logo" :src="profile.company_logo" class="profile-avatar" alt="logo">
        <div class="profile-info">
          <h2>{{ profile.company_name }}</h2>
          <div class="profile-phone">📞 {{ profile.contact_phone }}</div>
        </div>
      </div>
      <div class="profile-section">
        <h4>Описание компании</h4>
        <div class="profile-desc">{{ profile.description || 'Описание не указано' }}</div>
      </div>
      <div class="profile-section" v-if="profile.vacancies?.length">
        <h4>Мои вакансии</h4>
        <ul>
          <li v-for="vac in profile.vacancies" :key="vac.id">{{ vac.title }} — {{ vac.status }}</li>
        </ul>
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
  border-radius: 18px;
  object-fit: cover;
  border: 3px solid #00bfae;
  background: #f5f5f5;
}
.profile-info h2 {
  margin: 0 0 6px 0;
  font-size: 1.3rem;
  color: #0088cc;
}
.profile-phone {
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
.profile-desc {
  color: #444;
  font-size: 15px;
}
.profile-loading, .profile-error {
  text-align: center;
  color: #888;
  margin: 40px 0 20px 0;
  font-size: 16px;
}
</style>
