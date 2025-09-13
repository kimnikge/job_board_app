// 🏨 useHoReCa.js — Композейбл для работы с HoReCa данными
import { ref, computed } from 'vue'
import { HORECA_CONSTANTS, HoRecaHelpers } from '@/constants/horeca.constants.js'
import { HoRecaValidator } from '@/utils/horeca.validators.js'

/**
 * Композейбл для удобной работы с HoReCa константами и данными
 */
export function useHoReCa() {
  
  // Реактивные данные для фильтрации
  const selectedCategory = ref('')
  const selectedPositionType = ref('')
  const selectedCompanyType = ref('')
  const selectedScheduleType = ref('')
  const selectedEmploymentType = ref('')
  const selectedExperienceLevel = ref('')
  const salaryRange = ref({ min: null, max: null })

  // Вычисляемые свойства
  const categories = computed(() => HORECA_CONSTANTS.CATEGORIES)
  const positionTypes = computed(() => HORECA_CONSTANTS.POSITION_TYPES)
  const companyTypes = computed(() => HORECA_CONSTANTS.COMPANY_TYPES)
  const scheduleTypes = computed(() => HORECA_CONSTANTS.SCHEDULE_TYPES)
  const employmentTypes = computed(() => HORECA_CONSTANTS.EMPLOYMENT_TYPES)
  const experienceLevels = computed(() => HORECA_CONSTANTS.EXPERIENCE_LEVELS)
  const priorities = computed(() => HORECA_CONSTANTS.PRIORITIES)

  // Позиции отфильтрованные по категории
  const filteredPositions = computed(() => {
    if (!selectedCategory.value) return positionTypes.value
    
    const filtered = {}
    Object.entries(positionTypes.value).forEach(([key, value]) => {
      if (value.category === selectedCategory.value) {
        filtered[key] = value
      }
    })
    return filtered
  })

  // Популярные навыки и льготы
  const popularSkills = computed(() => HORECA_CONSTANTS.POPULAR_SKILLS)
  const popularBenefits = computed(() => HORECA_CONSTANTS.POPULAR_BENEFITS)

  // Функции-помощники
  const getCategoryInfo = (categoryKey) => HoRecaHelpers.getCategoryInfo(categoryKey)
  const getPositionInfo = (positionKey) => HoRecaHelpers.getPositionInfo(positionKey)
  const getPositionsByCategory = (category) => HoRecaHelpers.getPositionsByCategory(category)
  const formatSalary = (min, max, type, currency) => HoRecaHelpers.formatSalary(min, max, type, currency)
  const getStatusColor = (status, isUrgent) => HoRecaHelpers.getStatusColor(status, isUrgent)
  const getStatusIcon = (status, isUrgent) => HoRecaHelpers.getStatusIcon(status, isUrgent)
  const isKitchenPosition = (positionType) => HoRecaHelpers.isKitchenPosition(positionType)
  const isServicePosition = (positionType) => HoRecaHelpers.isServicePosition(positionType)
  const getRecommendedSkills = (positionType) => HoRecaHelpers.getRecommendedSkills(positionType)

  // Валидация данных
  const validateJobData = (jobData) => HoRecaValidator.validateJobData(jobData)
  const validateUrgentJobData = (urgentData) => HoRecaValidator.validateUrgentJobData(urgentData)
  const validateEmployerProfile = (employerData) => HoRecaValidator.validateEmployerProfile(employerData)
  const validateSkills = (skills) => HoRecaValidator.validateSkills(skills)
  const validateBenefits = (benefits) => HoRecaValidator.validateBenefits(benefits)

  // Фильтрация вакансий
  const applyJobFilters = (jobs) => {
    let filtered = jobs

    if (selectedCategory.value) {
      filtered = filtered.filter(job => job.category === selectedCategory.value)
    }

    if (selectedPositionType.value) {
      filtered = filtered.filter(job => job.position_type === selectedPositionType.value)
    }

    if (selectedScheduleType.value) {
      filtered = filtered.filter(job => job.schedule_type === selectedScheduleType.value)
    }

    if (selectedEmploymentType.value) {
      filtered = filtered.filter(job => job.employment_type === selectedEmploymentType.value)
    }

    if (selectedExperienceLevel.value) {
      filtered = filtered.filter(job => job.experience_required === selectedExperienceLevel.value)
    }

    if (salaryRange.value.min) {
      filtered = filtered.filter(job => !job.salary_min || job.salary_min >= salaryRange.value.min)
    }

    if (salaryRange.value.max) {
      filtered = filtered.filter(job => !job.salary_max || job.salary_max <= salaryRange.value.max)
    }

    return filtered
  }

  // Сброс всех фильтров
  const resetFilters = () => {
    selectedCategory.value = ''
    selectedPositionType.value = ''
    selectedCompanyType.value = ''
    selectedScheduleType.value = ''
    selectedEmploymentType.value = ''
    selectedExperienceLevel.value = ''
    salaryRange.value = { min: null, max: null }
  }

  // Получить список опций для селектов
  const getCategoryOptions = () => {
    return Object.entries(categories.value).map(([key, value]) => ({
      value: key,
      label: value.name,
      icon: value.icon,
      description: value.description
    }))
  }

  const getPositionOptions = (categoryFilter = null) => {
    let positions = positionTypes.value
    
    if (categoryFilter) {
      positions = Object.fromEntries(
        Object.entries(positions).filter(([key, value]) => value.category === categoryFilter)
      )
    }
    
    return Object.entries(positions).map(([key, value]) => ({
      value: key,
      label: value.name,
      icon: value.icon,
      description: value.description,
      category: value.category
    }))
  }

  const getCompanyTypeOptions = () => {
    return Object.entries(companyTypes.value).map(([key, value]) => ({
      value: key,
      label: value.name,
      icon: value.icon,
      description: value.description
    }))
  }

  // Подсказки для автодополнения
  const getSkillSuggestions = (query, limit = 10) => {
    if (!query || query.length < 2) return []
    
    const lowerQuery = query.toLowerCase()
    return popularSkills.value
      .filter(skill => skill.toLowerCase().includes(lowerQuery))
      .slice(0, limit)
  }

  const getBenefitSuggestions = (query, limit = 10) => {
    if (!query || query.length < 2) return []
    
    const lowerQuery = query.toLowerCase()
    return popularBenefits.value
      .filter(benefit => benefit.toLowerCase().includes(lowerQuery))
      .slice(0, limit)
  }

  // Форматирование для отображения
  const formatJobTitle = (job) => {
    const position = getPositionInfo(job.position_type)
    const category = getCategoryInfo(job.category)
    return `${position.name} (${category.name})`
  }

  const formatJobSummary = (job) => {
    const position = getPositionInfo(job.position_type)
    const salary = formatSalary(job.salary_min, job.salary_max, job.salary_type)
    const schedule = scheduleTypes.value[job.schedule_type]?.name || ''
    
    return {
      title: job.title || position.name,
      position: position.name,
      salary,
      schedule,
      location: job.location,
      icon: position.icon,
      isUrgent: false
    }
  }

  const formatUrgentJobSummary = (urgentJob) => {
    const position = getPositionInfo(urgentJob.position_type)
    const priority = priorities.value[urgentJob.priority]
    
    return {
      title: urgentJob.title,
      position: position.name,
      payment: `${urgentJob.payment_per_shift.toLocaleString()} тенге/смена`,
      timeRange: `${urgentJob.needed_time_start} - ${urgentJob.needed_time_end}`,
      location: urgentJob.location,
      icon: position.icon,
      priorityIcon: priority?.icon || '🔥',
      isUrgent: true,
      instantPayment: urgentJob.instant_payment
    }
  }

  // Проверка соответствия позиции навыкам
  const checkSkillsMatch = (jobSkills = [], userSkills = []) => {
    if (!jobSkills.length || !userSkills.length) return { match: 0, missing: jobSkills }
    
    const matchedSkills = jobSkills.filter(jobSkill => 
      userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    )
    
    const missingSkills = jobSkills.filter(jobSkill => 
      !userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    )
    
    return {
      match: Math.round((matchedSkills.length / jobSkills.length) * 100),
      matchedSkills,
      missingSkills
    }
  }

  return {
    // Константы (только для чтения)
    categories,
    positionTypes,
    companyTypes,
    scheduleTypes,
    employmentTypes,
    experienceLevels,
    priorities,
    popularSkills,
    popularBenefits,
    filteredPositions,

    // Состояние фильтров
    selectedCategory,
    selectedPositionType,
    selectedCompanyType,
    selectedScheduleType,
    selectedEmploymentType,
    selectedExperienceLevel,
    salaryRange,

    // Функции-помощники
    getCategoryInfo,
    getPositionInfo,
    getPositionsByCategory,
    formatSalary,
    getStatusColor,
    getStatusIcon,
    isKitchenPosition,
    isServicePosition,
    getRecommendedSkills,

    // Валидация
    validateJobData,
    validateUrgentJobData,
    validateEmployerProfile,
    validateSkills,
    validateBenefits,

    // Фильтрация и опции
    applyJobFilters,
    resetFilters,
    getCategoryOptions,
    getPositionOptions,
    getCompanyTypeOptions,

    // Автодополнение
    getSkillSuggestions,
    getBenefitSuggestions,

    // Форматирование
    formatJobTitle,
    formatJobSummary,
    formatUrgentJobSummary,
    checkSkillsMatch
  }
}

console.log('✅ HoReCa composable loaded')