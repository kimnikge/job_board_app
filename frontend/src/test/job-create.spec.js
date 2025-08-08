import { describe, it, expect, vi } from 'vitest'
import { useJobsStore } from '@/stores/jobs'
import { jobsService } from '@/services/jobs.service.js'

vi.mock('@/services/jobs.service.js', () => ({
  jobsService: {
    createJob: vi.fn(async (data) => ({ data: { id: 1, ...data } }))
  }
}))

describe('Создание вакансии', () => {
  it('успешно создает вакансию через store', async () => {
    const jobs = useJobsStore()
    const jobData = {
      title: 'Повар',
      description: 'Работа в ресторане',
      urgent: false
    }
  const result = await jobs.createJob(jobData)
  expect(result).toMatchObject({ id: 1, title: 'Повар', urgent: false })
  expect(jobsService.createJob).toHaveBeenCalledWith(jobData)
  })
})
