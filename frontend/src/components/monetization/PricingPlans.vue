<template>
  <div class="pricing-plans">
    <!-- Заголовок с текущим статусом -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        Тарифные планы
      </h2>
      
      <!-- Текущий план -->
      <div v-if="currentPlan" class="current-plan-banner">
        <div class="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <span class="text-2xl">✨</span>
          <div class="flex-1">
            <h3 class="font-semibold text-blue-800">
              Текущий план: {{ currentPlan.display_name }}
            </h3>
            <p class="text-sm text-blue-700">
              {{ currentPlan.description }}
            </p>
          </div>
          <div v-if="subscription?.status" 
               class="px-3 py-1 rounded-full text-xs font-medium"
               :class="getStatusClass(subscription.status)">
            {{ getStatusText(subscription.status) }}
          </div>
        </div>
      </div>

      <!-- Freemium уведомление -->
      <div v-if="isFreemiumMode" class="freemium-banner mt-4">
        <div class="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <span class="text-2xl">🎉</span>
          <div>
            <h3 class="font-semibold text-green-800">Бесплатный период!</h3>
            <p class="text-sm text-green-700">
              Сейчас все функции доступны бесплатно. Пользуйтесь без ограничений!
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Сетка планов -->
    <div class="plans-grid grid gap-6 md:grid-cols-3">
      <div v-for="plan in plans" 
           :key="plan.id"
           class="plan-card relative"
           :class="getPlanCardClass(plan)">
        
        <!-- Бейдж "Текущий план" -->
        <div v-if="isCurrentPlan(plan)" 
             class="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            Текущий план
          </span>
        </div>

        <div class="p-6">
          <!-- Заголовок плана -->
          <div class="text-center mb-6">
            <h3 class="text-xl font-bold text-gray-900 mb-2">
              {{ plan.display_name }}
            </h3>
            <p class="text-gray-600 text-sm mb-4">
              {{ plan.description }}
            </p>
            
            <!-- Цена -->
            <div class="price">
              <span class="text-3xl font-bold text-gray-900">
                {{ formatPrice(plan.price_monthly) }}
              </span>
              <span class="text-gray-600 ml-1">/месяц</span>
            </div>
            
            <div v-if="plan.price_yearly > 0" class="text-sm text-green-600 mt-1">
              Экономия при годовой оплате: {{ formatPrice(plan.price_monthly * 12 - plan.price_yearly) }}
            </div>
          </div>

          <!-- Список возможностей -->
          <div class="features mb-6">
            <h4 class="font-semibold text-gray-900 mb-3">Возможности:</h4>
            <ul class="space-y-2">
              <li v-for="feature in formatPlanFeatures(plan)" 
                  :key="feature"
                  class="flex items-start gap-2 text-sm">
                <span class="text-green-500 mt-0.5">✓</span>
                <span>{{ feature }}</span>
              </li>
            </ul>
            
            <!-- Лимиты -->
            <div v-if="showLimits(plan)" class="limits mt-4 pt-4 border-t border-gray-200">
              <h5 class="font-medium text-gray-700 mb-2 text-xs uppercase tracking-wide">
                Лимиты:
              </h5>
              <div class="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div v-if="plan.max_job_postings !== 999999">
                  Вакансий: {{ plan.max_job_postings }}/мес
                </div>
                <div v-if="plan.max_urgent_postings !== 999999">
                  Срочных: {{ plan.max_urgent_postings }}/мес
                </div>
                <div v-if="plan.max_featured_postings !== 999999">
                  Премиум: {{ plan.max_featured_postings }}/мес
                </div>
                <div v-if="plan.max_job_postings === 999999" class="col-span-2 text-green-600">
                  Без ограничений
                </div>
              </div>
            </div>
          </div>

          <!-- Кнопка действия -->
          <div class="action-button">
            <button v-if="isCurrentPlan(plan)"
                    disabled
                    class="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed">
              Активный план
            </button>
            
            <button v-else-if="plan.price_monthly === 0"
                    @click="switchToPlan(plan)"
                    :disabled="loading"
                    class="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
              {{ loading ? 'Обработка...' : 'Выбрать план' }}
            </button>
            
            <button v-else-if="isFreemiumMode"
                    disabled
                    class="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium opacity-60 cursor-not-allowed">
              Скоро будет доступно
            </button>
            
            <button v-else
                    @click="upgradeToPlan(plan)"
                    :disabled="loading"
                    class="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all">
              {{ loading ? 'Обработка...' : 'Обновить план' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Дополнительная информация -->
    <div class="additional-info mt-8 text-center">
      <div class="bg-gray-50 p-6 rounded-lg">
        <h3 class="font-semibold text-gray-900 mb-2">Нужна помощь с выбором?</h3>
        <p class="text-gray-600 text-sm mb-4">
          Наша команда поможет подобрать оптимальный тариф для вашего бизнеса
        </p>
        <button @click="contactSupport" 
                class="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Связаться с поддержкой
        </button>
      </div>
    </div>

    <!-- Модальное окно "Скоро" -->
    <div v-if="showComingSoonModal" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
         @click="showComingSoonModal = false">
      <div class="bg-white p-8 rounded-lg max-w-md mx-4" @click.stop>
        <div class="text-center">
          <span class="text-4xl mb-4 block">🚀</span>
          <h3 class="text-xl font-bold mb-2">Платные планы скоро!</h3>
          <p class="text-gray-600 mb-6">
            Мы дорабатываем систему оплаты. Пока пользуйтесь всеми функциями бесплатно!
          </p>
          <button @click="showComingSoonModal = false"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Понятно
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSubscription } from '@/composables/useSubscription'
import { useNotifications } from '@/composables/useNotifications'

// Props
const props = defineProps({
  showCurrentPlan: {
    type: Boolean,
    default: true
  },
  allowUpgrade: {
    type: Boolean,
    default: true
  }
})

// Composables
const {
  subscription,
  plans,
  currentPlan,
  isFreePlan,
  loading,
  fetchSubscriptionPlans,
  formatPlanFeatures
} = useSubscription()

const { showNotification } = useNotifications()

// Local state
const showComingSoonModal = ref(false)
const isFreemiumMode = ref(true) // TODO: получать из настроек

// Computed
const freePlans = computed(() => plans.value.filter(plan => plan.price_monthly === 0))
const paidPlans = computed(() => plans.value.filter(plan => plan.price_monthly > 0))

// Methods
function formatPrice(price) {
  if (price === 0) return 'Бесплатно'
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0
  }).format(price)
}

