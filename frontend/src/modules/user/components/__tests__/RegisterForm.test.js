import { mount } from '@vue/test-utils'
import RegisterForm from '../RegisterForm.vue'

describe('RegisterForm', () => {
  it('отображает форму регистрации', () => {
    const wrapper = mount(RegisterForm)
    expect(wrapper.text()).toContain('Регистрация')
  })
})
