import { ref, computed, watch } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from './useNotifications'

export function useSubscription() {
  const authStore = useAuthStore()
  const { showNotification } = useNotifications()
  
  // Reactive state
  const subscription = ref(null)
  const plans = ref([])
  const usageStats = ref({})
  const loading = ref(false)
  const error = ref(null)

  // Computed properties
  const isActive = computed(() => {
    return subscription.value?.status === 'active'
  })

  const currentPlan = computed(() => {
    if (!subscription.value?.plan_id) return null
    return plans.value.find(plan => plan.id === subscription.value.plan_id)
  })

  const isFreePlan = computed(() => {
    return currentPlan.value?.name === 'free'
  })

  const canUpgrade = computed(() => {
    return isFreePlan.value && plans.value.some(plan => plan.name !== 'free')
  })

  // Methods
  async function fetchSubscriptionPlans() {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_public', true)
        .eq('is_active', true)
        .order('price_monthly')

      if (fetchError) throw fetchError

      plans.value = data || []
    } catch (err) {
      console.error('Error fetching subscription plans:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchCompanySubscription(companyId = null) {
    try {
      loading.value = true
      error.value = null

      const targetCompanyId = companyId || authStore.user?.company?.id
      if (!targetCompanyId) {
        throw new Error('No company ID available')
      }

      // Используем Edge Function для проверки подписки
      const { data, error: fetchError } = await supabase.functions.invoke(
        'subscription-manager',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authStore.session?.access_token}`
          },
          body: new URLSearchParams({
            action: 'check-subscription',
            company_id: targetCompanyId
          })
        }
      )

      if (fetchError) throw fetchError

      subscription.value = data.subscription

      // Если подписки нет, автоматически назначаем Free план
      if (!data.has_active_subscription) {
        await assignFreePlan(targetCompanyId)
      }

    } catch (err) {
      console.error('Error fetching company subscription:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function assignFreePlan(companyId) {
    try {
      const { data, error: assignError } = await supabase.functions.invoke(
        'subscription-manager',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.session?.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'assign-free-plan',
            company_id: companyId
          })
        }
      )

      if (assignError) throw assignError

      // Обновляем локальное состояние
      await fetchCompanySubscription(companyId)
      
      showNotification('Добро пожаловать! Вам назначен бесплатный план', 'success')
      
      return data
    } catch (err) {
      console.error('Error assigning free plan:', err)
      throw err
    }
  }

  async function checkUsageLimits(actionType, companyId = null) {
    try {
      const targetCompanyId = companyId || authStore.user?.company?.id
      if (!targetCompanyId) {
        throw new Error('No company ID available')
      }

      const { data, error: checkError } = await supabase.functions.invoke(
        'subscription-manager',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.session?.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'check-limits',
            company_id: targetCompanyId,
            action_type: actionType
          })
        }
      )

      if (checkError) throw checkError

      return data
    } catch (err) {
      console.error('Error checking usage limits:', err)
      throw err
    }
  }

  async function logUsage(actionType, resourceId = null, metadata = {}) {
    try {
      const companyId = authStore.user?.company?.id
      if (!companyId) {
        console.warn('No company ID for usage logging')
        return
      }

      const { data, error: logError } = await supabase.functions.invoke(
        'subscription-manager',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.session?.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'log-usage',
            company_id: companyId,
            action_type: actionType,
            resource_id: resourceId,
            metadata
          })
        }
      )

      if (logError) throw logError

      return data
    } catch (err) {
      console.error('Error logging usage:', err)
      // Не прерываем основной flow из-за ошибки логирования
    }
  }

  async function fetchUsageStats(companyId = null) {
    try {
      const targetCompanyId = companyId || authStore.user?.company?.id
      if (!targetCompanyId) {
        throw new Error('No company ID available')
      }

      const { data, error: fetchError } = await supabase.functions.invoke(
        'subscription-manager',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authStore.session?.access_token}`
          },
          body: new URLSearchParams({
            action: 'usage-stats',
            company_id: targetCompanyId
          })
        }
      )

      if (fetchError) throw fetchError

      usageStats.value = data.stats || {}
      return data
    } catch (err) {
      console.error('Error fetching usage stats:', err)
      error.value = err.message
    }
  }

  // Utility functions
  function formatPlanFeatures(plan) {
    if (!plan?.features) return []
    
    try {
      return typeof plan.features === 'string' 
        ? JSON.parse(plan.features)
        : plan.features
    } catch {
      return []
    }
  }

  function canPerformAction(actionType) {
    // В freemium периоде все действия разрешены
    const monetizationEnabled = false // TODO: получать из настроек
    
    if (!monetizationEnabled) {
      return { allowed: true, reason: 'freemium_period' }
    }

    // Здесь будет логика проверки лимитов когда включим монетизацию
    if (!currentPlan.value) {
      return { allowed: false, reason: 'no_subscription' }
    }

    const limits = {
      job_post: currentPlan.value.max_job_postings,
      urgent_post: currentPlan.value.max_urgent_postings,
      featured_post: currentPlan.value.max_featured_postings
    }

    const limit = limits[actionType]
    const used = usageStats.value[actionType] || 0

    return {
      allowed: used < limit,
      reason: used >= limit ? 'limit_exceeded' : 'ok',
      limit,
      used,
      remaining: Math.max(0, limit - used)
    }
  }

  function getPlanBadgeColor(planName) {
    switch (planName) {
      case 'free': return 'gray'
      case 'basic': return 'blue'
      case 'premium': return 'purple'
      default: return 'gray'
    }
  }

  // Auto-fetch when user changes
  watch(
    () => authStore.user?.company?.id,
    (newCompanyId) => {
      if (newCompanyId) {
        fetchCompanySubscription(newCompanyId)
      }
    },
    { immediate: true }
  )

  // Initialize
  fetchSubscriptionPlans()

  return {
    // State
    subscription,
    plans,
    usageStats,
    loading,
    error,
    
    // Computed
    isActive,
    currentPlan,
    isFreePlan,
    canUpgrade,
    
    // Methods
    fetchSubscriptionPlans,
    fetchCompanySubscription,
    assignFreePlan,
    checkUsageLimits,
    logUsage,
    fetchUsageStats,
    
    // Utilities
    formatPlanFeatures,
    canPerformAction,
    getPlanBadgeColor
  }
}
