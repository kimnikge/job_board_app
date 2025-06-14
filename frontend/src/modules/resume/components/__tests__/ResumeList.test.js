import { mount } from '@vue/test-utils'
import ResumeList from '../ResumeList.vue'

describe('ResumeList', () => {
  it('отображает список резюме', async () => {
    const resumes = [
      { id: 1, full_name: 'Иван Иванов', city: 'Москва', phone: '+7 999 123-45-67', languages: ['русский'], hard_skills: [], education: [], work_experience: [], social_links: {} }
    ]
    const wrapper = mount(ResumeList, {
      data() {
        return { resumes }
      }
    })
    expect(wrapper.text()).toContain('Иван Иванов')
  })
})
