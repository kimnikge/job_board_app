import { describe, it, expect, vi } from 'vitest'
import { useJobsStore } from '@/stores/jobs'
import { jobsService } from '@/services/jobs.service.js'

vi.mock('@/services/jobs.service.js', () => ({
  jobsService: {
    getAllJobs: vi.fn(async (filters = {}) => ({
      data: [
        { id: 1, title: 'Повар', specialization_id: 1, district_id: 1, salary_min: 200000 },
        { id: 2, title: 'Официант', specialization_id: 2, district_id: 2, salary_min: 150000 }
      ]
    })),
    applyToJob: vi.fn(async (jobId, data) => ({ 
      data: { id: 10, job_id: jobId, candidate_id: data.candidate_id, status: 'pending' }
    }))
  }
}))

describe('Фильтрация и поиск вакансий', () => {
  it('фильтрует вакансии по поисковому запросу', async () => {
    const jobs = useJobsStore()
    await jobs.fetchJobs()
    
    jobs.updateFilters({ search: 'повар' })
    
    expect(jobs.filteredJobs.length).toBe(1)
    expect(jobs.filteredJobs[0].title).toContain('Повар')
  })

  it('фильтрует вакансии по специализации', async () => {
    const jobs = useJobsStore()
    await jobs.fetchJobs()
    
    jobs.updateFilters({ specialization: 2 })
    
    expect(jobs.filteredJobs.length).toBe(1)
    expect(jobs.filteredJobs[0].specialization_id).toBe(2)
  })

  it('фильтрует вакансии по зарплате', async () => {
    const jobs = useJobsStore()
    await jobs.fetchJobs()
    
    jobs.updateFilters({ salaryMin: '180000' })
    
    expect(jobs.filteredJobs.length).toBe(1)
    expect(jobs.filteredJobs[0].salary_min).toBeGreaterThanOrEqual(180000)
  })

  it('очищает фильтры', async () => {
    const jobs = useJobsStore()
    await jobs.fetchJobs()
    
    jobs.updateFilters({ search: 'повар', salaryMin: '180000' })
    jobs.clearFilters()
    
    expect(jobs.filters.search).toBe('')
    expect(jobs.filters.salaryMin).toBe('')
    expect(jobs.filteredJobs.length).toBe(2)
  })
})

describe('Отклики на вакансии', () => {
  it('создает отклик на вакансию', async () => {
    const jobs = useJobsStore()
    const applicationData = {
      candidate_id: 'user-1',
      cover_letter: 'Хочу работать поваром',
      proposed_salary: 250000
    }
    
    const result = await jobs.applyToJob(1, applicationData)
    
    expect(result).toMatchObject({ 
      id: 10, 
      job_id: 1, 
      candidate_id: 'user-1',
      status: 'pending'
    })
    expect(jobsService.applyToJob).toHaveBeenCalledWith(1, applicationData)
  })
})
