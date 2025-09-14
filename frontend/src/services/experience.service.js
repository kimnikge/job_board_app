// 📘 experience.service.js — R1 skeleton
import { supabase } from './supabase.js'

export const experienceService = {
  async list(userId) {
    if (isDemoMode) return { data: [], error: null }
    const { data, error } = await supabase.from('work_logs').select('*').eq('user_id', userId).order('period_from', { ascending: false })
    return { data, error }
  },
  async addEntry(userId, entry) {
    if (isDemoMode) return { data: { id: Date.now(), user_id: userId, ...entry }, error: null }
    const body = { user_id: userId, ...entry }
    const { data, error } = await supabase.from('work_logs').insert([body]).select().single()
    return { data, error }
  },
  async aggregate(userId) {
    if (isDemoMode) return { data: { totalHours: 0, totalShifts: 0 }, error: null }
    const { data, error } = await supabase
      .from('work_logs')
      .select('total_hours, shifts_count')
      .eq('user_id', userId)
    if (error) return { data: null, error }
    const totalHours = data.reduce((a, r) => a + (r.total_hours || 0), 0)
    const totalShifts = data.reduce((a, r) => a + (r.shifts_count || 0), 0)
    return { data: { totalHours, totalShifts }, error: null }
  }
}
console.log('✅ Experience service skeleton ready')
