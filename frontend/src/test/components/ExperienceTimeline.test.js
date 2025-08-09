/**
 * Тесты для ExperienceTimeline компонента
 * Покрывает сортировку, форматы дат, агрегацию
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExperienceTimeline from '@/components/profile/ExperienceTimeline.vue'

describe('ExperienceTimeline', () => {
  const mockWorkLogs = [
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
      period_from: '2025-08-01',
      period_to: '2025-08-10',
      shifts_count: 8,
      total_hours: 64,
      position: 'Официант'
    }
  ]

  it('отображает правильные агрегированные статистики', () => {
    const wrapper = mount(ExperienceTimeline, {
      props: { workLogs: mockWorkLogs }
    })

    const statItems = wrapper.findAll('.stat-item')
    expect(statItems[0].text()).toBe('53 смен') // 45 + 8
    expect(statItems[1].text()).toBe('424 часов') // 360 + 64
  })

  it('сортирует записи по убыванию даты начала', () => {
    const wrapper = mount(ExperienceTimeline, {
      props: { workLogs: mockWorkLogs }
    })

    const timelineItems = wrapper.findAll('.timeline-item')
    const firstEmployer = timelineItems[0].find('.employer-name').text()
    const secondEmployer = timelineItems[1].find('.employer-name').text()

    // Первым должно быть самое свежее (2025-08-01)
    expect(firstEmployer).toBe('Кафе "Алатау"')
    expect(secondEmployer).toBe('Ресторан "Астана"')
  })

  it('определяет текущую работу правильно', () => {
    // Создаем запись с датой окончания в будущем
    const currentJob = {
      ...mockWorkLogs[1],
      period_to: '2025-12-31' // Будущая дата
    }
    
    const wrapper = mount(ExperienceTimeline, {
      props: { workLogs: [currentJob, mockWorkLogs[0]] }
    })

    const currentBadge = wrapper.find('.period-badge.current')
    expect(currentBadge.exists()).toBe(true)
    expect(currentBadge.text()).toBe('Текущая')
  })

  it('отображает информацию о работодателе', () => {
    const wrapper = mount(ExperienceTimeline, {
      props: { workLogs: mockWorkLogs }
    })

    const firstItem = wrapper.findAll('.timeline-item')[0]
    expect(firstItem.find('.employer-name').text()).toBe('Кафе "Алатау"')
    expect(firstItem.find('.position').text()).toBe('Официант')
    expect(firstItem.find('.employer-logo').attributes('src')).toBe('/images/default-company.png')
  })

  it('отображает статистики по смене', () => {
    const wrapper = mount(ExperienceTimeline, {
      props: { workLogs: mockWorkLogs }
    })

    const firstItem = wrapper.findAll('.timeline-item')[0]
    const stats = firstItem.findAll('.stat-value')
    
    expect(stats[0].text()).toBe('8 смен')
    expect(stats[1].text()).toBe('64 часов')
    expect(stats[2].text()).toBe('8 ч/смена') // 64/8 = 8
  })

  it('форматирует даты правильно', () => {
    const wrapper = mount(ExperienceTimeline, {
      props: { workLogs: mockWorkLogs }
    })

    const dateFrom = wrapper.find('.date-from')
    const dateTo = wrapper.find('.date-to')
    
    // Проверяем что даты отформатированы (не исходные строки)
    expect(dateFrom.text()).not.toBe('2025-08-01')
    expect(dateTo.text()).not.toBe('2025-08-10')
    expect(dateFrom.text()).toMatch(/авг/)
    expect(dateTo.text()).toMatch(/авг/)
  })

  it('обрабатывает пустой список записей', () => {
    const wrapper = mount(ExperienceTimeline, {
      props: { workLogs: [] }
    })

    const statItems = wrapper.findAll('.stat-item')
    expect(statItems[0].text()).toBe('0 смен')
    expect(statItems[1].text()).toBe('0 часов')
    expect(wrapper.findAll('.timeline-item')).toHaveLength(0)
  })

  it('правильно вычисляет среднее время на смену', () => {
    const singleLog = [{
      ...mockWorkLogs[0],
      shifts_count: 10,
      total_hours: 80
    }]
    
    const wrapper = mount(ExperienceTimeline, {
      props: { workLogs: singleLog }
    })

    const avgStat = wrapper.findAll('.stat-value')[2]
    expect(avgStat.text()).toBe('8 ч/смена') // 80/10 = 8
  })

  it('показывает timeline line между элементами', () => {
    const wrapper = mount(ExperienceTimeline, {
      props: { workLogs: mockWorkLogs }
    })

    // Должна быть одна линия между двумя элементами
    const timelineLines = wrapper.findAll('.timeline-line')
    expect(timelineLines).toHaveLength(1)
  })
})
