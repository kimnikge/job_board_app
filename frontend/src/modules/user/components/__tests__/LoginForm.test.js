import { mount } from '@vue/test-utils'
import LoginForm from '../LoginForm.vue'

describe('LoginForm', () => {
  it('отображает форму логина', () => {
    const wrapper = mount(LoginForm)
    expect(wrapper.text()).toContain('Вход')
  })
})
