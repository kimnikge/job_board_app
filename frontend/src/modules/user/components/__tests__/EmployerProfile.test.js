import { mount } from '@vue/test-utils'
import EmployerProfile from '../EmployerProfile.vue'

describe('EmployerProfile', () => {
  it('рендерит профиль работодателя', () => {
    const wrapper = mount(EmployerProfile, {
      props: { user: { company_name: 'ООО Рога и Копыта', contact_phone: '+7 999 123-45-67' } }
    })
    expect(wrapper.text()).toContain('ООО Рога и Копыта')
  })
})
