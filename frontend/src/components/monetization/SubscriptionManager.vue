<template>
  <div class="subscription-manager">
    <!-- Заголовок -->
    <div class="section-header mb-6">
      <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <span class="text-blue-600">💎</span>
        Подписка и тарифы
      </h2>
      <p class="text-gray-600 text-sm mt-1">
        Управление вашим тарифным планом и статистика использования
      </p>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="loading-state">
      <div class="animate-pulse">
        <div class="h-24 bg-gray-200 rounded-lg mb-4"></div>
        <div class="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    </div>

    <!-- Основной контент -->
    <div v-else class="space-y-6">
      
      <!-- Текущая подписка -->
      <div class="current-subscription">
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          
          <!-- Заголовок подписки -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-900">Текущий план</h3>
            <div v-if="subscription" 
                 class="status-badge px-3 py-1 rounded-full text-xs font-medium"
                 :class="getStatusClass(subscription.status)">
              {{ getStatusText(subscription.status) }}
            </div>
          </div>

          <!-- Информация о плане -->
          <div v-if="currentPlan" class="plan-info">
            <div class="flex items-start justify-between">
              <div>
                <h4 class="text-lg font-bold text-gray-900 mb-1">
                  {{ currentPlan.display_name }}
                </h4>
                <p class="text-gray-600 text-sm mb-3">
                  {{ currentPlan.description }}
                </p>
                
                <!-- Цена -->
                <div class="price text-2xl font-bold">
                  <span :class="currentPlan.price_monthly === 0 ? 'text-green-600' : 'text-gray-900'">
                    {{ formatPrice(currentPlan.price_monthly) }}
                  </span>
                  <span v-if="currentPlan.price_monthly > 0" class="text-sm text-gray-500 font-normal">
                    /месяц
                  </span>
                </div>
              </div>
              
              <!-- Действия -->
              <div class="actions">
                <button @click="showPricingModal = true"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Изменить план
                </button>
              </div>
            </div>

            <!-- Даты подписки -->
            <div v-if="subscription" class="subscription-dates mt-4 pt-4 border-t border-gray-100">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">Активирован:</span>
                  <span class="block font-medium">
                    {{ formatDate(subscription.started_at) }}
                  </span>
                </div>
                <div v-if="subscription.expires_at">
                  <span class="text-gray-500">Действует до:</span>
                  <span class="block font-medium">
                    {{ formatDate(subscription.expires_at) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Freemium уведомление -->
            <div v-if="isFreemiumMode" class="freemium-notice mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center gap-2">
                <span class="text-green-600">🎉</span>
                <span class="text-sm text-green-800 font-medium">
                  Бесплатный период! Все функции доступны без ограничений.
                </span>
              </div>
            </div>
          </div>

          <!-- Если нет подписки -->
          <div v-else class="no-subscription text-center py-8">
            <span class="text-4xl mb-3 block">📋</span>
            <h4 class="font-semibold text-gray-900 mb-2">Подписка не найдена</h4>
            <p class="text-gray-600 text-sm mb-4">
              Давайте назначим вам бесплатный план для начала
            </p>
            <button @click="assignFreePlan"
                    :disabled="loading"
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {{ loading ? 'Назначение...' : 'Получить бесплатный план' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Статистика использования -->
      <div v-if="currentPlan" class="usage-statistics">
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Статистика за месяц</h3>
          
          <!-- Загрузка статистики -->
          <div v-if="loadingStats" class="animate-pulse">
            <div class="grid grid-cols-3 gap-4">
              <div class="h-16 bg-gray-200 rounded"></div>
              <div class="h-16 bg-gray-200 rounded"></div>
              <div class="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>

          <!-- Статистика -->
          <div v-else class="stats-grid grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="stat-item bg-blue-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">
                {{ usageStats.job_post || 0 }}
              </div>
              <div class="text-sm text-blue-800">Обычных вакансий</div>
              <div v-if="!isFreemiumMode && currentPlan.max_job_postings !== 999999" 
                   class="text-xs text-blue-600 mt-1">
                из {{ currentPlan.max_job_postings }}
              </div>
            </div>

            <div class="stat-item bg-orange-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">
                {{ usageStats.urgent_post || 0 }}
              </div>
              <div class="text-sm text-orange-800">Срочных вакансий</div>
              <div v-if="!isFreemiumMode && currentPlan.max_urgent_postings !== 999999" 
                   class="text-xs text-orange-600 mt-1">
                из {{ currentPlan.max_urgent_postings }}
              </div>
            </div>

            <div class="stat-item bg-purple-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-purple-600">
                {{ usageStats.featured_post || 0 }}
              </div>
              <div class="text-sm text-purple-800">Премиум вакансий</div>
              <div v-if="!isFreemiumMode && currentPlan.max_featured_postings !== 999999" 
                   class="text-xs text-purple-600 mt-1">
                из {{ currentPlan.max_featured_postings }}
              </div>
            </div>
          </div>

          <!-- Безлимитное уведомление -->
          <div v-if="isFreemiumMode" class="unlimited-notice mt-4 p-3 bg-gray-50 rounded-lg text-center">
            <span class="text-sm text-gray-600">
              ∞ Сейчас все функции без ограничений
            </span>
          </div>
        </div>
      </div>

      <!-- Возможности плана -->
      <div v-if="currentPlan" class="plan-features">
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="font-semibold text-gray-900 mb-4">Возможности вашего плана</h3>
          
          <div class="features-list space-y-2">
            <div v-for="feature in formatPlanFeatures(currentPlan)" 
                 :key="feature"
                 class="flex items-center gap-2">
              <span class="text-green-500">✓</span>
              <span class="text-sm text-gray-700">{{ feature }}</span>
            </div>
          </div>

          <!-- Дополнительные возможности -->
          <div v-if="currentPlan.custom_badges || currentPlan.analytics_access || currentPlan.priority_support" 
               class="additional-features mt-4 pt-4 border-t border-gray-100">
            <h4 class="font-medium text-gray-900 mb-2 text-sm">Дополнительно:</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              <div v-if="currentPlan.custom_badges" class="flex items-center gap-1">
                <span class="text-blue-500">🏆</span>
                <span>Кастомные бейджи</span>
              </div>
              <div v-if="currentPlan.analytics_access" class="flex items-center gap-1">
                <span class="text-purple-500">📊</span>
                <span>Расширенная аналитика</span>
              </div>
              <div v-if="currentPlan.priority_support" class="flex items-center gap-1">
                <span class="text-green-500">🎧</span>
                <span>Приоритетная поддержка</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно с тарифами -->
    <div v-if="showPricingModal" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
         @click="showPricingModal = false">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold">Выберите тариф</h3>
            <button @click="showPricingModal = false" 
                    class="text-gray-400 hover:text-gray-600">
              <span class="text-2xl">&times;</span>
            </button>
          </div>
          
          <PricingPlans :show-current-plan="false" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSubscription } from '@/composables/useSubscription'
import { useNotifications } from '@/composables/useNotifications'
import PricingPlans from './PricingPlans.vue'

// Composables
const {
  subscription,
  currentPlan,
  usageStats,
  loading,
  fetchCompanySubscription,
  fetchUsageStats,
  assignFreePlan: assignFreePlanAction,
  formatPlanFeatures
} = useSubscription()

const { showNotification } = useNotifications()

// Local state
const showPricingModal = ref(false)
const loadingStats = ref(false)
const isFreemiumMode = ref(true) // TODO: получать из настроек

// Methods
function formatPrice(price) {
  if (price === 0) return 'Бесплатно'
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0
  }).format(price)
}

function formatDate(dateString) {
  if (!dateString) return 'Не указано'
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getStatusClass(status) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'expired':
      return 'bg-red-100 text-red-800'
    case 'paused':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
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

async function assignFreePlan() {
  try {
    await assignFreePlanAction()
    showNotification('Бесплатный план успешно назначен!', 'success')
  } catch (error) {
    showNotification('Ошибка при назначении плана', 'error')
    console.error('Error assigning free plan:', error)
  }
}

async function loadUsageStats() {
  try {
    loadingStats.value = true
    await fetchUsageStats()
  } catch (error) {
    console.error('Error loading usage stats:', error)
  } finally {
    loadingStats.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadUsageStats()
})
</script>

<style scoped>
.stat-item {
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.features-list {
  max-height: 200px;
  overflow-y: auto;
}

.loading-state {
  min-height: 200px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
