import { mount } from '@vue/test-utils'
import JobModerationPanel from '../JobModerationPanel.vue'

describe('JobModerationPanel', () => {
  it('отображает кнопки модерации', () => {
    const wrapper = mount(JobModerationPanel, {
      props: { jobId: 1, status: 'pending' }
    })
    expect(wrapper.text()).toContain('Одобрить')
    expect(wrapper.text()).toContain('Отклонить')
  })

  it('вызывает событие при одобрении', async () => {
    const wrapper = mount(JobModerationPanel, {
      props: { jobId: 1, status: 'pending' }
    })
    await wrapper.find('button.approve').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('moderate')
  })
})
