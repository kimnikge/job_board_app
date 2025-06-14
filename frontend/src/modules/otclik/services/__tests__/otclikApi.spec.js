import { describe, it, expect, beforeEach, vi } from 'vitest'
import otclikApi from '../otclikApi'
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

describe('otclikApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createApplication', () => {
    it('должен создавать новый отклик', async () => {
      const applicationData = { job_id: 1, message: 'Test message' }
      const mockApplication = { 
        id: 1, 
        ...applicationData, 
        applicant_id: 'test-user-id',
        created_at: new Date().toISOString()
      }
      
      supabase.from().insert().select = vi.fn().mockResolvedValue({
        data: [mockApplication],
        error: null
      })

      const result = await otclikApi.createApplication(applicationData)
      expect(result.data).toEqual([mockApplication])
    })
  })

  describe('getMyApplications', () => {
    it('должен получать отклики текущего пользователя', async () => {
      const mockApplications = [
        { id: 1, job_id: 1, status: 'pending' }
      ]
      
      supabase.from().select().eq().order = vi.fn().mockResolvedValue({
        data: mockApplications,
        error: null
      })

      const result = await otclikApi.getMyApplications()
      expect(result.data).toEqual(mockApplications)
    })
  })

  describe('getEmployerApplications', () => {
    it('должен получать отклики на вакансии работодателя', async () => {
      const mockApplications = [
        { id: 1, job_id: 1, applicant_id: 'another-user', status: 'pending' }
      ]
      
      supabase.from().select().eq().order = vi.fn().mockResolvedValue({
        data: mockApplications,
        error: null
      })

      const result = await otclikApi.getEmployerApplications()
      expect(result.data).toEqual(mockApplications)
    })
  })
})
