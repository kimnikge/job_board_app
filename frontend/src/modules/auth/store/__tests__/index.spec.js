import { createStore } from 'vuex'
import auth from '../index'
import { authService } from '../../services/authService'

// Мокаем authService
jest.mock('../../services/authService')

describe('auth store', () => {
  let store

  beforeEach(() => {
    store = createStore({
      modules: {
        auth
      }
    })
    jest.clearAllMocks()
  })

  describe('mutations', () => {
    it('SET_USER должен обновить состояние пользователя', () => {
      const user = { id: 1, email: 'test@example.com' }
      store.commit('auth/SET_USER', user)
      expect(store.state.auth.user).toEqual(user)
    })

    it('SET_LOADING должен обновить состояние загрузки', () => {
      store.commit('auth/SET_LOADING', true)
      expect(store.state.auth.loading).toBe(true)
    })

    it('SET_ERROR должен обновить состояние ошибки', () => {
      const error = 'Something went wrong'
      store.commit('auth/SET_ERROR', error)
      expect(store.state.auth.error).toBe(error)
    })
  })

  describe('actions', () => {
    describe('login', () => {
      it('должен успешно войти в систему', async () => {
        const user = { id: 1, email: 'test@example.com' }
        authService.login.mockResolvedValueOnce({ data: { user }, error: null })

        const result = await store.dispatch('auth/login', {
          email: 'test@example.com',
          password: 'password123'
        })

        expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123')
        expect(store.state.auth.user).toEqual(user)
        expect(store.state.auth.error).toBeNull()
        expect(result).toBe(true)
      })

      it('должен обработать ошибку при входе', async () => {
        const error = new Error('Invalid credentials')
        authService.login.mockResolvedValueOnce({ data: null, error })

        const result = await store.dispatch('auth/login', {
          email: 'test@example.com',
          password: 'wrongpassword'
        })

        expect(store.state.auth.user).toBeNull()
        expect(store.state.auth.error).toBe(error.message)
        expect(result).toBe(false)
      })
    })

    describe('register', () => {
      it('должен успешно зарегистрировать пользователя', async () => {
        const user = { id: 1, email: 'test@example.com' }
        authService.register.mockResolvedValueOnce({ data: { user }, error: null })

        const result = await store.dispatch('auth/register', {
          email: 'test@example.com',
          password: 'password123'
        })

        expect(authService.register).toHaveBeenCalledWith('test@example.com', 'password123')
        expect(store.state.auth.user).toEqual(user)
        expect(store.state.auth.error).toBeNull()
        expect(result).toBe(true)
      })

      it('должен обработать ошибку при регистрации', async () => {
        const error = new Error('Email already exists')
        authService.register.mockResolvedValueOnce({ data: null, error })

        const result = await store.dispatch('auth/register', {
          email: 'test@example.com',
          password: 'password123'
        })

        expect(store.state.auth.user).toBeNull()
        expect(store.state.auth.error).toBe(error.message)
        expect(result).toBe(false)
      })
    })

    describe('logout', () => {
      it('должен успешно выйти из системы', async () => {
        authService.logout.mockResolvedValueOnce({ error: null })

        const result = await store.dispatch('auth/logout')

        expect(authService.logout).toHaveBeenCalled()
        expect(store.state.auth.user).toBeNull()
        expect(store.state.auth.error).toBeNull()
        expect(result).toBe(true)
      })

      it('должен обработать ошибку при выходе', async () => {
        const error = new Error('Logout failed')
        authService.logout.mockResolvedValueOnce({ error })

        const result = await store.dispatch('auth/logout')

        expect(store.state.auth.error).toBe(error.message)
        expect(result).toBe(false)
      })
    })

    describe('checkAuth', () => {
      it('должен успешно проверить авторизацию', async () => {
        const user = { id: 1, email: 'test@example.com' }
        authService.getCurrentUser.mockResolvedValueOnce({ user, error: null })

        const result = await store.dispatch('auth/checkAuth')

        expect(authService.getCurrentUser).toHaveBeenCalled()
        expect(store.state.auth.user).toEqual(user)
        expect(store.state.auth.error).toBeNull()
        expect(result).toBe(true)
      })

      it('должен обработать ошибку при проверке авторизации', async () => {
        const error = new Error('Not authenticated')
        authService.getCurrentUser.mockResolvedValueOnce({ user: null, error })

        const result = await store.dispatch('auth/checkAuth')

        expect(store.state.auth.user).toBeNull()
        expect(store.state.auth.error).toBe(error.message)
        expect(result).toBe(false)
      })
    })
  })

  describe('getters', () => {
    it('isAuthenticated должен вернуть true при наличии пользователя', () => {
      const user = { id: 1, email: 'test@example.com' }
      store.commit('auth/SET_USER', user)
      expect(store.getters['auth/isAuthenticated']).toBe(true)
    })

    it('isAuthenticated должен вернуть false при отсутствии пользователя', () => {
      store.commit('auth/SET_USER', null)
      expect(store.getters['auth/isAuthenticated']).toBe(false)
    })

    it('currentUser должен вернуть текущего пользователя', () => {
      const user = { id: 1, email: 'test@example.com' }
      store.commit('auth/SET_USER', user)
      expect(store.getters['auth/currentUser']).toEqual(user)
    })

    it('isLoading должен вернуть состояние загрузки', () => {
      store.commit('auth/SET_LOADING', true)
      expect(store.getters['auth/isLoading']).toBe(true)
    })

    it('error должен вернуть ошибку', () => {
      const error = 'Something went wrong'
      store.commit('auth/SET_ERROR', error)
      expect(store.getters['auth/error']).toBe(error)
    })
  })
}) 