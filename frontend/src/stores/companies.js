import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

// ✨ КОМПАНИИ STORE - СОГЛАСНО ПЛАНУ ЭТАПА 3
export const useCompaniesStore = defineStore('companies', () => {
  // Состояние
  const companies = ref([])
  const currentCompany = ref(null)
  const employerProfile = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const filters = ref({
    district: null,
    venueType: null,
    hasJobs: false
  })
  
  // Геттеры
  const filteredCompanies = computed(() => {
    let result = companies.value
    
    if (filters.value.district) {
      result = result.filter(company => company.district_id === filters.value.district)
    }
    
    if (filters.value.venueType) {
      result = result.filter(company => company.venue_type_id === filters.value.venueType)
    }
    
    if (filters.value.hasJobs) {
      result = result.filter(company => company.active_jobs_count > 0)
    }
    
    return result
  })
  
  const topCompanies = computed(() => {
    return companies.value
      .filter(company => company.rating > 4.0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6)
  })
  
  // Действия для получения данных
  const fetchCompanies = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('companies')
        .select(`
          *,
          city_districts(name),
          venue_types(name, icon),
          job_postings(count)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      companies.value = data || []
    } catch (err) {
      console.error('Ошибка загрузки компаний:', err)
      error.value = err.message
      
      // Fallback данные для разработки
      companies.value = [
        {
          id: 1,
          name: 'Grand Restaurant',
          description: 'Премиальный ресторан с изысканной кухней',
          logo_url: '/images/default-company.png',
          rating: 4.8,
          active_jobs_count: 3,
          city_districts: { name: 'Есильский район' },
          venue_types: { name: 'Ресторан', icon: '🍽️' },
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Coffee Dreams',
          description: 'Уютная кофейня в центре города',
          logo_url: '/images/default-company.png',
          rating: 4.5,
          active_jobs_count: 2,
          city_districts: { name: 'Алматинский район' },
          venue_types: { name: 'Кофейня', icon: '☕' },
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Pizza Italia',
          description: 'Аутентичная итальянская пиццерия',
          logo_url: '/images/default-company.png',
          rating: 4.7,
          active_jobs_count: 1,
          city_districts: { name: 'Сарыарка' },
          venue_types: { name: 'Пиццерия', icon: '🍕' },
          created_at: new Date().toISOString()
        }
      ]
    } finally {
      loading.value = false
    }
  }
  
  const fetchCompanyById = async (id) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('companies')
        .select(`
          *,
          city_districts(name),
          venue_types(name, icon),
          job_postings(id, title, salary_from, salary_to, created_at)
        `)
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError
      
      currentCompany.value = data
      return data
    } catch (err) {
      console.error('Ошибка загрузки компании:', err)
      error.value = err.message
      
      // Fallback данные
      const mockCompany = {
        id: parseInt(id),
        name: 'Тестовая компания',
        description: 'Описание тестовой компании',
        logo_url: '/images/default-company.png',
        rating: 4.5,
        city_districts: { name: 'Есильский район' },
        venue_types: { name: 'Ресторан', icon: '🍽️' },
        job_postings: [
          {
            id: 1,
            title: 'Повар',
            salary_from: 200000,
            salary_to: 300000,
            created_at: new Date().toISOString()
          }
        ]
      }
      
      currentCompany.value = mockCompany
      return mockCompany
    } finally {
      loading.value = false
    }
  }
  
  // Действия для работодателя
  const fetchEmployerProfile = async (userId) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('companies')
        .select(`
          *,
          city_districts(name),
          venue_types(name, icon)
        `)
        .eq('owner_id', userId)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      
      employerProfile.value = data
      return data
    } catch (err) {
      console.error('Ошибка загрузки профиля работодателя:', err)
      error.value = err.message
      
      // Fallback для разработки
      employerProfile.value = {
        id: 1,
        owner_id: userId,
        name: 'Моя компания',
        description: 'Описание моей компании',
        logo_url: null,
        rating: 0,
        venue_type_id: 1,
        district_id: 1,
        address: 'ул. Примерная, 123',
        phone: '+7 777 123 45 67',
        email: 'info@mycompany.kz',
        city_districts: { name: 'Есильский район' },
        venue_types: { name: 'Ресторан', icon: '🍽️' }
      }
      
      return employerProfile.value
    } finally {
      loading.value = false
    }
  }
  
  const updateCompany = async (companyData) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase
        .from('companies')
        .upsert([companyData])
        .select(`
          *,
          city_districts(name),
          venue_types(name, icon)
        `)
        .single()
      
      if (updateError) throw updateError
      
      employerProfile.value = data
      
      // Обновляем в общем списке компаний если есть
      const index = companies.value.findIndex(c => c.id === data.id)
      if (index !== -1) {
        companies.value[index] = data
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Ошибка обновления компании:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }
  
  const uploadLogo = async (file, companyId) => {
    try {
      loading.value = true
      error.value = null
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${companyId}_${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('companies')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage
        .from('companies')
        .getPublicUrl(filePath)
      
      // Обновляем компанию с новым URL логотипа
      await updateCompany({
        ...employerProfile.value,
        logo_url: publicUrl
      })
      
      return { success: true, url: publicUrl }
    } catch (err) {
      console.error('Ошибка загрузки логотипа:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }
  
  // Статистика для дашборда работодателя
  const fetchCompanyStats = async (companyId) => {
    try {
      loading.value = true
      error.value = null
      
      const [jobsResponse, applicationsResponse] = await Promise.all([
        supabase
          .from('job_postings')
          .select('id, status')
          .eq('company_id', companyId),
        supabase
          .from('job_applications')
          .select('id, status, job_postings!inner(company_id)')
          .eq('job_postings.company_id', companyId)
      ])
      
      const jobs = jobsResponse.data || []
      const applications = applicationsResponse.data || []
      
      return {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'active').length,
        totalApplications: applications.length,
        newApplications: applications.filter(a => a.status === 'pending').length
      }
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err)
      
      // Fallback статистика
      return {
        totalJobs: 5,
        activeJobs: 3,
        totalApplications: 12,
        newApplications: 4
      }
    } finally {
      loading.value = false
    }
  }
  
  // Фильтрация
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }
  
  const clearFilters = () => {
    filters.value = {
      district: null,
      venueType: null,
      hasJobs: false
    }
  }
  
  // Очистка данных
  const clearData = () => {
    companies.value = []
    currentCompany.value = null
    employerProfile.value = null
    error.value = null
  }
  
  return {
    // Состояние
    companies,
    currentCompany,
    employerProfile,
    loading,
    error,
    filters,
    
    // Геттеры
    filteredCompanies,
    topCompanies,
    
    // Действия
    fetchCompanies,
    fetchCompanyById,
    fetchEmployerProfile,
    updateCompany,
    uploadLogo,
    fetchCompanyStats,
    updateFilters,
    clearFilters,
    clearData
  }
})
