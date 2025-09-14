// 🛠 skills.service.js — R1 skeleton
import { supabase } from './supabase.js'

export const skillsService = {
  async list(userId) {
    if (isDemoMode) return { data: [], error: null }
    const { data, error } = await supabase.from('skills').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
    return { data, error }
  },
  async upsert(userId, { name, baseLevel }) {
    if (isDemoMode) return { data: { id: Date.now(), user_id: userId, name, base_level: baseLevel, calculated_level: baseLevel }, error: null }
    const payload = { user_id: userId, name, base_level: baseLevel }
    const { data, error } = await supabase.from('skills').upsert([payload]).select().single()
    return { data, error }
  },
  async recalc(userId) {
    if (isDemoMode) return { data: [], error: null }
    const { data, error } = await supabase.rpc('recalc_skills', { p_user_id: userId })
    return { data, error }
  }
}
console.log('✅ Skills service skeleton ready')
