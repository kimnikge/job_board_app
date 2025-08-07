import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ✨ УВЕДОМЛЕНИЯ STORE - СОГЛАСНО ПЛАНУ ЭТАПА 3
export const useNotificationsStore = defineStore('notifications', () => {
  // Состояние
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  
  // Геттеры
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.read)
  )
  
  const recentNotifications = computed(() => 
    notifications.value.slice(0, 5)
  )
  
  const hasUnread = computed(() => unreadCount.value > 0)
  
  // Типы уведомлений
  const NotificationTypes = {
    JOB_APPLICATION: 'job_application',
    JOB_ACCEPTED: 'job_accepted',
    JOB_REJECTED: 'job_rejected',
    NEW_JOB_MATCH: 'new_job_match',
    URGENT_JOB: 'urgent_job',
    SYSTEM: 'system'
  }
  
  // Действия для добавления уведомлений
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      ...notification,
      timestamp: new Date(),
      read: false
    }
    
    notifications.value.unshift(newNotification)
    unreadCount.value++
    
    // Автоматически убираем уведомление через 5 секунд (если это toast)
    if (notification.autoHide !== false) {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, 5000)
    }
    
    return newNotification.id
  }
  
  const showSuccess = (message, options = {}) => {
    return addNotification({
      type: 'success',
      title: 'Успешно!',
      message,
      icon: '✅',
      ...options
    })
  }
  
  const showError = (message, options = {}) => {
    return addNotification({
      type: 'error',
      title: 'Ошибка!',
      message,
      icon: '❌',
      autoHide: false,
      ...options
    })
  }
  
  const showWarning = (message, options = {}) => {
    return addNotification({
      type: 'warning',
      title: 'Внимание!',
      message,
      icon: '⚠️',
      ...options
    })
  }
  
  const showInfo = (message, options = {}) => {
    return addNotification({
      type: 'info',
      title: 'Информация',
      message,
      icon: 'ℹ️',
      ...options
    })
  }
  
  // Специализированные уведомления для общепита
  const showJobApplication = (jobTitle, candidateName) => {
    return addNotification({
      type: NotificationTypes.JOB_APPLICATION,
      title: '👤 Новый отклик!',
      message: `${candidateName} откликнулся на вакансию "${jobTitle}"`,
      icon: '📝',
      autoHide: false,
      priority: 'high'
    })
  }
  
  const showJobAccepted = (jobTitle, companyName) => {
    return addNotification({
      type: NotificationTypes.JOB_ACCEPTED,
      title: '🎉 Поздравляем!',
      message: `Ваш отклик на вакансию "${jobTitle}" в ${companyName} принят!`,
      icon: '✅',
      autoHide: false,
      priority: 'high'
    })
  }
  
  const showJobRejected = (jobTitle, companyName) => {
    return addNotification({
      type: NotificationTypes.JOB_REJECTED,
      title: '😔 Отклик отклонен',
      message: `К сожалению, отклик на "${jobTitle}" в ${companyName} не прошел отбор`,
      icon: '❌',
      autoHide: false,
      priority: 'normal'
    })
  }
  
  const showNewJobMatch = (jobTitle, matchPercent) => {
    return addNotification({
      type: NotificationTypes.NEW_JOB_MATCH,
      title: '🎯 Подходящая вакансия!',
      message: `Найдена вакансия "${jobTitle}" с совпадением ${matchPercent}%`,
      icon: '🎯',
      autoHide: false,
      priority: 'high'
    })
  }
  
  const showUrgentJob = (jobTitle, salary) => {
    return addNotification({
      type: NotificationTypes.URGENT_JOB,
      title: '⚡ СРОЧНАЯ ВАКАНСИЯ!',
      message: `${jobTitle} - до ${salary.toLocaleString()} тг. Нужен сегодня!`,
      icon: '⚡',
      autoHide: false,
      priority: 'urgent',
      actionButton: {
        text: 'Откликнуться',
        action: 'navigate_to_urgent_jobs'
      }
    })
  }
  
  // Действия для управления уведомлениями
  const markAsRead = (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      notification.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }
  
  const markAllAsRead = () => {
    notifications.value.forEach(notification => {
      notification.read = true
    })
    unreadCount.value = 0
  }
  
  const removeNotification = (notificationId) => {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      const notification = notifications.value[index]
      if (!notification.read) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      notifications.value.splice(index, 1)
    }
  }
  
  const clearAll = () => {
    notifications.value = []
    unreadCount.value = 0
  }
  
  const clearRead = () => {
    notifications.value = notifications.value.filter(n => !n.read)
  }
  
  // Push-уведомления (для будущего Telegram Mini App)
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }
  
  const sendPushNotification = (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })
    }
  }
  
  // Подписки на уведомления (настройки пользователя)
  const subscriptions = ref({
    newJobs: true,
    urgentJobs: true,
    applications: true,
    jobMatches: true,
    systemUpdates: false
  })
  
  const updateSubscription = (type, enabled) => {
    subscriptions.value[type] = enabled
    
    // Здесь можно сохранить настройки в localStorage или отправить на сервер
    localStorage.setItem('notification_subscriptions', JSON.stringify(subscriptions.value))
  }
  
  const loadSubscriptions = () => {
    const saved = localStorage.getItem('notification_subscriptions')
    if (saved) {
      subscriptions.value = { ...subscriptions.value, ...JSON.parse(saved) }
    }
  }
  
  // Инициализация (заглушки для демонстрации)
  const initDemoNotifications = () => {
    // Демонстрационные уведомления для разработки
    setTimeout(() => {
      showInfo('Добро пожаловать в Job Board для общепита Астаны! 🍽️')
    }, 1000)
    
    setTimeout(() => {
      showNewJobMatch('Повар итальянской кухни', 85)
    }, 3000)
    
    setTimeout(() => {
      showUrgentJob('Официант на замену', 15000)
    }, 6000)
  }
  
  return {
    // Состояние
    notifications,
    unreadCount,
    loading,
    subscriptions,
    
    // Геттеры
    unreadNotifications,
    recentNotifications,
    hasUnread,
    
    // Константы
    NotificationTypes,
    
    // Основные действия
    addNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Специализированные уведомления
    showJobApplication,
    showJobAccepted,
    showJobRejected,
    showNewJobMatch,
    showUrgentJob,
    
    // Управление уведомлениями
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    clearRead,
    
    // Push-уведомления
    requestNotificationPermission,
    sendPushNotification,
    
    // Подписки
    updateSubscription,
    loadSubscriptions,
    
    // Демо
    initDemoNotifications
  }
})
