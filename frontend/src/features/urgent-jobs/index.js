/**
 * 🚨 МОДУЛЬ СРОЧНЫХ ВАКАНСИЙ
 * 
 * Основной модуль для системы "НУЖНЫ СЕГОДНЯ/ЗАВТРА" в общепите Астаны
 */

import { defineAsyncComponent } from 'vue'

export default {
  // Базовая информация о модуле
  name: 'urgent-jobs',
  version: '1.0.0',
  displayName: '🚨 Срочные вакансии',
  description: 'Система срочных вакансий для общепита Астаны',
  
  // Зависимости от других модулей
  dependencies: ['auth', 'notifications'],
  
  // Маршруты модуля
  routes: [
    {
      path: '/urgent',
      name: 'urgent-jobs',
      component: defineAsyncComponent(() => import('./pages/UrgentJobsPage.vue')),
      meta: { 
        title: '🚨 Срочные вакансии',
        module: 'urgent-jobs',
        requiresAuth: false,
        icon: 'urgent',
        showInMenu: true,
        menuOrder: 1
      }
    },
    {
      path: '/urgent/create',
      name: 'urgent-job-create',
      component: defineAsyncComponent(() => import('./pages/CreateUrgentJobPage.vue')),
      meta: {
        title: '🚨 Создать срочную вакансию',
        module: 'urgent-jobs',
        requiresAuth: true,
        roles: ['company', 'admin']
      }
    },
    {
      path: '/urgent/:id',
      name: 'urgent-job-details',
      component: defineAsyncComponent(() => import('./pages/UrgentJobDetailsPage.vue')),
      meta: {
        title: 'Детали срочной вакансии',
        module: 'urgent-jobs',
        requiresAuth: false
      }
    }
  ],
  
  // Навигационное меню
  navigation: {
    label: '🚨 СРОЧНО',
    icon: 'urgent-fire',
    route: '/urgent',
    badge: () => {
      // Показываем количество активных срочных вакансий
      const urgentStore = useUrgentJobsStore()
      return urgentStore.activeCount || 0
    },
    highlight: true, // Выделяем красным цветом
    order: 1 // Первый пункт в меню
  },
  
  // Конфигурация модуля
  config: {
    // Интервалы обновления (в миллисекундах)
    refreshIntervals: {
      jobsList: 30000,      // 30 сек - список срочных вакансий
      notifications: 10000,  // 10 сек - уведомления
      userStatus: 60000     // 1 мин - статус пользователя
    },
    
    // Автозакрытие вакансий
    autoClose: {
      defaultHours: 24,     // По умолчанию через 24 часа
      maxHours: 48,         // Максимум 48 часов
      warningHours: 2       // Предупреждение за 2 часа
    },
    
    // Уведомления
    notifications: {
      enabled: true,
      sound: true,
      vibration: true,
      personalized: true    // По специализациям и районам
    }
  },
  
  // Инициализация модуля
  async init({ app, router, store }) {
    try {
      console.log('🚨 Initializing Urgent Jobs module...')
      
      // Инициализируем store
      const urgentStore = useUrgentJobsStore()
      await urgentStore.init()
      
      // Подписываемся на real-time обновления
      await urgentStore.subscribeToRealTimeUpdates()
      
      // Загружаем активные срочные вакансии
      await urgentStore.loadActiveJobs()
      
      // Инициализируем уведомления для срочных вакансий
      if (this.config.notifications.enabled) {
        await urgentStore.initNotifications()
      }
      
      console.log('✅ Urgent Jobs module initialized successfully')
      
      return {
        success: true,
        message: 'Модуль срочных вакансий готов к работе'
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize Urgent Jobs module:', error)
      
      return {
        success: false,
        error: error.message
      }
    }
  },
  
  // Деинициализация модуля
  async destroy({ app, router, store }) {
    try {
      console.log('🚨 Destroying Urgent Jobs module...')
      
      const urgentStore = useUrgentJobsStore()
      
      // Отписываемся от real-time обновлений
      urgentStore.unsubscribeFromRealTime()
      
      // Очищаем таймеры
      urgentStore.clearTimers()
      
      // Очищаем store
      urgentStore.$reset()
      
      console.log('✅ Urgent Jobs module destroyed')
      
    } catch (error) {
      console.error('❌ Error destroying Urgent Jobs module:', error)
    }
  },
  
  // Проверка здоровья модуля
  async healthCheck() {
    try {
      const urgentStore = useUrgentJobsStore()
      
      return {
        status: 'healthy',
        activeJobs: urgentStore.activeJobs?.length || 0,
        realTimeConnected: urgentStore.isRealTimeConnected,
        lastUpdate: urgentStore.lastUpdateTime
      }
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      }
    }
  }
}

// Импорт store для использования в модуле
function useUrgentJobsStore() {
  // Lazy import чтобы избежать циклических зависимостей
  return import('./stores/urgentJobsStore.js').then(module => module.useUrgentJobsStore())
}

console.log('🚨 Urgent Jobs module definition loaded!')
