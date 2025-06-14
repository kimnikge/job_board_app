import { supabase } from '@/lib/supabase'

export default {
  // Получить все объявления
  async getJobs() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return { data }
  },

  // Получить объявления текущего работодателя
  async getUserJobs() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', user.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { data }
  },

  // Создать новое объявление
  async createJob(jobData) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('jobs')
      .insert([{ ...jobData, employer_id: user.id }])
      .select()
    if (error) throw error
    return { data }
  },

  // Переключить статус активности объявления
  async toggleJobStatus(id, isActive) {
    const { data, error } = await supabase
      .from('jobs')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
    if (error) throw error
    return { data }
  },

  // Удалить объявление
  async deleteJob(id) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
    if (error) throw error
    return { data: { id } }
  }
}
