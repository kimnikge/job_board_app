// 📱 useNotifications.js — Композейбл для работы с push-уведомлениями
import { ref } from 'vue'
import { notificationsService } from '@/services/notifications.service.js'
import { HORECA_CONSTANTS } from '@/constants/horeca.constants.js'

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
    notifications.value.push({ 
      id: Date.now(), 
      type: 'success', 
      message, 
      timestamp: new Date() 
    })
  }

  function showError(message) {
    notifications.value.push({ 
      id: Date.now(), 
      type: 'error', 
      message, 
      timestamp: new Date() 
    })
  }

  function showInfo(message) {
    notifications.value.push({ 
      id: Date.now(), 
      type: 'info', 
      message, 
      timestamp: new Date() 
    })
  }

  function showWarning(message) {
    notifications.value.push({ 
      id: Date.now(), 
      type: 'warning', 
      message, 
      timestamp: new Date() 
    })
  }

  // Убрать уведомление из списка
  function removeNotification(notificationId) {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  // Очистить все уведомления
  function clearNotifications() {
    notifications.value = []
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
   * 🔥 СРОЧНАЯ ВАКАНСИЯ - Уведомить готовых сотрудников
   */
  const notifyUrgentJob = async (urgentJobData) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Формируем привлекательное сообщение для срочной вакансии
      const position = HORECA_CONSTANTS.POSITION_TYPES[urgentJobData.position_type]
      const urgencyIcon = HORECA_CONSTANTS.PRIORITIES[urgentJobData.priority]?.icon || '🔥'
      
      const message = `${urgencyIcon} СРОЧНО нужен ${position?.name || urgentJobData.position_type}!
📍 ${urgentJobData.location}
⏰ ${urgentJobData.needed_time_start} - ${urgentJobData.needed_time_end}
💰 ${urgentJobData.payment_per_shift.toLocaleString()} тенге за смену
${urgentJobData.instant_payment ? '⚡ Моментальная оплата!' : ''}

Откликнуться: /urgent_${urgentJobData.id}`

      const success = await notificationsService.notifyUrgentJob({
        ...urgentJobData,
        message
      })
      
      if (success) {
        lastNotificationSent.value = {
          type: 'urgent_job',
          jobTitle: urgentJobData.title,
          priority: urgentJobData.priority,
          timestamp: new Date()
        }
        showSuccess(`🔥 Срочное уведомление "${urgentJobData.title}" отправлено готовым сотрудникам!`)
      } else {
        error.value = 'Не удалось отправить срочное уведомление'
        showError('Ошибка отправки срочного уведомления')
      }
      
      return success
    } catch (err) {
      error.value = err.message
      showError(`Ошибка срочного уведомления: ${err.message}`)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Уведомить кандидата о принятии на работу
   */
  const notifyJobAccepted = async (candidateId, jobData, employerData) => {
    isLoading.value = true
    error.value = null
    
    try {
      const position = HORECA_CONSTANTS.POSITION_TYPES[jobData.position_type]
      const company = HORECA_CONSTANTS.COMPANY_TYPES[employerData.company_type]
      
      const message = `🎉 Поздравляем! Вы приняты на работу!

🏢 Компания: ${employerData.company_name}
👔 Позиция: ${position?.name || jobData.position_type}
📍 Адрес: ${jobData.location}
💰 Зарплата: ${jobData.salary_min ? `от ${jobData.salary_min.toLocaleString()}` : 'по договоренности'}

Контакты работодателя:
👤 ${employerData.contact_person}
📞 ${employerData.contact_phone}

Удачи в новой работе! 🍀`

      const success = await notificationsService.notifyUser(candidateId, message, 'success')
      
      if (success) {
        showSuccess('Кандидат уведомлен о принятии на работу!')
      }
      
      return success
    } catch (err) {
      error.value = err.message
      showError(`Ошибка уведомления о принятии: ${err.message}`)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Уведомить работодателя о новом отклике
   */
  const notifyNewApplication = async (employerId, candidateData, jobData) => {
    isLoading.value = true
    error.value = null
    
    try {
      const position = HORECA_CONSTANTS.POSITION_TYPES[jobData.position_type]
      
      const message = `📝 Новый отклик на вакансию!

👔 Вакансия: ${position?.name || jobData.position_type}
👤 Кандидат: ${candidateData.full_name}
⭐ Опыт: ${candidateData.experience || 'не указан'}

${candidateData.skills?.length ? `🛠 Навыки: ${candidateData.skills.slice(0, 3).join(', ')}${candidateData.skills.length > 3 ? '...' : ''}` : ''}

Посмотреть профиль: /candidate_${candidateData.id}`

      const success = await notificationsService.notifyUser(employerId, message, 'info')
      
      if (success) {
        showSuccess('Работодатель уведомлен о новом отклике!')
      }
      
      return success
    } catch (err) {
      error.value = err.message
      showError(`Ошибка уведомления работодателя: ${err.message}`)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Уведомить о получении бейджа с HoReCa контекстом
   */
  const notifyHoRecaBadgeAwarded = async (userId, badgeData, skillsImproved = []) => {
    isLoading.value = true
    error.value = null
    
    try {
      let message = `🏆 Поздравляем! Вы получили новый бейдж!

🎖️ ${badgeData.name}
⭐ Уровень: ${badgeData.level}
📋 Описание: ${badgeData.description}`

      if (skillsImproved.length > 0) {
        message += `\n\n💪 Улучшены навыки:\n${skillsImproved.map(skill => `• ${skill.name} +${skill.improvement}`).join('\n')}`
      }

      message += '\n\nПродолжайте развиваться в HoReCa сфере! 🚀'

      const success = await notificationsService.notifyUser(userId, message, 'success')
      
      if (success) {
        showSuccess(`🏆 Уведомление о бейдже "${badgeData.name}" отправлено!`)
      }
      
      return success
    } catch (err) {
      error.value = err.message
      showError(`Ошибка уведомления о бейдже: ${err.message}`)
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
    showInfo,
    showWarning,
    removeNotification,
    clearNotifications,
    
    // Push-уведомления (базовые)
    isLoading,
    error,
    lastNotificationSent,
    notifyUser,
    notifyNewJob,
    notifyBadgeAwarded,
    notifyWelcome,
    
    // HoReCa-специфические уведомления
    notifyUrgentJob,
    notifyJobAccepted,
    notifyNewApplication,
    notifyHoRecaBadgeAwarded,
    
    clearError
  }
}
