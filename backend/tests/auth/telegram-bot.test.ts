import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { 
  generateTelegramUserData, 
  createTestSupabaseClient, 
  cleanupTestData,
  type TelegramUserData 
} from '../utils/test-helpers'
import '../utils/deno-mocks'

// Моки для Telegram Bot API
const mockTelegramAPI = {
  sendMessage: vi.fn(),
  answerCallbackQuery: vi.fn(),
  editMessageText: vi.fn()
}

// Мок для Grammy bot
const mockBot = {
  command: vi.fn(),
  on: vi.fn(),
  api: mockTelegramAPI
}

vi.mock('https://deno.land/x/grammy@v1.19.2/mod.ts', () => ({
  Bot: vi.fn(() => mockBot),
  webhookCallback: vi.fn()
}))

describe('Telegram Bot Integration', () => {
  let testUsers: TelegramUserData[] = []
  let supabase: ReturnType<typeof createTestSupabaseClient>

  beforeEach(() => {
    testUsers = []
    supabase = createTestSupabaseClient()
    vi.clearAllMocks()
  })

  afterEach(async () => {
    // Очищаем тестовые данные после каждого теста
    const telegramIds = testUsers.map(user => user.id.toString())
    await cleanupTestData(telegramIds)
  })

  describe('Команда /start', () => {
    it('должен отправлять приветственное сообщение', async () => {
      const mockContext = createMockContext({
        message: { text: '/start' },
        from: { id: 123456789 }
      })

      await simulateStartCommand(mockContext)
      
      expect(mockContext.reply).toHaveBeenCalledWith(
        expect.stringContaining('Добро пожаловать в HR-платформу для общепита!'),
        expect.objectContaining({
          reply_markup: expect.objectContaining({
            inline_keyboard: expect.any(Array)
          })
        })
      )
    })

    it('должен включать кнопку для открытия приложения', async () => {
      const mockContext = createMockContext({
        message: { text: '/start' },
        from: { id: 123456789 }
      })

      await simulateStartCommand(mockContext)
      
      const lastCall = mockContext.reply.mock.calls[0]
      const replyMarkup = lastCall[1].reply_markup
      
      expect(replyMarkup.inline_keyboard[0][0]).toEqual({
        text: '🚀 Открыть приложение',
        web_app: { url: expect.stringContaining('http') }
      })
    })
  })

  describe('Команда /urgent', () => {
    it('должен показывать срочные вакансии', async () => {
      // Создаем тестовую срочную вакансию
      await createTestUrgentJob()

      const mockContext = createMockContext({
        message: { text: '/urgent' },
        from: { id: 123456789 }
      })

      await simulateUrgentCommand(mockContext)
      
      expect(mockContext.reply).toHaveBeenCalledWith(
        expect.stringContaining('Срочные вакансии:'),
        expect.objectContaining({
          parse_mode: 'HTML',
          reply_markup: expect.objectContaining({
            inline_keyboard: expect.any(Array)
          })
        })
      )
    })

    it('должен показывать сообщение о отсутствии срочных вакансий', async () => {
      const mockContext = createMockContext({
        message: { text: '/urgent' },
        from: { id: 123456789 }
      })

      await simulateUrgentCommand(mockContext)
      
      expect(mockContext.reply).toHaveBeenCalledWith(
        '🔍 Сейчас нет срочных вакансий'
      )
    })
  })

  describe('Команда /jobs', () => {
    it('должен показывать обычные вакансии', async () => {
      // Создаем тестовую обычную вакансию
      await createTestRegularJob()

      const mockContext = createMockContext({
        message: { text: '/jobs' },
        from: { id: 123456789 }
      })

      await simulateJobsCommand(mockContext)
      
      expect(mockContext.reply).toHaveBeenCalledWith(
        expect.stringContaining('Последние вакансии:'),
        expect.objectContaining({
          parse_mode: 'HTML',
          reply_markup: expect.objectContaining({
            inline_keyboard: expect.any(Array)
          })
        })
      )
    })

    it('должен показывать сообщение о отсутствии вакансий', async () => {
      const mockContext = createMockContext({
        message: { text: '/jobs' },
        from: { id: 123456789 }
      })

      await simulateJobsCommand(mockContext)
      
      expect(mockContext.reply).toHaveBeenCalledWith(
        '🔍 Пока нет доступных вакансий'
      )
    })
  })

  describe('Команда /ready', () => {
    it('должен включать режим "готов выйти завтра" для существующего пользователя', async () => {
      const userData = await generateTelegramUserData()
      testUsers.push(userData)
      
      // Создаем пользователя в базе
      await createTestUser(userData)

      const mockContext = createMockContext({
        message: { text: '/ready' },
        from: { id: userData.id }
      })

      await simulateReadyCommand(mockContext)
      
      expect(mockContext.reply).toHaveBeenCalledWith(
        expect.stringContaining('✅ Отлично! Теперь вы будете получать уведомления')
      )

      // Проверяем, что флаг установлен в базе данных
      const { data: profile } = await supabase
        .from('profiles')
        .select('ready_for_urgent, urgent_available_until')
        .eq('telegram_id', userData.id.toString())
        .single()

      expect(profile?.ready_for_urgent).toBe(true)
      expect(profile?.urgent_available_until).toBeDefined()
    })

    it('должен показывать ошибку для несуществующего пользователя', async () => {
      const mockContext = createMockContext({
        message: { text: '/ready' },
        from: { id: 999999999 }
      })

      await simulateReadyCommand(mockContext)
      
      expect(mockContext.reply).toHaveBeenCalledWith(
        '❌ Сначала нужно создать профиль в приложении'
      )
    })
  })

  describe('Команда /profile', () => {
    it('должен показывать профиль существующего пользователя', async () => {
      const userData = await generateTelegramUserData({
        first_name: 'Иван',
        last_name: 'Петров',
        username: 'ivan_petrov'
      })
      testUsers.push(userData)
      
      await createTestUser(userData)

      const mockContext = createMockContext({
        message: { text: '/profile' },
        from: { id: userData.id }
      })

      await simulateProfileCommand(mockContext)
      
      expect(mockContext.reply).toHaveBeenCalledWith(
        expect.stringContaining('👤 Ваш профиль:'),
        expect.objectContaining({
          reply_markup: expect.objectContaining({
            inline_keyboard: expect.any(Array)
          })
        })
      )
    })

    it('должен предлагать создать профиль для нового пользователя', async () => {
      const mockContext = createMockContext({
        message: { text: '/profile' },
        from: { id: 999999999 }
      })

      await simulateProfileCommand(mockContext)
      
      expect(mockContext.reply).toHaveBeenCalledWith(
        '❌ Профиль не найден. Создайте его в приложении:',
        expect.objectContaining({
          reply_markup: expect.objectContaining({
            inline_keyboard: expect.arrayContaining([
              expect.arrayContaining([
                expect.objectContaining({
                  text: '👉 Создать профиль'
                })
              ])
            ])
          })
        })
      )
    })
  })

  describe('Команда /help', () => {
    it('должен показывать справку по командам', async () => {
      const mockContext = createMockContext({
        message: { text: '/help' },
        from: { id: 123456789 }
      })

      await simulateHelpCommand(mockContext)
      
      expect(mockContext.reply).toHaveBeenCalledWith(
        expect.stringContaining('🤖 Доступные команды:')
      )
    })
  })

  describe('Webhook обработка', () => {
    it('должен обрабатывать входящие обновления', async () => {
      const update = {
        message: {
          message_id: 1,
          from: { id: 123456789, first_name: 'Test' },
          chat: { id: 123456789, type: 'private' },
          date: Math.floor(Date.now() / 1000),
          text: '/start'
        }
      }

      const response = await simulateWebhookUpdate(update)
      
      expect(response.status).toBe(200)
    })

    it('должен обрабатывать неподдерживаемые команды', async () => {
      const update = {
        message: {
          message_id: 1,
          from: { id: 123456789, first_name: 'Test' },
          chat: { id: 123456789, type: 'private' },
          date: Math.floor(Date.now() / 1000),
          text: '/unknown_command'
        }
      }

      const response = await simulateWebhookUpdate(update)
      
      expect(response.status).toBe(200)
    })
  })
})

