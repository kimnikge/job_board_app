// telegramNotify.js — сервис для отправки уведомлений через Supabase Edge Function

const TELEGRAM_FUNCTION_URL = 'https://kuyudpxqlrinkcxvorom.functions.supabase.co/send-telegram-message';
const SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

export async function sendTelegramNotification(chat_id, text) {
  try {
    const res = await fetch(TELEGRAM_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SERVICE_ROLE_KEY
      },
      body: JSON.stringify({ chat_id, text })
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('❌ Telegram API error:', error);
      throw new Error(error);
    }

    const result = await res.text();
    return result;
  } catch (error) {
    console.error('💥 Telegram notification failed:', error);
    throw error;
  }
}
