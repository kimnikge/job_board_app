import { describe, it, expect } from 'vitest'
import { createTestSupabaseClient } from './utils/test-helpers'

describe('Схема базы данных', () => {
  it('должен показать доступные таблицы', async () => {
    const supabase = createTestSupabaseClient()
    
    // Попробуем найти таблицу с профилями пользователей
    const tableNames = ['profiles', 'user_profiles', 'users']
    
    for (const tableName of tableNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (!error) {
          console.log(`✅ Таблица '${tableName}' найдена`)
          if (data && data.length > 0) {
            console.log('Первая запись:', Object.keys(data[0]))
          }
        }
      } catch (err) {
        console.log(`❌ Таблица '${tableName}' не найдена`)
      }
    }
    
    // Этот тест всегда проходит, он только для диагностики
    expect(true).toBe(true)
  })
})