// Вспомогательные функции для тестов

function createMockContext(data: any) {
  return {
    message: data.message,
    from: data.from,
    reply: vi.fn(),
    chat: data.chat || { id: data.from?.id }
  }
}

async function simulateStartCommand(ctx: any) {
  const miniAppUrl = process.env.MINI_APP_URL || 'http://localhost:3000'
  await ctx.reply('Добро пожаловать в HR-платформу для общепита! 🍽️\nНажмите кнопку ниже, чтобы открыть приложение:', {
    reply_markup: {
      inline_keyboard: [[{ text: '🚀 Открыть приложение', web_app: { url: miniAppUrl } }]]
    }
  })
}

async function simulateUrgentCommand(ctx: any) {
  const supabase = createTestSupabaseClient()

  const { data: urgentJobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_urgent', true)
    .order('created_at', { ascending: false })
    .limit(5)

  if (!urgentJobs?.length) {
    await ctx.reply('🔍 Сейчас нет срочных вакансий')
    return
  }

  const message = urgentJobs.map(job => `
🚨 ${job.title}
💰 ${job.payment_per_shift}₽ за смену
📍 ${job.district}
⏰ Нужен: ${new Date(job.work_date).toLocaleDateString()}
  `).join('\n')

  await ctx.reply(`Срочные вакансии:\n${message}`, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '👉 Посмотреть все', web_app: { url: `${process.env.MINI_APP_URL}/urgent` } }]]
    }
  })
}

