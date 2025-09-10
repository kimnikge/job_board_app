<template>
  <div class="privacy-settings">
    <div class="settings-header">
      <button @click="goBack" class="back-btn">← Назад</button>
      <h1>🔒 Настройки приватности</h1>
      <p>Управление конфиденциальностью ваших данных</p>
    </div>

    <div class="settings-content">
      <!-- Видимость профиля -->
      <div class="settings-section">
        <div class="section-header">
          <h2>👁️ Видимость профиля</h2>
          <p>Кто может видеть ваш профиль и контактную информацию</p>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>Публичность профиля</h3>
            <p>Определяет, кто может просматривать ваш профиль</p>
          </div>
          <select v-model="settings.profileVisibility" @change="saveSettings" class="setting-select">
            <option value="public">Публичный - все пользователи</option>
            <option value="employers">Только работодатели</option>
            <option value="private">Приватный - только я</option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>Показывать контактные данные</h3>
            <p>Видимость телефона и email для работодателей</p>
          </div>
          <div class="toggle-switch">
            <input 
              id="showContacts"
              type="checkbox" 
              v-model="settings.showContacts" 
              @change="saveSettings"
            />
            <label for="showContacts" class="toggle-label"></label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>Показывать статус онлайн</h3>
            <p>Отображать время последней активности</p>
          </div>
          <div class="toggle-switch">
            <input 
              id="showOnlineStatus"
              type="checkbox" 
              v-model="settings.showOnlineStatus" 
              @change="saveSettings"
            />
            <label for="showOnlineStatus" class="toggle-label"></label>
          </div>
        </div>
      </div>

      <!-- Поиск работы -->
      <div class="settings-section" v-if="userType === 'candidate'">
        <div class="section-header">
          <h2>🔍 Поиск работы</h2>
          <p>Как работодатели могут находить вас</p>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>Открыт к предложениям</h3>
            <p>Показывать работодателям, что вы ищете работу</p>
          </div>
          <div class="toggle-switch">
            <input 
              id="openToOffers"
              type="checkbox" 
              v-model="settings.openToOffers" 
              @change="saveSettings"
            />
            <label for="openToOffers" class="toggle-label"></label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>Участвовать в подборках</h3>
            <p>Появляться в рекомендациях для работодателей</p>
          </div>
          <div class="toggle-switch">
            <input 
              id="allowRecommendations"
              type="checkbox" 
              v-model="settings.allowRecommendations" 
              @change="saveSettings"
            />
            <label for="allowRecommendations" class="toggle-label"></label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>Скрывать от текущего работодателя</h3>
            <p>Не показывать профиль указанным компаниям</p>
          </div>
          <div class="blocked-companies">
            <div class="company-input">
              <input 
                v-model="newBlockedCompany"
                placeholder="Название компании"
                class="form-input"
                @keyup.enter="addBlockedCompany"
              />
              <button @click="addBlockedCompany" class="add-btn">Добавить</button>
            </div>
            <div v-if="settings.blockedCompanies.length > 0" class="blocked-list">
              <div 
                v-for="(company, index) in settings.blockedCompanies" 
                :key="index"
                class="blocked-company"
              >
                <span>{{ company }}</span>
                <button @click="removeBlockedCompany(index)" class="remove-btn">×</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Данные и аналитика -->
      <div class="settings-section">
        <div class="section-header">
          <h2>📊 Данные и аналитика</h2>
          <p>Использование ваших данных для улучшения сервиса</p>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>Персонализация рекомендаций</h3>
            <p>Использовать историю просмотров для улучшения подборок</p>
          </div>
          <div class="toggle-switch">
            <input 
              id="allowPersonalization"
              type="checkbox" 
              v-model="settings.allowPersonalization" 
              @change="saveSettings"
            />
            <label for="allowPersonalization" class="toggle-label"></label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>Аналитика использования</h3>
            <p>Сбор анонимных данных для улучшения платформы</p>
          </div>
          <div class="toggle-switch">
            <input 
              id="allowAnalytics"
              type="checkbox" 
              v-model="settings.allowAnalytics" 
              @change="saveSettings"
            />
            <label for="allowAnalytics" class="toggle-label"></label>
          </div>
        </div>
      </div>

      <!-- Безопасность -->
      <div class="settings-section">
        <div class="section-header">
          <h2>🛡️ Безопасность</h2>
          <p>Защита вашего аккаунта</p>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <h3>Двухфакторная аутентификация</h3>
            <p>Дополнительная защита через Telegram</p>
          </div>
          <div class="toggle-switch">
            <input 
              id="twoFactorAuth"
              type="checkbox" 
              v-model="settings.twoFactorAuth" 
              @change="saveSettings"
            />
            <label for="twoFactorAuth" class="toggle-label"></label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>Уведомления о входе</h3>
            <p>Получать уведомления о новых входах в аккаунт</p>
          </div>
          <div class="toggle-switch">
            <input 
              id="loginNotifications"
              type="checkbox" 
              v-model="settings.loginNotifications" 
              @change="saveSettings"
            />
            <label for="loginNotifications" class="toggle-label"></label>
          </div>
        </div>
      </div>

      <!-- Удаление данных -->
      <div class="settings-section danger-section">
        <div class="section-header">
          <h2>🗑️ Управление данными</h2>
          <p>Экспорт и удаление ваших данных</p>
        </div>
        
        <div class="danger-actions">
          <button @click="exportData" class="btn-secondary">
            📥 Экспорт данных
          </button>
          
          <button @click="showDeleteConfirm = true" class="btn-danger">
            🗑️ Удалить аккаунт
          </button>
        </div>
      </div>
    </div>

    <!-- Диалог подтверждения удаления -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="modal-content" @click.stop>
        <h3>⚠️ Удаление аккаунта</h3>
        <p>Это действие нельзя отменить. Все ваши данные будут удалены навсегда.</p>
        
        <div class="confirm-input">
          <label for="deleteConfirm">Введите "УДАЛИТЬ" для подтверждения:</label>
          <input 
            id="deleteConfirm"
            v-model="deleteConfirmText"
            type="text"
            class="form-input"
            placeholder="УДАЛИТЬ"
          />
        </div>
        
        <div class="modal-actions">
          <button @click="showDeleteConfirm = false" class="btn-secondary">
            Отмена
          </button>
          <button 
            @click="deleteAccount" 
            :disabled="deleteConfirmText !== 'УДАЛИТЬ'"
            class="btn-danger"
          >
            Удалить аккаунт
          </button>
        </div>
      </div>
    </div>

    <!-- Индикатор сохранения -->
    <div v-if="isSaving" class="saving-indicator">
      💾 Сохранение...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()

