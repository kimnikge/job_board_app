// ⚡ СЕРВИС СРОЧНЫХ ВАКАНСИЙ - HoReCa платформа
import { supabase, isDemoMode } from './supabase.js'
import { notificationsService } from './notifications.service.js'

// 🚨 Специализированный сервис для срочных вакансий
export const urgentJobsService = {
  
  // Получить все активные срочные вакансии
  async getUrgentJobs(filters = {}) {
    try {
      if (isDemoMode) {
        return {
          data: [
            {
              id: 'urgent-1',
              title: 'СРОЧНО! Нужен бармен на завтра',
              description: 'Требуется опытный бармен на смену завтра с 18:00 до 02:00',
              position_type: 'bartender',
              needed_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // завтра
              needed_time_start: '18:00',
              needed_time_end: '02:00',
              payment_per_shift: 25000,
              payment_currency: 'KZT',
              instant_payment: true,
              positions_needed: 1,
              positions_filled: 0,
              application_deadline: new Date(Date.now() + 3600000).toISOString(), // +1 час
              address: 'ул. Желтоксан, 175',
              district: 'Алмалинский район',
              contact_method: 'telegram',
              contact_telegram: '@urgent_bar_jobs',
              status: 'active',
              priority: 'high',
              urgency_level: 3,
              city_id: 1,
              created_at: new Date().toISOString(),
              employers: {
                company_name: 'Night Bar "Алматы"',
                company_type: 'bar',
                contact_phone: '+7 777 123 45 67'
              }
            },
            {
              id: 'urgent-2',
              title: 'Официант в ресторан СЕГОДНЯ',
              description: 'Срочно нужен официант на смену сегодня вечером',
              position_type: 'waiter',
              needed_date: new Date().toISOString().split('T')[0], // сегодня
              needed_time_start: '19:00',
              needed_time_end: '24:00',
              payment_per_shift: 20000,
              payment_currency: 'KZT',
              instant_payment: true,
              positions_needed: 2,
              positions_filled: 1,
              application_deadline: new Date(Date.now() + 1800000).toISOString(), // +30 минут
              address: 'пр. Достык, 200',
              district: 'Медеуский район',
              contact_method: 'phone',
              contact_phone: '+7 701 234 56 78',
              status: 'active',
              priority: 'critical',
              urgency_level: 5,
              city_id: 1,
              created_at: new Date().toISOString(),
              employers: {
                company_name: 'Ресторан "Дастархан"',
                company_type: 'restaurant',
                contact_phone: '+7 701 234 56 78'
              }
            }
          ],
          error: null
        }
      }

      let query = supabase
        .from('urgent_jobs')
        .select(`
          *,
          employers!company_id(
            company_name,
            company_type,
            logo_url,
            contact_phone,
            contact_email,
            is_verified,
            rating
          )
        `)
        .eq('is_active', true)
        .eq('status', 'active')
        .gt('application_deadline', new Date().toISOString())
        .lt('positions_filled', supabase.raw('positions_needed'))
        .order('urgency_level', { ascending: false })
        .order('created_at', { ascending: false })

      // Применяем фильтры
      if (filters.position_type) {
        query = query.eq('position_type', filters.position_type)
      }
      if (filters.city_id) {
        query = query.eq('city_id', filters.city_id)
      }
      if (filters.district) {
        query = query.eq('district', filters.district)
      }
      if (filters.payment_min) {
        query = query.gte('payment_per_shift', filters.payment_min)
      }
      if (filters.needed_date) {
        query = query.eq('needed_date', filters.needed_date)
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }

      const { data, error } = await query
      return { data, error }

    } catch (error) {
      console.error('Get urgent jobs error:', error)
      return { data: null, error }
    }
  },

  // Получить срочную вакансию по ID
  async getUrgentJobById(id) {
    try {
      if (isDemoMode) {
        return {
          data: {
            id: id,
            title: 'СРОЧНО! Демо вакансия',
            description: 'Срочная демо вакансия для тестирования',
            position_type: 'cook',
            needed_date: new Date().toISOString().split('T')[0],
            needed_time_start: '18:00',
            needed_time_end: '02:00',
            payment_per_shift: 30000,
            positions_needed: 1,
            positions_filled: 0,
            status: 'active',
            urgency_level: 4,
            created_at: new Date().toISOString()
          },
          error: null
        }
      }

      const { data, error } = await supabase
        .from('urgent_jobs')
        .select(`
          *,
          employers!company_id(
            company_name,
            company_type,
            company_description,
            logo_url,
            contact_phone,
            contact_email,
            website_url,
            address,
            is_verified,
            rating,
            reviews_count
          )
        `)
        .eq('id', id)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Get urgent job by ID error:', error)
      return { data: null, error }
    }
  },

  // Создать срочную вакансию
  async createUrgentJob(jobData) {
    try {
      if (isDemoMode) {
        const demoJob = {
          id: `urgent-${Date.now()}`,
          ...jobData,
          created_at: new Date().toISOString(),
          status: 'active',
          is_active: true
        }

        // Отправляем уведомления в демо режиме
        try {
          await notificationsService.notifyUrgentJob({
            title: jobData.title,
            position_type: jobData.position_type,
            payment_per_shift: jobData.payment_per_shift,
            needed_date: jobData.needed_date,
            needed_time_start: jobData.needed_time_start,
            address: jobData.address
          })
        } catch (notifyError) {
          console.log('Demo urgent notification error:', notifyError)
        }

        return { data: demoJob, error: null }
      }

      // Валидация данных срочной вакансии
      const validationError = this.validateUrgentJobData(jobData)
      if (validationError) {
        return { data: null, error: validationError }
      }

      const { data, error } = await supabase
        .from('urgent_jobs')
        .insert([jobData])
        .select(`
          *,
          employers!company_id(company_name, company_type)
        `)
        .single()

      // Отправляем уведомления при успешном создании
      if (data && !error) {
        try {
          await notificationsService.notifyUrgentJob({
            id: data.id,
            title: data.title,
            position_type: data.position_type,
            payment_per_shift: data.payment_per_shift,
            needed_date: data.needed_date,
            needed_time_start: data.needed_time_start,
            needed_time_end: data.needed_time_end,
            address: data.address,
            company_name: data.employers?.company_name,
            urgency_level: data.urgency_level,
            application_deadline: data.application_deadline
          })
        } catch (notifyError) {
          console.warn('Urgent job notification error:', notifyError)
        }
      }

      return { data, error }
    } catch (error) {
      console.error('Create urgent job error:', error)
      return { data: null, error }
    }
  },

  // Обновить срочную вакансию
  async updateUrgentJob(id, updateData) {
    try {
      if (isDemoMode) {
        return {
          data: { id, ...updateData, updated_at: new Date().toISOString() },
          error: null
        }
      }

      const { data, error } = await supabase
        .from('urgent_jobs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Update urgent job error:', error)
      return { data: null, error }
    }
  },

  // Применить на срочную вакансию (заполнить позицию)
  async applyToUrgentJob(jobId, candidateData) {
    try {
      if (isDemoMode) {
        return {
          data: { 
            success: true, 
            message: 'Ваша заявка принята! С вами свяжутся в течение 10 минут.' 
          },
          error: null
        }
      }

      // Увеличиваем счетчик заполненных позиций
      const { data, error } = await supabase
        .from('urgent_jobs')
        .update({ 
          positions_filled: supabase.raw('positions_filled + 1'),
          applications_count: supabase.raw('applications_count + 1')
        })
        .eq('id', jobId)
        .select()
        .single()

      if (error) {
        return { data: null, error }
      }

      // Если все позиции заполнены - автоматически закрываем вакансию
      if (data.positions_filled >= data.positions_needed) {
        await supabase
          .from('urgent_jobs')
          .update({ status: 'filled' })
          .eq('id', jobId)
      }

      return {
        data: { 
          success: true, 
          message: 'Заявка отправлена! Работодатель свяжется с вами в ближайшее время.',
          job: data
        },
        error: null
      }
    } catch (error) {
      console.error('Apply to urgent job error:', error)
      return { data: null, error }
    }
  },

  // Валидация данных срочной вакансии
  validateUrgentJobData(jobData) {
    const errors = []

    if (!jobData.title || jobData.title.trim().length < 5) {
      errors.push('Заголовок должен содержать не менее 5 символов')
    }

    if (!jobData.needed_date) {
      errors.push('Укажите дату, когда нужен работник')
    } else {
      const neededDate = new Date(jobData.needed_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (neededDate < today) {
        errors.push('Дата не может быть в прошлом')
      }
    }

    if (!jobData.needed_time_start || !jobData.needed_time_end) {
      errors.push('Укажите время начала и окончания смены')
    }

    if (!jobData.payment_per_shift || jobData.payment_per_shift < 1000) {
      errors.push('Укажите корректную оплату за смену (не менее 1000 тенге)')
    }

    if (!jobData.application_deadline) {
      errors.push('Укажите дедлайн подачи заявок')
    } else {
      const deadline = new Date(jobData.application_deadline)
      if (deadline <= new Date()) {
        errors.push('Дедлайн подачи заявок должен быть в будущем')
      }
    }

    if (!jobData.address || jobData.address.trim().length < 5) {
      errors.push('Укажите полный адрес работы')
    }

    if (!jobData.position_type) {
      errors.push('Выберите тип позиции')
    }

    if (errors.length > 0) {
      return {
        message: 'Ошибки валидации',
        details: errors,
        code: 'VALIDATION_ERROR'
      }
    }

    return null
  },

  // Получить срочные вакансии для конкретной даты
  async getUrgentJobsForDate(date) {
    const filters = { needed_date: date }
    return this.getUrgentJobs(filters)
  },

  // Получить срочные вакансии по типу позиции
  async getUrgentJobsByPosition(positionType) {
    const filters = { position_type: positionType }
    return this.getUrgentJobs(filters)
  },

  // Закрыть просроченные срочные вакансии
  async closeExpiredJobs() {
    try {
      if (isDemoMode) {
        return { data: { updated: 0 }, error: null }
      }

      const { data, error } = await supabase
        .from('urgent_jobs')
        .update({ status: 'expired', is_active: false })
        .lt('application_deadline', new Date().toISOString())
        .eq('status', 'active')
        .select('id')

      return { data: { updated: data?.length || 0 }, error }
    } catch (error) {
      console.error('Close expired jobs error:', error)
      return { data: null, error }
    }
  }
}