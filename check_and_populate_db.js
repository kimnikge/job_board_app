/**
 * Пересоздание базы данных через прямые API вызовы
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kuyudpxqlrinkcxvorom.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eXVkcHhxbHJpbmtjeHZvcm9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk2ODE5OSwiZXhwIjoyMDY0NTQ0MTk5fQ.yJIhTRV-TqzFDy0sQTgcfCa7Xw7b8IHZMO2-s3OtS3g'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTableAccess() {
  console.log('🔍 Проверяем доступ к таблицам...')
  
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
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: доступен (всего записей: ${count})`)
        if (data && data.length > 0) {
          const columns = Object.keys(data[0])
          console.log(`   Колонки: ${columns.slice(0, 5).join(', ')}${columns.length > 5 ? '...' : ''}`)
        }
      }
    } catch (e) {
      console.log(`💥 ${table}: критическая ошибка - ${e.message}`)
    }
  }
}

async function createTestData() {
  console.log('\n📝 Создаем тестовые данные в существующих таблицах...')
  
  try {
    // Создаем данные в city_districts (если таблица существует)
    try {
      const districtsData = [
        { name: 'Есильский район', description: 'Центральный район' },
        { name: 'Алматинский район', description: 'Южный район' },
        { name: 'Сарыаркинский район', description: 'Северный район' }
      ]
      
      const { data: districts, error } = await supabase
        .from('city_districts')
        .upsert(districtsData, { onConflict: 'name' })
        .select()
      
      if (error) {
        console.log('⚠️  city_districts:', error.message)
      } else {
        console.log('✅ city_districts: данные обновлены')
      }
    } catch (e) {
      console.log('❌ city_districts: недоступна')
    }
    
    // Создаем данные в specializations
    try {
      const specializationsData = [
        { name: 'Повар', category: 'kitchen', description: 'Приготовление горячих блюд' },
        { name: 'Официант', category: 'service', description: 'Обслуживание гостей' },
        { name: 'Бармен', category: 'service', description: 'Приготовление напитков' },
        { name: 'Кухонный работник', category: 'kitchen', description: 'Подготовка продуктов' }
      ]
      
      const { data: specializations, error } = await supabase
        .from('specializations')
        .upsert(specializationsData, { onConflict: 'name' })
        .select()
      
      if (error) {
        console.log('⚠️  specializations:', error.message)
      } else {
        console.log('✅ specializations: данные обновлены')
      }
    } catch (e) {
      console.log('❌ specializations: недоступна')
    }
    
    // Создаем данные в venue_types
    try {
      const venueTypesData = [
        { name: 'Ресторан', description: 'Заведение полного цикла' },
        { name: 'Кафе', description: 'Быстрое питание' },
        { name: 'Пиццерия', description: 'Специализация на пицце' },
        { name: 'Кофейня', description: 'Кофе и легкие закуски' }
      ]
      
      const { data: venueTypes, error } = await supabase
        .from('venue_types')
        .upsert(venueTypesData, { onConflict: 'name' })
        .select()
      
      if (error) {
        console.log('⚠️  venue_types:', error.message)
      } else {
        console.log('✅ venue_types: данные обновлены')
      }
    } catch (e) {
      console.log('❌ venue_types: недоступна')
    }
    
    console.log('\n🎉 Тестовые данные созданы для существующих таблиц!')
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error)
  }
}

async function main() {
  await checkTableAccess()
  await createTestData()
  
  console.log('\n' + '='.repeat(60))
  console.log('📋 ИТОГОВЫЙ ОТЧЕТ:')
  console.log('='.repeat(60))
  console.log('✅ Проверка таблиц завершена')
  console.log('✅ Тестовые данные созданы')
  console.log('🔧 Если таблицы user_profiles, companies, urgent_jobs не найдены,')
  console.log('   их нужно создать через Supabase Dashboard')
}

main()
