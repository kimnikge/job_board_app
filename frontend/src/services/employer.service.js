// 🏢 employer.service.js — R4 Employer Dashboard
import { supabase, isDemoMode } from './supabase.js'

export const employerService = {
  /**
   * Создать корпоративный бейдж
   */
  async createCompanyBadge(companyId, badgeData) {
    try {
      if (isDemoMode) {
        const mockBadge = {
          id: Date.now().toString(),
          name: badgeData.name,
          description: badgeData.description,
          icon_url: badgeData.icon_url || '🏆',
          category: badgeData.category || 'Company',
          level: badgeData.level || 'Bronze',
          is_company_generated: true,
          company_id: companyId,
          created_at: new Date().toISOString()
        }
        console.log('Demo mode: created company badge', mockBadge)
        return { data: mockBadge, error: null }
      }

      const { data, error } = await supabase.rpc('create_company_badge', {
        p_company_id: companyId,
        p_name: badgeData.name,
        p_description: badgeData.description,
        p_icon_url: badgeData.icon_url || null,
        p_category: badgeData.category || 'Company',
        p_level: badgeData.level || 'Bronze',
        p_skill_bonuses: badgeData.skill_bonuses || {}
      })

      return { data: data?.[0], error }
    } catch (err) {
      console.error('Ошибка создания корпоративного бейджа:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Получить список бейджей компании
   */
  async getCompanyBadges(companyId) {
    try {
      if (isDemoMode) {
        const mockBadges = [
          {
            id: 'company-badge-1',
            name: 'Лучший сотрудник месяца',
            description: 'Выдается лучшему сотруднику каждый месяц',
            category: 'Company',
            level: 'Gold',
            is_company_generated: true,
            company_id: companyId,
            total_awarded: 3
          },
          {
            id: 'company-badge-2',
            name: 'Инновационное решение',
            description: 'За предложение улучшений в рабочем процессе',
            category: 'Company',
            level: 'Silver',
            is_company_generated: true,
            company_id: companyId,
            total_awarded: 1
          }
        ]
        return { data: mockBadges, error: null }
      }

      const { data, error } = await supabase
        .from('badges')
        .select(`
          *,
          user_badges(count)
        `)
        .eq('company_id', companyId)
        .eq('is_company_generated', true)
        .order('created_at', { ascending: false })

      // Добавляем подсчет выданных бейджей
      const badgesWithCounts = data?.map(badge => ({
        ...badge,
        total_awarded: badge.user_badges?.[0]?.count || 0
      }))

      return { data: badgesWithCounts, error }
    } catch (err) {
      console.error('Ошибка получения бейджей компании:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Получить список сотрудников компании
   */
  async getEmployees(companyId) {
    try {
      if (isDemoMode) {
        const mockEmployees = [
          {
            id: 'user-1',
            full_name: 'Алексей Иванов',
            avatar_url: null,
            total_badges: 5,
            total_shifts: 47,
            last_active: '2025-08-10T15:30:00Z',
            badges: [
              { name: '25 Shifts', level: 'Silver' },
              { name: 'Night Owl', level: 'Bronze' }
            ]
          },
          {
            id: 'user-2',
            full_name: 'Мария Петрова',
            avatar_url: null,
            total_badges: 8,
            total_shifts: 73,
            last_active: '2025-08-11T09:15:00Z',
            badges: [
              { name: '50 Shifts', level: 'Gold' },
              { name: 'Reliable Worker', level: 'Silver' }
            ]
          }
        ]
        return { data: mockEmployees, error: null }
      }

      // Запрос сотрудников с агрегированными данными
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          work_logs(shifts_count),
          user_badges(
            badges(name, level)
          )
        `)
        .order('updated_at', { ascending: false })

      if (error) return { data: null, error }

      // Обработка и агрегация данных
      const employees = data.map(employee => ({
        id: employee.id,
        full_name: employee.full_name,
        avatar_url: employee.avatar_url,
        total_badges: employee.user_badges?.length || 0,
        total_shifts: employee.work_logs?.reduce((sum, log) => sum + (log.shifts_count || 0), 0) || 0,
        last_active: employee.updated_at,
        badges: employee.user_badges?.map(ub => ub.badges).slice(0, 3) || [] // Показываем только первые 3
      }))

      return { data: employees, error: null }
    } catch (err) {
      console.error('Ошибка получения сотрудников:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Вручную выдать бейдж сотруднику
   */
  async awardBadgeToEmployee(badgeId, userId, reason, awarderId) {
    try {
      if (isDemoMode) {
        const mockAward = {
          id: Date.now().toString(),
          badge_id: badgeId,
          user_id: userId,
          awarded_by: awarderId,
          source: 'manual',
          reason: reason,
          awarded_at: new Date().toISOString()
        }
        console.log('Demo mode: awarded badge', mockAward)
        return { data: mockAward, error: null }
      }

      const { data, error } = await supabase.rpc('award_manual_badge', {
        p_badge_id: badgeId,
        p_user_id: userId,
        p_reason: reason,
        p_awarded_by: awarderId
      })

      return { data, error }
    } catch (err) {
      console.error('Ошибка выдачи бейджа сотруднику:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Получить каталог всех доступных бейджей (глобальные + корпоративные)
   */
  async getBadgeCatalog(companyId = null) {
    try {
      if (isDemoMode) {
        const mockCatalog = [
          {
            id: 'global-1',
            name: '5 Shifts',
            description: 'Проработать 5 смен',
            category: 'Experience',
            level: 'Bronze',
            is_company_generated: false,
            type: 'automatic'
          },
          {
            id: 'global-2',
            name: 'Night Owl',
            description: 'Работать в ночные смены',
            category: 'Hard Skills',
            level: 'Bronze',
            is_company_generated: false,
            type: 'automatic'
          },
          {
            id: 'company-1',
            name: 'Лучший сотрудник месяца',
            description: 'Корпоративная награда',
            category: 'Company',
            level: 'Gold',
            is_company_generated: true,
            company_id: companyId,
            type: 'manual'
          }
        ]
        return { data: mockCatalog, error: null }
      }

      let query = supabase
        .from('badges')
        .select('*')

      if (companyId) {
        query = query.or(`company_id.is.null,company_id.eq.${companyId}`)
      } else {
        query = query.is('company_id', null)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      // Добавляем тип бейджа для фронтенда
      const catalogWithTypes = data?.map(badge => ({
        ...badge,
        type: badge.is_company_generated ? 'manual' : 'automatic'
      }))

      return { data: catalogWithTypes, error }
    } catch (err) {
      console.error('Ошибка получения каталога бейджей:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Получить статистику компании по бейджам
   */
  async getCompanyStatistics(companyId) {
    try {
      if (isDemoMode) {
        const mockStats = {
          total_employees: 12,
          total_badges_awarded: 47,
          company_badges_created: 3,
          avg_badges_per_employee: 3.9,
          top_categories: [
            { category: 'Experience', count: 18 },
            { category: 'Hard Skills', count: 15 },
            { category: 'Company', count: 8 }
          ],
          recent_awards: [
            {
              user_name: 'Алексей Иванов',
              badge_name: 'Лучший сотрудник месяца',
              awarded_at: '2025-08-10T10:00:00Z'
            }
          ]
        }
        return { data: mockStats, error: null }
      }

      // Сложный запрос статистики (можно оптимизировать с помощью RPC)
      const queries = await Promise.all([
        // Общее количество выданных бейджей
        supabase
          .from('user_badges')
          .select('count')
          .eq('employer_id', companyId),
        
        // Статистика по категориям
        supabase
          .from('user_badges')
          .select('badges(category)')
          .eq('employer_id', companyId),
        
        // Последние награждения
        supabase
          .from('user_badges')
          .select(`
            user_profiles(full_name),
            badges(name),
            awarded_at
          `)
          .eq('employer_id', companyId)
          .order('awarded_at', { ascending: false })
          .limit(5)
      ])

      const [badgeCountResult, categoriesResult, recentResult] = queries

      const stats = {
        total_badges_awarded: badgeCountResult.data?.[0]?.count || 0,
        top_categories: categoriesResult.data ? 
          Object.entries(
            categoriesResult.data.reduce((acc, item) => {
              const cat = item.badges?.category || 'Other'
              acc[cat] = (acc[cat] || 0) + 1
              return acc
            }, {})
          ).map(([category, count]) => ({ category, count })) : [],
        recent_awards: recentResult.data?.map(award => ({
          user_name: award.user_profiles?.full_name || 'Unknown',
          badge_name: award.badges?.name || 'Unknown Badge',
          awarded_at: award.awarded_at
        })) || []
      }

      return { data: stats, error: null }
    } catch (err) {
      console.error('Ошибка получения статистики компании:', err)
      return { data: null, error: err }
    }
  }
}

console.log('✅ Employer service loaded')
