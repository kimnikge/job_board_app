import { beforeAll, afterAll } from 'vitest'
import { config } from 'dotenv'
import path from 'path'

// Загружаем переменные окружения из файла .env в корне backend/supabase
beforeAll(() => {
  config({ path: path.join(process.cwd(), '../supabase/.env') })
})

afterAll(() => {
  // Очистка после всех тестов
})

// Глобальные моки для Deno окружения в Edge Functions
global.Deno = {
  env: {
    get: (key: string) => process.env[key]
  }
} as any

// Мок для crypto.subtle если его нет в Node.js
if (!global.crypto?.subtle) {
  const { webcrypto } = await import('node:crypto')
  global.crypto = webcrypto as any
}
