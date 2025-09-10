import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'

// Загружаем переменные окружения
config({ path: path.join(process.cwd(), '../supabase/.env') })

function createTestSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Отсутствуют переменные окружения SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

async function checkDatabase() {
  const supabase = createTestSupabaseClient()
  
  console.log('🔍 Проверка доступных таблиц...')
  
  const tableNames = ['profiles', 'user_profiles', 'jobs', 'companies']
  
  for (const tableName of tableNames) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`)
      } else {
        console.log(`✅ ${tableName}: найдена (${data?.length || 0} записей)`)
        if (data && data.length > 0) {
          console.log(`   Поля: ${Object.keys(data[0]).join(', ')}`)
        }
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ошибка подключения`)
    }
  }
}

checkDatabase().catch(console.error)
