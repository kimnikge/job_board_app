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
    
    // Проверяем авторизацию и роль админа
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    // Проверяем роль админа (упрощенная проверка)
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('telegram_id', user.user_metadata?.telegram_id)
      .single();

    if (userProfile?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const { method } = req;
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (method) {
      case 'GET':
        return await handleGetRequest(supabase, action!);
      case 'POST':
        const body = await req.json();
        return await handlePostRequest(supabase, action!, body);
      default:
        throw new Error(`Method ${method} not allowed`);
    }

  } catch (error) {
    console.error('Error in monetization-admin function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleGetRequest(supabase: any, action: string) {
  switch (action) {
    case 'settings':
      return await getMonetizationSettings(supabase);
    case 'pricing-plans':
      return await getPricingPlans(supabase);
    case 'subscriptions':
      return await getSubscriptionsOverview(supabase);
    case 'stats':
      return await getMonetizationStats(supabase);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function handlePostRequest(supabase: any, action: string, body: any) {
  switch (action) {
    case 'toggle-payments':
      return await togglePaymentSystem(supabase, body);
    case 'update-pricing':
      return await updatePricingPlan(supabase, body);
    case 'update-settings':
      return await updateMonetizationSettings(supabase, body);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

// Получить все настройки монетизации
async function getMonetizationSettings(supabase: any) {
  const { data, error } = await supabase
    .from('monetization_settings')
    .select('*')
    .order('key');

  if (error) throw error;

  // Преобразуем в удобный формат
  const settings = data.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  return new Response(
    JSON.stringify({ success: true, settings }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Получить тарифные планы по городам
async function getPricingPlans(supabase: any) {
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .order('city_name');

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, plans: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Получить обзор подписок
async function getSubscriptionsOverview(supabase: any) {
  const { data, error } = await supabase
    .from('company_subscriptions')
    .select(`
      *,
      companies:company_id(name, city)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, subscriptions: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Получить статистику монетизации
async function getMonetizationStats(supabase: any) {
  // Статистика подписок
  const { data: subscriptionStats } = await supabase
    .from('company_subscriptions')
    .select('subscription_type, status')
    .eq('status', 'active');

  // Статистика по городам
  const { data: cityStats } = await supabase
    .from('pricing_plans')
    .select('city_name, is_active');

  // Статистика платежей (пока будет пустая)
  const { data: paymentStats } = await supabase
    .from('payment_transactions')
    .select('status, amount, currency')
    .eq('status', 'completed');

  const stats = {
    totalActiveSubscriptions: subscriptionStats?.length || 0,
    subscriptionsByType: subscriptionStats?.reduce((acc: any, sub: any) => {
      acc[sub.subscription_type] = (acc[sub.subscription_type] || 0) + 1;
      return acc;
    }, {}) || {},
    citiesConfigured: cityStats?.length || 0,
    activeCities: cityStats?.filter((city: any) => city.is_active).length || 0,
    totalRevenue: paymentStats?.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount), 0) || 0,
    paymentsCompleted: paymentStats?.length || 0
  };

  return new Response(
    JSON.stringify({ success: true, stats }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Включить/выключить систему оплаты
async function togglePaymentSystem(supabase: any, body: any) {
  const { enabled } = body;

  const { error } = await supabase
    .from('monetization_settings')
    .update({ 
      value: enabled,
      updated_at: new Date().toISOString()
    })
    .eq('key', 'payment_system_enabled');

  if (error) throw error;

  // Логируем изменение
  await supabase
    .from('simple_logs')
    .insert({
      message: `Payment system ${enabled ? 'enabled' : 'disabled'}`,
      details: { enabled, changed_at: new Date().toISOString() }
    });

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Payment system ${enabled ? 'enabled' : 'disabled'}` 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Обновить тарифный план для города
async function updatePricingPlan(supabase: any, body: any) {
  const { 
    city_name, 
    regular_job_price, 
    urgent_job_price, 
    featured_job_price, 
    top_placement_price,
    is_active 
  } = body;

  const { error } = await supabase
    .from('pricing_plans')
    .update({
      regular_job_price: parseFloat(regular_job_price),
      urgent_job_price: parseFloat(urgent_job_price),
      featured_job_price: parseFloat(featured_job_price),
      top_placement_price: parseFloat(top_placement_price),
      is_active,
      updated_at: new Date().toISOString()
    })
    .eq('city_name', city_name);

  if (error) throw error;

  // Логируем изменение
  await supabase
    .from('simple_logs')
    .insert({
      message: `Pricing plan updated for ${city_name}`,
      details: { city_name, regular_job_price, urgent_job_price, is_active }
    });

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Pricing plan updated for ${city_name}` 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Обновить настройки монетизации
async function updateMonetizationSettings(supabase: any, body: any) {
  const { settings } = body;

  for (const [key, value] of Object.entries(settings)) {
    await supabase
      .from('monetization_settings')
      .update({ 
        value,
        updated_at: new Date().toISOString()
      })
      .eq('key', key);
  }

  // Логируем изменение
  await supabase
    .from('simple_logs')
    .insert({
      message: 'Monetization settings updated',
      details: settings
    });

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Settings updated successfully' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
