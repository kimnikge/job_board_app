import { describe, it, expect, vi } from 'vitest'
import { useJobsStore } from '@/stores/jobs'
import { jobsService } from '@/services/jobs.service.js'

vi.mock('@/services/jobs.service.js', () => ({
  jobsService: {
    createJob: vi.fn(async (data) => ({ data: { id: 2, ...data } })),
    getUrgentJobs: vi.fn(async () => ({ data: [{ id: 2, title: 'Срочная вакансия', urgent: true }] }))
  }
}))

describe('Срочные вакансии', () => {
  it('создает срочную вакансию', async () => {
    const jobs = useJobsStore()
    const jobData = {
      title: 'Срочная вакансия',
      description: 'Нужно срочно',
      urgent: true
    }
    const result = await jobs.createJob(jobData)
    expect(result).toMatchObject({ id: 2, title: 'Срочная вакансия', urgent: true })
    expect(jobsService.createJob).toHaveBeenCalledWith(jobData)
  })

  it('получает список срочных вакансий', async () => {
    const jobs = useJobsStore()
    await jobs.fetchUrgentJobs()
    expect(jobs.urgentJobsList).toBeDefined()
    expect(jobs.urgentJobsList.length).toBeGreaterThan(0)
    expect(jobs.urgentJobsList[0]).toMatchObject({ id: 2, title: 'Срочная вакансия', urgent: true })
  })
})
