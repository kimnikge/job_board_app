// 🎥 media.service.js — R1 skeleton (только видео профиля)
import { supabase, isDemoMode } from './supabase.js'

const BUCKET = 'profile_videos'

export const mediaService = {
  async uploadProfileVideo(userId, file) {
    if (isDemoMode) return { data: { url: `/videos/demo-${userId}.mp4` }, error: null }
    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
    if (error) return { data: null, error }
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return { data: { url: publicUrl }, error: null }
  },
  async removeVideo(userId) {
    if (isDemoMode) return { error: null }
    return { error: null }
  }
}
console.log('✅ Media service skeleton ready')
