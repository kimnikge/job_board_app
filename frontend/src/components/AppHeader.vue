<template>
  <header class="app-header">
    <!-- Левая часть - Логотип -->
    <div class="header-logo">
      <router-link to="/" class="logo-link">
        <span class="logo-text">Shiftwork</span>
        <span class="beta-badge">BETA</span>
      </router-link>
    </div>
    
    <!-- Правая часть - Блок действий -->
    <div class="header-actions">
      <!-- Только для авторизованных пользователей -->
      <template v-if="isAuthenticated">
        <button class="btn-icon search-btn" @click="handleSearch">
          🔍
        </button>
        
        <button class="btn-icon notifications-btn" @click="handleNotifications">
          🔔
          <span v-if="hasNotifications" class="notification-indicator"></span>
        </button>
        
        <button class="btn-icon profile-btn" @click="goToProfile">
          <span v-if="user?.user_metadata?.telegram_photo_url" class="profile-avatar">
            <img :src="user.user_metadata.telegram_photo_url" :alt="userDisplayName" />
          </span>
          <span v-else class="profile-avatar-fallback">
            {{ userInitials }}
          </span>
        </button>
      </template>
      
      <!-- Для неавторизованных пользователей -->
      <template v-else>
        <!-- В Telegram Web App показываем индикатор загрузки -->
        <div v-if="isTelegramWebApp" class="auth-loading">
          <div class="loading-spinner"></div>
          <span>Авторизация...</span>
        </div>
        <!-- В обычном браузере показываем кнопку входа -->
        <button v-else class="login-btn" @click="handleTelegramLogin">
          Войти через Telegram
        </button>
      </template>
    </div>
  </header>
</template>

