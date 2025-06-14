<template>
  <form @submit.prevent="onLogin" class="login-form">
    <h2 class="title">Вход</h2>
    <div class="form-group">
      <label for="email">Email</label>
      <input v-model="email" id="email" type="email" required class="input" />
    </div>
    <div class="form-group">
      <label for="password">Пароль</label>
      <input v-model="password" id="password" type="password" required class="input" />
    </div>
    <div v-if="error" class="error">{{ error }}</div>
    <button type="submit" class="btn-primary" :disabled="loading">
      <span v-if="loading">Вход...</span>
      <span v-else>Войти</span>
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kuyudpxqlrinkcxvorom.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eXVkcHhxbHJpbmtjeHZvcm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NjgxOTksImV4cCI6MjA2NDU0NDE5OX0.b9_7QdZDvt36ohzVOl4OGGEt344c7x1AMOQzFTNOT8k'
const supabase = createClient(supabaseUrl, supabaseKey)

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const onLogin = async () => {
  error.value = ''
  loading.value = true
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
  loading.value = false
  if (loginError) {
    error.value = 'Ошибка входа: ' + loginError.message
  } else {
    // Можно добавить редирект или emit события
    window.location.reload()
  }
}
</script>

<style scoped>
.login-form {
  max-width: 350px;
  margin: 40px auto;
  padding: 32px 24px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
}
.form-group {
  margin-bottom: 18px;
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
</style>
