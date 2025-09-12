// Telegram Web App утилиты с официальным SDK
export const telegramWebApp = {
  // Проверка что мы в Telegram Web App
  isTelegramWebApp() {
    return !!(window.Telegram && window.Telegram.WebApp)
  },

  // Инициализация Telegram Web App с официальным SDK
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
      
      // Настраиваем цветовую схему для темной темы
      tg.setHeaderColor('#1a1a1a')
      tg.setBackgroundColor('#1a1a1a')
      
      // Настраиваем основные кнопки
      if (tg.MainButton) {
        tg.MainButton.hide() // Скрываем по умолчанию
      }
      
      if (tg.SecondaryButton) {
        tg.SecondaryButton.hide() // Скрываем по умолчанию
      }
      
      // Настраиваем кнопку "Назад"
      if (tg.BackButton) {
        tg.BackButton.hide() // Скрываем по умолчанию, будем показывать по необходимости
      }
      
      console.log('✅ Telegram Web App инициализирован с официальным SDK')
      console.log('📊 InitData:', tg.initData)
      console.log('👤 User:', tg.initDataUnsafe?.user)
      console.log('🎨 Theme params:', tg.themeParams)
      console.log('🔧 Platform:', tg.platform)
      console.log('📱 Version:', tg.version)
      
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

  // === КНОПКИ ===
  
  // Показать главную кнопку (для подачи заявок на вакансии)
  showMainButton(text, callback, params = {}) {
    if (!this.isTelegramWebApp()) return

    const tg = window.Telegram.WebApp
    if (!tg.MainButton) return
    
    // Настройка кнопки
    tg.MainButton.text = text
    tg.MainButton.color = params.color || tg.themeParams.button_color || '#2481cc'
    tg.MainButton.textColor = params.textColor || tg.themeParams.button_text_color || '#ffffff'
    
    // Убираем старые обработчики и добавляем новый
    tg.MainButton.offClick()
    tg.MainButton.onClick(callback)
    tg.MainButton.show()
    
    console.log('📲 MainButton показана:', text)
  },

  // Скрыть главную кнопку  
  hideMainButton() {
    if (!this.isTelegramWebApp()) return

    const tg = window.Telegram.WebApp
    if (tg.MainButton) {
      tg.MainButton.hide()
      tg.MainButton.offClick()
    }
  },

  // Показать вторичную кнопку (для дополнительных действий)
  showSecondaryButton(text, callback, params = {}) {
    if (!this.isTelegramWebApp()) return

    const tg = window.Telegram.WebApp
    if (!tg.SecondaryButton) return
    
    // Настройка вторичной кнопки
    tg.SecondaryButton.text = text
    tg.SecondaryButton.color = params.color || tg.themeParams.secondary_button_color || '#6c757d'
    tg.SecondaryButton.textColor = params.textColor || tg.themeParams.button_text_color || '#ffffff'
    tg.SecondaryButton.position = params.position || 'left'
    
    // Убираем старые обработчики и добавляем новый
    tg.SecondaryButton.offClick()
    tg.SecondaryButton.onClick(callback)
    tg.SecondaryButton.show()
    
    console.log('📲 SecondaryButton показана:', text)
  },

  // Скрыть вторичную кнопку
  hideSecondaryButton() {
    if (!this.isTelegramWebApp()) return

    const tg = window.Telegram.WebApp
    if (tg.SecondaryButton) {
      tg.SecondaryButton.hide()
      tg.SecondaryButton.offClick()
    }
  },

  // Показать кнопку "Назад"
  showBackButton(callback) {
    if (!this.isTelegramWebApp()) return

    const tg = window.Telegram.WebApp
    if (!tg.BackButton) return
    
    tg.BackButton.offClick()
    tg.BackButton.onClick(callback)
    tg.BackButton.show()
  },

  // Скрыть кнопку "Назад"
  hideBackButton() {
    if (!this.isTelegramWebApp()) return

    const tg = window.Telegram.WebApp
    if (tg.BackButton) {
      tg.BackButton.hide()
      tg.BackButton.offClick()
    }
  },

  // === УВЕДОМЛЕНИЯ ===
  
  // Показать уведомление
  showAlert(message) {
    if (!this.isTelegramWebApp()) {
      alert(message)
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      window.Telegram.WebApp.showAlert(message, resolve)
    })
  },

  // Подтверждение
  showConfirm(message) {
    if (!this.isTelegramWebApp()) {
      return Promise.resolve(confirm(message))
    }

    return new Promise((resolve) => {
      window.Telegram.WebApp.showConfirm(message, resolve)
    })
  },

  // Показать popup с кнопками
  showPopup(params) {
    if (!this.isTelegramWebApp()) {
      const result = confirm(params.message)
      return Promise.resolve(result ? 'ok' : 'cancel')
    }

    const tg = window.Telegram.WebApp
    if (!tg.showPopup) {
      // Fallback к showConfirm для старых версий
      return this.showConfirm(params.message).then(result => result ? 'ok' : 'cancel')
    }

    return new Promise((resolve) => {
      tg.showPopup({
        title: params.title || 'Подтверждение',
        message: params.message,
        buttons: params.buttons || [
          { id: 'cancel', type: 'cancel', text: 'Отмена' },
          { id: 'ok', type: 'ok', text: 'OK' }
        ]
      }, resolve)
    })
  },

  // === ТАКТИЛЬНАЯ ОБРАТНАЯ СВЯЗЬ ===
  
  // Вибрация для разных типов взаимодействий
  haptic(type = 'impact', style = 'medium') {
    if (!this.isTelegramWebApp()) return

    const tg = window.Telegram.WebApp
    if (!tg.HapticFeedback) return

    try {
      switch (type) {
        case 'impact':
          // Для нажатий кнопок
          tg.HapticFeedback.impactOccurred(style) // light, medium, heavy, rigid, soft
          break
        case 'notification':
          // Для уведомлений
          tg.HapticFeedback.notificationOccurred(style) // error, success, warning
          break
        case 'selection':
          // Для изменения выбора
          tg.HapticFeedback.selectionChanged()
          break
        default:
          tg.HapticFeedback.impactOccurred('medium')
      }
    } catch (error) {
      console.warn('⚠️ Haptic feedback не поддерживается:', error)
    }
  },

  // === НАВИГАЦИЯ И ЗАКРЫТИЕ ===
  
  // Закрыть Web App
  close() {
    if (!this.isTelegramWebApp()) {
      window.close()
      return
    }

    window.Telegram.WebApp.close()
  },

  // Открыть ссылку
  openLink(url, options = {}) {
    if (!this.isTelegramWebApp()) {
      window.open(url, '_blank')
      return
    }

    const tg = window.Telegram.WebApp
    if (options.tryInstantView && tg.openTelegramLink) {
      // Попробовать открыть в Instant View
      tg.openTelegramLink(url)
    } else if (tg.openLink) {
      // Открыть внешнюю ссылку
      tg.openLink(url)
    } else {
      // Fallback
      window.open(url, '_blank')
    }
  },

  // === ДОПОЛНИТЕЛЬНЫЕ ВОЗМОЖНОСТИ ===
  
  // Получить информацию о теме
  getThemeParams() {
    if (!this.isTelegramWebApp()) return {}
    
    return window.Telegram.WebApp.themeParams || {}
  },

  // Проверить доступность функций
  isFeatureAvailable(feature) {
    if (!this.isTelegramWebApp()) return false
    
    const tg = window.Telegram.WebApp
    
    const features = {
      mainButton: !!tg.MainButton,
      secondaryButton: !!tg.SecondaryButton,
      backButton: !!tg.BackButton,
      hapticFeedback: !!tg.HapticFeedback,
      popup: !!tg.showPopup,
      biometric: !!tg.BiometricManager,
      cloudStorage: !!tg.CloudStorage,
      settingsButton: !!tg.SettingsButton
    }
    
    return features[feature] || false
  },

  // Установить заголовок страницы в Telegram
  setHeaderTitle(title) {
    if (!this.isTelegramWebApp()) {
      document.title = title
      return
    }

    // В Web App заголовок управляется Telegram'ом
    console.log('📄 Заголовок для Web App:', title)
  },

  // === СПЕЦИАЛЬНЫЕ МЕТОДЫ ДЛЯ JOB BOARD ===
  
  // Настроить кнопки для подачи заявки на вакансию
  setupJobApplicationButtons(jobData, onApply, onSave) {
    if (!this.isTelegramWebApp()) return

    // Главная кнопка для подачи заявки
    this.showMainButton('📝 Подать заявку', () => {
      this.haptic('impact', 'light')
      onApply(jobData)
    }, {
      color: '#10b981' // Зеленый цвет для успешных действий
    })

    // Вторичная кнопка для сохранения вакансии
    if (onSave && this.isFeatureAvailable('secondaryButton')) {
      this.showSecondaryButton('💾 Сохранить', () => {
        this.haptic('selection')
        onSave(jobData)
      }, {
        color: '#6b7280' // Серый цвет для второстепенных действий
      })
    }
  },

  // Настроить кнопки для срочной вакансии
  setupUrgentJobButtons(jobData, onApply, onShare) {
    if (!this.isTelegramWebApp()) return

    // Главная кнопка с акцентом на срочность
    this.showMainButton('🚀 СРОЧНО ОТКЛИКНУТЬСЯ', () => {
      this.haptic('impact', 'heavy') // Более сильная вибрация для срочных вакансий
      onApply(jobData)
    }, {
      color: '#ef4444' // Красный цвет для срочных действий
    })

    // Вторичная кнопка для поделиться
    if (onShare && this.isFeatureAvailable('secondaryButton')) {
      this.showSecondaryButton('📤 Поделиться', () => {
        this.haptic('selection')
        onShare(jobData)
      })
    }
  },

  // Показать успешное уведомление о подаче заявки
  showJobApplicationSuccess(jobTitle) {
    this.haptic('notification', 'success')
    return this.showAlert(`✅ Заявка на вакансию "${jobTitle}" успешно отправлена!\n\nРаботодатель свяжется с вами в ближайшее время.`)
  },

  // Показать уведомление об ошибке
  showJobApplicationError(error) {
    this.haptic('notification', 'error')
    return this.showAlert(`❌ Не удалось отправить заявку.\n\nОшибка: ${error}\n\nПопробуйте еще раз.`)
  },

  // Показать подтверждение подачи заявки
  confirmJobApplication(jobTitle) {
    this.haptic('impact', 'light')
    return this.showConfirm(`Подать заявку на вакансию "${jobTitle}"?\n\nВаш профиль будет отправлен работодателю.`)
  },

  // Настроить навигацию для детального просмотра вакансии
  setupJobDetailNavigation(onBack, onAction) {
    if (!this.isTelegramWebApp()) return

    // Показать кнопку "Назад"
    this.showBackButton(() => {
      this.haptic('selection')
      onBack()
    })

    // Если есть дополнительное действие
    if (onAction) {
      onAction()
    }
  },

  // Скрыть все кнопки (для очистки интерфейса)
  clearAllButtons() {
    this.hideMainButton()
    this.hideSecondaryButton()
    this.hideBackButton()
  },

  // Настроить кнопки для списка вакансий
  setupJobListButtons(onFilter, onCreate) {
    if (!this.isTelegramWebApp()) return

    // Если пользователь может создавать вакансии
    if (onCreate) {
      this.showMainButton('➕ Создать вакансию', () => {
        this.haptic('impact', 'medium')
        onCreate()
      }, {
        color: '#3b82f6' // Синий цвет для создания
      })
    }

    // Вторичная кнопка для фильтров (если доступна)
    if (onFilter && this.isFeatureAvailable('secondaryButton')) {
      this.showSecondaryButton('🔍 Фильтры', () => {
        this.haptic('selection')
        onFilter()
      })
    }
  },

  // Уведомление о новой срочной вакансии
  showUrgentJobNotification(jobTitle, employer) {
    this.haptic('notification', 'warning')
    return this.showPopup({
      title: '🚨 Срочная вакансия!',
      message: `Новая срочная вакансия от ${employer}:\n\n"${jobTitle}"\n\nХотите посмотреть детали?`,
      buttons: [
        { id: 'cancel', type: 'cancel', text: 'Позже' },
        { id: 'view', type: 'default', text: '👀 Посмотреть' }
      ]
    })
  },

  // Настройка цветовой схемы под тему приложения
  applyJobBoardTheme() {
    if (!this.isTelegramWebApp()) return

    const tg = window.Telegram.WebApp
    const themeParams = tg.themeParams

    // Применяем темную тему для job board
    const isDark = themeParams.bg_color ? 
      this.isColorDark(themeParams.bg_color) : true

    if (isDark) {
      tg.setHeaderColor('#1f2937')
      tg.setBackgroundColor('#111827')
    } else {
      tg.setHeaderColor('#f9fafb')
      tg.setBackgroundColor('#ffffff')
    }

    console.log('🎨 Применена тема Job Board:', isDark ? 'dark' : 'light')
  },

  // Утилита для определения темноты цвета
  isColorDark(hexColor) {
    if (!hexColor) return true
    
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // Формула яркости
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness < 128
  }
}
