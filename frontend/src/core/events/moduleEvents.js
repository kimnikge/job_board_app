/**
 * 📡 СИСТЕМА СОБЫТИЙ МЕЖДУ МОДУЛЯМИ
 * 
 * Обеспечивает слабосвязанное взаимодействие между модулями
 * через события вместо прямых импортов
 */

class ModuleEventBus {
  constructor() {
    this.eventTarget = new EventTarget()
    this.listeners = new Map() // Для отладки и управления подписками
    
    console.log('📡 ModuleEventBus initialized')
  }
  
  /**
   * Отправка события
   * @param {string} eventName - Название события
   * @param {any} data - Данные события
   */
  emit(eventName, data = null) {
    const event = new CustomEvent(eventName, {
      detail: data
    })
    
    console.log(`📤 Event emitted: ${eventName}`, data)
    
    this.eventTarget.dispatchEvent(event)
  }
  
  /**
   * Подписка на событие
   * @param {string} eventName - Название события
   * @param {Function} handler - Обработчик события
   * @param {string} moduleName - Имя модуля (для отладки)
   */
  on(eventName, handler, moduleName = 'unknown') {
    const wrappedHandler = (event) => {
      console.log(`📥 Event received: ${eventName} by ${moduleName}`, event.detail)
      handler(event)
    }
    
    this.eventTarget.addEventListener(eventName, wrappedHandler)
    
    // Сохраняем для отладки
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, [])
    }
    this.listeners.get(eventName).push({
      handler: wrappedHandler,
      originalHandler: handler,
      moduleName
    })
    
    console.log(`📡 Subscribed to ${eventName} from ${moduleName}`)
  }
  
  /**
   * Отписка от события
   * @param {string} eventName - Название события
   * @param {Function} handler - Оригинальный обработчик
   */
  off(eventName, handler) {
    const eventListeners = this.listeners.get(eventName)
    if (eventListeners) {
      const listenerInfo = eventListeners.find(l => l.originalHandler === handler)
      if (listenerInfo) {
        this.eventTarget.removeEventListener(eventName, listenerInfo.handler)
        
        // Удаляем из списка
        const index = eventListeners.indexOf(listenerInfo)
        eventListeners.splice(index, 1)
        
        console.log(`📡 Unsubscribed from ${eventName}`)
      }
    }
  }
  
  /**
   * Одноразовая подписка
   * @param {string} eventName - Название события
   * @param {Function} handler - Обработчик события
   * @param {string} moduleName - Имя модуля
   */
  once(eventName, handler, moduleName = 'unknown') {
    const onceHandler = (event) => {
      handler(event)
      this.off(eventName, handler)
    }
    this.on(eventName, onceHandler, moduleName)
  }
  
  /**
   * Получить список активных подписок (для отладки)
   */
  getActiveListeners() {
    const result = {}
    for (const [eventName, listeners] of this.listeners.entries()) {
      result[eventName] = listeners.map(l => l.moduleName)
    }
    return result
  }
  
  /**
   * Отписать модуль от всех событий
   * @param {string} moduleName - Имя модуля
   */
  unsubscribeModule(moduleName) {
    for (const [eventName, listeners] of this.listeners.entries()) {
      const moduleListeners = listeners.filter(l => l.moduleName === moduleName)
      moduleListeners.forEach(listenerInfo => {
        this.eventTarget.removeEventListener(eventName, listenerInfo.handler)
      })
      
      // Удаляем из списка
      this.listeners.set(eventName, listeners.filter(l => l.moduleName !== moduleName))
    }
    
    console.log(`📡 Unsubscribed module ${moduleName} from all events`)
  }
}

// Создаем глобальный экземпляр
export const moduleEvents = new ModuleEventBus()

/**
 * 🎣 КОМПОЗИЦИЯ ДЛЯ ИСПОЛЬЗОВАНИЯ В КОМПОНЕНТАХ
 */
export function useModuleEvents() {
  return {
    emit: moduleEvents.emit.bind(moduleEvents),
    on: moduleEvents.on.bind(moduleEvents),
    off: moduleEvents.off.bind(moduleEvents),
    once: moduleEvents.once.bind(moduleEvents)
  }
}

/**
 * 📋 СТАНДАРТНЫЕ СОБЫТИЯ СИСТЕМЫ
 */
export const SYSTEM_EVENTS = {
  // Модули
  MODULE_REGISTERED: 'module:registered',
  MODULE_ENABLED: 'module:enabled',
  MODULE_DISABLED: 'module:disabled',
  
  // Авторизация
  USER_LOGIN: 'auth:login',
  USER_LOGOUT: 'auth:logout',
  USER_PROFILE_UPDATED: 'auth:profile-updated',
  
  // Срочные вакансии
  URGENT_JOB_CREATED: 'urgent-job:created',
  URGENT_JOB_APPLIED: 'urgent-job:applied',
  URGENT_JOB_EXPIRED: 'urgent-job:expired',
  URGENT_JOB_FILLED: 'urgent-job:filled',
  
  // Обычные вакансии  
  JOB_CREATED: 'job:created',
  JOB_APPLIED: 'job:applied',
  JOB_FAVORITED: 'job:favorited',
  
  // Уведомления
  NOTIFICATION_RECEIVED: 'notification:received',
  NOTIFICATION_READ: 'notification:read',
  
  // Навигация
  ROUTE_CHANGED: 'navigation:route-changed',
  
  // Загрузка
  LOADING_START: 'loading:start',
  LOADING_END: 'loading:end'
}

/**
 * 🔧 HELPER ФУНКЦИИ ДЛЯ ТИПИЧНЫХ СЦЕНАРИЕВ
 */

/**
 * Уведомить о загрузке
 * @param {string} moduleName - Имя модуля
 * @param {boolean} isLoading - Состояние загрузки
 */
export function emitLoadingState(moduleName, isLoading) {
  moduleEvents.emit(isLoading ? SYSTEM_EVENTS.LOADING_START : SYSTEM_EVENTS.LOADING_END, {
    module: moduleName
  })
}

/**
 * Уведомить о создании срочной вакансии
 * @param {Object} urgentJob - Данные срочной вакансии
 */
export function emitUrgentJobCreated(urgentJob) {
  moduleEvents.emit(SYSTEM_EVENTS.URGENT_JOB_CREATED, urgentJob)
}

/**
 * Уведомить об отклике на срочную вакансию  
 * @param {Object} application - Данные отклика
 */
export function emitUrgentJobApplied(application) {
  moduleEvents.emit(SYSTEM_EVENTS.URGENT_JOB_APPLIED, application)
}

/**
 * Уведомить о входе пользователя
 * @param {Object} user - Данные пользователя
 */
export function emitUserLogin(user) {
  moduleEvents.emit(SYSTEM_EVENTS.USER_LOGIN, user)
}

/**
 * Уведомить о выходе пользователя
 */
export function emitUserLogout() {
  moduleEvents.emit(SYSTEM_EVENTS.USER_LOGOUT)
}

console.log('📡 Module events system ready!')
