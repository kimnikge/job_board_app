// ✨ API КОМПАНИЙ - ЭТАП 4.1.5
import { supabase, isDemoMode } from './supabase.js'

// 🏢 Все операции с компаниями и заведениями
export const companiesService = {
  // Получить все компании
  async getAllCompanies(filters = {}) {
    try {
      if (isDemoMode) {
        return {
          data: [
            {
              id: 1,
              name: 'Grand Restaurant',
              description: 'Премиальный ресторан с изысканной кухней',
              logo_url: '/images/default-company.png',
              phone: '+7 777 111 22 33',
              email: 'info@grandrestaurant.kz',
              website: 'https://grandrestaurant.kz',
              address: 'ул. Абая, 150',
              rating: 4.8,
              reviews_count: 24,
              active_jobs_count: 3,
              district_id: 1,
              venue_type_id: 1,
              created_at: new Date().toISOString(),
              city_districts: { name: 'Есильский район' },
              venue_types: { name: 'Ресторан', icon: '🍽️' }
            },
            {
              id: 2,
              name: 'Cozy Cafe',
              description: 'Уютное кафе в центре города',
              logo_url: '/images/default-company.png',
              phone: '+7 777 222 33 44',
              email: 'hello@cozycafe.kz',
              website: 'https://cozycafe.kz',
              address: 'пр. Республики, 25',
              rating: 4.5,
              reviews_count: 18,
              active_jobs_count: 2,
              district_id: 2,
              venue_type_id: 2,
              created_at: new Date().toISOString(),
              city_districts: { name: 'Алматинский район' },
              venue_types: { name: 'Кафе', icon: '☕' }
            }
          ],
          error: null
        }
      }

      let query = supabase
        .from('companies')
        .select(`
          *,
          city_districts(name),
          venue_types(name, icon)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      // Применяем фильтры
      if (filters.district_id) {
        query = query.eq('district_id', filters.district_id)
      }
      if (filters.venue_type_id) {
        query = query.eq('venue_type_id', filters.venue_type_id)
      }

      const { data, error } = await query

      return { data, error }
    } catch (error) {
      console.error('Get companies error:', error)
      return { data: null, error }
    }
  },

  // Получить компанию по ID
  async getCompanyById(id) {
    try {
      if (isDemoMode) {
        return {
          data: {
            id: id,
            name: 'Demo Company',
            description: 'This is a demo company',
            logo_url: '/images/default-company.png',
            phone: '+7 777 123 45 67',
            email: 'demo@company.kz',
            website: 'https://democompany.kz',
            address: 'Demo Address',
            rating: 4.7,
            reviews_count: 20,
            active_jobs_count: 5,
            district_id: 1,
            venue_type_id: 1,
            created_at: new Date().toISOString(),
            city_districts: { name: 'Есильский район' },
            venue_types: { name: 'Ресторан', icon: '🍽️' }
          },
          error: null
        }
      }

      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          city_districts(name),
          venue_types(name, icon)
        `)
        .eq('id', id)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Get company by ID error:', error)
      return { data: null, error }
    }
  },

  // Создать компанию
  async createCompany(companyData) {
    try {
      if (isDemoMode) {
        return {
          data: {
            id: Date.now(),
            ...companyData,
            created_at: new Date().toISOString(),
            status: 'active',
            rating: 0,
            reviews_count: 0,
            active_jobs_count: 0
          },
          error: null
        }
      }

      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Create company error:', error)
      return { data: null, error }
    }
  },

  // Обновить компанию
  async updateCompany(id, companyData) {
    try {
      if (isDemoMode) {
        return {
          data: { id, ...companyData, updated_at: new Date().toISOString() },
          error: null
        }
      }

      const { data, error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Update company error:', error)
      return { data: null, error }
    }
  },

  // Получить вакансии компании
  async getCompanyJobs(companyId) {
    try {
      if (isDemoMode) {
        return {
          data: [
            {
              id: 1,
              title: 'Повар итальянской кухни',
              salary_from: 300000,
              salary_to: 500000,
              is_urgent: false,
              created_at: new Date().toISOString(),
              specializations: { name: 'Повар', icon: '👨‍🍳' }
            }
          ],
          error: null
        }
      }

      const { data, error } = await supabase
        .from('job_postings')
        .select(`
          *,
          specializations(name, icon)
        `)
        .eq('company_id', companyId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      return { data, error }
    } catch (error) {
      console.error('Get company jobs error:', error)
      return { data: null, error }
    }
  },

  // Получить статистику компании для дашборда
  async getCompanyStats(companyId) {
    try {
      if (isDemoMode) {
        return {
          data: {
            total_jobs: 5,
            active_jobs: 3,
            urgent_jobs: 1,
            total_applications: 12,
            new_applications: 3,
            views_today: 45,
            views_total: 234
          },
          error: null
        }
      }

      // В реальном приложении здесь будут запросы к базе данных
      // для получения статистики компании
      const { data, error } = await supabase
        .rpc('get_company_stats', { company_id: companyId })

      return { data, error }
    } catch (error) {
      console.error('Get company stats error:', error)
      return { data: null, error }
    }
  }
}

console.log('✅ Companies service initialized')
