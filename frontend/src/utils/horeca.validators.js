// 🔍 ВАЛИДАТОРЫ ДЛЯ HoReCa ПЛАТФОРМЫ
// Проверка корректности данных для ресторанной индустрии

import { HORECA_CONSTANTS } from '../constants/horeca.constants.js'

export class HoRecaValidator {
  
  // Валидация данных вакансии
  static validateJobData(jobData) {
    const errors = []
    
    // Обязательные поля
    if (!jobData.title?.trim()) {
      errors.push('Название вакансии обязательно')
    }
    
    if (!jobData.category) {
      errors.push('Категория обязательна')
    } else if (!HORECA_CONSTANTS.CATEGORIES[jobData.category]) {
      errors.push('Некорректная категория')
    }
    
    if (!jobData.position_type) {
      errors.push('Тип позиции обязателен')
    } else if (!HORECA_CONSTANTS.POSITION_TYPES[jobData.position_type]) {
      errors.push('Некорректный тип позиции')
    }
    
    if (!jobData.description?.trim()) {
      errors.push('Описание обязанностей обязательно')
    }
    
    if (!jobData.location?.trim()) {
      errors.push('Местоположение обязательно')
    }
    
    // Проверка соответствия позиции и категории
    if (jobData.category && jobData.position_type) {
      const position = HORECA_CONSTANTS.POSITION_TYPES[jobData.position_type]
      if (position && position.category !== jobData.category) {
        errors.push(`Позиция "${position.name}" не соответствует категории "${HORECA_CONSTANTS.CATEGORIES[jobData.category]?.name}"`)
      }
    }
    
    // Валидация зарплаты
    const salaryErrors = this.validateSalary(jobData.salary_min, jobData.salary_max)
    errors.push(...salaryErrors)
    
    // Валидация графика
    if (jobData.schedule_type && !HORECA_CONSTANTS.SCHEDULE_TYPES[jobData.schedule_type]) {
      errors.push('Некорректный тип графика')
    }
    
    // Валидация типа занятости
    if (jobData.employment_type && !HORECA_CONSTANTS.EMPLOYMENT_TYPES[jobData.employment_type]) {
      errors.push('Некорректный тип занятости')
    }
    
    // Валидация опыта
    if (jobData.experience_required && !HORECA_CONSTANTS.EXPERIENCE_LEVELS[jobData.experience_required]) {
      errors.push('Некорректное требование к опыту')
    }
    
    // Валидация контактной информации
    if (!jobData.contact_phone?.trim() && !jobData.contact_telegram?.trim()) {
      errors.push('Укажите хотя бы один способ связи (телефон или Telegram)')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // Валидация данных срочной вакансии
  static validateUrgentJobData(urgentData) {
    const errors = []
    
    // Обязательные поля для срочной вакансии
    if (!urgentData.title?.trim()) {
      errors.push('Название срочной вакансии обязательно')
    }
    
    if (!urgentData.category) {
      errors.push('Категория обязательна')
    } else if (!HORECA_CONSTANTS.CATEGORIES[urgentData.category]) {
      errors.push('Некорректная категория')
    }
    
    if (!urgentData.position_type) {
      errors.push('Тип позиции обязателен')
    } else if (!HORECA_CONSTANTS.POSITION_TYPES[urgentData.position_type]) {
      errors.push('Некорректный тип позиции')
    }
    
    if (!urgentData.needed_date) {
      errors.push('Дата работы обязательна')
    } else {
      const neededDate = new Date(urgentData.needed_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (neededDate < today) {
        errors.push('Дата работы не может быть в прошлом')
      }
    }
    
    if (!urgentData.needed_time_start) {
      errors.push('Время начала работы обязательно')
    }
    
    if (!urgentData.needed_time_end) {
      errors.push('Время окончания работы обязательно')
    }
    
    // Проверка времени
    if (urgentData.needed_time_start && urgentData.needed_time_end) {
      if (urgentData.needed_time_start >= urgentData.needed_time_end) {
        errors.push('Время окончания должно быть позже времени начала')
      }
    }
    
    if (!urgentData.payment_per_shift || urgentData.payment_per_shift <= 0) {
      errors.push('Оплата за смену обязательна и должна быть положительной')
    }
    
    if (!urgentData.positions_needed || urgentData.positions_needed <= 0) {
      errors.push('Количество позиций должно быть больше 0')
    }
    
    if (!urgentData.location?.trim()) {
      errors.push('Местоположение обязательно')
    }
    
    // Проверка приоритета
    if (urgentData.priority && !HORECA_CONSTANTS.PRIORITIES[urgentData.priority]) {
      errors.push('Некорректный приоритет')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // Валидация зарплаты
  static validateSalary(min, max) {
    const errors = []
    
    if (min !== undefined && min !== null) {
      if (typeof min !== 'number' || min < 0) {
        errors.push('Минимальная зарплата должна быть положительным числом')
      }
    }
    
    if (max !== undefined && max !== null) {
      if (typeof max !== 'number' || max < 0) {
        errors.push('Максимальная зарплата должна быть положительным числом')
      }
    }
    
    if (min && max && min > max) {
      errors.push('Минимальная зарплата не может быть больше максимальной')
    }
    
    return errors
  }
  
  // Валидация профиля работодателя
  static validateEmployerProfile(employerData) {
    const errors = []
    
    if (!employerData.company_name?.trim()) {
      errors.push('Название компании обязательно')
    }
    
    if (!employerData.company_type) {
      errors.push('Тип заведения обязателен')
    } else if (!HORECA_CONSTANTS.COMPANY_TYPES[employerData.company_type]) {
      errors.push('Некорректный тип заведения')
    }
    
    if (!employerData.location?.trim()) {
      errors.push('Адрес заведения обязателен')
    }
    
    if (!employerData.contact_person?.trim()) {
      errors.push('Контактное лицо обязательно')
    }
    
    if (!employerData.contact_phone?.trim()) {
      errors.push('Контактный телефон обязателен')
    }
    
    // Валидация телефона (базовая проверка)
    if (employerData.contact_phone) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
      if (!phoneRegex.test(employerData.contact_phone.trim())) {
        errors.push('Некорректный формат телефона')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  // Валидация массива навыков
  static validateSkills(skills) {
    if (!Array.isArray(skills)) {
      return { isValid: false, errors: ['Навыки должны быть массивом'] }
    }
    
    const errors = []
    const validSkills = skills.filter(skill => {
      if (typeof skill !== 'string' || !skill.trim()) {
        return false
      }
      if (skill.trim().length > 100) {
        errors.push(`Навык "${skill}" слишком длинный (максимум 100 символов)`)
        return false
      }
      return true
    })
    
    return {
      isValid: errors.length === 0,
      errors,
      validSkills: validSkills.map(s => s.trim())
    }
  }
  
  // Валидация массива льгот
  static validateBenefits(benefits) {
    if (!Array.isArray(benefits)) {
      return { isValid: false, errors: ['Льготы должны быть массивом'] }
    }
    
    const errors = []
    const validBenefits = benefits.filter(benefit => {
      if (typeof benefit !== 'string' || !benefit.trim()) {
        return false
      }
      if (benefit.trim().length > 100) {
        errors.push(`Льгота "${benefit}" слишком длинная (максимум 100 символов)`)
        return false
      }
      return true
    })
    
    return {
      isValid: errors.length === 0,
      errors,
      validBenefits: validBenefits.map(b => b.trim())
    }
  }
  
  // Валидация статуса вакансии
  static validateJobStatus(status) {
    const validStatuses = Object.keys(HORECA_CONSTANTS.JOB_STATUSES)
    return validStatuses.includes(status)
  }
  
  // Валидация статуса срочной вакансии
  static validateUrgentStatus(status) {
    const validStatuses = Object.keys(HORECA_CONSTANTS.URGENT_STATUSES)
    return validStatuses.includes(status)
  }
  
  // Проверка совместимости навыков с позицией
  static validateSkillsForPosition(skills, positionType) {
    const errors = []
    
    // Получаем рекомендуемые навыки для позиции
    const position = HORECA_CONSTANTS.POSITION_TYPES[positionType]
    if (!position) {
      return { isValid: false, errors: ['Неизвестный тип позиции'] }
    }
    
    // Специфические требования для разных позиций
    const requiredSkillsMap = {
      bartender: ['работа с кофе-машиной', 'приготовление напитков'],
      cook: ['приготовление блюд', 'знание кухни'],
      chef: ['управление персоналом', 'создание меню']
    }
    
    const requiredSkills = requiredSkillsMap[positionType] || []
    const hasRequiredSkills = requiredSkills.some(required => 
      skills.some(skill => skill.toLowerCase().includes(required.toLowerCase()))
    )
    
    if (requiredSkills.length > 0 && !hasRequiredSkills) {
      errors.push(`Для позиции "${position.name}" желательно указать навыки: ${requiredSkills.join(', ')}`)
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      suggestions: requiredSkills
    }
  }
}

// Дополнительные утилиты для валидации
export const ValidationUtils = {
  
  // Проверка корректности времени (HH:MM)
  isValidTime(timeString) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(timeString)
  },
  
  // Проверка корректности даты
  isValidDate(dateString) {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date)
  },
  
  // Проверка что дата не в прошлом
  isDateNotPast(dateString) {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  },
  
  // Очистка и нормализация строки
  sanitizeString(str) {
    if (typeof str !== 'string') return ''
    return str.trim().replace(/\s+/g, ' ')
  },
  
  // Проверка на казахский номер телефона
  isKazakhPhone(phone) {
    const kazakhPhoneRegex = /^(\+7|8)?[0-9]{10}$/
    return kazakhPhoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
  },
  
  // Нормализация номера телефона
  normalizePhone(phone) {
    if (!phone) return ''
    
    // Убираем все кроме цифр и +
    let cleaned = phone.replace(/[^\d+]/g, '')
    
    // Если начинается с 8, заменяем на +7
    if (cleaned.startsWith('8')) {
      cleaned = '+7' + cleaned.substring(1)
    }
    
    // Если начинается с 7, добавляем +
    if (cleaned.startsWith('7')) {
      cleaned = '+' + cleaned
    }
    
    // Если не начинается с +7, добавляем префикс
    if (!cleaned.startsWith('+7')) {
      cleaned = '+7' + cleaned
    }
    
    return cleaned
  }
}

console.log('✅ HoReCa validation utilities loaded')