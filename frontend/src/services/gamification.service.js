// 🎮 gamification.service.js — R4 Gamification Engine
import { supabase, isDemoMode } from './supabase.js'

export const gamificationService = {
  /**
   * Пересчитать навыки пользователя с учетом бейджей
   */
  async recalcSkills(userId) {
    try {
      if (isDemoMode) {
        console.log('Demo mode: recalcSkills called for user', userId)
        return { data: { success: true, message: 'Skills recalculated (demo)' }, error: null }
      }

      const { data, error } = await supabase.rpc('recalc_skills', { 
        p_user_id: userId 
      })
      
      return { data, error }
    } catch (err) {
      console.error('Ошибка пересчета навыков:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Получить прогресс пользователя по категориям бейджей
   */
  async getProgress(userId) {
    try {
      if (isDemoMode) {
        const mockProgress = {
          total_badges: 8,
          categories: {
            'Hard Skills': { earned: 3, total: 8 },
            'Soft Skills': { earned: 2, total: 6 },
            'Experience': { earned: 2, total: 4 },
            'Recommendations': { earned: 1, total: 3 }
          },
          levels: {
            'Bronze': 5,
            'Silver': 2,
            'Gold': 1,
            'Platinum': 0
          }
        }
        return { data: mockProgress, error: null }
      }

      // Запрос статистики по бейджам пользователя
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          badges!inner(category, level)
        `)
        .eq('user_id', userId)

      if (error) return { data: null, error }

      // Агрегируем данные
      const progress = {
        total_badges: data.length,
        categories: {},
        levels: { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0 }
      }

      data.forEach(item => {
        const { category, level } = item.badges
        
        // Подсчет по категориям
        if (!progress.categories[category]) {
          progress.categories[category] = { earned: 0, total: 0 }
        }
        progress.categories[category].earned++

        // Подсчет по уровням
        if (progress.levels[level] !== undefined) {
          progress.levels[level]++
        }
      })

      return { data: progress, error: null }
    } catch (err) {
      console.error('Ошибка получения прогресса:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Получить статистику достижений пользователя
   */
  async getStatistics(userId) {
    try {
      if (isDemoMode) {
        const mockStats = {
          user_id: userId,
          total_work_logs: 15,
          total_shifts: 47,
          total_hours: 235,
          badges_auto: 6,
          badges_manual: 2,
          skills_with_bonuses: 4,
          avg_skill_level: 65,
          recent_achievements: [
            { badge_name: '25 Shifts', awarded_at: '2025-08-10T10:00:00Z' },
            { badge_name: 'Night Owl', awarded_at: '2025-08-09T15:30:00Z' }
          ]
        }
        return { data: mockStats, error: null }
      }

      // Комплексный запрос статистики
      const { data, error } = await supabase.rpc('get_user_profile_full', {
        p_user_id: userId
      })

      if (error) return { data: null, error }

      // Дополнительные вычисления
      const stats = {
        ...data,
        avg_skill_level: data.skills ? 
          Math.round(data.skills.reduce((sum, skill) => sum + skill.calculated_level, 0) / data.skills.length) : 0,
        skills_with_bonuses: data.skills ? 
          data.skills.filter(skill => skill.calculated_level > skill.base_level).length : 0
      }

      return { data: stats, error: null }
    } catch (err) {
      console.error('Ошибка получения статистики:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Получить доступные для получения бейджи
   */
  async getAvailableBadges(userId, companyId = null) {
    try {
      if (isDemoMode) {
        const mockAvailable = [
          {
            id: 'badge-001',
            name: '50 Shifts',
            description: 'Проработать 50 смен',
            category: 'Experience',
            level: 'Silver',
            progress: { current: 47, required: 50 }
          },
          {
            id: 'badge-002', 
            name: 'Team Player',
            description: 'Получить 5 положительных отзывов',
            category: 'Soft Skills',
            level: 'Bronze',
            progress: { current: 3, required: 5 }
          }
        ]
        return { data: mockAvailable, error: null }
      }

      let query = supabase
        .from('badges')
        .select('*')
        .not('id', 'in', `(
          SELECT badge_id FROM user_badges WHERE user_id = '${userId}'
        )`)

      if (companyId) {
        query = query.or(`company_id.is.null,company_id.eq.${companyId}`)
      } else {
        query = query.is('company_id', null)
      }

      const { data, error } = await query

      return { data, error }
    } catch (err) {
      console.error('Ошибка получения доступных бейджей:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Проверить условия автоматической выдачи бейджей
   */
  async checkAutoAwards(userId) {
    try {
      if (isDemoMode) {
        console.log('Demo mode: checkAutoAwards called for user', userId)
        return { data: { checked: true, awarded: 0 }, error: null }
      }

      // Вызываем триггер пересчета (может быть выделено в отдельную RPC)
      const { data, error } = await supabase.rpc('check_badge_conditions', {
        p_user_id: userId
      })

      return { data, error }
    } catch (err) {
      console.error('Ошибка проверки автонаград:', err)
      return { data: null, error: err }
    }
  }
}

console.log('✅ Gamification service loaded')
