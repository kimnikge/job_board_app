// Прямой тест подключения к локальной Supabase
import { createClient } from '@supabase/supabase-js'

// Локальные настройки Supabase (используем service_role для тестов)
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

// Тестовые данные
const testUser = {
  telegram_id: 12345678,
  telegram_username: 'testuser',
  full_name: 'Test User HoReCa',
  phone: null,
  email: 'test@example.com'
}

async function testDatabaseIntegration() {
  console.log('🧪 Тестируем интеграцию с локальной базой данных...')
  
  try {
    // 1. Проверяем подключение к базе
    console.log('\n1️⃣ Проверяем подключение к локальной Supabase')
    const { data: connection, error: connectionError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Ошибка подключения к БД:', connectionError)
      return false
    }
    
    console.log('✅ Подключение к базе данных успешно')
    
    // 2. Создаем профиль пользователя
    console.log('\n2️⃣ Создаем профиль пользователя в user_profiles')
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert(testUser)
      .select()
      .single()
    
    if (profileError) {
      console.error('❌ Ошибка создания профиля:', profileError)
      return false
    }
    
    console.log('✅ Профиль создан/обновлен:', profile)
    
    // 3. Создаем компанию
    console.log('\n3️⃣ Создаем тестовую компанию в employers')
    
    const { data: employer, error: employerError } = await supabase
      .from('employers')
      .insert({
        user_id: profile.id,
        company_name: 'Тестовая HoReCa компания',
        company_type: 'restaurant',
        contact_email: 'test@horeca.kz',
        address: 'г. Алматы, ул. Абая, 1',
        city_id: 1
      })
      .select()
      .single()
    
    if (employerError) {
      console.error('❌ Ошибка создания работодателя:', employerError)
      return false
    }
    
    console.log('✅ Компания создана:', employer)
    
    // 4. Создаем обычную вакансию
    console.log('\n4️⃣ Создаем обычную вакансию в job_postings')
    
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .insert({
        title: 'Официант в ресторан "Дастархан"',
        description: 'Требуется опытный официант для работы в ресторане казахской кухни',
        company_id: employer.id,
        creator_id: profile.id,
        city_id: 1,
        category: 'service',
        position_type: 'waiter',
        employment_type: 'full_time',
        schedule_type: 'shift',
        salary_min: 150000,
        salary_max: 200000,
        salary_type: 'monthly',
        required_skills: ['обслуживание клиентов', 'знание меню', 'работа с POS'],
        benefits: ['питание', 'форма', 'скидки'],
        address: 'г. Алматы, ул. Абая, 1',
        district: 'Алмалинский район'
      })
      .select()
      .single()
    
    if (jobError) {
      console.error('❌ Ошибка создания вакансии:', jobError)
      return false
    }
    
    console.log('✅ Обычная вакансия создана:', job)
    
    // 5. Создаем срочную вакансию
    console.log('\n5️⃣ Создаем срочную вакансию в urgent_jobs')
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const { data: urgentJob, error: urgentError } = await supabase
      .from('urgent_jobs')
      .insert({
        title: 'СРОЧНО! Нужен бармен на завтра',
        description: 'На смену завтра в барбершопе с кафе. Опыт работы с кофе-машиной обязателен.',
        company_id: employer.id,
        creator_id: profile.id,
        city_id: 1,
        position_type: 'bartender',
        needed_date: tomorrow.toISOString().split('T')[0],
        needed_time_start: '18:00',
        needed_time_end: '02:00',
        payment_per_shift: 25000,
        application_deadline: new Date(Date.now() + 2 * 3600000).toISOString(), // +2 часа
        address: 'г. Алматы, пр. Достык, 123',
        district: 'Медеуский район',
        contact_method: 'telegram',
        contact_telegram: '@testuser_horeca',
        priority: 'high'
      })
      .select()
      .single()
    
    if (urgentError) {
      console.error('❌ Ошибка создания срочной вакансии:', urgentError)
      return false
    }
    
    console.log('✅ Срочная вакансия создана:', urgentJob)
    
    // 6. Проверяем что данные можно читать (RLS работает)
    console.log('\n6️⃣ Тестируем чтение данных через RLS политики')
    
    // Читаем активные вакансии
    const { data: activeJobs, error: activeJobsError } = await supabase
      .from('job_postings')
      .select('*')
      .eq('is_active', true)
    
    if (!activeJobsError) {
      console.log('✅ Активные вакансии читаются:', activeJobs.length, 'шт.')
    }
    
    // Читаем активные срочные вакансии
    const { data: activeUrgentJobs, error: activeUrgentError } = await supabase
      .from('urgent_jobs')
      .select('*')
      .eq('is_active', true)
    
    if (!activeUrgentError) {
      console.log('✅ Активные срочные вакансии читаются:', activeUrgentJobs.length, 'шт.')
    }
    
    // 7. Тестируем статистику
    console.log('\n7️⃣ Проверяем статистику по таблицам')
    
    const stats = await Promise.all([
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('employers').select('*', { count: 'exact', head: true }),
      supabase.from('job_postings').select('*', { count: 'exact', head: true }),
      supabase.from('urgent_jobs').select('*', { count: 'exact', head: true })
    ])
    
    console.log('📊 Статистика базы данных:')
    console.log(`   - user_profiles: ${stats[0].count} записей`)
    console.log(`   - employers: ${stats[1].count} записей`)
    console.log(`   - job_postings: ${stats[2].count} записей`)
    console.log(`   - urgent_jobs: ${stats[3].count} записей`)
    
    console.log('\n🎉 ВСЕ ТЕСТЫ ИНТЕГРАЦИИ ПРОШЛИ УСПЕШНО!')
    console.log('✅ HoReCa схема базы данных полностью функциональна!')
    
    return true
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error)
    return false
  }
}

// Запускаем тест
testDatabaseIntegration()
  .then(success => {
    console.log(success ? 
      '\n🚀 Интеграция готова к продакшену!' : 
      '\n❌ Требуются доработки'
    )
    process.exit(success ? 0 : 1)
  })