// constants.js — все константы проекта
export const SPECIALIZATIONS = [
  { id: 1, name: 'Повар', icon: '👨‍🍳' },
  { id: 2, name: 'Официант', icon: '🤵' },
  // ...другие специализации
]

export const ASTANA_DISTRICTS = [
  { id: 1, name: 'Есильский район' },
  { id: 2, name: 'Алматинский район' },
  // ...другие районы
]

// Feature flags (управление включением функционала)
export const FEATURE_FLAGS = {
  demoData: true, // отключим после переноса на Supabase
  videoProfile: false,
  badges: false,
  skills: false
}

// Бюджеты производительности
export const PERFORMANCE_BUDGET = {
  profileRpcMs: 400,
  recalcSkillsMs: 120
}

// Ограничения видео профиля
export const VIDEO_LIMITS = {
  maxSizeMB: 25,
  maxDurationSec: 15
}

console.log('✅ Constants extended')
