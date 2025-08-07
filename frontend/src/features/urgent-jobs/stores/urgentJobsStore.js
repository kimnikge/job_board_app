/**
 * 🚨 PINIA STORE ДЛЯ СРОЧНЫХ ВАКАНСИЙ
 * 
 * Управление состоянием модуля срочных вакансий
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { urgentJobsAPI } from '../services/urgentJobsAPI.js'
import { moduleEvents, SYSTEM_EVENTS } from '../../../core/events/moduleEvents.js'
import { useNotificationService } from '../../../shared/services/notificationService.js'

export const useUrgentJobsStore = defineStore('urgentJobs', () => {
  // 📊 СОСТОЯНИЕ
  const jobs = ref([])
  const currentJob = ref(null)
  const filters = ref({
    specialization_id: null,
    city_district_id: null,
    venue_type_id: null,
    urgency_level: null,
    salary_min: null,
    needed_today: false
  })
  
  const loading = ref(false)
  const error = ref(null)
  const lastUpdateTime = ref(null)
  const isRealTimeConnected = ref(false)
  
  // Пользовательские настройки
  const userSettings = ref({
    readyForUrgent: false,
    preferredSpecializations: [],
    preferredDistricts: [],
    notificationsEnabled: true
  })
  
  // Real-time подписки
  let realTimeUnsubscribe = null
  let refreshTimer = null
  let expiryCheckTimer = null
  
  // 🧮 COMPUTED СВОЙСТВА
  const activeJobs = computed(() => 
    jobs.value.filter(job => 
      job.status === 'active' && 
      new Date(job.expires_at) > new Date()
    )
  )
  
  const activeCount = computed(() => activeJobs.value.length)
  
  const todayJobs = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return activeJobs.value.filter(job => job.needed_date === today)
  })
  
  const criticalJobs = computed(() =>
    activeJobs.value.filter(job => job.urgency_level === 'critical')
  )
  
  const filteredJobs = computed(() => {
    let filtered = activeJobs.value
    
    if (filters.value.specialization_id) {
      filtered = filtered.filter(job => job.specialization_id === filters.value.specialization_id)
    }
    
    if (filters.value.city_district_id) {
      filtered = filtered.filter(job => job.city_district_id === filters.value.city_district_id)
    }
    
    if (filters.value.venue_type_id) {
      filtered = filtered.filter(job => job.venue_type_id === filters.value.venue_type_id)
    }
    
    if (filters.value.urgency_level) {
      filtered = filtered.filter(job => job.urgency_level === filters.value.urgency_level)
    }
    
    if (filters.value.salary_min) {
      filtered = filtered.filter(job => job.salary_min >= filters.value.salary_min)
    }
    
    if (filters.value.needed_today) {
      const today = new Date().toISOString().split('T')[0]
      filtered = filtered.filter(job => job.needed_date === today)
    }
    
    return filtered
  })
  
  const stats = computed(() => ({
    total: jobs.value.length,
    active: activeCount.value,
    today: todayJobs.value.length,
    critical: criticalJobs.value.length
  }))
  
  // 🔄 ДЕЙСТВИЯ
  
  /**
   * Инициализация store
   */
  async function init() {
    try {
      console.log('🚨 Initializing Urgent Jobs store...')
      
      // Загружаем настройки пользователя
      await loadUserSettings()
      
      // Загружаем активные вакансии
      await loadActiveJobs()
      
      // Запускаем таймеры
      startTimers()
      
      console.log('✅ Urgent Jobs store initialized')
      
    } catch (err) {
      console.error('❌ Error initializing urgent jobs store:', err)
      setError(err.message)
    }
  }
  
  /**
   * Загрузка активных срочных вакансий
   */
  async function loadActiveJobs() {
    try {
      setLoading(true)
      setError(null)
      
      const data = await urgentJobsAPI.getActiveUrgentJobs()
      jobs.value = data
      lastUpdateTime.value = new Date()
      
      console.log(`📋 Loaded ${data.length} active urgent jobs`)
      
    } catch (err) {
      console.error('❌ Error loading urgent jobs:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  /**
   * Загрузка срочной вакансии по ID
   */
  async function loadJobById(id) {
    try {
      setLoading(true)
      setError(null)
      
      const job = await urgentJobsAPI.getUrgentJobById(id)
      currentJob.value = job
      
      // Обновляем job в списке, если он там есть
      const index = jobs.value.findIndex(j => j.id === id)
      if (index !== -1) {
        jobs.value[index] = job
      }
      
      return job
      
    } catch (err) {
      console.error('❌ Error loading urgent job:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  /**
   * Создание новой срочной вакансии
   */
  async function createUrgentJob(jobData) {
    try {
      setLoading(true)
      setError(null)
      
      const newJob = await urgentJobsAPI.createUrgentJob(jobData)
      
      // Добавляем в начало списка
      jobs.value.unshift(newJob)
      
      console.log('✅ Urgent job created:', newJob.id)
      
      // Отправляем уведомление о создании
      const notificationService = useNotificationService()
      await notificationService.sendUrgentJobNotification(newJob)
      
      return newJob
      
    } catch (err) {
      console.error('❌ Error creating urgent job:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  /**
   * Отклик на срочную вакансию
   */
  async function applyToJob(jobId, applicationData) {
    try {
      setLoading(true)
      setError(null)
      
      const application = await urgentJobsAPI.applyToUrgentJob(jobId, applicationData)
      
      // Обновляем счетчик откликов в локальном состоянии
      const job = jobs.value.find(j => j.id === jobId)
      if (job) {
        job.applications_count = (job.applications_count || 0) + 1
      }
      
      console.log('✅ Applied to urgent job:', jobId)
      
      return application
      
    } catch (err) {
      console.error('❌ Error applying to urgent job:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }
  
  /**
   * Обновление фильтров
   */
  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
    console.log('🔍 Filters updated:', filters.value)
  }
  
  /**
   * Очистка фильтров
   */
  function clearFilters() {
    filters.value = {
      specialization_id: null,
      city_district_id: null,
      venue_type_id: null,
      urgency_level: null,
      salary_min: null,
      needed_today: false
    }
  }
  
  /**
   * Переключение готовности к срочным выходам
   */
  async function toggleReadyForUrgent() {
    try {
      userSettings.value.readyForUrgent = !userSettings.value.readyForUrgent
      
      // Сохраняем в профиле пользователя
      await saveUserSettings()
      
      // Если включили готовность - подписываемся на уведомления
      if (userSettings.value.readyForUrgent) {
        await initNotifications()
      }
      
      console.log('🔔 Ready for urgent jobs:', userSettings.value.readyForUrgent)
      
    } catch (err) {
      console.error('❌ Error toggling ready status:', err)
      setError(err.message)
    }
  }
  
  /**
   * Real-time подписки
   */
  async function subscribeToRealTimeUpdates() {
    try {
      if (realTimeUnsubscribe) {
        realTimeUnsubscribe()
      }
      
      realTimeUnsubscribe = urgentJobsAPI.subscribeToUrgentJobs((payload) => {
        handleRealTimeUpdate(payload)
      })
      
      isRealTimeConnected.value = true
      console.log('📡 Subscribed to urgent jobs real-time updates')
      
    } catch (err) {
      console.error('❌ Error subscribing to real-time updates:', err)
      isRealTimeConnected.value = false
    }
  }
  
  /**
   * Обработка real-time обновлений
   */
  function handleRealTimeUpdate(payload) {
    switch (payload.eventType) {
      case 'INSERT':
        // Новая срочная вакансия
        jobs.value.unshift(payload.new)
        
        // Проверяем, подходит ли пользователю
        if (userSettings.value.readyForUrgent) {
          checkAndNotify(payload.new)
        }
        break
        
      case 'UPDATE':
        // Обновление вакансии
        const updateIndex = jobs.value.findIndex(job => job.id === payload.new.id)
        if (updateIndex !== -1) {
          jobs.value[updateIndex] = payload.new
        }
        break
        
      case 'DELETE':
        // Удаление вакансии
        const deleteIndex = jobs.value.findIndex(job => job.id === payload.old.id)
        if (deleteIndex !== -1) {
          jobs.value.splice(deleteIndex, 1)
        }
        break
    }
    
    lastUpdateTime.value = new Date()
  }
  
  /**
   * Инициализация уведомлений
   */
  async function initNotifications() {
    if (!userSettings.value.readyForUrgent || !userSettings.value.notificationsEnabled) {
      return
    }
    
    try {
      const notificationService = useNotificationService()
      await notificationService.requestPermission()
      
      console.log('🔔 Urgent jobs notifications initialized')
      
    } catch (err) {
      console.error('❌ Error initializing notifications:', err)
    }
  }
  
  /**
   * Проверка и отправка персонализированных уведомлений
   */
  async function checkAndNotify(job) {
    if (!userSettings.value.readyForUrgent || !userSettings.value.notificationsEnabled) {
      return
    }
    
    try {
      // Проверяем соответствие предпочтениям пользователя
      const isRelevant = 
        (!userSettings.value.preferredSpecializations.length || 
         userSettings.value.preferredSpecializations.includes(job.specialization_id)) &&
        (!userSettings.value.preferredDistricts.length || 
         userSettings.value.preferredDistricts.includes(job.city_district_id))
      
      if (isRelevant) {
        const notificationService = useNotificationService()
        await notificationService.showUrgentJobNotification(job)
      }
      
    } catch (err) {
      console.error('❌ Error sending urgent job notification:', err)
    }
  }
  
  /**
   * Загрузка настроек пользователя
   */
  async function loadUserSettings() {
    // TODO: Загрузить из профиля пользователя
    // Пока используем localStorage
    const saved = localStorage.getItem('urgentJobsSettings')
    if (saved) {
      userSettings.value = { ...userSettings.value, ...JSON.parse(saved) }
    }
  }
  
  /**
   * Сохранение настроек пользователя
   */
  async function saveUserSettings() {
    // TODO: Сохранить в профиль пользователя
    // Пока используем localStorage
    localStorage.setItem('urgentJobsSettings', JSON.stringify(userSettings.value))
  }
  
  /**
   * Запуск таймеров
   */
  function startTimers() {
    // Автообновление списка каждые 30 секунд
    refreshTimer = setInterval(() => {
      loadActiveJobs()
    }, 30000)
    
    // Проверка истекших вакансий каждые 5 минут
    expiryCheckTimer = setInterval(() => {
      checkExpiredJobs()
    }, 300000)
  }
  
  /**
   * Проверка истекших вакансий
   */
  function checkExpiredJobs() {
    const now = new Date()
    const expiredJobs = jobs.value.filter(job => 
      job.status === 'active' && new Date(job.expires_at) <= now
    )
    
    if (expiredJobs.length > 0) {
      console.log(`⏰ Found ${expiredJobs.length} expired jobs, removing...`)
      
      expiredJobs.forEach(job => {
        const index = jobs.value.findIndex(j => j.id === job.id)
        if (index !== -1) {
          jobs.value[index].status = 'expired'
        }
      })
    }
  }
  
  /**
   * Очистка таймеров
   */
  function clearTimers() {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
    
    if (expiryCheckTimer) {
      clearInterval(expiryCheckTimer)
      expiryCheckTimer = null
    }
  }
  
  /**
   * Отписка от real-time
   */
  function unsubscribeFromRealTime() {
    if (realTimeUnsubscribe) {
      realTimeUnsubscribe()
      realTimeUnsubscribe = null
      isRealTimeConnected.value = false
    }
  }
  
  /**
   * Helper функции
   */
  function setLoading(value) {
    loading.value = value
  }
  
  function setError(message) {
    error.value = message
  }
  
  function clearError() {
    error.value = null
  }
  
  /**
   * Сброс состояния
   */
  function $reset() {
    jobs.value = []
    currentJob.value = null
    clearFilters()
    loading.value = false
    error.value = null
    lastUpdateTime.value = null
    
    clearTimers()
    unsubscribeFromRealTime()
  }
  
  return {
    // Состояние
    jobs,
    currentJob,
    filters,
    loading,
    error,
    lastUpdateTime,
    isRealTimeConnected,
    userSettings,
    
    // Computed
    activeJobs,
    activeCount,
    todayJobs,
    criticalJobs,
    filteredJobs,
    stats,
    
    // Действия
    init,
    loadActiveJobs,
    loadJobById,
    createUrgentJob,
    applyToJob,
    updateFilters,
    clearFilters,
    toggleReadyForUrgent,
    subscribeToRealTimeUpdates,
    unsubscribeFromRealTime,
    initNotifications,
    clearTimers,
    clearError,
    $reset
  }
})

console.log('🚨 Urgent Jobs store ready!')
