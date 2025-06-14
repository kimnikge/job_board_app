import { describe, it, expect, beforeEach, vi } from 'vitest'
import resumeApi from '../api'
import { supabase } from '@/lib/supabase'

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
          error: null
        }))
      }))
    })),
    auth: {
      getUser: vi.fn(() => ({
        data: { user: { id: 'test-user-id' } },
        error: null
      }))
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => ({ error: null })),
        getPublicUrl: vi.fn(() => ({ 
          data: { publicUrl: 'https://test.com/resume.pdf' }
        }))
      }))
    }
  }
}))

describe('resumeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createResume', () => {
    it('должен создавать резюме с файлом', async () => {
      const file = new File([''], 'resume.pdf')
      const resumeData = { 
        title: 'My Resume',
        file
      }
      const mockResume = {
        id: 1,
        title: 'My Resume',
        file_url: 'https://test.com/resume.pdf',
        user_id: 'test-user-id'
      }

      supabase.from().insert().select = vi.fn().mockResolvedValue({
        data: [mockResume],
        error: null
      })

      const result = await resumeApi.createResume(resumeData)
      expect(result.data).toEqual([mockResume])
      expect(supabase.storage.from).toHaveBeenCalledWith('resumes')
    })
  })

  describe('getResumes', () => {
    it('должен получать все активные резюме', async () => {
      const mockResumes = [{
        id: 1,
        title: 'Active Resume',
        is_active: true
      }]

      supabase.from().select().eq().order = vi.fn().mockResolvedValue({
        data: mockResumes,
        error: null
      })

      const result = await resumeApi.getResumes()
      expect(result.data).toEqual(mockResumes)
    })
  })

  describe('getUserResumes', () => {
    it('должен получать резюме текущего пользователя', async () => {
      const mockResumes = [{
        id: 1,
        title: 'My Resume',
        user_id: 'test-user-id'
      }]

      supabase.from().select().eq().order = vi.fn().mockResolvedValue({
        data: mockResumes,
        error: null
      })

      const result = await resumeApi.getUserResumes()
      expect(result.data).toEqual(mockResumes)
    })
  })

  describe('updateResume', () => {
    it('должен обновлять резюме', async () => {
      const updateData = { title: 'Updated Resume' }
      const mockResume = {
        id: 1,
        ...updateData
      }

      supabase.from().update().eq().select = vi.fn().mockResolvedValue({
        data: mockResume,
        error: null
      })

      const result = await resumeApi.updateResume(1, updateData)
      expect(result.data).toEqual(mockResume)
    })
  })

  describe('deleteResume', () => {
    it('должен удалять резюме', async () => {
      const result = await resumeApi.deleteResume(1)
      expect(result.data).toEqual({ id: 1 })
    })
  })
})
