import { supabase } from '@/lib/supabase'

export default {
  // Создать отклик
  async createApplication(data) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: application, error } = await supabase
      .from('applications')
      .insert([{ ...data, applicant_id: user.id }])
      .select()
    if (error) throw error
    return { data: application }
  },

  // Получить свои отклики (соискатель)
  async getMyApplications() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs:job_id (*)
      `)
      .eq('applicant_id', user.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { data }
  },

  // Получить отклики на мои вакансии (работодатель)
  async getEmployerApplications() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs:job_id (*),
        profiles:applicant_id (*)
      `)
      .eq('jobs.employer_id', user.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { data }
  },

  // Изменить статус отклика (работодатель)
  async updateApplicationStatus(id, status, comment) {
    const { data, error } = await supabase
      .from('applications')
      .update({ 
        status,
        employer_comment: comment,
        responded_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    if (error) throw error
    return { data }
  },

  // Получить историю статусов отклика
  async getApplicationHistory(id) {
    const { data, error } = await supabase
      .from('application_history')
      .select('*')
      .eq('application_id', id)
      .order('created_at', { ascending: true })
    if (error) throw error
    return { data }
  }
}
