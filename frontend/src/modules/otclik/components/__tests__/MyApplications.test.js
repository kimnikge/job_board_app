import { mount } from '@vue/test-utils'
import MyApplications from '../MyApplications.vue'

describe('MyApplications', () => {
  it('отображает список откликов', async () => {
    const applications = [
      { id: 1, job_posting_title: 'Повар', status: 'pending', message: 'Хочу работать', created_at: new Date().toISOString() }
    ]
    const wrapper = mount(MyApplications, {
      data() {
        return { applications, loading: false, error: '' }
      }
    })
    expect(wrapper.text()).toContain('Повар')
    expect(wrapper.text()).toContain('Хочу работать')
  })
})