async function simulateJobsCommand(ctx: any) {
  const supabase = createTestSupabaseClient()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_urgent', false)
    .order('created_at', { ascending: false })
    .limit(5)

  if (!jobs?.length) {
    await ctx.reply('🔍 Пока нет доступных вакансий')
    return
  }

  const message = jobs.map(job => `
💼 ${job.title}
💰 ${job.salary_min}-${job.salary_max}₽/мес
📍 ${job.district}
`).join('\n')

  await ctx.reply(`Последние вакансии:\n${message}`, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '👉 Посмотреть все', web_app: { url: `${process.env.MINI_APP_URL}/jobs` } }]]
    }
  })
}

async function simulateReadyCommand(ctx: any) {
  const supabase = createTestSupabaseClient()

  const telegramId = ctx.from?.id.toString()
  if (!telegramId) return

  const { data: profile } = await supabase
    .from('profiles')
    .update({ 
      ready_for_urgent: true,
      urgent_available_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
    .eq('telegram_id', telegramId)
    .select()
    .single()

  if (profile) {
    await ctx.reply('✅ Отлично! Теперь вы будете получать уведомления о срочных вакансиях в течение 24 часов.\n\nЧтобы отключить режим, используйте команду /ready ещё раз.')
  } else {
    await ctx.reply('❌ Сначала нужно создать профиль в приложении')
  }
}

async function simulateProfileCommand(ctx: any) {
  const supabase = createTestSupabaseClient()

  const telegramId = ctx.from?.id.toString()
  if (!telegramId) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('telegram_id', telegramId)
    .single()

  if (profile) {
    const readyStatus = profile.ready_for_urgent ? '✅ Готов к срочным заменам' : '❌ Не готов к срочным заменам'
    const message = `
👤 Ваш профиль:
${profile.first_name} ${profile.last_name}
📱 ${profile.phone}
👨‍🍳 ${profile.specialization}
📍 ${profile.preferred_districts}

${readyStatus}
    `
    await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: [[{ text: '✏️ Редактировать профиль', web_app: { url: `${process.env.MINI_APP_URL}/profile` } }]]
      }
    })
  } else {
    await ctx.reply('❌ Профиль не найден. Создайте его в приложении:',
      {
        reply_markup: {
          inline_keyboard: [[{ text: '👉 Создать профиль', web_app: { url: `${process.env.MINI_APP_URL}/profile` } }]]
        }
      }
    )
  }
}

async function simulateHelpCommand(ctx: any) {
  const helpText = `
🤖 Доступные команды:
/start - открыть приложение
/urgent - показать срочные вакансии
/jobs - показать обычные вакансии
/ready - включить/выключить режим "готов выйти завтра"
/profile - посмотреть/изменить профиль
/help - показать эту справку

❓ Нужна помощь? Напишите нам: @support
  `
  await ctx.reply(helpText)
}

async function simulateWebhookUpdate(update: any): Promise<Response> {
  // Эмуляция webhook обработки
  return new Response('OK', { status: 200 })
}

async function createTestUser(userData: TelegramUserData) {
  const supabase = createTestSupabaseClient()
  
  // Создаем auth пользователя
  const { data: authUser } = await supabase.auth.admin.createUser({
    email: `telegram_${userData.id}@telegram.local`,
    password: `temp_${userData.hash}_${Date.now()}`,
    email_confirm: true,
    user_metadata: {
      telegram_id: userData.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.username,
    },
  })

  if (authUser?.user) {
    // Создаем профиль
    await supabase
      .from('profiles')
      .insert({
        user_id: authUser.user.id,
        telegram_id: userData.id.toString(),
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        photo_url: userData.photo_url,
        user_type: 'candidate',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
  }
}

async function createTestUrgentJob() {
  const supabase = createTestSupabaseClient()
  
  await supabase
    .from('jobs')
    .insert({
      title: 'Срочно нужен повар',
      payment_per_shift: 15000,
      district: 'Алмалинский',
      work_date: new Date().toISOString(),
      is_urgent: true,
      status: 'active'
    })
}

async function createTestRegularJob() {
  const supabase = createTestSupabaseClient()
  
  await supabase
    .from('jobs')
    .insert({
      title: 'Повар в ресторан',
      salary_min: 200000,
      salary_max: 350000,
      district: 'Медеуский',
      is_urgent: false,
      status: 'active'
    })
}
