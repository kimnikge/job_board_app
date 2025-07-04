import { supabase } from '@/lib/supabase'

export default {
  // Получить все резюме текущего пользователя
  async getUserResumes() {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // Создать новое резюме
  async createResume(payload) {
    const { data, error } = await supabase
      .from('resumes')
      .insert([payload])
      .select()
    if (error) throw error
    return data
  },

  // Обновить статус доступности резюме
  async toggleResumeStatus(id, isAvailable) {
    const { data, error } = await supabase
      .from('resumes')
      .update({ is_available: isAvailable })
      .eq('id', id)
      .select()
    if (error) throw error
    return data
  },

  // Удалить резюме
  async deleteResume(id) {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // Получить публичные резюме (для главной страницы)
  async getPublicResumes(limit = 10) {
    const { data, error } = await supabase
      .from('resumes')
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Получить резюме по ID
  async getResumeById(id) {
    const { data, error } = await supabase
      .from('resumes')
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url,
          phone,
          email
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Получить количество публичных резюме
  async getPublicResumesCount() {
    const { count, error } = await supabase
      .from('resumes')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true)
    
    if (error) throw error
    return count
  }
}