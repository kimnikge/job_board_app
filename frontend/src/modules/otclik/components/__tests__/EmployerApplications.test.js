import { mount } from '@vue/test-utils'
import EmployerApplications from '../EmployerApplications.vue'

describe('EmployerApplications', () => {
  it('отображает список откликов на вакансии работодателя', async () => {
    const applications = [
      { id: 1, applicant_name: 'Иван', job_posting_title: 'Повар', status: 'pending', message: 'Готов работать', created_at: new Date().toISOString() }
    ]
    const wrapper = mount(EmployerApplications, {
      data() {
        return { applications, loading: false, error: '' }
      }
    })
    expect(wrapper.text()).toContain('Иван')
    expect(wrapper.text()).toContain('Повар')
    expect(wrapper.text()).toContain('Готов работать')
  })
})
