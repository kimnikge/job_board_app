// 🏅 badges.service.js — R4 Extended Badge Service
import { supabase, isDemoMode } from './supabase.js'

export const badgesService = {
  /**
   * Получить бейджи пользователя (R1 function enhanced)
   */
  async list(userId) {
    try {
      if (isDemoMode) {
        // Демо-данные бейджей для тестирования
        const demoBadges = [
          {
            id: 'demo-badge-1',
            user_id: userId,
            employer_id: 'demo-employer-1',
            awarded_by: 'demo-manager-1',
            awarded_at: '2025-08-10T10:00:00Z',
            reason: 'Отличная работа в кофейне',
            source: 'manual',
            badges: {
              id: 'badge-barista-bronze',
              name: 'Barista Bronze',
              description: 'Базовые навыки бариста',
              icon_url: '☕',
              category: 'Hard Skills',
              level: 'Bronze',
              is_company_generated: false,
              company_id: null
            },
            employers: {
              name: 'Кофейня "Утро"',
              logo_url: '/images/cafe-logo.png'
            }
          },
          {
            id: 'demo-badge-2',
            user_id: userId,
            employer_id: 'demo-employer-1',
            awarded_by: 'demo-manager-1',
            awarded_at: '2025-08-09T15:30:00Z',
            reason: 'Командная работа',
            source: 'auto',
            badges: {
              id: 'badge-team-player',
              name: 'Team Player',
              description: 'Командный игрок',
              icon_url: '🤝',
              category: 'Soft Skills',
              level: 'Bronze',
              is_company_generated: false,
              company_id: null
            },
            employers: {
              name: 'Кофейня "Утро"',
              logo_url: '/images/cafe-logo.png'
            }
          },
          {
            id: 'demo-badge-3',
            user_id: userId,
            employer_id: 'demo-employer-2',
            awarded_by: 'demo-manager-2',
            awarded_at: '2025-08-08T12:00:00Z',
            reason: 'Корпоративная награда за месяц',
            source: 'manual',
            badges: {
              id: 'badge-company-best',
              name: 'Лучший бариста месяца',
              description: 'Награда за отличную работу',
              icon_url: '🏆',
              category: 'Other',
              level: 'Gold',
              is_company_generated: true,
              company_id: 'demo-employer-2'
            },
            employers: {
              name: 'Ресторан "Вечер"',
              logo_url: '/images/restaurant-logo.png'
            }
          }
        ]
        return { data: demoBadges, error: null }
      }
      
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          id,
          user_id,
          employer_id,
          awarded_by,
          awarded_at,
          reason,
          source,
          badges!inner(
            id,
            name,
            description,
            icon_url,
            category,
            level,
            is_company_generated,
            company_id
          ),
          employers(name, logo_url)
        `)
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false })
      
      return { data, error }
    } catch (err) {
      console.error('Ошибка загрузки бейджей:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Выдать бейдж вручную (R4 enhanced)
   */
  async awardBadge(badgeId, userId, reason, awarderId = null) {
    try {
      if (isDemoMode) {
        const mockAward = {
          id: Date.now(),
          badge_id: badgeId,
          user_id: userId,
          awarded_by: awarderId,
          source: 'manual',
          reason: reason,
          awarded_at: new Date().toISOString()
        }
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
      console.error('Ошибка выдачи бейджа:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Получить бейджи с влиянием на навыки (R1 enhanced)
   */
  async listWithSkills(userId) {
    try {
      if (isDemoMode) return { data: [], error: null }
      
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          id,
          awarded_at,
          reason,
          source,
          badges!inner(
            id,
            name,
            description,
            category,
            level,
            badge_skill_links(
              skill_name,
              delta
            )
          )
        `)
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false })
      
      return { data, error }
    } catch (err) {
      console.error('Ошибка загрузки бейджей с навыками:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Создать корпоративный бейдж (R4 new)
   */
  async createCompanyBadge(companyId, badgeData) {
    try {
      if (isDemoMode) {
        const mockBadge = {
          id: Date.now().toString(),
          ...badgeData,
          is_company_generated: true,
          company_id: companyId,
          created_at: new Date().toISOString()
        }
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
   * Получить каталог доступных бейджей (R4 new)
   */
  async getCatalog(companyId = null) {
    try {
      if (isDemoMode) {
        const mockCatalog = [
          {
            id: 'badge-1',
            name: '5 Shifts',
            description: 'Проработать 5 смен',
            category: 'Experience',
            level: 'Bronze',
            is_company_generated: false
          },
          {
            id: 'badge-2',
            name: 'Night Owl',
            description: 'Работать в ночные смены',
            category: 'Hard Skills',
            level: 'Bronze',
            is_company_generated: false
          }
        ]
        return { data: mockCatalog, error: null }
      }

      let query = supabase
        .from('badges')
        .select(`
          id,
          name,
          description,
          icon_url,
          category,
          level,
          is_company_generated,
          company_id,
          created_at
        `)

      if (companyId) {
        query = query.or(`company_id.is.null,company_id.eq.${companyId}`)
      } else {
        query = query.is('company_id', null)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      return { data, error }
    } catch (err) {
      console.error('Ошибка загрузки каталога бейджей:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Получить детали конкретного бейджа (R4 new)
   */
  async getById(badgeId) {
    try {
      if (isDemoMode) {
        const mockBadge = {
          id: badgeId,
          name: 'Sample Badge',
          description: 'This is a sample badge',
          category: 'Experience',
          level: 'Bronze'
        }
        return { data: mockBadge, error: null }
      }

      const { data, error } = await supabase
        .from('badges')
        .select(`
          *,
          badge_skill_links(skill_name, delta),
          user_badges(count)
        `)
        .eq('id', badgeId)
        .single()

      return { data, error }
    } catch (err) {
      console.error('Ошибка загрузки детали бейджа:', err)
      return { data: null, error: err }
    }
  },

  /**
   * Удалить корпоративный бейдж (R4 new)
   */
  async deleteCompanyBadge(badgeId, companyId) {
    try {
      if (isDemoMode) {
        console.log('Demo mode: deleted badge', badgeId)
        return { data: { success: true }, error: null }
      }

      // Проверяем, что бейдж принадлежит компании
      const { data, error } = await supabase
        .from('badges')
        .delete()
        .eq('id', badgeId)
        .eq('company_id', companyId)
        .eq('is_company_generated', true)

      return { data, error }
    } catch (err) {
      console.error('Ошибка удаления корпоративного бейджа:', err)
      return { data: null, error: err }
    }
  }
}

console.log('✅ Badges service R4 ready')