function isCurrentPlan(plan) {
  return currentPlan.value?.id === plan.id
}

function getPlanCardClass(plan) {
  if (isCurrentPlan(plan)) {
    return 'border-2 border-blue-500 shadow-lg'
  }
  if (plan.name === 'premium') {
    return 'border-2 border-purple-200 shadow-md'
  }
  return 'border border-gray-200 shadow-sm hover:shadow-md transition-shadow'
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

function showLimits(plan) {
  // Показываем лимиты для платных планов или если есть реальные ограничения
  return plan.price_monthly > 0 || plan.max_job_postings < 999999
}

async function switchToPlan(plan) {
  if (plan.price_monthly === 0) {
    // Для бесплатных планов просто переключаем
    showNotification(`Переключение на план "${plan.display_name}"`, 'info')
    // TODO: Реализовать переключение через API
  } else {
    upgradeToPlan(plan)
  }
}

function upgradeToPlan(plan) {
  if (isFreemiumMode.value) {
    showComingSoonModal.value = true
    return
  }
  
  // TODO: Открыть модальное окно оплаты
  showNotification(`Обновление до плана "${plan.display_name}"`, 'info')
}

function contactSupport() {
  // TODO: Реализовать контакт с поддержкой
  showNotification('Функция в разработке', 'info')
}

// Lifecycle
onMounted(() => {
  fetchSubscriptionPlans()
})
</script>

<style scoped>
.plan-card {
  background: white;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-2px);
}

.price {
  margin-bottom: 1rem;
}

.features ul li {
  position: relative;
}

.current-plan-banner {
  margin-bottom: 1rem;
}

.freemium-banner {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>
