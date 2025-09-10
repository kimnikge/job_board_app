<template>
  <div class="settings-page">
    <div class="settings-header">
      <h1>⚙️ Настройки</h1>
      <p>Управление вашим аккаунтом и предпочтениями</p>
    </div>

    <div class="settings-content">
      <!-- Профиль -->
      <div class="settings-section">
        <div class="section-header">
          <h2>👤 Профиль</h2>
          <p>Управление личной информацией</p>
        </div>
        
        <div class="settings-items">
          <router-link to="/profile" class="settings-item">
            <div class="item-icon">📝</div>
            <div class="item-content">
              <h3>Редактировать профиль</h3>
              <p>Изменить личную информацию, фото, описание</p>
            </div>
            <div class="item-arrow">→</div>
          </router-link>
          
          <router-link v-if="userType === 'candidate'" to="/resume" class="settings-item">
            <div class="item-icon">📄</div>
            <div class="item-content">
              <h3>Моё резюме</h3>
              <p>Редактировать опыт работы и навыки</p>
            </div>
            <div class="item-arrow">→</div>
          </router-link>
          
          <router-link v-if="userType === 'employer'" to="/dashboard" class="settings-item">
            <div class="item-icon">🏢</div>
            <div class="item-content">
              <h3>Панель работодателя</h3>
              <p>Управление компанией и вакансиями</p>
            </div>
            <div class="item-arrow">→</div>
          </router-link>
        </div>
      </div>

      <!-- Уведомления -->
      <div class="settings-section">
        <div class="section-header">
          <h2>🔔 Уведомления</h2>
          <p>Настройка способов получения уведомлений</p>
        </div>
        
        <div class="settings-items">
          <router-link to="/settings/notifications" class="settings-item">
            <div class="item-icon">📱</div>
            <div class="item-content">
              <h3>Push-уведомления</h3>
              <p>Настройка браузерных уведомлений</p>
            </div>
            <div class="item-arrow">→</div>
          </router-link>
          
          <div class="settings-item">
            <div class="item-icon">📧</div>
            <div class="item-content">
              <h3>Email уведомления</h3>
              <p>Получать важные уведомления на почту</p>
              <span class="coming-soon">Скоро доступно</span>
            </div>
            <div class="item-toggle">
              <input type="checkbox" disabled />
            </div>
          </div>
          
          <div class="settings-item">
            <div class="item-icon">📲</div>
            <div class="item-content">
              <h3>Telegram уведомления</h3>
              <p>Получать уведомления в Telegram</p>
              <div class="notification-status">
                <span :class="['status-indicator', telegramNotifications ? 'active' : 'inactive']"></span>
                {{ telegramNotifications ? 'Подключено' : 'Не подключено' }}
              </div>
            </div>
            <div class="item-toggle">
              <input 
                type="checkbox" 
                v-model="telegramNotifications"
                @change="toggleTelegramNotifications"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Приватность -->
      <div class="settings-section">
        <div class="section-header">
          <h2>🔒 Приватность</h2>
          <p>Управление видимостью профиля и данных</p>
        </div>
        
        <div class="settings-items">
          <div class="settings-item">
            <div class="item-icon">👁️</div>
            <div class="item-content">
              <h3>Публичный профиль</h3>
              <p>Показывать профиль другим пользователям</p>
            </div>
            <div class="item-toggle">
              <input 
                type="checkbox" 
                v-model="privacySettings.publicProfile"
                @change="updatePrivacySettings"
              />
            </div>
          </div>
          
          <div v-if="userType === 'candidate'" class="settings-item">
            <div class="item-icon">📱</div>
            <div class="item-content">
              <h3>Показывать телефон</h3>
              <p>Отображать номер телефона в профиле</p>
            </div>
            <div class="item-toggle">
              <input 
                type="checkbox" 
                v-model="privacySettings.showPhone"
                @change="updatePrivacySettings"
              />
            </div>
          </div>
          
          <div class="settings-item">
            <div class="item-icon">📊</div>
            <div class="item-content">
              <h3>Аналитика использования</h3>
              <p>Помочь улучшить приложение анонимными данными</p>
            </div>
            <div class="item-toggle">
              <input 
                type="checkbox" 
                v-model="privacySettings.analytics"
                @change="updatePrivacySettings"
              />
            </div>
          </div>
          
          <router-link to="/settings/privacy" class="settings-item">
            <div class="item-icon">📋</div>
            <div class="item-content">
              <h3>Подробные настройки</h3>
              <p>Политика конфиденциальности и данные</p>
            </div>
            <div class="item-arrow">→</div>
          </router-link>
        </div>
      </div>

      <!-- Предпочтения -->
      <div class="settings-section">
        <div class="section-header">
          <h2>🎨 Предпочтения</h2>
          <p>Настройка интерфейса и поведения</p>
        </div>
        
        <div class="settings-items">
          <div class="settings-item">
            <div class="item-icon">🌙</div>
            <div class="item-content">
              <h3>Тёмная тема</h3>
              <p>Использовать тёмное оформление</p>
              <span class="coming-soon">Скоро доступно</span>
            </div>
            <div class="item-toggle">
              <input type="checkbox" disabled />
            </div>
          </div>
          
          <div class="settings-item">
            <div class="item-icon">🗣️</div>
            <div class="item-content">
              <h3>Язык интерфейса</h3>
              <p>Русский</p>
            </div>
            <div class="item-select">
              <select disabled>
                <option>Русский</option>
                <option>Қазақша</option>
                <option>English</option>
              </select>
            </div>
          </div>
          
          <div class="settings-item">
            <div class="item-icon">🔄</div>
            <div class="item-content">
              <h3>Автообновление вакансий</h3>
              <p>Обновлять список вакансий автоматически</p>
            </div>
            <div class="item-toggle">
              <input 
                type="checkbox" 
                v-model="preferences.autoRefresh"
                @change="updatePreferences"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Аккаунт -->
      <div class="settings-section">
        <div class="section-header">
          <h2>🏠 Аккаунт</h2>
          <p>Управление аккаунтом и безопасностью</p>
        </div>
        
        <div class="settings-items">
          <div class="settings-item">
            <div class="item-icon">👤</div>
            <div class="item-content">
              <h3>Тип аккаунта</h3>
              <p>{{ userTypeLabel }}</p>
            </div>
            <div class="item-badge">
              {{ userTypeBadge }}
            </div>
          </div>
          
          <div v-if="userType === 'candidate'" class="settings-item clickable" @click="switchToEmployer">
            <div class="item-icon">🏢</div>
            <div class="item-content">
              <h3>Стать работодателем</h3>
              <p>Переключиться на аккаунт работодателя</p>
            </div>
            <div class="item-arrow">→</div>
          </div>
          
          <div class="settings-item">
            <div class="item-icon">📊</div>
            <div class="item-content">
              <h3>Статистика</h3>
              <p>{{ stats.totalViews }} просмотров профиля</p>
            </div>
            <div class="item-arrow">→</div>
          </div>
          
          <div class="settings-item danger" @click="confirmLogout">
            <div class="item-icon">🚪</div>
            <div class="item-content">
              <h3>Выйти из аккаунта</h3>
              <p>Завершить текущую сессию</p>
            </div>
            <div class="item-arrow">→</div>
          </div>
        </div>
      </div>

      <!-- Информация -->
      <div class="settings-section">
        <div class="section-header">
          <h2>ℹ️ Информация</h2>
          <p>О приложении и поддержка</p>
        </div>
        
        <div class="settings-items">
          <router-link to="/help" class="settings-item">
            <div class="item-icon">❓</div>
            <div class="item-content">
              <h3>Справка и FAQ</h3>
              <p>Ответы на частые вопросы</p>
            </div>
            <div class="item-arrow">→</div>
          </router-link>
          
          <router-link to="/about" class="settings-item">
            <div class="item-icon">📱</div>
            <div class="item-content">
              <h3>О приложении</h3>
              <p>Информация о ShiftworkKZ</p>
            </div>
            <div class="item-arrow">→</div>
          </router-link>
          
          <div class="settings-item">
            <div class="item-icon">📧</div>
            <div class="item-content">
              <h3>Обратная связь</h3>
              <p>Отправить отзыв или предложение</p>
            </div>
            <div class="item-arrow">→</div>
          </div>
          
          <div class="settings-item">
            <div class="item-icon">🔄</div>
            <div class="item-content">
              <h3>Версия приложения</h3>
              <p>{{ appVersion }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно подтверждения выхода -->
    <div v-if="showLogoutModal" class="modal-overlay" @click="showLogoutModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>🚪 Выйти из аккаунта?</h3>
          <p>Вы уверены, что хотите завершить сессию?</p>
        </div>
        
        <div class="modal-actions">
          <button @click="showLogoutModal = false" class="modal-btn cancel">
            Отмена
          </button>
          <button @click="logout" class="modal-btn confirm" :disabled="isLoggingOut">
            <span v-if="isLoggingOut">⏳ Выход...</span>
            <span v-else>Выйти</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/services/supabase'

const router = useRouter()
const authStore = useAuthStore()

// Состояние
const telegramNotifications = ref(true)
const showLogoutModal = ref(false)
const isLoggingOut = ref(false)

const privacySettings = ref({
  publicProfile: true,
  showPhone: false,
  analytics: true
})

const preferences = ref({
  autoRefresh: true
})

const stats = ref({
  totalViews: 127,
  totalApplications: 5,
  totalBadges: 3
})

const appVersion = ref('1.0.0 Beta')

// Вычисляемые свойства
const userType = computed(() => authStore.user?.user_metadata?.user_type || 'candidate')

const userTypeLabel = computed(() => {
  switch (userType.value) {
    case 'employer':
      return 'Работодатель'
    case 'admin':
      return 'Администратор'
    case 'candidate':
    default:
      return 'Соискатель'
  }
})

const userTypeBadge = computed(() => {
  switch (userType.value) {
    case 'employer':
      return '🏢'
    case 'admin':
      return '⚙️'
    case 'candidate':
    default:
      return '👤'
  }
})

// Методы
const toggleTelegramNotifications = async () => {
  try {
    // TODO: Реализовать включение/выключение Telegram уведомлений
    console.log('Toggle Telegram notifications:', telegramNotifications.value)
  } catch (error) {
    console.error('Ошибка переключения Telegram уведомлений:', error)
    // Откатываем изменение
    telegramNotifications.value = !telegramNotifications.value
  }
}

const updatePrivacySettings = async () => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        privacy_settings: privacySettings.value,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', authStore.user.id)

    if (error) throw error
    
    console.log('Privacy settings updated')
  } catch (error) {
    console.error('Ошибка обновления настроек приватности:', error)
  }
}

