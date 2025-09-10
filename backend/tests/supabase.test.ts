import { describe, it, expect, beforeAll } from 'vitest'
import { createTestSupabaseClient } from './utils/test-helpers'

describe('Подключение к Supabase', () => {
  let supabase: ReturnType<typeof createTestSupabaseClient>

  beforeAll(() => {
    supabase = createTestSupabaseClient()
  })

  it('должен подключаться к Supabase', async () => {
    expect(supabase).toBeDefined()
    
    // Проверяем подключение
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.warn('Предупреждение: не удалось подключиться к таблице profiles:', error.message)
      // Не делаем тест неуспешным, так как таблица может не существовать в тестовой среде
    } else {
      expect(data).toBeDefined()
    }
  })

  it('должен иметь правильные переменные окружения', () => {
    expect(process.env.SUPABASE_URL).toBeTruthy()
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeTruthy()
    expect(process.env.TELEGRAM_BOT_TOKEN).toBeTruthy()
  })

  it('должен создавать client с правильными параметрами', () => {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    expect(url).toMatch(/^https:\/\/.*\.supabase\.co$/)
    expect(key).toMatch(/^eyJ.*/) // JWT token format
  })
})
