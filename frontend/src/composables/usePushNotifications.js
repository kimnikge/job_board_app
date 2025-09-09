// 📱 usePushNotifications.js — Композейбл для работы с push-уведомлениями
import { ref, onMounted } from 'vue'
import { pushNotificationsService } from '@/services/pushNotifications.service.js'
import { useAuthStore } from '@/stores/auth.js'

export function usePushNotifications() {
  const authStore = useAuthStore()
  
  const isSupported = ref(false)
  const permission = ref('default')
  const isSubscribed = ref(false)
  const loading = ref(false)
  const error = ref(null)

  // Проверяем поддержку при загрузке
  onMounted(() => {
    isSupported.value = pushNotificationsService.isSupported()
    permission.value = pushNotificationsService.getPermissionStatus()
    checkSubscriptionStatus()
  })

  // Проверить статус подписки
  const checkSubscriptionStatus = async () => {
    if (!isSupported.value) return

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      isSubscribed.value = !!subscription
    } catch (err) {
      console.error('Ошибка проверки подписки:', err)
    }
  }

  // Подписаться на уведомления
  const subscribe = async () => {
    if (!authStore.isAuthenticated) {
      error.value = 'Необходимо войти в систему'
      return false
    }

    loading.value = true
    error.value = null

    try {
      await pushNotificationsService.subscribe()
      isSubscribed.value = true
      permission.value = 'granted'
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Отписаться от уведомлений
  const unsubscribe = async () => {
    loading.value = true
    error.value = null

    try {
      await pushNotificationsService.unsubscribe()
      isSubscribed.value = false
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Отправить тестовое уведомление
  const sendTest = async () => {
    try {
      await pushNotificationsService.sendTestNotification()
      return true
    } catch (err) {
      error.value = err.message
      return false
    }
  }

  // Очистить ошибку
  const clearError = () => {
    error.value = null
  }

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
    sendTest,
    clearError,
    checkSubscriptionStatus
  }
}
