<template>
  <div class="pricing-info">
    <!-- Уведомление о бесплатном режиме -->
    <div v-if="!paymentSystemEnabled" class="free-mode-banner">
      <div class="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <span class="text-2xl">🎉</span>
        <div>
          <h3 class="font-semibold text-green-800">Бесплатный период</h3>
          <p class="text-sm text-green-700">Все функции платформы доступны бесплатно!</p>
        </div>
      </div>
    </div>

    <!-- Информация о тарифах -->
    <div v-else-if="pricingPlan" class="pricing-plan">
      <h3 class="font-semibold mb-3">💰 Тарифы для {{ city }}</h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="price-item">
          <div class="text-sm text-gray-600">Обычная вакансия</div>
          <div class="font-bold">{{ monetizationService.formatPrice(pricingPlan.regular_price) }}</div>
        </div>
        <div class="price-item">
          <div class="text-sm text-gray-600">Срочная вакансия</div>
          <div class="font-bold">{{ monetizationService.formatPrice(pricingPlan.urgent_price) }}</div>
        </div>
        <div class="price-item">
          <div class="text-sm text-gray-600">Премиум размещение</div>
          <div class="font-bold">{{ monetizationService.formatPrice(pricingPlan.featured_price) }}</div>
        </div>
        <div class="price-item">
          <div class="text-sm text-gray-600">Топ размещение</div>
          <div class="font-bold">{{ monetizationService.formatPrice(pricingPlan.top_placement_price) }}</div>
        </div>
      </div>
    </div>

    <!-- Информация о подписке компании -->
    <div v-if="subscription && paymentSystemEnabled" class="subscription-info mt-4">
      <h4 class="font-medium mb-2">📊 Ваша подписка</h4>
      <div class="bg-gray-50 p-3 rounded-lg">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm">Тип:</span>
          <span class="font-medium capitalize" :style="{ color: monetizationService.getSubscriptionTypeColor(subscription.subscription_type) }">
            {{ getSubscriptionTypeName(subscription.subscription_type) }}
          </span>
        </div>
        
        <div class="grid grid-cols-3 gap-2 text-xs">
          <div class="text-center">
            <div class="font-medium">{{ subscription.regular_jobs_used || 0 }}/{{ subscription.regular_jobs_limit || '∞' }}</div>
            <div class="text-gray-600">Обычных</div>
          </div>
          <div class="text-center">
            <div class="font-medium">{{ subscription.urgent_jobs_used || 0 }}/{{ subscription.urgent_jobs_limit || '∞' }}</div>
            <div class="text-gray-600">Срочных</div>
          </div>
          <div class="text-center">
            <div class="font-medium">{{ subscription.featured_jobs_used || 0 }}/{{ subscription.featured_jobs_limit || '∞' }}</div>
            <div class="text-gray-600">Премиум</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Предупреждение о превышении лимитов -->
    <div v-if="quotaWarning" class="quota-warning mt-4">
      <div class="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <span class="text-xl">⚠️</span>
        <div>
          <h4 class="font-medium text-yellow-800">Внимание!</h4>
          <p class="text-sm text-yellow-700">{{ quotaWarning }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { monetizationService } from '../services/monetization.service.js'

// Props
const props = defineProps({
  city: {
    type: String,
    default: 'Астана'
  },
  companyId: {
    type: String,
    default: null
  },
  jobType: {
    type: String,
    default: 'regular' // 'regular', 'urgent', 'featured'
  }
})

// Состояние
const paymentSystemEnabled = ref(false)
const pricingPlan = ref(null)
const subscription = ref(null)
const loading = ref(true)

// Вычисляемые свойства
const quotaWarning = computed(() => {
  if (!paymentSystemEnabled.value || !subscription.value) return null
  
  const sub = subscription.value
  const jobType = props.jobType
  
  let used, limit, typeName
  
  switch (jobType) {
    case 'urgent':
      used = sub.urgent_jobs_used || 0
      limit = sub.urgent_jobs_limit || 0
      typeName = 'срочных вакансий'
      break
    case 'featured':
      used = sub.featured_jobs_used || 0
      limit = sub.featured_jobs_limit || 0
      typeName = 'премиум размещений'
      break
    default:
      used = sub.regular_jobs_used || 0
      limit = sub.regular_jobs_limit || 0
      typeName = 'обычных вакансий'
  }
  
  if (used >= limit) {
    return `Исчерпан лимит ${typeName}. Обратитесь к администратору для увеличения лимита.`
  } else if (used >= limit * 0.8) {
    return `Остается ${limit - used} ${typeName} из ${limit}. Скоро лимит будет исчерпан.`
  }
  
  return null
})

// Загрузка данных
onMounted(async () => {
  await loadPricingInfo()
})

// Следим за изменением города и компании
watch([() => props.city, () => props.companyId], async () => {
  await loadPricingInfo()
})

// Функции
async function loadPricingInfo() {
  try {
    loading.value = true
    
    // Проверяем, включена ли система оплаты
    paymentSystemEnabled.value = await monetizationService.isPaymentSystemEnabled()
    
    // Загружаем тарифный план для города
    if (props.city) {
      pricingPlan.value = await monetizationService.getPricingPlanForCity(props.city)
    }
    
    // Загружаем подписку компании (если указана)
    if (props.companyId && paymentSystemEnabled.value) {
      subscription.value = await monetizationService.getCompanySubscription(props.companyId)
    }
  } catch (error) {
    console.error('Error loading pricing info:', error)
  } finally {
    loading.value = false
  }
}

function getSubscriptionTypeName(type) {
  const names = {
    free: 'Бесплатная',
    basic: 'Базовая',
    premium: 'Премиум'
  }
  return names[type] || type
}

// Методы, доступные родительскому компоненту
defineExpose({
  canPostJob: async () => {
    if (!paymentSystemEnabled.value || !props.companyId) return true
    return await monetizationService.canCompanyPostJob(props.companyId, props.jobType)
  },
  refresh: loadPricingInfo
})
</script>

<style scoped>
.price-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  text-align: center;
}

.loading-placeholder {
  background: #e2e8f0;
  height: 20px;
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
