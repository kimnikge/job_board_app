import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jobsService } from '../services/jobs.service.js'
import { useProfileStore } from './profile.js'
import { useAuthStore } from './auth.js'

// ✨ ЕДИНЫЙ JOBS STORE - СОГЛАСНО ПЛАНУ ЭТАПА 3
// Объединяет обычные и срочные вакансии в одном месте
export const useJobsStore = defineStore('jobs', () => {
  // Состояние
  const jobs = ref([])
  const urgentJobs = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filters = ref({
    search: '',
    location: '',
    jobType: '',
    salaryMin: '',
    salaryMax: '',
    experience: ''
  })

  // Вычисляемые значения
  const filteredJobs = computed(() => {
    let result = jobs.value

    // Фильтр по городу из профиля пользователя
    const profileStore = useProfileStore()
    const authStore = useAuthStore()
    
    if (authStore.isAuthenticated && profileStore.profile?.preferred_district_id) {
      result = result.filter(job => job.district_id === profileStore.profile.preferred_district_id)
    }

    if (filters.value.search) {
      const searchLower = filters.value.search.toLowerCase()
      result = result.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        (job.description && job.description.toLowerCase().includes(searchLower)) ||
        (job.company_name && job.company_name.toLowerCase().includes(searchLower))
      )
    }

    if (filters.value.location) {
      result = result.filter(job => job.location === filters.value.location)
    }

    if (filters.value.jobType) {
      result = result.filter(job => job.job_type === filters.value.jobType)
    }

    // Фильтр по специализации (ожидается JobsMainPage)
    if (filters.value.specialization) {
      result = result.filter(job => job.specialization_id === filters.value.specialization)
    }

    if (filters.value.salaryMin) {
      result = result.filter(job => job.salary_min >= parseInt(filters.value.salaryMin))
    }

    if (filters.value.salaryMax) {
      result = result.filter(job => job.salary_max <= parseInt(filters.value.salaryMax))
    }

    if (filters.value.experience) {
      result = result.filter(job => job.experience_level === filters.value.experience)
    }

    return result
  })

  const jobsWithUrgent = computed(() => {
    return [...urgentJobs.value, ...jobs.value]
  })

  // Совместимость с JobsMainPage.vue
  const regularJobs = computed(() => jobs.value)
  const urgentJobsList = computed(() => urgentJobs.value)

  // Действия
  const fetchJobs = async () => {
    loading.value = true
    error.value = null
    try {
      // Получаем фильтр по городу из профиля
      const profileStore = useProfileStore()
      const authStore = useAuthStore()
      
      const filters = {}
      if (authStore.isAuthenticated && profileStore.profile?.preferred_district_id) {
        filters.district_id = profileStore.profile.preferred_district_id
      }
      
      const response = await jobsService.getAllJobs(filters)
      jobs.value = response.data || []
    } catch (err) {
      error.value = err.message
      console.error('Ошибка загрузки вакансий:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchUrgentJobs = async () => {
    loading.value = true
    error.value = null
    try {
      // Получаем фильтр по городу из профиля
      const profileStore = useProfileStore()
      const authStore = useAuthStore()
      
      const filters = { is_urgent: true }
      if (authStore.isAuthenticated && profileStore.profile?.preferred_district_id) {
        filters.district_id = profileStore.profile.preferred_district_id
      }
      
      const response = await jobsService.getAllJobs(filters)
      urgentJobs.value = response.data || []
    } catch (err) {
      error.value = err.message
      console.error('Ошибка загрузки срочных вакансий:', err)
    } finally {
      loading.value = false
    }
  }

  // Загрузка всех данных (используется на главной)
  const loadAll = async () => {
    error.value = null
    try {
      await Promise.all([
        fetchUrgentJobs(),
        fetchJobs()
      ])
    } catch (err) {
      // ошибки уже зафиксированы в дочерних методах
      console.error('Ошибка loadAll:', err)
    }
  }

  const getJobById = async (id) => {
    try {
      const response = await jobsService.getJobById(id)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const createJob = async (jobData) => {
    loading.value = true
    error.value = null
    try {
      const response = await jobsService.createJob(jobData)
      if (jobData.is_urgent) {
        urgentJobs.value.unshift(response.data)
      } else {
        jobs.value.unshift(response.data)
      }
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateJob = async (id, jobData) => {
    loading.value = true
    error.value = null
    try {
      const response = await jobsService.updateJob(id, jobData)
      
      // Обновляем в соответствующем массиве
      if (jobData.is_urgent) {
        const index = urgentJobs.value.findIndex(job => job.id === id)
        if (index !== -1) {
          urgentJobs.value[index] = response.data
        }
      } else {
        const index = jobs.value.findIndex(job => job.id === id)
        if (index !== -1) {
          jobs.value[index] = response.data
        }
      }
      
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteJob = async (id) => {
    loading.value = true
    error.value = null
    try {
      await jobsService.deleteJob(id)
      
      // Удаляем из соответствующего массива
      const urgentIndex = urgentJobs.value.findIndex(job => job.id === id)
      if (urgentIndex !== -1) {
        urgentJobs.value.splice(urgentIndex, 1)
      } else {
        const jobIndex = jobs.value.findIndex(job => job.id === id)
        if (jobIndex !== -1) {
          jobs.value.splice(jobIndex, 1)
        }
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const applyToJob = async (jobId, applicationData) => {
    loading.value = true
    error.value = null
    try {
      const response = await jobsService.applyToJob(jobId, applicationData)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      location: '',
      jobType: '',
      salaryMin: '',
      salaryMax: '',
      experience: ''
    }
  }

  const getJobApplications = async (jobId) => {
    try {
      const response = await jobsService.getJobApplications(jobId)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const getUserApplications = async (userId) => {
    try {
      const response = await jobsService.getUserApplications(userId)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const response = await jobsService.updateApplicationStatus(applicationId, status)
      return response.data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    // Состояние
    jobs,
    urgentJobs,
    loading,
    error,
    filters,
    
    // Вычисляемые значения
    filteredJobs,
    jobsWithUrgent,
  regularJobs,
  urgentJobsList,
    
    // Действия
    fetchJobs,
    fetchUrgentJobs,
  loadAll,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
    applyToJob,
    updateFilters,
    clearFilters,
    getJobApplications,
    getUserApplications,
    updateApplicationStatus
  }
})
