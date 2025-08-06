import { supabase } from '@/lib/supabase'

export default {
  async createResume(data) {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Создаем профиль кандидата
    const { data: profile, error } = await supabase
      .from('candidate_profiles')
      .insert([{
        ...data,
        user_id: user.id,
        is_available: true
      }])
      .select()
    if (error) throw error
    return { data: profile }
  },

  async getResumes() {
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select(`
        *,
        specializations (
          name
        ),
        city_districts (
          name
        )
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getPublicResumes(limit = 10) {
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select(`
        *,
        specializations (
          name
        ),
        city_districts (
          name
        )
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  },

  async getUserResumes() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', user.id)
    if (error) throw error
    return data
  },

  async updateResume(id, data) {
    const { data: resume, error } = await supabase
      .from('candidate_profiles')
      .update(data)
      .eq('id', id)
      .select()
    if (error) throw error
    return { data: resume }
  },

  async deleteResume(id) {
    const { error } = await supabase
      .from('candidate_profiles')
      .delete()
      .eq('id', id)
    if (error) throw error
    return { success: true }
  }
}

export const resumeApi = {
  async createResume(data) {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Создаем профиль кандидата
    const { data: profile, error } = await supabase
      .from('candidate_profiles')
      .insert([{
        ...data,
        user_id: user.id,
        is_available: true
      }])
      .select()
    if (error) throw error
    return { data: profile }
  },

  async getPublicResumes(limit = 10) {
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select(`
        *,
        specializations (
          name
        ),
        city_districts (
          name
        )
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data
  }
}