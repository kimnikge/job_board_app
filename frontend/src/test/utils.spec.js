import { describe, it, expect } from 'vitest'
import { validateEmail, validateRequired } from '@/utils/validation'
import { formatDate, formatPhone } from '@/utils/formatters'

describe('Утилиты', () => {
  describe('Валидация', () => {
    it('валидирует email адреса', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user@domain.org')).toBe(true)
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })

    it('проверяет обязательные поля', () => {
      expect(validateRequired('text')).toBe(true)
      expect(validateRequired(123)).toBe(true)
      expect(validateRequired(false)).toBe(true)
      expect(validateRequired('')).toBe(false)
      expect(validateRequired(null)).toBe(false)
      expect(validateRequired(undefined)).toBe(false)
    })
  })

  describe('Форматирование', () => {
    it('форматирует дату', () => {
      const date = '2024-01-15T10:30:00Z'
      const formatted = formatDate(date)
      
      expect(formatted).toBe('15.01.2024')
    })

    it('форматирует номер телефона', () => {
      expect(formatPhone('77771234567')).toBe('+7 777 123 45 67')
      expect(formatPhone('')).toBe('')
      expect(formatPhone(null)).toBe('')
    })
  })
})
