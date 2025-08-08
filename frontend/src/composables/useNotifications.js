// useNotifications.js — уведомления
import { ref } from 'vue'

export function useNotifications() {
  const notifications = ref([])

  function showSuccess(message) {
    notifications.value.push({ type: 'success', message })
  }

  function showError(message) {
    notifications.value.push({ type: 'error', message })
  }

  return { notifications, showSuccess, showError }
}
