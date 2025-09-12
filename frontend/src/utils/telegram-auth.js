// Telegram Web App SDK для правильной авторизации
// Основано на официальной документации: https://core.telegram.org/bots/webapps

export const telegramWebAppAuth = {
  // Проверка что мы в Telegram Web App
  isTelegramWebApp() {
    return !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData)
  },

  // Инициализация Web App
  init() {
    if (!this.isTelegramWebApp()) {
      console.log('📱 Не в Telegram Web App')
      return false
    }

    const tg = window.Telegram.WebApp
    
    try {
      // Готовим приложение
      tg.ready()
      tg.expand()
      
      // Настройки интерфейса
      tg.setHeaderColor('#1a1a1a')
      tg.setBackgroundColor('#1a1a1a')
      
      console.log('✅ Telegram Web App инициализирован')
      console.log('📊 InitData присутствует:', !!tg.initData)
      console.log('👤 Unsafe User:', tg.initDataUnsafe?.user)
      console.log('🔧 Platform:', tg.platform)
      console.log('📱 Version:', tg.version)
      
      return true
    } catch (error) {
      console.error('❌ Ошибка инициализации Telegram Web App:', error)
      return false
    }
  },

  // ПРАВИЛЬНОЕ получение данных для авторизации
  getAuthData() {
    if (!this.isTelegramWebApp()) {
      console.warn('⚠️ Не в Telegram Web App')
      return null
    }

    const tg = window.Telegram.WebApp
    
    // Проверяем наличие initData (это подписанные данные от Telegram)
    if (!tg.initData) {
      console.error('❌ Отсутствует initData - не можем авторизовать')
      return null
    }

    // Получаем пользователя из unsafe данных (для отображения)
    const user = tg.initDataUnsafe?.user
    
    if (!user) {
      console.error('❌ Отсутствуют данные пользователя')
      return null
    }

    // КЛЮЧЕВОЕ ОТЛИЧИЕ: отправляем initData как есть для валидации на backend
    return {
      // Данные пользователя для создания профиля
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      photo_url: user.photo_url,
      language_code: user.language_code,
      
      // КРИТИЧЕСКИ ВАЖНО: передаем initData для валидации
      initData: tg.initData,
      
      // Метаданные
      platform: tg.platform,
      version: tg.version,
      is_web_app: true,
      
      // Временная метка запроса
      auth_date: Math.floor(Date.now() / 1000)
    }
  },

  // Валидация что данные пришли от Telegram (на фронтенде - базовая)
  validateInitData() {
    const tg = window.Telegram.WebApp
    
    if (!tg.initData) {
      return { valid: false, reason: 'No initData' }
    }

    // Парсим initData
    const params = new URLSearchParams(tg.initData)
    const hash = params.get('hash')
    
    if (!hash) {
      return { valid: false, reason: 'No hash in initData' }
    }

    // Проверяем обязательные поля
    const authDate = params.get('auth_date')
    const user = params.get('user')
    
    if (!authDate || !user) {
      return { valid: false, reason: 'Missing required fields' }
    }

    // Проверяем что данные не старые (не более 24 часов)
    const currentTime = Math.floor(Date.now() / 1000)
    const timeDiff = currentTime - parseInt(authDate)
    
    if (timeDiff > 86400) { // 24 часа
      return { valid: false, reason: 'Data too old' }
    }

    return { 
      valid: true, 
      hash,
      authDate: parseInt(authDate),
      userData: JSON.parse(user),
      timeDiff
    }
  },

  // Получение информации о среде
  getEnvironmentInfo() {
    if (!this.isTelegramWebApp()) return null

    const tg = window.Telegram.WebApp
    
    return {
      platform: tg.platform,
      version: tg.version,
      colorScheme: tg.colorScheme,
      themeParams: tg.themeParams,
      isExpanded: tg.isExpanded,
      viewportHeight: tg.viewportHeight,
      viewportStableHeight: tg.viewportStableHeight,
      headerColor: tg.headerColor,
      backgroundColor: tg.backgroundColor,
      isClosingConfirmationEnabled: tg.isClosingConfirmationEnabled
    }
  },

  // Установка темы для HR платформы
  applyJobBoardTheme() {
    if (!this.isTelegramWebApp()) return

    const tg = window.Telegram.WebApp
    
    try {
      // Устанавливаем темные цвета для HR платформы
      tg.setHeaderColor('#2c3e50')
      tg.setBackgroundColor('#34495e')
      
      console.log('🎨 Применена тема Job Board')
    } catch (error) {
      console.error('❌ Ошибка применения темы:', error)
    }
  },

  // Показать главную кнопку
  showMainButton(text, callback) {
    if (!this.isTelegramWebApp()) return

    const tg = window.Telegram.WebApp
    
    if (tg.MainButton) {
      tg.MainButton.setText(text)
      tg.MainButton.show()
      tg.MainButton.onClick(callback)
    }
  },

  // Скрыть главную кнопку
  hideMainButton() {
    if (!this.isTelegramWebApp()) return

    const tg = window.Telegram.WebApp
    
    if (tg.MainButton) {
      tg.MainButton.hide()
    }
  },

  // Показать кнопку "Назад"
  showBackButton(callback) {
    if (!this.isTelegramWebApp()) return

    const tg = window.Telegram.WebApp
    
    if (tg.BackButton) {
      tg.BackButton.show()
      tg.BackButton.onClick(callback)
    }
  },

  // Закрыть Web App
  close() {
    if (!this.isTelegramWebApp()) return

    const tg = window.Telegram.WebApp
    tg.close()
  },

  // Показать всплывающее сообщение
  showAlert(message) {
    if (!this.isTelegramWebApp()) {
      alert(message)
      return
    }

    const tg = window.Telegram.WebApp
    tg.showAlert(message)
  },

  // Показать подтверждение
  showConfirm(message, callback) {
    if (!this.isTelegramWebApp()) {
      const result = confirm(message)
      callback(result)
      return
    }

    const tg = window.Telegram.WebApp
    tg.showConfirm(message, callback)
  },

  // Тактильная обратная связь
  haptic(type = 'light') {
    if (!this.isTelegramWebApp()) return

    const tg = window.Telegram.WebApp
    
    if (tg.HapticFeedback) {
      if (type === 'light') {
        tg.HapticFeedback.impactOccurred('light')
      } else if (type === 'medium') {
        tg.HapticFeedback.impactOccurred('medium')
      } else if (type === 'heavy') {
        tg.HapticFeedback.impactOccurred('heavy')
      } else if (type === 'error') {
        tg.HapticFeedback.notificationOccurred('error')
      } else if (type === 'success') {
        tg.HapticFeedback.notificationOccurred('success')
      } else if (type === 'warning') {
        tg.HapticFeedback.notificationOccurred('warning')
      }
    }
  }
}

console.log('📱 Telegram Web App Auth SDK загружен')
export { telegramWebAppAuth as telegramWebApp }
