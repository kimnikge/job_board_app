// formatters.js — функции форматирования данных
export function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU')
}

export function formatPhone(phone) {
  // Пример: +7 777 123 45 67
  return phone ? phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5') : ''
}
