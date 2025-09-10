import { createClient } from '@supabase/supabase-js'

/**
 * Создает клиент Supabase для тестов
 */
export function createTestSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Отсутствуют переменные окружения SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

/**
 * Генерирует тестовые данные для Telegram пользователя
 */
export async function generateTelegramUserData(overrides: Partial<TelegramUserData> = {}): Promise<TelegramUserData> {
  const timestamp = Math.floor(Date.now() / 1000)
  const baseData = {
    id: Math.floor(Math.random() * 1000000000),
    first_name: 'Test',
    last_name: 'User',
    username: `testuser_${Date.now()}`,
    photo_url: 'https://example.com/photo.jpg',
    auth_date: timestamp,
    ...overrides
  }

  // Генерируем hash для тестовых данных
  const hash = await generateTestHash(baseData)
  
  return {
    ...baseData,
    hash
  }
}

/**
 * Генерирует корректный hash для тестовых данных Telegram
 */
export async function generateTestHash(data: Omit<TelegramUserData, 'hash'>): Promise<string> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    throw new Error('Отсутствует TELEGRAM_BOT_TOKEN')
  }

  // Создаем строку для проверки (все поля кроме hash, отсортированные по алфавиту)
  const dataCheckString = Object.keys(data)
    .filter((key) => data[key as keyof typeof data] !== undefined)
    .sort()
    .map((key) => `${key}=${data[key as keyof typeof data]}`)
    .join('\n')

  // Создаем secret key из bot token согласно Telegram Login Widget API
  const encoder = new TextEncoder()

  // Шаг 1: Создаем ключ из строки "WebAppData"
  const webAppDataKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  // Шаг 2: Создаем secret key из bot token
  const secretKeyBuffer = await crypto.subtle.sign(
    'HMAC',
    webAppDataKey,
    encoder.encode(botToken)
  )

  // Шаг 3: Импортируем secret key для финального хеширования
  const secretKey = await crypto.subtle.importKey(
    'raw',
    secretKeyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  // Шаг 4: Вычисляем хеш данных
  const computedHashBuffer = await crypto.subtle.sign(
    'HMAC',
    secretKey,
    encoder.encode(dataCheckString)
  )

  return Array.from(new Uint8Array(computedHashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Очищает тестовые данные из базы
 */
export async function cleanupTestData(telegramIds: string[]) {
  if (telegramIds.length === 0) return

  const supabase = createTestSupabaseClient()
  
  // Используем правильное имя таблицы - user_profiles, а не profiles
  await supabase
    .from('user_profiles')
    .delete()
    .in('telegram_id', telegramIds)

  // Удаляем пользователей из auth.users через RPC
  for (const telegramId of telegramIds) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('telegram_id', telegramId)
      .single()

    if (profile?.user_id) {
      await supabase.auth.admin.deleteUser(profile.user_id)
    }
  }
}

/**
 * Создает HTTP Request для тестирования Edge Functions
 */
export function createTestRequest(method: string, body?: any, headers?: Record<string, string>) {
  const url = 'https://test.com'
  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  }

  if (body) {
    requestInit.body = JSON.stringify(body)
  }

  return new Request(url, requestInit)
}

export interface TelegramUserData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}
