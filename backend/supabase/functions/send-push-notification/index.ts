/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { webpush } from "https://esm.sh/web-push@3.6.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Настройка VAPID ключей
const vapidKeys = {
  subject: 'mailto:admin@shiftworkkz.kz',
  publicKey: Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
  privateKey: Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
}

// Проверяем наличие VAPID ключей
if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  console.error('VAPID keys not configured!')
}

// Настраиваем web-push
webpush.setVapidDetails(
  vapidKeys.subject,
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { title, body, userId, type, data, targetUsers } = await req.json()

    if (!title || !body) {
      throw new Error('Title and body are required')
    }

    // Получаем подписки пользователей
    let query = supabaseClient
      .from('push_subscriptions')
      .select('user_id, subscription')

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (targetUsers && Array.isArray(targetUsers)) {
      query = query.in('user_id', targetUsers)
    }

    const { data: subscriptions, error } = await query

    if (error) {
      throw error
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No subscriptions found',
          sent: 0,
          total: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    console.log(`Found ${subscriptions.length} subscriptions to send to`)

    // Отправляем уведомления всем подпискам
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const subscription = sub.subscription

          // Проверяем структуру подписки
          if (!subscription || !subscription.endpoint || !subscription.keys) {
            console.error('Invalid subscription structure:', subscription)
            return { success: false, userId: sub.user_id, error: 'Invalid subscription' }
          }

          // Проверяем наличие необходимых ключей
          if (!subscription.keys.p256dh || !subscription.keys.auth) {
            console.error('Missing encryption keys in subscription:', subscription)
            return { success: false, userId: sub.user_id, error: 'Missing encryption keys' }
          }

          const payload = JSON.stringify({
            title,
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            url: data?.url || '/',
            type: type || 'notification',
            timestamp: new Date().toISOString(),
            userId: sub.user_id,
            data: data || {}
          })

          // Отправляем уведомление через web-push
          const result = await webpush.sendNotification(subscription, payload, {
            TTL: 86400, // 24 часа
            urgency: 'normal',
            topic: `notification-${type || 'general'}`
          })

          console.log(`Push sent successfully to user ${sub.user_id}`)
          return { success: true, userId: sub.user_id, result }

        } catch (error) {
          console.error(`Error sending push to user ${sub.user_id}:`, error)

          // Если подписка недействительна, удаляем её из базы
          if (error.statusCode === 410 || error.statusCode === 400) {
            try {
              await supabaseClient
                .from('push_subscriptions')
                .delete()
                .eq('user_id', sub.user_id)
              console.log(`Removed invalid subscription for user ${sub.user_id}`)
            } catch (deleteError) {
              console.error('Error removing invalid subscription:', deleteError)
            }
          }

          return {
            success: false,
            userId: sub.user_id,
            error: error.message,
            statusCode: error.statusCode
          }
        }
      })
    )

    const successful = results.filter(result =>
      result.status === 'fulfilled' && result.value.success
    ).length

    const failed = results.filter(result =>
      result.status === 'fulfilled' && !result.value.success
    ).length

    const errors = results
      .filter(result => result.status === 'fulfilled' && !result.value.success)
      .map(result => result.value)

    console.log(`Push notification results: ${successful} successful, ${failed} failed`)

    return new Response(
      JSON.stringify({
        success: successful > 0,
        sent: successful,
        failed: failed,
        total: subscriptions.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in send-push-notification function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        sent: 0,
        total: 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
