// 📱 pushNotifications.service.js — Сервис для браузерных push-уведомлений
import { supabase } from './supabase.js'

export const pushNotificationsService = {
  /**
   * Проверить поддержку push-уведомлений
   */
  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window
  },

  /**
   * Зарегистрировать Service Worker
   */
  async registerServiceWorker() {
    if (!this.isSupported()) {
      throw new Error('Push-уведомления не поддерживаются в этом браузере')
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker зарегистрирован:', registration)
      return registration
    } catch (error) {
      console.error('Ошибка регистрации Service Worker:', error)
      throw error
    }
  },

  /**
   * Запросить разрешение на уведомления
   */
  async requestPermission() {
    if (!this.isSupported()) {
      throw new Error('Push-уведомления не поддерживаются')
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  },

  /**
   * Получить текущий статус разрешения
   */
  getPermissionStatus() {
    if (!this.isSupported()) return 'unsupported'
    return Notification.permission
  },

  /**
   * Подписаться на push-уведомления
   */
  async subscribe() {
    try {
      const registration = await this.registerServiceWorker()
      const permission = await this.requestPermission()

      if (!permission) {
        throw new Error('Разрешение на уведомления не получено')
      }

      // Получаем VAPID ключ из переменных окружения (временно)
      const vapidPublicKey = 'BN3oK1oWZaJzJJXnfTyV5JJvDZZgXCJjuoV4R3vZp1oVJJv2FnE5Jv2VnNJJjJvVZJJJzJ1nVp3oZ1oWZnVJ'
      
      if (!vapidPublicKey) {
        throw new Error('VAPID ключ не настроен')
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      })

      // Сохраняем подписку в базе данных
      const { data: user } = await supabase.auth.getUser()
      if (user?.user) {
        await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.user.id,
            subscription: subscription,
            created_at: new Date().toISOString()
          })
      }

      return subscription
    } catch (error) {
      console.error('Ошибка подписки на push-уведомления:', error)
      throw error
    }
  },

  /**
   * Отписаться от push-уведомлений
   */
  async unsubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        // Удаляем подписку из базы данных
        const { data: user } = await supabase.auth.getUser()
        if (user?.user) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.user.id)
        }
      }
    } catch (error) {
      console.error('Ошибка отписки от push-уведомлений:', error)
      throw error
    }
  },

  /**
   * Отправить тестовое уведомление
   */
  async sendTestNotification() {
    if (this.getPermissionStatus() !== 'granted') {
      throw new Error('Разрешение на уведомления не получено')
    }

    const notification = new Notification('ShiftworkKZ', {
      body: 'Тестовое push-уведомление! 🎉',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'test-notification'
    })

    // Автоматически закрыть через 4 секунды
    setTimeout(() => notification.close(), 4000)
  },

  /**
   * Конвертировать VAPID ключ из base64 в Uint8Array
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}
