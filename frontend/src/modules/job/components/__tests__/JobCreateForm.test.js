import { mount } from '@vue/test-utils'
import JobCreateForm from '../JobCreateForm.vue'

describe('JobCreateForm', () => {
  it('отправляет форму создания вакансии', async () => {
    const wrapper = mount(JobCreateForm, {
      props: { },
      global: {
        mocks: {
          jobApi: { createJob: jest.fn().mockResolvedValue({ id: 1 }) }
        }
      }
    })
    await wrapper.find('input[name="title"]').setValue('Повар')
    await wrapper.find('input[name="company"]').setValue('Ресторан')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.emitted()).toHaveProperty('created')
  })
})
