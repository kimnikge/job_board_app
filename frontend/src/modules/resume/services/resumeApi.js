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
  }
}