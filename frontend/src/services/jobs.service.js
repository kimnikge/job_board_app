// ✨ API ВАКАНСИЙ - ЭТАП 4.1.3
import { supabase, isDemoMode, DEFAULT_SELECT, isAuthenticated, handleAuthError } from './supabase.js'
import { notificationsService } from './notifications.service.js'
import { monetizationService } from './monetization.service.js'

// 💼 Все операции с вакансиями (обычные + срочные)
export const jobsService = {
  // Получить все вакансии
  async getAllJobs(filters = {}) {
    try {
      // Проверяем, есть ли текущий пользователь
      const userAuthenticated = await isAuthenticated()
      
      if (isDemoMode || !userAuthenticated) {
        // Demo режим или неаутентифицированный пользователь - возвращаем демо-данные
        return {
          data: [
            {
              id: 1,
              title: 'Повар итальянской кухни',
              description: 'Требуется опытный повар для ресторана итальянской кухни. Обязанности: приготовление пасты, пиццы, ризотто.',
              category: 'kitchen',
              position_type: 'cook',
              employment_type: 'full_time',
              schedule_type: 'shift',
              salary_min: 300000,
              salary_max: 500000,
              salary_type: 'monthly',
              salary_currency: 'KZT',
              required_skills: ['приготовление пасты', 'итальянская кухня', 'работа с пиццей'],
              preferred_skills: ['английский язык', 'опыт в ресторанах'],
              benefits: ['питание', 'униформа', 'обучение'],
              address: 'ул. Абая, 150',
              district: 'Алмалинский район',
              contact_method: 'application',
              is_urgent: false,
              is_active: true,
              status: 'active',
              city_id: 1,
              created_at: new Date().toISOString(),
              employers: { 
                company_name: 'Grand Italian Restaurant', 
                company_type: 'restaurant',
                logo_url: '/images/default-company.png',
                is_verified: true,
                rating: 4.5
              }
            },
            {
              id: 2,
              title: 'Официант в кафе',
              description: 'Ищем дружелюбного официанта для работы в уютном кафе в центре города.',
              category: 'service',
              position_type: 'waiter',
              employment_type: 'part_time',
              schedule_type: 'flexible',
              salary_min: 150000,
              salary_max: 250000,
              salary_type: 'monthly',
              salary_currency: 'KZT',
              required_skills: ['обслуживание клиентов', 'знание меню', 'касса'],
              benefits: ['чаевые', 'питание', 'гибкий график'],
              address: 'пр. Достык, 36',
              district: 'Медеуский район',
              contact_method: 'telegram',
              contact_telegram: '@cafe_jobs',
              is_urgent: true,
              is_active: true,
              status: 'active',
              city_id: 1,
              created_at: new Date().toISOString(),
              employers: { 
                company_name: 'Cozy Corner Cafe', 
                company_type: 'cafe',
                logo_url: '/images/default-company.png',
                is_verified: false,
                rating: 4.2
              }
            }
          ],
          error: null
        }
      }

      let query = supabase
        .from('job_postings')
        .select(`
          *,
          employers!company_id(company_name, company_type, logo_url, is_verified, rating)
        `)
        .eq('is_active', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      // Применяем HoReCa фильтры
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.position_type) {
        query = query.eq('position_type', filters.position_type)
      }
      if (filters.city_id) {
        query = query.eq('city_id', filters.city_id)
      }
      if (filters.employment_type) {
        query = query.eq('employment_type', filters.employment_type)
      }
      if (filters.schedule_type) {
        query = query.eq('schedule_type', filters.schedule_type)
      }
      if (filters.salary_min) {
        query = query.gte('salary_max', filters.salary_min)
      }
      if (filters.salary_max) {
        query = query.lte('salary_min', filters.salary_max)
      }
      if (filters.is_urgent !== undefined) {
        query = query.eq('is_urgent', filters.is_urgent)
      }
      if (filters.district) {
        query = query.eq('district', filters.district)
      }
      if (filters.required_skills && filters.required_skills.length > 0) {
        query = query.overlaps('required_skills', filters.required_skills)
      }

      const { data, error } = await query

      return { data, error }
    } catch (error) {
      console.error('Get jobs error:', error)
      
      // Если это ошибка аутентификации, возвращаем демо-данные
      if (handleAuthError(error)) {
        return this.getAllJobs(filters) // Рекурсивно вызываем с демо-данными
      }
      
      return { data: null, error }
    }
  },

  // Получить срочные вакансии
  async getUrgentJobs() {
    return this.getAllJobs({ is_urgent: true })
  },

  // Получить обычные вакансии
  async getRegularJobs() {
    return this.getAllJobs({ is_urgent: false })
  },

  // Получить вакансию по ID
  async getJobById(id) {
    try {
      if (isDemoMode) {
        return {
          data: {
            id: id,
            title: 'Demo Job',
            description: 'This is a demo job',
            salary_from: 250000,
            salary_to: 400000,
            is_urgent: false,
            specialization_id: 1,
            district_id: 1,
            company_id: 1,
            created_at: new Date().toISOString(),
            specializations: { name: 'Повар', icon: '👨‍🍳' },
            city_districts: { name: 'Есильский район' },
            companies: { name: 'Demo Company', logo_url: '/images/default-company.png' }
          },
          error: null
        }
      }

      const { data, error } = await supabase
        .from('job_postings')
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
      console.error('Get job by ID error:', error)
      return { data: null, error }
    }
  },

  // Создать вакансию
  async createJob(jobData) {
    try {
      if (isDemoMode) {
        // Отправка уведомления в demo режиме через новую службу
        try {
          await notificationsService.notifyNewJob({
            title: jobData.title || 'Новая вакансия',
            location: jobData.location,
            salary_from: jobData.salary_from,
            salary_to: jobData.salary_to,
            company_name: jobData.company_name
          })
        } catch (notifyError) {
          console.log('Demo notification error:', notifyError)
        }
        return {
          data: {
            id: Date.now(),
            ...jobData,
            created_at: new Date().toISOString(),
            status: 'active'
          },
          error: null
        }
      }

      // Проверяем, может ли компания опубликовать вакансию
      const companyId = jobData.company_id
      const jobType = jobData.is_urgent ? 'urgent' : 'regular'
      
      const canPost = await monetizationService.canCompanyPostJob(companyId, jobType)
      if (!canPost) {
        return {
          data: null,
          error: {
            message: 'Превышен лимит вакансий для вашего тарифного плана. Обратитесь к администратору.',
            code: 'QUOTA_EXCEEDED'
          }
        }
      }

      const { data, error } = await supabase
        .from('job_postings')
        .insert([jobData])
        .select()
        .single()

      // Отправка уведомления при успешном создании вакансии
      if (data && !error) {
        try {
          if (data.is_urgent) {
            // Срочная вакансия - особое уведомление
            await notificationsService.notifyUrgentJob({
              title: data.title,
              location: data.location,
              salary_from: data.salary_from,
              salary_to: data.salary_to,
              company_name: data.company_name,
              needed_date: data.needed_date
            })
          } else {
            // Обычная вакансия
            await notificationsService.notifyNewJob({
              title: data.title,
              location: data.location,
              salary_from: data.salary_from,
              salary_to: data.salary_to,
              company_name: data.company_name
            })
          }
        } catch (notifyError) {
          console.warn('Notification error:', notifyError)
        }
      }

      return { data, error }
    } catch (error) {
      console.error('Create job error:', error)
      return { data: null, error }
    }
  },

  // Обновить вакансию
  async updateJob(id, jobData) {
    try {
      if (isDemoMode) {
        return {
          data: { id, ...jobData, updated_at: new Date().toISOString() },
          error: null
        }
      }

      const { data, error } = await supabase
        .from('job_postings')
        .update(jobData)
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Update job error:', error)
      return { data: null, error }
    }
  },

  // Удалить вакансию
  async deleteJob(id) {
    try {
      if (isDemoMode) {
        return { error: null }
      }

      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', id)

      return { error }
    } catch (error) {
      console.error('Delete job error:', error)
      return { error }
    }
  },

  // Получить вакансии по категории HoReCa
  async getJobsByCategory(category) {
    return this.getAllJobs({ category })
  },

  // Получить вакансии по типу позиции
  async getJobsByPosition(positionType) {
    return this.getAllJobs({ position_type: positionType })
  },

  // Поиск вакансий по навыкам
  async searchJobsBySkills(skills) {
    return this.getAllJobs({ required_skills: skills })
  },

  // Получить вакансии с зарплатой в диапазоне
  async getJobsBySalaryRange(minSalary, maxSalary) {
    return this.getAllJobs({ salary_min: minSalary, salary_max: maxSalary })
  },

  // Получить вакансии по району
  async getJobsByDistrict(district) {
    return this.getAllJobs({ district })
  },

  // Получить вакансии по типу занятости
  async getJobsByEmploymentType(employmentType) {
    return this.getAllJobs({ employment_type: employmentType })
  },

  // Получить вакансии по графику работы
  async getJobsBySchedule(scheduleType) {
    return this.getAllJobs({ schedule_type: scheduleType })
  },

  // Увеличить счетчик просмотров
  async incrementViewCount(jobId) {
    try {
      if (isDemoMode) {
        return { data: { views_count: Math.floor(Math.random() * 100) }, error: null }
      }

      const { data, error } = await supabase
        .from('job_postings')
        .update({ 
          views_count: supabase.raw('views_count + 1') 
        })
        .eq('id', jobId)
        .select('views_count')
        .single()

      return { data, error }
    } catch (error) {
      console.error('Increment view count error:', error)
      return { data: null, error }
    }
  },

  // Получить популярные вакансии (по просмотрам)
  async getPopularJobs(limit = 10) {
    try {
      if (isDemoMode) {
        const allJobs = await this.getAllJobs()
        return {
          data: allJobs.data?.slice(0, limit) || [],
          error: null
        }
      }

      const { data, error } = await supabase
        .from('job_postings')
        .select(`
          *,
          employers!company_id(company_name, company_type, logo_url, is_verified)
        `)
        .eq('is_active', true)
        .eq('status', 'active')
        .order('views_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      return { data, error }
    } catch (error) {
      console.error('Get popular jobs error:', error)
      return { data: null, error }
    }
  },

  // Получить недавние вакансии
  async getRecentJobs(limit = 10) {
    try {
      if (isDemoMode) {
        const allJobs = await this.getAllJobs()
        return {
          data: allJobs.data?.slice(0, limit) || [],
          error: null
        }
      }

      const { data, error } = await supabase
        .from('job_postings')
        .select(`
          *,
          employers!company_id(company_name, company_type, logo_url, is_verified)
        `)
        .eq('is_active', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit)

      return { data, error }
    } catch (error) {
      console.error('Get recent jobs error:', error)
      return { data: null, error }
    }
  },

  // Валидация данных вакансии
  validateJobData(jobData) {
    const errors = []

    if (!jobData.title || jobData.title.trim().length < 5) {
      errors.push('Заголовок должен содержать не менее 5 символов')
    }

    if (!jobData.description || jobData.description.trim().length < 20) {
      errors.push('Описание должно содержать не менее 20 символов')
    }

    if (!jobData.category) {
      errors.push('Выберите категорию')
    }

    if (!jobData.position_type) {
      errors.push('Выберите тип позиции')
    }

    if (!jobData.address || jobData.address.trim().length < 5) {
      errors.push('Укажите адрес работы')
    }

    if (jobData.salary_min && jobData.salary_max && jobData.salary_min > jobData.salary_max) {
      errors.push('Минимальная зарплата не может быть больше максимальной')
    }

    if (jobData.min_age && (jobData.min_age < 14 || jobData.min_age > 65)) {
      errors.push('Минимальный возраст должен быть от 14 до 65 лет')
    }

    if (jobData.max_age && (jobData.max_age < 14 || jobData.max_age > 65)) {
      errors.push('Максимальный возраст должен быть от 14 до 65 лет')
    }

    if (jobData.min_age && jobData.max_age && jobData.min_age > jobData.max_age) {
      errors.push('Минимальный возраст не может быть больше максимального')
    }

    if (errors.length > 0) {
      return {
        message: 'Ошибки валидации',
        details: errors,
        code: 'VALIDATION_ERROR'
      }
    }

    return null
  }
}

console.log('✅ Jobs service initialized')
