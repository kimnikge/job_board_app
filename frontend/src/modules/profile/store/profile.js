import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/modules/auth/store/auth'

export const useProfileStore = defineStore('profile', () => {
  const authStore = useAuthStore()
  const profile = ref(null)
  const subscriptions = ref([])
  const applications = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Получение профиля специалиста
  async function fetchProfile() {
    loading.value = true
    error.value = null

    try {
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData.user) {
        throw new Error('Пользователь не авторизован')
      }

      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userData.user.id)
        .single()

      if (supabaseError && supabaseError.code !== 'PGRST116') {
        // PGRST116 - запись не найдена, это нормально если профиль еще не создан
        throw supabaseError
      }

      profile.value = data || null
      return data
    } catch (err) {
      error.value = err.message || 'Ошибка при получении профиля'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Создание профиля специалиста
  async function createProfile(profileData) {
    loading.value = true
    error.value = null

    try {
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData.user) {
        throw new Error('Пользователь не авторизован')
      }

      // Если есть файл аватара, загружаем его в storage
      let avatarUrl = null
      if (profileData.avatar && profileData.avatar instanceof File) {
        avatarUrl = await uploadProfileAvatar(profileData.avatar, userData.user.id)
        delete profileData.avatar // Удаляем файл из данных перед вставкой в БД
      }

      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .insert([{
          ...profileData,
          user_id: userData.user.id,
          avatar_url: avatarUrl
        }])
        .select()

      if (supabaseError) throw supabaseError

      profile.value = data[0]
      return data[0]
    } catch (err) {
      error.value = err.message || 'Ошибка при создании профиля'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Обновление профиля специалиста
  async function updateProfile(profileData) {
    loading.value = true
    error.value = null

    try {
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData.user) {
        throw new Error('Пользователь не авторизован')
      }

      // Если есть файл аватара, загружаем его в storage
      let updateData = { ...profileData }
      if (profileData.avatar && profileData.avatar instanceof File) {
        const avatarUrl = await uploadProfileAvatar(profileData.avatar, userData.user.id)
        updateData.avatar_url = avatarUrl
        delete updateData.avatar // Удаляем файл из данных перед обновлением в БД
      }

      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userData.user.id)
        .select()

      if (supabaseError) throw supabaseError

      profile.value = data[0]
      return data[0]
    } catch (err) {
      error.value = err.message || 'Ошибка при обновлении профиля'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Загрузка аватара профиля
  async function uploadProfileAvatar(file, userId) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Получаем публичную ссылку на файл
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (err) {
      error.value = err.message || 'Ошибка при загрузке аватара'
      throw err
    }
  }

  // Получение списка подписок
  async function fetchSubscriptions() {
    loading.value = true
    error.value = null

    try {
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData.user) {
        throw new Error('Пользователь не авторизован')
      }

      const { data, error: supabaseError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          companies (*)
        `)
        .eq('user_id', userData.user.id)

      if (supabaseError) throw supabaseError

      subscriptions.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Ошибка при получении списка подписок'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Получение списка откликов
  async function fetchApplications() {
    loading.value = true
    error.value = null

    try {
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData.user) {
        throw new Error('Пользователь не авторизован')
      }

      const { data, error: supabaseError } = await supabase
        .from('applications')
        .select(`
          *,
          job_postings (*),
          job_postings (
            companies (*)
          )
        `)
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })

      if (supabaseError) throw supabaseError

      applications.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Ошибка при получении списка откликов'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Удаление отклика
  async function deleteApplication(applicationId) {
    loading.value = true
    error.value = null

    try {
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData.user) {
        throw new Error('Пользователь не авторизован')
      }

      // Проверяем, принадлежит ли отклик текущему пользователю
      const { data: applicationCheck, error: checkError } = await supabase
        .from('applications')
        .select('user_id')
        .eq('id', applicationId)
        .single()

      if (checkError) throw checkError

      if (applicationCheck.user_id !== userData.user.id) {
        throw new Error('У вас нет прав на удаление этого отклика')
      }

      const { error: deleteError } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId)

      if (deleteError) throw deleteError

      // Обновляем список откликов после удаления
      applications.value = applications.value.filter(app => app.id !== applicationId)

      return true
    } catch (err) {
      error.value = err.message || 'Ошибка при удалении отклика'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Обновление настроек уведомлений
  async function updateNotificationSettings(settings) {
    loading.value = true
    error.value = null

    try {
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData.user) {
        throw new Error('Пользователь не авторизован')
      }

      // Проверяем, существует ли профиль
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userData.user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      let result
      
      if (!profileData) {
        // Если профиля нет, создаем новый с настройками уведомлений
        const { data, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            user_id: userData.user.id,
            notification_settings: settings
          }])
          .select()

        if (insertError) throw insertError
        result = data[0]
      } else {
        // Если профиль есть, обновляем настройки уведомлений
        const { data, error: updateError } = await supabase
          .from('profiles')
          .update({
            notification_settings: settings
          })
          .eq('user_id', userData.user.id)
          .select()

        if (updateError) throw updateError
        result = data[0]
      }

      // Обновляем локальный профиль
      if (profile.value) {
        profile.value.notification_settings = settings
      } else {
        profile.value = result
      }

      return result
    } catch (err) {
      error.value = err.message || 'Ошибка при обновлении настроек уведомлений'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    profile,
    subscriptions,
    applications,
    loading,
    error,
    fetchProfile,
    createProfile,
    updateProfile,
    uploadProfileAvatar,
    fetchSubscriptions,
    fetchApplications,
    deleteApplication,
    updateNotificationSettings
  }
})
