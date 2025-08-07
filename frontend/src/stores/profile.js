import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

// ✨ ПРОФИЛЬ STORE - СОГЛАСНО ПЛАНУ ЭТАПА 3
export const useProfileStore = defineStore('profile', () => {
  // Состояние
  const profile = ref(null)
  const resume = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // Геттеры
  const isProfileComplete = computed(() => {
    if (!profile.value) return false
    return !!(profile.value.full_name && profile.value.phone && profile.value.specialization_id)
  })
  
  const hasResume = computed(() => !!resume.value)
  
  const isResumeComplete = computed(() => {
    if (!resume.value) return false
    return !!(resume.value.title && resume.value.description && resume.value.experience_years)
  })
  
  // Действия для профиля
  const fetchProfile = async (userId) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          specializations(name, icon),
          city_districts(name)
        `)
        .eq('user_id', userId)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      
      profile.value = data
      return data
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err)
      error.value = err.message
      
      // Fallback для разработки
      profile.value = {
        id: 1,
        user_id: userId,
        full_name: 'Тестовый пользователь',
        phone: '+7 777 123 45 67',
        avatar_url: null,
        specialization_id: 1,
        district_id: 1,
        experience_years: 3,
        about: 'Опытный специалист общепита',
        specializations: { name: 'Повар', icon: '👨‍🍳' },
        city_districts: { name: 'Есильский район' }
      }
      
      return profile.value
    } finally {
      loading.value = false
    }
  }
  
  const updateProfile = async (profileData) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase
        .from('user_profiles')
        .upsert([profileData])
        .select(`
          *,
          specializations(name, icon),
          city_districts(name)
        `)
        .single()
      
      if (updateError) throw updateError
      
      profile.value = data
      return { success: true, data }
    } catch (err) {
      console.error('Ошибка обновления профиля:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }
  
  const uploadAvatar = async (file, userId) => {
    try {
      loading.value = true
      error.value = null
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}_${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)
      
      // Обновляем профиль с новым URL аватара
      await updateProfile({
        ...profile.value,
        avatar_url: publicUrl
      })
      
      return { success: true, url: publicUrl }
    } catch (err) {
      console.error('Ошибка загрузки аватара:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }
  
  // Действия для резюме
  const fetchResume = async (userId) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('resumes')
        .select(`
          *,
          specializations(name, icon),
          city_districts(name)
        `)
        .eq('user_id', userId)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      
      resume.value = data
      return data
    } catch (err) {
      console.error('Ошибка загрузки резюме:', err)
      error.value = err.message
      
      // Fallback для разработки
      resume.value = {
        id: 1,
        user_id: userId,
        title: 'Повар итальянской кухни',
        description: 'Опытный повар с 5-летним стажем работы в ресторанах',
        experience_years: 5,
        salary_expectation: 300000,
        specialization_id: 1,
        district_id: 1,
        skills: ['Приготовление пасты', 'Выпечка пиццы', 'Соусы'],
        portfolio_urls: [],
        specializations: { name: 'Повар', icon: '👨‍🍳' },
        city_districts: { name: 'Есильский район' }
      }
      
      return resume.value
    } finally {
      loading.value = false
    }
  }
  
  const updateResume = async (resumeData) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase
        .from('resumes')
        .upsert([resumeData])
        .select(`
          *,
          specializations(name, icon),
          city_districts(name)
        `)
        .single()
      
      if (updateError) throw updateError
      
      resume.value = data
      return { success: true, data }
    } catch (err) {
      console.error('Ошибка обновления резюме:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }
  
  const deleteResume = async (resumeId) => {
    try {
      loading.value = true
      error.value = null
      
      const { error: deleteError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
      
      if (deleteError) throw deleteError
      
      resume.value = null
      return { success: true }
    } catch (err) {
      console.error('Ошибка удаления резюме:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }
  
  // Загрузка всех данных пользователя
  const loadUserData = async (userId) => {
    await Promise.all([
      fetchProfile(userId),
      fetchResume(userId)
    ])
  }
  
  // Очистка данных (при выходе)
  const clearData = () => {
    profile.value = null
    resume.value = null
    error.value = null
  }
  
  return {
    // Состояние
    profile,
    resume,
    loading,
    error,
    
    // Геттеры
    isProfileComplete,
    hasResume,
    isResumeComplete,
    
    // Действия профиля
    fetchProfile,
    updateProfile,
    uploadAvatar,
    
    // Действия резюме
    fetchResume,
    updateResume,
    deleteResume,
    
    // Общие действия
    loadUserData,
    clearData
  }
})
