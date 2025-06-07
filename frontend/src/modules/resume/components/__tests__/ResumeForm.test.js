import { mount } from '@vue/test-utils'
import ResumeForm from '../ResumeForm.vue'

describe('ResumeForm', () => {
  it('отправляет форму и очищает поля', async () => {
    const wrapper = mount(ResumeForm)
    await wrapper.find('input[placeholder*="ФИО"]').setValue('Иван Иванов')
    await wrapper.find('input[placeholder*="Город"]').setValue('Москва')
    await wrapper.find('input[placeholder*="Телефон"]').setValue('+7 999 123-45-67')
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.find('input[placeholder*="ФИО"]').element.value).toBe('')
  })
})
