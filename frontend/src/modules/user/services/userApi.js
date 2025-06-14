import { supabase } from '@/lib/supabase'

export default {
  async getJobSeekerProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (error) throw error
    return { data }
  },

  async getEmployerProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        companies (*)
      `)
      .eq('id', user.id)
      .single()
    if (error) throw error
    return { data }
  },

  async updateProfile(profileData) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
    if (error) throw error
    return { data }
  },

  async updateAvatar(file) {
    const { data: { user } } = await supabase.auth.getUser()
    const fileExt = file.name.split('.').pop()
    const filePath = `avatars/${user.id}.${fileExt}`

    // Загрузка файла в storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })
    if (uploadError) throw uploadError

    // Получение публичной ссылки
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Обновление ссылки в профиле
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)
      .select()
    if (error) throw error
    
    return { data }
  }
}
