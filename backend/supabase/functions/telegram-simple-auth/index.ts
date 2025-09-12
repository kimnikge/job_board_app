import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

Deno.serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { id, first_name, last_name, username, photo_url } = await req.json()

    // Проверяем только обязательное - ID пользователя
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'User ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const telegramId = id.toString()
    console.log('👤 Processing user:', telegramId, first_name, username)

    // Ищем пользователя
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('user_id, id')
      .eq('telegram_id', telegramId)
      .single()

    let userId: string

    if (existingUser) {
      // Пользователь существует - обновляем данные
      userId = existingUser.user_id || existingUser.id
      
      await supabase
        .from('user_profiles')
        .update({
          full_name: first_name + (last_name ? ' ' + last_name : ''),
          telegram_username: username,
          telegram_photo_url: photo_url,
          updated_at: new Date().toISOString(),
        })
        .eq('telegram_id', telegramId)

    } else {
      // Создаем нового пользователя
      const email = `telegram_${id}@app.local`
      
      const { data: authUser } = await supabase.auth.admin.createUser({
        email,
        password: `temp_${Date.now()}`,
        email_confirm: true,
        user_metadata: {
          telegram_id: id,
          first_name,
          last_name,
          username,
        },
      })

      if (!authUser?.user?.id) {
        throw new Error('Failed to create user')
      }

      userId = authUser.user.id

      // Создаем профиль
      await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          telegram_id: telegramId,
          full_name: first_name + (last_name ? ' ' + last_name : ''),
          telegram_username: username,
          telegram_photo_url: photo_url,
          user_type: 'candidate',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
    }

    // Создаем сессию
    const { data: sessionData } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: `telegram_${id}@app.local`
    })

    console.log('✅ User authenticated:', userId)

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        redirect_url: sessionData.properties?.action_link,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Auth error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Authentication failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
