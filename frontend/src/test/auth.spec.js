import { describe, it, expect, vi } from 'vitest'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth.service.js'

vi.mock('@/services/auth.service.js', () => ({
  authService: {
    login: vi.fn(async (email, password) => ({ 
      data: { user: { id: '1', email } } 
    })),
    logout: vi.fn(async () => ({ error: null })),
    getCurrentUser: vi.fn(async () => ({ 
      data: { user: { id: '1', email: 'test@example.com' } } 
    })),
    register: vi.fn(async (email, password, metadata) => ({ 
      data: { user: { id: '2', email } } 
    })),
    onAuthStateChange: vi.fn(() => {}),
    resetPassword: vi.fn(async () => ({ error: null }))
  }
}))

describe('Авторизация и аутентификация', () => {
  it('успешно авторизует пользователя', async () => {
    const auth = useAuthStore()
    const credentials = { email: 'test@example.com', password: 'password123' }
    
    const result = await auth.login(credentials)
    
    expect(result.success).toBe(true)
    expect(auth.user).toBeTruthy()
    expect(auth.isAuthenticated).toBe(true)
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('успешно выходит из системы', async () => {
    const auth = useAuthStore()
    // Сначала авторизуемся
    await auth.login({ email: 'test@example.com', password: 'password123' })
    
    await auth.logout()
    
    expect(auth.user).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
    expect(authService.logout).toHaveBeenCalled()
  })

  it('регистрирует нового пользователя', async () => {
    const auth = useAuthStore()
    const userData = { 
      email: 'new@example.com', 
      password: 'password123',
      userType: 'candidate',
      fullName: 'Новый Пользователь'
    }
    
    const result = await auth.register(userData)
    
    expect(result.success).toBe(true)
    expect(authService.register).toHaveBeenCalledWith(
      'new@example.com', 
      'password123',
      { user_type: 'candidate', full_name: 'Новый Пользователь' }
    )
  })

  it('получает текущего пользователя', async () => {
    const auth = useAuthStore()
    
    await auth.fetchUser()
    
    expect(auth.user).toMatchObject({ id: '1', email: 'test@example.com' })
    expect(authService.getCurrentUser).toHaveBeenCalled()
  })
})
