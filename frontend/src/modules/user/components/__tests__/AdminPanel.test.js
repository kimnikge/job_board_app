import { mount } from '@vue/test-utils'
import AdminPanel from '../AdminPanel.vue'

describe('AdminPanel', () => {
  it('отображает пользователей и вакансии', () => {
    const wrapper = mount(AdminPanel)
    expect(wrapper.text()).toContain('Админ-панель')
    expect(wrapper.text()).toContain('Пользователи')
    expect(wrapper.text()).toContain('Вакансии')
  })
})
