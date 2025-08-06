import { supabase } from '@/lib/supabase'

export const referencesService = {
  async getSpecializations() {
    const { data, error } = await supabase
      .from('specializations')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching specializations:', error)
      throw error
    }

    return data
  },

  async getDistricts() {
    const { data, error } = await supabase
      .from('city_districts')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching districts:', error)
      throw error
    }

    return data
  },

  async getVenueTypes() {
    const { data, error } = await supabase
      .from('venue_types')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching venue types:', error)
      throw error
    }

    return data
  },

  async getEmploymentTypes() {
    const { data, error } = await supabase
      .from('employment_types')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching employment types:', error)
      throw error
    }

    return data
  },

  async getWorkSchedules() {
    const { data, error } = await supabase
      .from('work_schedules')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching work schedules:', error)
      throw error
    }

    return data
  },

  async getExperienceLevels() {
    const { data, error } = await supabase
      .from('experience_levels')
      .select('*')
      .order('min_years')

    if (error) {
      console.error('Error fetching experience levels:', error)
      throw error
    }

    return data
  }
}
