import { supabase, isAuthenticated, isDemoMode } from './supabase.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ref, Ref } from 'vue'

interface Notification {
  id: number
  type: 'urgent' | 'response'
  message: string
  job_id: string
  response_id?: string
  created_at: string
  read?: boolean
}

export class NotificationService {
  private supabase: SupabaseClient
  private notifications: Ref<Notification[]>
  private telegramApiUrl: string

  constructor() {
    this.supabase = supabase
    this.notifications = ref([])
    this.telegramApiUrl = import.meta.env.VITE_TELEGRAM_BOT_API_URL || ''
    this.initializeRealtimeListeners()
  }

  private async initializeRealtimeListeners() {
    // Проверяем аутентификацию перед созданием подписок
    const userAuthenticated = await isAuthenticated()
    if (!userAuthenticated || isDemoMode) {
      console.log('🔇 Skipping realtime subscriptions - user not authenticated or demo mode')
      return
    }
    
    this.setupRealtimeListeners()
  }

  private async setupRealtimeListeners() {
    // Подписываемся на новые срочные вакансии
    this.supabase
      .channel('urgent-jobs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'jobs',
          filter: 'is_urgent=eq.true'
        },
        async (payload: { new: any }) => {
          await this.notifyUrgentJob(payload.new)
        }
      )
      .subscribe()

    // Подписываемся на новые отклики
    this.supabase
      .channel('job-responses')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'job_responses'
        },
        async (payload: { new: any }) => {
          await this.notifyNewResponse(payload.new)
        }
      )
      .subscribe()
  }

  public async notifyUrgentJob(job: any) {
    try {
      // Получаем всех пользователей, готовых к срочным заменам
      const { data: availableUsers } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('ready_for_urgent', true)
        .gte('urgent_available_until', new Date().toISOString())

      if (!availableUsers?.length) return

      const message = `
🚨 Новая срочная вакансия!

${job.title}
💰 ${job.payment_per_shift}₽ за смену
📍 ${job.district}
⏰ Нужен: ${new Date(job.work_date).toLocaleDateString()}

${job.description}
      `

      // Добавляем в локальные уведомления
      this.notifications.value.unshift({
        id: Date.now(),
        type: 'urgent',
        message,
        job_id: job.id,
        created_at: new Date().toISOString()
      })

      // Отправляем через бота каждому доступному пользователю
      for (const user of availableUsers) {
        if (user.telegram_id) {
          await this.sendTelegramMessage(user.telegram_id, message, job.id)
        }
      }
    } catch (error) {
      console.error('Error in notifyUrgentJob:', error)
    }
  }

  public async notifyNewResponse(response: any) {
    try {
      // Получаем данные о вакансии
      const { data: job } = await this.supabase
        .from('jobs')
        .select('*')
        .eq('id', response.job_id)
        .single()

      if (!job) return

      // Получаем данные о работодателе
      const { data: employer } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', job.employer_id)
        .single()

      if (!employer?.telegram_id) return

      const message = `
✨ Новый отклик на вашу вакансию!

Вакансия: ${job.title}
📍 ${job.district}
⏰ Дата: ${new Date(job.work_date).toLocaleDateString()}
      `

      // Добавляем в локальные уведомления
      this.notifications.value.unshift({
        id: Date.now(),
        type: 'response',
        message,
        job_id: job.id,
        response_id: response.id,
        created_at: new Date().toISOString()
      })

      // Отправляем через бота
      await this.sendTelegramMessage(employer.telegram_id, message, job.id)
    } catch (error) {
      console.error('Error in notifyNewResponse:', error)
    }
  }

  private async sendTelegramMessage(chatId: string, message: string, jobId: string) {
    try {
      const response = await fetch(`${this.telegramApiUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[
              {
                text: '👉 Открыть в приложении',
                web_app: { url: `${import.meta.env.VITE_APP_URL}/jobs/${jobId}` }
              }
            ]]
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send Telegram message')
      }
    } catch (error) {
      console.error('Error sending Telegram message:', error)
    }
  }

  public getNotifications() {
    return this.notifications
  }

  public markAsRead(notificationId: number) {
    const index = this.notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      this.notifications.value[index].read = true
    }
  }

  public clearAll() {
    this.notifications.value = []
  }
}

export const notificationService = new NotificationService()
