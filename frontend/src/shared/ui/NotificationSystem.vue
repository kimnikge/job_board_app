<template>
  <div class="notifications">
    <div v-for="n in notifications" :key="n.id" :class="['notification', n.is_read ? 'read' : 'unread']">
      <div class="notification-title">{{ n.title }}</div>
      <div class="notification-message">{{ n.message }}</div>
      <div class="notification-meta">{{ formatDate(n.created_at) }}</div>
      <button v-if="!n.is_read" @click="markRead(n.id)">Прочитано</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import otclikApi from '../../modules/otclik/services/otclikApi'

const notifications = ref([])

onMounted(async () => {
  notifications.value = await otclikApi.getNotifications()
})

async function markRead(id) {
  await otclikApi.markNotificationRead(id)
  const n = notifications.value.find(n => n.id === id)
  if (n) n.is_read = true
}

function formatDate(date) {
  return new Date(date).toLocaleString('ru-RU')
}
</script>

<style scoped>
.notifications {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 18px 0;
}
.notification {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,136,204,0.04);
  padding: 12px 18px;
  position: relative;
}
.notification.unread {
  border-left: 4px solid #0088cc;
}
.notification.read {
  opacity: 0.7;
}
.notification-title {
  font-weight: 700;
  color: #0088cc;
  margin-bottom: 4px;
}
.notification-message {
  color: #333;
  margin-bottom: 6px;
}
.notification-meta {
  color: #888;
  font-size: 12px;
}
button {
  position: absolute;
  top: 12px;
  right: 18px;
  background: #00bfae;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
}
</style>
