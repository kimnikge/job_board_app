/**
 * Создание тестовых данных через Supabase API
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kuyudpxqlrinkcxvorom.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eXVkcHhxbHJpbmtjeHZvcm9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk2ODE5OSwiZXhwIjoyMDY0NTQ0MTk5fQ.yJIhTRV-TqzFDy0sQTgcfCa7Xw7b8IHZMO2-s3OtS3g'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkExistingTables() {
  console.log('🔍 Проверяем существующие таблицы...')
  
  // Проверяем какие таблицы уже есть
  const tables = [
    'city_districts',
    'specializations', 
    'venue_types',
    'user_profiles',
    'companies',
    'urgent_jobs'
  ]
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1)
      
      if (error) {
        console.log(`❌ Таблица ${table}: НЕ СУЩЕСТВУЕТ`)
        console.log(`   Ошибка: ${error.message}`)
      } else {
        console.log(`✅ Таблица ${table}: СУЩЕСТВУЕТ (записей: ${data?.length || 0})`)
      }
    } catch (e) {
      console.log(`❌ Таблица ${table}: ОШИБКА - ${e.message}`)
    }
  }
}

async function createTestData() {
  console.log('📝 Создаем тестовые данные...')
  
  try {
    // Создаем районы
    const districtsData = [
      { name: 'Есильский район', description: 'Центральный район' },
      { name: 'Алматинский район', description: 'Южный район' },
      { name: 'Сарыаркинский район', description: 'Северный район' }
    ]
    
    const { data: districts, error: districtsError } = await supabase
      .from('city_districts')
      .upsert(districtsData)
      .select()
    
    if (districtsError) {
      console.log('❌ Ошибка создания районов:', districtsError.message)
    } else {
      console.log('✅ Районы созданы:', districts?.length || 0)
    }
    
    // Создаем специализации
    const specializationsData = [
      { name: 'Повар', category: 'kitchen' },
      { name: 'Официант', category: 'service' },
      { name: 'Бармен', category: 'service' },
      { name: 'Кухонный работник', category: 'kitchen' }
    ]
    
    const { data: specializations, error: specializationsError } = await supabase
      .from('specializations')
      .upsert(specializationsData)
      .select()
    
    if (specializationsError) {
      console.log('❌ Ошибка создания специализаций:', specializationsError.message)
    } else {
      console.log('✅ Специализации созданы:', specializations?.length || 0)
    }
    
    // Создаем компании
    const companiesData = [
      {
        name: 'Ресторан "Астана"',
        industry: 'Ресторан',
        description: 'Премиальный ресторан в центре города',
        verified: true,
        employees_count: '50-100'
      },
      {
        name: 'Кафе "Достык"',
        industry: 'Кафе',
        description: 'Уютное семейное кафе',
        verified: true,
        employees_count: '10-50'
      }
    ]
    
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .upsert(companiesData)
      .select()
    
    if (companiesError) {
      console.log('❌ Ошибка создания компаний:', companiesError.message)
    } else {
      console.log('✅ Компании созданы:', companies?.length || 0)
    }
    
    console.log('🎉 Тестовые данные созданы!')
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error)
  }
}

// Запускаем проверку и создание данных
async function main() {
  await checkExistingTables()
  console.log('\n' + '='.repeat(50) + '\n')
  await createTestData()
}

main()
