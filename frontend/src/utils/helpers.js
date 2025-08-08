// helpers.js — вспомогательные функции
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatSalary(salary) {
  return salary ? salary.toLocaleString('ru-RU') + ' ₸' : '—'
}
