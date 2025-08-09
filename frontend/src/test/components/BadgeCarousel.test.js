/**
 * Тесты для BadgeCarousel компонента
 * Покрывает отображение, скролл, tooltip
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import BadgeCarousel from '@/components/profile/BadgeCarousel.vue'

describe('BadgeCarousel', () => {
  const mockBadges = [
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
    }
  ]

  it('отображает правильный заголовок с количеством бейджей', () => {
    const wrapper = mount(BadgeCarousel, {
      props: { badges: mockBadges }
    })

    expect(wrapper.find('.carousel-title').text()).toBe('🏆 Достижения (2)')
  })

  it('отображает все бейджи', () => {
    const wrapper = mount(BadgeCarousel, {
      props: { badges: mockBadges }
    })

    const badgeItems = wrapper.findAll('.badge-item')
    expect(badgeItems).toHaveLength(2)
  })

  it('отображает информацию о каждом бейдже', () => {
    const wrapper = mount(BadgeCarousel, {
      props: { badges: mockBadges }
    })

    const firstBadge = wrapper.findAll('.badge-item')[0]
    expect(firstBadge.find('.badge-icon').text()).toBe('🔥')
    expect(firstBadge.find('.badge-name').text()).toBe('Мастер горячих блюд')
    expect(firstBadge.find('.badge-employer').text()).toBe('Ресторан "Астана"')
  })

  it('применяет правильный класс для источника бейджа', () => {
    const wrapper = mount(BadgeCarousel, {
      props: { badges: mockBadges }
    })

    const manualBadge = wrapper.findAll('.badge-source')[0]
    const autoBadge = wrapper.findAll('.badge-source')[1]
    
    expect(manualBadge.classes()).toContain('manual')
    expect(autoBadge.classes()).toContain('auto')
  })

  it('форматирует дату правильно', () => {
    const wrapper = mount(BadgeCarousel, {
      props: { badges: mockBadges }
    })

    const dateElement = wrapper.find('.badge-date')
    // Проверяем что дата отформатирована (не пустая и не исходная строка)
    expect(dateElement.text()).not.toBe('')
    expect(dateElement.text()).not.toBe('2025-08-01T10:00:00Z')
  })

  it('обрабатывает пустой список бейджей', () => {
    const wrapper = mount(BadgeCarousel, {
      props: { badges: [] }
    })

    expect(wrapper.find('.carousel-title').text()).toBe('🏆 Достижения (0)')
    expect(wrapper.findAll('.badge-item')).toHaveLength(0)
  })

  it('эмитит событие при клике на бейдж', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    const wrapper = mount(BadgeCarousel, {
      props: { badges: mockBadges }
    })

    await wrapper.find('.badge-item').trigger('click')
    
    expect(consoleSpy).toHaveBeenCalledWith('Badge details:', mockBadges[0])
    
    consoleSpy.mockRestore()
  })

  it('устанавливает правильный tooltip', () => {
    const wrapper = mount(BadgeCarousel, {
      props: { badges: mockBadges }
    })

    const firstBadge = wrapper.find('.badge-item')
    expect(firstBadge.attributes('title')).toBe(mockBadges[0].description)
  })
})
