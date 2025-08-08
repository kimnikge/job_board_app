import { describe, it, expect, vi } from 'vitest'
import { useAuth } from '@/composables/useAuth'
import { useForm } from '@/composables/useForm'
import { authService } from '@/services/auth.service.js'

vi.mock('@/services/auth.service.js', () => ({
  authService: {
    login: vi.fn(async (email, password) => ({ 
      data: { user: { id: '1', email } } 
    }))
  }
}))

describe('Composables', () => {
  it('useAuth работает корректно', async () => {
    const { user, error, login } = useAuth()
    
    expect(user.value).toBeNull()
    expect(error.value).toBeNull()
    
    const result = await login('test@example.com', 'password')
    
    expect(user.value).toMatchObject({ id: '1', email: 'test@example.com' })
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password')
  })

  it('useForm управляет состоянием формы', () => {
    const initialData = { name: '', email: '' }
    const { form, errors, setField, setError, reset } = useForm(initialData)
    
    expect(form.value).toEqual(initialData)
    expect(errors.value).toEqual({})
    
    setField('name', 'John Doe')
    setError('email', 'Invalid email')
    
    expect(form.value.name).toBe('John Doe')
    expect(errors.value.email).toBe('Invalid email')
    
    reset()
    
    expect(form.value).toEqual(initialData)
    expect(errors.value).toEqual({})
  })
})
