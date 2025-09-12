// Telegram Web App утилиты
export const telegramWebApp = {
  // Проверка что мы в Telegram Web App
  isTelegramWebApp() {
    return !!(window.Telegram && window.Telegram.WebApp)
  },

  // Инициализация Telegram Web App
  init() {
    if (!this.isTelegramWebApp()) {
      console.log('📱 Не в Telegram Web App')
      return false
    }

    const tg = window.Telegram.WebApp
    
    try {
      // Инициализируем Web App
      tg.ready()
      tg.expand() // Разворачиваем на полный экран
      
      // Настраиваем внешний вид
      tg.setHeaderColor('#1a1a1a')
      tg.setBackgroundColor('#1a1a1a')
      
      console.log('✅ Telegram Web App инициализирован')
      console.log('📊 InitData:', tg.initData)
      console.log('👤 User:', tg.initDataUnsafe?.user)
      
      return true
    } catch (error) {
      console.error('❌ Ошибка инициализации Telegram Web App:', error)
      return false
    }
  },

  // Получение данных пользователя из initData
  getUserData() {
    if (!this.isTelegramWebApp()) return null

    const tg = window.Telegram.WebApp
    const user = tg.initDataUnsafe?.user

    if (!user) {
      console.warn('⚠️ Нет данных пользователя в initData')
      return null
    }

    // Преобразуем в формат для нашей авторизации
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      photo_url: user.photo_url,
      auth_date: Math.floor(Date.now() / 1000),
      hash: this.getInitDataHash()
    }
  },

  // Получение хеша из initData для валидации
  getInitDataHash() {
    if (!this.isTelegramWebApp()) return null
    
    const tg = window.Telegram.WebApp
    const initData = tg.initData
    
    if (!initData) return 'telegram_web_app_hash'
    
    // Извлекаем hash из initData
    const params = new URLSearchParams(initData)
    return params.get('hash') || 'telegram_web_app_no_hash'
  },

  // Показать главную кнопку
  showMainButton(text, callback) {
    if (!this.isTelegramWebApp()) return

    const tg = window.Telegram.WebApp
    tg.MainButton.text = text
    tg.MainButton.show()
    tg.MainButton.onClick(callback)
  },

  // Скрыть главную кнопку  
  hideMainButton() {
    if (!this.isTelegramWebApp()) return

    const tg = window.Telegram.WebApp
    tg.MainButton.hide()
  },

  // Показать уведомление
  showAlert(message) {
    if (!this.isTelegramWebApp()) {
      alert(message)
      return
    }

    window.Telegram.WebApp.showAlert(message)
  },

  // Подтверждение
  showConfirm(message) {
    if (!this.isTelegramWebApp()) {
      return confirm(message)
    }

    return new Promise((resolve) => {
      window.Telegram.WebApp.showConfirm(message, resolve)
    })
  },

  // Закрыть Web App
  close() {
    if (!this.isTelegramWebApp()) {
      window.close()
      return
    }

    window.Telegram.WebApp.close()
  },

  // Вибрация (если поддерживается)
  haptic(type = 'impact') {
    if (!this.isTelegramWebApp()) return

    const tg = window.Telegram.WebApp
    if (tg.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(type)
    }
  }
}
