<template>
  <form @submit.prevent="onReset" class="reset-form">
    <h2 class="title">Восстановление пароля</h2>
    <div class="form-group">
      <label for="email">Email</label>
      <input v-model="email" id="email" type="email" required class="input" />
    </div>
    <div v-if="message" class="message">{{ message }}</div>
    <div v-if="error" class="error">{{ error }}</div>
    <button type="submit" class="btn-primary" :disabled="loading">
      <span v-if="loading">Отправка...</span>
      <span v-else>Сбросить пароль</span>
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
const error = ref('')
const message = ref('')
const loading = ref(false)

const onReset = async () => {
  error.value = ''
  message.value = ''
  loading.value = true
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.value)
  loading.value = false
  if (resetError) {
    error.value = 'Ошибка: ' + resetError.message
  } else {
    message.value = 'Письмо для сброса пароля отправлено на ваш email.'
    email.value = ''
  }
}
</script>

<style scoped>
.reset-form {
  padding: 20px;
  max-width: 350px;
  margin: 20px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

@media (max-width: 480px) {
  .reset-form {
    margin: 0;
    border-radius: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
  color: #333;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #4CAF50;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
  background: #45a049;
}

.message {
  margin: 20px 0;
  padding: 12px;
  background: #e8f5e9;
  border: 1px solid #4CAF50;
  border-radius: 8px;
  color: #2e7d32;
  text-align: center;
}

.error {
  margin: 20px 0;
  padding: 12px;
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 8px;
  color: #f44336;
  text-align: center;
}
</style>
