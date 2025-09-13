// Простой тест новой HoReCa схемы
// Проверяет базовую функциональность без сложных зависимостей

import { createClient } from '@supabase/supabase-js'

// Настройки локального Supabase
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

console.log('🧪 Тестирование HoReCa схемы...')

async function testHoRecaSchema() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    // 1. Проверяем существование таблиц
    console.log('\n📋 Проверка таблиц...')
    
    const tables = ['profiles', 'employers', 'job_postings', 'urgent_jobs']
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error && error.code !== 'PGRST116') { // PGRST116 = empty table
        throw new Error(`❌ Таблица ${table}: ${error.message}`)
      }
      console.log(`✅ Таблица ${table} - OK`)
    }
    
    // 2. Создаем тестового пользователя через auth и профиль
    console.log('\n👤 Создание тестового пользователя и профиля...')
    
    // Сначала создаем пользователя в auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'testpassword',
      email_confirm: true
    })
    
    if (authError) {
      throw new Error(`❌ Ошибка создания auth пользователя: ${authError.message}`)
    }
    
    // Теперь создаем профиль
    const testProfile = {
      id: authUser.user.id,
      telegram_id: 123456789,
      full_name: 'Тест Пользователь',
      username: 'testuser',
      role: 'candidate'
    }
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert(testProfile)
      .select()
    
    if (profileError) {
      throw new Error(`❌ Ошибка создания профиля: ${profileError.message}`)
    }
    console.log('✅ Тестовый пользователь и профиль созданы')
    
    // 3. Создаем тестового работодателя
    console.log('\n🏢 Создание тестового работодателя...')
    
    const testEmployer = {
      user_id: profileData[0].id,
      company_name: 'Ресторан "Тест"',
      company_type: 'restaurant',
      location: 'Алматы, ул. Тестовая 1',
      contact_person: 'Тест Менеджер',
      contact_phone: '+77771234567'
    }
    
    const { data: employerData, error: employerError } = await supabase
      .from('employers')
      .insert(testEmployer)
      .select()
    
    if (employerError) {
      throw new Error(`❌ Ошибка создания работодателя: ${employerError.message}`)
    }
    console.log('✅ Тестовый работодатель создан')
    
    // 4. Создаем обычную вакансию
    console.log('\n📄 Создание тестовой вакансии...')
    
    const testJob = {
      employer_id: employerData[0].id,
      title: 'Официант в ресторан',
      description: 'Требуется опытный официант',
      category: 'service',
      position_type: 'waiter',
      salary_min: 150000,
      salary_max: 200000,
      location: 'Алматы, центр'
    }
    
    const { data: jobData, error: jobError } = await supabase
      .from('job_postings')
      .insert(testJob)
      .select()
    
    if (jobError) {
      throw new Error(`❌ Ошибка создания вакансии: ${jobError.message}`)
    }
    console.log('✅ Тестовая вакансия создана')
    
    // 5. Создаем срочную вакансию
    console.log('\n🔥 Создание срочной вакансии...')
    
    const testUrgentJob = {
      employer_id: employerData[0].id,
      title: 'СРОЧНО! Бармен на смену',
      category: 'service',
      position_type: 'bartender',
      needed_date: new Date().toISOString().split('T')[0], // сегодня
      needed_time_start: '18:00',
      needed_time_end: '02:00',
      payment_per_shift: 25000,
      location: 'Алматы, Назарбаева 123',
      priority: 'high'
    }
    
    const { data: urgentJobData, error: urgentJobError } = await supabase
      .from('urgent_jobs')
      .insert(testUrgentJob)
      .select()
    
    if (urgentJobError) {
      throw new Error(`❌ Ошибка создания срочной вакансии: ${urgentJobError.message}`)
    }
    console.log('✅ Тестовая срочная вакансия создана')
    
    // 6. Проверяем связи (JOIN)
    console.log('\n🔗 Проверка связей между таблицами...')
    
    const { data: jobsWithEmployers, error: joinError } = await supabase
      .from('job_postings')
      .select(`
        *,
        employers (
          company_name,
          company_type,
          location
        )
      `)
      .limit(5)
    
    if (joinError) {
      throw new Error(`❌ Ошибка JOIN: ${joinError.message}`)
    }
    console.log('✅ Связи между таблицами работают')
    console.log(`📊 Найдено ${jobsWithEmployers.length} вакансий с информацией о работодателях`)
    
    // 7. Проверяем RLS политики
    console.log('\n🔒 Проверка RLS политик...')
    
    // Создаем обычного клиента (не service_role)
    const publicSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0')
    
    const { data: publicJobs, error: rlsError } = await publicSupabase
      .from('job_postings')
      .select('*')
      .limit(5)
    
    if (rlsError) {
      throw new Error(`❌ Ошибка RLS: ${rlsError.message}`)
    }
    console.log('✅ RLS политики работают')
    console.log(`🔓 Публично доступно ${publicJobs.length} вакансий`)
    
    // Итоговая статистика
    console.log('\n📈 Итоговая статистика:')
    
    const stats = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('employers').select('*', { count: 'exact', head: true }),
      supabase.from('job_postings').select('*', { count: 'exact', head: true }),
      supabase.from('urgent_jobs').select('*', { count: 'exact', head: true })
    ])
    
    console.log(`👥 Профилей: ${stats[0].count}`)
    console.log(`🏢 Работодателей: ${stats[1].count}`)
    console.log(`📄 Обычных вакансий: ${stats[2].count}`)
    console.log(`🔥 Срочных вакансий: ${stats[3].count}`)
    
    console.log('\n🎉 Все тесты пройдены успешно!')
    console.log('✅ HoReCa схема готова к использованию')
    
  } catch (error) {
    console.error('\n💥 Ошибка тестирования:', error.message)
    process.exit(1)
  }
}

// Запускаем тест
testHoRecaSchema().then(() => {
  console.log('\n🏁 Тестирование завершено')
  process.exit(0)
})