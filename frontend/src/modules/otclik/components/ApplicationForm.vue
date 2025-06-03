<script setup>
import { ref } from 'vue'
import otclikApi from '../services/otclikApi.js'

const props = defineProps({ jobPostingId: Number, resumeId: Number })
const message = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const submit = async () => {
  loading.value = true
  error.value = ''
  try {
    await otclikApi.createApplication({
      job_posting_id: props.jobPostingId,
      resume_id: props.resumeId,
      message: message.value
    })
    success.value = true
    message.value = ''
  } catch (e) {
    error.value = 'Ошибка отправки отклика'
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <form @submit.prevent="submit" class="otclik-form">
    <textarea v-model="message" placeholder="Сопроводительное письмо" rows="4" required></textarea>
    <button type="submit" :disabled="loading">Откликнуться</button>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">Отклик отправлен!</div>
  </form>
</template>
<style scoped>
.otclik-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
textarea {
  border-radius: 8px;
  border: 1px solid #ddd;
  padding: 10px;
  font-size: 15px;
}
button {
  background: linear-gradient(90deg, #0088cc 0%, #00bfae 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error {
  color: #f44336;
}
.success {
  color: #4CAF50;
}
</style>
