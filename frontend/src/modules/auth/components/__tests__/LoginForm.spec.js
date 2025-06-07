import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import LoginForm from '../LoginForm.vue'

describe('LoginForm', () => {
  let store
  let wrapper

  beforeEach(() => {
    store = createStore({
      modules: {
        auth: {
          namespaced: true,
          state: {
            loading: false,
            error: null
          },
          actions: {
            login: jest.fn()
          }
        }
      }
    })

    wrapper = mount(LoginForm, {
      global: {
        plugins: [store],
        stubs: {
          'router-link': true
        }
      }
    })
  })

  it('должен отображать форму входа', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('должен валидировать email', async () => {
    const emailInput = wrapper.find('input[type="email"]')
    
    // Пустой email
    await emailInput.setValue('')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.error-message').text()).toBe('Email обязателен')

    // Невалидный email
    await emailInput.setValue('invalid-email')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.error-message').text()).toBe('Введите корректный email')

    // Валидный email
    await emailInput.setValue('test@example.com')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.error-message').exists()).toBe(false)
  })

  it('должен валидировать пароль', async () => {
    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    
    // Устанавливаем валидный email
    await emailInput.setValue('test@example.com')
    
    // Пустой пароль
    await passwordInput.setValue('')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.error-message').text()).toBe('Пароль обязателен')

    // Короткий пароль
    await passwordInput.setValue('12345')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.error-message').text()).toBe('Пароль должен быть не менее 6 символов')

    // Валидный пароль
    await passwordInput.setValue('password123')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.error-message').exists()).toBe(false)
  })

  it('должен вызывать action login при отправке формы', async () => {
    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')
    
    await wrapper.find('form').trigger('submit')
    
    expect(store.dispatch).toHaveBeenCalledWith('auth/login', {
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('должен отображать состояние загрузки', async () => {
    store.state.auth.loading = true
    await wrapper.vm.$nextTick()
    
    const button = wrapper.find('button[type="submit"]')
    expect(button.text()).toBe('Вход...')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('должен отображать ошибку', async () => {
    const error = 'Invalid credentials'
    store.state.auth.error = error
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.alert.error').text()).toBe(error)
  })
}) 