import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import RegisterForm from '../RegisterForm.vue'

describe('RegisterForm', () => {
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
            register: jest.fn()
          }
        }
      }
    })

    wrapper = mount(RegisterForm, {
      global: {
        plugins: [store],
        stubs: {
          'router-link': true
        }
      }
    })
  })

  it('должен отображать форму регистрации', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.findAll('input[type="password"]').length).toBe(2)
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
    const confirmPasswordInput = wrapper.findAll('input[type="password"]')[1]
    
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

  it('должен валидировать подтверждение пароля', async () => {
    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const confirmPasswordInput = wrapper.findAll('input[type="password"]')[1]
    
    // Устанавливаем валидные email и пароль
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')
    
    // Пустое подтверждение пароля
    await confirmPasswordInput.setValue('')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.error-message').text()).toBe('Подтверждение пароля обязательно')

    // Несовпадающие пароли
    await confirmPasswordInput.setValue('different-password')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.error-message').text()).toBe('Пароли не совпадают')

    // Совпадающие пароли
    await confirmPasswordInput.setValue('password123')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.error-message').exists()).toBe(false)
  })

  it('должен вызывать action register при отправке формы', async () => {
    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const confirmPasswordInput = wrapper.findAll('input[type="password"]')[1]
    
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')
    await confirmPasswordInput.setValue('password123')
    
    await wrapper.find('form').trigger('submit')
    
    expect(store.dispatch).toHaveBeenCalledWith('auth/register', {
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('должен отображать состояние загрузки', async () => {
    store.state.auth.loading = true
    await wrapper.vm.$nextTick()
    
    const button = wrapper.find('button[type="submit"]')
    expect(button.text()).toBe('Регистрация...')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('должен отображать ошибку', async () => {
    const error = 'Email already exists'
    store.state.auth.error = error
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.alert.error').text()).toBe(error)
  })
}) 