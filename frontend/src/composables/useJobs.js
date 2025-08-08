// useJobs.js — работа с вакансиями
import { ref } from 'vue'
import { jobsService } from '@/services/jobs.service.js'

export function useJobs() {
  const jobs = ref([])
  const error = ref(null)

  async function fetchJobs(filters = {}) {
    const { data, error: err } = await jobsService.getAllJobs(filters)
    jobs.value = data || []
    error.value = err
    return { jobs: jobs.value, error: error.value }
  }

  return { jobs, error, fetchJobs }
}
