// RBAC (Role-Based Access Control) утилита для фронта

// Пример ролей: 'admin', 'employer', 'job_seeker', 'moderator'
export const roles = ['admin', 'employer', 'job_seeker', 'moderator']

// Карта разрешённых действий по ролям
export const permissions = {
  admin: [
    'view_admin', 'ban_user', 'approve_job', 'delete_job', 'view_jobs', 'view_users', 'edit_settings', 'view_applications', 'moderate', 'all'
  ],
  employer: [
    'create_job', 'edit_job', 'view_jobs', 'view_applications', 'view_resume', 'all_own'
  ],
  job_seeker: [
    'create_resume', 'edit_resume', 'view_jobs', 'apply_job', 'view_applications', 'all_own'
  ],
  moderator: [
    'moderate', 'view_jobs', 'view_users', 'approve_job', 'delete_job'
  ]
}

// Проверка: может ли пользователь выполнить действие
export function can(user, action) {
  if (!user || !user.role) return false
  const allowed = permissions[user.role] || []
  return allowed.includes(action) || allowed.includes('all')
}
