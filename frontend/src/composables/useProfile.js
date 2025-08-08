// useProfile.js — работа с профилем
import { ref } from 'vue'
import { profileService } from '@/services/profile.service.js'

export function useProfile() {
  const profile = ref(null)
  const error = ref(null)

  async function fetchProfile(userId) {
    const { data, error: err } = await profileService.getProfile(userId)
    profile.value = data || null
    error.value = err
    return { profile: profile.value, error: error.value }
  }

  return { profile, error, fetchProfile }
}
