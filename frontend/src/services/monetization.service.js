// ✨ API МОНЕТИЗАЦИИ - Управление платежной системой
import { supabase, isDemoMode } from './supabase.js'

// 💰 Все операции с монетизацией и подписками
export const monetizationService = {
  // Проверить, включена ли система оплаты
  async isPaymentSystemEnabled() {
    if (isDemoMode) return false
    
    try {
      const { data, error } = await supabase.rpc('is_payment_system_enabled')
      if (error) throw error
      return data || false
    } catch (error) {
      console.warn('Error checking payment system status:', error)
      return false
    }
  },

  // Получить тарифный план для города
  async getPricingPlanForCity(cityName) {
    if (isDemoMode) {
      return {
        plan_id: 'demo-plan',
        regular_price: 0,
        urgent_price: 0,
        featured_price: 0,
        top_placement_price: 0,
        currency: 'KZT'
      }
    }

    try {
      const { data, error } = await supabase.rpc('get_pricing_plan_for_city', {
        p_city_name: cityName
      })
      
      if (error) throw error
      return data?.[0] || null
    } catch (error) {
      console.warn('Error getting pricing plan:', error)
      return null
    }
  },

  // Проверить, может ли компания опубликовать вакансию
  async canCompanyPostJob(companyId, jobType = 'regular') {
    if (isDemoMode) return true

    try {
      const { data, error } = await supabase.rpc('can_company_post_job', {
        p_company_id: companyId,
        p_job_type: jobType
      })
      
      if (error) throw error
      return data || false
    } catch (error) {
      console.warn('Error checking job posting permission:', error)
      return true // В случае ошибки разрешаем (fail-safe)
    }
  },

  // Получить подписку компании
  async getCompanySubscription(companyId) {
    if (isDemoMode) {
      return {
        id: 'demo-subscription',
        subscription_type: 'free',
        status: 'active',
        regular_jobs_limit: 999999,
        urgent_jobs_limit: 999999,
        featured_jobs_limit: 999999,
        regular_jobs_used: 0,
        urgent_jobs_used: 0,
        featured_jobs_used: 0
      }
    }

    try {
      const { data, error } = await supabase
        .from('company_subscriptions')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.warn('Error getting company subscription:', error)
      return null
    }
  },

  // ========================================
  // АДМИНСКИЕ ФУНКЦИИ
  // ========================================

  // Получить настройки монетизации (только для админов)
  async getMonetizationSettings() {
    if (isDemoMode) {
      return {
        payment_system_enabled: false,
        free_period_enabled: true,
        kaspi_pay_enabled: false,
        bank_cards_enabled: false
      }
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monetization-admin/settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this._getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch settings')
      const result = await response.json()
      return result.settings
    } catch (error) {
      console.error('Error getting monetization settings:', error)
      throw error
    }
  },

  // Включить/выключить систему оплаты (только для админов)
  async togglePaymentSystem(enabled) {
    if (isDemoMode) {
      console.log('Demo mode: payment system toggle simulated')
      return { success: true }
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monetization-admin/toggle-payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled })
      })

      if (!response.ok) throw new Error('Failed to toggle payment system')
      return await response.json()
    } catch (error) {
      console.error('Error toggling payment system:', error)
      throw error
    }
  },

  // Получить тарифные планы по городам (только для админов)
  async getPricingPlans() {
    if (isDemoMode) {
      return [
        { 
          city_name: 'Астана', 
          regular_job_price: 0, 
          urgent_job_price: 0, 
          featured_job_price: 0,
          top_placement_price: 0,
          currency: 'KZT',
          is_active: true 
        },
        { 
          city_name: 'Алматы', 
          regular_job_price: 0, 
          urgent_job_price: 0, 
          featured_job_price: 0,
          top_placement_price: 0,
          currency: 'KZT',
          is_active: true 
        }
      ]
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monetization-admin/pricing-plans`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this._getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch pricing plans')
      const result = await response.json()
      return result.plans
    } catch (error) {
      console.error('Error getting pricing plans:', error)
      throw error
    }
  },

  // Обновить тарифный план для города (только для админов)
  async updatePricingPlan(cityName, pricing) {
    if (isDemoMode) {
      console.log('Demo mode: pricing plan update simulated', { cityName, pricing })
      return { success: true }
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monetization-admin/update-pricing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ city_name: cityName, ...pricing })
      })

      if (!response.ok) throw new Error('Failed to update pricing plan')
      return await response.json()
    } catch (error) {
      console.error('Error updating pricing plan:', error)
      throw error
    }
  },

  // Получить статистику монетизации (только для админов)
  async getMonetizationStats() {
    if (isDemoMode) {
      return {
        totalActiveSubscriptions: 25,
        subscriptionsByType: { free: 25, basic: 0, premium: 0 },
        citiesConfigured: 5,
        activeCities: 5,
        totalRevenue: 0,
        paymentsCompleted: 0
      }
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monetization-admin/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this._getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch stats')
      const result = await response.json()
      return result.stats
    } catch (error) {
      console.error('Error getting monetization stats:', error)
      throw error
    }
  },

  // ========================================
  // УТИЛИТЫ
  // ========================================

  // Получить JWT токен для аутентификации
  async _getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  },

  // Форматировать цену для отображения
  formatPrice(amount, currency = 'KZT') {
    if (!amount || amount === 0) return 'Бесплатно'
    
    const formatted = new Intl.NumberFormat('kk-KZ', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
    
    return formatted
  },

  // Получить цвет для типа подписки
  getSubscriptionTypeColor(type) {
    const colors = {
      free: '#10B981', // green
      basic: '#F59E0B', // yellow
      premium: '#8B5CF6' // purple
    }
    return colors[type] || '#6B7280'
  },

  // Проверить, истекает ли подписка скоро
  isSubscriptionExpiringSoon(expiresAt, days = 7) {
    if (!expiresAt) return false
    
    const expireDate = new Date(expiresAt)
    const warningDate = new Date()
    warningDate.setDate(warningDate.getDate() + days)
    
    return expireDate <= warningDate
  }
}

console.log('✅ Monetization service initialized')
