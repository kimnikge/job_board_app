import { supabase } from '@/lib/supabase.js'

class CitiesService {
  // Получить все активные города
  async getAllCities() {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('is_popular', { ascending: false })
        .order('name')

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching cities:', error)
      return { data: null, error }
    }
  }

  // Получить популярные города
  async getPopularCities() {
    try {
      const { data, error } = await supabase
        .rpc('get_popular_cities')

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching popular cities:', error)
      return { data: null, error }
    }
  }

  // Поиск городов
  async searchCities(searchTerm) {
    try {
      const { data, error } = await supabase
        .rpc('search_cities', { search_term: searchTerm })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error searching cities:', error)
      return { data: null, error }
    }
  }

  // Получить город по ID
  async getCityById(id) {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching city by ID:', error)
      return { data: null, error }
    }
  }

  // Создать запрос на добавление города
  async createCityRequest(cityName, region, email = null) {
    try {
      const { data, error } = await supabase
        .rpc('create_city_request', {
          city_name: cityName,
          region: region,
          requester_email: email
        })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating city request:', error)
      return { data: null, error }
    }
  }

  // Получить запросы пользователя на добавление городов
  async getUserCityRequests() {
    try {
      const { data, error } = await supabase
        .from('city_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching user city requests:', error)
      return { data: null, error }
    }
  }

  // Админские функции

  // Получить все запросы на добавление городов (для админов)
  async getAllCityRequests() {
    try {
      const { data, error } = await supabase
        .from('city_requests')
        .select(`
          *,
          requester:requester_user_id (
            email,
            user_profiles (
              first_name,
              last_name
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching city requests for admin:', error)
      return { data: null, error }
    }
  }

  // Добавить новый город (админ)
  async addCity(cityData) {
    try {
      const { data, error } = await supabase
        .from('cities')
        .insert({
          name: cityData.name,
          region: cityData.region,
          is_popular: cityData.is_popular || false,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error adding city:', error)
      return { data: null, error }
    }
  }

  // Обновить статус запроса на добавление города (админ)
  async updateCityRequestStatus(requestId, status, adminComment = null) {
    try {
      const { data, error } = await supabase
        .from('city_requests')
        .update({
          status,
          admin_comment: adminComment,
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating city request status:', error)
      return { data: null, error }
    }
  }

  // Деактивировать город (админ)
  async deactivateCity(cityId) {
    try {
      const { data, error } = await supabase
        .from('cities')
        .update({ is_active: false })
        .eq('id', cityId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error deactivating city:', error)
      return { data: null, error }
    }
  }

  // Сделать город популярным (админ)
  async toggleCityPopular(cityId, isPopular) {
    try {
      const { data, error } = await supabase
        .from('cities')
        .update({ is_popular: isPopular })
        .eq('id', cityId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error toggling city popular status:', error)
      return { data: null, error }
    }
  }

  // Статистика по городам
  async getCitiesStats() {
    try {
      // Получаем количество пользователей по городам
      const { data: userStats, error: userError } = await supabase
        .from('user_profiles')
        .select(`
          city_id,
          cities (
            name,
            region
          )
        `)
        .not('city_id', 'is', null)

      if (userError) throw userError

      // Получаем количество вакансий по городам  
      const { data: jobStats, error: jobError } = await supabase
        .from('job_postings')
        .select(`
          city_id,
          cities (
            name,
            region
          )
        `)
        .not('city_id', 'is', null)

      if (jobError) throw jobError

      // Группируем статистику
      const stats = {}
      
      userStats.forEach(user => {
        if (user.cities) {
          const cityId = user.city_id
          if (!stats[cityId]) {
            stats[cityId] = {
              city: user.cities,
              userCount: 0,
              jobCount: 0
            }
          }
          stats[cityId].userCount++
        }
      })

      jobStats.forEach(job => {
        if (job.cities) {
          const cityId = job.city_id
          if (!stats[cityId]) {
            stats[cityId] = {
              city: job.cities,
              userCount: 0,
              jobCount: 0
            }
          }
          stats[cityId].jobCount++
        }
      })

      return { data: Object.values(stats), error: null }
    } catch (error) {
      console.error('Error fetching cities stats:', error)
      return { data: null, error }
    }
  }
}

export const citiesService = new CitiesService()
