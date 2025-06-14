import { describe, it, expect, beforeEach, vi } from 'vitest'
import { realtimeService } from '../realtimeService'
import { supabase } from '@/lib/supabase'

// Мок для Supabase channel
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis()
}

// Мокаем Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn()
  }
}))

describe('realtimeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('subscribeToNewJobs', () => {
    it('должен подписываться на новые вакансии', () => {
      const callback = vi.fn()
      
      realtimeService.subscribeToNewJobs(callback)
      
      expect(supabase.channel).toHaveBeenCalledWith('public:jobs')
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'jobs' },
        expect.any(Function)
      )
      expect(mockChannel.subscribe).toHaveBeenCalled()
    })
  })

  describe('subscribeToApplications', () => {
    it('должен подписываться на изменения в откликах для работодателя', () => {
      const callback = vi.fn()
      const employerId = 'test-employer'
      
      realtimeService.subscribeToApplications(employerId, callback)
      
      expect(supabase.channel).toHaveBeenCalledWith('public:applications')
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `job.employer_id=eq.${employerId}`
        },
        expect.any(Function)
      )
    })
  })

  describe('unsubscribe', () => {
    it('должен отписываться от канала', () => {
      const channel = mockChannel
      
      realtimeService.unsubscribe(channel)
      
      expect(supabase.removeChannel).toHaveBeenCalledWith(channel)
    })
  })
})
