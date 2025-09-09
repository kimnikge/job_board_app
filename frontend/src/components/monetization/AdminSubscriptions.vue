<template>
  <div class="admin-subscriptions">
    <!-- Заголовок -->
    <div class="header mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        Управление подписками
      </h1>
      <p class="text-gray-600">
        Администрирование тарифных планов и подписок компаний
      </p>
    </div>

    <!-- Контролы -->
    <div class="controls mb-6 space-y-4">
      
      <!-- Глобальные настройки -->
      <div class="settings-panel bg-white p-6 rounded-lg border border-gray-200">
        <h2 class="font-semibold text-gray-900 mb-4">Глобальные настройки</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="setting-item">
            <label class="flex items-center">
              <input type="checkbox" 
                     v-model="settings.freemiumMode"
                     @change="updateSettings"
                     class="mr-2">
              <span class="text-sm">Режим Freemium</span>
            </label>
            <p class="text-xs text-gray-500 mt-1">
              Все функции бесплатно для всех пользователей
            </p>
          </div>

          <div class="setting-item">
            <label class="flex items-center">
              <input type="checkbox" 
                     v-model="settings.paymentsEnabled"
                     @change="updateSettings"
                     class="mr-2">
              <span class="text-sm">Платежи включены</span>
            </label>
            <p class="text-xs text-gray-500 mt-1">
              Возможность оплачивать премиум планы
            </p>
          </div>

          <div class="setting-item">
            <label class="block text-sm text-gray-700 mb-1">
              План по умолчанию:
            </label>
            <select v-model="settings.defaultPlan" 
                    @change="updateSettings"
                    class="w-full px-3 py-1 border border-gray-300 rounded text-sm">
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Статистика -->
      <div class="stats-panel bg-white p-6 rounded-lg border border-gray-200">
        <h2 class="font-semibold text-gray-900 mb-4">Статистика</h2>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="stat-card bg-blue-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">
              {{ stats.totalCompanies || 0 }}
            </div>
            <div class="text-sm text-blue-800">Всего компаний</div>
          </div>

          <div class="stat-card bg-green-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-green-600">
              {{ stats.freeSubscriptions || 0 }}
            </div>
            <div class="text-sm text-green-800">Free планов</div>
          </div>

          <div class="stat-card bg-purple-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">
              {{ stats.paidSubscriptions || 0 }}
            </div>
            <div class="text-sm text-purple-800">Платных планов</div>
          </div>

          <div class="stat-card bg-orange-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-orange-600">
              {{ stats.monthlyRevenue || 0 }} ₸
            </div>
            <div class="text-sm text-orange-800">Доход/месяц</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="filters mb-4 bg-white p-4 rounded-lg border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm text-gray-700 mb-1">Поиск компании:</label>
          <input type="text" 
                 v-model="filters.search"
                 placeholder="Название компании..."
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
        </div>

        <div>
          <label class="block text-sm text-gray-700 mb-1">План:</label>
          <select v-model="filters.plan" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">Все планы</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        <div>
          <label class="block text-sm text-gray-700 mb-1">Статус:</label>
          <select v-model="filters.status" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">Все статусы</option>
            <option value="active">Активные</option>
            <option value="expired">Истёкшие</option>
            <option value="cancelled">Отменённые</option>
          </select>
        </div>

        <div class="flex items-end">
          <button @click="resetFilters"
                  class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm">
            Сбросить
          </button>
        </div>
      </div>
    </div>

    <!-- Таблица подписок -->
    <div class="subscriptions-table bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Компания
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                План
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Активирован
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Истекает
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="subscription in filteredSubscriptions" 
                :key="subscription.id"
                class="hover:bg-gray-50">
              
              <td class="px-4 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ subscription.company_name || 'Неизвестная компания' }}
                  </div>
                  <div class="text-sm text-gray-500">
                    ID: {{ subscription.company_id.substring(0, 8) }}...
                  </div>
                </div>
              </td>

              <td class="px-4 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <select v-model="subscription.current_plan"
                          @change="changePlan(subscription)"
                          :disabled="updating === subscription.id"
                          class="text-sm border border-gray-300 rounded px-2 py-1">
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </td>

              <td class="px-4 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full"
                      :class="getStatusClass(subscription.status)">
                  {{ getStatusText(subscription.status) }}
                </span>
              </td>

              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(subscription.started_at) }}
              </td>

              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ subscription.expires_at ? formatDate(subscription.expires_at) : 'Бессрочно' }}
              </td>

              <td class="px-4 py-4 whitespace-nowrap text-sm">
                <div class="flex space-x-2">
                  <button @click="toggleStatus(subscription)"
                          :disabled="updating === subscription.id"
                          class="text-blue-600 hover:text-blue-900">
                    {{ subscription.status === 'active' ? 'Приостановить' : 'Активировать' }}
                  </button>
                  
                  <button @click="viewUsage(subscription)"
                          class="text-green-600 hover:text-green-900">
                    Статистика
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Пагинация -->
      <div class="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Показано {{ filteredSubscriptions.length }} из {{ subscriptions.length }} подписок
          </div>
          <div>
            <!-- TODO: Добавить пагинацию -->
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно статистики -->
    <div v-if="showUsageModal" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
         @click="showUsageModal = false">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">
              Статистика: {{ selectedSubscription?.company_name }}
            </h3>
            <button @click="showUsageModal = false" 
                    class="text-gray-400 hover:text-gray-600">
              <span class="text-2xl">&times;</span>
            </button>
          </div>
          
          <div v-if="usageData" class="space-y-4">
            <div class="grid grid-cols-3 gap-4">
              <div class="bg-blue-50 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-blue-600">
                  {{ usageData.job_post || 0 }}
                </div>
                <div class="text-sm text-blue-800">Обычных вакансий</div>
              </div>
              <div class="bg-orange-50 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-orange-600">
                  {{ usageData.urgent_post || 0 }}
                </div>
                <div class="text-sm text-orange-800">Срочных вакансий</div>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-purple-600">
                  {{ usageData.featured_post || 0 }}
                </div>
                <div class="text-sm text-purple-800">Премиум вакансий</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupabase } from '@/lib/supabase'
