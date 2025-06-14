import { supabase } from '@/lib/supabase'

export default {
  async createResume(data) {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Если есть файл резюме, сначала загрузим его
    let fileUrl = null
    if (data.file) {
      const fileExt = data.file.name.split('.').pop()
      const filePath = `resumes/${user.id}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, data.file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath)
      fileUrl = publicUrl
    }

    // Создаем запись резюме
    const { data: resume, error } = await supabase
      .from('resumes')
      .insert([{
        ...data,
        user_id: user.id,
        file_url: fileUrl
      }])
      .select()
    if (error) throw error
    return { data: resume }
  },

  async getResumes() {
    const { data, error } = await supabase
      .from('resumes')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { data }
  },

  async getUserResumes() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { data }
  },

  async updateResume(id, data) {
    const { data: resume, error } = await supabase
      .from('resumes')
      .update(data)
      .eq('id', id)
      .select()
    if (error) throw error
    return { data: resume }
  },

  async deleteResume(id) {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id)
    if (error) throw error
    return { data: { id } }
  }
}