// 🏅 badges.service.js — R1 skeleton
import { supabase, isDemoMode } from './supabase.js'

export const badgesService = {
  async list(userId) {
    if (isDemoMode) return { data: [], error: null }
    const { data, error } = await supabase.from('badges').select('*').eq('user_id', userId).order('awarded_at', { ascending: false })
    return { data, error }
  },
  async awardManual(userId, payload) {
    if (isDemoMode) return { data: { id: Date.now(), user_id: userId, ...payload, source: 'manual', awarded_at: new Date().toISOString() }, error: null }
    const body = { user_id: userId, ...payload, source: 'manual' }
    const { data, error } = await supabase.from('badges').insert([body]).select().single()
    return { data, error }
  },
  async listWithSkills(userId) {
    if (isDemoMode) return { data: [], error: null }
    const { data, error } = await supabase
      .from('badges')
      .select(`*, badge_skill_links(delta, skill_name)`) // предполагается отношение
      .eq('user_id', userId)
    return { data, error }
  }
}
console.log('✅ Badges service skeleton ready')
