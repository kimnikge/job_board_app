import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { 
  generateTelegramUserData, 
  createTestSupabaseClient, 
  cleanupTestData,
  createTestRequest,
  type TelegramUserData 
} from '../utils/test-helpers'
import '../utils/deno-mocks'

// Импортируем логику из telegram-login функции
// Поскольку это Edge Function, нам нужно эмулировать её поведение
import { createClient } from '@supabase/supabase-js'

describe('Telegram Login Authentication', () => {
  let testUsers: TelegramUserData[] = []
  let supabase: ReturnType<typeof createTestSupabaseClient>

  beforeEach(() => {
    testUsers = []
    supabase = createTestSupabaseClient()
  })

  afterEach(async () => {
    // Очищаем тестовые данные после каждого теста
    const telegramIds = testUsers.map(user => user.id.toString())
    await cleanupTestData(telegramIds)
  })

  describe('Валидация входных данных', () => {
    it('должен отклонять запросы без обязательных полей', async () => {
      const result = await simulateTelegramLogin({ id: 0, first_name: '', auth_date: 0, hash: '' })
      
      expect(result.status).toBe(400)
      const body = await result.json()
      expect(body.error).toContain('Missing required Telegram data')
    })

    it('должен отклонять запросы с неправильным hash', async () => {
      const userData = await generateTelegramUserData()
      userData.hash = 'invalid_hash'
      
      const result = await simulateTelegramLogin(userData)
      
      expect(result.status).toBe(401)
      const body = await result.json()
      expect(body.error).toContain('Invalid Telegram authentication data')
    })

    it('должен отклонять устаревшие данные (старше 24 часов)', async () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - 86401 // 24 часа + 1 секунда назад
      const userData = await generateTelegramUserData({ auth_date: oldTimestamp })
      
      const result = await simulateTelegramLogin(userData)
      
      expect(result.status).toBe(401)
      const body = await result.json()
      expect(body.error).toContain('Authentication data expired')
    })
  })

  describe('Регистрация нового пользователя', () => {
    it('должен создать нового пользователя с корректными данными', async () => {
      const userData = await generateTelegramUserData({
        first_name: 'Иван',
        last_name: 'Петров',
        username: 'ivanpetrov'
      })
      testUsers.push(userData)

      const result = await simulateTelegramLogin(userData)
      
      expect(result.status).toBe(200)
      const body = await result.json()
      expect(body.success).toBe(true)
      expect(body.user_id).toBeDefined()
      expect(body.message).toContain('authenticated successfully')

      // Проверяем, что пользователь создан в базе данных
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', userData.id.toString())
        .single()

      expect(profile).toBeDefined()
      expect(profile.first_name).toBe('Иван')
      expect(profile.last_name).toBe('Петров')
      expect(profile.username).toBe('ivanpetrov')
      expect(profile.user_type).toBe('candidate')
    })

    it('должен создать пользователя с минимальным набором данных', async () => {
      const userData = await generateTelegramUserData({
        first_name: 'Анна',
        // Убираем опциональные поля
        last_name: undefined,
        username: undefined,
        photo_url: undefined
      })
      testUsers.push(userData)

      const result = await simulateTelegramLogin(userData)
      
      expect(result.status).toBe(200)
      
      // Проверяем, что пользователь создан с минимальными данными
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', userData.id.toString())
        .single()

      expect(profile).toBeDefined()
      expect(profile.first_name).toBe('Анна')
      expect(profile.last_name).toBeNull()
      expect(profile.username).toBeNull()
    })
  })

  describe('Авторизация существующего пользователя', () => {
    it('должен обновить данные существующего пользователя', async () => {
      // Создаем пользователя
      const userData = await generateTelegramUserData({
        first_name: 'Старое имя',
        username: 'old_username'
      })
      testUsers.push(userData)

      // Первый вход - создание
      await simulateTelegramLogin(userData)

      // Обновляем данные пользователя
      const updatedUserData = {
        ...userData,
        first_name: 'Новое имя',
        username: 'new_username'
      }

      // Второй вход - обновление
      const result = await simulateTelegramLogin(updatedUserData)
      
      expect(result.status).toBe(200)

      // Проверяем, что данные обновились
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', userData.id.toString())
        .single()

      expect(profile.first_name).toBe('Новое имя')
      expect(profile.username).toBe('new_username')
    })

    it('должен возвращать того же пользователя при повторном входе', async () => {
      const userData = await generateTelegramUserData()
      testUsers.push(userData)

      // Первый вход
      const firstResult = await simulateTelegramLogin(userData)
      const firstBody = await firstResult.json()

      // Второй вход с теми же данными
      const secondResult = await simulateTelegramLogin(userData)
      const secondBody = await secondResult.json()
      
      expect(firstResult.status).toBe(200)
      expect(secondResult.status).toBe(200)
      expect(firstBody.user_id).toBe(secondBody.user_id)
    })
  })

  describe('Создание сессии', () => {
    it('должен создать magic link для аутентификации', async () => {
      const userData = await generateTelegramUserData()
      testUsers.push(userData)

      const result = await simulateTelegramLogin(userData)
      const body = await result.json()
      
      expect(result.status).toBe(200)
      expect(body.redirect_url).toBeDefined()
      expect(body.redirect_url).toContain('http')
    })
  })

  describe('CORS обработка', () => {
    it('должен обрабатывать OPTIONS запросы', async () => {
      const request = createTestRequest('OPTIONS')
      const result = await simulateTelegramLogin(null, request)
      
      expect(result.status).toBe(200)
      expect(result.headers.get('Access-Control-Allow-Origin')).toBe('*')
    })

    it('должен включать CORS заголовки в ответ', async () => {
      const userData = await generateTelegramUserData()
      testUsers.push(userData)

      const result = await simulateTelegramLogin(userData)
      
      expect(result.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(result.headers.get('Content-Type')).toBe('application/json')
    })
  })

  describe('Обработка ошибок', () => {
    it('должен отклонять GET запросы', async () => {
      const request = createTestRequest('GET')
      const result = await simulateTelegramLogin(null, request)
      
      expect(result.status).toBe(405)
    })

    it('должен обрабатывать ошибки базы данных', async () => {
      // Мокаем ошибку Supabase
      const mockSupabase = {
        ...supabase,
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: new Error('Database error') })
            })
          })
        })
      }

      const userData = await generateTelegramUserData()
      
      // Эмулируем ошибку базы данных
      vi.stubGlobal('createClient', () => mockSupabase)
      
      const result = await simulateTelegramLogin(userData)
      
      expect(result.status).toBe(500)
      const body = await result.json()
      expect(body.error).toBeDefined()
      
      vi.unstubAllGlobals()
    })
  })
})

