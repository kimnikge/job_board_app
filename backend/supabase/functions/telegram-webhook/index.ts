import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Простая webhook функция для Telegram
serve(async (req) => {
  console.log('Telegram webhook received:', req.method)

  if (req.method === 'POST') {
    try {
      const update = await req.json()
      console.log('Update received:', JSON.stringify(update, null, 2))

      // Отправляем ответ Telegram, что все OK
      return new Response('OK', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    } catch (err) {
      console.error('Error processing webhook:', err)
      return new Response('Error', { status: 500 })
    }
  }

  return new Response('Method not allowed', { status: 405 })
})
