// validation.js — правила валидации
export function validateEmail(email) {
  return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)
}

export function validateRequired(value) {
  return value !== null && value !== undefined && value !== ''
}
