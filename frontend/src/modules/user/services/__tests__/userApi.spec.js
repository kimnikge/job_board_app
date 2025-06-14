import { describe, it, expect, beforeEach, vi } from 'vitest'
import userApi from '../userApi'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: null,
          error: null
        })),
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
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
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => ({ error: null })),
        getPublicUrl: vi.fn(() => ({ 
          data: { publicUrl: 'https://test.com/avatar.jpg' }
        }))
      }))
    }
  }
}))

describe('userApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getJobSeekerProfile', () => {
    it('должен получать профиль соискателя', async () => {
      const mockProfile = {
        id: 'test-user-id',
        first_name: 'Test',
        role: 'job_seeker'
      }

      supabase.from().select().single = vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null
      })

      const result = await userApi.getJobSeekerProfile()
      expect(result.data).toEqual(mockProfile)
    })
  })

  describe('updateProfile', () => {
    it('должен обновлять профиль пользователя', async () => {
      const profileData = { first_name: 'Updated' }
      const mockProfile = { 
        id: 'test-user-id',
        ...profileData
      }

      supabase.from().update().eq().select = vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null
      })

      const result = await userApi.updateProfile(profileData)
      expect(result.data).toEqual(mockProfile)
    })
  })

  describe('updateAvatar', () => {
    it('должен загружать и обновлять аватар', async () => {
      const file = new File([''], 'avatar.jpg')
      const mockProfile = {
        id: 'test-user-id',
        avatar_url: 'https://test.com/avatar.jpg'
      }

      const result = await userApi.updateAvatar(file)
      expect(result.data).toEqual(mockProfile)
      expect(supabase.storage.from).toHaveBeenCalledWith('avatars')
    })
  })
})
