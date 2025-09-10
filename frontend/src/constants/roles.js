// Централизованное определение ролей пользователей
// Добавление новой роли (например ADMIN) делается здесь и используется по всему коду.
export const ROLES = {
  CANDIDATE: 'candidate',
  EMPLOYER: 'employer',
  ADMIN: 'admin'
}

export function hasRole(user, role) {
  if (!user) return false
  return user.user_metadata?.user_type === role
}
