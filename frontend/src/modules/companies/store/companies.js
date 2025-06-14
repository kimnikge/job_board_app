import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/modules/auth/store/auth'

export const useCompaniesStore = defineStore('companies', () => {
  const authStore = useAuthStore()
  const companies = ref([])
  const currentCompany = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Получение списка компаний
  async function fetchCompanies(params = {}) {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true })

      // Применяем фильтры из параметров
      if (params.name) {
        query = query.ilike('name', `%${params.name}%`)
      }
      
      if (params.industry) {
        query = query.eq('industry', params.industry)
      }
      
      // Пагинация
      if (params.limit) {
        query = query.limit(params.limit)
      }
      
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
      }

      const { data, error: supabaseError } = await query

      if (supabaseError) throw supabaseError

      companies.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Ошибка при получении списка компаний'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Получение компании по ID
  async function fetchCompanyById(id) {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('companies')
        .select(`
          *,
          job_postings(*)
        `)
        .eq('id', id)
        .single()

      if (supabaseError) throw supabaseError

      currentCompany.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Ошибка при получении информации о компании'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Получение компании текущего пользователя
  async function fetchMyCompany() {
    loading.value = true
    error.value = null

    try {
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData.user) {
        throw new Error('Пользователь не авторизован')
      }

      const { data, error: supabaseError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userData.user.id)
        .single()

      if (supabaseError && supabaseError.code !== 'PGRST116') {
        // PGRST116 - запись не найдена, это нормально если компания еще не создана
        throw supabaseError
      }

      currentCompany.value = data || null
      return data
    } catch (err) {
      error.value = err.message || 'Ошибка при получении информации о компании'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Создание профиля компании
  async function createCompany(companyData) {
    loading.value = true
    error.value = null

    try {
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData.user) {
        throw new Error('Пользователь не авторизован')
      }

      // Если есть файл логотипа, загружаем его в storage
      let logoUrl = null
      if (companyData.logo && companyData.logo instanceof File) {
        logoUrl = await uploadCompanyLogo(companyData.logo, userData.user.id)
        delete companyData.logo // Удаляем файл из данных перед вставкой в БД
      }

      const { data, error: supabaseError } = await supabase
        .from('companies')
        .insert([{
          ...companyData,
          user_id: userData.user.id,
          logo_url: logoUrl
        }])
        .select()

      if (supabaseError) throw supabaseError

      currentCompany.value = data[0]
      return data[0]
    } catch (err) {
      error.value = err.message || 'Ошибка при создании профиля компании'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Обновление профиля компании
  async function updateCompany(id, companyData) {
    loading.value = true
    error.value = null

    try {
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData.user) {
        throw new Error('Пользователь не авторизован')
      }

      // Проверяем, принадлежит ли компания текущему пользователю
      const { data: companyCheck, error: checkError } = await supabase
        .from('companies')
        .select('user_id')
        .eq('id', id)
        .single()

      if (checkError) throw checkError

      if (companyCheck.user_id !== userData.user.id) {
        throw new Error('У вас нет прав на редактирование этой компании')
      }

      // Если есть файл логотипа, загружаем его в storage
      let updateData = { ...companyData }
      if (companyData.logo && companyData.logo instanceof File) {
        const logoUrl = await uploadCompanyLogo(companyData.logo, userData.user.id)
        updateData.logo_url = logoUrl
        delete updateData.logo // Удаляем файл из данных перед обновлением в БД
      }

      const { data, error: supabaseError } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', id)
        .select()

      if (supabaseError) throw supabaseError

      currentCompany.value = data[0]
      return data[0]
    } catch (err) {
      error.value = err.message || 'Ошибка при обновлении профиля компании'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Загрузка логотипа компании
  async function uploadCompanyLogo(file, userId) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `company-${userId}-${Date.now()}.${fileExt}`
      const filePath = `company-logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('companies')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Получаем публичную ссылку на файл
      const { data } = supabase.storage
        .from('companies')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (err) {
      error.value = err.message || 'Ошибка при загрузке логотипа'
      throw err
    }
  }

  // Подписка на компанию
  async function subscribeToCompany(companyId) {
    loading.value = true
    error.value = null

    try {
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData.user) {
        throw new Error('Пользователь не авторизован')
      }

      const { data, error: supabaseError } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: userData.user.id,
          company_id: companyId
        }])
        .select()

      if (supabaseError) throw supabaseError

      return data[0]
    } catch (err) {
      error.value = err.message || 'Ошибка при оформлении подписки'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Отписка от компании
  async function unsubscribeFromCompany(companyId) {
    loading.value = true
    error.value = null

    try {
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData.user) {
        throw new Error('Пользователь не авторизован')
      }

      const { error: supabaseError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userData.user.id)
        .eq('company_id', companyId)

      if (supabaseError) throw supabaseError

      return true
    } catch (err) {
      error.value = err.message || 'Ошибка при отмене подписки'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Проверка, подписан ли пользователь на компанию
  async function checkSubscription(companyId) {
    try {
      const { data: userData } = await supabase.auth.getUser()
      
      if (!userData.user) {
        return false
      }

      const { data, error: supabaseError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userData.user.id)
        .eq('company_id', companyId)
        .single()

      if (supabaseError && supabaseError.code !== 'PGRST116') {
        throw supabaseError
      }

      return !!data
    } catch (err) {
      error.value = err.message || 'Ошибка при проверке подписки'
      return false
    }
  }

  return {
    companies,
    currentCompany,
    loading,
    error,
    fetchCompanies,
    fetchCompanyById,
    fetchMyCompany,
    createCompany,
    updateCompany,
    uploadCompanyLogo,
    subscribeToCompany,
    unsubscribeFromCompany,
    checkSubscription
  }
})