<script>
import { useNotificationsStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

export default {
  name: 'AppHeader',
  setup() {
    const notificationsStore = useNotificationsStore()
    const authStore = useAuthStore()
    const router = useRouter()
    
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const user = computed(() => authStore.user)
    const isTelegramWebApp = computed(() => window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData)
    
    const userDisplayName = computed(() => {
      if (!user.value?.user_metadata) return 'Пользователь'
      const meta = user.value.user_metadata
      return meta.full_name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || meta.telegram_username || 'Пользователь'
    })
    
    const userInitials = computed(() => {
      if (!user.value?.user_metadata) return 'П'
      const meta = user.value.user_metadata
      const name = meta.full_name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim()
      if (name) {
        const words = name.split(' ')
        return words.map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('')
      }
      return meta.telegram_username?.charAt(0).toUpperCase() || 'П'
    })
    
    const hasNotifications = computed(() => 
      notificationsStore.unreadCount > 0
    )
    
    const handleSearch = () => {
      // TODO: Реализовать поиск
      console.log('Search clicked')
    }
    
    const handleNotifications = () => {
      // TODO: Открыть панель уведомлений
      console.log('Notifications clicked')
    }
    
    const goToProfile = () => {
      router.push('/profile')
    }
    
    const handleTelegramLogin = async () => {
      console.log('🚀 Инициализация Telegram Login Widget')
      
      // Проверяем, загружен ли скрипт Telegram Widget
      if (!window.TelegramLoginWidget) {
        console.log('⏳ Загружаем Telegram Login Widget скрипт...')
        await loadTelegramScript()
        
        // Проверяем еще раз после загрузки
        if (!window.TelegramLoginWidget) {
          console.error('❌ Telegram Login Widget не загружен после попытки загрузки')
          // Fallback - используем альтернативный метод или перенаправляем
          router.push('/telegram-widget')
          return
        }
      }
      
      initTelegramWidget()
    }
    
    const loadTelegramScript = () => {
      return new Promise((resolve, reject) => {
        // Проверяем, не загружен ли уже скрипт
        if (document.querySelector('script[src*="telegram-widget.js"]')) {
          resolve(true)
          return
        }
        
        const script = document.createElement('script')
        script.src = 'https://telegram.org/js/telegram-widget.js?22'
        script.async = true
        
        script.onload = () => {
          console.log('✅ Telegram Widget скрипт загружен')
          // Небольшая задержка для инициализации
          setTimeout(resolve, 500)
        }
        
        script.onerror = () => {
          console.error('❌ Ошибка загрузки Telegram Widget скрипта')
          reject(new Error('Failed to load Telegram script'))
        }
        
        document.head.appendChild(script)
      })
    }
    
    const initTelegramWidget = () => {
      console.log('🔧 Создание Telegram Login Widget')
      
      // Для localhost перенаправляем на тестовую страницу
      if (window.location.hostname === 'localhost') {
        console.log('🔧 Localhost обнаружен, перенаправляем на тестовую страницу')
        router.push('/telegram-widget')
        return
      }
      
      // Создаем временный контейнер для виджета (только для продакшна)
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.top = '-9999px'
      container.style.left = '-9999px'
      document.body.appendChild(container)
      
      try {
        window.TelegramLoginWidget.create(container, {
          bot_id: import.meta.env.VITE_TELEGRAM_BOT_ID, // ID бота из env
          origin: 'https://horecapp.netlify.app', // Продакшн домен
          embed: 1,
          request_access: 'write',
          return_to: 'https://horecapp.netlify.app/auth/callback'
        }, (user) => {
          console.log('✅ Получены данные от Telegram Login Widget:', user)
          
          // Убираем временный контейнер
          document.body.removeChild(container)
          
          // Обрабатываем авторизацию
          handleTelegramCallback(user)
        })
        
        // Программно активируем виджет
        const iframe = container.querySelector('iframe')
        if (iframe) {
          iframe.style.display = 'block'
          iframe.click()
        }
        
      } catch (error) {
        console.error('❌ Ошибка создания Telegram Widget:', error)
        document.body.removeChild(container)
        router.push('/telegram-widget')
      }
    }
    
    const handleTelegramCallback = async (telegramUser) => {
      console.log('🔧 Обработка callback от Telegram:', telegramUser)
      
      try {
        const result = await authStore.loginWithTelegram(telegramUser)
        if (result.success) {
          console.log('✅ Авторизация успешна!')
          router.push('/') // Перенаправляем на главную
        } else {
          console.error('❌ Ошибка авторизации:', result.error)
        }
      } catch (error) {
        console.error('❌ Ошибка при авторизации:', error)
      }
    }
    
    return {
      isAuthenticated,
      user,
      isTelegramWebApp,
      userDisplayName,
      userInitials,
      hasNotifications,
      handleSearch,
      handleNotifications,
      goToProfile,
      handleTelegramLogin
    }
  }
}
</script>

<style scoped>
/* === HEADER СТИЛИ === */
.app-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  z-index: 100;
  height: var(--header-height, 60px);
}

.header-logo {
  flex-shrink: 0;
}

.logo-link {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
  position: relative;
  font-size: 1.5rem;
  font-weight: 800;
  text-decoration: none;
}

.logo-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.beta-badge {
  position: absolute;
  top: -8px;
  right: -20px;
  font-size: 0.6rem;
  font-weight: 700;
  color: #fff;
  background: #ef4444;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.btn-icon:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.notification-indicator {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
}

.profile-btn {
  padding: 0;
  overflow: hidden;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.login-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #0088cc;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background: #006699;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 136, 204, 0.3);
}

.auth-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  .app-header {
    padding: 0.75rem 1rem;
  }
  
  .logo-link {
    font-size: 1.25rem;
  }
  
  .beta-badge {
    font-size: 0.5rem;
    padding: 1px 4px;
    right: -15px;
    top: -6px;
  }
  
  .login-btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
  
  .header-actions {
    gap: 0.5rem;
  }
  
  .btn-icon {
    width: 36px;
    height: 36px;
  }
}
</style>
