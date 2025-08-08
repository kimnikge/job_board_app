// ✨ API ВАКАНСИЙ - ЭТАП 4.1.3
import { supabase, isDemoMode, DEFAULT_SELECT } from './supabase.js'

// 💼 Все операции с вакансиями (обычные + срочные)
export const jobsService = {
  // Получить все вакансии
  async getAllJobs(filters = {}) {
    try {
      if (isDemoMode) {
        return {
          data: [
            {
              id: 1,
              title: 'Повар итальянской кухни',
              description: 'Требуется опытный повар для ресторана итальянской кухни',
              salary_from: 300000,
              salary_to: 500000,
              is_urgent: false,
              specialization_id: 1,
              district_id: 1,
              company_id: 1,
              created_at: new Date().toISOString(),
              specializations: { name: 'Повар', icon: '👨‍🍳' },
              city_districts: { name: 'Есильский район' },
              companies: { name: 'Grand Restaurant', logo_url: '/images/default-company.png' }
            },
            {
              id: 2,
              title: 'Официант в кафе',
              description: 'Ищем дружелюбного официанта',
              salary_from: 200000,
              salary_to: 300000,
              is_urgent: true,
              specialization_id: 2,
              district_id: 2,
              company_id: 2,
              created_at: new Date().toISOString(),
              specializations: { name: 'Официант', icon: '🤵' },
              city_districts: { name: 'Алматинский район' },
              companies: { name: 'Cozy Cafe', logo_url: '/images/default-company.png' }
            }
          ],
          error: null
        }
      }

      let query = supabase
        .from('job_postings')
        .select(`
          *,
          specializations(name, icon),
          city_districts(name),
          venue_types(name, icon),
          companies(name, logo_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      // Применяем фильтры
      if (filters.specialization_id) {
        query = query.eq('specialization_id', filters.specialization_id)
      }
      if (filters.district_id) {
        query = query.eq('district_id', filters.district_id)
      }
      if (filters.is_urgent !== undefined) {
        query = query.eq('is_urgent', filters.is_urgent)
      }

      const { data, error } = await query

      return { data, error }
    } catch (error) {
      console.error('Get jobs error:', error)
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
          specializations(name, icon),
          city_districts(name),
          venue_types(name, icon),
          companies(name, logo_url, phone, email)
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

      const { data, error } = await supabase
        .from('job_postings')
        .insert([jobData])
        .select()
        .single()

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
  }
}

console.log('✅ Jobs service initialized')
