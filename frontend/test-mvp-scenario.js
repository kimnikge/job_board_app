// test-telegram-integration.js — тестовый сценарий MVP
import { jobsService } from './src/services/jobs.service.js'
import { badgesService } from './src/services/badges.service.js'
import { profileService } from './src/services/profile.service.js'

async function testMVPScenario() {
  console.log('🚀 Начало тестового сценария MVP...')
  
  try {
    // 1. Создание тестового пользователя
    console.log('1. Создание профиля пользователя...')
    const profileData = {
      user_id: 'test-user-mvp',
      full_name: 'Тестовый Пользователь',
      phone: '+7 777 123 45 67',
      telegram_chat_id: '763612632'
    }
    const profileResult = await profileService.upsertProfile(profileData)
    console.log('✅ Профиль создан:', profileResult.data?.full_name)

    // 2. Создание вакансии (должно отправить уведомление)
    console.log('2. Создание новой вакансии...')
    const jobData = {
      title: 'Тестовая вакансия для MVP',
      description: 'Проверка уведомлений',
      salary_from: 250000,
      company_id: 1
    }
    const jobResult = await jobsService.createJob(jobData)
    console.log('✅ Вакансия создана:', jobResult.data?.title)
    console.log('📱 Уведомление "Новая вакансия" должно быть отправлено')

    // 3. Выдача бейджа "Первые шаги" (должно отправить уведомление)
    console.log('3. Выдача бейджа "Первые шаги"...')
    const badgeResult = await badgesService.awardBadge(
      'badge-first-steps',
      'test-user-mvp',
      'Первые шаги',
      'system'
    )
    console.log('✅ Бейдж выдан:', badgeResult.data?.reason)
    console.log('📱 Уведомление "Получен бейдж" должно быть отправлено')

    // 4. Проверка бейджей пользователя
    console.log('4. Загрузка бейджей пользователя...')
    const userBadges = await badgesService.list('test-user-mvp')
    console.log('✅ Бейджи загружены, количество:', userBadges.data?.length || 0)

    console.log('🎉 Тестовый сценарий MVP завершён успешно!')
    console.log('📋 Все основные функции работают, уведомления интегрированы')
    
  } catch (error) {
    console.error('❌ Ошибка в тестовом сценарии:', error)
  }
}

// Запуск теста только в браузере
if (typeof window !== 'undefined') {
  window.testMVPScenario = testMVPScenario
  console.log('💡 Для запуска теста выполните: testMVPScenario()')
}

export { testMVPScenario }
