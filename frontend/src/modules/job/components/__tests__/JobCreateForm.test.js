import { mount, flushPromises } from '@vue/test-utils'
import JobCreateForm from '../JobCreateForm.vue'

globalThis.alert = vi.fn()

describe('JobCreateForm', () => {
  it('отправляет форму создания вакансии', async () => {
    // Мокаем supabase
    vi.mock('@supabase/supabase-js', () => ({
      createClient: () => ({
        from: () => ({
          insert: async () => ({ error: null })
        })
      })
    }))
    const wrapper = mount(JobCreateForm)
    await wrapper.find('input').setValue('Повар')
    await wrapper.find('textarea').setValue('Описание')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    expect(globalThis.alert).toHaveBeenCalledWith('Вакансия успешно создана!')
  })
})
