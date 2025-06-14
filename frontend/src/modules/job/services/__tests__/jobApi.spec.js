import { describe, it, expect, beforeEach, vi } from 'vitest'
import jobApi from '../jobApi'
import { supabase } from '@/lib/supabase'

// Мокаем Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: null,
          error: null
        })),
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          data: null,
          error: null
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    })),
    auth: {
      getUser: vi.fn(() => ({
        data: { user: { id: 'test-user-id' } },
        error: null
      }))
    }
  }
}))

describe('jobApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getJobs', () => {
    it('должен получать все вакансии', async () => {
      const mockJobs = [{ id: 1, title: 'Test Job' }]
      
      supabase.from().select().order = vi.fn().mockResolvedValue({
        data: mockJobs,
        error: null
      })

      const result = await jobApi.getJobs()
      expect(result.data).toEqual(mockJobs)
    })

    it('должен выбрасывать ошибку при проблеме с API', async () => {
      const mockError = new Error('API Error')
      
      supabase.from().select().order = vi.fn().mockResolvedValue({
        data: null,
        error: mockError
      })

      await expect(jobApi.getJobs()).rejects.toThrow(mockError)
    })
  })

  describe('getUserJobs', () => {
    it('должен получать вакансии текущего работодателя', async () => {
      const mockJobs = [{ id: 1, title: 'My Job' }]
      
      supabase.from().select().eq().order = vi.fn().mockResolvedValue({
        data: mockJobs,
        error: null
      })

      const result = await jobApi.getUserJobs()
      expect(result.data).toEqual(mockJobs)
    })
  })

  describe('createJob', () => {
    it('должен создавать новую вакансию', async () => {
      const jobData = { title: 'New Job' }
      const mockJob = { id: 1, ...jobData, employer_id: 'test-user-id' }
      
      supabase.from().insert().select = vi.fn().mockResolvedValue({
        data: [mockJob],
        error: null
      })

      const result = await jobApi.createJob(jobData)
      expect(result.data).toEqual([mockJob])
    })
  })
})