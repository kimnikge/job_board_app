/**
 * 🚨 КОМПОЗАБЛ ДЛЯ СРОЧНЫХ ВАКАНСИЙ
 * 
 * Vue 3 композабл для работы с модулем срочных вакансий
 */

import { computed, watch, onMounted, onUnmounted } from 'vue'
import { useUrgentJobsStore } from '../stores/urgentJobsStore.js'
import { moduleEvents, SYSTEM_EVENTS } from '../../../core/events/moduleEvents.js'

/**
 * 🚨 ОСНОВНОЙ КОМПОЗАБЛ useUrgentJobs
 */
export function useUrgentJobs() {
  const store = useUrgentJobsStore()
  
  // 📊 REACTIVE DATA
  const jobs = computed(() => store.filteredJobs)
  const activeCount = computed(() => store.activeCount)
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)
  const stats = computed(() => store.stats)
  
  // 🔄 ACTIONS
  async function loadJobs() {
    return store.loadActiveJobs()
  }
  
  async function createJob(jobData) {
    return store.createUrgentJob(jobData)
  }
  
  async function applyToJob(jobId, applicationData) {
    return store.applyToJob(jobId, applicationData)
  }
  
  function updateFilters(filters) {
    store.updateFilters(filters)
  }
  
  function clearFilters() {
    store.clearFilters()
  }
  
  function clearError() {
    store.clearError()
  }
  
  return {
    // Data
    jobs,
    activeCount,
    loading,
    error,
    stats,
    
    // Actions
    loadJobs,
    createJob,
    applyToJob,
    updateFilters,
    clearFilters,
    clearError
  }
}

/**
 * 🎯 КОМПОЗАБЛ ДЛЯ ОДНОЙ СРОЧНОЙ ВАКАНСИИ
 */
export function useUrgentJob(jobId) {
  const store = useUrgentJobsStore()
  
  const job = computed(() => store.currentJob)
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)
  
  async function loadJob() {
    if (!jobId) {
      throw new Error('Job ID is required')
    }
    
    return store.loadJobById(jobId)
  }
  
  async function applyToJob(applicationData) {
    if (!jobId) {
      throw new Error('Job ID is required')
    }
    
    return store.applyToJob(jobId, applicationData)
  }
  
  // Автозагрузка при монтировании
  onMounted(() => {
    if (jobId) {
      loadJob()
    }
  })
  
  return {
    job,
    loading,
    error,
    loadJob,
    applyToJob
  }
}

/**
 * 🔔 КОМПОЗАБЛ ДЛЯ УВЕДОМЛЕНИЙ О СРОЧНЫХ ВАКАНСИЯХ
 */
export function useUrgentJobNotifications() {
  const store = useUrgentJobsStore()
  
  const isReady = computed(() => store.userSettings.readyForUrgent)
  const notificationsEnabled = computed(() => store.userSettings.notificationsEnabled)
  const preferredSpecializations = computed(() => store.userSettings.preferredSpecializations)
  const preferredDistricts = computed(() => store.userSettings.preferredDistricts)
  
  async function toggleReady() {
    return store.toggleReadyForUrgent()
  }
  
  function updatePreferences(preferences) {
    store.userSettings.preferredSpecializations = preferences.specializations || []
    store.userSettings.preferredDistricts = preferences.districts || []
    store.saveUserSettings()
  }
  
  function toggleNotifications() {
    store.userSettings.notificationsEnabled = !store.userSettings.notificationsEnabled
    store.saveUserSettings()
  }
  
  return {
    isReady,
    notificationsEnabled,
    preferredSpecializations,
    preferredDistricts,
    toggleReady,
    updatePreferences,
    toggleNotifications
  }
}

/**
 * 🔍 КОМПОЗАБЛ ДЛЯ ФИЛЬТРАЦИИ СРОЧНЫХ ВАКАНСИЙ
 */
export function useUrgentJobFilters() {
  const store = useUrgentJobsStore()
  
  const filters = computed(() => store.filters)
  const filteredCount = computed(() => store.filteredJobs.length)
  const hasActiveFilters = computed(() => 
    Object.values(store.filters).some(value => 
      value !== null && value !== false && value !== ''
    )
  )
  
  function setSpecialization(specializationId) {
    store.updateFilters({ specialization_id: specializationId })
  }
  
  function setDistrict(districtId) {
    store.updateFilters({ city_district_id: districtId })
  }
  
  function setVenueType(venueTypeId) {
    store.updateFilters({ venue_type_id: venueTypeId })
  }
  
  function setUrgencyLevel(level) {
    store.updateFilters({ urgency_level: level })
  }
  
  function setMinSalary(salary) {
    store.updateFilters({ salary_min: salary })
  }
  
  function toggleTodayOnly() {
    store.updateFilters({ needed_today: !store.filters.needed_today })
  }
  
  function clearAll() {
    store.clearFilters()
  }
  
  return {
    filters,
    filteredCount,
    hasActiveFilters,
    setSpecialization,
    setDistrict,
    setVenueType,
    setUrgencyLevel,
    setMinSalary,
    toggleTodayOnly,
    clearAll
  }
}

