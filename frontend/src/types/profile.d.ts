/**
 * TypeScript типы для расширенного профиля (R2)
 * Постепенное внедрение TypeScript согласно плану разработки
 */

export interface Skill {
  id: string
  user_id?: string
  name: string
  category: 'kitchen' | 'service' | 'management' | 'other'
  base_level: number
  calculated_level: number
  updated_at: string
}

export interface Badge {
  id: string
  user_id?: string
  employer_id?: string
  name: string
  icon_url: string
  description?: string
  source: 'auto' | 'manual'
  awarded_at: string
  employer_name?: string
}

export interface WorkLog {
  id: string
  user_id?: string
  employer_id?: string
  employer_name: string
  employer_logo?: string
  period_from: string
  period_to: string
  shifts_count: number
  total_hours: number
  position?: string
}

export interface ProfileExtension {
  video_url?: string | null
  short_bio?: string
  primary_role: string
  experience_years: number
}

export interface MockProfileData {
  skills: Skill[]
  badges: Badge[]
  workLogs: WorkLog[]
  totalShifts: number
  totalHours: number
  badgesCount: number
  averageSkillLevel: number
}

// Feature Flags типы
export interface FeatureFlags {
  videoProfile: boolean
  skillBars: boolean
  badgeCarousel: boolean
  experienceTimeline: boolean
  lazyProfileSections: boolean
  typescript: boolean
  useMockData: boolean
  debugMode: boolean
}

// Service Response типы
export interface ServiceResponse<T> {
  data: T | null
  error: Error | null
}

// Компонент Props типы
export interface SkillBarProps {
  skill: Skill
}

export interface BadgeCarouselProps {
  badges: Badge[]
}

export interface ExperienceTimelineProps {
  workLogs: WorkLog[]
}
