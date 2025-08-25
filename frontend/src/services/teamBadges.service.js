// R6: Team Badges Service (beta)
// Методы для работы с командными бейджами (team_badges)
import { supabase, isDemoMode } from './supabase.js'

export const teamBadgesService = {
  /**
   * Получить командные бейджи по team_id
   */
  async list(teamId) {
    if (isDemoMode) {
      return {
        data: [
          {
            id: 'team-badge-1',
            team_id: teamId,
            badge_id: 'badge-team-player',
            awarded_at: '2025-08-10T10:00:00Z',
            reason: 'Успешный запуск проекта',
            badge: {
              name: 'Team Player',
              level: 'Gold',
              is_rare: true
            }
          }
        ],
        error: null
      }
    }
    const { data, error } = await supabase
      .from('team_badges')
      .select(`*, badge:badge_id(*)`)
      .eq('team_id', teamId)
      .order('awarded_at', { ascending: false })
    return { data, error }
  },

  /**
   * Назначить командный бейдж
   */
  async award(teamId, badgeId, reason) {
    if (isDemoMode) {
      return {
        data: {
          id: Date.now().toString(),
          team_id: teamId,
          badge_id: badgeId,
          awarded_at: new Date().toISOString(),
          reason
        },
        error: null
      }
    }
    const { data, error } = await supabase
      .from('team_badges')
      .insert({ team_id: teamId, badge_id: badgeId, reason })
      .select()
      .single()
    return { data, error }
  }
}

console.log('✅ teamBadgesService R6 ready')
