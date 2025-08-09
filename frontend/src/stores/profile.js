import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { profileService } from '../services/profile.service.js'
import { skillsService } from '../services/skills.service.js'
import { badgesService } from '../services/badges.service.js'
import { experienceService } from '../services/experience.service.js'
import { mediaService } from '../services/media.service.js'

// ✨ ПРОФИЛЬ STORE - чистая версия на сервисах
export const useProfileStore = defineStore('profile', () => {
  // Состояние
  const profile = ref(null)
  const resume = ref(null)
  const loading = ref(false)
  const error = ref(null)
  // R1 расширения
  const skills = ref([])
  const badges = ref([])
  const experience = ref([])
  const videoUrl = ref(null)

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

  // Профиль
  const fetchProfile = async (userId) => {
    try {
      loading.value = true
      error.value = null
      const { data, error: fetchError } = await profileService.getProfile(userId)
      if (fetchError) throw fetchError
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
      const { data, error: updateError } = await profileService.upsertProfile(profileData)
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
      const { data, error: uploadError } = await profileService.uploadAvatar(file, userId)
      if (uploadError) throw uploadError
      await updateProfile({ ...profile.value, avatar_url: data.publicUrl })
      return { success: true, url: data.publicUrl }
    } catch (err) {
      console.error('Ошибка загрузки аватара:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Резюме
  const fetchResume = async (userId) => {
    try {
      loading.value = true
      error.value = null
      const { data, error: fetchError } = await profileService.getResume(userId)
      if (fetchError) throw fetchError
      resume.value = data
      return data
    } catch (err) {
      console.error('Ошибка загрузки резюме:', err)
      error.value = err.message
      // Fallback
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
      const { data, error: updateError } = await profileService.upsertResume(resumeData)
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
      if (profileService.deleteResume) {
        const { error: deleteError } = await profileService.deleteResume(resumeId)
        if (deleteError) throw deleteError
      }
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

  // Общие
  const fetchSkills = async (userId) => {
    const { data, error: err } = await skillsService.list(userId)
    if (!err && data) skills.value = data
  }
  const fetchBadges = async (userId) => {
    const { data, error: err } = await badgesService.list(userId)
    if (!err && data) badges.value = data
  }
  const fetchExperience = async (userId) => {
    const { data, error: err } = await experienceService.list(userId)
    if (!err && data) experience.value = data
  }
  const loadUserData = async (userId) => {
    await Promise.all([
      fetchProfile(userId),
      fetchResume(userId),
      fetchSkills(userId),
      fetchBadges(userId),
      fetchExperience(userId)
    ])
  }
  const uploadProfileVideo = async (file, userId) => {
    const { data, error: err } = await mediaService.uploadProfileVideo(userId, file)
    if (!err && data) videoUrl.value = data.url
    return { data, error: err }
  }

  const clearData = () => {
    profile.value = null
    resume.value = null
  error.value = null
  skills.value = []
  badges.value = []
  experience.value = []
  videoUrl.value = null
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

  // Профиль
    fetchProfile,
    updateProfile,
    uploadAvatar,

  // Резюме
    fetchResume,
    updateResume,
    deleteResume,

  // R1 дополнительно
  skills,
  badges,
  experience,
  videoUrl,
  fetchSkills,
  fetchBadges,
  fetchExperience,
  uploadProfileVideo,
  // Общие действия
  loadUserData,
  clearData
  }
})
