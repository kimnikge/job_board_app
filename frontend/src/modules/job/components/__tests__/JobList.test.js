import { mount } from '@vue/test-utils'
import JobList from '../JobList.vue'

describe('JobList', () => {
  it('renders job cards and ApplicationForm', async () => {
    // Мокаем список вакансий
    const jobs = [
      { id: 1, title: 'Повар', company: 'Ресторан', location: 'Алматы', salary: '100 000₸', is_active: true, is_approved: true },
      { id: 2, title: 'Бариста', company: 'Кофейня', location: 'Астана', salary: '80 000₸', is_active: true, is_approved: true }
    ]
    const wrapper = mount(JobList, {
      data() {
        return { jobs }
      },
      global: {
        stubs: ['ApplicationForm']
      }
    })
    expect(wrapper.text()).toContain('Повар')
    expect(wrapper.text()).toContain('Бариста')
    // Проверяем, что ApplicationForm есть в каждой карточке
    expect(wrapper.findAllComponents({ name: 'ApplicationForm' }).length).toBe(jobs.length)
  })
})