/**
 * Симулирует вызов Edge Function telegram-login
 */
async function simulateTelegramLogin(
  userData: TelegramUserData | null, 
  request?: Request
): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  }

  if (!request) {
    request = createTestRequest('POST', userData)
  }

  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    })
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = userData || await request.json()
    const { id, first_name, last_name, username, photo_url, auth_date, hash } = body

    // Базовая проверка данных
    if (!id || !auth_date || !hash) {
      return new Response(
        JSON.stringify({ error: 'Missing required Telegram data' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Проверка hash от Telegram для production
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (botToken) {
      // Создаем строку для проверки (все поля кроме hash, отсортированные по алфавиту)
      const dataObj = { id, first_name, last_name, username, photo_url, auth_date }
      const dataCheckString = Object.keys(dataObj)
        .filter((key) => dataObj[key as keyof typeof dataObj] !== undefined)
        .sort()
        .map((key) => `${key}=${dataObj[key as keyof typeof dataObj]}`)
        .join('\n')

      // Создаем secret key из bot token согласно Telegram Login Widget API
      const encoder = new TextEncoder()

      // Шаг 1: Создаем ключ из строки "WebAppData"
      const webAppDataKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode('WebAppData'),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
      )

      // Шаг 2: Создаем secret key из bot token
      const secretKeyBuffer = await crypto.subtle.sign(
        'HMAC',
        webAppDataKey,
        encoder.encode(botToken),
      )

      // Шаг 3: Импортируем secret key для финального хеширования
      const secretKey = await crypto.subtle.importKey(
        'raw',
        secretKeyBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
      )

      // Шаг 4: Вычисляем хеш данных
      const computedHashBuffer = await crypto.subtle.sign(
        'HMAC',
        secretKey,
        encoder.encode(dataCheckString),
      )

      const expectedHash = Array.from(new Uint8Array(computedHashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      if (hash !== expectedHash) {
        return new Response(
          JSON.stringify({ error: 'Invalid Telegram authentication data' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      // Проверка времени (данные не старше 24 часов)
      const currentTime = Math.floor(Date.now() / 1000)
      if (currentTime - auth_date > 86400) {
        return new Response(
          JSON.stringify({ error: 'Authentication data expired' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }
    }

    const telegramId = id.toString()

    // Ищем существующего пользователя
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('telegram_id', telegramId)
      .single()

    let userId: string

    if (existingUser) {
      // Пользователь существует, обновляем данные
      userId = existingUser.user_id

      await supabase
        .from('profiles')
        .update({
          first_name,
          last_name,
          username,
          photo_url,
          updated_at: new Date().toISOString(),
        })
        .eq('telegram_id', telegramId)
    } else {
      // Создаем нового пользователя
      const email = `telegram_${id}@telegram.local`
      const tempPassword = `temp_${hash}_${Date.now()}`

      // Создаем пользователя в auth.users
      const { data: authUser, error: authError } = await supabase.auth.admin
        .createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            telegram_id: id,
            first_name,
            last_name,
            username,
          },
        })

      if (authError) {
        throw authError
      }

      userId = authUser.user.id

      // Создаем профиль
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          telegram_id: telegramId,
          first_name,
          last_name,
          username,
          photo_url,
          user_type: 'candidate',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (profileError) {
        throw profileError
      }
    }

    // Создаем сессию для пользователя
    const { data: sessionData, error: sessionError } = await supabase.auth.admin
      .generateLink({
        type: 'magiclink',
        email: `telegram_${id}@telegram.local`,
        options: {
          redirectTo: `${
            request.headers.get('origin') ||
            process.env.CORS_ORIGIN ||
            'http://localhost:3000'
          }/auth/callback`,
        },
      })

    if (sessionError) {
      throw sessionError
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        message: 'User authenticated successfully',
        redirect_url: sessionData.properties?.action_link,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
}
