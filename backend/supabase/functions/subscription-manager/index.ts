import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Обработка CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { method } = req;
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (method) {
      case 'GET':
        return await handleGetRequest(supabase, req, action!);
      case 'POST':
        const body = await req.json();
        return await handlePostRequest(supabase, req, action!, body);
      default:
        throw new Error(`Method ${method} not allowed`);
    }

  } catch (error) {
    console.error('Error in subscription-manager function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleGetRequest(supabase: any, req: Request, action: string) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    throw new Error('Invalid token');
  }

  switch (action) {
    case 'check-subscription':
      return await checkCompanySubscription(supabase, req.url);
    case 'usage-stats':
      return await getUsageStats(supabase, req.url);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function handlePostRequest(supabase: any, req: Request, action: string, body: any) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    throw new Error('Invalid token');
  }

  switch (action) {
    case 'assign-free-plan':
      return await assignFreePlan(supabase, body);
    case 'check-limits':
      return await checkUsageLimits(supabase, body);
    case 'log-usage':
      return await logUsage(supabase, body, user);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

// Автоматическое назначение Free плана новым компаниям
async function assignFreePlan(supabase: any, { company_id }: { company_id: string }) {
  try {
    // Проверяем, есть ли уже подписка
    const { data: existingSubscription } = await supabase
      .from('company_subscriptions')
      .select('id')
      .eq('company_id', company_id)
      .single();

    if (existingSubscription) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Subscription already exists',
          subscription_id: existingSubscription.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Получаем Free план
    const { data: freePlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('name', 'free')
      .single();

    if (planError) {
      console.error('Error getting free plan:', planError);
      throw new Error('Free plan not found');
    }

    // Создаем подписку
    const { data: subscription, error: subscriptionError } = await supabase
      .from('company_subscriptions')
      .insert({
        company_id,
        plan_id: freePlan.id,
        status: 'active',
        activated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      throw subscriptionError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Free plan assigned successfully',
        subscription 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in assignFreePlan:', error);
    throw error;
  }
}

// Проверка подписки компании
async function checkCompanySubscription(supabase: any, url: string) {
  const urlObj = new URL(url);
  const company_id = urlObj.searchParams.get('company_id');
  
  if (!company_id) {
    throw new Error('company_id parameter is required');
  }

  const { data, error } = await supabase
    .from('company_subscriptions')
    .select(`
      *,
      subscription_plans:plan_id(*)
    `)
    .eq('company_id', company_id)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    throw error;
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      subscription: data || null,
      has_active_subscription: !!data
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Проверка лимитов использования (пока все безлимитно)
async function checkUsageLimits(supabase: any, { company_id, action_type }: { company_id: string, action_type: string }) {
  // Получаем подписку компании
  const { data: subscription } = await supabase
    .from('company_subscriptions')
    .select(`
      *,
      subscription_plans:plan_id(*)
    `)
    .eq('company_id', company_id)
    .eq('status', 'active')
    .single();

  if (!subscription) {
    // Если нет подписки, автоматически назначаем Free
    await assignFreePlan(supabase, { company_id });
    
    return new Response(
      JSON.stringify({ 
        success: true,
        allowed: true,
        limit: 999999,
        used: 0,
        message: 'Free plan auto-assigned'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Пока все действия разрешены (freemium период)
  const limits = {
    job_post: subscription.subscription_plans.max_job_postings || 999999,
    urgent_post: subscription.subscription_plans.max_urgent_postings || 999999,
    badge_create: subscription.subscription_plans.custom_badges ? 999999 : 0
  };

  // Получаем текущее использование
  const { count: currentUsage } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company_id)
    .eq('action_type', action_type)
    .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()); // За последний месяц

  const limit = limits[action_type as keyof typeof limits] || 999999;
  const used = currentUsage || 0;
  const allowed = used < limit;

  return new Response(
    JSON.stringify({ 
      success: true,
      allowed,
      limit,
      used,
      remaining: limit - used
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Логирование использования функций
async function logUsage(supabase: any, { company_id, action_type, resource_id }: { company_id: string, action_type: string, resource_id?: string }, user: any) {
  const { data, error } = await supabase
    .from('usage_logs')
    .insert({
      company_id,
      action_type,
      resource_id: resource_id || null,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error logging usage:', error);
    throw error;
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Usage logged successfully',
      log: data
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Получение статистики использования
async function getUsageStats(supabase: any, url: string) {
  const urlObj = new URL(url);
  const company_id = urlObj.searchParams.get('company_id');
  
  if (!company_id) {
    throw new Error('company_id parameter is required');
  }

  // Статистика за последние 30 дней
  const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();

  const { data, error } = await supabase
    .from('usage_logs')
    .select('action_type, created_at')
    .eq('company_id', company_id)
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  // Группируем по типам действий
  const stats = data.reduce((acc: any, log: any) => {
    acc[log.action_type] = (acc[log.action_type] || 0) + 1;
    return acc;
  }, {});

  return new Response(
    JSON.stringify({ 
      success: true, 
      stats,
      period: '30 days',
      total_actions: data.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
