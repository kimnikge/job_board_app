/**
 * Mock данные для расширенного профиля (R2)
 * Используется до реализации полной интеграции с Supabase
 */

export const mockSkills = [
  {
    id: '1',
    name: 'Приготовление горячих блюд',
    category: 'kitchen',
    base_level: 75,
    calculated_level: 85, // +10 от бейджей
    updated_at: '2025-08-01T10:00:00Z'
  },
  {
    id: '2', 
    name: 'Работа с клиентами',
    category: 'service',
    base_level: 60,
    calculated_level: 70, // +10 от бейджей
    updated_at: '2025-08-05T14:30:00Z'
  },
  {
    id: '3',
    name: 'Управление кассой',
    category: 'service', 
    base_level: 80,
    calculated_level: 80, // без изменений
    updated_at: '2025-07-20T09:15:00Z'
  },
  {
    id: '4',
    name: 'Приготовление кофе',
    category: 'kitchen',
    base_level: 90,
    calculated_level: 95, // +5 от бейджей
    updated_at: '2025-08-10T08:00:00Z'
  }
]

export const mockBadges = [
  {
    id: '1',
    name: 'Мастер горячих блюд',
    icon_url: '🔥',
    description: 'Отличное владение приготовлением горячих блюд',
    source: 'manual',
    awarded_at: '2025-08-01T10:00:00Z',
    employer_name: 'Ресторан "Астана"'
  },
  {
    id: '2', 
    name: 'Надежный сотрудник',
    icon_url: '⭐',
    description: 'Работал более 50 смен без опозданий',
    source: 'auto',
    awarded_at: '2025-07-15T16:30:00Z',
    employer_name: 'Кафе "Алатау"'
  },
  {
    id: '3',
    name: 'Клиентоориентированность',
    icon_url: '💫',
    description: 'Высокие оценки от клиентов',
    source: 'manual', 
    awarded_at: '2025-08-05T12:00:00Z',
    employer_name: 'Ресторан "Астана"'
  },
  {
    id: '4',
    name: 'Быстрая адаптация',
    icon_url: '⚡',
    description: 'Освоил новые блюда за неделю',
    source: 'manual',
    awarded_at: '2025-08-10T09:30:00Z', 
    employer_name: 'Кофейня "Beans"'
  }
]

export const mockWorkLogs = [
  {
    id: '1',
    employer_name: 'Ресторан "Астана"',
    employer_logo: '/images/default-company.png',
    period_from: '2025-06-01',
    period_to: '2025-07-31', 
    shifts_count: 45,
    total_hours: 360,
    position: 'Повар'
  },
  {
    id: '2',
    employer_name: 'Кафе "Алатау"',
    employer_logo: '/images/default-company.png', 
    period_from: '2025-04-15',
    period_to: '2025-05-30',
    shifts_count: 32,
    total_hours: 256,
    position: 'Официант'
  },
  {
    id: '3',
    employer_name: 'Кофейня "Beans"',
    employer_logo: '/images/default-company.png',
    period_from: '2025-08-01', 
    period_to: '2025-08-10',
    shifts_count: 8,
    total_hours: 64,
    position: 'Бариста'
  }
]

export const mockProfileExtension = {
  video_url: null, // Будет активировано через фича-флаг
  short_bio: 'Опытный сотрудник общепита с 3+ годами опыта. Люблю готовить и работать с людьми.',
  primary_role: 'chef',
  experience_years: 3
}

/**
 * Генерирует полный расширенный профиль
 */
export function generateMockProfileData() {
  return {
    skills: mockSkills,
    badges: mockBadges, 
    workLogs: mockWorkLogs,
    ...mockProfileExtension,
    // Агрегированные метрики
    totalShifts: mockWorkLogs.reduce((sum, log) => sum + log.shifts_count, 0),
    totalHours: mockWorkLogs.reduce((sum, log) => sum + log.total_hours, 0),
    badgesCount: mockBadges.length,
    averageSkillLevel: Math.round(mockSkills.reduce((sum, skill) => sum + skill.calculated_level, 0) / mockSkills.length)
  }
}
