/**
 * Правильная авторизация через Telegram Web App
 * Использует initData согласно официальной документации
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */

class TelegramWebAppAuth {
  constructor() {
    this.webApp = window.Telegram?.WebApp || null
    this.isDebug = import.meta.env.DEV
  }

  /**
   * Проверяет, доступен ли Telegram Web App
   */
  isAvailable() {
    return !!(this.webApp && this.webApp.initData)
  }

  /**
   * Получает базовые данные пользователя из Telegram Web App
   * МАКСИМАЛЬНО УПРОЩЕНО - только ID, имя, username
   */
  getAuthData() {
    if (!this.isAvailable()) {
      console.log('Telegram Web App недоступен')
      return null
    }

    try {
      const initData = this.webApp.initData
      
      if (!initData) {
        console.log('initData отсутствует')
        return null
      }

      // Парсим только user данные - никакой сложной валидации
      const urlParams = new URLSearchParams(initData)
      const userParam = urlParams.get('user')
      
      if (!userParam) {
        console.log('Параметр user отсутствует')
        return null
      }

      const userData = JSON.parse(decodeURIComponent(userParam))
      
      console.log('� Простая авторизация Telegram:', {
        id: userData.id,
        first_name: userData.first_name,
        username: userData.username
      })

      // Возвращаем только необходимые данные
      return {
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        photo_url: userData.photo_url,
        language_code: userData.language_code
      }

    } catch (error) {
      console.error('Ошибка получения данных Telegram:', error)
      return null
    }
  }

  /**
   * Получает информацию о платформе
   */
  getPlatformInfo() {
    if (!this.webApp) return 'unknown'

    const platform = this.webApp.platform || 'unknown'
    const colorScheme = this.webApp.colorScheme || 'light'
    
    return {
      platform,
      colorScheme,
      version: this.webApp.version,
      isExpanded: this.webApp.isExpanded,
      viewportHeight: this.webApp.viewportHeight,
      viewportStableHeight: this.webApp.viewportStableHeight
    }
  }

  /**
   * Валидация initData на frontend (базовая проверка)
   * Основная проверка должна происходить на backend
   */
  validateInitData(initData) {
    if (!initData || typeof initData !== 'string') {
      return false
    }

    // Проверяем наличие обязательных параметров
    const urlParams = new URLSearchParams(initData)
    const requiredParams = ['hash', 'user']
    
    for (const param of requiredParams) {
      if (!urlParams.has(param)) {
        console.warn(`Отсутствует обязательный параметр: ${param}`)
        return false
      }
    }

    // Проверяем валидность JSON пользователя
    try {
      const userParam = urlParams.get('user')
      const userData = JSON.parse(decodeURIComponent(userParam))
      
      if (!userData.id || !userData.first_name) {
        console.warn('Недостаточно данных пользователя')
        return false
      }
      
      return true
    } catch (error) {
      console.error('Ошибка валидации user данных:', error)
      return false
    }
  }

  /**
   * Применяет тему для job board приложения
   */
  applyTheme() {
    if (!this.webApp) return

    try {
      // Устанавливаем цвета темы
      this.webApp.setHeaderColor('#1a1a2e')
      this.webApp.setBackgroundColor('#16213e')
      
      // Расширяем приложение на полный экран
      if (this.webApp.expand) {
        this.webApp.expand()
      }

      // Включаем кнопку закрытия
      if (this.webApp.enableClosingConfirmation) {
        this.webApp.enableClosingConfirmation()
      }

      console.log('✅ Тема Telegram Web App применена')
    } catch (error) {
      console.error('Ошибка применения темы:', error)
    }
  }

  /**
   * Показывает уведомление пользователю
   */
  showAlert(message) {
    if (this.webApp && this.webApp.showAlert) {
      this.webApp.showAlert(message)
    } else {
      alert(message)
    }
  }

  /**
   * Показывает подтверждение пользователю
   */
  showConfirm(message, callback) {
    if (this.webApp && this.webApp.showConfirm) {
      this.webApp.showConfirm(message, callback)
    } else {
      const result = confirm(message)
      if (callback) callback(result)
    }
  }

  /**
   * Вибрация (haptic feedback)
   */
  haptic(type = 'light') {
    if (this.webApp?.HapticFeedback) {
      switch (type) {
        case 'light':
          this.webApp.HapticFeedback.impactOccurred('light')
          break
        case 'medium':
          this.webApp.HapticFeedback.impactOccurred('medium')
          break
        case 'heavy':
          this.webApp.HapticFeedback.impactOccurred('heavy')
          break
        case 'error':
          this.webApp.HapticFeedback.notificationOccurred('error')
          break
        case 'success':
          this.webApp.HapticFeedback.notificationOccurred('success')
          break
        case 'warning':
          this.webApp.HapticFeedback.notificationOccurred('warning')
          break
      }
    }
  }

  /**
   * Отправляет данные боту (если настроена кнопка)
   */
  sendData(data) {
    if (this.webApp && this.webApp.sendData) {
      this.webApp.sendData(JSON.stringify(data))
    }
  }

  /**
   * Закрывает Web App
   */
  close() {
    if (this.webApp && this.webApp.close) {
      this.webApp.close()
    }
  }

  /**
   * Готовность Web App
   */
  ready() {
    if (this.webApp && this.webApp.ready) {
      this.webApp.ready()
    }
  }
}

// Создаем единственный экземпляр
const telegramAuth = new TelegramWebAppAuth()

// Инициализируем при загрузке
if (telegramAuth.isAvailable()) {
  telegramAuth.ready()
  telegramAuth.applyTheme()
  console.log('✅ Telegram Web App авторизация инициализирована')
}

export default telegramAuth
