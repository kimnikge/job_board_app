<template>
  <div class="admin-monetization">
    <!-- Заголовок -->
    <div class="page-header">
      <h1 class="text-2xl font-bold mb-2">💰 Управление монетизацией</h1>
      <p class="text-gray-600">Настройка платежной системы и тарифных планов по городам</p>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else class="space-y-6">
      <!-- Общие настройки -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">🎛️ Системные настройки</h2>
        
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Включение/выключение платежей -->
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 class="font-medium">Система оплаты</h3>
                <p class="text-sm text-gray-600">Включить монетизацию платформы</p>
              </div>
              <button 
                @click="togglePaymentSystem"
                :disabled="updatingSettings"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  settings.payment_system_enabled ? 'bg-blue-600' : 'bg-gray-200'
                ]"
              >
                <span :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settings.payment_system_enabled ? 'translate-x-6' : 'translate-x-1'
                ]"></span>
              </button>
            </div>

            <!-- Статус системы -->
            <div class="p-3 rounded-lg" :class="settings.payment_system_enabled ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'">
              <div class="flex items-center">
                <span v-if="settings.payment_system_enabled" class="text-green-600">✅ Монетизация включена</span>
                <span v-else class="text-yellow-600">⚠️ Бесплатный режим</span>
              </div>
              <p class="text-xs mt-1" :class="settings.payment_system_enabled ? 'text-green-600' : 'text-yellow-600'">
                {{ settings.payment_system_enabled ? 'Компании платят за размещение вакансий' : 'Все функции бесплатны для всех пользователей' }}
              </p>
            </div>
          </div>

          <!-- Статистика -->
          <div class="space-y-4">
            <h3 class="font-medium">📊 Текущая статистика</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ stats.totalActiveSubscriptions }}</div>
                <div class="text-sm text-blue-600">Активных подписок</div>
              </div>
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ monetizationService.formatPrice(stats.totalRevenue) }}</div>
                <div class="text-sm text-green-600">Общий доход</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Тарифные планы по городам -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">🏙️ Тарифные планы по городам</h2>
        
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b">
                <th class="text-left p-3 font-medium">Город</th>
                <th class="text-left p-3 font-medium">Обычная вакансия</th>
                <th class="text-left p-3 font-medium">Срочная вакансия</th>
                <th class="text-left p-3 font-medium">Премиум размещение</th>
                <th class="text-left p-3 font-medium">Топ размещение</th>
                <th class="text-center p-3 font-medium">Статус</th>
                <th class="text-center p-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="plan in pricingPlans" :key="plan.city_name" class="border-b hover:bg-gray-50">
                <td class="p-3 font-medium">{{ plan.city_name }}</td>
                <td class="p-3">
                  <input 
                    v-if="editingPlan === plan.city_name"
                    v-model.number="editForm.regular_job_price"
                    type="number"
                    min="0"
                    step="100"
                    class="w-20 px-2 py-1 border rounded text-sm"
                  >
                  <span v-else>{{ monetizationService.formatPrice(plan.regular_job_price) }}</span>
                </td>
                <td class="p-3">
                  <input 
                    v-if="editingPlan === plan.city_name"
                    v-model.number="editForm.urgent_job_price"
                    type="number"
                    min="0"
                    step="100"
                    class="w-20 px-2 py-1 border rounded text-sm"
                  >
                  <span v-else>{{ monetizationService.formatPrice(plan.urgent_job_price) }}</span>
                </td>
                <td class="p-3">
                  <input 
                    v-if="editingPlan === plan.city_name"
                    v-model.number="editForm.featured_job_price"
                    type="number"
                    min="0"
                    step="100"
                    class="w-20 px-2 py-1 border rounded text-sm"
                  >
                  <span v-else>{{ monetizationService.formatPrice(plan.featured_job_price) }}</span>
                </td>
                <td class="p-3">
                  <input 
                    v-if="editingPlan === plan.city_name"
                    v-model.number="editForm.top_placement_price"
                    type="number"
                    min="0"
                    step="100"
                    class="w-20 px-2 py-1 border rounded text-sm"
                  >
                  <span v-else>{{ monetizationService.formatPrice(plan.top_placement_price) }}</span>
                </td>
                <td class="p-3 text-center">
                  <div v-if="editingPlan === plan.city_name" class="flex items-center justify-center">
                    <input 
                      v-model="editForm.is_active"
                      type="checkbox"
                      class="rounded border-gray-300"
                    >
                  </div>
                  <span v-else-if="plan.is_active" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Активен
                  </span>
                  <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Отключен
                  </span>
                </td>
                <td class="p-3 text-center">
                  <div v-if="editingPlan === plan.city_name" class="flex gap-2 justify-center">
                    <button 
                      @click="savePricingPlan(plan.city_name)"
                      :disabled="savingPlan"
                      class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      {{ savingPlan ? 'Сохранение...' : 'Сохранить' }}
                    </button>
                    <button 
                      @click="cancelEdit"
                      class="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                    >
                      Отмена
                    </button>
                  </div>
                  <button v-else 
                    @click="startEdit(plan)"
                    class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Редактировать
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Справка -->
        <div class="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 class="font-medium text-blue-800 mb-2">ℹ️ Справка по настройкам</h4>
          <ul class="text-sm text-blue-700 space-y-1">
            <li><strong>Обычная вакансия:</strong> Стандартное размещение на 30 дней</li>
            <li><strong>Срочная вакансия:</strong> Приоритетное размещение на 24 часа с уведомлениями</li>
            <li><strong>Премиум размещение:</strong> Выделение цветом и повышение в поиске</li>
            <li><strong>Топ размещение:</strong> Закрепление в топе списка вакансий</li>
            <li>Установите цены в 0 для бесплатного доступа к функциям</li>
          </ul>
        </div>
      </div>

      <!-- Подписки компаний -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">🏢 Активные подписки</h2>
        
        <div class="grid md:grid-cols-3 gap-4 mb-6">
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ stats.subscriptionsByType.free || 0 }}</div>
            <div class="text-sm text-green-600">Бесплатные</div>
          </div>
          <div class="text-center p-4 bg-yellow-50 rounded-lg">
            <div class="text-2xl font-bold text-yellow-600">{{ stats.subscriptionsByType.basic || 0 }}</div>
            <div class="text-sm text-yellow-600">Базовые</div>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">{{ stats.subscriptionsByType.premium || 0 }}</div>
            <div class="text-sm text-purple-600">Премиум</div>
          </div>
        </div>

        <p class="text-sm text-gray-600">
          {{ settings.payment_system_enabled ? 'После включения монетизации новые компании будут переведены на платные тарифы' : 'Все компании пользуются бесплатными тарифами' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { monetizationService } from '../services/monetization.service.js'

// Состояние
const loading = ref(true)
const updatingSettings = ref(false)
const savingPlan = ref(false)
const settings = ref({})
const pricingPlans = ref([])
const stats = ref({})

// Редактирование тарифного плана
const editingPlan = ref(null)
const editForm = ref({})

// Загрузка данных при монтировании
onMounted(async () => {
  await loadData()
})

// Загрузить все данные
async function loadData() {
  try {
    loading.value = true
    
    const [settingsData, plansData, statsData] = await Promise.all([
      monetizationService.getMonetizationSettings(),
      monetizationService.getPricingPlans(),
      monetizationService.getMonetizationStats()
    ])

    settings.value = settingsData
    pricingPlans.value = plansData
    stats.value = statsData
  } catch (error) {
    console.error('Error loading monetization data:', error)
    // В случае ошибки показываем демо-данные
    settings.value = { payment_system_enabled: false }
    pricingPlans.value = []
    stats.value = { totalActiveSubscriptions: 0, subscriptionsByType: {}, totalRevenue: 0 }
  } finally {
    loading.value = false
  }
}

// Включить/выключить систему оплаты
async function togglePaymentSystem() {
  try {
    updatingSettings.value = true
    const newState = !settings.value.payment_system_enabled
    
    await monetizationService.togglePaymentSystem(newState)
    settings.value.payment_system_enabled = newState
    
    // Перезагружаем статистику
    stats.value = await monetizationService.getMonetizationStats()
  } catch (error) {
    console.error('Error toggling payment system:', error)
    alert('Ошибка при изменении настроек. Попробуйте еще раз.')
  } finally {
    updatingSettings.value = false
  }
}

// Начать редактирование тарифного плана
function startEdit(plan) {
  editingPlan.value = plan.city_name
  editForm.value = {
    regular_job_price: plan.regular_job_price,
    urgent_job_price: plan.urgent_job_price,
    featured_job_price: plan.featured_job_price,
    top_placement_price: plan.top_placement_price,
    is_active: plan.is_active
  }
}

// Отменить редактирование
function cancelEdit() {
  editingPlan.value = null
  editForm.value = {}
}

// Сохранить тарифный план
async function savePricingPlan(cityName) {
  try {
    savingPlan.value = true
    
    await monetizationService.updatePricingPlan(cityName, editForm.value)
    
    // Обновляем локальные данные
    const planIndex = pricingPlans.value.findIndex(p => p.city_name === cityName)
    if (planIndex !== -1) {
      pricingPlans.value[planIndex] = { 
        ...pricingPlans.value[planIndex], 
        ...editForm.value 
      }
    }
    
    cancelEdit()
  } catch (error) {
    console.error('Error saving pricing plan:', error)
    alert('Ошибка при сохранении тарифного плана. Попробуйте еще раз.')
  } finally {
    savingPlan.value = false
  }
}
</script>

<style scoped>
.admin-monetization {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

/* Стили для таблицы */
table {
  font-size: 14px;
}

input[type="number"] {
  appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}

/* Анимации */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
