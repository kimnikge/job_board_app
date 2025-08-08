import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Bot, webhookCallback } from 'https://deno.land/x/grammy@v1.8.3/mod.ts'

// Инициализация бота
const bot = new Bot(Deno.env.get('TELEGRAM_BOT_TOKEN') || '')

// Команда /start
bot.command('start', async (ctx) => {
  const miniAppUrl = Deno.env.get('MINI_APP_URL') || ''
  await ctx.reply('Добро пожаловать в HR-платформу для общепита! 🍽️\nНажмите кнопку ниже, чтобы открыть приложение:', {
    reply_markup: {
      inline_keyboard: [[{ text: '🚀 Открыть приложение', web_app: { url: miniAppUrl } }]]
    }
  })
})

// Команда /urgent - показать срочные вакансии
bot.command('urgent', async (ctx) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  )

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
      inline_keyboard: [[{ text: '👉 Посмотреть все', web_app: { url: `${Deno.env.get('MINI_APP_URL')}/urgent` } }]]
    }
  })
})

// Команда /jobs - показать обычные вакансии
bot.command('jobs', async (ctx) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  )

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
      inline_keyboard: [[{ text: '👉 Посмотреть все', web_app: { url: `${Deno.env.get('MINI_APP_URL')}/jobs` } }]]
    }
  })
})

// Команда /ready - включить режим "готов выйти завтра"
bot.command('ready', async (ctx) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  )

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
})

// Команда /profile - показать профиль
bot.command('profile', async (ctx) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  )

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
        inline_keyboard: [[{ text: '✏️ Редактировать профиль', web_app: { url: `${Deno.env.get('MINI_APP_URL')}/profile` } }]]
      }
    })
  } else {
    await ctx.reply('❌ Профиль не найден. Создайте его в приложении:',
      {
        reply_markup: {
          inline_keyboard: [[{ text: '👉 Создать профиль', web_app: { url: `${Deno.env.get('MINI_APP_URL')}/profile` } }]]
        }
      }
    )
  }
})

// Команда /help
bot.command('help', async (ctx) => {
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
})

// Создаем webhook handler
const handleUpdate = webhookCallback(bot, 'std/http')

// Обрабатываем входящие обновления
serve(async (req) => {
  if (req.method === 'POST') {
    try {
      return await handleUpdate(req)
    } catch (err) {
      console.error(err)
      return new Response('Error processing update', { status: 500 })
    }
  }
  return new Response('Expected POST request', { status: 400 })
})
