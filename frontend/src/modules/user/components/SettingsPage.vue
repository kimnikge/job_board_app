<template>
  <div class="settings-page">
    <h2 class="title">Настройки профиля</h2>
    <form @submit.prevent="saveSettings" class="settings-form">
      <div class="form-group">
        <label>Имя</label>
        <input v-model="form.full_name" class="input" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="form.email" class="input" type="email" />
      </div>
      <div class="form-group">
        <label>Телефон</label>
        <input v-model="form.phone" class="input" />
      </div>
      <div class="form-group">
        <label>Смена аватара</label>
        <AvatarUpload v-model:avatar="form.avatar" />
      </div>
      <button type="submit" class="btn-primary" :disabled="loading">Сохранить</button>
      <div v-if="message" class="message">{{ message }}</div>
      <div v-if="error" class="error">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AvatarUpload from './AvatarUpload.vue'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kuyudpxqlrinkcxvorom.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eXVkcHhxbHJpbmtjeHZvcm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NjgxOTksImV4cCI6MjA2NDU0NDE5OX0.b9_7QdZDvt36ohzVOl4OGGEt344c7x1AMOQzFTNOT8k'
const supabase = createClient(supabaseUrl, supabaseKey)

const user = JSON.parse(localStorage.getItem('user') || '{}')
const form = ref({
  full_name: user.full_name || '',
  email: user.email || '',
  phone: user.phone || '',
  avatar: user.avatar || ''
})
const loading = ref(false)
const message = ref('')
const error = ref('')

const saveSettings = async () => {
  loading.value = true
  error.value = ''
  message.value = ''
  const { error: err } = await supabase.from('users').update({
    full_name: form.value.full_name,
    email: form.value.email,
    phone: form.value.phone,
    avatar: form.value.avatar
  }).eq('id', user.id)
  loading.value = false
  if (err) error.value = 'Ошибка: ' + err.message
  else message.value = 'Настройки успешно сохранены!'
}
</script>

<style scoped>
.settings-page {
  max-width: 400px;
  margin: 40px auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 32px 24px;
}
.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
}
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 8px 12px;
  box-sizing: border-box;
}
.btn-primary {
  background: #2563eb;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  width: 100%;
  font-size: 1rem;
  transition: background 0.2s;
}
.btn-primary:disabled {
  background: #a5b4fc;
  cursor: not-allowed;
}
.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}
.error {
  color: #dc2626;
  margin-bottom: 12px;
  text-align: center;
}
.message {
  color: #16a34a;
  margin-bottom: 12px;
  text-align: center;
}
</style>
