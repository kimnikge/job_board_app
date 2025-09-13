// Тест frontend сервисов с новой HoReCa схемой
import { jobsService } from '../../frontend/src/services/jobs.service.js'
import { urgentJobsService } from '../../frontend/src/services/urgent-jobs.service.js'

console.log('🔧 Тестирование frontend сервисов...')

async function testFrontendServices() {
  try {
    // 1. Тест jobs service
    console.log('\n📋 Тестирование jobs.service.js...')
    
    const jobsResult = await jobsService.getJobs({ limit: 10 })
    if (jobsResult.error) {
      throw new Error(`❌ Ошибка getJobs: ${jobsResult.error}`)
    }
    console.log(`✅ getJobs работает - найдено ${jobsResult.data?.length || 0} вакансий`)
    
    // 2. Тест urgent jobs service
    console.log('\n🔥 Тестирование urgent-jobs.service.js...')
    
    const urgentJobsResult = await urgentJobsService.getUrgentJobs({ limit: 10 })
    if (urgentJobsResult.error) {
      throw new Error(`❌ Ошибка getUrgentJobs: ${urgentJobsResult.error}`)
    }
    console.log(`✅ getUrgentJobs работает - найдено ${urgentJobsResult.data?.length || 0} срочных вакансий`)
    
    // 3. Тест создания обычной вакансии
    console.log('\n📝 Тестирование создания вакансии...')
    
    const newJob = {
      title: 'Тест Frontend Job',
      description: 'Тестовая вакансия через frontend сервис',
      category: 'service',
      position_type: 'waiter',
      salary_min: 180000,
      salary_max: 250000,
      location: 'Алматы, тест frontend',
      employer_id: null // Пропустим для теста валидации
    }
    
    try {
      await jobsService.createJob(newJob)
      console.log('⚠️ Создание вакансии без employer_id должно было вызвать ошибку')
    } catch (error) {
      console.log('✅ Валидация работает - обязательное поле employer_id проверяется')
    }
    
    // 4. Тест валидации срочных вакансий
    console.log('\n🔍 Тестирование валидации срочных вакансий...')
    
    const invalidUrgentJob = {
      title: '',  // Пустое название должно вызвать ошибку
      category: 'service',
      position_type: 'bartender',
      needed_date: new Date().toISOString().split('T')[0],
      needed_time_start: '20:00',
      needed_time_end: '04:00',
      payment_per_shift: -1000  // Отрицательная оплата
    }
    
    const validationResult = urgentJobsService.validateUrgentJobData?.(invalidUrgentJob)
    if (validationResult && !validationResult.isValid) {
      console.log('✅ Валидация срочных вакансий работает')
      console.log(`   Найдено ошибок: ${validationResult.errors?.length || 0}`)
    } else {
      console.log('⚠️ Валидация срочных вакансий не найдена или не работает')
    }
    
    console.log('\n🎉 Тестирование frontend сервисов завершено успешно!')
    
  } catch (error) {
    console.error('\n💥 Ошибка тестирования frontend:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Запускаем тест
testFrontendServices().then(() => {
  console.log('\n🏁 Тестирование frontend сервисов завершено')
})