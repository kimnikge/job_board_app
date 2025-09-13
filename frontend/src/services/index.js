// 📦 index.js — Экспорт всех сервисов
export { authService } from './auth.service.js'
export { jobsService } from './jobs.service.js'
export { urgentJobsService } from './urgent-jobs.service.js'
export { notificationsService } from './notifications.service.js'
export { supabase } from './supabase.js'

console.log('✅ Services index loaded')