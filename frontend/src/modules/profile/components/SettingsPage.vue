<template>
  <div class="settings-page">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Настройки профиля</h1>

        <div class="bg-white rounded-lg shadow-lg p-6">
          <form @submit.prevent="saveSettings" class="space-y-6">
            <!-- Основная информация -->
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Основная информация</h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Имя
                  </label>
                  <input 
                    v-model="settings.firstName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Фамилия
                  </label>
                  <input 
                    v-model="settings.lastName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Email
                  </label>
                  <input 
                    v-model="settings.email"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Телефон
                  </label>
                  <input 
                    v-model="settings.phone"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                </div>
              </div>
            </div>

            <!-- Безопасность -->
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Безопасность</h2>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Текущий пароль
                  </label>
                  <input 
                    v-model="settings.currentPassword"
                    type="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Новый пароль
                  </label>
                  <input 
                    v-model="settings.newPassword"
                    type="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                </div>

                <div>
                  <label class="block text-gray-700 text-sm font-bold mb-2">
                    Подтверждение пароля
                  </label>
                  <input 
                    v-model="settings.confirmPassword"
                    type="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                </div>
              </div>
            </div>

            <!-- Уведомления -->
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Уведомления</h2>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-gray-900 font-medium">Email-уведомления</h3>
                    <p class="text-gray-600 text-sm">Получать уведомления на email</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      v-model="settings.emailNotifications"
                      type="checkbox"
                      class="sr-only peer"
                    >
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-gray-900 font-medium">SMS-уведомления</h3>
                    <p class="text-gray-600 text-sm">Получать уведомления по SMS</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                      v-model="settings.smsNotifications"
                      type="checkbox"
                      class="sr-only peer"
                    >
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Кнопки -->
            <div class="flex justify-end space-x-4">
              <button 
                type="button"
                @click="resetForm"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Сбросить
              </button>
              <button 
                type="submit"
                class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                :disabled="loading"
              >
                {{ loading ? 'Сохранение...' : 'Сохранить' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProfileStore } from '../store/profile'

const profileStore = useProfileStore()
const loading = ref(false)

const settings = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  emailNotifications: true,
  smsNotifications: false
})

onMounted(async () => {
  try {
    const profile = await profileStore.fetchProfile()
    settings.value = {
      ...settings.value,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      emailNotifications: profile.emailNotifications,
      smsNotifications: profile.smsNotifications
    }
  } catch (err) {
    console.error('Ошибка при загрузке профиля:', err)
  }
})

async function saveSettings() {
  if (settings.value.newPassword && settings.value.newPassword !== settings.value.confirmPassword) {
    alert('Пароли не совпадают')
    return
  }

  loading.value = true

  try {
    await profileStore.updateProfile({
      firstName: settings.value.firstName,
      lastName: settings.value.lastName,
      email: settings.value.email,
      phone: settings.value.phone,
      currentPassword: settings.value.currentPassword,
      newPassword: settings.value.newPassword,
      emailNotifications: settings.value.emailNotifications,
      smsNotifications: settings.value.smsNotifications
    })

    settings.value.currentPassword = ''
    settings.value.newPassword = ''
    settings.value.confirmPassword = ''
  } catch (err) {
    console.error('Ошибка при сохранении настроек:', err)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  settings.value = {
    ...settings.value,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}
</script> 