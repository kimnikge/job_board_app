// Supabase Edge Function: send-telegram-message
// Отправляет push-уведомление пользователю через Telegram Bot API

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

serve(async (req) => {
  const { chat_id, text } = await req.json();
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

  if (!botToken) {
    return new Response('TELEGRAM_BOT_TOKEN is not set', { status: 500 });
  }
  if (!chat_id || !text) {
    return new Response('chat_id and text are required', { status: 400 });
  }

  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const payload = {
    chat_id,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };

  const tgRes = await fetch(telegramUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!tgRes.ok) {
    const error = await tgRes.text();
    return new Response(`Telegram API error: ${error}`, { status: 500 });
  }

  return new Response('Message sent', { status: 200 });
});
