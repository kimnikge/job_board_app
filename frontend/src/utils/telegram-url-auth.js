// Telegram URL Authorization Handler
// Поддержка автоматической авторизации через URL с autologin_token
// Согласно документации: https://core.telegram.org/api/url-authorization

export class TelegramURLAuth {
  constructor() {
    this.autologinToken = null
    this.tokenExpiration = null
    this.configCache = null
    this.lastConfigFetch = 0
    
    // Список доверенных доменов Telegram для автоавторизации
    this.trustedDomains = [
      'telegram.org',
      't.me', 
      'web.telegram.org',
      'horecapp.netlify.app' // Наш домен для тестирования
    ]
  }

  // Проверка, нужна ли автоавторизация для URL
  needsAutoLogin(url) {
    try {
      const urlObj = new URL(url)
      return this.trustedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
      )
    } catch {
      return false
    }
  }

  // Получение конфигурации MTProto (заглушка для веб-приложения)
  async getMTProtoConfig() {
    // В реальном Telegram клиенте это help.getConfig из MTProto API
    // Для веб-приложения используем заглушку или получаем через Telegram Bot API
    
    const now = Date.now()
    
    // Кэшируем конфигурацию на 10 минут
    if (this.configCache && (now - this.lastConfigFetch) < 600000) {
      return this.configCache
    }

    try {
      // В реальной реализации здесь должен быть запрос к Telegram API
      // Для демо создаем mock конфигурацию
      const config = {
        autologin_domains: this.trustedDomains,
        autologin_token: this.generateMockToken(),
        token_expires: Math.floor(Date.now() / 1000) + 3600 // Истекает через час
      }
      
      this.configCache = config
      this.lastConfigFetch = now
      this.autologinToken = config.autologin_token
      this.tokenExpiration = config.token_expires
      
      console.log('📱 MTProto config получен:', { 
        domains: config.autologin_domains.length,
        token_expires: new Date(config.token_expires * 1000).toLocaleString()
      })
      
      return config
    } catch (error) {
      console.error('❌ Ошибка получения MTProto конфигурации:', error)
      return null
    }
  }

  // Генерация mock токена для демонстрации
  generateMockToken() {
    // В реальной реализации токен приходит от Telegram
    const timestamp = Math.floor(Date.now() / 1000)
    const random = Math.random().toString(36).substr(2, 9)
    return `mock_autologin_${timestamp}_${random}`
  }

  // Проверка действительности autologin_token
  isTokenValid() {
    if (!this.autologinToken || !this.tokenExpiration) {
      return false
    }
    
    const currentTime = Math.floor(Date.now() / 1000)
    const tokenAge = currentTime - (this.tokenExpiration - 3600) // Вычисляем возраст токена
    
    // Токен не должен быть старше 10000 секунд (согласно документации)
    return tokenAge < 10000 && currentTime < this.tokenExpiration
  }

  // Добавление autologin_token к URL
  async addAutologinToken(originalUrl) {
    if (!this.needsAutoLogin(originalUrl)) {
      console.log('🔗 URL не требует автоавторизации:', originalUrl)
      return originalUrl
    }

    // Проверяем действительность текущего токена
    if (!this.isTokenValid()) {
      console.log('🔄 Обновляем autologin_token...')
      await this.getMTProtoConfig()
    }

    if (!this.isTokenValid()) {
      console.warn('⚠️ Не удалось получить действительный autologin_token')
      return originalUrl
    }

    try {
      const url = new URL(originalUrl)
      
      // Добавляем autologin_token к query параметрам
      url.searchParams.set('autologin_token', this.autologinToken)
      
      const modifiedUrl = url.toString()
      
      console.log('✅ URL модифицирован для автоавторизации:')
      console.log('   Исходный:', originalUrl)
      console.log('   Измененный:', modifiedUrl)
      
      return modifiedUrl
      
    } catch (error) {
      console.error('❌ Ошибка модификации URL:', error)
      return originalUrl
    }
  }

  // Обработка входящих URL с autologin_token
  async processIncomingURL(url) {
    try {
      const urlObj = new URL(url)
      const autologinToken = urlObj.searchParams.get('autologin_token')
      
      if (!autologinToken) {
        console.log('🔗 URL не содержит autologin_token')
        return { authenticated: false, url }
      }

      console.log('🔑 Обнаружен autologin_token:', autologinToken)
      
      // Проверяем валидность токена
      if (!this.validateAutologinToken(autologinToken)) {
        console.warn('⚠️ Неверный autologin_token')
        return { authenticated: false, url }
      }

      // Удаляем токен из URL для безопасности
      urlObj.searchParams.delete('autologin_token')
      const cleanUrl = urlObj.toString()
      
      console.log('✅ Автоавторизация успешна, URL очищен:', cleanUrl)
      
      return { 
        authenticated: true, 
        url: cleanUrl,
        token: autologinToken
      }
      
    } catch (error) {
      console.error('❌ Ошибка обработки входящего URL:', error)
      return { authenticated: false, url }
    }
  }

  // Валидация autologin_token
  validateAutologinToken(token) {
    // В реальной реализации здесь должна быть проверка подписи токена
    // Для демо проверяем формат
    return token && (
      token.startsWith('mock_autologin_') || 
      token.length > 10
    )
  }

  // Создание URL для открытия с автоавторизацией
  async createAutologinURL(baseUrl, additionalParams = {}) {
    let url = baseUrl
    
    // Добавляем дополнительные параметры
    if (Object.keys(additionalParams).length > 0) {
      const urlObj = new URL(baseUrl)
      Object.entries(additionalParams).forEach(([key, value]) => {
        urlObj.searchParams.set(key, value)
      })
      url = urlObj.toString()
    }
    
    // Добавляем autologin_token
    return await this.addAutologinToken(url)
  }

  // Инициализация обработчика URL
  init() {
    console.log('🔗 Инициализация Telegram URL Authorization Handler')
    
    // Проверяем текущий URL на наличие autologin_token
    this.processCurrentURL()
    
    // Подписываемся на изменения URL (для SPA)
    window.addEventListener('popstate', () => {
      this.processCurrentURL()
    })
    
    // Получаем начальную конфигурацию
    this.getMTProtoConfig()
  }

  // Обработка текущего URL страницы
  async processCurrentURL() {
    const currentURL = window.location.href
    const result = await this.processIncomingURL(currentURL)
    
    if (result.authenticated) {
      // URL содержал действительный autologin_token
      console.log('🎯 Автоавторизация через URL выполнена')
      
      // Обновляем URL в браузере без токена
      if (result.url !== currentURL) {
        window.history.replaceState({}, '', result.url)
      }
      
      // Запускаем автоматическую авторизацию
      this.triggerAutoAuthentication(result.token)
    }
  }

  // Запуск автоматической авторизации
  async triggerAutoAuthentication(token) {
    try {
      // Событие для уведомления приложения об автоавторизации
      const event = new CustomEvent('telegram-url-auth', {
        detail: { token, timestamp: Date.now() }
      })
      
      window.dispatchEvent(event)
      
      console.log('✨ Событие автоавторизации отправлено')
      
    } catch (error) {
      console.error('❌ Ошибка запуска автоавторизации:', error)
    }
  }

  // Утилита для создания ссылок с автоавторизацией
  async generateShareableLink(path = '/', params = {}) {
    const baseUrl = `${window.location.origin}${path}`
    return await this.createAutologinURL(baseUrl, params)
  }
}

// Создаем глобальный экземпляр
export const telegramURLAuth = new TelegramURLAuth()

// Автоинициализация при загрузке
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    telegramURLAuth.init()
  })
}

console.log('📱 Telegram URL Authorization Handler загружен')
