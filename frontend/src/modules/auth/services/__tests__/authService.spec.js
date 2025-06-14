import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { authService } from '../authService'

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      resetPasswordForEmail: vi.fn()
    }
  }))
}))

describe('authService', () => {
  let supabase

  beforeEach(() => {
    vi.clearAllMocks()
    supabase = createClient('https://example.com', 'fake-key')
  })

  describe('register', () => {
    it('должен успешно зарегистрировать пользователя', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com'
      }

      supabase.auth.signUp.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        userType: 'employee'
      })

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            user_type: 'employee'
          }
        }
      })
      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    })

    it('должен вернуть ошибку при неудачной регистрации', async () => {
      const mockError = new Error('Email already registered')
      
      supabase.auth.signUp.mockResolvedValueOnce({
        data: { user: null },
        error: mockError
      })

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.error).toBe(mockError)
      expect(result.user).toBeNull()
    })
  })

  describe('login', () => {
    it('должен успешно авторизовать пользователя', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com'
      }

      supabase.auth.signIn.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    })

    it('должен вернуть ошибку при неудачной авторизации', async () => {
      const mockError = new Error('Invalid credentials')
      
      supabase.auth.signIn.mockResolvedValueOnce({
        data: { user: null },
        error: mockError
      })

      const result = await authService.login({
        email: 'test@example.com',
        password: 'wrong-password'
      })

      expect(result.error).toBe(mockError)
      expect(result.user).toBeNull()
    })
  })

  describe('resetPassword', () => {
    it('должен успешно отправить письмо для сброса пароля', async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({
        data: {},
        error: null
      })

      const result = await authService.resetPassword('test@example.com')

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com')
      expect(result.error).toBeNull()
    })

    it('должен вернуть ошибку при неудачной отправке письма', async () => {
      const mockError = new Error('Email not found')
      
      supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({
        data: {},
        error: mockError
      })

      const result = await authService.resetPassword('test@example.com')

      expect(result.error).toBe(mockError)
    })
  })
})