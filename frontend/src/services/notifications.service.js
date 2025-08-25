// 📱 notifications.service.js — Центральная служба уведомлений
import { sendTelegramNotification } from './telegramNotify.js'
import { profileService } from './profile.service.js'
import { isDemoMode } from './supabase.js'

/**
 * Центральная служба уведомлений для Job Board App
 * Интегрирует все типы уведомлений в единой системе
 */
export const notificationsService = {
  
  /**
   * Получить telegram chat_id пользователя
   */
  async getUserChatId(userId) {
    try {
      const { data: profile } = await profileService.getProfile(userId)
      return profile?.telegram_chat_id || null
    } catch (error) {
      console.warn('Error getting user chat_id:', error)
      return null
    }
  },

  /**
   * Отправить уведомление пользователю
   */
  async notifyUser(userId, message, type = 'info') {
    try {
      const chatId = await this.getUserChatId(userId)
      if (!chatId) {
        console.warn('❌ No telegram chat_id found for user:', userId)
        return false
      }

      // Добавляем эмодзи в зависимости от типа
      const typeEmojis = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️',
        job: '💼',
        badge: '🏅',
        welcome: '🎉',
        urgent: '🚨'
      }

      const emoji = typeEmojis[type] || 'ℹ️'
      const formattedMessage = `${emoji} ${message}`
      
      await sendTelegramNotification(chatId, formattedMessage)
      return true
    } catch (error) {
      console.error('💥 Error sending notification:', error)
      return false
    }
  },

  /**
   * Уведомление о новой вакансии
   */
  async notifyNewJob(jobData, targetUsers = []) {
    try {
      const message = `Новая вакансия: ${jobData.title}
📍 ${jobData.location || 'Астана'}
💰 ${this.formatSalary(jobData.salary_from, jobData.salary_to)}
🏢 ${jobData.company_name || 'Компания'}

Подробности в приложении Job Board!`

      // Если targetUsers не указаны, отправляем тестовому пользователю
      if (targetUsers.length === 0) {
        targetUsers = ['763612632']
      }

      for (const userId of targetUsers) {
        await this.notifyUser(userId, message, 'job')
      }

      return true
    } catch (error) {
      console.error('Error sending job notification:', error)
      return false
    }
  },

  /**
   * Уведомление о срочной вакансии
   */
  async notifyUrgentJob(jobData, targetUsers = []) {
    try {
      const message = `СРОЧНАЯ ВАКАНСИЯ: ${jobData.title}
📍 ${jobData.location || 'Астана'}
💰 ${this.formatSalary(jobData.salary_from, jobData.salary_to)}
🏢 ${jobData.company_name || 'Компания'}
⏰ Нужно ${jobData.needed_date ? this.formatDate(jobData.needed_date) : 'срочно'}

Откликнуться быстрее!`

      // Если targetUsers не указаны, отправляем тестовому пользователю
      if (targetUsers.length === 0) {
        targetUsers = ['763612632']
      }

      for (const userId of targetUsers) {
        await this.notifyUser(userId, message, 'urgent')
      }

      return true
    } catch (error) {
      console.error('Error sending urgent job notification:', error)
      return false
    }
  },

  /**
   * Уведомление о получении бейджа
   */
  async notifyBadgeAwarded(userId, badgeData, reason = null) {
    try {
      const message = `Поздравляем! Вы получили бейдж "${badgeData.name}"!
${badgeData.icon_url || '🏅'} ${badgeData.description || 'Отличная работа!'}
${reason ? `\nПричина: ${reason}` : ''}

Просмотреть в профиле Job Board!`

      await this.notifyUser(userId, message, 'badge')
      return true
    } catch (error) {
      console.error('Error sending badge notification:', error)
      return false
    }
  },

  /**
   * Приветственное уведомление для новых пользователей
   */
  async notifyWelcome(userId, userData) {
    try {
      const message = `Добро пожаловать в Job Board, ${userData.full_name || 'новый пользователь'}!

Теперь вы можете:
📋 Просматривать вакансии в общепите
💼 Создавать резюме
🏅 Получать бейджи за достижения
📱 Получать уведомления о новых возможностях

Начните с поиска работы мечты!`

      await this.notifyUser(userId, message, 'welcome')
      return true
    } catch (error) {
      console.error('Error sending welcome notification:', error)
      return false
    }
  },

  /**
   * Уведомление о статусе заявки на вакансию
   */
  async notifyApplicationStatus(userId, jobTitle, status) {
    try {
      const statusMessages = {
        'applied': `Ваша заявка на вакансию "${jobTitle}" успешно отправлена!`,
        'viewed': `Работодатель просмотрел вашу заявку на "${jobTitle}"`,
        'shortlisted': `Вы прошли в короткий список на вакансию "${jobTitle}"!`,
        'rejected': `К сожалению, по вакансии "${jobTitle}" выбран другой кандидат`,
        'interview': `Приглашение на собеседование по вакансии "${jobTitle}"!`,
        'hired': `Поздравляем! Вы приняты на работу по вакансии "${jobTitle}"!`
      }

      const message = statusMessages[status] || `Обновление по вакансии "${jobTitle}"`
      const notificationType = ['hired', 'shortlisted', 'interview'].includes(status) ? 'success' : 'info'

      await this.notifyUser(userId, message, notificationType)
      return true
    } catch (error) {
      console.error('Error sending application status notification:', error)
      return false
    }
  },

  /**
   * Уведомление о новом сообщении/отклике
   */
  async notifyNewMessage(userId, fromUser, message) {
    try {
      const notificationText = `Новое сообщение от ${fromUser}:
"${message.length > 100 ? message.substring(0, 100) + '...' : message}"

Ответить в Job Board!`

      await this.notifyUser(userId, notificationText, 'info')
      return true
    } catch (error) {
      console.error('Error sending message notification:', error)
      return false
    }
  },

  /**
   * Форматирование зарплаты
   */
  formatSalary(from, to) {
    if (from && to) {
      return `${from.toLocaleString()} - ${to.toLocaleString()} ₸`
    } else if (from) {
      return `от ${from.toLocaleString()} ₸`
    } else if (to) {
      return `до ${to.toLocaleString()} ₸`
    }
    return 'По договоренности'
  },

  /**
   * Форматирование даты
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  },

  /**
   * Массовые уведомления по критериям
   */
  async notifyBySpecialization(specializationId, message, messageType = 'info') {
    try {
      // TODO: Получить пользователей по специализации из базы данных
      // const users = await profileService.getUsersBySpecialization(specializationId)
      
      // Пока отправляем тестовому пользователю
      await this.notifyUser('763612632', message, messageType)
      return true
    } catch (error) {
      console.error('Error sending specialization notifications:', error)
      return false
    }
  },

  /**
   * Уведомления по геолокации
   */
  async notifyByLocation(district, message, messageType = 'info') {
    try {
      // TODO: Получить пользователей по району из базы данных
      // const users = await profileService.getUsersByDistrict(district)
      
      // Пока отправляем тестовому пользователю
      await this.notifyUser('763612632', message, messageType)
      return true
    } catch (error) {
      console.error('Error sending location notifications:', error)
      return false
    }
  }
}