// Реактивные данные
const settings = ref({
  profileVisibility: 'public',
  showContacts: true,
  showOnlineStatus: true,
  openToOffers: true,
  allowRecommendations: true,
  blockedCompanies: [],
  allowPersonalization: true,
  allowAnalytics: true,
  twoFactorAuth: false,
  loginNotifications: true
})

const newBlockedCompany = ref('')
const showDeleteConfirm = ref(false)
const deleteConfirmText = ref('')
const isSaving = ref(false)

// Вычисляемые свойства
const userType = computed(() => authStore.user?.user_metadata?.user_type)

// Загрузка настроек
onMounted(async () => {
  try {
    await loadPrivacySettings()
  } catch (error) {
    console.error('Ошибка загрузки настроек приватности:', error)
  }
})

// Методы
const loadPrivacySettings = async () => {
  try {
    const savedSettings = await profileStore.getPrivacySettings()
    if (savedSettings) {
      settings.value = { ...settings.value, ...savedSettings }
    }
  } catch (error) {
    console.error('Ошибка загрузки настроек:', error)
  }
}

const saveSettings = async () => {
  isSaving.value = true
  try {
    await profileStore.updatePrivacySettings(settings.value)
    // Можно показать уведомление об успешном сохранении
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error)
    // Показать ошибку пользователю
  } finally {
    isSaving.value = false
  }
}

const addBlockedCompany = () => {
  if (newBlockedCompany.value.trim()) {
    settings.value.blockedCompanies.push(newBlockedCompany.value.trim())
    newBlockedCompany.value = ''
    saveSettings()
  }
}

const removeBlockedCompany = (index) => {
  settings.value.blockedCompanies.splice(index, 1)
  saveSettings()
}

const exportData = async () => {
  try {
    const userData = await profileStore.exportUserData()
    
    // Создаем и скачиваем JSON файл
    const dataStr = JSON.stringify(userData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `shiftwork_data_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Ошибка экспорта данных:', error)
  }
}

const deleteAccount = async () => {
  if (deleteConfirmText.value !== 'УДАЛИТЬ') {
    return
  }
  
  try {
    await authStore.deleteAccount()
    router.push('/auth')
  } catch (error) {
    console.error('Ошибка удаления аккаунта:', error)
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.privacy-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.settings-header {
  margin-bottom: 40px;
}

.back-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  color: #2563eb;
}

.settings-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.settings-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.settings-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #e3e8ee;
}

.danger-section {
  border-color: #fecaca;
  background: #fef2f2;
}

.section-header h2 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header p {
  color: #6b7280;
  margin-bottom: 24px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.setting-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.setting-info {
  flex: 1;
  margin-right: 20px;
}

.setting-info h3 {
  color: #374151;
  margin-bottom: 4px;
  font-size: 1rem;
}

.setting-info p {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.setting-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;
}

.toggle-switch {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-switch input[type="checkbox"] {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background-color: #cbd5e1;
  border-radius: 24px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.toggle-label::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

input[type="checkbox"]:checked + .toggle-label {
  background-color: #3b82f6;
}

input[type="checkbox"]:checked + .toggle-label::after {
  transform: translateX(26px);
}

.blocked-companies {
  width: 100%;
}

.company-input {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.form-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.add-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.add-btn:hover {
  background: #2563eb;
}

.blocked-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.blocked-company {
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-btn {
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.danger-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.btn-secondary,
.btn-danger {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-danger:disabled {
  background: #9ca3af;
  cursor: not-allowed;
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
  padding: 30px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  color: #dc2626;
  margin-bottom: 15px;
}

.confirm-input {
  margin: 20px 0;
}

.confirm-input label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

.saving-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #3b82f6;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

@media (max-width: 768px) {
  .privacy-settings {
    padding: 15px;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .setting-info {
    margin-right: 0;
  }
  
  .setting-select {
    min-width: 100%;
  }
  
  .company-input {
    flex-direction: column;
  }
  
  .danger-actions {
    flex-direction: column;
  }
}
</style>
