<template>
  <div class="notification-list">
    <div v-if="loading" class="notification-list__loading">Загрузка уведомлений...</div>
    <div v-else-if="error" class="notification-list__error">{{ error }}</div>
    <div v-else-if="notifications.length === 0" class="notification-list__empty">Нет уведомлений</div>
    <ul v-else class="notification-list__items">
      <li v-for="n in notifications" :key="n.id" :class="['notification-list__item', { 'notification-list__item--unread': !n.read }]">
        <div class="notification-list__title">{{ n.title }}</div>
        <div class="notification-list__body">{{ n.body }}</div>
        <div class="notification-list__meta">{{ formatDate(n.created_at) }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const notifications = ref([])
const loading = ref(true)
const error = ref(null)

const formatDate = (date) => new Date(date).toLocaleString('ru-RU')

const fetchNotifications = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('http://localhost:3000/notifications', {
      headers: { Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined }
    })
    notifications.value = res.data
  } catch (e) {
    error.value = 'Ошибка загрузки уведомлений'
  } finally {
    loading.value = false
  }
}

onMounted(fetchNotifications)
</script>

<style scoped>
.notification-list { padding: 1rem; max-width: 400px; }
.notification-list__loading, .notification-list__error, .notification-list__empty { text-align: center; color: #888; margin: 1rem 0; }
.notification-list__items { list-style: none; padding: 0; margin: 0; }
.notification-list__item { background: #f7fafc; border-radius: 6px; margin-bottom: 10px; padding: 12px; transition: background 0.2s; }
.notification-list__item--unread { background: #e3f2fd; font-weight: 600; }
.notification-list__title { font-size: 1rem; margin-bottom: 4px; }
.notification-list__body { font-size: 0.95rem; color: #555; margin-bottom: 4px; }
.notification-list__meta { font-size: 0.8rem; color: #999; }
</style>
