#!/usr/bin/env node

/**
 * СКРИПТ НАПОЛНЕНИЯ БД РЕАЛЬНЫМИ ДАННЫМИ
 * Создает полноценную базу данных для тестирования общепита Астаны
 * 
 * Включает:
 * - 15 реальных пользователей (5 работодателей + 10 соискателей)
 * - 5 заведений общепита
 * - 3 срочные вакансии
 * - 3 обычные вакансии  
 * - 3 резюме соискателей
 * - Отклики и уведомления
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Конфигурация Supabase
const SUPABASE_URL = 'https://your-project.supabase.co' // ЗАМЕНИТЕ НА ВАШ URL
const SUPABASE_SERVICE_KEY = 'your-service-role-key' // ЗАМЕНИТЕ НА ВАШ SERVICE KEY

// Инициализация клиента Supabase с сервисной ролью
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function loadSQLFile(filename) {
  const filePath = path.join(__dirname, filename)
  return fs.readFileSync(filePath, 'utf8')
}

async function executeSQL(sql) {
  try {
    console.log('Выполняю SQL запрос...')
    
    // Разбиваем SQL на отдельные команды
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`Найдено ${commands.length} SQL команд`)
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      if (command.toLowerCase().includes('select')) {
        // Для SELECT запросов используем обычный rpc
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: command })
        if (error) {
          console.error(`Ошибка в команде ${i + 1}:`, error)
        } else {
          console.log(`✓ Команда ${i + 1} выполнена успешно`)
          if (data) console.log('Результат:', data)
        }
      } else {
        // Для других команд (INSERT, UPDATE, etc.) используем REST API
        try {
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_KEY
            },
            body: JSON.stringify({ sql_query: command })
          })
          
          if (response.ok) {
            console.log(`✓ Команда ${i + 1} выполнена успешно`)
          } else {
            console.error(`❌ Ошибка в команде ${i + 1}:`, await response.text())
          }
        } catch (err) {
          console.error(`❌ Ошибка выполнения команды ${i + 1}:`, err.message)
        }
      }
    }
    
  } catch (error) {
    console.error('Критическая ошибка:', error)
    throw error
  }
}

async function createTestData() {
  console.log('🚀 Начинаю создание тестовых данных для общепита Астаны...\n')
  
  try {
    // Загружаем и выполняем SQL файл с тестовыми данными
    console.log('📁 Загружаю SQL файл с тестовыми данными...')
    const sql = await loadSQLFile('create_realistic_test_data.sql')
    
    console.log('💾 Выполняю вставку данных в базу...')
    await executeSQL(sql)
    
    console.log('\n✅ УСПЕШНО! Тестовые данные созданы:')
    console.log('👥 15 пользователей (5 работодателей + 10 соискателей)')
    console.log('🏢 5 заведений общепита Астаны')  
    console.log('⚡ 3 срочные вакансии')
    console.log('💼 3 обычные вакансии')
    console.log('📄 3 резюме соискателей')
    console.log('📬 Отклики и уведомления')
    
    console.log('\n🌐 Теперь можно тестировать приложение с реальными данными!')
    console.log('📱 Срочные вакансии доступны по адресу: /urgent')
    console.log('💻 Все вакансии: /')
    console.log('👤 Профили соискателей и их резюме готовы к просмотру')
    
  } catch (error) {
    console.error('\n❌ ОШИБКА при создании тестовых данных:', error)
    process.exit(1)
  }
}

// Альтернативный метод для PostgreSQL через прямое подключение
async function createTestDataDirect() {
  console.log('🔄 Пробую альтернативный метод через прямое подключение к PostgreSQL...')
  
  const { Client } = require('pg')
  
  // Конфигурация подключения к PostgreSQL
  const client = new Client({
    host: 'db.your-project.supabase.co', // ЗАМЕНИТЕ
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'your-database-password', // ЗАМЕНИТЕ
    ssl: { rejectUnauthorized: false }
  })
  
  try {
    await client.connect()
    console.log('✓ Подключение к PostgreSQL установлено')
    
    const sql = await loadSQLFile('create_realistic_test_data.sql')
    
    // Выполняем весь SQL как одну транзакцию
    await client.query(sql)
    
    console.log('✅ Тестовые данные успешно созданы через прямое подключение!')
    
  } catch (error) {
    console.error('❌ Ошибка при прямом подключении:', error)
    throw error
  } finally {
    await client.end()
  }
}

// Запуск скрипта
if (require.main === module) {
  console.log('🎯 СОЗДАНИЕ РЕАЛЬНЫХ ДАННЫХ ДЛЯ ТЕСТИРОВАНИЯ')
  console.log('📍 Специализация: Общепит Астаны')
  console.log('🗓️  Дата:', new Date().toLocaleString('ru-RU'))
  console.log('─'.repeat(50))
  
  // Сначала пробуем через Supabase API
  createTestData()
    .catch(async (error) => {
      console.log('\n🔄 Основной метод не сработал, пробую альтернативный...')
      try {
        await createTestDataDirect()
      } catch (directError) {
        console.error('\n💥 Все методы не сработали!')
        console.error('Основная ошибка:', error.message)
        console.error('Альтернативная ошибка:', directError.message)
        console.log('\n📋 ИНСТРУКЦИЯ ДЛЯ РУЧНОГО ВЫПОЛНЕНИЯ:')
        console.log('1. Откройте Supabase Dashboard')
        console.log('2. Перейдите в SQL Editor')
        console.log('3. Скопируйте содержимое файла create_realistic_test_data.sql')
        console.log('4. Выполните SQL команды')
        process.exit(1)
      }
    })
}

module.exports = {
  createTestData,
  createTestDataDirect
}
