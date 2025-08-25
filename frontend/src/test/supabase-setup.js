import { beforeAll, afterAll, afterEach, vi } from 'vitest'
import { supabase } from '@/services/supabase'

// Мок для Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn()
    },
    storage: {
      from: vi.fn()
    },
    removeChannel: vi.fn(),
    channel: vi.fn()
  }
}))

// Глобальные моки для всех тестов
beforeAll(() => {
  // Базовые ответы для auth
  supabase.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: null
  })
  
  // Базовые ответы для queries
  supabase.from.mockImplementation((table) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn()
  }))
})

// Очистка моков после каждого теста
afterEach(() => {
  vi.clearAllMocks()
})

// Очистка после всех тестов
afterAll(() => {
  vi.resetAllMocks()
})
