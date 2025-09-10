import { describe, it, expect } from 'vitest'

describe('Базовая настройка тестов', () => {
  it('должен корректно работать с переменными окружения', () => {
    // Проверяем что Deno мок работает
    expect(global.Deno).toBeDefined()
    expect(global.Deno.env.get).toBeInstanceOf(Function)
  })

  it('должен корректно работать с crypto', () => {
    // Проверяем что crypto доступно
    expect(global.crypto).toBeDefined()
    expect(global.crypto.subtle).toBeDefined()
  })

  it('должен корректно импортировать зависимости', async () => {
    // Проверяем что можем импортировать нужные модули
    const { createClient } = await import('@supabase/supabase-js')
    expect(createClient).toBeInstanceOf(Function)
  })
})
