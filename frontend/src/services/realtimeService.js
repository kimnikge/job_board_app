import { supabase } from '@/lib/supabase'

export const realtimeService = {
  // Подписка на новые вакансии
  subscribeToNewJobs(callback) {
    return supabase
      .channel('public:jobs')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'jobs' },
        payload => callback(payload.new)
      )
      .subscribe()
  },

  // Подписка на изменения в откликах для работодателя
  subscribeToApplications(employerId, callback) {
    return supabase
      .channel('public:applications')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `job.employer_id=eq.${employerId}`
        },
        payload => callback(payload.new)
      )
      .subscribe()
  },

  // Подписка на статус своих откликов для соискателя
  subscribeToMyApplications(userId, callback) {
    return supabase
      .channel('public:my_applications')
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
          filter: `applicant_id=eq.${userId}`
        },
        payload => callback(payload.new)
      )
      .subscribe()
  },

  // Подписка на срочные вакансии
  subscribeToUrgentJobs(callback) {
    return supabase
      .channel('public:urgent_jobs')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'jobs',
          filter: 'is_urgent=eq.true'
        },
        payload => callback(payload.new)
      )
      .subscribe()
  },

  // Отписка от канала
  unsubscribe(channel) {
    if (channel) {
      supabase.removeChannel(channel)
    }
  }
}