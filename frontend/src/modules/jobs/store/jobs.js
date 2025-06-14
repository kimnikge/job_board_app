import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useJobsStore = defineStore('jobs', () => {
  const jobs = ref([])
  const urgentJobs = ref([])
  const job = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchJobs(params = {}) {
    loading.value = true
    error.value = null
    jobs.value = []

    try {
      let query = supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false })

      // Применяем фильтры из параметров
      if (params.title) {
        query = query.ilike('title', `%${params.title}%`)
      }
      
      if (params.location) {
        query = query.ilike('location', `%${params.location}%`)
      }
      
      if (params.company_id) {
        query = query.eq('company_id', params.company_id)
      }
      
      if (params.job_type) {
        query = query.eq('job_type', params.job_type)
      }
      
      if (params.salary_min) {
        query = query.gte('salary_min', params.salary_min)
      }
      
      if (params.salary_max) {
        query = query.lte('salary_max', params.salary_max)
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

      jobs.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Ошибка при загрузке вакансий'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchUrgentJobs(params = {}) {
    loading.value = true
    error.value = null
    urgentJobs.value = []

    try {
      let query = supabase
        .from('job_postings')
        .select('*')
        .eq('is_urgent', true)
        .order('created_at', { ascending: false })

      if (params.limit) {
        query = query.limit(params.limit)
      }

      const { data, error: supabaseError } = await query

      if (supabaseError) throw supabaseError

      urgentJobs.value = data || []
      return data
    } catch (err) {
      error.value = err.message || 'Ошибка при загрузке срочных вакансий'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchJobById(id) {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('job_postings')
        .select(`
          *,
          companies:company_id (
            id,
            name,
            logo_url,
            description
          )
        `)
        .eq('id', id)
        .single()

      if (supabaseError) throw supabaseError

      job.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Ошибка при загрузке вакансии'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createJob(jobData) {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('job_postings')
        .insert([jobData])
        .select()

      if (supabaseError) throw supabaseError

      return data[0]
    } catch (err) {
      error.value = err.message || 'Ошибка при создании вакансии'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateJob(id, jobData) {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('job_postings')
        .update(jobData)
        .eq('id', id)
        .select()

      if (supabaseError) throw supabaseError

      if (job.value && job.value.id === id) {
        job.value = data[0]
      }

      return data[0]
    } catch (err) {
      error.value = err.message || 'Ошибка при обновлении вакансии'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteJob(id) {
    loading.value = true
    error.value = null

    try {
      const { error: supabaseError } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', id)

      if (supabaseError) throw supabaseError

      // Обновляем список вакансий после удаления
      jobs.value = jobs.value.filter(j => j.id !== id)
      
      if (job.value && job.value.id === id) {
        job.value = null
      }

      return true
    } catch (err) {
      error.value = err.message || 'Ошибка при удалении вакансии'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function applyForJob(jobId, applicationData) {
    loading.value = true
    error.value = null

    try {
      // Создаем запись о заявке в таблице applications
      const { data, error: supabaseError } = await supabase
        .from('applications')
        .insert([{
          job_id: jobId,
          ...applicationData
        }])
        .select()

      if (supabaseError) throw supabaseError

      return data[0]
    } catch (err) {
      error.value = err.message || 'Ошибка при отправке отклика'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Загрузка файла резюме для отклика
  async function uploadResumeFile(file, userId) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `resumes/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('applications')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Получаем публичную ссылку на файл
      const { data } = supabase.storage
        .from('applications')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (err) {
      error.value = err.message || 'Ошибка при загрузке файла'
      throw err
    }
  }

  return {
    jobs,
    urgentJobs,
    job,
    loading,
    error,
    fetchJobs,
    fetchUrgentJobs,
    fetchJobById,
    createJob,
    updateJob,
    deleteJob,
    applyForJob,
    uploadResumeFile
  }
})
