import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

// ✨ ЕДИНЫЙ JOBS STORE - СОГЛАСНО ПЛАНУ ЭТАПА 3
// Объединяет обычные и срочные вакансии в одном месте
export const useJobsStore = defineStore('jobs', () => {
  // Состояние
  const jobs = ref([])
  const urgentJobs = ref([])
  const currentJob = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const filters = ref({
    specialization: null,
    district: null,
    salaryFrom: null,
    salaryTo: null,
    schedule: null,
    experience: null
  })
  
  // Геттеры
  const allJobs = computed(() => [...jobs.value, ...urgentJobs.value])
  const regularJobs = computed(() => jobs.value)
  const urgentJobsList = computed(() => urgentJobs.value)
  const filteredJobs = computed(() => {
    let result = allJobs.value
    
    if (filters.value.specialization) {
      result = result.filter(job => job.specialization_id === filters.value.specialization)
    }
    
    if (filters.value.district) {
      result = result.filter(job => job.district_id === filters.value.district)
    }
    
    if (filters.value.salaryFrom) {
      result = result.filter(job => job.salary_from >= filters.value.salaryFrom)
    }
    
    if (filters.value.salaryTo) {
      result = result.filter(job => job.salary_to <= filters.value.salaryTo)
    }
    
    return result
  })
  
  // Действия для получения данных
  const fetchJobs = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('job_postings')
        .select(`
          *,
          specializations(name, icon),
          city_districts(name),
          venue_types(name, icon),
          companies(name, logo_url)
        `)
        .eq('is_urgent', false)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      jobs.value = data || []
    } catch (err) {
      console.error('Ошибка загрузки вакансий:', err)
      error.value = err.message
      
      // Fallback данные для разработки
      jobs.value = [
        {
          id: 1,
          title: 'Повар итальянской кухни',
          description: 'Требуется опытный повар для ресторана итальянской кухни',
          salary_from: 200000,
          salary_to: 350000,
          specializations: { name: 'Повар', icon: '👨‍🍳' },
          city_districts: { name: 'Есильский район' },
          companies: { name: 'Mama Mia Restaurant', logo_url: null },
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Официант в кафе',
          description: 'Приглашаем официанта в уютное кафе в центре города',
          salary_from: 150000,
          salary_to: 250000,
          specializations: { name: 'Официант', icon: '🤵' },
          city_districts: { name: 'Алматинский район' },
          companies: { name: 'Coffee Dreams', logo_url: null },
          created_at: new Date().toISOString()
        }
      ]
    } finally {
      loading.value = false
    }
  }
  
  const fetchUrgentJobs = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('urgent_jobs')
        .select(`
          *,
          specializations(name, icon),
          city_districts(name),
          venue_types(name, icon),
          companies(name, logo_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      urgentJobs.value = data || []
    } catch (err) {
      console.error('Ошибка загрузки срочных вакансий:', err)
      error.value = err.message
      
      // Fallback данные
      urgentJobs.value = [
        {
          id: 101,
          title: 'СРОЧНО! Повар на замену',
          description: 'Требуется повар на замену заболевшего сотрудника',
          salary_from: 15000,
          salary_to: 20000,
          work_date: new Date().toISOString().split('T')[0],
          specializations: { name: 'Повар', icon: '👨‍🍳' },
          city_districts: { name: 'Сарыарка' },
          companies: { name: 'Grand Restaurant', logo_url: null },
          is_urgent: true,
          created_at: new Date().toISOString()
        }
      ]
    } finally {
      loading.value = false
    }
  }
  
  const fetchJobById = async (id) => {
    try {
      loading.value = true
      error.value = null
      
      // Сначала ищем в обычных вакансиях
      let { data, error: fetchError } = await supabase
        .from('job_postings')
        .select(`
          *,
          specializations(name, icon),
          city_districts(name),
          venue_types(name, icon),
          companies(name, logo_url, description)
        `)
        .eq('id', id)
        .single()
      
      if (fetchError) {
        // Если не найдено, ищем в срочных
        const { data: urgentData, error: urgentError } = await supabase
          .from('urgent_jobs')
          .select(`
            *,
            specializations(name, icon),
            city_districts(name),
            venue_types(name, icon),
            companies(name, logo_url, description)
          `)
          .eq('id', id)
          .single()
        
        if (urgentError) throw urgentError
        data = urgentData
      }
      
      currentJob.value = data
      return data
    } catch (err) {
      console.error('Ошибка загрузки вакансии:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }
  
  // Действия для создания/изменения
  const createJob = async (jobData) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: createError } = await supabase
        .from('job_postings')
        .insert([jobData])
        .select()
        .single()
      
      if (createError) throw createError
      
      jobs.value.unshift(data)
      return { success: true, data }
    } catch (err) {
      console.error('Ошибка создания вакансии:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }
  
  const createUrgentJob = async (jobData) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: createError } = await supabase
        .from('urgent_jobs')
        .insert([{ ...jobData, is_urgent: true }])
        .select()
        .single()
      
      if (createError) throw createError
      
      urgentJobs.value.unshift(data)
      return { success: true, data }
    } catch (err) {
      console.error('Ошибка создания срочной вакансии:', err)
      error.value = err.message
      return { success: false, error: err.message }
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
      specialization: null,
      district: null,
      salaryFrom: null,
      salaryTo: null,
      schedule: null,
      experience: null
    }
  }
  
  // Загрузка всех данных
  const loadAll = async () => {
    await Promise.all([
      fetchJobs(),
      fetchUrgentJobs()
    ])
  }
  
  return {
    // Состояние
    jobs,
    urgentJobs,
    currentJob,
    loading,
    error,
    filters,
    
    // Геттеры
    allJobs,
    regularJobs,
    urgentJobsList,
    filteredJobs,
    
    // Действия
    fetchJobs,
    fetchUrgentJobs,
    fetchJobById,
    createJob,
    createUrgentJob,
    updateFilters,
    clearFilters,
    loadAll
  }
})
