/**
 * Тесты для mock данных профиля
 * Проверяем корректность структуры и вычислений
 */

import { describe, it, expect } from 'vitest'
import { 
  mockSkills, 
  mockBadges, 
  mockWorkLogs, 
  mockProfileExtension,
  generateMockProfileData 
} from '@/utils/mockProfileData.js'

describe('MockProfileData', () => {
  describe('mockSkills', () => {
    it('содержит корректную структуру навыков', () => {
      expect(mockSkills).toHaveLength(4)
      
      const skill = mockSkills[0]
      expect(skill).toHaveProperty('id')
      expect(skill).toHaveProperty('name')
      expect(skill).toHaveProperty('category')
      expect(skill).toHaveProperty('base_level')
      expect(skill).toHaveProperty('calculated_level')
      expect(skill).toHaveProperty('updated_at')
    })

    it('все уровни навыков в диапазоне 0-100', () => {
      mockSkills.forEach(skill => {
        expect(skill.base_level).toBeGreaterThanOrEqual(0)
        expect(skill.base_level).toBeLessThanOrEqual(100)
        expect(skill.calculated_level).toBeGreaterThanOrEqual(0)
        expect(skill.calculated_level).toBeLessThanOrEqual(100)
      })
    })

    it('calculated_level >= base_level (только улучшения от бейджей)', () => {
      mockSkills.forEach(skill => {
        expect(skill.calculated_level).toBeGreaterThanOrEqual(skill.base_level)
      })
    })
  })

  describe('mockBadges', () => {
    it('содержит корректную структуру бейджей', () => {
      expect(mockBadges).toHaveLength(4)
      
      const badge = mockBadges[0]
      expect(badge).toHaveProperty('id')
      expect(badge).toHaveProperty('name')
      expect(badge).toHaveProperty('icon_url')
      expect(badge).toHaveProperty('description')
      expect(badge).toHaveProperty('source')
      expect(badge).toHaveProperty('awarded_at')
      expect(badge).toHaveProperty('employer_name')
    })

    it('все источники бейджей валидны', () => {
      mockBadges.forEach(badge => {
        expect(['auto', 'manual']).toContain(badge.source)
      })
    })

    it('все даты награждения валидны', () => {
      mockBadges.forEach(badge => {
        const date = new Date(badge.awarded_at)
        expect(date).toBeInstanceOf(Date)
        expect(date.toString()).not.toBe('Invalid Date')
      })
    })
  })

  describe('mockWorkLogs', () => {
    it('содержит корректную структуру записей работы', () => {
      expect(mockWorkLogs).toHaveLength(3)
      
      const workLog = mockWorkLogs[0]
      expect(workLog).toHaveProperty('id')
      expect(workLog).toHaveProperty('employer_name')
      expect(workLog).toHaveProperty('period_from')
      expect(workLog).toHaveProperty('period_to')
      expect(workLog).toHaveProperty('shifts_count')
      expect(workLog).toHaveProperty('total_hours')
      expect(workLog).toHaveProperty('position')
    })

    it('все числовые значения положительны', () => {
      mockWorkLogs.forEach(log => {
        expect(log.shifts_count).toBeGreaterThan(0)
        expect(log.total_hours).toBeGreaterThan(0)
      })
    })

    it('среднее время на смену разумно (4-12 часов)', () => {
      mockWorkLogs.forEach(log => {
        const avgHours = log.total_hours / log.shifts_count
        expect(avgHours).toBeGreaterThanOrEqual(4)
        expect(avgHours).toBeLessThanOrEqual(12)
      })
    })
  })

  describe('generateMockProfileData', () => {
    let profileData

    beforeEach(() => {
      profileData = generateMockProfileData()
    })

    it('возвращает все необходимые поля', () => {
      expect(profileData).toHaveProperty('skills')
      expect(profileData).toHaveProperty('badges')
      expect(profileData).toHaveProperty('workLogs')
      expect(profileData).toHaveProperty('totalShifts')
      expect(profileData).toHaveProperty('totalHours')
      expect(profileData).toHaveProperty('badgesCount')
      expect(profileData).toHaveProperty('averageSkillLevel')
    })

    it('правильно вычисляет общее количество смен', () => {
      const expectedTotal = mockWorkLogs.reduce((sum, log) => sum + log.shifts_count, 0)
      expect(profileData.totalShifts).toBe(expectedTotal)
    })

    it('правильно вычисляет общее количество часов', () => {
      const expectedTotal = mockWorkLogs.reduce((sum, log) => sum + log.total_hours, 0)
      expect(profileData.totalHours).toBe(expectedTotal)
    })

    it('правильно считает количество бейджей', () => {
      expect(profileData.badgesCount).toBe(mockBadges.length)
    })

    it('правильно вычисляет средний уровень навыков', () => {
      const avgLevel = mockSkills.reduce((sum, skill) => sum + skill.calculated_level, 0) / mockSkills.length
      expect(profileData.averageSkillLevel).toBe(Math.round(avgLevel))
    })

    it('средний уровень навыков в разумном диапазоне', () => {
      expect(profileData.averageSkillLevel).toBeGreaterThan(0)
      expect(profileData.averageSkillLevel).toBeLessThanOrEqual(100)
    })

    it('включает данные из mockProfileExtension', () => {
      expect(profileData).toHaveProperty('short_bio')
      expect(profileData).toHaveProperty('primary_role')
      expect(profileData).toHaveProperty('experience_years')
      expect(profileData.primary_role).toBe(mockProfileExtension.primary_role)
    })
  })
})
