<template>
  <div class="notification-system">
    <div v-for="notification in notifications" :key="notification.id" 
         :class="['notification', { 'notification--read': notification.read }]">
      <div class="notification__content">
        <div class="notification__type">
          <span v-if="notification.type === 'urgent'" class="notification__badge notification__badge--urgent">🚨</span>
          <span v-else-if="notification.type === 'response'" class="notification__badge notification__badge--response">✨</span>
        </div>
        <div class="notification__message" v-html="notification.message"></div>
      </div>
      <div class="notification__actions">
        <button @click="openNotification(notification)" class="notification__action notification__action--primary">
          Открыть
        </button>
        <button @click="markAsRead(notification.id)" class="notification__action" v-if="!notification.read">
          Прочитано
        </button>
      </div>
    </div>
    <div v-if="!notifications.length" class="notification-system__empty">
      Нет новых уведомлений
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { notificationService } from '@/services/notificationService'

const router = useRouter()
const notifications = notificationService.getNotifications()

const openNotification = (notification) => {
  if (notification.type === 'urgent' || notification.type === 'response') {
    router.push(`/jobs/${notification.job_id}`)
  }
  markAsRead(notification.id)
}

const markAsRead = (id) => {
  notificationService.markAsRead(id)
}

onUnmounted(() => {
  notificationService.clearAll()
})
</script>

<style scoped>
.notification-system {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  z-index: 1000;
}

.notification {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  padding: 15px;
  transition: opacity 0.3s ease;
}

.notification--read {
  opacity: 0.6;
}

.notification__content {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.notification__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 14px;
}

.notification__badge--urgent {
  background: #ffebee;
}

.notification__badge--response {
  background: #e3f2fd;
}

.notification__message {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
}

.notification__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.notification__action {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification__action:hover {
  background: #f5f5f5;
}

.notification__action--primary {
  background: #1976d2;
  border-color: #1976d2;
  color: white;
}

.notification__action--primary:hover {
  background: #1565c0;
}

.notification-system__empty {
  color: #666;
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
