import { mount } from '@vue/test-utils'
import ApplicationForm from '../ApplicationForm.vue'

describe('ApplicationForm', () => {
  it('отправляет отклик', async () => {
    const mockApi = { createApplication: jest.fn().mockResolvedValue({}) }
    const wrapper = mount(ApplicationForm, {
      props: { jobPostingId: 1, resumeId: 2 },
      global: {
        mocks: { otclikApi: mockApi }
      }
    })
    await wrapper.find('textarea').setValue('Тестовое письмо')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('Отклик отправлен!')
  })
})
