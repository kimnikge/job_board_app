import { supabase } from '@/lib/supabase'

const urgentJobsService = {
  // Простой метод для главной страницы
  async getUrgentJobs(limit = 6) {
    try {
      console.log('Загружаем срочные вакансии...')
      
      const { data: jobs, error } = await supabase
        .from('urgent_jobs')
        .select(`
          *,
          specializations (
            name
          ),
          city_districts (
            name
          ),
          venue_types (
            name
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching urgent jobs:', error)
        // Возвращаем тестовые данные в случае ошибки
        return [
          {
            id: '1',
            title: 'Повар-тест (заглушка)',
            venue_name: 'Тестовый ресторан',
            pay_per_shift: 3000,
            needed_date: new Date().toISOString().split('T')[0],
            needed_time: '10:00',
            specializations: { name: 'Повар' },
            city_districts: { name: 'Центр' },
            venue_types: { name: 'Ресторан' }
          }
        ]
      }

      console.log('Загружено вакансий:', jobs?.length || 0)
      return jobs || []
    } catch (error) {
      console.error('Error in getUrgentJobs:', error)
      // Возвращаем тестовые данные в случае ошибки
      return [
        {
          id: '1',
          title: 'Повар-тест (заглушка)',
          venue_name: 'Тестовый ресторан',
          pay_per_shift: 3000,
          needed_date: new Date().toISOString().split('T')[0],
          needed_time: '10:00',
          specializations: { name: 'Повар' },
          city_districts: { name: 'Центр' },
          venue_types: { name: 'Ресторан' }
        }
      ]
    }
  },

  // Получить статистику
  async getStats() {
    try {
      const { count: totalCount } = await supabase
        .from('urgent_jobs')
        .select('*', { count: 'exact', head: true })

      const { count: activeCount } = await supabase
        .from('urgent_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      return {
        total: totalCount || 0,
        active: activeCount || 0
      }
    } catch (error) {
      console.error('Error getting stats:', error)
      return {
        total: 0,
        active: 0
      }
    }
  }
}

export default urgentJobsService
