// ⚡ useUrgentJobs.js — Композейбл для работы со срочными вакансиями
import { ref, computed, watch } from 'vue'
import { urgentJobsService } from '@/services/urgent-jobs.service.js'
import { useNotifications } from './useNotifications.js'
import { useAuth } from './useAuth.js'
import { useHoReCa } from './useHoReCa.js'

/**
 * Композейбл для работы со срочными вакансиями в HoReCa сфере
 */
export function useUrgentJobs() {
  
  const { user } = useAuth()
  const { notifyUrgentJob, showSuccess, showError } = useNotifications()
  const { formatUrgentJobSummary, getPositionInfo, priorities } = useHoReCa()

  // Состояние
  const urgentJobs = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const lastUpdate = ref(null)

  // Статистика
  const stats = ref({
    total: 0,
    active: 0,
    filled: 0,
    expired: 0,
    myApplications: 0
  })

  // Фильтры для срочных вакансий
  const filters = ref({
    category: '',
    position_type: '',
    priority: '',
    location: '',
    min_payment: null,
    max_payment: null,
    date_from: null,
    date_to: null,
    instant_payment: false,
    available_only: true  // Показать только доступные для отклика
  })

  // Отфильтрованные срочные вакансии
  const filteredUrgentJobs = computed(() => {
    let filtered = urgentJobs.value

    // Фильтр по категории
    if (filters.value.category) {
      filtered = filtered.filter(job => job.category === filters.value.category)
    }

    // Фильтр по типу позиции
    if (filters.value.position_type) {
      filtered = filtered.filter(job => job.position_type === filters.value.position_type)
    }

    // Фильтр по приоритету
    if (filters.value.priority) {
      filtered = filtered.filter(job => job.priority === filters.value.priority)
    }

    // Фильтр по локации
    if (filters.value.location) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(filters.value.location.toLowerCase())
      )
    }

    // Фильтр по оплате
    if (filters.value.min_payment) {
      filtered = filtered.filter(job => job.payment_per_shift >= filters.value.min_payment)
    }

    if (filters.value.max_payment) {
      filtered = filtered.filter(job => job.payment_per_shift <= filters.value.max_payment)
    }

    // Фильтр по дате
    if (filters.value.date_from) {
      filtered = filtered.filter(job => new Date(job.needed_date) >= new Date(filters.value.date_from))
    }

    if (filters.value.date_to) {
      filtered = filtered.filter(job => new Date(job.needed_date) <= new Date(filters.value.date_to))
    }

    // Фильтр по моментальной оплате
    if (filters.value.instant_payment) {
      filtered = filtered.filter(job => job.instant_payment === true)
    }

    // Показать только доступные для отклика
    if (filters.value.available_only) {
      filtered = filtered.filter(job => 
        job.status === 'active' && 
        job.positions_filled < job.positions_needed &&
        new Date(job.needed_date) >= new Date()
      )
    }

    // Сортировка по приоритету и дате создания
    return filtered.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 }
      const aPriority = priorityOrder[a.priority] || 0
      const bPriority = priorityOrder[b.priority] || 0
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority  // Высший приоритет первым
      }
      
      return new Date(b.created_at) - new Date(a.created_at)  // Новые первыми
    })
  })

  // Срочные вакансии с высоким приоритетом
  const criticalJobs = computed(() => 
    filteredUrgentJobs.value.filter(job => 
      ['critical', 'high'].includes(job.priority) && job.status === 'active'
    )
  )

  // Вакансии на сегодня
  const todayJobs = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return filteredUrgentJobs.value.filter(job => job.needed_date === today)
  })

  // Вакансии на завтра
  const tomorrowJobs = computed(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    return filteredUrgentJobs.value.filter(job => job.needed_date === tomorrowStr)
  })

  // Загрузить срочные вакансии
  const loadUrgentJobs = async (forceReload = false) => {
    if (isLoading.value && !forceReload) return

    isLoading.value = true
    error.value = null

    try {
      const { data, error: err } = await urgentJobsService.getUrgentJobs({
        includeEmployer: true,
        limit: 100
      })

      if (err) throw new Error(err)

      urgentJobs.value = data || []
      lastUpdate.value = new Date()
      updateStats()

    } catch (err) {
      error.value = err.message
      showError(`Ошибка загрузки срочных вакансий: ${err.message}`)
    } finally {
      isLoading.value = false
    }
  }

  // Обновить статистику
  const updateStats = () => {
    stats.value = {
      total: urgentJobs.value.length,
      active: urgentJobs.value.filter(job => job.status === 'active').length,
      filled: urgentJobs.value.filter(job => job.status === 'filled').length,
      expired: urgentJobs.value.filter(job => job.status === 'expired').length,
      myApplications: user.value ? urgentJobs.value.filter(job => 
        job.applications?.some(app => app.candidate_id === user.value.id)
      ).length : 0
    }
  }

  // Создать срочную вакансию
  const createUrgentJob = async (urgentJobData) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: err } = await urgentJobsService.createUrgentJob(urgentJobData)

      if (err) throw new Error(err)

      // Добавляем в список
      urgentJobs.value.unshift(data)
      updateStats()

      // Отправляем уведомления готовым сотрудникам
      await notifyUrgentJob(data)

      showSuccess(`Срочная вакансия "${data.title}" создана и уведомления отправлены!`)
      return { success: true, data }

    } catch (err) {
      error.value = err.message
      showError(`Ошибка создания срочной вакансии: ${err.message}`)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Откликнуться на срочную вакансию
  const applyToUrgentJob = async (urgentJobId, applicationData = {}) => {
    if (!user.value) {
      showError('Войдите в систему для отклика на вакансии')
      return { success: false, error: 'Not authenticated' }
    }

    isLoading.value = true
    error.value = null

    try {
      const { data, error: err } = await urgentJobsService.applyToUrgentJob(
        urgentJobId, 
        user.value.id, 
        applicationData
      )

      if (err) throw new Error(err)

      // Обновляем локальные данные
      const jobIndex = urgentJobs.value.findIndex(job => job.id === urgentJobId)
      if (jobIndex > -1) {
        if (!urgentJobs.value[jobIndex].applications) {
          urgentJobs.value[jobIndex].applications = []
        }
        urgentJobs.value[jobIndex].applications.push(data)
        updateStats()
      }

      showSuccess('Отклик на срочную вакансию отправлен!')
      return { success: true, data }

    } catch (err) {
      error.value = err.message
      showError(`Ошибка отклика: ${err.message}`)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Обновить статус срочной вакансии
  const updateUrgentJobStatus = async (urgentJobId, newStatus) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: err } = await urgentJobsService.updateUrgentJobStatus(urgentJobId, newStatus)

      if (err) throw new Error(err)

      // Обновляем в списке
      const jobIndex = urgentJobs.value.findIndex(job => job.id === urgentJobId)
      if (jobIndex > -1) {
        urgentJobs.value[jobIndex] = { ...urgentJobs.value[jobIndex], ...data }
        updateStats()
      }

      showSuccess(`Статус срочной вакансии обновлен на "${newStatus}"`)
      return { success: true, data }

    } catch (err) {
      error.value = err.message
      showError(`Ошибка обновления статуса: ${err.message}`)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Принять кандидата на срочную вакансию
  const acceptUrgentCandidate = async (urgentJobId, candidateId) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: err } = await urgentJobsService.acceptCandidate(urgentJobId, candidateId)

      if (err) throw new Error(err)

      // Обновляем данные
      await loadUrgentJobs(true)

      showSuccess('Кандидат принят на срочную работу!')
      return { success: true, data }

    } catch (err) {
      error.value = err.message
      showError(`Ошибка принятия кандидата: ${err.message}`)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Получить мои отклики на срочные вакансии
  const getMyUrgentApplications = async () => {
    if (!user.value) return []

    try {
      const { data, error: err } = await urgentJobsService.getUserApplications(user.value.id)
      if (err) throw new Error(err)
      return data || []
    } catch (err) {
      showError(`Ошибка загрузки откликов: ${err.message}`)
      return []
    }
  }

  // Проверить доступность для отклика
  const canApplyToJob = (urgentJob) => {
    if (!user.value) return false
    if (urgentJob.status !== 'active') return false
    if (urgentJob.positions_filled >= urgentJob.positions_needed) return false
    if (new Date(urgentJob.needed_date) < new Date()) return false

    // Проверяем, не откликался ли уже
    const hasApplied = urgentJob.applications?.some(app => app.candidate_id === user.value.id)
    return !hasApplied
  }

  // Получить рекомендуемые вакансии для пользователя
  const getRecommendedUrgentJobs = (userSkills = [], userPreferences = {}) => {
    return filteredUrgentJobs.value.filter(job => {
      // Базовые условия
      if (!canApplyToJob(job)) return false

      // Соответствие навыкам
      if (userSkills.length > 0 && job.required_skills?.length > 0) {
        const hasMatchingSkills = job.required_skills.some(reqSkill =>
          userSkills.some(userSkill => 
            userSkill.toLowerCase().includes(reqSkill.toLowerCase())
          )
        )
        if (!hasMatchingSkills) return false
      }

      // Предпочтения по локации
      if (userPreferences.preferred_locations?.length > 0) {
        const matchesLocation = userPreferences.preferred_locations.some(location =>
          job.location.toLowerCase().includes(location.toLowerCase())
        )
        if (!matchesLocation) return false
      }

      return true
    }).slice(0, 10)  // Лимит рекомендаций
  }

  // Сброс фильтров
  const resetFilters = () => {
    filters.value = {
      category: '',
      position_type: '',
      priority: '',
      location: '',
      min_payment: null,
      max_payment: null,
      date_from: null,
      date_to: null,
      instant_payment: false,
      available_only: true
    }
  }

  // Автообновление каждые 30 секунд для активных срочных вакансий
  let autoRefreshInterval = null

  const startAutoRefresh = () => {
    if (autoRefreshInterval) return
    
    autoRefreshInterval = setInterval(() => {
      if (criticalJobs.value.length > 0) {
        loadUrgentJobs(true)
      }
    }, 30000)  // 30 секунд
  }

  const stopAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
      autoRefreshInterval = null
    }
  }

  // Очистка при размонтировании
  const cleanup = () => {
    stopAutoRefresh()
  }

  // Следим за критическими вакансиями для автообновления
  watch(criticalJobs, (newJobs) => {
    if (newJobs.length > 0) {
      startAutoRefresh()
    } else {
      stopAutoRefresh()
    }
  })

  return {
    // Данные
    urgentJobs,
    filteredUrgentJobs,
    criticalJobs,
    todayJobs,
    tomorrowJobs,
    stats,
    
    // Состояние
    isLoading,
    error,
    lastUpdate,
    
    // Фильтры
    filters,
    resetFilters,
    
    // Методы
    loadUrgentJobs,
    createUrgentJob,
    applyToUrgentJob,
    updateUrgentJobStatus,
    acceptUrgentCandidate,
    getMyUrgentApplications,
    canApplyToJob,
    getRecommendedUrgentJobs,
    
    // Автообновление
    startAutoRefresh,
    stopAutoRefresh,
    cleanup
  }
}

console.log('✅ Urgent jobs composable loaded')