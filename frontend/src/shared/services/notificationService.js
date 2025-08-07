/**
 * 🔔 СЕРВИС УВЕДОМЛЕНИЙ
 * 
 * Центральный сервис для работы с уведомлениями
 * Поддерживает локальные и push-уведомления
 */

import { moduleEvents, SYSTEM_EVENTS } from '../../core/events/moduleEvents.js'

class NotificationService {
  constructor() {
    this.notifications = []
    this.subscribers = new Set()
    this.isPermissionGranted = false
    
    console.log('🔔 NotificationService initialized')
    this.checkPermission()
  }

  /**
   * Проверка разрешений на уведомления
   */
  async checkPermission() {
    if ('Notification' in window) {
      this.isPermissionGranted = Notification.permission === 'granted'
      
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        this.isPermissionGranted = permission === 'granted'
      }
    }
  }

  /**
   * Создать уведомление
   * @param {Object} notification - Данные уведомления
   */
  async create(notification) {
    const notificationData = {
      id: this.generateId(),
      ...notification,
      createdAt: new Date(),
      read: false
    }

    // Добавляем в локальный список
    this.notifications.unshift(notificationData)

    // Уведомляем подписчиков
    this.notifySubscribers(notificationData)

    // Отправляем событие через модульную систему
    moduleEvents.emit(SYSTEM_EVENTS.NOTIFICATION_RECEIVED, notificationData)

    // Показываем браузерное уведомление если разрешено
    if (this.isPermissionGranted && notification.showBrowser !== false) {
      this.showBrowserNotification(notificationData)
    }

    console.log('🔔 Notification created:', notificationData)
    return notificationData
  }

  /**
   * Показать браузерное уведомление
   * @param {Object} notification - Данные уведомления
   */
  showBrowserNotification(notification) {
    if (!this.isPermissionGranted) return

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: notification.icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id
    })

    // Автозакрытие через 5 секунд
    setTimeout(() => {
      browserNotification.close()
    }, 5000)

    // Обработка клика
    browserNotification.onclick = () => {
      window.focus()
      if (notification.onClick) {
        notification.onClick(notification)
      }
      browserNotification.close()
    }
  }

  /**
   * Отметить уведомление как прочитанное
   * @param {string} notificationId - ID уведомления
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      notification.readAt = new Date()
      
      moduleEvents.emit(SYSTEM_EVENTS.NOTIFICATION_READ, notification)
      this.notifySubscribers()
      
      console.log('🔔 Notification marked as read:', notificationId)
    }
  }

  /**
   * Отметить все уведомления как прочитанные
   */
  markAllAsRead() {
    this.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true
        notification.readAt = new Date()
      }
    })
    
    this.notifySubscribers()
    console.log('🔔 All notifications marked as read')
  }

  /**
   * Получить все уведомления
   * @param {Object} filters - Фильтры
   */
  getAll(filters = {}) {
    let result = [...this.notifications]

    if (filters.unreadOnly) {
      result = result.filter(n => !n.read)
    }

    if (filters.type) {
      result = result.filter(n => n.type === filters.type)
    }

    if (filters.limit) {
      result = result.slice(0, filters.limit)
    }

    return result
  }

  /**
   * Получить количество непрочитанных уведомлений
   */
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length
  }

  /**
   * Удалить уведомление
   * @param {string} notificationId - ID уведомления
   */
  remove(notificationId) {
    const index = this.notifications.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      this.notifications.splice(index, 1)
      this.notifySubscribers()
      console.log('🔔 Notification removed:', notificationId)
    }
  }

  /**
   * Очистить все уведомления
   */
  clear() {
    this.notifications = []
    this.notifySubscribers()
    console.log('🔔 All notifications cleared')
  }

  /**
   * Подписаться на изменения уведомлений
   * @param {Function} callback - Функция обратного вызова
   */
  subscribe(callback) {
    this.subscribers.add(callback)
    
    // Возвращаем функцию отписки
    return () => {
      this.subscribers.delete(callback)
    }
  }

  /**
   * Уведомить всех подписчиков
   * @param {Object} notification - Новое уведомление
   */
  notifySubscribers(notification = null) {
    this.subscribers.forEach(callback => {
      try {
        callback({
          notifications: this.notifications,
          unreadCount: this.getUnreadCount(),
          newNotification: notification
        })
      } catch (error) {
        console.error('🔔 Error notifying subscriber:', error)
      }
    })
  }

  /**
   * Генерировать ID уведомления
   */
  generateId() {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Создать типизированные уведомления
   */
  
  // Срочная вакансия
  createUrgentJobNotification(job) {
    return this.create({
      type: 'urgent-job',
      title: '🚨 Срочная вакансия!',
      message: `${job.title} в ${job.venue_name}. Зарплата: ${job.pay_per_shift}₸`,
      icon: '🚨',
      priority: 'high',
      data: job
    })
  }

  // Новая обычная вакансия
  createJobNotification(job) {
    return this.create({
      type: 'job',
      title: '💼 Новая вакансия',
      message: `${job.title} в ${job.company_name}`,
      icon: '💼',
      priority: 'normal',
      data: job
    })
  }

  // Отклик на вакансию
  createApplicationNotification(application) {
    return this.create({
      type: 'application',
      title: '📝 Новый отклик',
      message: `Отклик на вашу вакансию "${application.job_title}"`,
      icon: '📝',
      priority: 'normal',
      data: application
    })
  }

  // Системное уведомление
  createSystemNotification(message, type = 'info') {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }

    return this.create({
      type: 'system',
      title: 'Системное уведомление',
      message,
      icon: icons[type],
      priority: type === 'error' ? 'high' : 'normal'
    })
  }
}

// Создаем глобальный экземпляр
export const notificationService = new NotificationService()

/**
 * 🎣 КОМПОЗИЦИЯ ДЛЯ ИСПОЛЬЗОВАНИЯ В КОМПОНЕНТАХ
 */
export function useNotifications() {
  return {
    create: notificationService.create.bind(notificationService),
    markAsRead: notificationService.markAsRead.bind(notificationService),
    markAllAsRead: notificationService.markAllAsRead.bind(notificationService),
    getAll: notificationService.getAll.bind(notificationService),
    getUnreadCount: notificationService.getUnreadCount.bind(notificationService),
    remove: notificationService.remove.bind(notificationService),
    clear: notificationService.clear.bind(notificationService),
    subscribe: notificationService.subscribe.bind(notificationService),
    
    // Типизированные уведомления
    createUrgentJob: notificationService.createUrgentJobNotification.bind(notificationService),
    createJob: notificationService.createJobNotification.bind(notificationService),
    createApplication: notificationService.createApplicationNotification.bind(notificationService),
    createSystem: notificationService.createSystemNotification.bind(notificationService)
  }
}

console.log('🔔 Notification system ready!')