/**
 * 📊 КОМПОЗАБЛ ДЛЯ СТАТИСТИКИ СРОЧНЫХ ВАКАНСИЙ
 */
export function useUrgentJobStats() {
  const store = useUrgentJobsStore()
  
  const stats = computed(() => store.stats)
  const todayJobs = computed(() => store.todayJobs)
  const criticalJobs = computed(() => store.criticalJobs)
  
  const todayCount = computed(() => todayJobs.value.length)
  const criticalCount = computed(() => criticalJobs.value.length)
  
  // Статистика по времени
  const timeStats = computed(() => {
    const now = new Date()
    const jobs = store.activeJobs
    
    const expiringToday = jobs.filter(job => {
      const expires = new Date(job.expires_at)
      return expires.toDateString() === now.toDateString()
    })
    
    const expiringSoon = jobs.filter(job => {
      const expires = new Date(job.expires_at)
      const hoursLeft = (expires - now) / (1000 * 60 * 60)
      return hoursLeft <= 4 && hoursLeft > 0
    })
    
    return {
      expiringToday: expiringToday.length,
      expiringSoon: expiringSoon.length
    }
  })
  
  return {
    stats,
    todayCount,
    criticalCount,
    timeStats,
    todayJobs,
    criticalJobs
  }
}

/**
 * ⏱️ КОМПОЗАБЛ ДЛЯ РАБОТЫ СО ВРЕМЕНЕМ СРОЧНЫХ ВАКАНСИЙ
 */
export function useUrgentJobTiming() {
  
  /**
   * Получить оставшееся время до истечения
   */
  function getTimeLeft(expiresAt) {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires - now
    
    if (diff <= 0) {
      return { expired: true, text: 'Истекла' }
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours >= 24) {
      const days = Math.floor(hours / 24)
      return { 
        expired: false, 
        urgent: false,
        text: `${days}д ${hours % 24}ч`,
        hours: hours
      }
    } else if (hours > 0) {
      return { 
        expired: false, 
        urgent: hours <= 4,
        text: `${hours}ч ${minutes}м`,
        hours: hours
      }
    } else {
      return { 
        expired: false, 
        urgent: true,
        text: `${minutes}м`,
        hours: 0
      }
    }
  }
  
  /**
   * Получить CSS класс для отображения времени
   */
  function getTimeClass(expiresAt) {
    const timeInfo = getTimeLeft(expiresAt)
    
    if (timeInfo.expired) return 'time-expired'
    if (timeInfo.urgent) return 'time-urgent'
    if (timeInfo.hours <= 12) return 'time-warning'
    return 'time-normal'
  }
  
  /**
   * Получить иконку для отображения времени
   */
  function getTimeIcon(expiresAt) {
    const timeInfo = getTimeLeft(expiresAt)
    
    if (timeInfo.expired) return '⏰'
    if (timeInfo.urgent) return '🔥'
    if (timeInfo.hours <= 12) return '⚡'
    return '🕒'
  }
  
  return {
    getTimeLeft,
    getTimeClass,
    getTimeIcon
  }
}

/**
 * 🚀 КОМПОЗАБЛ ДЛЯ QUICK ACTIONS
 */
export function useUrgentJobActions() {
  const store = useUrgentJobsStore()
  
  /**
   * Быстрый отклик "ГОТОВ ВЫЙТИ!"
   */
  async function quickApply(jobId, userInfo) {
    const applicationData = {
      user_id: userInfo.id,
      phone: userInfo.phone,
      telegram: userInfo.telegram,
      message: 'ГОТОВ ВЫЙТИ ПРЯМО СЕЙЧАС!',
      available_immediately: true
    }
    
    return store.applyToJob(jobId, applicationData)
  }
  
  /**
   * Показать только сегодняшние вакансии
   */
  function showTodayOnly() {
    store.updateFilters({ needed_today: true })
  }
  
  /**
   * Показать только критические вакансии
   */
  function showCriticalOnly() {
    store.updateFilters({ urgency_level: 'critical' })
  }
  
  /**
   * Сбросить все фильтры и показать все
   */
  function showAll() {
    store.clearFilters()
  }
  
  return {
    quickApply,
    showTodayOnly,
    showCriticalOnly,
    showAll
  }
}

console.log('🚨 Urgent Jobs composables ready!')
