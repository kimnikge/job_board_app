// 📱 useNotifications.js — Композейбл для работы с push-уведомлениями
import { ref } from 'vue'
import { notificationsService } from '@/services/notifications.service.js'

/**
 * Композейбл для работы с push-уведомлениями в компонентах
 */
export function useNotifications() {
  const notifications = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const lastNotificationSent = ref(null)

  // Локальные уведомления (UI)
  function showSuccess(message) {
    notifications.value.push({ type: 'success', message })
  }

  function showError(message) {
    notifications.value.push({ type: 'error', message })
  }

  /**
   * Отправить Telegram уведомление пользователю
   */
  const notifyUser = async (userId, message, type = 'info') => {
    isLoading.value = true
    error.value = null
    
    try {
      const success = await notificationsService.notifyUser(userId, message, type)
      
      if (success) {
        lastNotificationSent.value = {
          userId,
          message,
          type,
          timestamp: new Date()
        }
        showSuccess('Уведомление отправлено!')
      } else {
        error.value = 'Не удалось отправить уведомление'
        showError('Ошибка отправки уведомления')
      }
      
      return success
    } catch (err) {
      error.value = err.message
      showError(`Ошибка: ${err.message}`)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Уведомить о новой вакансии
   */
  const notifyNewJob = async (jobData, targetUsers = []) => {
    isLoading.value = true
    error.value = null
    
    try {
      const success = await notificationsService.notifyNewJob(jobData, targetUsers)
      
      if (success) {
        lastNotificationSent.value = {
          type: 'job',
          jobTitle: jobData.title,
          timestamp: new Date()
        }
        showSuccess(`Уведомление о вакансии "${jobData.title}" отправлено!`)
      } else {
        error.value = 'Не удалось отправить уведомление о вакансии'
        showError('Ошибка отправки уведомления о вакансии')
      }
      
      return success
    } catch (err) {
      error.value = err.message
      showError(`Ошибка: ${err.message}`)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Уведомить о получении бейджа
   */
  const notifyBadgeAwarded = async (userId, badgeData, reason = null) => {
    isLoading.value = true
    error.value = null
    
    try {
      const success = await notificationsService.notifyBadgeAwarded(userId, badgeData, reason)
      
      if (success) {
        lastNotificationSent.value = {
          type: 'badge',
          badgeName: badgeData.name,
          userId,
          timestamp: new Date()
        }
        showSuccess(`Уведомление о бейдже "${badgeData.name}" отправлено!`)
      } else {
        error.value = 'Не удалось отправить уведомление о бейдже'
        showError('Ошибка отправки уведомления о бейдже')
      }
      
      return success
    } catch (err) {
      error.value = err.message
      showError(`Ошибка: ${err.message}`)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Отправить приветственное уведомление
   */
  const notifyWelcome = async (userId, userData) => {
    isLoading.value = true
    error.value = null
    
    try {
      const success = await notificationsService.notifyWelcome(userId, userData)
      
      if (success) {
        lastNotificationSent.value = {
          type: 'welcome',
          userName: userData.full_name,
          userId,
          timestamp: new Date()
        }
        showSuccess('Приветственное уведомление отправлено!')
      } else {
        error.value = 'Не удалось отправить приветственное уведомление'
        showError('Ошибка отправки приветственного уведомления')
      }
      
      return success
    } catch (err) {
      error.value = err.message
      showError(`Ошибка: ${err.message}`)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Очистить ошибку
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // Локальные уведомления
    notifications,
    showSuccess,
    showError,
    
    // Push-уведомления
    isLoading,
    error,
    lastNotificationSent,
    notifyUser,
    notifyNewJob,
    notifyBadgeAwarded,
    notifyWelcome,
    clearError
  }
}
