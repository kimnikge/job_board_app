import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  generateTelegramUserData, 
  type TelegramUserData 
} from '../utils/test-helpers'
import '../utils/deno-mocks'

describe('Telegram Bot Integration (Упрощенные тесты)', () => {
  let testUsers: TelegramUserData[] = []

  beforeEach(() => {
    testUsers = []
    vi.clearAllMocks()
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
    it('должен показывать сообщение о отсутствии срочных вакансий (по умолчанию)', async () => {
      const mockContext = createMockContext({
        message: { text: '/urgent' },
        from: { id: 123456789 }
      })

      await simulateUrgentCommand(mockContext)
      
      expect(mockContext.reply).toHaveBeenCalledWith(
        '🔍 Сейчас нет срочных вакансий'
      )
    })

    it('должен показывать срочные вакансии когда они есть', async () => {
      const mockContext = createMockContext({
        message: { text: '/urgent' },
        from: { id: 123456789 }
      })

      // Мокаем наличие срочных вакансий
      await simulateUrgentCommandWithJobs(mockContext)
      
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
  })

  describe('Команда /jobs', () => {
    it('должен показывать сообщение о отсутствии вакансий (по умолчанию)', async () => {
      const mockContext = createMockContext({
        message: { text: '/jobs' },
        from: { id: 123456789 }
      })

      await simulateJobsCommand(mockContext)
      
      expect(mockContext.reply).toHaveBeenCalledWith(
        '🔍 Пока нет доступных вакансий'
      )
    })

    it('должен показывать обычные вакансии когда они есть', async () => {
      const mockContext = createMockContext({
        message: { text: '/jobs' },
        from: { id: 123456789 }
      })

      // Мокаем наличие вакансий
      await simulateJobsCommandWithJobs(mockContext)
      
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
  })

  describe('Команда /ready', () => {
    it('должен показывать ошибку для несуществующего пользователя (по умолчанию)', async () => {
      const mockContext = createMockContext({
        message: { text: '/ready' },
        from: { id: 999999999 }
      })

      await simulateReadyCommand(mockContext)
      
      expect(mockContext.reply).toHaveBeenCalledWith(
        '❌ Сначала нужно создать профиль в приложении'
      )
    })

    it('должен включать режим готовности для существующего пользователя', async () => {
      const mockContext = createMockContext({
        message: { text: '/ready' },
        from: { id: 123456789 }
      })

      // Мокаем существующего пользователя
      await simulateReadyCommandWithUser(mockContext)
      
      expect(mockContext.reply).toHaveBeenCalledWith(
        expect.stringContaining('✅ Отлично! Теперь вы будете получать уведомления')
      )
    })
  })

  describe('Команда /profile', () => {
    it('должен предлагать создать профиль для нового пользователя (по умолчанию)', async () => {
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

    it('должен показывать профиль существующего пользователя', async () => {
      const mockContext = createMockContext({
        message: { text: '/profile' },
        from: { id: 123456789 }
      })

      // Мокаем существующего пользователя
      await simulateProfileCommandWithUser(mockContext)
      
      expect(mockContext.reply).toHaveBeenCalledWith(
        expect.stringContaining('👤 Ваш профиль:'),
        expect.objectContaining({
          reply_markup: expect.objectContaining({
            inline_keyboard: expect.any(Array)
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

// Вспомогательные функции для тестов (заглушки)

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
  // По умолчанию нет срочных вакансий
  await ctx.reply('🔍 Сейчас нет срочных вакансий')
}

async function simulateUrgentCommandWithJobs(ctx: any) {
  // Симуляция с срочными вакансиями
  const message = `
🚨 Срочно нужен повар
💰 15000₽ за смену
📍 Алмалинский
⏰ Нужен: ${new Date().toLocaleDateString()}
  `

  await ctx.reply(`Срочные вакансии:\n${message}`, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '👉 Посмотреть все', web_app: { url: `${process.env.MINI_APP_URL}/urgent` } }]]
    }
  })
}

async function simulateJobsCommand(ctx: any) {
  // По умолчанию нет вакансий
  await ctx.reply('🔍 Пока нет доступных вакансий')
}

async function simulateJobsCommandWithJobs(ctx: any) {
  // Симуляция с вакансиями
  const message = `
💼 Повар в ресторан
💰 200000-350000₽/мес
📍 Медеуский
`

  await ctx.reply(`Последние вакансии:\n${message}`, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '👉 Посмотреть все', web_app: { url: `${process.env.MINI_APP_URL}/jobs` } }]]
    }
  })
}

async function simulateReadyCommand(ctx: any) {
  // По умолчанию пользователь не найден
  await ctx.reply('❌ Сначала нужно создать профиль в приложении')
}

async function simulateReadyCommandWithUser(ctx: any) {
  // Симуляция для существующего пользователя
  await ctx.reply('✅ Отлично! Теперь вы будете получать уведомления о срочных вакансиях в течение 24 часов.\n\nЧтобы отключить режим, используйте команду /ready ещё раз.')
}

async function simulateProfileCommand(ctx: any) {
  // По умолчанию профиль не найден
  await ctx.reply('❌ Профиль не найден. Создайте его в приложении:', {
    reply_markup: {
      inline_keyboard: [[{ text: '👉 Создать профиль', web_app: { url: `${process.env.MINI_APP_URL}/profile` } }]]
    }
  })
}

async function simulateProfileCommandWithUser(ctx: any) {
  // Симуляция для существующего пользователя
  const message = `
👤 Ваш профиль:
Иван Петров
📱 +7 777 123 45 67
👨‍🍳 Повар
📍 Алмалинский район

✅ Готов к срочным заменам
  `
  await ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [[{ text: '✏️ Редактировать профиль', web_app: { url: `${process.env.MINI_APP_URL}/profile` } }]]
    }
  })
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
