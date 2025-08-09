/**
 * Тесты для SkillBar компонента
 * Покрывает props, цветовые уровни, отображение
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SkillBar from '@/components/profile/SkillBar.vue'

describe('SkillBar', () => {
  const mockSkill = {
    id: '1',
    name: 'Приготовление горячих блюд',
    category: 'kitchen',
    base_level: 75,
    calculated_level: 85,
    updated_at: '2025-08-10T10:00:00Z'
  }

  it('отображает базовую информацию о навыке', () => {
    const wrapper = mount(SkillBar, {
      props: { skill: mockSkill }
    })

    expect(wrapper.find('.skill-name').text()).toBe(mockSkill.name)
    expect(wrapper.find('.skill-level').text()).toBe('85/100')
  })

  it('применяет правильный цветовой класс для уровня', () => {
    // Тест для экспертного уровня (71-100)
    const wrapper = mount(SkillBar, {
      props: { skill: mockSkill }
    })
    
    expect(wrapper.find('.skill-fill').classes()).toContain('skill-expert')
  })

  it('применяет правильный цветовой класс для начинающего уровня', () => {
    const beginnerSkill = { ...mockSkill, calculated_level: 25 }
    const wrapper = mount(SkillBar, {
      props: { skill: beginnerSkill }
    })
    
    expect(wrapper.find('.skill-fill').classes()).toContain('skill-beginner')
  })

  it('применяет правильный цветовой класс для среднего уровня', () => {
    const intermediateSkill = { ...mockSkill, calculated_level: 55 }
    const wrapper = mount(SkillBar, {
      props: { skill: intermediateSkill }
    })
    
    expect(wrapper.find('.skill-fill').classes()).toContain('skill-intermediate')
  })

  it('отображает прогресс бар с правильной шириной', () => {
    const wrapper = mount(SkillBar, {
      props: { skill: mockSkill }
    })
    
    const progressBar = wrapper.find('.skill-fill')
    expect(progressBar.attributes('style')).toContain('width: 85%')
  })

  it('показывает буст от бейджей если calculated_level > base_level', () => {
    const wrapper = mount(SkillBar, {
      props: { skill: mockSkill }
    })
    
    const boost = wrapper.find('.skill-boost')
    expect(boost.exists()).toBe(true)
    expect(boost.text()).toBe('+10 от бейджей')
  })

  it('не показывает буст если calculated_level === base_level', () => {
    const noBoostSkill = { ...mockSkill, calculated_level: 75 }
    const wrapper = mount(SkillBar, {
      props: { skill: noBoostSkill }
    })
    
    expect(wrapper.find('.skill-boost').exists()).toBe(false)
  })

  it('отображает правильную иконку и название категории', () => {
    const wrapper = mount(SkillBar, {
      props: { skill: mockSkill }
    })
    
    const category = wrapper.find('.skill-category')
    expect(category.text()).toContain('👨‍🍳 Кухня')
  })

  it('обрабатывает неизвестную категорию', () => {
    const unknownCategorySkill = { ...mockSkill, category: 'unknown' }
    const wrapper = mount(SkillBar, {
      props: { skill: unknownCategorySkill }
    })
    
    const category = wrapper.find('.skill-category')
    expect(category.text()).toContain('⚙️ Другое')
  })
})
