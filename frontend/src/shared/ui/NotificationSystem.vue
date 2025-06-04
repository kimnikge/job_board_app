<template>
  <div class="notification-container">
    <transition-group name="notification-fade" tag="div">
      <div
        v-for="notification in activeNotifications"
        :key="notification.id"
        :class="['notification-item', `notification-item--${notification.type}`]"
      >
        <div class="notification-content">
          <strong v-if="notification.title" class="notification-title">{{ notification.title }}</strong>
          <p class="notification-message">{{ notification.message }}</p>
          <p v-if="notification.details" class="notification-details">{{ notification.details }}</p>
        </div>
        <button @click="removeNotification(notification.id)" class="notification-close">&times;</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import eventBus from '../eventBus';

const activeNotifications = ref([]);
let notificationIdCounter = 0;

const defaultTimeout = 5000; // 5 seconds

function addNotification({ type = 'info', message, title = '', details = '', duration }) {
  const id = notificationIdCounter++;
  activeNotifications.value.push({
    id,
    type, // 'success', 'error', 'info', 'warning'
    title,
    message,
    details,
  });

  setTimeout(() => {
    removeNotification(id);
  }, duration || defaultTimeout);
}

function removeNotification(id) {
  activeNotifications.value = activeNotifications.value.filter(
    (notification) => notification.id !== id
  );
}

// Handler for event bus
const handleShowNotification = (payload) => {
  addNotification(payload);
};

onMounted(() => {
  eventBus.on('show-notification', handleShowNotification);
});

onUnmounted(() => {
  eventBus.off('show-notification', handleShowNotification);
});

// Expose method for manual use if needed (e.g. from parent component via ref)
defineExpose({
  show: addNotification,
});

</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 320px;
}

.notification-item {
  background-color: #fff;
  color: #333;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-left-width: 5px;
  border-left-style: solid;
}

.notification-item--info {
  border-left-color: #2196F3; /* Blue */
}
.notification-item--success {
  border-left-color: #4CAF50; /* Green */
}
.notification-item--warning {
  border-left-color: #FF9800; /* Orange */
}
.notification-item--error {
  border-left-color: #F44336; /* Red */
}

.notification-content {
  flex-grow: 1;
}

.notification-title {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
}

.notification-message {
  margin: 0;
  font-size: 0.9rem;
}
.notification-details {
  margin-top: 5px;
  font-size: 0.8rem;
  color: #666;
}

.notification-close {
  background: none;
  border: none;
  color: #aaa;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 0 0 0 10px; /* Add some padding to make it easier to click */
  align-self: flex-start; /* Align to the top of the flex container */
}
.notification-close:hover {
  color: #333;
}

/* Transitions */
.notification-fade-enter-active,
.notification-fade-leave-active {
  transition: all 0.5s ease;
}
.notification-fade-enter-from,
.notification-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
