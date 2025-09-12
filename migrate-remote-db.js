#!/usr/bin/env node

// migrate-remote-db.js - Применение миграций к удаленной Supabase БД
// Использует Service Role Key для административных операций

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Настройки подключения к удаленной БД
const SUPABASE_URL = 'https://kuyudpxqlrinkcxvorom.supabase.co'
// Service Role Key нужно получить из Supabase Dashboard -> Settings -> API
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY не установлен')
  console.log('Получите Service Role Key из Supabase Dashboard -> Settings -> API')
  console.log('Затем запустите: SUPABASE_SERVICE_KEY=your_key node migrate-remote-db.js')
  process.exit(1)
}

// Создаем административного клиента
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkConnection() {
  console.log('🔄 Проверка подключения к БД...')
  
  try {
    // Проверяем подключение через простой запрос
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact', head: true })
    
    if (error && error.code !== 'PGRST116') { // 'PGRST116' - таблица не найдена (нормально)
      throw error
    }
    
    console.log('✅ Подключение к БД установлено')
    return true
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message)
    return false
  }
}

async function listExistingTables() {
  console.log('\n📋 Проверка существующих таблиц...')
  
  try {
    const { data, error } = await supabase.rpc('get_schema_tables')
    
    if (error) {
      // Если функции нет, попробуем прямой запрос
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
      
      if (tablesError) {
        console.log('⚠️  Не удалось получить список таблиц, но это нормально для новой БД')
        return []
      }
      
      return tables?.map(t => t.table_name) || []
    }
    
    return data || []
  } catch (error) {
    console.log('⚠️  Ошибка при получении таблиц:', error.message)
    return []
  }
}

async function executeMigration(migrationPath) {
  const migrationName = path.basename(migrationPath)
  console.log(`\n🔄 Применение миграции: ${migrationName}`)
  
  try {
    const sql = fs.readFileSync(migrationPath, 'utf8')
    
    // Разбиваем на отдельные команды (по точке с запятой в конце строки)
    const commands = sql.split(';').filter(cmd => cmd.trim().length > 0)
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim() + ';'
      
      if (command === ';') continue
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_command: command })
        
        if (error) {
          // Попробуем прямое выполнение
          const { error: directError } = await supabase.from('_').select().limit(0)
          // Этот трюк не сработает, но покажет ошибку соединения
          
          console.error(`❌ Ошибка в команде ${i + 1}:`, error.message)
          console.log('Команда:', command.substring(0, 100) + '...')
          
          // Для некоторых ошибок продолжаем (например, "уже существует")
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist')) {
            console.log('⚠️  Пропускаем (объект уже существует или не найден)')
            continue
          }
          
          throw error
        }
      } catch (cmdError) {
        console.error(`❌ Ошибка выполнения команды ${i + 1}:`, cmdError.message)
        throw cmdError
      }
    }
    
    console.log(`✅ Миграция ${migrationName} применена успешно`)
    return true
  } catch (error) {
    console.error(`❌ Ошибка применения миграции ${migrationName}:`, error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Запуск применения миграций к удаленной Supabase БД\n')
  
  // Проверяем подключение
  const connected = await checkConnection()
  if (!connected) {
    process.exit(1)
  }
  
  // Показываем существующие таблицы
  const existingTables = await listExistingTables()
  if (existingTables.length > 0) {
    console.log('📋 Существующие таблицы:', existingTables.join(', '))
  } else {
    console.log('📋 Таблиц пока нет (новая БД)')
  }
  
  // Список миграций для применения
  const migrationsDir = path.join(__dirname, 'backend/supabase/migrations')
  const migrationFiles = [
    '20250913120000_create_job_postings_table.sql',
    '20250913121000_create_urgent_jobs_table.sql'
  ]
  
  let successCount = 0
  let totalCount = migrationFiles.length
  
  for (const migrationFile of migrationFiles) {
    const migrationPath = path.join(migrationsDir, migrationFile)
    
    if (!fs.existsSync(migrationPath)) {
      console.log(`⚠️  Миграция ${migrationFile} не найдена, пропускаем`)
      continue
    }
    
    const success = await executeMigration(migrationPath)
    if (success) {
      successCount++
    }
  }
  
  console.log(`\n🎉 Применение миграций завершено: ${successCount}/${totalCount} успешно`)
  
  // Показываем обновленный список таблиц
  const newTables = await listExistingTables()
  if (newTables.length > existingTables.length) {
    console.log('📋 Новые таблицы:', newTables.filter(t => !existingTables.includes(t)).join(', '))
  }
}

// Запускаем
main().catch(error => {
  console.error('💥 Критическая ошибка:', error)
  process.exit(1)
})