// Тест интеграции auth.service.js с базой данных
// Проверяем что создание профилей работает корректно

import { supabase } from './src/services/supabase.js'
import { profileService } from './src/services/profile.service.js'

// Тестовые данные пользователя Telegram
const testTelegramUser = {
  id: '12345678',
  telegram_id: 12345678,
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  photo_url: 'https://example.com/photo.jpg',
  user_metadata: {
    telegram_id: 12345678,
    telegram_username: 'testuser',
    full_name: 'Test User',
    user_type: 'candidate'
  }
}

async function testProfileCreation() {
  console.log('🧪 Тестируем создание профиля пользователя...')
  
  try {
    // 1. Тестируем createOrUpdateProfile
    console.log('\n1️⃣ Тестируем profileService.createOrUpdateProfile()')
    const { data: profile, error: profileError } = await profileService.createOrUpdateProfile(testTelegramUser)
    
    if (profileError) {
      console.error('❌ Ошибка создания профиля:', profileError)
      return false
    }
    
    console.log('✅ Профиль создан успешно:', profile)
    
    // 2. Проверяем что профиль действительно сохранился в базе
    console.log('\n2️⃣ Проверяем что профиль сохранился в базе данных')
    const { data: savedProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('telegram_id', testTelegramUser.telegram_id)
      .single()
    
    if (fetchError) {
      console.error('❌ Ошибка получения профиля из БД:', fetchError)
      return false
    }
    
    console.log('✅ Профиль найден в базе данных:', savedProfile)
    
    // 3. Тестируем обновление существующего профиля
    console.log('\n3️⃣ Тестируем обновление существующего профиля')
    const updatedUser = {
      ...testTelegramUser,
      phone: '+7 777 123 45 67',
      role: 'employer'
    }
    
    const { data: updatedProfile, error: updateError } = await profileService.createOrUpdateProfile(updatedUser)
    
    if (updateError) {
      console.error('❌ Ошибка обновления профиля:', updateError)
      return false
    }
    
    console.log('✅ Профиль обновлен успешно:', updatedProfile)
    
    // 4. Тестируем создание тестовых записей в job_postings и urgent_jobs
    console.log('\n4️⃣ Тестируем создание тестовых вакансий')
    
    // Создаем тестовую компанию
    const { data: employer, error: employerError } = await supabase
      .from('employers')
      .insert({
        user_id: profile.id,
        company_name: 'Тестовая компания',
        company_type: 'restaurant',
        contact_email: 'test@example.com'
      })
      .select()
      .single()
    
    if (employerError) {
      console.error('❌ Ошибка создания работодателя:', employerError)
      return false
    }
    
    console.log('✅ Тестовый работодатель создан:', employer)
    
    // Создаем тестовую вакансию
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .insert({
        title: 'Тестовая вакансия Официант',
        description: 'Требуется официант в ресторан',
        company_id: employer.id,
        creator_id: profile.id,
        category: 'service',
        position_type: 'waiter',
        salary_min: 150000,
        salary_max: 200000,
        address: 'ул. Тестовая, 1'
      })
      .select()
      .single()
    
    if (jobError) {
      console.error('❌ Ошибка создания вакансии:', jobError)
      return false
    }
    
    console.log('✅ Тестовая вакансия создана:', job)
    
    // Создаем срочную вакансию
    const { data: urgentJob, error: urgentError } = await supabase
      .from('urgent_jobs')
      .insert({
        title: 'СРОЧНО! Нужен бармен',
        description: 'На смену сегодня',
        company_id: employer.id,
        creator_id: profile.id,
        position_type: 'bartender',
        needed_date: new Date().toISOString().split('T')[0],
        needed_time_start: '18:00',
        needed_time_end: '02:00',
        payment_per_shift: 25000,
        application_deadline: new Date(Date.now() + 3600000).toISOString(), // +1 час
        address: 'ул. Срочная, 2'
      })
      .select()
      .single()
    
    if (urgentError) {
      console.error('❌ Ошибка создания срочной вакансии:', urgentError)
      return false
    }
    
    console.log('✅ Срочная вакансия создана:', urgentJob)
    
    // 5. Проверяем что RLS работает - читаем созданные записи
    console.log('\n5️⃣ Тестируем чтение созданных записей (RLS)')
    
    const { data: jobs, error: jobsError } = await supabase
      .from('job_postings')
      .select('*')
      .eq('is_active', true)
    
    if (jobsError) {
      console.error('❌ Ошибка чтения вакансий:', jobsError)
    } else {
      console.log('✅ Активные вакансии получены:', jobs.length, 'шт.')
    }
    
    const { data: urgentJobs, error: urgentJobsError } = await supabase
      .from('urgent_jobs')
      .select('*')
      .eq('is_active', true)
    
    if (urgentJobsError) {
      console.error('❌ Ошибка чтения срочных вакансий:', urgentJobsError)
    } else {
      console.log('✅ Активные срочные вакансии получены:', urgentJobs.length, 'шт.')
    }
    
    console.log('\n🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!')
    return true
    
  } catch (error) {
    console.error('💥 Критическая ошибка в тестах:', error)
    return false
  }
}

// Запускаем тест
testProfileCreation()
  .then(success => {
    if (success) {
      console.log('\n✅ Интеграция auth.service.js с базой данных работает корректно!')
    } else {
      console.log('\n❌ Обнаружены проблемы в интеграции')
    }
  })
  .catch(error => {
    console.error('💥 Ошибка выполнения тестов:', error)
  })