import { supabase } from '@/lib/supabase'

export const jobsService = {
  async getUrgentJobs(limit = 6) {
    const { data: jobs, error } = await supabase
      .from('urgent_jobs')
      .select(`
        *,
        companies (
          name,
          logo
        ),
        specializations (
          name
        ),
        city_districts (
          name
        ),
        venue_types (
          name
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching urgent jobs:', error)
      throw error
    }

    return jobs
  },

  async getJobs(params = {}) {
    let query = supabase
      .from('job_postings')
      .select(`
        *,
        companies (
          name,
          logo
        ),
        specializations (
          name
        ),
        city_districts (
          name
        ),
        venue_types (
          name
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    // Apply filters
    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
    }
    
    if (params.location) {
      query = query.ilike('location', `%${params.location}%`)
    }
    
    if (params.employment_type) {
      query = query.eq('employment_type', params.employment_type)
    }
    
    if (params.experience_level) {
      query = query.eq('experience_level', params.experience_level)
    }
    
    if (params.company_id) {
      query = query.eq('company_id', params.company_id)
    }

    // Pagination
    if (params.limit) {
      query = query.limit(params.limit)
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
    }

    const { data: jobs, error } = await query

    if (error) {
      console.error('Error fetching jobs:', error)
      throw error
    }

    return jobs
  },

  async getJobById(id) {
    const { data: job, error } = await supabase
      .from('job_postings')
      .select(`
        *,
        companies (
          id,
          name,
          logo,
          industry,
          location,
          employees_count
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching job:', error)
      throw error
    }

    return job
  },

  async getJobsCount(params = {}) {
    let query = supabase
      .from('job_postings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Apply filters
    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
    }
    
    if (params.location) {
      query = query.ilike('location', `%${params.location}%`)
    }
    
    if (params.employment_type) {
      query = query.eq('employment_type', params.employment_type)
    }
    
    if (params.experience_level) {
      query = query.eq('experience_level', params.experience_level)
    }
    
    if (params.company_id) {
      query = query.eq('company_id', params.company_id)
    }

    const { count, error } = await query

    if (error) {
      console.error('Error fetching jobs count:', error)
      throw error
    }

    return count
  }
}