const updatePreferences = async () => {
  try {
    // Сохраняем в localStorage для быстрого доступа
    localStorage.setItem('userPreferences', JSON.stringify(preferences.value))
    
    // Также сохраняем в БД
    const { error } = await supabase
      .from('profiles')
      .update({
        preferences: preferences.value,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', authStore.user.id)

    if (error) throw error
    
    console.log('Preferences updated')
  } catch (error) {
    console.error('Ошибка обновления предпочтений:', error)
  }
}

const switchToEmployer = () => {
  // Перенаправляем на страницу регистрации компании
  router.push('/company/register')
}

const confirmLogout = () => {
  showLogoutModal.value = true
}

const logout = async () => {
  isLoggingOut.value = true
  
  try {
    await authStore.logout()
    router.push('/auth')
  } catch (error) {
    console.error('Ошибка выхода:', error)
  } finally {
    isLoggingOut.value = false
    showLogoutModal.value = false
  }
}

const loadUserSettings = async () => {
  try {
    if (!authStore.user) return

    // Загружаем настройки из профиля
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('privacy_settings, preferences')
      .eq('user_id', authStore.user.id)
      .single()

    if (error) throw error

    if (profile.privacy_settings) {
      privacySettings.value = { ...privacySettings.value, ...profile.privacy_settings }
    }

    if (profile.preferences) {
      preferences.value = { ...preferences.value, ...profile.preferences }
    }

    // Загружаем из localStorage
    const savedPreferences = localStorage.getItem('userPreferences')
    if (savedPreferences) {
      preferences.value = { ...preferences.value, ...JSON.parse(savedPreferences) }
    }

  } catch (error) {
    console.error('Ошибка загрузки настроек:', error)
  }
}

onMounted(() => {
  loadUserSettings()
})
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

.settings-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
}

.settings-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.settings-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.settings-content {
  display: grid;
  gap: 25px;
}

.settings-section {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f1f3f4;
}

.section-header h2 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.section-header p {
  color: #666;
  font-size: 0.95rem;
}

.settings-items {
  display: grid;
  gap: 0;
}

.settings-item {
  display: flex;
  align-items: center;
  padding: 18px 0;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid #f1f3f4;
  transition: all 0.3s ease;
  cursor: pointer;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item:hover:not(.danger) {
  background: #f8f9fa;
  margin: 0 -25px;
  padding-left: 25px;
  padding-right: 25px;
}

.settings-item.danger {
  color: #dc3545;
}

.settings-item.danger:hover {
  background: #fff5f5;
  margin: 0 -25px;
  padding-left: 25px;
  padding-right: 25px;
}

.item-icon {
  font-size: 1.5rem;
  margin-right: 15px;
  width: 30px;
  text-align: center;
}

.item-content {
  flex: 1;
}

.item-content h3 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 3px;
  color: inherit;
}

.item-content p {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.coming-soon {
  display: inline-block;
  background: #ff6b35;
  color: white;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  margin-top: 5px;
}

.notification-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.active {
  background: #28a745;
  animation: pulse 2s infinite;
}

.status-indicator.inactive {
  background: #dc3545;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.item-arrow {
  font-size: 1.2rem;
  color: #666;
  margin-left: 10px;
}

.item-toggle {
  margin-left: 10px;
}

.item-toggle input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #667eea;
  cursor: pointer;
}

.item-toggle input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-select select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
}

.item-select select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-badge {
  font-size: 1.2rem;
  margin-left: 10px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal-header h3 {
  margin-bottom: 10px;
  color: #333;
}

.modal-header p {
  color: #666;
  margin-bottom: 25px;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.modal-btn {
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.modal-btn.cancel {
  background: #f8f9fa;
  color: #666;
  border: 2px solid #e9ecef;
}

.modal-btn.confirm {
  background: #dc3545;
  color: white;
}

.modal-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .settings-page {
    padding: 15px;
  }
  
  .settings-header {
    padding: 25px 15px;
  }
  
  .settings-section {
    padding: 20px;
  }
  
  .settings-item {
    padding: 15px 0;
  }
  
  .item-content h3 {
    font-size: 0.95rem;
  }
  
  .item-content p {
    font-size: 0.85rem;
  }
  
  .modal-content {
    padding: 25px 20px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-btn {
    width: 100%;
  }
}
</style>