import { useNotifications } from '@/composables/useNotifications'

const { supabase } = useSupabase()
const { showNotification } = useNotifications()

// State
const subscriptions = ref([])
const stats = ref({})
const loading = ref(false)
const updating = ref(null)
const showUsageModal = ref(false)
const selectedSubscription = ref(null)
const usageData = ref(null)

// Settings
const settings = ref({
  freemiumMode: true,
  paymentsEnabled: false,
  defaultPlan: 'free'
})

// Filters
const filters = ref({
  search: '',
  plan: '',
  status: ''
})

// Computed
const filteredSubscriptions = computed(() => {
  let filtered = subscriptions.value

  if (filters.value.search) {
    filtered = filtered.filter(sub => 
      sub.company_name?.toLowerCase().includes(filters.value.search.toLowerCase())
    )
  }

  if (filters.value.plan) {
    filtered = filtered.filter(sub => sub.current_plan === filters.value.plan)
  }

  if (filters.value.status) {
    filtered = filtered.filter(sub => sub.status === filters.value.status)
  }

  return filtered
})

// Methods
async function fetchSubscriptions() {
  try {
    loading.value = true

    const { data, error } = await supabase
      .from('company_subscriptions')
      .select(`
        *,
        companies!company_id(name),
        subscription_plans!plan_id(name, display_name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    subscriptions.value = data.map(sub => ({
      ...sub,
      company_name: sub.companies?.name,
      current_plan: sub.subscription_plans?.name || 'free'
    }))

  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    showNotification('Ошибка загрузки подписок', 'error')
  } finally {
    loading.value = false
  }
}

async function changePlan(subscription) {
  try {
    updating.value = subscription.id

    // Получаем ID нового плана
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('name', subscription.current_plan)
      .single()

    if (planError) throw planError

    // Обновляем подписку
    const { error: updateError } = await supabase
      .from('company_subscriptions')
      .update({
        plan_id: planData.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)

    if (updateError) throw updateError

    showNotification(`План изменён на ${subscription.current_plan}`, 'success')
    
  } catch (error) {
    console.error('Error changing plan:', error)
    showNotification('Ошибка изменения плана', 'error')
    await fetchSubscriptions() // Восстанавливаем данные
  } finally {
    updating.value = null
  }
}

async function toggleStatus(subscription) {
  try {
    updating.value = subscription.id
    
    const newStatus = subscription.status === 'active' ? 'paused' : 'active'
    
    const { error } = await supabase
      .from('company_subscriptions')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)

    if (error) throw error

    subscription.status = newStatus
    showNotification(`Подписка ${newStatus === 'active' ? 'активирована' : 'приостановлена'}`, 'success')
    
  } catch (error) {
    console.error('Error toggling status:', error)
    showNotification('Ошибка изменения статуса', 'error')
  } finally {
    updating.value = null
  }
}

async function viewUsage(subscription) {
  try {
    selectedSubscription.value = subscription
    showUsageModal.value = true

    // Загружаем статистику через Edge Function
    const { data, error } = await supabase.functions.invoke(
      'subscription-manager',
      {
        method: 'GET',
        body: new URLSearchParams({
          action: 'usage-stats',
          company_id: subscription.company_id
        })
      }
    )

    if (error) throw error
    
    usageData.value = data.stats || {}
    
  } catch (error) {
    console.error('Error fetching usage:', error)
    showNotification('Ошибка загрузки статистики', 'error')
  }
}

async function updateSettings() {
  try {
    // TODO: Сохранить настройки в базу данных
    showNotification('Настройки обновлены', 'success')
  } catch (error) {
    console.error('Error updating settings:', error)
    showNotification('Ошибка обновления настроек', 'error')
  }
}

function resetFilters() {
  filters.value = {
    search: '',
    plan: '',
    status: ''
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'expired': return 'bg-red-100 text-red-800'
    case 'paused': return 'bg-yellow-100 text-yellow-800'
    case 'cancelled': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getStatusText(status) {
  switch (status) {
    case 'active': return 'Активен'
    case 'expired': return 'Истёк'
    case 'paused': return 'Приостановлен'
    case 'cancelled': return 'Отменён'
    default: return status
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Не указано'
  return new Date(dateString).toLocaleDateString('ru-RU')
}

// Lifecycle
onMounted(() => {
  fetchSubscriptions()
})
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.table {
  min-width: 800px;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
