import { authService } from '../authService'
import { supabase } from '@/supabase'

// Мокаем supabase
jest.mock('@/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      resetPasswordForEmail: jest.fn()
    }
  }
}))

describe('authService', () => {
  beforeEach(() => {
    // Очищаем все моки перед каждым тестом
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('должен успешно зарегистрировать пользователя', async () => {
      const mockUser = { id: 1, email: 'test@example.com' }
      supabase.auth.signUp.mockResolvedValueOnce({ data: { user: mockUser }, error: null })

      const result = await authService.register('test@example.com', 'password123')

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(result.data).toEqual({ user: mockUser })
      expect(result.error).toBeNull()
    })

    it('должен вернуть ошибку при неудачной регистрации', async () => {
      const mockError = new Error('Email already exists')
      supabase.auth.signUp.mockResolvedValueOnce({ data: null, error: mockError })

      const result = await authService.register('test@example.com', 'password123')

      expect(result.data).toBeNull()
      expect(result.error).toBe(mockError)
    })
  })

  describe('login', () => {
    it('должен успешно войти в систему', async () => {
      const mockUser = { id: 1, email: 'test@example.com' }
      supabase.auth.signInWithPassword.mockResolvedValueOnce({ data: { user: mockUser }, error: null })

      const result = await authService.login('test@example.com', 'password123')

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(result.data).toEqual({ user: mockUser })
      expect(result.error).toBeNull()
    })

    it('должен вернуть ошибку при неудачном входе', async () => {
      const mockError = new Error('Invalid credentials')
      supabase.auth.signInWithPassword.mockResolvedValueOnce({ data: null, error: mockError })

      const result = await authService.login('test@example.com', 'wrongpassword')

      expect(result.data).toBeNull()
      expect(result.error).toBe(mockError)
    })
  })

  describe('logout', () => {
    it('должен успешно выйти из системы', async () => {
      supabase.auth.signOut.mockResolvedValueOnce({ error: null })

      const result = await authService.logout()

      expect(supabase.auth.signOut).toHaveBeenCalled()
      expect(result.error).toBeNull()
    })

    it('должен вернуть ошибку при неудачном выходе', async () => {
      const mockError = new Error('Logout failed')
      supabase.auth.signOut.mockResolvedValueOnce({ error: mockError })

      const result = await authService.logout()

      expect(result.error).toBe(mockError)
    })
  })

  describe('getCurrentUser', () => {
    it('должен получить текущего пользователя', async () => {
      const mockUser = { id: 1, email: 'test@example.com' }
      supabase.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null })

      const result = await authService.getCurrentUser()

      expect(supabase.auth.getUser).toHaveBeenCalled()
      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    })

    it('должен вернуть ошибку при неудачном получении пользователя', async () => {
      const mockError = new Error('Not authenticated')
      supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: mockError })

      const result = await authService.getCurrentUser()

      expect(result.user).toBeNull()
      expect(result.error).toBe(mockError)
    })
  })

  describe('resetPassword', () => {
    it('должен успешно отправить письмо для сброса пароля', async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ data: {}, error: null })

      const result = await authService.resetPassword('test@example.com')

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com')
      expect(result.data).toEqual({})
      expect(result.error).toBeNull()
    })

    it('должен вернуть ошибку при неудачной отправке письма', async () => {
      const mockError = new Error('Email not found')
      supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ data: null, error: mockError })

      const result = await authService.resetPassword('nonexistent@example.com')

      expect(result.data).toBeNull()
      expect(result.error).toBe(mockError)
    })
  })
}) 